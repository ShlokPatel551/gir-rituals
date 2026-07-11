import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  const rows = db.prepare(
    "SELECT * FROM admin_banners WHERE status='active' ORDER BY display_order ASC, created_at DESC"
  ).all();
  res.json(rows.map(r => {
    const bg = r.bg_color || '#1b4332';
    return {
      id:           r.id,
      category:     r.category  || '',
      headline:     r.headline  || r.title,
      tagline:      r.tagline   || '',
      ctaLabel:     r.cta_label || 'Shop Now',
      ctaColor:     r.cta_color || '#ffffff',
      bgColor:      bg,
      bgGradient:   `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)`,
      emoji:        r.emoji     || '🥛',
      linkTo:       r.link_to   || '',
      displayOrder: r.display_order,
    };
  }));
});

export default router;
