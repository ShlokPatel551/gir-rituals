import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/profile', requireAuth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  const addrs = db.prepare('SELECT * FROM addresses WHERE user_id=?').all(u.id);
  const billing  = addrs.find(a => a.type === 'billing')  || {};
  const delivery = addrs.find(a => a.type === 'delivery') || {};
  const pms = db.prepare('SELECT * FROM payment_methods WHERE user_id=?').all(u.id);
  res.json({
    clientId: u.client_id,
    firstName: u.first_name, lastName: u.last_name,
    email: u.email, phone: u.phone, walletBalance: u.wallet_balance,
    billingAddress:  { street: billing.street  || '', city: billing.city  || '', state: billing.state  || '', pinCode: billing.pin_code  || '' },
    deliveryAddress: { street: delivery.street || '', city: delivery.city || '', state: delivery.state || '', pinCode: delivery.pin_code || '' },
    paymentMethods: pms.map(pm => ({ id: pm.id, type: pm.type, label: pm.label, isDefault: !!pm.is_default })),
  });
});

router.put('/profile', requireAuth, (req, res) => {
  const { firstName, lastName, phone, billingAddress, deliveryAddress } = req.body;
  db.prepare('UPDATE users SET first_name=?,last_name=?,phone=? WHERE id=?').run(firstName, lastName, phone, req.user.id);

  function upsertAddress(type, addr) {
    if (!addr) return;
    const ex = db.prepare('SELECT id FROM addresses WHERE user_id=? AND type=?').get(req.user.id, type);
    if (ex) db.prepare('UPDATE addresses SET street=?,city=?,state=?,pin_code=? WHERE id=?').run(addr.street, addr.city, addr.state, addr.pinCode, ex.id);
    else     db.prepare('INSERT INTO addresses (user_id,type,street,city,state,pin_code) VALUES (?,?,?,?,?,?)').run(req.user.id, type, addr.street, addr.city, addr.state, addr.pinCode);
  }
  upsertAddress('billing',  billingAddress);
  upsertAddress('delivery', deliveryAddress);
  res.json({ success: true });
});

router.get('/wallet', requireAuth, (req, res) => {
  const u = db.prepare('SELECT wallet_balance FROM users WHERE id=?').get(req.user.id);
  res.json({ balance: u.wallet_balance });
});

router.post('/wallet/add', requireAuth, (req, res) => {
  const { amount } = req.body;
  db.prepare('UPDATE users SET wallet_balance=wallet_balance+? WHERE id=?').run(amount, req.user.id);
  const u = db.prepare('SELECT wallet_balance FROM users WHERE id=?').get(req.user.id);
  res.json({ balance: u.wallet_balance });
});

router.get('/statement', requireAuth, (req, res) => {
  const { month } = req.query;
  const rows = month
    ? db.prepare('SELECT * FROM statement_entries WHERE user_id=? AND month=? ORDER BY date DESC').all(req.user.id, month)
    : db.prepare('SELECT * FROM statement_entries WHERE user_id=? ORDER BY date DESC').all(req.user.id);
  res.json(rows.map(e => ({ id: e.id, date: e.date, type: e.type, description: e.description, amount: e.amount, credit: !!e.credit, month: e.month })));
});

// Payment methods
router.post('/payment-methods', requireAuth, (req, res) => {
  const { type, label } = req.body;
  const id = `pm_${Date.now()}`;
  db.prepare('INSERT INTO payment_methods (id,user_id,type,label) VALUES (?,?,?,?)').run(id, req.user.id, type, label);
  res.status(201).json({ id, type, label, isDefault: false });
});

router.delete('/payment-methods/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM payment_methods WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

router.put('/payment-methods/:id/default', requireAuth, (req, res) => {
  db.prepare('UPDATE payment_methods SET is_default=0 WHERE user_id=?').run(req.user.id);
  db.prepare('UPDATE payment_methods SET is_default=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

export default router;
