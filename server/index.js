import 'dotenv/config';
import express from 'express';
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

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'GIR RITUALS API v1' }));

app.listen(PORT, () => console.log(`🐄 GIR RITUALS API → http://localhost:${PORT}`));
