import type { Banner, Bill, BillLineItem, Notification, Offer, Order, PaymentMethod, Product, RitualItem, StatementEntry } from '../types';

export const products: Product[] = [
  {
    id: 'milk',
    name: 'Pure Gir Cow Milk',
    price: 70,
    unit: 'litre',
    image: '🥛',
    description: 'Fresh A2 Gir cow milk delivered daily from our farm in Gir.',
    benefits: ['A2 protein', 'Farm fresh daily', 'No preservatives'],
  },
  {
    id: 'ghee',
    name: 'Traditional Gir Ghee',
    price: 1200,
    unit: 'kg',
    image: '🫙',
    description: 'Hand-churned bilona ghee from pure Gir cow milk.',
    benefits: ['Bilona method', 'Rich aroma', 'Ayurvedic quality'],
  },
];

export const banners: Banner[] = [
  { id: 'b1', title: 'Summer Ritual — 10% Off Ghee', image: '🌿', linkType: 'offer', linkId: 'o1' },
  { id: 'b2', title: 'Start Your Daily Milk Ritual', image: '🐄', linkType: 'product', linkId: 'milk' },
  { id: 'b3', title: 'New Season — Farm Fresh', image: '☀️', linkType: 'product', linkId: 'ghee' },
];

export const offers: Offer[] = [
  {
    id: 'o1',
    title: 'Summer Ghee Special',
    description: '10% off on all ghee orders this month.',
    validUntil: '2026-06-30',
    products: ['ghee'],
  },
  {
    id: 'o2',
    title: 'First Ritual Bonus',
    description: 'Free delivery on your first subscription.',
    validUntil: '2026-12-31',
    products: ['milk', 'ghee'],
    upcoming: true,
  },
];

export const initialRituals: RitualItem[] = [
  { id: 'r1', productId: 'milk', quantity: 1, status: 'Pending' },
];

export const sampleBills: Bill[] = [
  { id: 'bill1', period: 'April 2026', amount: 2100, paidDate: '2026-04-28', method: 'UPI', status: 'paid' },
  { id: 'bill2', period: 'May 2026', amount: 2450, dueDate: '2026-05-31', status: 'unpaid' },
];

export const billLineItems: Record<string, BillLineItem[]> = {
  bill1: [
    { description: 'Milk (30 days × 1 L × ₹70)', qty: 30, rate: 70, amount: 2100 },
  ],
  bill2: [
    { description: 'Milk (25 days × 1 L × ₹70)', qty: 25, rate: 70, amount: 1750 },
    { description: 'Ghee extra (1 × 0.5 kg × ₹1200)', qty: 1, rate: 600, amount: 600 },
    { description: 'GST (5%)', qty: 1, rate: 1, amount: 100 },
  ],
};

export const sampleStatements: StatementEntry[] = [
  { id: 's1', date: '2026-05-27', type: 'delivery', description: 'Milk 1 L delivered', amount: 70, credit: false, month: 'May 2026' },
  { id: 's2', date: '2026-05-26', type: 'delivery', description: 'Milk 1 L delivered', amount: 70, credit: false, month: 'May 2026' },
  { id: 's3', date: '2026-05-25', type: 'pause', description: 'Delivery paused', amount: 0, credit: false, month: 'May 2026' },
  { id: 's4', date: '2026-05-24', type: 'extra', description: 'Extra Ghee 0.5 kg', amount: 600, credit: false, month: 'May 2026' },
  { id: 's5', date: '2026-05-20', type: 'delivery', description: 'Milk 1 L delivered', amount: 70, credit: false, month: 'May 2026' },
  { id: 's6', date: '2026-04-28', type: 'payment', description: 'Payment received — April bill', amount: 2100, credit: true, month: 'April 2026' },
  { id: 's7', date: '2026-04-15', type: 'refund', description: 'Quality issue — partial refund', amount: 140, credit: true, month: 'April 2026' },
  { id: 's8', date: '2026-04-10', type: 'store_credit', description: 'Store credit added (billing correction)', amount: 70, credit: true, month: 'April 2026' },
];

export const defaultPaymentMethods: PaymentMethod[] = [
  { id: 'pm1', type: 'upi', label: 'demo@upi', isDefault: true },
  { id: 'pm2', type: 'card', label: 'HDFC •••• 4321', isDefault: false },
];

export const sampleOrders: Order[] = [
  { id: 'ORD-7821', productName: 'Pure Gir Cow Milk', qty: 1, startDate: '2026-04-01', status: 'active' },
  { id: 'ORD-6510', productName: 'Traditional Gir Ghee', qty: 0.5, startDate: '2026-03-15', status: 'completed' },
];

export const sampleNotifications: Notification[] = [
  { id: 'n1', title: 'Delivery on the way', message: 'Your Gir Rituals delivery is out for delivery today.', time: '6:00 AM', read: false, link: '/schedule' },
  { id: 'n2', title: 'Payment reminder', message: 'May 2026 bill of ₹2,450 is due.', time: 'Yesterday', read: false, link: '/bills' },
  { id: 'n3', title: 'Order confirmed', message: 'Order ORD-7821 confirmed.', time: '2 days ago', read: true, link: '/orders' },
];
