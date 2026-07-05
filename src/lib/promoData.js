// Shared promo data: single source of truth for active offers & banners.
// Admin pages manage BANNERS/OFFERS arrays; this file exports what's currently
// "active" so customer pages (Home, Notifications, Layout bell) can reflect it.

export const ACTIVE_BANNERS = [
  {
    id: "pb1",
    category: "Monsoon Special",
    headline: "Pure A2 Milk · Farm Fresh Daily",
    tagline: "Delivered to your door every morning",
    ctaLabel: "Order now",
    bgGradient: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
    emoji: "🥛",
    linkType: "product",
    linkId: "milk",
  },
  {
    id: "pb2",
    category: "Pure & Natural",
    headline: "A2 Cow Ghee · Hand Churned",
    tagline: "No preservatives. No chemicals. Only purity.",
    ctaLabel: "Shop ghee",
    bgGradient: "linear-gradient(135deg, #7a532a 0%, #a07040 100%)",
    emoji: "🧈",
    linkType: "product",
    linkId: "ghee",
  },
];

export const ACTIVE_OFFERS = [
  {
    id: "po1",
    title: "Monsoon Milk Festival",
    deal: "₹60/L",
    badge: "12% OFF",
    desc: "A2 Cow Milk at ₹60/L instead of ₹68/L. Limited period.",
    color: "#2d6a4f",
    emoji: "🥛",
    expiresLabel: "Ends in 10d",
  },
  {
    id: "po2",
    title: "Pure Ghee Weekend Deal",
    deal: "₹550",
    badge: "Save ₹70",
    desc: "Cow Ghee A2 500g at ₹550 instead of ₹620. Weekends only.",
    color: "#b87a1a",
    emoji: "🧈",
    expiresLabel: "Weekends only",
  },
  {
    id: "po3",
    title: "Paneer 3-Pack Offer",
    deal: "Buy 2 Get 1",
    badge: "FREE",
    desc: "Buy 2 packs of Fresh Paneer 250g and get 1 pack free.",
    color: "#2980b9",
    emoji: "🧀",
    expiresLabel: "Today only",
  },
  {
    id: "po4",
    title: "Morning Boost Offer",
    deal: "Free 500ml",
    badge: "BONUS",
    desc: "Order 3L or more A2 Milk and get 500ml free.",
    color: "#6c5ce7",
    emoji: "🥛",
    expiresLabel: "Ends in 15d",
  },
];

// Notifications injected into the customer's notification center
export const PROMO_NOTIFICATIONS = [
  {
    id: "pn1",
    type: "offer",
    read: false,
    title: "Monsoon Milk Festival is Live!",
    message: "Get A2 Cow Milk at ₹60/L instead of ₹68/L. Limited period — order before it ends.",
    time: "Today, 09:00 AM",
    cta: { label: "Claim offer", to: "/offers" },
  },
  {
    id: "pn2",
    type: "offer",
    read: false,
    title: "Ghee Weekend Deal — Save ₹70",
    message: "Cow Ghee A2 500g at ₹550 on weekends only. Subscribe now and save every week.",
    time: "Today, 08:30 AM",
    cta: { label: "View offer", to: "/offers" },
  },
  {
    id: "pn3",
    type: "offer",
    read: false,
    title: "New campaign: Monsoon Fresh Milk",
    message: "A new promotional banner is now live in the app. Tap to explore what's new this season.",
    time: "Today, 08:00 AM",
    cta: { label: "Explore", to: "/home" },
  },
];
