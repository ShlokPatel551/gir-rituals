import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'gir-rituals-jwt-secret';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const u = db.prepare('SELECT * FROM users WHERE email=? AND is_admin=1').get(email?.toLowerCase());
  if (!u || !bcrypt.compareSync(password, u.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: u.id, email: u.email, name: `${u.first_name} ${u.last_name}`, isAdmin: true }, SECRET, { expiresIn: '1d' });
  res.json({ token, name: `${u.first_name} ${u.last_name}` });
});

router.get('/dashboard', requireAdmin, (req, res) => {
  res.json({
    totalCustomers:      db.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin=0").get().c,
    activeSubscriptions: db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status='active'").get().c,
    totalRevenue:        db.prepare("SELECT COALESCE(SUM(amount),0) as r FROM bills WHERE status='paid'").get().r,
    pendingBills:        db.prepare("SELECT COUNT(*) as c FROM bills WHERE status='unpaid'").get().c,
    totalOrders:         db.prepare("SELECT COUNT(*) as c FROM orders").get().c,
  });
});

router.get('/customers', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT id,client_id,first_name,last_name,email,phone,wallet_balance,created_at FROM users WHERE is_admin=0').all();
  res.json(rows.map(c => ({
    id: c.id,
    clientId: c.client_id,
    firstName: c.first_name,
    lastName: c.last_name,
    email: c.email,
    phone: c.phone || '',
    walletBalance: c.wallet_balance,
    createdAt: c.created_at,
    status: 'active',
  })));
});

router.get('/customers/:id', requireAdmin, (req, res) => {
  const c = db.prepare('SELECT * FROM users WHERE client_id=? AND is_admin=0').get(req.params.id)
         || db.prepare('SELECT * FROM users WHERE id=? AND is_admin=0').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: c.id,
    clientId: c.client_id,
    firstName: c.first_name,
    lastName: c.last_name,
    email: c.email,
    phone: c.phone || '',
    walletBalance: c.wallet_balance,
    createdAt: c.created_at,
    status: 'active',
    subscriptions: db.prepare('SELECT * FROM subscriptions WHERE user_id=?').all(c.id),
    bills:         db.prepare('SELECT * FROM bills WHERE user_id=?').all(c.id),
    orders:        db.prepare('SELECT * FROM orders WHERE user_id=?').all(c.id),
  });
});

router.get('/orders', requireAdmin, (req, res) => {
  const rows = db.prepare(
    'SELECT o.*,u.email,u.first_name,u.last_name FROM orders o JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC'
  ).all();
  res.json(rows);
});

router.get('/otp-logs', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM otps ORDER BY created_at DESC LIMIT 100').all();
  res.json(rows);
});

export default router;
