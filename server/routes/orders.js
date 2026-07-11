import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../lib/notify.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows.map(o => ({ id: o.id, productName: o.product_name, qty: o.qty, startDate: o.start_date, status: o.status, total: o.total })));
});

router.post('/', requireAuth, (req, res) => {
  const { cartItems, productName, qty = 1, total } = req.body;
  const items = Array.isArray(cartItems) && cartItems.length > 0
    ? cartItems
    : [{ productName: productName || 'Order', qty, total: total || 0 }];

  const created = [];
  for (const item of items) {
    const id        = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const startDate = new Date().toISOString().slice(0, 10);
    db.prepare(
      'INSERT INTO orders (id, user_id, product_name, qty, start_date, status, total) VALUES (?,?,?,?,?,?,?)'
    ).run(id, req.user.id, item.productName || item.name || 'Order', item.qty || item.quantity || 1, startDate, 'active', item.total || item.amount || 0);
    created.push({ id, productName: item.productName || item.name, qty: item.qty || item.quantity || 1, total: item.total || item.amount || 0, status: 'active', startDate });
  }

  notify(req.user.id, 'Order Placed', 'Your order has been placed successfully!', '/orders');
  res.status(201).json({ success: true, orders: created });
});

router.put('/:id/cancel', requireAuth, (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE orders SET status=? WHERE id=?').run('cancelled', req.params.id);
  notify(req.user.id, 'Order Cancelled', `Your order for "${o.product_name}" has been cancelled. Refund will be processed within 3–5 business days.`, '/orders');
  res.json({ success: true });
});

export default router;
