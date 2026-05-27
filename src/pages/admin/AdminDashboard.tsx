import { Link } from 'react-router-dom';
import { getAllCustomers } from '../../lib/customerStore';
import { getActiveOtps, getOtpLogs } from '../../lib/otpService';

export function AdminDashboard() {
  const customers = getAllCustomers();
  const activeOtps = getActiveOtps();
  const logs = getOtpLogs();
  const verifiedToday = logs.filter(
    (l) => l.action === 'verified' && l.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ).length;

  return (
    <div>
      <h1 className="admin-page-title">Overview</h1>
      <p className="admin-page-sub">Business and verification activity at a glance</p>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <strong>{customers.length}</strong>
          <span>Registered customers</span>
        </div>
        <div className="admin-stat-card">
          <strong>{activeOtps.length}</strong>
          <span>Active OTPs</span>
        </div>
        <div className="admin-stat-card">
          <strong>{verifiedToday}</strong>
          <span>Verifications today</span>
        </div>
        <div className="admin-stat-card">
          <strong>{logs.length}</strong>
          <span>OTP log entries</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <Link to="/admin/customers" className="btn btn-primary" style={{ width: 'auto' }}>
          View customers
        </Link>
        <Link to="/admin/otp" className="btn btn-secondary" style={{ width: 'auto' }}>
          OTP logs
        </Link>
      </div>
    </div>
  );
}
