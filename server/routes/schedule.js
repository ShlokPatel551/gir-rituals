import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();

  const subs = db.prepare(
    'SELECT s.*,p.name,p.price FROM subscriptions s JOIN products p ON s.product_id=p.id WHERE s.user_id=?'
  ).all(req.user.id);

  if (!subs.length) return res.json([]);

  const entries = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    for (const s of subs) {
      const delivery = db.prepare('SELECT * FROM deliveries WHERE subscription_id=? AND date=?').get(s.id, date);
      entries.push({
        date,
        productName: s.name,
        qty: s.quantity,
        rate: s.price,
        status: delivery?.status || (s.status === 'paused' ? 'Paused' : 'Pending'),
      });
    }
  }
  res.json(entries);
});

export default router;
