# GIR RITUALS

A full-featured progressive web app (PWA) for a Gir cow dairy subscription service — milk, ghee, and more, delivered daily.

Built with **React 19 + TypeScript + Vite**. Frontend-only prototype — all data lives in `mockData` / `localStorage`. No backend required.

---

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Demo Credentials

| Role | Email | Password | OTP |
|------|-------|----------|-----|
| Customer | `demo@girrituals.com` | `Demo@1234` | — |
| Admin | `owner@girrituals.com` | `password123` | `9876543210` |

---

## Features

### Authentication
- Multi-step **Register** — Personal Info → Billing Address → Delivery Address
- OTP verification — 6-digit code, 5 min expiry, 5 attempts, 60s resend
- **Forgot password** & **Change password** (OTP-gated)
- **Google OAuth** sign-in
- Auto-generated 8-char alphanumeric **Client ID** on registration

### Home
- Auto-scrolling **banner carousel** (4s, dot indicators)
- Brand values strip and brand story section
- **Daily Rituals** — active subscriptions with live status badges (Pending / Out for Delivery / Delivered / Paused / Extra)
- **Pause / Resume** delivery per ritual; **Add Extra** modal for one-off quantities
- Offers section, product grid, testimonials carousel, Why Us section, footer CTA

### Dashboard
- Greeting card, 4 stat tiles (wallet, active rituals, pending bills, loyalty points)
- Rituals widget + recent activity feed + quick links sidebar

### Products
- Inline search, **category filter tabs**, sort dropdown
- Toast notification on add to cart
- **Product Detail** — about, benefits, recipes accordion, subscribe modal, related products

### Offers
- Urgency countdown ("Ends in Xd") · Upcoming offers with "Starts in X days"
- **Promo code** copy button · Expired badge · Offer detail page

### Schedule
- Desktop: two-column layout — calendar left, day detail right
- Mobile: list view with status filter
- Color-coded dot indicators: 🟢 Delivered · 🟡 Paused · 🔴 Cancelled · ★ Extra
- Per-day schedule table (product, qty, rate, total, status)
- Monthly summary — milk (L), ghee (kg), extras, paused days
- **Export** button · Month navigation

### My Bills
- **Paid** / **Unpaid** / **Statement** tabs
- Expandable itemized breakdown with GST · Bulk pay checkboxes · Running balance column
- Bank-style monthly statement — deliveries, pauses, payments, refunds, store credits
- **Wallet balance** card — apply store credit at checkout

### Cart & Checkout
- Qty controls · Save-for-later · Saved items section
- **4-step checkout:** Order Review (with GST) → Delivery Address → Payment Method → Summary
- Wallet / store credit toggle · GST line item

### Payment
- Saved UPI / cards · manual entry · Net Banking · Pay Monthly
- Wallet deduction before net payable
- **Payment Success / Failure** screens with retry flow

### Orders
- Active Orders / Order History tabs
- Order Detail — timeline, refund button, re-order / cancel actions

### Profile & Settings
- Avatar with initials + wallet balance
- Personal Info, Change Password (OTP-verified), Billing Address, Delivery Address
- Payment Methods — view, set default, add (UPI / Card / Net Banking), remove

### Other Pages
- **Favourites** — heart toggle across products, product detail, and favourites grid
- **Notifications** — unread dot, Mark All Read, tap-to-navigate
- **About** — brand story, Gir cow heritage
- **Contact** — WhatsApp, Instagram, Email, Phone links + contact form
- **Flow** — onboarding / feature walkthrough

---

## Admin Panel (`/admin`)

| Section | Description |
|---------|-------------|
| Dashboard | KPI tiles, revenue chart, top products, recent orders |
| Customers | Searchable list + detail with timeline, delivery map, subscription info |
| Orders | Full order management |
| Deliveries | Delivery tracking and route management |
| Products | Product CRUD interface |
| Finance | Revenue and payments overview |
| Billing | Invoice and billing management |
| Analytics | Revenue, subscription, and retention charts |
| Refunds | Refund request management |
| Offers | Create and manage promotional offers |
| Campaigns | Marketing campaign management |
| Comms | Customer communications |
| OTP Logs | Audit trail of all OTP events |
| Settings | App-level configuration |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite 8 |
| Routing | React Router 7 |
| Auth | localStorage + `@react-oauth/google` |
| Styling | CSS custom properties (Google Stitch / M3 tokens) |
| State | React Context — `AppContext` (session, cart, rituals, bills, wallet) + `ToastContext` |
| Data | Mock data + localStorage — no backend |

---

## Project Structure

```
src/
├── components/       # Layout, Sidebar, Footer, BottomNav, ProtectedRoute
├── context/          # AppContext, ToastContext
├── data/             # mockData.ts, adminNotifications.ts
├── lib/              # adminAuth.ts, otpService.ts, customerStore.ts, googleAuth.ts
├── pages/            # All customer-facing pages
│   └── admin/        # All admin pages
├── styles/           # stitch-theme.css (M3 design tokens)
└── types/            # index.ts — shared TypeScript interfaces
```

---

## Theme

Design tokens follow the [Google Stitch](https://stitch.withgoogle.com) / Material 3 system:

- **Fonts:** Fraunces (display headings) + Inter (UI)
- **Colors:** Forest green primary · Warm cream surfaces · Ghee-gold tertiary
- **Shape:** 16–28 px rounded cards, pill buttons
- **Components:** M3 tabs, elevated cards, tonal bottom nav active state

---

## Notes

- OTP is **simulated locally** — no real SMS. Replace `otpService` with an API call for production.
- All monetary values in **INR (₹)** with 2-decimal precision.
- GST shown at 5% flat (adjust per category in production).
- Wallet balance persists in React state only — resets on refresh in prototype.

---

## License

Private project. All rights reserved.
