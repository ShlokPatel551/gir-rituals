# GIR RITUALS

A full-stack Progressive Web App for Gir cow A2 dairy subscription management — built for artisanal dairy farms to manage subscriptions, deliveries, production, and billing through a customer-facing app and a comprehensive admin panel.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 7 |
| Backend | Express.js (Node.js ESM) |
| Database | SQLite via Node.js built-in `node:sqlite` |
| Auth | JWT, Google OAuth (`@react-oauth/google`), Apple Sign In |
| Styling | Plain CSS with CSS custom properties (Earth & Heritage theme) |
| Dev tooling | Vite HMR, Nodemon, Concurrently, ESLint |

---

## Features

### Customer App
- **Google & Apple Sign In** — OAuth 2.0 + Apple JWKS verification (no extra packages)
- **Product catalogue** — browse A2 milk, ghee, paneer, curd with filtering and search
- **Favourites** — persistent wishlist stored in `localStorage`
- **Cart & Checkout** — per-item delivery type selector (Daily Ritual vs Just for Today)
- **Subscription / Ritual management** — pause, resume, add extra deliveries
- **Notifications** — event-driven (delivery, payment, offer, info) with today / this week / older timeline grouping
- **Bills & Invoices** — view billing history, download branded PDF invoices via browser print
- **Wallet & Statement** — transaction history with monthly filter and PDF download
- **Profile & Addresses** — manage billing and delivery addresses, payment methods

### Admin Panel
- **Dashboard** — daily income, active subscriptions, delivery status overview
- **Production management** — daily entry form, finalized production log, leftover stock reconciliation, stock history ledger with shared cross-page navigation strip
- **Order & Delivery management** — track, assign, and update delivery status
- **Customer management** — view profiles, billing history, transaction logs, and orders
- **Offers & Campaigns** — create and manage promotional offers
- **Finance** — revenue reports, refunds, payment reconciliation
- **Settings** — farm profile, delivery zones, pricing configuration

---

## Project Structure

```
gir-rituals/
├── server/                      # Express.js backend
│   ├── db.js                    # SQLite schema & migrations
│   ├── index.js                 # Server entry point + demo data seed
│   ├── seed.js                  # Full database seed script
│   ├── lib/
│   │   └── notify.js            # Event-driven notification helper
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   └── routes/
│       ├── auth.js              # Login, register, Google OAuth, Apple Sign In
│       ├── user.js              # Profile, addresses, payment methods
│       ├── products.js          # Product catalogue
│       ├── offers.js            # Offers & promotions
│       ├── rituals.js           # Subscriptions (pause / resume / add extra)
│       ├── orders.js            # Orders & cancellations
│       ├── bills.js             # Billing & invoice payment
│       ├── notifications.js     # Notifications (list, mark read)
│       ├── schedule.js          # Delivery schedule
│       └── admin.js             # Admin-only endpoints
│
├── src/                         # React frontend
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # Route definitions
│   ├── context/
│   │   ├── AppContext.jsx       # Global state (products, cart, rituals, etc.)
│   │   └── ToastContext.jsx     # Toast notification system
│   ├── lib/
│   │   ├── api.js               # Typed API client (all fetch calls)
│   │   └── googleAuth.js        # Google OAuth helpers
│   ├── components/
│   │   ├── Layout.jsx           # Customer app shell (sidebar, top nav)
│   │   ├── AdminLayout.jsx      # Admin panel shell (sidebar, topbar)
│   │   └── ...
│   └── pages/
│       ├── Login.jsx            # Email + Google + Apple Sign In
│       ├── Register.jsx
│       ├── Home.jsx
│       ├── Products.jsx
│       ├── ProductDetail.jsx
│       ├── Cart.jsx             # Cart with Daily Ritual / Just for Today selector
│       ├── Checkout.jsx
│       ├── Favourites.jsx
│       ├── Bills.jsx            # Bills + PDF invoice download
│       ├── Notifications.jsx    # Timeline-grouped notification center
│       ├── Schedule.jsx
│       ├── Profile.jsx
│       └── admin/
│           ├── AdminDashboard.jsx
│           ├── AdminProduction.jsx
│           ├── AdminProductionLog.jsx
│           ├── AdminLeftoverStock.jsx
│           ├── AdminStockLedger.jsx
│           ├── AdminProductionNav.jsx  # Shared cross-navigation strip
│           ├── AdminOrders.jsx
│           ├── AdminCustomers.jsx
│           └── ...
│
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js 22+** — required for `node:sqlite` built-in
- **npm 10+**

### Installation

```bash
git clone https://github.com/ShlokPatel551/gir-rituals.git
cd gir-rituals
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# JWT
JWT_SECRET=your_jwt_secret_here

# Google OAuth  (get from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Apple Sign In  (get from Apple Developer Console)
VITE_APPLE_CLIENT_ID=com.yourcompany.girrituals
VITE_APPLE_REDIRECT_URI=https://yourdomain.com/auth/apple/callback

# Server
PORT=3001
```

### Seed the Database

```bash
npm run seed
```

Creates `server/gir_rituals.db` with demo products, offers, a demo user, subscriptions, bills, and orders.

**Demo login credentials**

| Role | Email | Password |
|------|-------|----------|
| Customer | `demo@girrituals.com` | `demo123` |
| Admin | `owner@girrituals.com` | `admin123` |

### Run in Development

```bash
# Run both frontend (port 5173) and backend (port 3001) together
npm run dev:full

# Or run them separately
npm run dev         # Vite dev server  →  http://localhost:5173
npm run server:dev  # Express + nodemon →  http://localhost:3001
```

### Build for Production

```bash
npm run build
npm run preview    # Preview the production build locally
```

### Run as a Single Server (Production Mode)

In production the Express server serves both the API and the React frontend:

```bash
npm run build      # Build Vite → dist/
npm start          # Express serves dist/ + /api/* at one port
```

---

## Deployment (Netlify + Render — both free)

The frontend deploys to **Netlify** and the backend API deploys to **Render**. Both connect to the same GitHub repo.

### Step 1 — Deploy the API on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo (`gir-rituals`)
3. Render auto-detects `render.yaml` — confirm the settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add these environment variables:

   | Variable | Value |
   |----------|-------|
   | `NODE_VERSION` | `22` |
   | `JWT_SECRET` | any long random string |
   | `ALLOWED_ORIGINS` | `https://your-app.netlify.app` *(update after step 2)* |

5. Click **Create Web Service** — Render gives you a URL like `https://gir-rituals-api.onrender.com`

> **Note:** The free tier spins down after 15 min of inactivity. First request after sleep takes ~30 seconds. Upgrade to the $7/month plan for always-on hosting.

---

### Step 2 — Deploy the Frontend on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
2. Connect GitHub and select this repo — Netlify auto-detects `netlify.toml`
3. Add these environment variables in **Site configuration → Environment variables**:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://gir-rituals-api.onrender.com` *(your Render URL from step 1)* |
   | `VITE_GOOGLE_CLIENT_ID` | your Google OAuth client ID |

4. Click **Deploy** — Netlify runs `npm run build` and publishes `dist/`

---

### Step 3 — Wire the two services together

1. Copy your Netlify URL (e.g. `https://gir-rituals.netlify.app`)
2. In your Render service → **Environment** → update `ALLOWED_ORIGINS` to that URL
3. Trigger a Render redeploy

Both services now talk to each other. Any push to `main` automatically redeploys both.

> **SQLite note:** Render's free tier uses an ephemeral filesystem — the database is reset on each redeploy. The server auto-seeds on startup so the demo data always comes back. For persistent data, upgrade to a Render paid plan (which supports persistent disks) or migrate to a hosted database like [Supabase](https://supabase.com) (free tier).

---

## API Overview

All endpoints are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Email / password login |
| POST | `/api/auth/register` | — | New account registration |
| POST | `/api/auth/google` | — | Google OAuth token exchange |
| POST | `/api/auth/apple` | — | Apple Sign In token verification |
| GET | `/api/products` | — | List all products |
| GET | `/api/offers` | — | List active offers |
| GET | `/api/user/profile` | ✓ | Get user profile |
| PUT | `/api/user/profile` | ✓ | Update profile & addresses |
| GET | `/api/rituals` | ✓ | List subscriptions |
| PUT | `/api/rituals/:id/pause` | ✓ | Pause a subscription |
| PUT | `/api/rituals/:id/resume` | ✓ | Resume a subscription |
| GET | `/api/orders` | ✓ | List orders |
| DELETE | `/api/orders/:id` | ✓ | Cancel an order |
| GET | `/api/bills` | ✓ | List bills |
| POST | `/api/bills/:id/pay` | ✓ | Pay a bill |
| GET | `/api/notifications` | ✓ | List notifications |
| PUT | `/api/notifications/:id/read` | ✓ | Mark a notification as read |
| PUT | `/api/notifications/read-all` | ✓ | Mark all notifications as read |

---

## Design System — Earth & Heritage

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#7B5233` | Buttons, active states, accents |
| Surface | `#FDF9F5` | Page backgrounds |
| Secondary | `#A08060` | Secondary text, borders |
| Error | `#C62828` | Destructive actions |
| On-surface | `#1C1C1E` | Body text |

Icons are Google Material Symbols (outlined). Typography uses a serif/sans-serif pairing for a premium artisanal feel.

---

## Implementation Notes

- **Apple Sign In** is verified server-side without any extra npm packages: Node's built-in `crypto.createPublicKey` converts Apple's JWKS → PEM, then `jsonwebtoken` verifies the token.
- **Invoice PDFs** are generated client-side using `window.open()` + `window.print()` with a fully branded HTML template — no server-side PDF library needed.
- **Event-driven notifications** — `server/lib/notify.js` is called from routes (bill pay, order cancel, ritual pause/resume, registration) and inserts notification rows automatically.
- **Favourites** are persisted to `localStorage` under key `gir_favourites` — no backend API required.
- **Cart delivery type** — per-item state (Daily Ritual vs Just for Today) is stored in component state and reflected in the checkout order summary.

---

## License

Private — All rights reserved. GIR RITUALS © 2026.
