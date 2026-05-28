import db from './db.js';
import bcrypt from 'bcryptjs';

const existing = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (existing.c > 0) { console.log('Already seeded.'); process.exit(0); }

console.log('Seeding database...');

// Products
const ip = db.prepare('INSERT OR IGNORE INTO products (id,name,price,unit,image,description,benefits) VALUES (?,?,?,?,?,?,?)');
ip.run('milk','Pure Gir Cow Milk',70,'litre','🥛','Fresh A2 Gir cow milk delivered daily from our farm in Gir.',JSON.stringify(['A2 protein','Farm fresh daily','No preservatives']));
ip.run('ghee','Traditional Gir Ghee',1200,'kg','🫙','Hand-churned bilona ghee from pure Gir cow milk.',JSON.stringify(['Bilona method','Rich aroma','Ayurvedic quality']));
ip.run('paneer','Fresh Gir Paneer',280,'250g','🧀','Soft, crumbly paneer from pure Gir cow milk.',JSON.stringify(['High protein','No preservatives','Made fresh daily']));
ip.run('curd','Gir Cow Curd',60,'500g','🥣','Thick, probiotic-rich curd set from Gir cow milk.',JSON.stringify(['Probiotic-rich','Digestive aid','Pure A2 milk']));

// Offers
const io = db.prepare('INSERT OR IGNORE INTO offers (id,title,description,valid_until,products,upcoming,promo_code) VALUES (?,?,?,?,?,?,?)');
io.run('o1','Summer Ghee Special','10% off on all ghee orders this month.','2026-06-30',JSON.stringify(['ghee']),0,'GHEE10');
io.run('o2','First Ritual Bonus','Free delivery on your first subscription.','2026-12-31',JSON.stringify(['milk','ghee']),1,'FIRSTFREE');
io.run('o3','Monsoon Combo Offer','Milk + ghee combo at flat ₹150 off.','2026-07-30',JSON.stringify(['milk','ghee']),0,'MONSOON150');

// Banners
const ib = db.prepare('INSERT OR IGNORE INTO banners (id,title,image,link_type,link_id) VALUES (?,?,?,?,?)');
ib.run('b1','Summer Ritual — 10% Off Ghee','🌿','offer','o1');
ib.run('b2','Start Your Daily Milk Ritual','🐄','product','milk');
ib.run('b3','New Season — Farm Fresh','☀️','product','ghee');

// Demo customer
const demoHash = bcrypt.hashSync('Demo@1234', 10);
db.prepare('INSERT OR IGNORE INTO users (client_id,first_name,last_name,email,phone,password_hash,wallet_balance) VALUES (?,?,?,?,?,?,?)')
  .run('GR7K2M9X','Demo','Customer','demo@girrituals.com','9876543210',demoHash,210);
const demo = db.prepare('SELECT id FROM users WHERE email=?').get('demo@girrituals.com');

// Admin
const adminHash = bcrypt.hashSync('password123', 10);
db.prepare('INSERT OR IGNORE INTO users (client_id,first_name,last_name,email,phone,password_hash,is_admin) VALUES (?,?,?,?,?,?,?)')
  .run('GRADMIN01','Admin','Owner','owner@girrituals.com','9876543210',adminHash,1);

if (demo) {
  const uid = demo.id;

  // Addresses
  const ia = db.prepare('INSERT INTO addresses (user_id,type,street,city,state,pin_code) VALUES (?,?,?,?,?,?)');
  ia.run(uid,'billing','12 Farm Lane','Ahmedabad','Gujarat','380001');
  ia.run(uid,'delivery','12 Farm Lane','Ahmedabad','Gujarat','380001');

  // Subscription
  db.prepare('INSERT OR IGNORE INTO subscriptions (id,user_id,product_id,quantity,status,start_date) VALUES (?,?,?,?,?,?)')
    .run('r1',uid,'milk',1,'active','2026-01-01');

  // Bills
  db.prepare('INSERT OR IGNORE INTO bills (id,user_id,period,amount,status,paid_date,payment_method) VALUES (?,?,?,?,?,?,?)')
    .run('bill1',uid,'April 2026',2100,'paid','2026-04-28','UPI');
  db.prepare('INSERT OR IGNORE INTO bills (id,user_id,period,amount,status,due_date) VALUES (?,?,?,?,?,?)')
    .run('bill2',uid,'May 2026',2450,'unpaid','2026-05-31');
  const ii = db.prepare('INSERT INTO bill_items (bill_id,description,qty,rate,amount) VALUES (?,?,?,?,?)');
  ii.run('bill1','Milk (30 days × 1 L × ₹70)',30,70,2100);
  ii.run('bill2','Milk (25 days × 1 L × ₹70)',25,70,1750);
  ii.run('bill2','Ghee extra (0.5 kg)',1,600,600);
  ii.run('bill2','GST (5%)',1,1,100);

  // Orders
  db.prepare('INSERT OR IGNORE INTO orders (id,user_id,product_name,qty,start_date,status,total) VALUES (?,?,?,?,?,?,?)')
    .run('ord1',uid,'Pure Gir Cow Milk (1 L/day)',1,'2026-01-01','active',2100);
  db.prepare('INSERT OR IGNORE INTO orders (id,user_id,product_name,qty,start_date,status,total) VALUES (?,?,?,?,?,?,?)')
    .run('ord2',uid,'Traditional Gir Ghee (0.5 kg)',1,'2026-03-01','completed',600);

  // Payment methods
  const ipm = db.prepare('INSERT OR IGNORE INTO payment_methods (id,user_id,type,label,is_default) VALUES (?,?,?,?,?)');
  ipm.run('pm1',uid,'upi','demo@upi',1);
  ipm.run('pm2',uid,'card','HDFC •••• 4242',0);

  // Notifications
  const in_ = db.prepare('INSERT OR IGNORE INTO notifications (id,user_id,title,message,is_read,link,created_at) VALUES (?,?,?,?,?,?,?)');
  in_.run('n1',uid,'Delivery Confirmed','Your milk (1 L) has been delivered.',0,'/schedule','2026-05-27T08:00:00');
  in_.run('n2',uid,'Bill Generated','Your May 2026 bill of ₹2,450 is ready.',0,'/bills','2026-05-26T10:00:00');
  in_.run('n3',uid,'New Offer','Summer Ghee Special — use code GHEE10.',1,'/offers','2026-05-25T09:00:00');

  // Statement entries
  const is_ = db.prepare('INSERT OR IGNORE INTO statement_entries (id,user_id,date,type,description,amount,credit,month) VALUES (?,?,?,?,?,?,?,?)');
  is_.run('s1',uid,'2026-05-27','delivery','Milk 1 L delivered',70,0,'May 2026');
  is_.run('s2',uid,'2026-05-26','delivery','Milk 1 L delivered',70,0,'May 2026');
  is_.run('s3',uid,'2026-05-25','extra','Ghee 0.5 kg (extra)',600,0,'May 2026');
  is_.run('s4',uid,'2026-05-01','payment','April bill paid via UPI',2100,1,'May 2026');
  is_.run('s5',uid,'2026-04-30','delivery','Milk 1 L delivered',70,0,'April 2026');
}

console.log('✓ Seeded successfully.');
