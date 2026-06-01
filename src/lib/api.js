const BASE = '/api';

function getToken() {
  return localStorage.getItem('gir_token');
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  login:           (email, password)              => request('/auth/login',           { method: 'POST', body: { email, password } }),
  register:        (data)                         => request('/auth/register',         { method: 'POST', body: data }),
  sendOtp:         (identifier)                   => request('/auth/otp/send',         { method: 'POST', body: { identifier } }),
  verifyOtp:       (identifier, code)             => request('/auth/otp/verify',       { method: 'POST', body: { identifier, code } }),
  googleAuth:      (email, firstName, lastName)   => request('/auth/google',           { method: 'POST', body: { email, firstName, lastName } }),
  appleAuth:       (identityToken, firstName, lastName, email) => request('/auth/apple', { method: 'POST', body: { identityToken, firstName, lastName, email } }),
  forgotPassword:  (email)                        => request('/auth/forgot-password',  { method: 'POST', body: { email } }),
  resetPassword:   (email, code, newPassword)     => request('/auth/reset-password',   { method: 'POST', body: { email, code, newPassword } }),
  changePassword:  (currentPassword, newPassword) => request('/auth/change-password',  { method: 'POST', body: { currentPassword, newPassword } }),

  // Products
  getProducts: ()   => request('/products'),
  getProduct:  (id) => request(`/products/${id}`),

  // User
  getProfile:        ()      => request('/user/profile'),
  updateProfile:     (data)  => request('/user/profile',    { method: 'PUT',  body: data }),
  getStatement:      (month) => request(`/user/statement${month ? `?month=${encodeURIComponent(month)}` : ''}`),
  addPaymentMethod:  (data)  => request('/user/payment-methods',           { method: 'POST',   body: data }),
  deletePaymentMethod: (id)  => request(`/user/payment-methods/${id}`,     { method: 'DELETE' }),
  setDefaultPaymentMethod: (id) => request(`/user/payment-methods/${id}/default`, { method: 'PUT' }),

  // Bills
  getBills: ()             => request('/bills'),
  payBill:  (id, data)     => request(`/bills/${id}/pay`, { method: 'POST', body: data }),

  // Orders
  getOrders:   ()   => request('/orders'),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'PUT' }),

  // Schedule
  getSchedule: (month) => request(`/schedule${month ? `?month=${encodeURIComponent(month)}` : ''}`),

  // Offers
  getOffers: () => request('/offers'),

  // Notifications
  getNotifications:         ()   => request('/notifications'),
  markAllNotificationsRead: ()   => request('/notifications/read-all', { method: 'PUT' }),
  markNotificationRead:     (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),

  // Rituals / subscriptions
  getRituals:   ()   => request('/rituals'),
  pauseRitual:  (id) => request(`/rituals/${id}/pause`,  { method: 'POST' }),
  resumeRitual: (id) => request(`/rituals/${id}/resume`, { method: 'POST' }),

  // Admin
  adminLogin:     (email, password) => request('/admin/login',           { method: 'POST', body: { email, password } }),
  adminDashboard: ()                => request('/admin/dashboard'),
  adminCustomers: ()                => request('/admin/customers'),
  adminCustomer:  (id)              => request(`/admin/customers/${id}`),
  adminOrders:    ()                => request('/admin/orders'),
};
