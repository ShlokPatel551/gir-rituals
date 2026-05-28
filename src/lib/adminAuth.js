const ADMIN_SESSION_KEY = "gir_admin_session";
const ADMIN_PENDING_KEY = "gir_admin_pending";
const DEFAULT_ADMIN = {
  email: "owner@girrituals.com",
  password: "password123",
  phone: "9876543210",
  name: "Gir Rituals Owner"
};
const ADMIN_ACCOUNTS = [
  { email: "owner@girrituals.com", name: "Gir Rituals Owner", role: "Owner", initials: "GR", avatarBg: "#012d1d" },
  { email: "manager@girrituals.com", name: "Delivery Manager", role: "Manager", initials: "DM", avatarBg: "#1b4332" },
  { email: "analytics@girrituals.com", name: "Analytics Viewer", role: "Viewer", initials: "AV", avatarBg: "#7d562d" }
];
function switchAdminAccount(email) {
  const account = ADMIN_ACCOUNTS.find((a) => a.email === email);
  if (!account) return null;
  const session = {
    email: account.email,
    name: account.name,
    loggedInAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}
function validateAdminCredentials(email, password) {
  return email.toLowerCase().trim() === DEFAULT_ADMIN.email.toLowerCase() && password === DEFAULT_ADMIN.password;
}
function setAdminPendingLogin() {
  sessionStorage.setItem(ADMIN_PENDING_KEY, "true");
}
function isAdminPendingLogin() {
  return sessionStorage.getItem(ADMIN_PENDING_KEY) === "true";
}
function clearAdminPendingLogin() {
  sessionStorage.removeItem(ADMIN_PENDING_KEY);
}
function completeAdminLogin() {
  clearAdminPendingLogin();
  const session = {
    email: DEFAULT_ADMIN.email,
    name: DEFAULT_ADMIN.name,
    loggedInAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}
function getAdminSession() {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  clearAdminPendingLogin();
}
function isAdminLoggedIn() {
  return !!getAdminSession();
}
function maskAdminPhone(phone) {
  if (phone.length < 10) return phone;
  return `+91 ${phone.slice(0, 5)} XXXXX`;
}
export {
  ADMIN_ACCOUNTS,
  DEFAULT_ADMIN,
  clearAdminPendingLogin,
  completeAdminLogin,
  getAdminSession,
  isAdminLoggedIn,
  isAdminPendingLogin,
  logoutAdmin,
  maskAdminPhone,
  setAdminPendingLogin,
  switchAdminAccount,
  validateAdminCredentials
};
