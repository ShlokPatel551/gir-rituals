import { Router } from 'express';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(new Error('Razorpay not configured'), { status: 503 });
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payments/create-order
// Creates a Razorpay order. Called just before showing the payment UI.
router.post('/create-order', requireAuth, async (req, res, next) => {
  try {
    const { amount, billId, cartItems } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes:    {
        userId: String(req.user.id),
        billId: billId || '',
      },
    });

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify
// Verifies Razorpay signature and marks bill as paid.
router.post('/verify', requireAuth, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId, walletApplied = 0 } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment fields' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return res.status(503).json({ error: 'Razorpay not configured' });

  const expected = createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
  }

  // Payment verified — mark bill paid if provided
  if (billId) {
    const bill = db.prepare('SELECT * FROM bills WHERE id=? AND user_id=?').get(billId, req.user.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    if (bill.status === 'paid') return res.json({ success: true, alreadyPaid: true });

    const paidDate = new Date().toISOString().slice(0, 10);
    db.prepare("UPDATE bills SET status='paid', paid_date=?, payment_method=? WHERE id=?")
      .run(paidDate, 'Razorpay', billId);

    // Deduct wallet if applied
    if (walletApplied > 0) {
      db.prepare('UPDATE users SET wallet_balance=MAX(0, wallet_balance-?) WHERE id=?')
        .run(walletApplied, req.user.id);
    }
  }

  res.json({ success: true, paymentId: razorpay_payment_id });
});

export default router;
