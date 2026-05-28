const CUSTOMERS_KEY = "gir_customers";
const PENDING_KEY = "gir_pending_registration";
function hashPassword(password) {
  return btoa(`gir:${password}`);
}
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}
function loadCustomers() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveCustomers(customers) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}
function savePendingRegistration(data) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(data));
}
function getPendingRegistration() {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function clearPendingRegistration() {
  sessionStorage.removeItem(PENDING_KEY);
}
function findCustomerByEmail(email) {
  return loadCustomers().find((c) => c.email.toLowerCase() === email.toLowerCase());
}
function findCustomerByPhone(phone) {
  return loadCustomers().find((c) => c.phone === phone);
}
function emailExists(email) {
  return !!findCustomerByEmail(email);
}
function registerCustomer(user, password) {
  const customers = loadCustomers();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const customer = {
    ...user,
    passwordHash: hashPassword(password),
    createdAt: now,
    verifiedAt: now
  };
  saveCustomers([customer, ...customers.filter((c) => c.email !== customer.email)]);
  return customer;
}
function getAllCustomers() {
  return loadCustomers();
}
function authenticateCustomer(email, password) {
  const customer = findCustomerByEmail(email);
  if (!customer || !verifyPassword(password, customer.passwordHash)) return null;
  return customer;
}
function updateCustomerPassword(email, newPassword) {
  const customers = loadCustomers();
  const idx = customers.findIndex((c) => c.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return false;
  customers[idx] = { ...customers[idx], passwordHash: hashPassword(newPassword) };
  saveCustomers(customers);
  return true;
}
function generateClientId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const customers = loadCustomers();
  let id;
  do {
    id = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (customers.some((c) => c.clientId === id));
  return id;
}
const DEMO_EMAIL = "demo@girrituals.com";
function seedDemoCustomer() {
  if (findCustomerByEmail(DEMO_EMAIL)) return;
  const user = {
    clientId: "GR7K2M9X",
    firstName: "Demo",
    lastName: "Customer",
    email: DEMO_EMAIL,
    phone: "9876543210",
    billingAddress: { street: "12 Farm Lane", city: "Ahmedabad", state: "Gujarat", pinCode: "380001" },
    deliveryAddress: { street: "12 Farm Lane", city: "Ahmedabad", state: "Gujarat", pinCode: "380001" }
  };
  registerCustomer(user, "Demo@1234");
}
const DEMO_CUSTOMER_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: "Demo@1234"
};
export {
  DEMO_CUSTOMER_CREDENTIALS,
  authenticateCustomer,
  clearPendingRegistration,
  emailExists,
  findCustomerByEmail,
  findCustomerByPhone,
  generateClientId,
  getAllCustomers,
  getPendingRegistration,
  hashPassword,
  registerCustomer,
  savePendingRegistration,
  seedDemoCustomer,
  updateCustomerPassword,
  verifyPassword
};
