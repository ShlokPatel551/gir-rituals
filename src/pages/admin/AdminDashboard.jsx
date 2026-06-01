import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminDashboard.css";

const REVENUE_BARS   = [40, 55, 45, 70, 60, 50, 85, 40, 65, 95, 30, 75];
const REVENUE_LABELS = ["01 May", "15 May", "30 May"];
const AVATAR_COLORS  = ["var(--admin-secondary-fixed-dim)", "#ffdcc4", "var(--admin-surface-container-high)", "#ffdcbd", "#c8e6c9"];

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,        setStats]        = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    api.adminDashboard().then(setStats).catch(() => {});
    api.adminOrders().then(rows => setRecentOrders(rows.slice(0, 5))).catch(() => {});
  }, []);

  const totalCustomers      = stats?.totalCustomers      ?? "\u2014";
  const activeSubscriptions = stats?.activeSubscriptions ?? "\u2014";
  const todayDeliveries     = stats?.totalOrders         ?? "\u2014";
  const monthlyRevenue      = stats ? `\u20B9${Number(stats.totalRevenue).toLocaleString("en-IN")}` : "\u2014";
  return <div className="adm-dashboard">

      {
    /* ── Header row ── */
  }
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

      {
    /* ── Metric bento grid ── */
  }
      <div className="adm-metrics-grid">
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate("/admin/customers")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/admin/customers")}>
          <p className="adm-metric-label">Total customers</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{totalCustomers}</span>
            <span className="adm-metric-badge adm-badge-green">+12 this month</span>
          </div>
        </div>
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate("/admin/billing")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/admin/billing")}>
          <p className="adm-metric-label">Active subscriptions</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{activeSubscriptions}</span>
            <span className="adm-metric-badge adm-badge-green">+5 this week</span>
          </div>
        </div>
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate("/admin/deliveries")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/admin/deliveries")}>
          <p className="adm-metric-label">Today's deliveries</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{todayDeliveries}</span>
            <span className="adm-metric-badge adm-badge-tan">12 pending</span>
          </div>
        </div>
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate("/admin/finance")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/admin/finance")}>
          <p className="adm-metric-label">Monthly revenue</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">{monthlyRevenue}</span>
            <span className="adm-metric-badge adm-badge-green">+8% vs last month</span>
          </div>
        </div>
        <div className="bento-card adm-metric-card adm-metric-clickable" onClick={() => navigate("/admin/production")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/admin/production")}>
          <p className="adm-metric-label">Today's production</p>
          <div className="adm-metric-row">
            <span className="adm-metric-value">220 L</span>
            <span className="adm-metric-badge adm-badge-green">30 May</span>
          </div>
        </div>
      </div>

      {
    /* ── Charts row ── */
  }
      <div className="adm-charts-grid">
        {
    /* Revenue bar chart */
  }
        <div className="bento-card adm-chart-card adm-chart-main">
          <div className="adm-chart-header">
            <h3 className="adm-chart-title">Revenue this month (daily)</h3>
            <button type="button" className="adm-icon-btn-sm">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="adm-bar-chart">
            {REVENUE_BARS.map((h, i) => <div
    key={i}
    className="adm-bar"
    style={{ height: `${h}%`, opacity: h >= 80 ? 0.9 : h >= 60 ? 0.5 : 0.2 }}
  />)}
          </div>
          <div className="adm-chart-labels">
            {REVENUE_LABELS.map((l) => <span key={l}>{l}</span>)}
          </div>
        </div>

        {
    /* Delivery donut chart */
  }
        <div className="bento-card adm-chart-card adm-chart-donut">
          <h3 className="adm-chart-title" style={{ marginBottom: "1rem", textAlign: "left" }}>Today's delivery status</h3>
          <div className="adm-donut-wrap">
            <svg viewBox="0 0 36 36" className="adm-donut-svg">
              {
    /* Background track */
  }
              <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f2edec" strokeWidth="4" />
              {
    /* Delivered (84%) */
  }
              <circle
    cx="18"
    cy="18"
    r="16"
    fill="transparent"
    stroke="var(--admin-primary-container)"
    strokeWidth="4"
    strokeDasharray="84 100"
    strokeDashoffset="0"
  />
              {
    /* Pending (11%) */
  }
              <circle
    cx="18"
    cy="18"
    r="16"
    fill="transparent"
    stroke="#D4A373"
    strokeWidth="4"
    strokeDasharray="11 100"
    strokeDashoffset="-84"
  />
              {
    /* Paused (5%) */
  }
              <circle
    cx="18"
    cy="18"
    r="16"
    fill="transparent"
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
              <div className="adm-legend-dot" style={{ background: "var(--admin-primary-container)" }} />
              <span className="adm-legend-name">Delivered</span>
              <span className="adm-legend-val">148</span>
            </div>
            <div className="adm-legend-row">
              <div className="adm-legend-dot" style={{ background: "#D4A373" }} />
              <span className="adm-legend-name">Pending</span>
              <span className="adm-legend-val">20</span>
            </div>
            <div className="adm-legend-row">
              <div className="adm-legend-dot" style={{ background: "var(--admin-error)" }} />
              <span className="adm-legend-name">Paused</span>
              <span className="adm-legend-val">8</span>
            </div>
          </div>
        </div>
      </div>

      {
    /* ── Urgent refund banner ── */
  }
      <div className="adm-banner">
        <div className="adm-banner-left">
          <span className="material-symbols-outlined adm-banner-icon">warning</span>
          <p>3 refund requests waiting for your approval. Timely processing maintains customer trust.</p>
        </div>
        <button type="button" className="adm-banner-btn" onClick={() => navigate("/admin/refunds")}>Review now</button>
      </div>

      {
    /* ── Recent orders table ── */
  }
      <div className="bento-card adm-table-card">
        <div className="adm-table-header">
          <div className="adm-table-header-left">
            <span className="material-symbols-outlined" style={{ color: "var(--admin-on-surface-variant)" }}>history</span>
            <h3 className="adm-section-title">Recent orders</h3>
          </div>
          <Link to="/admin/orders" className="adm-view-all-link">View all orders</Link>
        </div>
        <div className="admin-table-wrap" style={{ borderRadius: 0, border: "none" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--admin-on-surface-variant)", padding: "1.5rem" }}>No orders yet</td></tr>
              ) : recentOrders.map((row, i) => {
                const name = `${row.first_name} ${row.last_name}`;
                return (
                  <tr key={row.id}>
                    <td>
                      <div className="adm-customer-cell">
                        <div className="adm-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials(name)}</div>
                        <span className="adm-customer-name">{name}</span>
                      </div>
                    </td>
                    <td className="adm-cell-muted">{row.product_name}</td>
                    <td className="adm-cell-muted">{row.qty}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`admin-badge admin-badge-${row.status}`}>{row.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="adm-view-btn" onClick={() => navigate("/admin/orders")}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


    </div>;
}
export {
  AdminDashboard
};
