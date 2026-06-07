import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  const rows = db.prepare('SELECT * FROM products WHERE in_stock=1').all();
  res.json(rows.map(p => ({ ...p, benefits: JSON.parse(p.benefits || '[]') })));
});

router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...p, benefits: JSON.parse(p.benefits || '[]') });
});

export default router;
