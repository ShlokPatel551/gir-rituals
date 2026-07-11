import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import db from '../db.js';
import { requireAdmin, requireAdminRole } from '../middleware/auth.js';
import { JWT_SECRET as SECRET } from '../lib/secret.js';
import { notify } from '../lib/notify.js';

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

// ── Admin Offers ──────────────────────────────────────────────────
function offerRow(r) {
  return {
    id:           r.id,
    title:        r.title,
    description:  r.description || '',
    offerType:    r.offer_type,
    offerPrice:   r.offer_price,
    origPrice:    r.orig_price,
    productIds:   r.product_ids ? JSON.parse(r.product_ids) : [],
    startDate:    r.start_date || '',
    endDate:      r.end_date   || '',
    maxOrders:    r.max_orders,
    orderType:    r.order_type,
    status:       r.status,
    headerColor:  r.header_color || '#2d6a4f',
    icon:         r.icon || 'local_activity',
    ordersPlaced: r.orders_placed,
    createdAt:    r.created_at,
  };
}

router.get('/offers', requireAdmin, (req, res) => {
  const { status } = req.query;
  const rows = status && status !== 'all'
    ? db.prepare('SELECT * FROM admin_offers WHERE status=? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM admin_offers ORDER BY created_at DESC').all();
  res.json(rows.map(offerRow));
});

router.post('/offers', requireAdmin, (req, res) => {
  const { title, description, offerType, offerPrice, origPrice, productIds, startDate, endDate, maxOrders, orderType, status, headerColor, icon } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const today = new Date().toISOString().slice(0, 10);
  let computedStatus = status || 'draft';
  if (computedStatus !== 'draft') {
    if (startDate && startDate > today) computedStatus = 'upcoming';
    else if (startDate && startDate <= today) computedStatus = 'active';
  }

  const r = db.prepare(`
    INSERT INTO admin_offers
      (title, description, offer_type, offer_price, orig_price, product_ids, start_date, end_date, max_orders, order_type, status, header_color, icon)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    title, description || '', offerType || 'fixed_price',
    offerPrice ?? null, origPrice ?? null,
    productIds ? JSON.stringify(productIds) : null,
    startDate || null, endDate || null,
    maxOrders ? parseInt(maxOrders) : null,
    orderType || 'individual', computedStatus,
    headerColor || '#2d6a4f', icon || 'local_activity'
  );

  const created = db.prepare('SELECT * FROM admin_offers WHERE id=?').get(r.lastInsertRowid);

  // Auto-push notification to all customers when an offer goes active
  if (computedStatus === 'active') {
    const users = db.prepare('SELECT id FROM users WHERE is_admin=0').all();
    const ins   = db.prepare("INSERT OR IGNORE INTO notifications (id, user_id, title, message, link) VALUES (?,?,?,?,?)");
    for (const u of users) {
      ins.run(`offer-${created.id}-${u.id}`, u.id, title, description || title, '/offers');
    }
  }

  res.status(201).json(offerRow(created));
});

router.put('/offers/:id', requireAdmin, (req, res) => {
  const offer = db.prepare('SELECT * FROM admin_offers WHERE id=?').get(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  const { title, description, offerType, offerPrice, origPrice, productIds, startDate, endDate, maxOrders, orderType, status, headerColor, icon } = req.body;

  db.prepare(`
    UPDATE admin_offers SET
      title=COALESCE(?,title), description=COALESCE(?,description),
      offer_type=COALESCE(?,offer_type), offer_price=COALESCE(?,offer_price),
      orig_price=COALESCE(?,orig_price), product_ids=COALESCE(?,product_ids),
      start_date=COALESCE(?,start_date), end_date=COALESCE(?,end_date),
      max_orders=COALESCE(?,max_orders), order_type=COALESCE(?,order_type),
      status=COALESCE(?,status), header_color=COALESCE(?,header_color),
      icon=COALESCE(?,icon), updated_at=datetime('now')
    WHERE id=?
  `).run(
    title ?? null, description ?? null, offerType ?? null,
    offerPrice ?? null, origPrice ?? null,
    productIds ? JSON.stringify(productIds) : null,
    startDate ?? null, endDate ?? null,
    maxOrders ? parseInt(maxOrders) : null,
    orderType ?? null, status ?? null,
    headerColor ?? null, icon ?? null,
    offer.id
  );

  res.json(offerRow(db.prepare('SELECT * FROM admin_offers WHERE id=?').get(offer.id)));
});

router.delete('/offers/:id', requireAdmin, (req, res) => {
  const offer = db.prepare('SELECT * FROM admin_offers WHERE id=?').get(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  db.prepare('DELETE FROM admin_offers WHERE id=?').run(offer.id);
  res.json({ success: true });
});

// ── Admin Banners ─────────────────────────────────────────────────
function bannerRow(r) {
  const ctr = r.impressions > 0 ? parseFloat(((r.taps / r.impressions) * 100).toFixed(1)) : 0;
  return {
    id:           r.id,
    title:        r.title,
    category:     r.category || '',
    categoryIcon: r.category_icon || 'photo_library',
    headline:     r.headline || '',
    tagline:      r.tagline  || '',
    ctaLabel:     r.cta_label || '',
    ctaColor:     r.cta_color || '#ffffff',
    bgColor:      r.bg_color  || '#1b4332',
    bgGradient:   `linear-gradient(135deg, ${r.bg_color || '#1b4332'} 0%, ${r.bg_color || '#1b4332'}cc 100%)`,
    emoji:        r.emoji || '🥛',
    product:      r.product || '',
    startDate:    r.start_date || '',
    endDate:      r.end_date   || '',
    linkTo:       r.link_to    || '',
    displayOrder: r.display_order,
    status:       r.status,
    impressions:  r.impressions,
    taps:         r.taps,
    ctr,
    createdAt:    r.created_at,
  };
}

router.get('/banners', requireAdmin, (req, res) => {
  const { status } = req.query;
  const rows = status && status !== 'all'
    ? db.prepare('SELECT * FROM admin_banners WHERE status=? ORDER BY display_order ASC, created_at DESC').all(status)
    : db.prepare('SELECT * FROM admin_banners ORDER BY display_order ASC, created_at DESC').all();
  res.json(rows.map(bannerRow));
});

router.post('/banners', requireAdmin, (req, res) => {
  const { title, category, categoryIcon, headline, tagline, ctaLabel, ctaColor, bgColor, emoji, product, startDate, endDate, linkTo, displayOrder, status } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const today = new Date().toISOString().slice(0, 10);
  let computedStatus = status || 'draft';
  if (computedStatus !== 'draft') {
    if (startDate && startDate > today) computedStatus = 'upcoming';
    else if (startDate && startDate <= today) computedStatus = 'active';
  }

  const r = db.prepare(`
    INSERT INTO admin_banners
      (title, category, category_icon, headline, tagline, cta_label, cta_color, bg_color, emoji, product, start_date, end_date, link_to, display_order, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    title, category || '', categoryIcon || 'photo_library',
    headline || '', tagline || '',
    ctaLabel || '', ctaColor || '#ffffff',
    bgColor || '#1b4332', emoji || '🥛',
    product || '', startDate || null, endDate || null,
    linkTo || '', parseInt(displayOrder) || 0, computedStatus
  );

  const created = db.prepare('SELECT * FROM admin_banners WHERE id=?').get(r.lastInsertRowid);

  // Auto-push notification to all customers when a banner goes active
  if (computedStatus === 'active') {
    const notifTitle = headline || title;
    const notifMsg   = tagline || `New promotion: ${notifTitle}`;
    const users = db.prepare('SELECT id FROM users WHERE is_admin=0').all();
    const ins   = db.prepare("INSERT OR IGNORE INTO notifications (id, user_id, title, message, link) VALUES (?,?,?,?,?)");
    for (const u of users) {
      ins.run(`banner-${created.id}-${u.id}`, u.id, notifTitle, notifMsg, linkTo || '/offers');
    }
  }

  res.status(201).json(bannerRow(created));
});

router.put('/banners/:id', requireAdmin, (req, res) => {
  const banner = db.prepare('SELECT * FROM admin_banners WHERE id=?').get(req.params.id);
  if (!banner) return res.status(404).json({ error: 'Banner not found' });

  const { title, category, categoryIcon, headline, tagline, ctaLabel, ctaColor, bgColor, emoji, product, startDate, endDate, linkTo, displayOrder, status } = req.body;

  db.prepare(`
    UPDATE admin_banners SET
      title=COALESCE(?,title), category=COALESCE(?,category),
      category_icon=COALESCE(?,category_icon), headline=COALESCE(?,headline),
      tagline=COALESCE(?,tagline), cta_label=COALESCE(?,cta_label),
      cta_color=COALESCE(?,cta_color), bg_color=COALESCE(?,bg_color),
      emoji=COALESCE(?,emoji), product=COALESCE(?,product),
      start_date=COALESCE(?,start_date), end_date=COALESCE(?,end_date),
      link_to=COALESCE(?,link_to),
      display_order=COALESCE(?,display_order),
      status=COALESCE(?,status), updated_at=datetime('now')
    WHERE id=?
  `).run(
    title ?? null, category ?? null, categoryIcon ?? null,
    headline ?? null, tagline ?? null, ctaLabel ?? null,
    ctaColor ?? null, bgColor ?? null, emoji ?? null,
    product ?? null, startDate ?? null, endDate ?? null,
    linkTo ?? null,
    displayOrder != null ? parseInt(displayOrder) : null,
    status ?? null,
    banner.id
  );

  res.json(bannerRow(db.prepare('SELECT * FROM admin_banners WHERE id=?').get(banner.id)));
});

router.delete('/banners/:id', requireAdmin, (req, res) => {
  const banner = db.prepare('SELECT * FROM admin_banners WHERE id=?').get(req.params.id);
  if (!banner) return res.status(404).json({ error: 'Banner not found' });
  db.prepare('DELETE FROM admin_banners WHERE id=?').run(banner.id);
  res.json({ success: true });
});

// ── Products CRUD ─────────────────────────────────────────────────
function productRow(p) {
  const stockQty    = p.stock_qty ?? 0;
  const threshold   = p.low_stock_threshold ?? 10;
  const stockStatus = stockQty <= 0 ? 'out_of_stock' : stockQty <= threshold ? 'low_stock' : 'in_stock';
  const maxStock    = Math.max(stockQty, threshold * 10, 100);
  let benefits = [];
  try { benefits = JSON.parse(p.benefits || '[]'); } catch {}
  return {
    id: p.id, name: p.name, category: p.category, price: p.price,
    buyOncePrice: p.buy_once_price ?? null, unit: p.unit,
    image: p.image || '', description: p.description || '',
    benefits, inStock: !!p.in_stock,
    status: p.status || (p.in_stock ? 'active' : 'archived'),
    stockQty, lowStockThreshold: threshold, shelfLifeDays: p.shelf_life_days ?? 1,
    stockStatus, stockPct: Math.min(100, Math.round((stockQty / maxStock) * 100)),
  };
}

router.get('/products', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
  res.json(rows.map(productRow));
});

router.post('/products', requireAdmin, requireAdminRole('owner', 'manager'), (req, res) => {
  const { name, category, price, buyOncePrice, unit, image, description, benefits, openingStock, lowStockThreshold, shelfLifeDays, status } = req.body;
  if (!name || !price || !unit) return res.status(400).json({ error: 'name, price, and unit are required' });

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const id    = 'PRD-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const resolvedStatus = status || 'active';
  const inStock = resolvedStatus === 'active' ? 1 : 0;

  let benefitsJson = '[]';
  if (benefits) {
    benefitsJson = Array.isArray(benefits)
      ? JSON.stringify(benefits)
      : JSON.stringify(benefits.split('\n').map(l => l.replace(/^[•\-*]\s*/, '')).filter(Boolean));
  }

  db.prepare(`
    INSERT INTO products (id, name, category, price, buy_once_price, unit, image, description, benefits, in_stock, stock_qty, low_stock_threshold, shelf_life_days, status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, name, category || 'dairy', parseFloat(price),
    buyOncePrice ? parseFloat(buyOncePrice) : null,
    unit, image || '', description || '', benefitsJson, inStock,
    openingStock ? parseFloat(openingStock) : 0,
    lowStockThreshold ? parseFloat(lowStockThreshold) : 10,
    shelfLifeDays ? parseInt(shelfLifeDays) : 1,
    resolvedStatus
  );

  res.status(201).json(productRow(db.prepare('SELECT * FROM products WHERE id=?').get(id)));
});

router.put('/products/:id', requireAdmin, requireAdminRole('owner', 'manager'), (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });

  const { name, category, price, buyOncePrice, unit, image, description, benefits, stockQty, lowStockThreshold, shelfLifeDays, status } = req.body;
  const resolvedStatus = status ?? p.status;
  const inStock = resolvedStatus === 'active' ? 1 : 0;

  let benefitsJson = null;
  if (benefits != null) {
    benefitsJson = Array.isArray(benefits)
      ? JSON.stringify(benefits)
      : JSON.stringify(benefits.split('\n').map(l => l.replace(/^[•\-*]\s*/, '')).filter(Boolean));
  }

  db.prepare(`
    UPDATE products SET
      name=COALESCE(?,name), category=COALESCE(?,category),
      price=COALESCE(?,price), buy_once_price=COALESCE(?,buy_once_price),
      unit=COALESCE(?,unit), image=COALESCE(?,image),
      description=COALESCE(?,description), benefits=COALESCE(?,benefits),
      in_stock=?, stock_qty=COALESCE(?,stock_qty),
      low_stock_threshold=COALESCE(?,low_stock_threshold),
      shelf_life_days=COALESCE(?,shelf_life_days), status=COALESCE(?,status)
    WHERE id=?
  `).run(
    name ?? null, category ?? null,
    price ? parseFloat(price) : null,
    buyOncePrice !== undefined ? (buyOncePrice ? parseFloat(buyOncePrice) : null) : null,
    unit ?? null, image ?? null, description ?? null, benefitsJson,
    inStock,
    stockQty !== undefined ? parseFloat(stockQty) : null,
    lowStockThreshold !== undefined ? parseFloat(lowStockThreshold) : null,
    shelfLifeDays !== undefined ? parseInt(shelfLifeDays) : null,
    resolvedStatus ?? null,
    p.id
  );

  res.json(productRow(db.prepare('SELECT * FROM products WHERE id=?').get(p.id)));
});

router.delete('/products/:id', requireAdmin, requireAdminRole('owner'), (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  db.prepare("UPDATE products SET status='archived', in_stock=0 WHERE id=?").run(p.id);
  res.json({ success: true });
});

// ── Admin: create bill for a customer ────────────────────────────
router.post('/customers/:id/bills', requireAdmin, (req, res) => {
  const c = db.prepare('SELECT * FROM users WHERE id=? AND is_admin=0').get(req.params.id)
         || db.prepare('SELECT * FROM users WHERE client_id=? AND is_admin=0').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });

  const { period, amount, dueDate, items } = req.body;
  if (!period || !amount) return res.status(400).json({ error: 'period and amount are required' });

  const id = `BILL-${Date.now()}-${c.id}`;
  db.prepare('INSERT INTO bills (id, user_id, period, amount, status, due_date) VALUES (?,?,?,?,?,?)')
    .run(id, c.id, period, parseFloat(amount), 'unpaid', dueDate || null);

  if (Array.isArray(items) && items.length > 0) {
    const ins = db.prepare('INSERT INTO bill_items (bill_id, description, qty, rate, amount) VALUES (?,?,?,?,?)');
    for (const item of items) ins.run(id, item.description, item.qty || 1, item.rate || 0, item.amount || 0);
  }

  notify(c.id, 'New Bill Generated', `Your bill for ${period} (₹${amount}) is ready. Due: ${dueDate || 'upon receipt'}.`, '/bills');
  res.status(201).json({ success: true, id });
});

// ── Admin: manage customer subscriptions ─────────────────────────
router.patch('/subscriptions/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  const VALID = ['active', 'paused', 'cancelled'];
  if (!VALID.includes(status)) return res.status(400).json({ error: `status must be one of: ${VALID.join(', ')}` });

  const sub = db.prepare(`
    SELECT s.*, p.name as product_name, u.id as uid
    FROM subscriptions s
    JOIN products p ON p.id = s.product_id
    JOIN users u    ON u.id = s.user_id
    WHERE s.id=?
  `).get(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  db.prepare('UPDATE subscriptions SET status=? WHERE id=?').run(status, sub.id);

  const msg = {
    active:    `Your ${sub.product_name} delivery has been resumed.`,
    paused:    `Your ${sub.product_name} delivery has been paused by our team.`,
    cancelled: `Your ${sub.product_name} subscription has been cancelled.`,
  };
  notify(sub.uid, `Subscription ${status}`, msg[status], '/schedule');

  res.json({ success: true, status });
});

// ── Comms helpers ────────────────────────────────────────────────
import { sendCommsMessage, sendBroadcast, CHANNELS_STATUS } from '../lib/comms-send.js';

// ── Comms: channel status ─────────────────────────────────────────
router.get('/comms/status', requireAdmin, (req, res) => {
  const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
  res.json({
    channels: CHANNELS_STATUS,
    webhooks: {
      twilio:  `${baseUrl}/api/webhooks/whatsapp/twilio`,
      msg91:   `${baseUrl}/api/webhooks/whatsapp/msg91`,
      gupshup: `${baseUrl}/api/webhooks/whatsapp/gupshup`,
      email:   `${baseUrl}/api/webhooks/email`,
    },
    imap: {
      enabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      host:    process.env.IMAP_HOST || 'imap.gmail.com',
      user:    process.env.SMTP_USER || null,
    },
  });
});

// ── Comms: Conversations ─────────────────────────────────────────
router.get('/comms/conversations', requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, u.first_name, u.last_name, u.email
    FROM comms_conversations c
    LEFT JOIN users u ON u.client_id = c.client_id
    ORDER BY COALESCE(c.last_at, c.created_at) DESC
    LIMIT 50
  `).all();
  res.json({ rows });
});

router.get('/comms/conversations/:id', requireAdmin, (req, res) => {
  const conv = db.prepare('SELECT * FROM comms_conversations WHERE id=?').get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Not found' });
  const msgs = db.prepare('SELECT * FROM comms_messages WHERE conversation_id=? ORDER BY sent_at ASC').all(req.params.id);
  db.prepare('UPDATE comms_conversations SET unread_count=0 WHERE id=?').run(req.params.id);
  res.json({ conversation: conv, messages: msgs });
});

router.post('/comms/conversations/:id/messages', requireAdmin, async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'body required' });

  const conv = db.prepare(`
    SELECT c.*, u.phone, u.email AS customer_email
    FROM comms_conversations c
    LEFT JOIN users u ON u.client_id = c.client_id
    WHERE c.id=?
  `).get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Not found' });

  const now = new Date().toISOString();
  let deliveryStatus = 'sent';

  // Attempt real delivery
  try {
    const to = conv.channel === 'email' ? conv.customer_email : conv.phone;
    if (to) {
      await sendCommsMessage({ channel: conv.channel, to, body: body.trim() });
      deliveryStatus = 'delivered';
    }
  } catch (err) {
    // Log but don't fail — message is stored regardless
    console.warn(`[comms] delivery failed (${conv.channel}): ${err.message}`);
  }

  const r = db.prepare(
    'INSERT INTO comms_messages (conversation_id, direction, body, status, sent_at) VALUES (?,?,?,?,?)'
  ).run(req.params.id, 'out', body.trim(), deliveryStatus, now);
  db.prepare('UPDATE comms_conversations SET last_message=?, last_at=?, unread_count=0 WHERE id=?').run(body.trim(), now, req.params.id);
  res.json({ id: r.lastInsertRowid, conversation_id: Number(req.params.id), direction: 'out', body: body.trim(), status: deliveryStatus, sent_at: now });
});

// ── Comms: Broadcasts ─────────────────────────────────────────────
router.get('/comms/broadcasts', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM comms_broadcasts ORDER BY created_at DESC LIMIT 50').all();
  res.json({ rows });
});

router.post('/comms/broadcasts', requireAdmin, async (req, res) => {
  const { title, body, channel = 'whatsapp', segment = 'all' } = req.body;
  if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'title and body required' });

  // Build recipient list
  let users = [];
  if (segment === 'active') {
    users = db.prepare(`
      SELECT DISTINCT u.phone, u.email FROM users u
      JOIN subscriptions s ON s.user_id = u.id
      WHERE s.status='active' AND u.is_admin=0 AND (u.phone IS NOT NULL OR u.email IS NOT NULL)
    `).all();
  } else if (segment === 'inactive') {
    users = db.prepare(`
      SELECT u.phone, u.email FROM users u
      WHERE u.is_admin=0 AND (u.phone IS NOT NULL OR u.email IS NOT NULL)
        AND u.id NOT IN (SELECT user_id FROM subscriptions WHERE status='active')
    `).all();
  } else {
    users = db.prepare(
      "SELECT phone, email FROM users WHERE is_admin=0 AND (phone IS NOT NULL OR email IS NOT NULL)"
    ).all();
  }

  const now = new Date().toISOString();
  const r = db.prepare(
    'INSERT INTO comms_broadcasts (title, body, channel, segment, recipient_count, status, sent_at, created_by) VALUES (?,?,?,?,?,?,?,?)'
  ).run(title.trim(), body.trim(), channel, segment, users.length, 'sent', now, req.user?.name || 'Admin');

  // Fire-and-forget delivery (don't block the response)
  const recipients = users.map(u => ({
    to:      channel === 'email' ? u.email : u.phone,
    subject: title.trim(),
  })).filter(r => r.to);

  if (recipients.length > 0) {
    sendBroadcast({ channel, body: body.trim(), recipients })
      .catch(err => console.warn('[comms] broadcast error:', err.message));
  }

  res.status(201).json({
    id: r.lastInsertRowid, title: title.trim(), body: body.trim(),
    channel, segment, recipient_count: users.length, status: 'sent', sent_at: now, created_at: now,
  });
});

// ── Comms: Team ───────────────────────────────────────────────────
router.get('/comms/team', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM comms_team ORDER BY sent_at ASC LIMIT 200').all();
  res.json({ rows });
});

router.post('/comms/team', requireAdmin, (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ error: 'body required' });
  const now = new Date().toISOString();
  const name = req.user?.name || 'Admin';
  const role = req.user?.adminRole || 'owner';
  const r = db.prepare(
    'INSERT INTO comms_team (sender_name, sender_role, body, sent_at) VALUES (?,?,?,?)'
  ).run(name, role, body.trim(), now);
  res.status(201).json({ id: r.lastInsertRowid, sender_name: name, sender_role: role, body: body.trim(), sent_at: now });
});

export default router;


