import type { User } from './index';

export type OtpPurpose = 'register' | 'reset_password' | 'change_password' | 'admin_login';

export interface OtpRecord {
  id: string;
  phone: string;
  email: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  verified: boolean;
}

export interface OtpLogEntry {
  id: string;
  phone: string;
  email: string;
  purpose: OtpPurpose;
  action: 'sent' | 'verified' | 'failed' | 'expired';
  timestamp: string;
  /** Shown in admin panel only (demo SMS simulation) */
  codePreview?: string;
}

export interface PendingRegistration {
  user: Omit<User, 'clientId'>;
  password: string;
}

export interface StoredCustomer extends User {
  passwordHash: string;
  createdAt: string;
  verifiedAt: string;
}

export interface AdminSession {
  email: string;
  name: string;
  loggedInAt: string;
}
