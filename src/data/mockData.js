const products = [
  {
    id: "milk",
    name: "Pure Gir Cow Milk",
    price: 70,
    unit: "litre",
    image: "\u{1F95B}",
    description: "Fresh A2 Gir cow milk delivered daily from our farm in Gir.",
    benefits: ["A2 protein", "Farm fresh daily", "No preservatives"]
  },
  {
    id: "ghee",
    name: "Traditional Gir Ghee",
    price: 1200,
    unit: "kg",
    image: "\u{1FAD9}",
    description: "Hand-churned bilona ghee from pure Gir cow milk.",
    benefits: ["Bilona method", "Rich aroma", "Ayurvedic quality"]
  }
];
const banners = [
  { id: "b1", title: "Summer Ritual \u2014 10% Off Ghee", image: "\u{1F33F}", linkType: "offer", linkId: "o1" },
  { id: "b2", title: "Start Your Daily Milk Ritual", image: "\u{1F404}", linkType: "product", linkId: "milk" },
  { id: "b3", title: "New Season \u2014 Farm Fresh", image: "\u2600\uFE0F", linkType: "product", linkId: "ghee" }
];
const offers = [
  {
    id: "o1",
    title: "Summer Ghee Special",
    description: "10% off on all ghee orders this month. Use code at checkout to redeem.",
    validUntil: "2026-06-30",
    products: ["ghee"],
    promoCode: "GHEE10"
  },
  {
    id: "o2",
    title: "First Ritual Bonus",
    description: "Free delivery on your first subscription. Limited time offer.",
    validUntil: "2026-12-31",
    products: ["milk", "ghee"],
    upcoming: true,
    promoCode: "FIRSTFREE"
  },
  {
    id: "o3",
    title: "Early Monsoon Offer",
    description: "Special monsoon pack \u2014 milk + ghee combo at flat \u20B9150 off.",
    validUntil: "2026-04-30",
    products: ["milk", "ghee"],
    promoCode: "MONSOON150"
  }
];
const initialRituals = [
  { id: "r1", productId: "milk", quantity: 1, status: "Pending" }
];
const sampleBills = [
  { id: "bill1", period: "April 2026", amount: 2100, paidDate: "2026-04-28", method: "UPI", status: "paid" },
  { id: "bill2", period: "May 2026", amount: 2450, dueDate: "2026-05-31", status: "unpaid" }
];
const billLineItems = {
  bill1: [
    { description: "Milk (30 days \xD7 1 L \xD7 \u20B970)", qty: 30, rate: 70, amount: 2100 }
  ],
  bill2: [
    { description: "Milk (25 days \xD7 1 L \xD7 \u20B970)", qty: 25, rate: 70, amount: 1750 },
    { description: "Ghee extra (1 \xD7 0.5 kg \xD7 \u20B91200)", qty: 1, rate: 600, amount: 600 },
    { description: "GST (5%)", qty: 1, rate: 1, amount: 100 }
  ]
};
const sampleStatements = [
  { id: "s1", date: "2026-05-27", type: "delivery", description: "Milk 1 L delivered", amount: 70, credit: false, month: "May 2026" },
  { id: "s2", date: "2026-05-26", type: "delivery", description: "Milk 1 L delivered", amount: 70, credit: false, month: "May 2026" },
  { id: "s3", date: "2026-05-25", type: "pause", description: "Delivery paused", amount: 0, credit: false, month: "May 2026" },
  { id: "s4", date: "2026-05-24", type: "extra", description: "Extra Ghee 0.5 kg", amount: 600, credit: false, month: "May 2026" },
  { id: "s5", date: "2026-05-20", type: "delivery", description: "Milk 1 L delivered", amount: 70, credit: false, month: "May 2026" },
  { id: "s6", date: "2026-04-28", type: "payment", description: "Payment received \u2014 April bill", amount: 2100, credit: true, month: "April 2026" },
  { id: "s7", date: "2026-04-15", type: "refund", description: "Quality issue \u2014 partial refund", amount: 140, credit: true, month: "April 2026" },
  { id: "s8", date: "2026-04-10", type: "store_credit", description: "Store credit added (billing correction)", amount: 70, credit: true, month: "April 2026" }
];
const defaultPaymentMethods = [
  { id: "pm1", type: "upi", label: "demo@upi", isDefault: true },
  { id: "pm2", type: "card", label: "HDFC \u2022\u2022\u2022\u2022 4321", isDefault: false }
];
const sampleOrders = [
  { id: "ORD-7821", productName: "Pure Gir Cow Milk", qty: 1, startDate: "2026-04-01", status: "active" },
  { id: "ORD-6510", productName: "Traditional Gir Ghee", qty: 0.5, startDate: "2026-03-15", status: "completed" }
];
const sampleNotifications = [
  { id: "n1", title: "Delivery on the way", message: "Your Gir Rituals delivery is out for delivery today.", time: "6:00 AM", read: false, link: "/schedule" },
  { id: "n2", title: "Payment reminder", message: "May 2026 bill of \u20B92,450 is due.", time: "Yesterday", read: false, link: "/bills" },
  { id: "n3", title: "Order confirmed", message: "Order ORD-7821 confirmed.", time: "2 days ago", read: true, link: "/orders" }
];
export {
  banners,
  billLineItems,
  defaultPaymentMethods,
  initialRituals,
  offers,
  products,
  sampleBills,
  sampleNotifications,
  sampleOrders,
  sampleStatements
};
