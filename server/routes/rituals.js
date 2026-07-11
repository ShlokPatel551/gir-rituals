import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../lib/notify.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(
    'SELECT s.*,p.name,p.image FROM subscriptions s JOIN products p ON s.product_id=p.id WHERE s.user_id=?'
  ).all(req.user.id);
  res.json(rows.map(s => ({
    id: s.id, productId: s.product_id, productName: s.name, image: s.image,
    quantity: s.quantity, status: s.status === 'paused' ? 'Paused' : 'Pending',
  })));
});

router.post('/', requireAuth, (req, res) => {
  const { productId, quantity = 1, frequency = 'daily' } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId is required' });

  const product = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const existing = db.prepare(
    "SELECT id FROM subscriptions WHERE user_id=? AND product_id=? AND status IN ('active','paused')"
  ).get(req.user.id, productId);
  if (existing) return res.status(409).json({ error: 'Already subscribed to this product' });

  const id        = `SUB-${Date.now()}-${req.user.id}`;
  const startDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  db.prepare(
    'INSERT INTO subscriptions (id, user_id, product_id, quantity, frequency, status, start_date) VALUES (?,?,?,?,?,?,?)'
  ).run(id, req.user.id, productId, Number(quantity), frequency, 'active', startDate);

  notify(req.user.id, 'Subscription Confirmed', `Your daily ${product.name} delivery starts tomorrow!`, '/schedule');

  const sub = db.prepare(
    'SELECT s.*,p.name,p.image FROM subscriptions s JOIN products p ON s.product_id=p.id WHERE s.id=?'
  ).get(id);

  res.status(201).json({
    id: sub.id, productId: sub.product_id, productName: sub.name, image: sub.image,
    quantity: sub.quantity, status: 'Pending',
  });
});

router.post('/:id/pause', requireAuth, (req, res) => {
  const sub = db.prepare('SELECT s.*,p.name FROM subscriptions s JOIN products p ON s.product_id=p.id WHERE s.id=? AND s.user_id=?').get(req.params.id, req.user.id);
  db.prepare('UPDATE subscriptions SET status=? WHERE id=? AND user_id=?').run('paused', req.params.id, req.user.id);
  if (sub) notify(req.user.id, 'Delivery Paused', `Your ${sub.name} delivery has been paused. Resume anytime from your schedule.`, '/schedule');
  res.json({ success: true });
});

router.post('/:id/resume', requireAuth, (req, res) => {
  const sub = db.prepare('SELECT s.*,p.name FROM subscriptions s JOIN products p ON s.product_id=p.id WHERE s.id=? AND s.user_id=?').get(req.params.id, req.user.id);
  db.prepare('UPDATE subscriptions SET status=? WHERE id=? AND user_id=?').run('active', req.params.id, req.user.id);
  if (sub) notify(req.user.id, 'Delivery Resumed', `Your ${sub.name} delivery is active again. See you tomorrow morning!`, '/schedule');
  res.json({ success: true });
});

export default router;
