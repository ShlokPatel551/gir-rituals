CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_settings (key, value) VALUES
  ('twilio_account_sid',   ''),
  ('twilio_auth_token',    ''),
  ('twilio_whatsapp_from', ''),
  ('twilio_sms_from',      ''),
  ('gst_cgst',             '9'),
  ('gst_sgst',             '9'),
  ('gst_igst',             '18'),
  ('holidays',             '[]');
