import 'dotenv/config';
import express from 'express';
import db from './db.js';
import cors from 'cors';
import authRoutes         from './routes/auth.js';
import productRoutes      from './routes/products.js';
import billRoutes         from './routes/bills.js';
import orderRoutes        from './routes/orders.js';
import offerRoutes        from './routes/offers.js';
import notificationRoutes from './routes/notifications.js';
import ritualRoutes       from './routes/rituals.js';
import scheduleRoutes     from './routes/schedule.js';
import userRoutes         from './routes/user.js';
import adminRoutes        from './routes/admin.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/bills',         billRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/offers',        offerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rituals',       ritualRoutes);
app.use('/api/schedule',      scheduleRoutes);
app.use('/api/user',          userRoutes);
app.use('/api/admin',         adminRoutes);

// Ensure demo user has enough notification data to showcase the panel
try {
  const demo = db.prepare("SELECT id FROM users WHERE email='demo@girrituals.com'").get();
  if (demo) {
    const count = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id=?').get(demo.id).c;
    if (count < 6) {
      const ins = db.prepare('INSERT OR IGNORE INTO notifications (id,user_id,title,message,is_read,link,created_at) VALUES (?,?,?,?,?,?,?)');
      const ago = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString();
      ins.run('nd1', demo.id, 'Delivery Out for Dispatch', 'Your daily 1 L Gir Cow Milk is out for delivery and will reach you by 7:30 AM.', 0, '/schedule', ago(2));
      ins.run('nd2', demo.id, 'Bill Due Soon', 'Your May 2026 bill of ₹2,450 is due on May 31st. Pay now to avoid service interruption.', 0, '/bills', ago(26));
      ins.run('nd3', demo.id, 'Delivery Rescheduled', "Tomorrow's milk delivery has been rescheduled to 7:00 AM due to route optimisation.", 1, '/schedule', ago(72));
      ins.run('nd4', demo.id, 'Monsoon Combo Offer', 'Get Milk + Ghee combo at flat ₹150 off this monsoon. Use code MONSOON150 at checkout.', 0, '/offers', ago(120));
      ins.run('nd5', demo.id, 'Wallet Recharged', '₹500 has been credited to your Gir Rituals wallet. Current balance: ₹710.', 1, '/profile', ago(200));
      ins.run('nd6', demo.id, 'April Bill Paid', 'Your April 2026 bill of ₹2,100 has been paid successfully via UPI. Thank you!', 1, '/bills', ago(900));
    }
  }
} catch {}

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'GIR RITUALS API v1' }));

app.listen(PORT, () => console.log(`🐄 GIR RITUALS API → http://localhost:${PORT}`));
