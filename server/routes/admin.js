import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import db from '../db.js';
import { requireAdmin, requireAdminRole } from '../middleware/auth.js';
import { JWT_SECRET as SECRET } from '../lib/secret.js';

const router = Router();

const REFRESH_COOKIE = 'gir_refresh_token';
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function paginate(req) {
  const limit  = Math.min(parseInt(req.query.limit)  || 50, 100);
  const page   = Math.max(parseInt(req.query.page)   || 1,  1);
  const offset = (page - 1) * limit;
  return { limit, offset, page };
}

// ── Auth ──────────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const u = db.prepare('SELECT * FROM users WHERE email=? AND is_admin=1').get(email?.toLowerCase());
  if (!u || !bcrypt.compareSync(password, u.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });

  const adminRole = u.admin_role || 'owner';
  const token = jwt.sign({ id: u.id, email: u.email, name: `${u.first_name} ${u.last_name}`, isAdmin: true, role: 'admin', adminRole }, SECRET, { expiresIn: '15m' });

  const raw  = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(raw).digest('hex');
  const exp  = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, is_admin, expires_at) VALUES (?,?,1,?)').run(u.id, hash, exp);

  res.cookie(REFRESH_COOKIE, raw, REFRESH_COOKIE_OPTS);
  res.json({ token, name: `${u.first_name} ${u.last_name}`, adminRole });
});

// ── Dashboard ─────────────────────────────────────────────────────
router.get('/dashboard', requireAdmin, (req, res) => {
  res.json({
    totalCustomers:      db.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin=0").get().c,
    activeSubscriptions: db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status='active'").get().c,
    totalRevenue:        db.prepare("SELECT COALESCE(SUM(amount),0) as r FROM bills WHERE status='paid'").get().r,
    pendingBills:        db.prepare("SELECT COUNT(*) as c FROM bills WHERE status='unpaid'").get().c,
    totalOrders:         db.prepare("SELECT COUNT(*) as c FROM orders").get().c,
  });
});

// ── Customers ─────────────────────────────────────────────────────
router.get('/customers', requireAdmin, (req, res) => {
  const { limit, offset } = paginate(req);
  const rows  = db.prepare(`
    SELECT u.id, u.client_id, u.first_name, u.last_name, u.email, u.phone,
           u.wallet_balance, u.created_at,
           a.city, a.state,
           CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS has_subscription
    FROM users u
    LEFT JOIN addresses a ON a.user_id = u.id AND a.type = 'delivery'
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE u.is_admin = 0
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total    = db.prepare('SELECT COUNT(*) as c FROM users WHERE is_admin=0').get().c;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  res.json({
    rows: rows.map(c => ({
      id: c.id, clientId: c.client_id, firstName: c.first_name, lastName: c.last_name,
      email: c.email, phone: c.phone || '', walletBalance: c.wallet_balance,
      createdAt: c.created_at,
      city:  c.city  || '',
      state: c.state || '',
      hasSubscription: !!c.has_subscription,
      status: c.created_at >= thirtyDaysAgo ? 'new' : 'active',
    })),
    total,
  });
});

router.get('/customers/:id', requireAdmin, (req, res) => {
  const c = db.prepare('SELECT * FROM users WHERE client_id=? AND is_admin=0').get(req.params.id)
         || db.prepare('SELECT * FROM users WHERE id=? AND is_admin=0').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });

  const addr     = db.prepare('SELECT * FROM addresses WHERE user_id=?').all(c.id);
  const delivery = addr.find(a => a.type === 'delivery') || {};
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

  const subscriptions = db.prepare(`
    SELECT s.*, p.name as product_name, p.price as product_price, p.unit as product_unit
    FROM subscriptions s
    LEFT JOIN products p ON p.id = s.product_id
    WHERE s.user_id = ?
    ORDER BY s.start_date DESC
  `).all(c.id);

  const deliveries = db.prepare(`
    SELECT d.*, p.name as product_name, p.price as product_price, p.unit as product_unit
    FROM deliveries d
    JOIN subscriptions s ON s.id = d.subscription_id
    LEFT JOIN products p ON p.id = s.product_id
    WHERE s.user_id = ?
    ORDER BY d.date DESC
    LIMIT 60
  `).all(c.id);

  const statement = db.prepare(
    'SELECT * FROM statement_entries WHERE user_id=? ORDER BY date DESC LIMIT 50'
  ).all(c.id);

  res.json({
    id: c.id, clientId: c.client_id, firstName: c.first_name, lastName: c.last_name,
    email: c.email, phone: c.phone || '', walletBalance: c.wallet_balance,
    createdAt: c.created_at,
    street:  delivery.street   || '',
    city:    delivery.city     || '',
    state:   delivery.state    || '',
    pinCode: delivery.pin_code || '',
    status: c.created_at >= thirtyDaysAgo ? 'new' : 'active',
    subscriptions,
    bills:    db.prepare('SELECT * FROM bills  WHERE user_id=? ORDER BY due_date DESC').all(c.id),
    orders:   db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(c.id),
    deliveries,
    statement,
  });
});

// ── Orders ────────────────────────────────────────────────────────
router.get('/orders', requireAdmin, (req, res) => {
  const { limit, offset } = paginate(req);
  const rows  = db.prepare(
    'SELECT o.*,u.email,u.first_name,u.last_name FROM orders o JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  res.json({ rows, total });
});

// ── Billing ───────────────────────────────────────────────────────
router.get('/billing', requireAdmin, (req, res) => {
  const { limit, offset } = paginate(req);
  const rows  = db.prepare(
    'SELECT b.*,u.first_name,u.last_name,u.email,u.client_id FROM bills b JOIN users u ON b.user_id=u.id ORDER BY b.due_date DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);
  const total   = db.prepare('SELECT COUNT(*) as c FROM bills').get().c;
  const unpaid  = db.prepare("SELECT COUNT(*) as c FROM bills WHERE status='unpaid'").get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(amount),0) as r FROM bills WHERE status='paid'").get().r;
  res.json({ rows, total, unpaid, revenue });
});

// ── Finance ───────────────────────────────────────────────────────
router.get('/finance', requireAdmin, (req, res) => {
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount),0) as r FROM bills WHERE status='paid'").get().r;
  const monthRevenue = db.prepare(
    "SELECT COALESCE(SUM(amount),0) as r FROM bills WHERE status='paid' AND strftime('%Y-%m',paid_date)=strftime('%Y-%m','now')"
  ).get().r;
  const pendingRevenue = db.prepare("SELECT COALESCE(SUM(amount),0) as r FROM bills WHERE status='unpaid'").get().r;
  const recentTransactions = db.prepare(
    "SELECT b.*,u.first_name,u.last_name,u.client_id FROM bills b JOIN users u ON b.user_id=u.id WHERE b.status='paid' ORDER BY b.paid_date DESC LIMIT 10"
  ).all();
  res.json({ totalRevenue, monthRevenue, pendingRevenue, recentTransactions });
});

// ── Analytics ─────────────────────────────────────────────────────
router.get('/analytics', requireAdmin, (req, res) => {
  const newThisMonth = db.prepare(
    "SELECT COUNT(*) as c FROM users WHERE is_admin=0 AND strftime('%Y-%m',created_at)=strftime('%Y-%m','now')"
  ).get().c;
  const totalCustomers    = db.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin=0").get().c;
  const activeSubscriptions = db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status='active'").get().c;
  const totalOrders       = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const totalRevenue      = db.prepare("SELECT COALESCE(SUM(amount),0) as r FROM bills WHERE status='paid'").get().r;
  const topProducts       = db.prepare(
    "SELECT product_name, COUNT(*) as count FROM orders GROUP BY product_name ORDER BY count DESC LIMIT 5"
  ).all();
  res.json({ newThisMonth, totalCustomers, activeSubscriptions, totalOrders, totalRevenue, topProducts });
});

// ── Refunds ───────────────────────────────────────────────────────
router.get('/refunds', requireAdmin, (req, res) => {
  const { limit, offset } = paginate(req);
  const rows  = db.prepare(
    "SELECT o.*,u.first_name,u.last_name,u.email,u.client_id FROM orders o JOIN users u ON o.user_id=u.id WHERE o.status='cancelled' ORDER BY o.created_at DESC LIMIT ? OFFSET ?"
  ).all(limit, offset);
  const total = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='cancelled'").get().c;
  res.json({ rows, total });
});

// ── OTP logs (internal debug) ─────────────────────────────────────
router.get('/otp-logs', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM otps ORDER BY created_at DESC LIMIT 100').all();
  res.json(rows);
});

// ── Team management (owner only) ─────────────────────────────────

const VALID_ROLES = ['owner', 'manager', 'accountant'];

// GET /api/admin/team — list all admin users
router.get('/team', requireAdmin, requireAdminRole('owner'), (req, res) => {
  const rows = db.prepare(`
    SELECT id, client_id, first_name, last_name, email, phone, admin_role, created_at
    FROM users WHERE is_admin = 1 ORDER BY created_at ASC
  `).all();
  res.json(rows.map(u => ({
    id:         u.id,
    clientId:   u.client_id,
    firstName:  u.first_name,
    lastName:   u.last_name,
    email:      u.email,
    phone:      u.phone || '',
    adminRole:  u.admin_role || 'owner',
    createdAt:  u.created_at,
  })));
});

// POST /api/admin/team — create a new admin user
router.post('/team', requireAdmin, requireAdminRole('owner'), (req, res) => {
  const { firstName, lastName, email, password, adminRole = 'manager' } = req.body;
  if (!firstName || !email || !password) return res.status(400).json({ error: 'firstName, email, and password are required' });
  if (!VALID_ROLES.includes(adminRole)) return res.status(400).json({ error: 'Invalid role' });

  const pwErr = password.length < 8 ? 'Password must be at least 8 characters' : null;
  if (pwErr) return res.status(400).json({ error: pwErr });

  if (db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered' });

  const chars    = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const clientId = 'GR' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const hash     = bcrypt.hashSync(password, 10);

  const { lastInsertRowid: uid } = db.prepare(
    'INSERT INTO users (client_id,first_name,last_name,email,phone,password_hash,is_admin,role,admin_role) VALUES (?,?,?,?,?,?,1,?,?)'
  ).run(clientId, firstName, lastName || '', email.toLowerCase().trim(), '', hash, 'admin', adminRole);

  const u = db.prepare('SELECT * FROM users WHERE id=?').get(uid);
  res.status(201).json({
    id: u.id, clientId: u.client_id, firstName: u.first_name, lastName: u.last_name,
    email: u.email, adminRole: u.admin_role, createdAt: u.created_at,
  });
});

// PATCH /api/admin/team/:id/role — update a team member's role
router.patch('/team/:id/role', requireAdmin, requireAdminRole('owner'), (req, res) => {
  const { adminRole } = req.body;
  if (!VALID_ROLES.includes(adminRole)) return res.status(400).json({ error: 'Invalid role' });

  const target = db.prepare('SELECT * FROM users WHERE id=? AND is_admin=1').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admin user not found' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot change your own role' });

  db.prepare('UPDATE users SET admin_role=? WHERE id=?').run(adminRole, target.id);
  res.json({ success: true, adminRole });
});

// DELETE /api/admin/team/:id — revoke admin access
router.delete('/team/:id', requireAdmin, requireAdminRole('owner'), (req, res) => {
  const target = db.prepare('SELECT * FROM users WHERE id=? AND is_admin=1').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Admin user not found' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });

  db.prepare('UPDATE users SET is_admin=0, role=?, admin_role=NULL WHERE id=?').run('customer', target.id);
  res.json({ success: true });
});

// ── Deliveries ────────────────────────────────────────────────────
router.get('/deliveries', requireAdmin, (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  // All active/paused subscriptions with customer + product + address
  const subs = db.prepare(`
    SELECT
      s.id       AS sub_id,
      s.quantity,
      s.status   AS sub_status,
      p.name     AS product_name,
      p.price,
      p.unit,
      u.client_id,
      u.first_name,
      u.last_name,
      u.phone,
      a.street,
      a.city,
      a.pin_code
    FROM subscriptions s
    JOIN users u    ON u.id  = s.user_id     AND u.is_admin = 0
    JOIN products p ON p.id  = s.product_id
    LEFT JOIN addresses a ON a.user_id = u.id AND a.type = 'delivery'
    WHERE s.status IN ('active', 'paused')
    ORDER BY u.client_id, s.id
  `).all();

  // Existing delivery records for this date, keyed by subscription_id
  const existing = db.prepare('SELECT * FROM deliveries WHERE date = ?').all(date);
  const deliveryMap = {};
  for (const d of existing) deliveryMap[d.subscription_id] = d;

  // Group by customer
  const customerMap = {};
  for (const s of subs) {
    if (!customerMap[s.client_id]) {
      customerMap[s.client_id] = {
        clientId:    s.client_id,
        displayName: `${s.first_name} ${s.last_name}`,
        phone:       s.phone || '',
        address:     [s.street, s.city, s.pin_code].filter(Boolean).join(', '),
        items:       [],
      };
    }

    const d        = deliveryMap[s.sub_id];
    const isPaused = s.sub_status === 'paused';
    const status   = (d?.status || (isPaused ? 'paused' : 'pending')).toLowerCase();
    const qty      = d?.quantity ?? s.quantity;

    customerMap[s.client_id].items.push({
      deliveryId:     d?.id ?? null,
      subscriptionId: s.sub_id,
      orderId:        d ? `DEL-${d.id}` : `SUB-${s.sub_id}`,
      product:        s.product_name,
      qty:            `${qty} ${s.unit}`,
      type:           'subscription',
      amount:         Math.round(s.price * qty),
      amountStatus:   isPaused ? 'not_charged' : 'monthly_bill',
      paymentMethod:  isPaused ? '—' : 'Monthly',
      status,
    });
  }

  const groups   = Object.values(customerMap);
  const allItems = groups.flatMap(g => g.items);

  res.json({
    date,
    counts: {
      total:     allItems.length,
      delivered: allItems.filter(i => i.status === 'delivered').length,
      pending:   allItems.filter(i => i.status === 'pending').length,
      paused:    allItems.filter(i => i.status === 'paused').length,
    },
    groups,
  });
});

router.put('/deliveries/status', requireAdmin, (req, res) => {
  const { subscriptionId, date, status } = req.body;
  if (!subscriptionId || !date || !status)
    return res.status(400).json({ error: 'subscriptionId, date, and status are required' });

  const VALID_STATUSES = ['pending', 'delivered', 'paused'];
  if (!VALID_STATUSES.includes(status))
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subscriptionId);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  const existing = db.prepare('SELECT * FROM deliveries WHERE subscription_id = ? AND date = ?').get(subscriptionId, date);

  let deliveryId;
  if (existing) {
    db.prepare('UPDATE deliveries SET status = ? WHERE id = ?').run(status, existing.id);
    deliveryId = existing.id;
  } else {
    const r = db.prepare(
      'INSERT INTO deliveries (subscription_id, date, quantity, status) VALUES (?, ?, ?, ?)'
    ).run(subscriptionId, date, sub.quantity, status);
    deliveryId = r.lastInsertRowid;
  }

  res.json({ success: true, deliveryId, orderId: `DEL-${deliveryId}`, status });
});

// ── App Settings (owner only) ─────────────────────────────────────
const SETTING_KEYS = new Set([
  'twilio_account_sid', 'twilio_auth_token', 'twilio_whatsapp_from',
  'twilio_sms_from', 'gst_cgst', 'gst_sgst', 'gst_igst', 'holidays',
]);

router.get('/settings', requireAdminRole('owner'), (req, res) => {
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  const out  = {};
  rows.forEach(r => { out[r.key] = r.value; });
  if (out.twilio_auth_token) out.twilio_auth_token = '••••••••';
  res.json(out);
});

router.put('/settings', requireAdminRole('owner'), (req, res) => {
  const upsert = db.prepare(`
    INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  for (const [k, v] of Object.entries(req.body)) {
    if (!SETTING_KEYS.has(k)) continue;
    if (v === '••••••••') continue; // masked placeholder — skip
    upsert.run(k, String(v));
  }
  res.json({ success: true });
});

export default router;
