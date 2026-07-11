-- Comms: customer conversations
CREATE TABLE IF NOT EXISTS comms_conversations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id    TEXT    NOT NULL,
  channel      TEXT    NOT NULL DEFAULT 'whatsapp',
  last_message TEXT,
  last_at      DATETIME,
  unread_count INTEGER NOT NULL DEFAULT 0,
  status       TEXT    NOT NULL DEFAULT 'open',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages within a conversation
CREATE TABLE IF NOT EXISTS comms_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES comms_conversations(id) ON DELETE CASCADE,
  direction       TEXT    NOT NULL, -- 'in' | 'out'
  body            TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'sent', -- sent | delivered | read
  sent_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Broadcast messages to customer segments
CREATE TABLE IF NOT EXISTS comms_broadcasts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT    NOT NULL,
  body            TEXT    NOT NULL,
  channel         TEXT    NOT NULL DEFAULT 'whatsapp',
  segment         TEXT    NOT NULL DEFAULT 'all',
  recipient_count INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'sent',
  sent_at         DATETIME,
  created_by      TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Internal team messages
CREATE TABLE IF NOT EXISTS comms_team (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_name TEXT    NOT NULL,
  sender_role TEXT    NOT NULL DEFAULT 'owner',
  body        TEXT    NOT NULL,
  sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed 3 demo conversations from real customers (if any exist)
INSERT OR IGNORE INTO comms_conversations (client_id, channel, last_message, last_at, unread_count, status)
SELECT client_id, 'whatsapp',
       'Good morning! Is the delivery on track for today?',
       datetime('now', '-10 minutes'), 1, 'open'
FROM users WHERE is_admin = 0 ORDER BY created_at DESC LIMIT 1;

INSERT OR IGNORE INTO comms_conversations (client_id, channel, last_message, last_at, unread_count, status)
SELECT client_id, 'sms',
       'Thank you for the A2 ghee, it was exceptional!',
       datetime('now', '-2 hours'), 0, 'open'
FROM users WHERE is_admin = 0 ORDER BY created_at DESC LIMIT 1 OFFSET 1;

INSERT OR IGNORE INTO comms_conversations (client_id, channel, last_message, last_at, unread_count, status)
SELECT client_id, 'email',
       'Sent the quotation for the upcoming event.',
       datetime('now', '-1 day'), 0, 'open'
FROM users WHERE is_admin = 0 ORDER BY created_at DESC LIMIT 1 OFFSET 2;

-- Seed messages for first conversation
INSERT OR IGNORE INTO comms_messages (conversation_id, direction, body, status, sent_at)
SELECT c.id, 'in',
       'Good morning! I wanted to check if the delivery for the A2 Ghee is on track. The milk usually arrives by 7:30 AM.',
       'read', datetime('now', '-30 minutes')
FROM comms_conversations c
JOIN users u ON u.client_id = c.client_id
WHERE c.channel = 'whatsapp'
LIMIT 1;

INSERT OR IGNORE INTO comms_messages (conversation_id, direction, body, status, sent_at)
SELECT c.id, 'out',
       'Good morning! We apologize for the slight delay at our collection centre. Your package is on its way and should arrive within 20 minutes.',
       'read', datetime('now', '-20 minutes')
FROM comms_conversations c
WHERE c.channel = 'whatsapp'
LIMIT 1;

INSERT OR IGNORE INTO comms_messages (conversation_id, direction, body, status, sent_at)
SELECT c.id, 'in',
       'Thank you for the update. Is the morning delivery on track?',
       'delivered', datetime('now', '-10 minutes')
FROM comms_conversations c
WHERE c.channel = 'whatsapp'
LIMIT 1;

-- Seed a broadcast
INSERT OR IGNORE INTO comms_broadcasts (title, body, channel, segment, recipient_count, status, sent_at, created_by)
VALUES (
  'July Festival Offer 🎉',
  'Dear customer, enjoy 15% off on all A2 products this week as part of our July celebration. Use code JULY15 at checkout.',
  'whatsapp', 'all', 0, 'sent', datetime('now', '-3 days'), 'Admin'
);

-- Seed a team message
INSERT OR IGNORE INTO comms_team (sender_name, sender_role, body, sent_at)
VALUES ('Admin', 'owner', 'Good morning team! Delivery routes for Sector 5 are updated for today. Please check the deliveries dashboard.', datetime('now', '-6 hours'));
