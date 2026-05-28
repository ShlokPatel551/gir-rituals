export type DeliveryStatus = 'Pending' | 'Out for Delivery' | 'Delivered' | 'Paused' | 'Cancelled' | 'Extra' | 'No Order' | 'Paid' | 'Unpaid';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  benefits: string[];
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  linkType: 'offer' | 'product';
  linkId: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  validUntil: string;
  products: string[];
  upcoming?: boolean;
  promoCode?: string;
}

export interface RitualItem {
  id: string;
  productId: string;
  quantity: number;
  status: DeliveryStatus;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: Address;
  deliveryAddress: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface ScheduleEntry {
  date: string;
  productName: string;
  qty: number;
  rate: number;
  status: DeliveryStatus;
}

export interface Bill {
  id: string;
  period: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  method?: string;
  status: 'paid' | 'unpaid';
}

export interface Order {
  id: string;
  productName: string;
  qty: number;
  startDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export type StatementType = 'delivery' | 'extra' | 'pause' | 'payment' | 'refund' | 'store_credit';

export interface StatementEntry {
  id: string;
  date: string;
  type: StatementType;
  description: string;
  amount: number;
  credit: boolean;
  month: string;
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'netbanking';
  label: string;
  isDefault: boolean;
}

export interface BillLineItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}
