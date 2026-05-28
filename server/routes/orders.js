import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json(rows.map(o => ({ id: o.id, productName: o.product_name, qty: o.qty, startDate: o.start_date, status: o.status, total: o.total })));
});

router.put('/:id/cancel', requireAuth, (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE orders SET status=? WHERE id=?').run('cancelled', req.params.id);
  res.json({ success: true });
});

export default router;
