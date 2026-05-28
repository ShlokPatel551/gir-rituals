import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

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
  db.prepare('UPDATE subscriptions SET status=? WHERE id=? AND user_id=?').run('paused', req.params.id, req.user.id);
  res.json({ success: true });
});

router.post('/:id/resume', requireAuth, (req, res) => {
  db.prepare('UPDATE subscriptions SET status=? WHERE id=? AND user_id=?').run('active', req.params.id, req.user.id);
  res.json({ success: true });
});

export default router;
