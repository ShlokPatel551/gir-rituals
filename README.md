# GIR RITUALS — Web App

A premium dairy subscription web prototype for **Gir Rituals** — built from the full product PRD. Covers the complete customer journey from splash → register → daily deliveries → billing → payment.

> **Frontend-only prototype.** All data lives in `localStorage` / `mockData`. No backend required.

---

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Demo credentials

### Customer

| Field    | Value                  |
|----------|------------------------|
| Email    | `demo@girrituals.com`  |
| Password | `Demo@1234`            |

### Admin panel (`/admin/login`)

| Field    | Value                  |
|----------|------------------------|
| Email    | `owner@girrituals.com` |
| Password | `password123`          |
| OTP phone | `9876543210`          |

---

## Features

### Authentication
- Multi-step **Register** (Personal Info → Billing Address → Delivery Address)
- OTP verification — 6-digit code shown in demo banner (5 min expiry, 5 attempts, 60s resend)
- **Forgot password** & **Change password** (both OTP-gated)
- Auto-generated 8-char alphanumeric **Client ID** on registration

### Home
- Auto-scrolling **banner carousel** (4s, dot indicators, tap to navigate)
- **Daily Rituals** — active deliveries with status badges (Pending / Out for Delivery / Delivered / Paused / Extra)
- **Pause / Resume** delivery per ritual (today only, no charge applied)
- **Add Extra** modal — choose product + quantity for today
- **Our Products** grid with View All link

### Schedule
- Monthly **calendar** with color-coded dot indicators:
  - 🟢 Green = Delivered · 🟡 Amber = Paused · 🔴 Red = Cancelled · ★ = Extra
- **Month navigation** (← →) with correct days per month
- Per-day schedule table (Product, Qty, Rate, Total, Status)
- **Monthly summary** — Milk delivered (L), Ghee (kg), Extras, Paused days
- **GST (5%)** shown as separate line · **Pay Now** button pre-fills total

### My Bills
- **Paid Bills** tab — payment date, method, Download Invoice button
- **Unpaid Bills** tab — expandable **itemized breakdown** (line items + GST), Pay Now
- **Monthly Statement** tab — bank-style chronological log (deliveries, extras, pauses, payments, refunds, store credits), filter by month, Download PDF
- **Wallet balance** card — apply store credit at checkout

### Cart & Checkout
- Qty controls, per-item total, delivery address preview
- 4-step checkout: Order Review (with GST) → Delivery Address → Payment Method → Summary
- **Wallet / store credit** toggle in step 3
- Payment methods: UPI · Net Banking · Credit/Debit Card · Pay Monthly

### Payment
- Method selection (saved UPI/cards + manual entry + Net Banking + Pay Monthly)
- **Wallet balance** deduction before net payable
- **GST line** on order summary
- Payment Success / Failure screens with retry flow

### Refund & Store Credit
- Request refund via Order Detail → Contact Us
- **Add Store Credit** to wallet (demo button in Statement tab)
- Wallet used at checkout or payment screen

### Profile & Account Settings
- Avatar with initials + wallet balance display
- **Personal Info** — edit name, email, phone
- **Change Password** — OTP-verified
- **Billing Address** — separate from delivery address
- **Delivery Address** — edit and save
- **Payment Methods** — view, set default, add (UPI/Card/Net Banking), remove

### Orders & History
- Active Orders / Order History tabs
- Order Detail — product, qty, dates, total delivered/paused/billed, timeline, Refund button

### Offers
- Current offers with **urgency countdown** ("Ends in Xd")
- Upcoming offers with **"Starts in X days"** countdown

### Notifications
- Chronological list, unread dot indicator, Mark All Read, tap to navigate

### Favourites
- Heart toggle across Products, Product Detail, and Favourites grid

### About & Contact
- Brand story, Gir cow heritage
- WhatsApp, Instagram, Email, Phone links

### Admin Panel
- Dashboard stats · Customers table · OTP Logs

---

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + TypeScript |
| Routing | React Router 7 |
| Build | Vite 8 |
| Styling | CSS Modules + M3 / Google Stitch tokens |
| State | React Context + `useState` |
| Storage | `localStorage` (customers, OTPs, session) |

---

## Project structure

```
src/
├── pages/          # All screens (customer + admin)
├── components/     # Layout, BottomNav, Sidebar, OtpInput
├── context/        # AppContext — global state & actions
├── data/           # mockData.ts — products, bills, banners, statements
├── lib/            # customerStore, otpService, adminAuth
├── types/          # Shared TypeScript interfaces
└── styles/         # stitch-theme.css, admin-theme.css
```

---

## Notes

- OTP is **simulated locally** — no real SMS or WhatsApp. Replace `otpService` with an API call for production.
- All monetary values in **INR (₹)** with 2-decimal precision.
- GST shown at 5% (flat demo rate — adjust per category in production).
- Wallet balance persists in React state only (resets on refresh in prototype).
