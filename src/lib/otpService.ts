import type { OtpLogEntry, OtpPurpose, OtpRecord } from '../types/auth';

const OTP_KEY = 'gir_otps';
const OTP_LOG_KEY = 'gir_otp_logs';
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function loadOtps(): OtpRecord[] {
  try {
    return JSON.parse(localStorage.getItem(OTP_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveOtps(records: OtpRecord[]) {
  localStorage.setItem(OTP_KEY, JSON.stringify(records));
}

function loadLogs(): OtpLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(OTP_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

function appendLog(entry: Omit<OtpLogEntry, 'id' | 'timestamp'>) {
  const logs = loadLogs();
  logs.unshift({
    ...entry,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(OTP_LOG_KEY, JSON.stringify(logs.slice(0, 100)));
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function targetKey(phone: string, email: string, purpose: OtpPurpose) {
  return `${purpose}:${phone}:${email.toLowerCase()}`;
}

export interface SendOtpResult {
  ok: boolean;
  error?: string;
  expiresInSeconds?: number;
  /** Demo only — simulates SMS; admin can also see in panel */
  demoCode?: string;
}

export function sendOtp(
  phone: string,
  email: string,
  purpose: OtpPurpose,
): SendOtpResult {
  const now = Date.now();
  const key = targetKey(phone, email, purpose);
  const all = loadOtps();
  const existing = all.find(
    (r) => targetKey(r.phone, r.email, r.purpose) === key && !r.verified,
  );

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return { ok: false, error: `Wait ${wait}s before resending OTP` };
  }

  const code = generateOtpCode();
  const record: OtpRecord = {
    id: `otp-${now}`,
    phone,
    email: email.toLowerCase(),
    code,
    purpose,
    expiresAt: now + OTP_EXPIRY_MS,
    lastSentAt: now,
    attempts: 0,
    verified: false,
  };

  const filtered = all.filter((r) => targetKey(r.phone, r.email, r.purpose) !== key);
  saveOtps([record, ...filtered]);

  appendLog({
    phone,
    email,
    purpose,
    action: 'sent',
    codePreview: code,
  });

  return {
    ok: true,
    expiresInSeconds: OTP_EXPIRY_MS / 1000,
    demoCode: code,
  };
}

export interface VerifyOtpResult {
  ok: boolean;
  error?: string;
}

export function verifyOtp(
  phone: string,
  email: string,
  purpose: OtpPurpose,
  code: string,
): VerifyOtpResult {
  const now = Date.now();
  const key = targetKey(phone, email, purpose);
  const all = loadOtps();
  const idx = all.findIndex((r) => targetKey(r.phone, r.email, r.purpose) === key);

  if (idx === -1) {
    return { ok: false, error: 'No OTP found. Please request a new code.' };
  }

  const record = all[idx];

  if (record.verified) {
    return { ok: false, error: 'OTP already used. Request a new code.' };
  }

  if (now > record.expiresAt) {
    appendLog({ phone, email, purpose, action: 'expired' });
    return { ok: false, error: 'OTP expired. Please resend.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: 'Too many attempts. Please resend OTP.' };
  }

  if (record.code !== code.trim()) {
    record.attempts += 1;
    all[idx] = record;
    saveOtps(all);
    appendLog({ phone, email, purpose, action: 'failed' });
    const left = MAX_ATTEMPTS - record.attempts;
    return { ok: false, error: `Invalid OTP. ${left} attempt(s) left.` };
  }

  record.verified = true;
  all[idx] = record;
  saveOtps(all);
  appendLog({ phone, email, purpose, action: 'verified' });
  return { ok: true };
}

export function getActiveOtps(): OtpRecord[] {
  const now = Date.now();
  return loadOtps().filter((r) => !r.verified && now <= r.expiresAt);
}

export function getOtpLogs(): OtpLogEntry[] {
  return loadLogs();
}

export function getResendCooldownSeconds(phone: string, email: string, purpose: OtpPurpose): number {
  const key = targetKey(phone, email, purpose);
  const record = loadOtps().find((r) => targetKey(r.phone, r.email, r.purpose) === key && !r.verified);
  if (!record) return 0;
  const elapsed = Date.now() - record.lastSentAt;
  if (elapsed >= RESEND_COOLDOWN_MS) return 0;
  return Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
}

export const OTP_EXPIRY_MINUTES = OTP_EXPIRY_MS / 60000;
