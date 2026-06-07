import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import db from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
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

  const token = jwt.sign({ id: u.id, email: u.email, name: `${u.first_name} ${u.last_name}`, isAdmin: true, role: 'admin' }, SECRET, { expiresIn: '15m' });

  const raw  = randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(raw).digest('hex');
  const exp  = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, is_admin, expires_at) VALUES (?,?,1,?)').run(u.id, hash, exp);

  res.cookie(REFRESH_COOKIE, raw, REFRESH_COOKIE_OPTS);
  res.json({ token, name: `${u.first_name} ${u.last_name}` });
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

export default router;
