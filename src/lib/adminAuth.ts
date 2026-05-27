import type { AdminSession } from '../types/auth';

const ADMIN_SESSION_KEY = 'gir_admin_session';
const ADMIN_PENDING_KEY = 'gir_admin_pending';

/** Credentials from Stitch admin login design */
export const DEFAULT_ADMIN = {
  email: 'owner@girrituals.com',
  password: 'password123',
  phone: '9876543210',
  name: 'Gir Rituals Owner',
};

export function validateAdminCredentials(email: string, password: string): boolean {
  return (
    email.toLowerCase().trim() === DEFAULT_ADMIN.email.toLowerCase() &&
    password === DEFAULT_ADMIN.password
  );
}

/** After password step — OTP required before session */
export function setAdminPendingLogin() {
  sessionStorage.setItem(ADMIN_PENDING_KEY, 'true');
}

export function isAdminPendingLogin(): boolean {
  return sessionStorage.getItem(ADMIN_PENDING_KEY) === 'true';
}

export function clearAdminPendingLogin() {
  sessionStorage.removeItem(ADMIN_PENDING_KEY);
}

export function completeAdminLogin(): AdminSession {
  clearAdminPendingLogin();
  const session: AdminSession = {
    email: DEFAULT_ADMIN.email,
    name: DEFAULT_ADMIN.name,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  clearAdminPendingLogin();
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminSession();
}

export function maskAdminPhone(phone: string): string {
  if (phone.length < 10) return phone;
  return `+91 ${phone.slice(0, 5)} XXXXX`;
}
