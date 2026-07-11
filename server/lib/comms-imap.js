import { ImapFlow } from 'imapflow';
import db from '../db.js';

let _polling = false;

function extractText(text) {
  return (text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function pollInbox(log) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const client = new ImapFlow({
    host:   process.env.IMAP_HOST || 'imap.gmail.com',
    port:   parseInt(process.env.IMAP_PORT || '993'),
    secure: true,
    auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    logger: false,
  });

  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    // Fetch emails from last 24h that we haven't processed
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const messages = await client.search({ since, seen: false });

    for (const uid of messages) {
      const msg = await client.fetchOne(uid, { envelope: true, bodyStructure: true, bodyParts: ['TEXT'] });
      if (!msg) continue;

      const fromEmail = msg.envelope?.from?.[0]?.address?.toLowerCase();
      if (!fromEmail) continue;

      // Skip our own emails
      if (fromEmail === process.env.SMTP_USER?.toLowerCase()) continue;

      const subject = msg.envelope?.subject || '';
      const body    = extractText(msg.bodyParts?.get('TEXT') || '');
      if (!body) continue;

      // Match sender email to a customer
      const user = db.prepare('SELECT * FROM users WHERE LOWER(email)=? AND is_admin=0').get(fromEmail);
      if (!user) {
        if (log) log.debug({ fromEmail }, 'IMAP: email from unknown sender, skipping');
        continue;
      }

      // Find or create a conversation for this customer (email channel)
      let conv = db.prepare(
        "SELECT * FROM comms_conversations WHERE client_id=? AND channel='email'"
      ).get(user.client_id);

      const now = new Date().toISOString();
      if (!conv) {
        const r = db.prepare(
          "INSERT INTO comms_conversations (client_id, channel, last_message, last_at, unread_count, status) VALUES (?,?,?,?,?,?)"
        ).run(user.client_id, 'email', body.slice(0, 120), now, 1, 'open');
        conv = db.prepare('SELECT * FROM comms_conversations WHERE id=?').get(r.lastInsertRowid);
      }

      // Avoid duplicate: check if this message body was already stored in last 5 min
      const recentDupe = db.prepare(`
        SELECT id FROM comms_messages
        WHERE conversation_id=? AND direction='in' AND body=?
          AND sent_at > datetime('now', '-5 minutes')
      `).get(conv.id, body);
      if (recentDupe) continue;

      // Store the inbound message
      db.prepare(
        "INSERT INTO comms_messages (conversation_id, direction, body, status, sent_at) VALUES (?,?,?,?,?)"
      ).run(conv.id, 'in', body, 'read', now);

      db.prepare(
        "UPDATE comms_conversations SET last_message=?, last_at=?, unread_count=unread_count+1 WHERE id=?"
      ).run(body.slice(0, 120), now, conv.id);

      // Mark email as seen so we don't re-process
      await client.messageFlagsAdd({ uid }, ['\\Seen']);

      if (log) log.info({ fromEmail, convId: conv.id }, 'IMAP: new inbound email stored');
    }

    await client.logout();
  } catch (err) {
    if (log) log.warn({ err: err.message }, 'IMAP poll error');
    try { await client.logout(); } catch {}
  }
}

export function startImapPoller(log, intervalMs = 30_000) {
  if (_polling) return;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (log) log.info('IMAP poller disabled — SMTP_USER/PASS not set');
    return;
  }
  _polling = true;
  if (log) log.info(`IMAP poller started (every ${intervalMs / 1000}s)`);
  pollInbox(log);
  setInterval(() => pollInbox(log), intervalMs);
}
