import { api, setToken, clearToken, refreshSession } from './api';

// In-memory admin session — never written to localStorage
let _adminSession = null;

export function getAdminSession() { return _adminSession; }
export function isAdminLoggedIn() { return !!_adminSession?.isAdmin; }

export function setAdminSession(token) {
  if (!token) { _adminSession = null; return; }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    _adminSession = { name: payload.name, email: payload.email, isAdmin: !!payload.isAdmin, adminRole: payload.adminRole || 'owner' };
    setToken(token);
  } catch {
    _adminSession = null;
  }
}

export async function restoreAdminSession() {
  try {
    const token = await refreshSession();
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.isAdmin) throw new Error('Not an admin token');
    _adminSession = { name: payload.name, email: payload.email, isAdmin: true, adminRole: payload.adminRole || 'owner' };
    return true;
  } catch {
    return false;
  }
}

export function getAdminRole() {
  return _adminSession?.adminRole || 'owner';
}

export async function logoutAdmin() {
  try { await api.logout(); } catch {}
  clearToken();
  _adminSession = null;
}
