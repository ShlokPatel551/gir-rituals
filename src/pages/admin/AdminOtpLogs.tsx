import { getActiveOtps, getOtpLogs } from '../../lib/otpService';

export function AdminOtpLogs() {
  const logs = getOtpLogs();
  const active = getActiveOtps();

  return (
    <div>
      <h1 className="admin-page-title">OTP Logs</h1>
      <p className="admin-page-sub">Sent, verified, and failed verification attempts</p>

      {active.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', margin: '1.5rem 0 0.75rem' }}>Active OTPs (demo)</h2>
          <div className="admin-table-wrap" style={{ marginBottom: '1.5rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Code</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {active.map((o) => (
                  <tr key={o.id}>
                    <td>{o.purpose}</td>
                    <td>{o.phone}</td>
                    <td>{o.email}</td>
                    <td><code>{o.code}</code></td>
                    <td>{new Date(o.expiresAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>History</h2>
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
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6}>No OTP activity yet</td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${l.action}`}>{l.action}</span>
                  </td>
                  <td>{l.purpose}</td>
                  <td>{l.phone}</td>
                  <td>{l.email}</td>
                  <td>{l.codePreview ? <code>{l.codePreview}</code> : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
