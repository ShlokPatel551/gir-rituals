ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';
UPDATE users SET role = 'admin' WHERE is_admin = 1;
