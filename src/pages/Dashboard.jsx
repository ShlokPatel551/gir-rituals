import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Dashboard.css";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const QUICK_LINKS = [
  { to: "/schedule", icon: "calendar_month",   label: "Schedule"  },
  { to: "/bills",    icon: "receipt_long",      label: "Bills"     },
  { to: "/orders",   icon: "local_shipping",    label: "Orders"    },
  { to: "/products", icon: "storefront",        label: "Products"  },
  { to: "/offers",   icon: "celebration",       label: "Offers"    },
  { to: "/profile",  icon: "manage_accounts",   label: "Profile"   },
];

const RITUAL_STATUS_CFG = {
  Delivered:        { cls: "delivered",        label: "Delivered"        },
  Paused:           { cls: "paused",           label: "Paused"           },
  Extra:            { cls: "extra",            label: "Extra"            },
  "Out for Delivery": { cls: "out-for-delivery", label: "Out for Delivery" },
  Cancelled:        { cls: "cancelled",        label: "Cancelled"        },
};

function Dashboard() {
  const { user, rituals, statementEntries, bills, notifications, products } = useApp();

  const greeting           = getGreeting();
  const unpaidBills        = bills.filter(b => b.status === "unpaid");
  const unpaidCount        = unpaidBills.length;
  const totalSpend         = bills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const activeSubscriptions = rituals.filter(r => r.status !== "Cancelled").length;
  const recentActivity     = statementEntries.slice(0, 6);
  const unreadNotifs       = notifications.filter(n => !n.read).length;

  const firstName = user?.firstName ?? "";
  const lastName  = user?.lastName  ?? "";
  const initials  = `${firstName[0] ?? ""}${lastName[0] ?? ""}` || "?";

  return (
    <div className="dashboard-page">

      {/* ── Welcome banner ── */}
      <div className="dashboard-banner">
        <div className="dashboard-banner-text">
          <p className="dashboard-eyebrow">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="dashboard-greeting">
            {greeting}, {firstName || "Guest"}!
          </h1>
          <p className="dashboard-sub">
            {unpaidCount > 0 ? (
              <>You have <Link to="/bills" className="dashboard-pay-link">{unpaidCount} unpaid bill{unpaidCount > 1 ? "s" : ""} — Pay now</Link></>
            ) : (
              "All bills settled · Your rituals are on track"
            )}
          </p>
        </div>
        <div className="dashboard-avatar">{initials}</div>
      </div>

      {/* ── KPI strip ── */}
      <div className="dashboard-kpis">
        <div className="dash-kpi-card dash-kpi-green">
          <span className="material-symbols-outlined dash-kpi-icon">local_florist</span>
          <div>
            <p className="dash-kpi-val">{activeSubscriptions}</p>
            <p className="dash-kpi-lbl">Active Rituals</p>
          </div>
        </div>
        <div className={`dash-kpi-card ${unpaidCount > 0 ? "dash-kpi-amber" : "dash-kpi-neutral"}`}>
          <span className="material-symbols-outlined dash-kpi-icon">receipt_long</span>
          <div>
            <p className="dash-kpi-val">{unpaidCount}</p>
            <p className="dash-kpi-lbl">Unpaid Bills</p>
          </div>
        </div>
        <div className="dash-kpi-card dash-kpi-brown">
          <span className="material-symbols-outlined dash-kpi-icon">payments</span>
          <div>
            <p className="dash-kpi-val">₹{totalSpend.toLocaleString("en-IN")}</p>
            <p className="dash-kpi-lbl">Total Spend</p>
          </div>
        </div>
        <div className="dash-kpi-card dash-kpi-neutral">
          <span className="material-symbols-outlined dash-kpi-icon">notifications</span>
          <div>
            <p className="dash-kpi-val">{unreadNotifs}</p>
            <p className="dash-kpi-lbl">Unread Alerts</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">

        {/* ── Left ── */}
        <div className="dashboard-left">

          {/* Today's Rituals */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <h2>Today's Rituals</h2>
              <Link to="/schedule">View schedule →</Link>
            </div>

            {rituals.length === 0 ? (
              <div className="card empty-state">
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#9a8578", marginBottom: "0.5rem" }}>eco</span>
                <p style={{ color: "#6b5040", marginBottom: "0.75rem" }}>No active rituals yet</p>
                <Link to="/products" className="btn btn-primary" style={{ display: "inline-block", fontSize: "0.875rem" }}>
                  Start a Ritual
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {rituals.map(r => {
                  const product = products.find(p => p.id === r.productId);
                  if (!product) return null;
                  const cfg = RITUAL_STATUS_CFG[r.status] ?? { cls: "pending", label: r.status };
                  return (
                    <div key={r.id} className="ritual-row card">
                      <span className="ritual-emoji">{product.image}</span>
                      <div className="ritual-info">
                        <strong>{product.name}</strong>
                        <span>{r.quantity} {product.unit} · ₹{product.price}/{product.unit}</span>
                      </div>
                      <span className={`badge badge-${cfg.cls}`}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header-row">
                <h2>Recent Activity</h2>
                <Link to="/bills">Full statement →</Link>
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {recentActivity.map((entry, i) => (
                  <div
                    key={entry.id ?? i}
                    className="activity-row"
                    style={{ borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <div className="activity-icon-wrap">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {entry.type === "payment" ? "check_circle" : entry.type === "refund" ? "undo" : "package_2"}
                      </span>
                    </div>
                    <div className="activity-info">
                      <p>{entry.description}</p>
                      <span>{entry.date}</span>
                    </div>
                    <span className={`activity-amount ${entry.credit ? "credit" : "debit"}`}>
                      {entry.credit ? "+" : "−"}{entry.amount > 0 ? `₹${entry.amount}` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <aside className="dashboard-sidebar">

          {/* Quick Links */}
          <div className="dashboard-section">
            <h2 style={{ marginBottom: "0.75rem" }}>Quick Links</h2>
            <div className="quick-links-grid">
              {QUICK_LINKS.map(l => (
                <Link key={l.to} to={l.to} className="quick-link-card card">
                  <span className="material-symbols-outlined quick-link-icon">{l.icon}</span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Unpaid bill alert */}
          {unpaidCount > 0 && (
            <div className="unpaid-alert card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--md-on-error-container)" }}>warning</span>
                <strong>Bill Due</strong>
              </div>
              <p>
                {unpaidBills.map(b => b.period).join(", ")} —
                ₹{unpaidBills.reduce((s, b) => s + b.amount, 0).toLocaleString("en-IN")} pending
              </p>
              <Link to="/bills" className="btn btn-primary" style={{ fontSize: "0.875rem", marginTop: "0.625rem", display: "block", textAlign: "center" }}>
                Pay Now
              </Link>
            </div>
          )}

          {/* Notifications widget */}
          {notifications.length > 0 && (
            <div className="dash-notif-card">
              <div className="dash-notif-header">
                <h2 className="dash-notif-title">Notifications</h2>
                {unreadNotifs > 0 && (
                  <span className="dash-notif-badge">{unreadNotifs}</span>
                )}
              </div>
              <div className="dash-notif-list">
                {notifications.slice(0, 4).map(n => (
                  <Link
                    key={n.id}
                    to={n.link || "/notifications"}
                    className={`dash-notif-item ${!n.read ? "dash-notif-item-unread" : ""}`}
                  >
                    <span className="dash-notif-dot" style={{ background: n.read ? "var(--border)" : "var(--green-600)" }} />
                    <div className="dash-notif-body">
                      <p className="dash-notif-item-title">{n.title}</p>
                      <p className="dash-notif-item-msg">{n.message}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/notifications" className="dash-notif-view-all">
                View all notifications →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export { Dashboard };
