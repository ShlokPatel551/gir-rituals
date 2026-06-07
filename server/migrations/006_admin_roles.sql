-- Admin sub-roles: owner | manager | accountant
ALTER TABLE users ADD COLUMN admin_role TEXT DEFAULT 'owner';
UPDATE users SET admin_role = 'owner' WHERE is_admin = 1;
