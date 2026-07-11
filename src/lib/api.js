const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// ── In-memory token store ──────────────────────────────────────────
// Access tokens are NEVER written to localStorage (XSS risk).
// The HttpOnly refresh cookie handles persistence across page loads.
let _token = null;

export function setToken(token) { _token = token; }
export function clearToken()    { _token = null; }
export function getToken()      { return _token; }

// ── Singleton refresh promise (prevents concurrent refresh races) ──
let _refreshPromise = null;

async function doRefresh() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(r => r.json())
    .then(data => {
      if (!data.token) throw new Error('Refresh failed');
      setToken(data.token);
      return data.token;
    })
    .finally(() => { _refreshPromise = null; });
  return _refreshPromise;
}

// Exported so AppContext can call it on mount to restore session from cookie
export async function refreshSession() {
  return doRefresh();
}

async function request(path, options = {}, _isRetry = false) {
  const { method = 'GET', body, headers = {} } = options;
  const token = _token;
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // Auto-refresh on 401, but not if this is already a retry or the refresh endpoint itself
  if (res.status === 401 && !_isRetry && path !== '/auth/refresh') {
    try {
      await doRefresh();
      return request(path, options, true);
    } catch {
      clearToken();
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  login:           (email, password, rememberMe)  => request('/auth/login',           { method: 'POST', body: { email, password, rememberMe: !!rememberMe } }),
  register:        (data)                         => request('/auth/register',         { method: 'POST', body: data }),
  logout:          ()                             => request('/auth/logout',           { method: 'POST' }),
  sendOtp:         (identifier)                   => request('/auth/otp/send',         { method: 'POST', body: { identifier } }),
  verifyOtp:       (identifier, code)             => request('/auth/otp/verify',       { method: 'POST', body: { identifier, code } }),
  googleAuth:      (accessToken)                  => request('/auth/google',           { method: 'POST', body: { accessToken } }),
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
  addPaymentMethod:  (data)  => request('/user/payment-methods',              { method: 'POST',   body: data }),
  deletePaymentMethod: (id)  => request(`/user/payment-methods/${id}`,        { method: 'DELETE' }),
  setDefaultPaymentMethod: (id) => request(`/user/payment-methods/${id}/default`, { method: 'PUT' }),

  // Bills
  getBills: ()         => request('/bills'),
  payBill:  (id, data) => request(`/bills/${id}/pay`, { method: 'POST', body: data }),

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

  // Payments (Razorpay)
  createPaymentOrder: (amount, billId) => request('/payments/create-order', { method: 'POST', body: { amount, billId } }),
  verifyPayment:      (data)           => request('/payments/verify',       { method: 'POST', body: data }),

  // Admin — auth + dashboard
  adminLogin:     (email, password) => request('/admin/login',      { method: 'POST', body: { email, password } }),
  adminDashboard: ()                => request('/admin/dashboard'),

  // Admin — customers
  adminCustomers: (page, limit) => request(`/admin/customers?page=${page||1}&limit=${limit||50}`),
  adminCustomer:  (id)          => request(`/admin/customers/${id}`),

  // Admin — orders
  adminOrders: (page, limit) => request(`/admin/orders?page=${page||1}&limit=${limit||50}`),

  // Admin — billing
  adminBilling: (page, limit) => request(`/admin/billing?page=${page||1}&limit=${limit||50}`),

  // Admin — finance
  adminFinance: () => request('/admin/finance'),

  // Admin — analytics
  adminAnalytics: () => request('/admin/analytics'),

  // Admin — refunds
  adminRefunds: (page, limit) => request(`/admin/refunds?page=${page||1}&limit=${limit||50}`),

  // Admin — team management
  adminTeam:           ()              => request('/admin/team'),
  adminTeamCreate:     (data)          => request('/admin/team',           { method: 'POST',   body: data }),
  adminTeamSetRole:    (id, adminRole) => request(`/admin/team/${id}/role`, { method: 'PATCH',  body: { adminRole } }),
  adminTeamRemove:     (id)            => request(`/admin/team/${id}`,      { method: 'DELETE' }),

  // Admin — deliveries
  adminDeliveries:     (date) => request(`/admin/deliveries?date=${date}`),
  adminDeliveryStatus: (data) => request('/admin/deliveries/status', { method: 'PUT', body: data }),

  // Admin — app settings
  adminSettings:       ()     => request('/admin/settings'),
  adminSaveSettings:   (data) => request('/admin/settings', { method: 'PUT', body: data }),

  // Admin — offers CRUD
  adminOffers:        (status) => request(`/admin/offers${status && status !== 'all' ? `?status=${status}` : ''}`),
  adminCreateOffer:   (data)   => request('/admin/offers',      { method: 'POST',   body: data }),
  adminUpdateOffer:   (id, data) => request(`/admin/offers/${id}`, { method: 'PUT', body: data }),
  adminDeleteOffer:   (id)     => request(`/admin/offers/${id}`, { method: 'DELETE' }),

  // Admin — banners CRUD
  adminBanners:       (status) => request(`/admin/banners${status && status !== 'all' ? `?status=${status}` : ''}`),
  adminCreateBanner:  (data)   => request('/admin/banners',      { method: 'POST',   body: data }),
  adminUpdateBanner:  (id, data) => request(`/admin/banners/${id}`, { method: 'PUT', body: data }),
  adminDeleteBanner:  (id)     => request(`/admin/banners/${id}`, { method: 'DELETE' }),

  // Comms
  adminCommsConversations: ()          => request('/admin/comms/conversations'),
  adminCommsMessages:      (id)        => request(`/admin/comms/conversations/${id}`),
  adminCommsSend:          (id, body)  => request(`/admin/comms/conversations/${id}/messages`, { method: 'POST', body: { body } }),
  adminCommsBroadcasts:    ()          => request('/admin/comms/broadcasts'),
  adminCommsBroadcastSend: (data)      => request('/admin/comms/broadcasts', { method: 'POST', body: data }),
  adminCommsTeam:          ()          => request('/admin/comms/team'),
  adminCommsTeamSend:      (body)      => request('/admin/comms/team', { method: 'POST', body: { body } }),
};
