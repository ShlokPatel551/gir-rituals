import { findCustomerByEmail, registerCustomer, generateClientId } from './customerStore';
import type { StoredCustomer } from '../types/auth';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

/** True when a Google Client ID is configured in the environment */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
export const googleEnabled = !!GOOGLE_CLIENT_ID;

/**
 * Called after a successful Google OAuth token exchange.
 * Logs in an existing customer or auto-registers a new one.
 * Returns the StoredCustomer so the caller can call login(customer).
 */
export function handleGoogleUser(info: GoogleUserInfo): StoredCustomer {
  const existing = findCustomerByEmail(info.email);
  if (existing) return existing;

  return registerCustomer(
    {
      clientId: generateClientId(),
      firstName: info.given_name || info.name.split(' ')[0] || 'User',
      lastName:  info.family_name  || info.name.split(' ').slice(1).join(' ') || '',
      email:     info.email,
      phone:     '',
      billingAddress:  { street: '', city: '', state: '', pinCode: '' },
      deliveryAddress: { street: '', city: '', state: '', pinCode: '' },
    },
    `google_oauth_${info.sub}`,
  );
}
