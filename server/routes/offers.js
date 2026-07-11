import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  const rows = db.prepare(
    "SELECT * FROM admin_offers WHERE status IN ('active','upcoming') ORDER BY created_at DESC"
  ).all();
  res.json(rows.map(o => ({
    id:          o.id,
    title:       o.title,
    description: o.description || '',
    validUntil:  o.end_date    || '',
    products:    o.product_ids ? JSON.parse(o.product_ids) : [],
    upcoming:    o.status === 'upcoming',
    promoCode:   null,
    headerColor: o.header_color || '#2d6a4f',
    icon:        o.icon || 'local_activity',
    offerPrice:  o.offer_price,
    origPrice:   o.orig_price,
    offerType:   o.offer_type,
    status:      o.status,
  })));
});

export default router;
