import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSession } from '../../lib/adminAuth';
import './AdminSettings.css';

/* ── TOTP utilities (RFC 6238 / HMAC-SHA1) ── */
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(bytes: Uint8Array): string {
  let result = '';
  let bits = 0;
  let value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) result += B32[(value << (5 - bits)) & 31];
  return result;
}

function base32Decode(input: string): Uint8Array {
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of input.toUpperCase().replace(/=+$/, '')) {
    const idx = B32.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(out);
}

function generateSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

async function computeTOTP(secret: string, window = 0): Promise<string> {
  const counter = Math.floor(Date.now() / 30_000) + window;
  const msg = new Uint8Array(8);
  let t = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = t & 0xff; t = Math.floor(t / 256); }
  const key = await crypto.subtle.importKey(
    'raw', base32Decode(secret).buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg.buffer as ArrayBuffer));
  const off = sig[19] & 0xf;
  const code = (
    ((sig[off] & 0x7f) << 24) |
    ((sig[off + 1] & 0xff) << 16) |
    ((sig[off + 2] & 0xff) << 8) |
    (sig[off + 3] & 0xff)
  ) % 1_000_000;
  return String(code).padStart(6, '0');
}

async function verifyTOTP(secret: string, code: string): Promise<boolean> {
  for (const w of [-1, 0, 1]) {
    if ((await computeTOTP(secret, w)) === code) return true;
  }
  return false;
}

/* ── Types ── */
type Tab = 'accounts' | 'twofa' | 'whatsapp' | 'sms' | 'gst' | 'holidays';
type TwoFaStep = 'idle' | 'setup' | 'verify' | 'done';

interface AdminUser {
  initials: string;
  name: string;
  email: string;
  role: string;
  roleVariant: 'super' | 'staff';
  avatarBg: string;
  lastLoginDate: string;
  lastLoginTime: string;
}

const ADMINS: AdminUser[] = [
  {
    initials: 'Y',
    name: 'You (Owner)',
    email: 'owner@girrituals.com',
    role: 'Super admin',
    roleVariant: 'super',
    avatarBg: '#ffdcbd',
    lastLoginDate: 'Today',
    lastLoginTime: '09:42 AM',
  },
  {
    initials: 'R',
    name: 'Ravi (Staff)',
    email: 'ravi@girrituals.com',
    role: 'Manager',
    roleVariant: 'staff',
    avatarBg: '#ffdcc4',
    lastLoginDate: '26 May',
    lastLoginTime: '14:15 PM',
  },
  {
    initials: 'S',
    name: 'Sita Sharma',
    email: 'sita.ops@girrituals.com',
    role: 'Accountant',
    roleVariant: 'staff',
    avatarBg: '#e6e1e0',
    lastLoginDate: '24 May',
    lastLoginTime: '10:30 AM',
  },
];

const TABS: { key: Tab; label: string }[] = [
  { key: 'accounts',  label: 'Admin accounts' },
  { key: 'twofa',     label: '2FA Security' },
  { key: 'whatsapp',  label: 'WhatsApp API' },
  { key: 'sms',       label: 'SMS gateway' },
  { key: 'gst',       label: 'GST rates' },
  { key: 'holidays',  label: 'Holiday calendar' },
];

export function AdminSettings() {
  const navigate = useNavigate();
  const admin = getAdminSession();

  const [activeTab, setActiveTab] = useState<Tab>('accounts');
  const [saved, setSaved] = useState(false);

  /* 2FA state */
  const [twoFaEnabled, setTwoFaEnabled] = useState(
    () => localStorage.getItem('gir_2fa_enabled') === 'true',
  );
  const [twoFaStep, setTwoFaStep]     = useState<TwoFaStep>('idle');
  const [totpSecret, setTotpSecret]   = useState('');
  const [otpInput,   setOtpInput]     = useState('');
  const [otpError,   setOtpError]     = useState('');
  const [countdown,  setCountdown]    = useState(30);

  /* Countdown to next TOTP window */
  useEffect(() => {
    const tick = () => setCountdown(30 - (Math.floor(Date.now() / 1000) % 30));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleStart2FA() {
    setTotpSecret(generateSecret());
    setOtpInput('');
    setOtpError('');
    setTwoFaStep('setup');
  }

  async function handleVerify2FA() {
    const valid = await verifyTOTP(totpSecret, otpInput);
    if (valid) {
      localStorage.setItem('gir_2fa_enabled', 'true');
      localStorage.setItem('gir_2fa_secret', totpSecret);
      setTwoFaEnabled(true);
      setTwoFaStep('done');
    } else {
      setOtpError('Incorrect code — check your authenticator app and try again.');
      setOtpInput('');
    }
  }

  function handleDisable2FA() {
    localStorage.removeItem('gir_2fa_enabled');
    localStorage.removeItem('gir_2fa_secret');
    setTwoFaEnabled(false);
    setTwoFaStep('idle');
    setTotpSecret('');
    setOtpInput('');
    setOtpError('');
  }

  const otpauthUri = totpSecret
    ? `otpauth://totp/GirRituals:${admin?.email ?? 'owner@girrituals.com'}?secret=${totpSecret}&issuer=GirRituals&algorithm=SHA1&digits=6&period=30`
    : '';

  const qrUrl = otpauthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(otpauthUri)}`
    : '';

  return (
    <div className="as-page">

      {/* ── Header ── */}
      <div className="as-header">
        <div>
          <h2 className="as-page-title">Settings</h2>
          <p className="as-page-sub">Manage your organization's configuration and administrative access.</p>
        </div>
        <div className="as-header-actions">
          <button type="button" className="as-btn-outline">Documentation</button>
          <button type="button" className="as-btn-filled" onClick={handleSave}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {saved ? 'check' : 'save'}
            </span>
            {saved ? 'Saved!' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* ── Tabbed card ── */}
      <div className="as-tab-card">
        <nav className="as-tabs-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`as-tab ${activeTab === t.key ? 'as-tab-active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.key === 'twofa' && (
                <span className={`as-tab-pill ${twoFaEnabled ? 'as-tab-pill-on' : 'as-tab-pill-off'}`}>
                  {twoFaEnabled ? 'ON' : 'OFF'}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="as-tab-body">

          {/* ── Accounts tab ── */}
          {activeTab === 'accounts' && (
            <div className="as-accounts-content">
              <div className="as-accounts-header">
                <h3 className="as-section-title">Manage Administrators</h3>
                <button type="button" className="as-btn-add">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                  Add new admin account
                </button>
              </div>

              <div className="admin-table-wrap as-admins-table">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Admin name &amp; email</th>
                      <th style={{ textAlign: 'center' }}>Role</th>
                      <th>Last login</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADMINS.map((a) => (
                      <tr key={a.email} className="as-admin-row">
                        <td>
                          <div className="as-user-cell">
                            <div className="as-user-avatar" style={{ background: a.avatarBg }}>
                              {a.initials}
                            </div>
                            <div>
                              <p className="as-user-name">{a.name}</p>
                              <p className="as-user-email">{a.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`as-role-badge ${a.roleVariant === 'super' ? 'as-role-super' : 'as-role-staff'}`}>
                            {a.role}
                          </span>
                        </td>
                        <td>
                          <p className="as-login-date">{a.lastLoginDate}</p>
                          <p className="as-login-time">{a.lastLoginTime}</p>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="as-edit-btn">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="as-info-grid">
                <div className="as-info-card">
                  <span className="material-symbols-outlined as-info-icon as-icon-primary">verified_user</span>
                  <div>
                    <h4 className="as-info-title">Security Enforcement</h4>
                    <p className="as-info-body">
                      All admin accounts require 2FA authentication via TOTP for logging in from new devices.
                    </p>
                    <button
                      type="button"
                      className="as-info-link as-link-primary"
                      onClick={() => setActiveTab('twofa')}
                    >
                      Configure 2FA Settings →
                    </button>
                  </div>
                </div>
                <div className="as-info-card">
                  <span className="material-symbols-outlined as-info-icon as-icon-secondary">history</span>
                  <div>
                    <h4 className="as-info-title">Audit Logs</h4>
                    <p className="as-info-body">
                      Track every action taken by administrators including data exports, deletions, and configuration changes.
                    </p>
                    <button
                      type="button"
                      className="as-info-link as-link-secondary"
                      onClick={() => navigate('/admin/otp')}
                    >
                      View Access Logs →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2FA Security tab ── */}
          {activeTab === 'twofa' && (
            <div className="as-twofa-content">

              {/* Status banner */}
              <div className={`as-twofa-status ${twoFaEnabled ? 'as-twofa-status-on' : 'as-twofa-status-off'}`}>
                <div className="as-twofa-status-left">
                  <span className="material-symbols-outlined as-twofa-status-icon">
                    {twoFaEnabled ? 'verified_user' : 'shield'}
                  </span>
                  <div>
                    <p className="as-twofa-status-title">
                      Two-Factor Authentication is {twoFaEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="as-twofa-status-desc">
                      {twoFaEnabled
                        ? 'Your admin account is protected. TOTP codes rotate every 30 seconds.'
                        : 'Enable TOTP 2FA to secure your admin account with an authenticator app.'}
                    </p>
                  </div>
                </div>
                {twoFaEnabled ? (
                  <button type="button" className="as-twofa-disable-btn" onClick={handleDisable2FA}>
                    Disable 2FA
                  </button>
                ) : (
                  twoFaStep === 'idle' && (
                    <button type="button" className="as-btn-filled" onClick={handleStart2FA}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
                      Enable 2FA
                    </button>
                  )
                )}
              </div>

              {/* Setup flow card */}
              {!twoFaEnabled && twoFaStep !== 'idle' && (
                <div className="as-twofa-setup-card">

                  {/* Step 1 — QR code */}
                  {twoFaStep === 'setup' && (
                    <>
                      <div className="as-twofa-step-header">
                        <span className="as-twofa-step-num">1</span>
                        <h3 className="as-twofa-step-title">Scan QR code with your authenticator app</h3>
                      </div>
                      <p className="as-twofa-step-desc">
                        Open <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app and scan the code below.
                      </p>

                      <div className="as-twofa-qr-wrap">
                        <img src={qrUrl} alt="Scan this QR code to set up 2FA" className="as-twofa-qr" />
                      </div>

                      <div className="as-twofa-secret-box">
                        <p className="as-twofa-secret-label">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>key</span>
                          Manual entry key
                        </p>
                        <code className="as-twofa-secret-code">
                          {totpSecret.match(/.{1,4}/g)?.join(' ')}
                        </code>
                      </div>

                      <div className="as-twofa-timer-row">
                        <span className="material-symbols-outlined">timer</span>
                        Next window in {countdown}s
                        <div className="as-twofa-timer-bar">
                          <div className="as-twofa-timer-fill" style={{ width: `${(countdown / 30) * 100}%` }} />
                        </div>
                      </div>

                      <div className="as-twofa-actions">
                        <button type="button" className="as-btn-outline" onClick={() => setTwoFaStep('idle')}>
                          Cancel
                        </button>
                        <button type="button" className="as-btn-filled" onClick={() => setTwoFaStep('verify')}>
                          Next: Verify code →
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step 2 — Enter OTP */}
                  {twoFaStep === 'verify' && (
                    <>
                      <div className="as-twofa-step-header">
                        <span className="as-twofa-step-num">2</span>
                        <h3 className="as-twofa-step-title">Enter the 6-digit code from your app</h3>
                      </div>
                      <p className="as-twofa-step-desc">
                        Type the current 6-digit code shown in your authenticator app to confirm the setup.
                      </p>

                      <div className="as-twofa-otp-wrap">
                        <input
                          type="text"
                          className={`as-twofa-otp-input ${otpError ? 'as-twofa-otp-input-error' : ''}`}
                          placeholder="000 000"
                          maxLength={6}
                          value={otpInput}
                          inputMode="numeric"
                          autoFocus
                          onChange={(e) => {
                            setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                            setOtpError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && otpInput.length === 6) handleVerify2FA();
                          }}
                        />
                        {otpError && (
                          <p className="as-twofa-error">
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                            {otpError}
                          </p>
                        )}
                      </div>

                      <div className="as-twofa-timer-row">
                        <span className="material-symbols-outlined">timer</span>
                        Code refreshes in {countdown}s
                        <div className="as-twofa-timer-bar">
                          <div className="as-twofa-timer-fill" style={{ width: `${(countdown / 30) * 100}%` }} />
                        </div>
                      </div>

                      <div className="as-twofa-actions">
                        <button type="button" className="as-btn-outline" onClick={() => setTwoFaStep('setup')}>
                          ← Back
                        </button>
                        <button
                          type="button"
                          className="as-btn-filled"
                          onClick={handleVerify2FA}
                          disabled={otpInput.length !== 6}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span>
                          Verify &amp; Enable
                        </button>
                      </div>
                    </>
                  )}

                  {/* Step 3 — Success */}
                  {twoFaStep === 'done' && (
                    <div className="as-twofa-success">
                      <span className="material-symbols-outlined as-twofa-success-icon">check_circle</span>
                      <h3 className="as-twofa-success-title">2FA Enabled Successfully!</h3>
                      <p className="as-twofa-success-desc">
                        Your admin account is now protected by time-based OTP (RFC 6238). Store your secret key safely as a backup.
                      </p>
                      <div className="as-twofa-secret-box" style={{ marginTop: '1rem' }}>
                        <p className="as-twofa-secret-label">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>key</span>
                          Backup key — save this securely
                        </p>
                        <code className="as-twofa-secret-code">
                          {totpSecret.match(/.{1,4}/g)?.join(' ')}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Info rows */}
              <div className="as-twofa-info-grid">
                <div className="as-twofa-info-row">
                  <span className="material-symbols-outlined">smartphone</span>
                  <div>
                    <p className="as-twofa-info-title">Compatible apps</p>
                    <p className="as-twofa-info-body">Works with Google Authenticator, Authy, Microsoft Authenticator, 1Password, and all TOTP apps.</p>
                  </div>
                </div>
                <div className="as-twofa-info-row">
                  <span className="material-symbols-outlined">lock_clock</span>
                  <div>
                    <p className="as-twofa-info-title">RFC 6238 TOTP standard</p>
                    <p className="as-twofa-info-body">Industry-standard HMAC-SHA1 time-based OTP. Codes are computed locally — no server roundtrip needed.</p>
                  </div>
                </div>
                <div className="as-twofa-info-row">
                  <span className="material-symbols-outlined">history</span>
                  <div>
                    <p className="as-twofa-info-title">Audit trail</p>
                    <p className="as-twofa-info-body">All admin login events and 2FA attempts are recorded in the OTP logs.</p>
                  </div>
                  <button
                    type="button"
                    className="as-twofa-log-link"
                    onClick={() => navigate('/admin/otp')}
                  >
                    View logs →
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ── Other tabs placeholder ── */}
          {activeTab !== 'accounts' && activeTab !== 'twofa' && (
            <div className="as-placeholder">
              <span className="material-symbols-outlined as-placeholder-icon">construction</span>
              <p className="as-placeholder-title">{TABS.find((t) => t.key === activeTab)?.label}</p>
              <p className="as-placeholder-sub">Configuration options for this section are coming soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className="as-bottom-grid">

        {/* System Health */}
        <div className="as-health-card">
          <div className="as-health-header">
            <h4 className="as-health-title">System Health</h4>
            <span className="as-health-badge">
              <span className="as-pulse-dot" />
              All systems operational
            </span>
          </div>
          <div className="as-health-metrics">
            <div>
              <p className="as-health-label">API Latency</p>
              <p className="as-health-value">124 ms</p>
            </div>
            <div>
              <p className="as-health-label">Uptime</p>
              <p className="as-health-value">99.9%</p>
            </div>
            <div>
              <p className="as-health-label">Sync Rate</p>
              <p className="as-health-value">Real-time</p>
            </div>
          </div>
        </div>

        {/* Enterprise plan */}
        <div className="as-plan-card">
          <div className="as-plan-dots" />
          <div style={{ position: 'relative' }}>
            <p className="as-plan-label">Subscription</p>
            <p className="as-plan-name">Enterprise Plan</p>
          </div>
          <div style={{ position: 'relative' }}>
            <p className="as-plan-billing">Next billing date: June 15, 2025</p>
            <button type="button" className="as-plan-btn">Manage Billing</button>
          </div>
        </div>

      </div>
    </div>
  );
}
