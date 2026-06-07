import { DatabaseSync } from 'node:sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// On Render, /data is a persistent disk mount. Locally, db sits next to server/.
const DB_PATH = process.env.DB_PATH
  || (process.env.NODE_ENV === 'production' ? '/data/gir_rituals.db' : join(__dirname, 'gir_rituals.db'));
const rawDb = new DatabaseSync(DB_PATH);

// node:sqlite returns BigInt for integers; normalise everything to Number
function coerce(row) {
  if (!row) return row;
  const r = {};
  for (const [k, v] of Object.entries(row)) r[k] = typeof v === 'bigint' ? Number(v) : v;
  return r;
}

rawDb.exec('PRAGMA journal_mode = WAL');
rawDb.exec('PRAGMA foreign_keys = ON');

rawDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL, last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL, phone TEXT,
    password_hash TEXT NOT NULL,
    wallet_balance REAL DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, type TEXT NOT NULL,
    street TEXT, city TEXT, state TEXT, pin_code TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL, category TEXT DEFAULT 'dairy',
    price REAL NOT NULL, unit TEXT NOT NULL,
    image TEXT, description TEXT,
    benefits TEXT DEFAULT '[]', in_stock INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL, product_id TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1, frequency TEXT DEFAULT 'daily',
    status TEXT DEFAULT 'active', start_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id TEXT NOT NULL, date DATE NOT NULL,
    quantity REAL, status TEXT DEFAULT 'Pending',
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL, product_name TEXT NOT NULL,
    qty INTEGER DEFAULT 1, start_date DATE,
    status TEXT DEFAULT 'active', total REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL, period TEXT NOT NULL,
    amount REAL NOT NULL, status TEXT DEFAULT 'unpaid',
    due_date DATE, paid_date DATE, payment_method TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id TEXT NOT NULL, description TEXT,
    qty INTEGER DEFAULT 1, rate REAL, amount REAL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
    valid_until DATE, products TEXT DEFAULT '[]',
    upcoming INTEGER DEFAULT 0, promo_code TEXT, is_active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY, title TEXT NOT NULL,
    image TEXT, link_type TEXT, link_id TEXT
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, user_id INTEGER NOT NULL,
    title TEXT NOT NULL, message TEXT,
    is_read INTEGER DEFAULT 0, link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS payment_methods (
    id TEXT PRIMARY KEY, user_id INTEGER NOT NULL,
    type TEXT, label TEXT NOT NULL, is_default INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS statement_entries (
    id TEXT PRIMARY KEY, user_id INTEGER NOT NULL,
    date DATE NOT NULL, type TEXT, description TEXT,
    amount REAL, credit INTEGER DEFAULT 0, month TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL, code TEXT NOT NULL,
    purpose TEXT, attempts INTEGER DEFAULT 0, used INTEGER DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Compatibility wrapper — same interface as better-sqlite3
const db = {
  exec: (sql) => rawDb.exec(sql),
  pragma: () => {},
  prepare: (sql) => {
    const stmt = rawDb.prepare(sql);
    return {
      run: (...p) => {
        const { lastInsertRowid, changes } = stmt.run(...p);
        return { lastInsertRowid: Number(lastInsertRowid), changes };
      },
      get:  (...p) => coerce(stmt.get(...p)),
      all:  (...p) => stmt.all(...p).map(coerce),
    };
  },
};

export default db;
