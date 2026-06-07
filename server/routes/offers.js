import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  const rows = db.prepare('SELECT * FROM offers WHERE is_active=1').all();
  res.json(rows.map(o => ({
    id: o.id, title: o.title, description: o.description,
    validUntil: o.valid_until, products: JSON.parse(o.products || '[]'),
    upcoming: !!o.upcoming, promoCode: o.promo_code,
  })));
});

export default router;
