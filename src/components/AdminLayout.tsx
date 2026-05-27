import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getAdminSession, logoutAdmin } from '../lib/adminAuth';
import './AdminLayout.css';

const NAV = [
  { path: '/admin', label: 'Overview', end: true },
  { path: '/admin/customers', label: 'Customers' },
  { path: '/admin/otp', label: 'OTP Logs' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = getAdminSession();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-title">GIR RITUALS</span>
          <span className="admin-brand-sub">Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => {
            const active = item.end
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={active ? 'active' : ''}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <p className="admin-user">{admin?.name}</p>
          <button type="button" className="btn btn-ghost admin-logout" onClick={handleLogout}>
            Logout
          </button>
          <Link to="/login" className="admin-back-app">← Customer app</Link>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
