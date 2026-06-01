import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../lib/notify.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const bills = db.prepare('SELECT * FROM bills WHERE user_id=? ORDER BY rowid DESC').all(req.user.id);
  res.json(bills.map(b => ({
    id: b.id, period: b.period, amount: b.amount, status: b.status,
    dueDate: b.due_date, paidDate: b.paid_date, method: b.payment_method,
    lineItems: db.prepare('SELECT * FROM bill_items WHERE bill_id=?').all(b.id),
  })));
});

router.post('/:id/pay', requireAuth, (req, res) => {
  const { walletApplied = 0, method = 'UPI' } = req.body;
  const bill = db.prepare('SELECT * FROM bills WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!bill)                  return res.status(404).json({ error: 'Bill not found' });
  if (bill.status === 'paid') return res.status(400).json({ error: 'Already paid' });

  const paidDate = new Date().toISOString().split('T')[0];
  db.prepare('UPDATE bills SET status=?,paid_date=?,payment_method=? WHERE id=?').run('paid', paidDate, method, bill.id);
  if (walletApplied > 0)
    db.prepare('UPDATE users SET wallet_balance=wallet_balance-? WHERE id=?').run(walletApplied, req.user.id);

  notify(req.user.id, 'Bill Paid Successfully', `Your ${bill.period} bill of ₹${bill.amount} has been paid via ${method}.`, '/bills');
  res.json({ success: true, paidDate });
});

export default router;
