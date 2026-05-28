import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/mockData';
import './Dashboard.css';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const QUICK_LINKS = [
  { to: '/schedule', icon: '📅', label: 'My Schedule' },
  { to: '/bills', icon: '🧾', label: 'My Bills' },
  { to: '/orders', icon: '📋', label: 'Orders' },
  { to: '/products', icon: '📦', label: 'Products' },
  { to: '/offers', icon: '🎁', label: 'Offers' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

const statementTypeIcon: Record<string, string> = {
  delivery: '📦',
  extra: '➕',
  pause: '⏸',
  payment: '✅',
  refund: '↩',
  store_credit: '💳',
};

export function Dashboard() {
  const { user, rituals, walletBalance, statementEntries, bills, notifications } = useApp();

  const greeting = getGreeting();
  const unpaidCount = bills.filter((b) => b.status === 'unpaid').length;
  const totalSpend = bills
    .filter((b) => b.status === 'paid')
    .reduce((s, b) => s + b.amount, 0);
  const activeSubscriptions = rituals.filter(
    (r) => r.status !== 'Cancelled',
  ).length;
  const recentActivity = statementEntries.slice(0, 6);

  return (
    <div className="dashboard-page">
      {/* Welcome banner */}
      <div className="dashboard-banner">
        <div>
          <h1 className="dashboard-greeting">
            {greeting}, {user.firstName}! 🌿
          </h1>
          <p className="dashboard-sub">
            {unpaidCount > 0
              ? `You have ${unpaidCount} unpaid bill${unpaidCount > 1 ? 's' : ''} — `
              : 'Everything is up to date · '}
            {unpaidCount > 0 && (
              <Link to="/bills" style={{ color: 'var(--md-primary-container)', fontWeight: 600 }}>
                Pay now
              </Link>
            )}
            Client ID: {user.clientId}
          </p>
        </div>
        <div className="dashboard-avatar">
          {user.firstName[0]}{user.lastName[0]}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon">🐄</span>
          <div>
            <p className="stat-value">{activeSubscriptions}</p>
            <p className="stat-label">Active Rituals</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💳</span>
          <div>
            <p className="stat-value">₹{walletBalance.toFixed(0)}</p>
            <p className="stat-label">Wallet Balance</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🧾</span>
          <div>
            <p className="stat-value">₹{totalSpend.toLocaleString('en-IN')}</p>
            <p className="stat-label">Total Spend</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div>
            <p className="stat-value">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
            <p className="stat-label">Today</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left column */}
        <div className="dashboard-left">
          {/* Daily Rituals */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <h2>Today's Rituals</h2>
              <Link to="/schedule">View schedule →</Link>
            </div>
            {rituals.length === 0 ? (
              <div className="card empty-state">
                <div className="emoji">🌿</div>
                <p>No active deliveries</p>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.875rem' }}>
                  Start a Ritual
                </Link>
              </div>
            ) : (
              rituals.map((r) => {
                const product = products.find((p) => p.id === r.productId);
                if (!product) return null;
                return (
                  <div key={r.id} className="ritual-row card">
                    <span className="ritual-emoji">{product.image}</span>
                    <div className="ritual-info">
                      <strong>{product.name}</strong>
                      <span>{r.quantity} {product.unit} · ₹{product.price}/{product.unit}</span>
                    </div>
                    <span className={`badge badge-${
                      r.status === 'Delivered' ? 'delivered' :
                      r.status === 'Paused' ? 'paused' :
                      r.status === 'Extra' ? 'extra' :
                      r.status === 'Out for Delivery' ? 'out-for-delivery' :
                      r.status === 'Cancelled' ? 'cancelled' :
                      'pending'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                );
              })
            )}
          </section>

          {/* Recent Activity */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <h2>Recent Activity</h2>
              <Link to="/bills">Full statement →</Link>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {recentActivity.map((entry, i) => (
                <div
                  key={entry.id}
                  className="activity-row"
                  style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <span className="activity-icon">
                    {statementTypeIcon[entry.type] ?? '📌'}
                  </span>
                  <div className="activity-info">
                    <p>{entry.description}</p>
                    <span>{entry.date}</span>
                  </div>
                  <span className={`activity-amount ${entry.credit ? 'credit' : 'debit'}`}>
                    {entry.credit ? '+' : '−'}{entry.amount > 0 ? `₹${entry.amount}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column — Quick navigation */}
        <aside className="dashboard-sidebar">
          <div className="dashboard-section">
            <h2>Quick Links</h2>
            <div className="quick-links-grid">
              {QUICK_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className="quick-link-card card">
                  <span className="quick-link-icon">{l.icon}</span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Unpaid bill alert */}
          {unpaidCount > 0 && (
            <div className="unpaid-alert card">
              <strong>⚠️ Bill Due</strong>
              <p>
                {bills.filter((b) => b.status === 'unpaid').map((b) => b.period).join(', ')} —
                ₹{bills.filter((b) => b.status === 'unpaid').reduce((s, b) => s + b.amount, 0).toLocaleString('en-IN')} pending
              </p>
              <Link to="/bills" className="btn btn-primary" style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'block', textAlign: 'center' }}>
                Pay Now
              </Link>
            </div>
          )}

          {/* Wallet card */}
          {walletBalance > 0 && (
            <div className="wallet-card card">
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Wallet Balance</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green-700)', margin: 0 }}>
                  ₹{walletBalance.toFixed(2)}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Use at checkout</p>
              </div>
              <span style={{ fontSize: '2rem' }}>💳</span>
            </div>
          )}

          {/* Notifications widget */}
          <div className="dash-notif-card">
            <div className="dash-notif-header">
              <h2 className="dash-notif-title">Notifications</h2>
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="dash-notif-badge">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>
            <div className="dash-notif-list">
              {notifications.slice(0, 4).map((n) => (
                <Link
                  key={n.id}
                  to={n.link || '/notifications'}
                  className={`dash-notif-item ${!n.read ? 'dash-notif-item-unread' : ''}`}
                >
                  <span className="dash-notif-dot" style={{ background: n.read ? 'var(--border)' : 'var(--green-600)' }} />
                  <div className="dash-notif-body">
                    <p className="dash-notif-item-title">{n.title}</p>
                    <p className="dash-notif-item-msg">{n.message}</p>
                    <span className="dash-notif-item-time">{n.time}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/notifications" className="dash-notif-view-all">
              View all notifications →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
