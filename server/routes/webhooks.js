import { Router } from 'express';
import db from '../db.js';

const router = Router();

// ── Helper: find or create conversation ──────────────────────────
function findOrCreateConv(clientId, channel) {
  let conv = db.prepare(
    'SELECT * FROM comms_conversations WHERE client_id=? AND channel=?'
  ).get(clientId, channel);
  if (!conv) {
    const r = db.prepare(
      'INSERT INTO comms_conversations (client_id, channel, unread_count, status) VALUES (?,?,?,?)'
    ).run(clientId, channel, 0, 'open');
    conv = db.prepare('SELECT * FROM comms_conversations WHERE id=?').get(r.lastInsertRowid);
  }
  return conv;
}

function storeInbound(convId, body) {
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO comms_messages (conversation_id, direction, body, status, sent_at) VALUES (?,?,?,?,?)'
  ).run(convId, 'in', body, 'delivered', now);
  db.prepare(
    'UPDATE comms_conversations SET last_message=?, last_at=?, unread_count=unread_count+1 WHERE id=?'
  ).run(body.slice(0, 120), now, convId);
}

// ── Twilio WhatsApp inbound ───────────────────────────────────────
// Twilio POSTs application/x-www-form-urlencoded
// Fields: From ("whatsapp:+91XXXXXXXXXX"), Body, ProfileName
router.post('/whatsapp/twilio', (req, res) => {
  try {
    const from = (req.body.From || '').replace(/^whatsapp:/i, '').trim();
    const body = (req.body.Body || '').trim();
    if (!from || !body) return res.status(400).send('Missing From or Body');

    const user = db.prepare(
      "SELECT * FROM users WHERE REPLACE(REPLACE(phone,' ',''),'-','')=? AND is_admin=0"
    ).get(from.replace(/\D/g, ''));

    if (!user) {
      // Store anyway under a placeholder client_id based on phone
      const fakeClientId = `wa_${from.replace(/\D/g, '')}`;
      const conv = findOrCreateConv(fakeClientId, 'whatsapp');
      storeInbound(conv.id, body);
      return res.status(200).send('<Response></Response>');
    }

    const conv = findOrCreateConv(user.client_id, 'whatsapp');
    storeInbound(conv.id, body);
    res.status(200).send('<Response></Response>');
  } catch (err) {
    console.error('Twilio webhook error:', err.message);
    res.status(200).send('<Response></Response>'); // always 200 to Twilio
  }
});

// ── MSG91 WhatsApp inbound ────────────────────────────────────────
// MSG91 POSTs JSON: { data: { from, payload: { text: { body } } } }
router.post('/whatsapp/msg91', (req, res) => {
  try {
    const data  = req.body?.data || req.body;
    const from  = (data.from || '').replace(/\D/g, '');
    const body  = data.payload?.text?.body || data.text || '';
    if (!from || !body) return res.status(400).json({ error: 'Missing from or body' });

    const user = db.prepare(
      "SELECT * FROM users WHERE REPLACE(REPLACE(phone,' ',''),'-','')=? AND is_admin=0"
    ).get(from);

    const clientId = user?.client_id || `wa_${from}`;
    const conv = findOrCreateConv(clientId, 'whatsapp');
    storeInbound(conv.id, body.trim());

    res.json({ success: true });
  } catch (err) {
    console.error('MSG91 webhook error:', err.message);
    res.status(200).json({ success: false }); // 200 so MSG91 stops retrying
  }
});

// ── Gupshup WhatsApp inbound ──────────────────────────────────────
// Gupshup: { payload: { sender: { phone }, payload: { text } } }
router.post('/whatsapp/gupshup', (req, res) => {
  try {
    const payload = req.body?.payload || req.body;
    const from    = (payload?.sender?.phone || '').replace(/\D/g, '');
    const body    = payload?.payload?.text || payload?.message || '';
    if (!from || !body) return res.status(200).json({ status: 'ok' });

    const user = db.prepare(
      "SELECT * FROM users WHERE REPLACE(REPLACE(phone,' ',''),'-','')=? AND is_admin=0"
    ).get(from);

    const clientId = user?.client_id || `wa_${from}`;
    const conv = findOrCreateConv(clientId, 'whatsapp');
    storeInbound(conv.id, body.trim());

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Gupshup webhook error:', err.message);
    res.status(200).json({ status: 'ok' });
  }
});

// ── Email inbound (via forwarding service) ───────────────────────
// For services like Mailgun or SendGrid Inbound Parse
// Body fields: sender, from, subject, body-plain
router.post('/email', (req, res) => {
  try {
    const fromEmail = (req.body?.sender || req.body?.from || '').toLowerCase().match(/[\w.+-]+@[\w.-]+/)?.[0];
    const body      = (req.body?.['body-plain'] || req.body?.text || req.body?.body || '').trim();
    if (!fromEmail || !body) return res.status(400).json({ error: 'Missing from or body' });

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email)=? AND is_admin=0').get(fromEmail);
    if (!user) return res.status(200).json({ status: 'ignored' });

    const conv = findOrCreateConv(user.client_id, 'email');
    storeInbound(conv.id, body.slice(0, 2000));
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Email webhook error:', err.message);
    res.status(200).json({ status: 'error' });
  }
});

export default router;
