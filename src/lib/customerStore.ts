import type { PendingRegistration, StoredCustomer } from '../types/auth';
import type { User } from '../types';

const CUSTOMERS_KEY = 'gir_customers';
const PENDING_KEY = 'gir_pending_registration';

/** Demo-only encoding — replace with server-side hashing in production */
export function hashPassword(password: string): string {
  return btoa(`gir:${password}`);
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

function loadCustomers(): StoredCustomer[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCustomers(customers: StoredCustomer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function savePendingRegistration(data: PendingRegistration) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(data));
}

export function getPendingRegistration(): PendingRegistration | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  sessionStorage.removeItem(PENDING_KEY);
}

export function findCustomerByEmail(email: string): StoredCustomer | undefined {
  return loadCustomers().find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export function findCustomerByPhone(phone: string): StoredCustomer | undefined {
  return loadCustomers().find((c) => c.phone === phone);
}

export function emailExists(email: string): boolean {
  return !!findCustomerByEmail(email);
}

export function registerCustomer(user: User, password: string): StoredCustomer {
  const customers = loadCustomers();
  const now = new Date().toISOString();
  const customer: StoredCustomer = {
    ...user,
    passwordHash: hashPassword(password),
    createdAt: now,
    verifiedAt: now,
  };
  saveCustomers([customer, ...customers.filter((c) => c.email !== customer.email)]);
  return customer;
}

export function getAllCustomers(): StoredCustomer[] {
  return loadCustomers();
}

export function authenticateCustomer(email: string, password: string): StoredCustomer | null {
  const customer = findCustomerByEmail(email);
  if (!customer || !verifyPassword(password, customer.passwordHash)) return null;
  return customer;
}

export function updateCustomerPassword(email: string, newPassword: string): boolean {
  const customers = loadCustomers();
  const idx = customers.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return false;
  customers[idx] = { ...customers[idx], passwordHash: hashPassword(newPassword) };
  saveCustomers(customers);
  return true;
}

export function generateClientId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const customers = loadCustomers();
  let id: string;
  do {
    id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (customers.some((c) => c.clientId === id));
  return id;
}

const DEMO_EMAIL = 'demo@girrituals.com';

/** Ensures a test customer exists for login without registering */
export function seedDemoCustomer(): void {
  if (findCustomerByEmail(DEMO_EMAIL)) return;
  const user: User = {
    clientId: 'GR7K2M9X',
    firstName: 'Demo',
    lastName: 'Customer',
    email: DEMO_EMAIL,
    phone: '9876543210',
    billingAddress: { street: '12 Farm Lane', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380001' },
    deliveryAddress: { street: '12 Farm Lane', city: 'Ahmedabad', state: 'Gujarat', pinCode: '380001' },
  };
  registerCustomer(user, 'Demo@1234');
}

export const DEMO_CUSTOMER_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: 'Demo@1234',
};
