import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createPublicKey } from 'crypto';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'gir-rituals-jwt-secret';

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function buildUserPayload(user, addresses = []) {
  const billing  = addresses.find(a => a.type === 'billing')  || {};
  const delivery = addresses.find(a => a.type === 'delivery') || {};
  return {
    id: user.id,
    clientId: user.client_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone || '',
    walletBalance: user.wallet_balance,
    isAdmin: !!user.is_admin,
    billingAddress:  { street: billing.street  || '', city: billing.city  || '', state: billing.state  || '', pinCode: billing.pin_code  || '' },
    deliveryAddress: { street: delivery.street || '', city: delivery.city || '', state: delivery.state || '', pinCode: delivery.pin_code || '' },
  };
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Incorrect email or password' });

  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(user.id);
  const payload = buildUserPayload(user, addresses);
  res.json({ token: makeToken(payload), user: payload });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { firstName, lastName, email, phone, password, billingAddress, deliveryAddress } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered' });

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const clientId = 'GR' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const hash = bcrypt.hashSync(password, 10);

  const { lastInsertRowid: uid } = db.prepare(
    'INSERT INTO users (client_id,first_name,last_name,email,phone,password_hash) VALUES (?,?,?,?,?,?)'
  ).run(clientId, firstName, lastName, email.toLowerCase().trim(), phone || '', hash);

  const ia = db.prepare('INSERT INTO addresses (user_id,type,street,city,state,pin_code) VALUES (?,?,?,?,?,?)');
  if (billingAddress)  ia.run(uid, 'billing',  billingAddress.street,  billingAddress.city,  billingAddress.state,  billingAddress.pinCode);
  if (deliveryAddress) ia.run(uid, 'delivery', deliveryAddress.street, deliveryAddress.city, deliveryAddress.state, deliveryAddress.pinCode);

  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(uid);
  const payload = buildUserPayload(newUser, addresses);
  res.status(201).json({ token: makeToken(payload), user: payload });
});

// POST /api/auth/otp/send
router.post('/otp/send', (req, res) => {
  const { identifier } = req.body;
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  db.prepare('DELETE FROM otps WHERE identifier = ?').run(identifier);
  db.prepare('INSERT INTO otps (identifier,code,expires_at) VALUES (?,?,?)').run(identifier, code, expiresAt);
  // In production replace with real SMS. For demo, return code in response.
  res.json({ success: true, code });
});

// POST /api/auth/otp/verify
router.post('/otp/verify', (req, res) => {
  const { identifier, code } = req.body;
  const otp = db.prepare('SELECT * FROM otps WHERE identifier=? AND used=0 ORDER BY created_at DESC LIMIT 1').get(identifier);
  if (!otp)                              return res.status(400).json({ error: 'No OTP found' });
  if (new Date(otp.expires_at) < new Date()) return res.status(400).json({ error: 'OTP expired' });
  if (otp.code !== String(code)) {
    db.prepare('UPDATE otps SET attempts=attempts+1 WHERE id=?').run(otp.id);
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  db.prepare('UPDATE otps SET used=1 WHERE id=?').run(otp.id);
  res.json({ success: true });
});

// POST /api/auth/google
router.post('/google', (req, res) => {
  const { email, firstName, lastName } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const clientId = 'GR' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const { lastInsertRowid: uid } = db.prepare(
      'INSERT INTO users (client_id,first_name,last_name,email,phone,password_hash) VALUES (?,?,?,?,?,?)'
    ).run(clientId, firstName || 'User', lastName || '', email.toLowerCase().trim(), '', '');
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  }
  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(user.id);
  const payload = buildUserPayload(user, addresses);
  res.json({ token: makeToken(payload), user: payload });
});

// POST /api/auth/apple
router.post('/apple', async (req, res) => {
  const { identityToken, firstName, lastName, email: appleEmail } = req.body;
  if (!identityToken) return res.status(400).json({ error: 'Identity token required' });

  try {
    // Fetch Apple's public JWKS
    const keysRes = await fetch('https://appleid.apple.com/auth/keys');
    const { keys } = await keysRes.json();

    // Match by kid in token header
    const headerB64 = identityToken.split('.')[0];
    const header = JSON.parse(Buffer.from(headerB64, 'base64').toString('utf8'));
    const jwk = keys.find(k => k.kid === header.kid);
    if (!jwk) return res.status(400).json({ error: 'No matching Apple public key' });

    // Convert JWK → PEM and verify
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const pem = publicKey.export({ type: 'spki', format: 'pem' });
    const decoded = jwt.verify(identityToken, pem, { algorithms: ['RS256'] });

    const email = decoded.email || appleEmail;
    if (!email) return res.status(400).json({ error: 'Email not provided by Apple' });

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const clientId = 'GR' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const { lastInsertRowid: uid } = db.prepare(
        'INSERT INTO users (client_id,first_name,last_name,email,phone,password_hash) VALUES (?,?,?,?,?,?)'
      ).run(clientId, firstName || 'User', lastName || '', email.toLowerCase().trim(), '', '');
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
    }

    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ?').all(user.id);
    const payload = buildUserPayload(user, addresses);
    res.json({ token: makeToken(payload), user: payload });
  } catch (err) {
    console.error('Apple auth error:', err.message);
    res.status(401).json({ error: 'Apple authentication failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) return res.status(404).json({ error: 'No account found with this email' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const key = email.toLowerCase().trim();
  db.prepare('DELETE FROM otps WHERE identifier = ?').run(key);
  db.prepare('INSERT INTO otps (identifier,code,expires_at) VALUES (?,?,?)').run(key, code, expiresAt);
  res.json({ success: true, phone: user.phone || '', code });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, code, and new password required' });

  const key = email.toLowerCase().trim();
  const otp = db.prepare('SELECT * FROM otps WHERE identifier=? AND used=0 ORDER BY created_at DESC LIMIT 1').get(key);
  if (!otp) return res.status(400).json({ error: 'No OTP found. Request a new one.' });
  if (new Date(otp.expires_at) < new Date()) return res.status(400).json({ error: 'OTP expired' });
  if (otp.code !== String(code)) {
    db.prepare('UPDATE otps SET attempts=attempts+1 WHERE id=?').run(otp.id);
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  db.prepare('UPDATE otps SET used=1 WHERE id=?').run(otp.id);
  db.prepare('UPDATE users SET password_hash=? WHERE email=?').run(bcrypt.hashSync(newPassword, 10), key);
  res.json({ success: true });
});

// POST /api/auth/change-password (requires auth token)
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.password_hash || !bcrypt.compareSync(currentPassword, user.password_hash))
    return res.status(401).json({ error: 'Current password is incorrect' });

  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(newPassword, 10), user.id);
  res.json({ success: true });
});

export default router;
