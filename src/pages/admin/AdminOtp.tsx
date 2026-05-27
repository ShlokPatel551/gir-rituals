import { getActiveOtps, getOtpLogs } from '../../lib/otpService';
import type { OtpLogEntry } from '../../types/auth';

function badgeClass(action: OtpLogEntry['action']) {
  switch (action) {
    case 'sent':
      return 'admin-badge-sent';
    case 'verified':
      return 'admin-badge-verified';
    case 'failed':
      return 'admin-badge-failed';
    default:
      return 'admin-badge-expired';
  }
}

export function AdminOtp() {
  const logs = getOtpLogs();
  const activeOtps = getActiveOtps();

  return (
    <div>
      <h1 className="admin-page-title">OTP Logs</h1>
      <p className="admin-page-sub">SMS simulation log — production would use WhatsApp/SMS gateway</p>

      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Active OTPs ({activeOtps.length})</h2>
      {activeOtps.length > 0 && (
        <div className="admin-table-wrap" style={{ marginBottom: '2rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Phone</th>
                <th>Email</th>
                <th>Purpose</th>
                <th>Code</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {activeOtps.map((o) => (
                <tr key={o.id}>
                  <td>{o.phone}</td>
                  <td>{o.email}</td>
                  <td>{o.purpose}</td>
                  <td><code>{o.code}</code></td>
                  <td>{new Date(o.expiresAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Event log</h2>
      {logs.length === 0 ? (
        <p className="card">No OTP events yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Purpose</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge ${badgeClass(l.action)}`}>{l.action}</span>
                  </td>
                  <td>{l.purpose}</td>
                  <td>{l.phone}</td>
                  <td>{l.email}</td>
                  <td>{l.codePreview ? <code>{l.codePreview}</code> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
