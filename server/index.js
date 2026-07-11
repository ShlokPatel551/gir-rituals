import 'dotenv/config';
import * as Sentry from '@sentry/node';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { runMigrations } from './lib/migrate.js';
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
import paymentRoutes      from './routes/payments.js';
import webhookRoutes      from './routes/webhooks.js';
import { startImapPoller } from './lib/comms-imap.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 3001;

// ── Sentry (init before anything else) ─────────────────────────────
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
}

// ── Logger ─────────────────────────────────────────────────────────
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  ...(process.env.NODE_ENV !== 'production' && {
    transport: { target: 'pino-pretty', options: { colorize: true } },
  }),
});

// ── DB migrations ──────────────────────────────────────────────────
runMigrations();

// Lazy cleanup of expired refresh tokens
try {
  db.exec("DELETE FROM refresh_tokens WHERE expires_at < datetime('now', '-7 days')");
} catch {}

// ── App setup ──────────────────────────────────────────────────────
const app = express();

// Pino HTTP request logger
app.use(pinoHttp({
  logger,
  // Don't log health check noise
  autoLogging: { ignore: (req) => req.url === '/api/health' },
}));

app.use(compression());

// ── CORS ───────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

const DEV_LOCALHOST = /^http:\/\/localhost:\d+$/;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (process.env.NODE_ENV !== 'production' && DEV_LOCALHOST.test(origin)) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Security headers ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com'],
      styleSrc:    ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc:      ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc:  ["'self'", 'https://accounts.google.com', 'https://www.googleapis.com', 'https://appleid.apple.com', 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
      frameSrc:    ["'self'", 'https://api.razorpay.com'],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cookieParser());
app.use(express.json());

// ── Rate limiters ──────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many OTP requests. Please wait 15 minutes.' },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many registration attempts. Please try again later.' },
});

// ── API routes ─────────────────────────────────────────────────────
app.post('/api/auth/login',            loginLimiter);
app.post('/api/admin/login',           loginLimiter);
app.post('/api/auth/register',         registerLimiter);
app.post('/api/auth/otp/send',         otpLimiter);
app.post('/api/auth/forgot-password',  otpLimiter);

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
app.use('/api/payments',      paymentRoutes);
// Webhook routes accept raw bodies (Twilio sends form-encoded)
app.use('/api/webhooks', express.urlencoded({ extended: false }), webhookRoutes);

app.get('/api/health', (_, res) => res.json({
  status: 'ok',
  app: 'GIR RITUALS API v1',
  env: process.env.NODE_ENV || 'development',
  ts: new Date().toISOString(),
}));

// ── Demo notification enrichment ──────────────────────────────────
try {
  const demo = db.prepare("SELECT id FROM users WHERE email='demo@girrituals.com'").get();
  if (demo) {
    const { c } = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id=?').get(demo.id);
    if (c < 6) {
      const ins = db.prepare('INSERT OR IGNORE INTO notifications (id,user_id,title,message,is_read,link,created_at) VALUES (?,?,?,?,?,?,?)');
      const ago = (h) => new Date(Date.now() - h * 3600000).toISOString();
      ins.run('nd1', demo.id, 'Delivery Out for Dispatch',  'Your daily 1 L Gir Cow Milk is out for delivery and will reach you by 7:30 AM.',   0, '/schedule', ago(2));
      ins.run('nd2', demo.id, 'Bill Due Soon',              'Your May 2026 bill of ₹2,450 is due on May 31st. Pay now to avoid interruption.',  0, '/bills',    ago(26));
      ins.run('nd3', demo.id, 'Delivery Rescheduled',       "Tomorrow's milk delivery rescheduled to 7:00 AM due to route optimisation.",        1, '/schedule', ago(72));
      ins.run('nd4', demo.id, 'Monsoon Combo Offer',        'Get Milk + Ghee combo at flat ₹150 off. Use code MONSOON150 at checkout.',          0, '/offers',   ago(120));
      ins.run('nd5', demo.id, 'Wallet Recharged',           '₹500 credited to your Gir Rituals wallet. Current balance: ₹710.',                  1, '/profile',  ago(200));
      ins.run('nd6', demo.id, 'April Bill Paid',            'Your April 2026 bill of ₹2,100 has been paid via UPI. Thank you!',                  1, '/bills',    ago(900));
    }
  }
} catch {}

// ── Serve Vite build (production) ─────────────────────────────────
const distDir = join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (_, res) => res.sendFile(join(distDir, 'index.html')));

// ── Global error handler ───────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (process.env.SENTRY_DSN) Sentry.captureException(err);
  req.log?.error({ err }, `${req.method} ${req.path}`);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

app.listen(PORT, () => {
  logger.info(`GIR RITUALS API → http://localhost:${PORT}`);
  // Start polling Gmail inbox for inbound email replies
  startImapPoller(logger, 30_000);
});
