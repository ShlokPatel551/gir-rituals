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
