import { Link, useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../../lib/customerStore';
import { ADMIN_NOTIFS } from '../../data/adminNotifications';
import './AdminDashboard.css';

const REVENUE_BARS = [40, 55, 45, 70, 60, 50, 85, 40, 65, 95, 30, 75];
const REVENUE_LABELS = ['01 May', '15 May', '30 May'];

const RECENT_ORDERS = [
  { initials: 'PS', name: 'Priya S.', product: 'Gir Milk', qty: '2 L', status: 'Active', color: 'var(--admin-secondary-fixed-dim)' },
  { initials: 'RM', name: 'Rahul M.', product: 'Ghee', qty: '500g', status: 'Pending', color: '#ffdcc4' },
  { initials: 'AK', name: 'Anjali K.', product: 'Gir Milk', qty: '1 L', status: 'Active', color: 'var(--admin-surface-container-high)' },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const customers = getAllCustomers();

  const totalCustomers = Math.max(customers.length, 247);
  const activeSubscriptions = 189;
  const todayDeliveries = 176;
  const monthlyRevenue = '₹82,400';

  return (
    <div className="adm-dashboard">

      {/* ── Header row ── */}
      <div className="adm-header-row">
        <div>
          <h2 className="adm-page-title">Dashboard</h2>
          <p className="adm-page-sub">Overview of your artisanal dairy operations</p>
        </div>
        <div className="adm-alert-pill">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notification_important</span>
          <span>3 pending refund requests</span>
        </div>

      </div>

      {/* ── Metric bento grid ── */}
      <div className="adm-metrics-grid">
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate('/admin/customers')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/customers')}>
          <p className="adm-metric-label">Total customers</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{totalCustomers}</span>
            <span className="adm-metric-badge adm-badge-green">+12 this month</span>
          </div>
        </div>
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate('/admin/billing')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/billing')}>
          <p className="adm-metric-label">Active subscriptions</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{activeSubscriptions}</span>
            <span className="adm-metric-badge adm-badge-green">+5 this week</span>
          </div>
        </div>
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate('/admin/deliveries')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/deliveries')}>
          <p className="adm-metric-label">Today's deliveries</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{todayDeliveries}</span>
            <span className="adm-metric-badge adm-badge-tan">12 pending</span>
          </div>
        </div>
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate('/admin/finance')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/finance')}>
          <p className="adm-metric-label">Monthly revenue</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{monthlyRevenue}</span>
            <span className="adm-metric-badge adm-badge-green">+8% vs last month</span>
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="adm-charts-grid">
        {/* Revenue bar chart */}
        <div className="bento-card adm-chart-card adm-chart-main">
          <div className="adm-chart-header">
            <h3 className="adm-chart-title">Revenue this month (daily)</h3>
            <button type="button" className="adm-icon-btn-sm">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="adm-bar-chart">
            {REVENUE_BARS.map((h, i) => (
              <div
                key={i}
                className="adm-bar"
                style={{ height: `${h}%`, opacity: h >= 80 ? 0.9 : h >= 60 ? 0.5 : 0.2 }}
              />
            ))}
          </div>
          <div className="adm-chart-labels">
            {REVENUE_LABELS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>

        {/* Delivery donut chart */}
        <div className="bento-card adm-chart-card adm-chart-donut">
          <h3 className="adm-chart-title" style={{ marginBottom: '1rem', textAlign: 'left' }}>Today's delivery status</h3>
          <div className="adm-donut-wrap">
            <svg viewBox="0 0 36 36" className="adm-donut-svg">
              {/* Background track */}
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f2edec" strokeWidth="4" />
              {/* Delivered (84%) */}
              <circle
                cx="18" cy="18" r="16" fill="transparent"
                stroke="var(--admin-primary-container)"
                strokeWidth="4"
                strokeDasharray="84 100"
                strokeDashoffset="0"
              />
              {/* Pending (11%) */}
              <circle
                cx="18" cy="18" r="16" fill="transparent"
                stroke="#D4A373"
                strokeWidth="4"
                strokeDasharray="11 100"
                strokeDashoffset="-84"
              />
              {/* Paused (5%) */}
              <circle
                cx="18" cy="18" r="16" fill="transparent"
                stroke="var(--admin-error)"
                strokeWidth="4"
                strokeDasharray="5 100"
                strokeDashoffset="-95"
              />
            </svg>
            <div className="adm-donut-center">
              <span className="adm-donut-total">176</span>
              <span className="adm-donut-label">Total</span>
            </div>
          </div>
          <div className="adm-donut-legend">
            <div className="adm-legend-row">
              <div className="adm-legend-dot" style={{ background: 'var(--admin-primary-container)' }} />
              <span className="adm-legend-name">Delivered</span>
              <span className="adm-legend-val">148</span>
            </div>
            <div className="adm-legend-row">
              <div className="adm-legend-dot" style={{ background: '#D4A373' }} />
              <span className="adm-legend-name">Pending</span>
              <span className="adm-legend-val">20</span>
            </div>
            <div className="adm-legend-row">
              <div className="adm-legend-dot" style={{ background: 'var(--admin-error)' }} />
              <span className="adm-legend-name">Paused</span>
              <span className="adm-legend-val">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Urgent refund banner ── */}
      <div className="adm-banner">
        <div className="adm-banner-left">
          <span className="material-symbols-outlined adm-banner-icon">warning</span>
          <p>3 refund requests waiting for your approval. Timely processing maintains customer trust.</p>
        </div>
        <button type="button" className="adm-banner-btn" onClick={() => navigate('/admin/refunds')}>Review now</button>
      </div>

      {/* ── Dashboard body: orders + notifications side by side ── */}
      <div className="adm-body-grid">

      {/* ── Recent orders table ── */}
      <div className="bento-card adm-table-card">
        <div className="adm-table-header">
          <div className="adm-table-header-left">
            <span className="material-symbols-outlined" style={{ color: 'var(--admin-on-surface-variant)' }}>history</span>
            <h3 className="adm-section-title">Recent orders</h3>
          </div>
          <Link to="/admin/orders" className="adm-view-all-link">View all orders</Link>
        </div>
        <div className="admin-table-wrap" style={{ borderRadius: 0, border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((row) => (
                <tr key={row.name}>
                  <td>
                    <div className="adm-customer-cell">
                      <div className="adm-avatar" style={{ background: row.color }}>{row.initials}</div>
                      <span className="adm-customer-name">{row.name}</span>
                    </div>
                  </td>
                  <td className="adm-cell-muted">{row.product}</td>
                  <td className="adm-cell-muted">{row.qty}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`admin-badge admin-badge-${row.status.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="adm-view-btn" onClick={() => navigate('/admin/orders')}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Notification feed ── */}
      <div className="bento-card adm-notif-card">
        <div className="adm-notif-card-header">
          <h3 className="adm-section-title">Recent Alerts</h3>
          <span className="adm-notif-card-badge">{ADMIN_NOTIFS.filter((n) => !n.read).length} new</span>
        </div>
        <div className="adm-notif-feed">
          {ADMIN_NOTIFS.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`adm-notif-row ${!n.read ? 'adm-notif-row-unread' : ''}`}
              onClick={() => navigate(n.link)}
            >
              <div className="adm-notif-row-icon" style={{ background: n.bg }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: n.color }}>{n.icon}</span>
              </div>
              <div className="adm-notif-row-body">
                <p className="adm-notif-row-title">{n.title}</p>
                <p className="adm-notif-row-desc">{n.desc}</p>
              </div>
              <span className="adm-notif-row-time">{n.time}</span>
              {!n.read && <span className="adm-notif-row-dot" />}
            </button>
          ))}
        </div>
      </div>

      </div>{/* end adm-body-grid */}

      {/* ── Seasonal highlights ── */}
      <div className="adm-highlights-grid">
        <div className="adm-highlight-card">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEXwGPnXTzANbYI_Oc8YU3AJZcSxt7bw8fjKEiiGO-5lh9o3ZuTEysCrq81XcYyjR0tb2f8BJhm27_aXqqGdLmdGum4xOLd57yFtjVIPuRyO5wOoXV0d-9Qpk8G5kAF_xy9yubM1I5aUczoMefpLfWBbLqkZZ1EC8d6Smjy4lSzBinQQPGO8eUqdlJkgH8nm92rz_xjQgv0mBcPuCtsc4eixSrZ9juy2PWfPEiq0Yy2NoAoI7Q0niNa6uwzI7Z5Okbc0FNcq_5inTV"
            alt="Gir cow dairy farm"
            className="adm-highlight-img"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="adm-highlight-overlay adm-overlay-primary">
            <p className="adm-highlight-heading">Inventory Alert</p>
            <p className="adm-highlight-sub">A2 Ghee stocks are running low for the weekend cycle.</p>
          </div>
        </div>
        <div className="adm-highlight-card">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgVkbwvhPmtSx8_6RHbmAU4soC7GXbagzreNtVQc9gvj8Ns662242sW_Zlcpz3n_fYaTc9c0yI07tayj73vJIGPfA9CWwYNXU64ckeVqHnCAMES8M1w_5oEtu-gvsy3mea-3Qv-FOA2wcPY7N7Cx-HFGsuF4pU5X9tpck2cDtivoZJ_MHuA_VpDrsy8cT9SFRPz2FbP0y-v1mkwwHr17VhoYwNCyXlHuQEz8xRo-lETWZeSFXtE0fzmx7imtg5dvc2nUCZPi6LfcNw"
            alt="Gir Rituals milk bottles"
            className="adm-highlight-img"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="adm-highlight-overlay adm-overlay-secondary">
            <p className="adm-highlight-heading">New Campaign</p>
            <p className="adm-highlight-sub">Live 'Farm-to-Door' tracking is now active for all subscribers.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
