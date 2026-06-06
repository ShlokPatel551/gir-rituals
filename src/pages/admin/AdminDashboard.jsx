import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminDashboard.css";

const AVATAR_COLORS = ["#c1ecd4", "#ffdcc4", "#ece7e6", "#ffdcbd", "#a5d0b9"];

const PRODUCTS = [
  { name: "Cow milk",     icon: "water_drop",        revenue: "₹4,200" },
  { name: "Buffalo milk", icon: "opacity",            revenue: "₹2,600" },
  { name: "Paneer",       icon: "restaurant",         revenue: "₹900"   },
  { name: "Ghee",         icon: "emoji_food_beverage", revenue: "₹700"  },
];

function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtFullDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function fmtSectionDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtMonth() {
  return new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function SectionDivider({ label }) {
  return (
    <div className="adm-section-divider">
      <span className="adm-divider-label">{label}</span>
      <div className="adm-divider-line" />
    </div>
  );
}

function KpiCard({ label, value, sub, border }) {
  return (
    <div className={`bento-card adm-kpi-card adm-border-${border}`}>
      <p className="adm-kpi-label">{label}</p>
      <h3 className="adm-kpi-value">{value}</h3>
      <p className="adm-kpi-sub">{sub}</p>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState("today");
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    api.adminDashboard().then(setStats).catch(() => {});
    api.adminOrders().then(rows => setRecentOrders(rows.slice(0, 5))).catch(() => {});
  }, []);

  const totalCustomers      = stats?.totalCustomers      ?? "—";
  const activeSubscriptions = stats?.activeSubscriptions ?? "—";
  const todayDeliveries     = stats?.totalOrders         ?? "—";
  const todayRevenue        = stats
    ? `₹${Number(stats.totalRevenue / 30).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "—";
  const monthlyRevenue      = stats
    ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`
    : "—";

  const todayCards = [
    { label: "Total customers",      value: totalCustomers,      sub: "Registered on app or website",        border: "primary"   },
    { label: "Total new customers",  value: "3",                 sub: "Joined today",                        border: "primary"   },
    { label: "Active subscriptions", value: activeSubscriptions, sub: "Customers paying for daily delivery",  border: "secondary" },
    { label: "New subscriptions",    value: "2",                 sub: "Started today",                       border: "secondary" },
    { label: "Today's deliveries",   value: todayDeliveries,     sub: "148 done • 20 pending",               border: "fixed-dim" },
    { label: "Today's revenue",      value: todayRevenue,        sub: "From deliveries + extras",            border: "tertiary"  },
  ];

  const monthCards = [
    { label: "Total customers (month)", value: totalCustomers,      sub: "Active base",          border: "primary"   },
    { label: "Total new customers",     value: "18",                sub: "Joined this month",    border: "primary"   },
    { label: "Active subscriptions",    value: activeSubscriptions, sub: "Daily deliveries",      border: "secondary" },
    { label: "New subscriptions",       value: "9",                 sub: "Added this month",     border: "secondary" },
    { label: "Monthly revenue",         value: monthlyRevenue,      sub: "+11% vs last month",   border: "tertiary"  },
    { label: "Total deliveries",        value: "4,180",             sub: "Across all products",  border: "outline"   },
  ];

  return (
    <div className="adm-dashboard">

      {/* Greeting */}
      <div className="adm-greeting-row">
        <div>
          <h1 className="adm-greeting-title">{getGreeting()}, Gir Rituals 👋</h1>
          <p className="adm-greeting-sub">
            {fmtFullDate()} |{" "}
            <span className="adm-greeting-emphasis">Here's how your business looks today</span>
          </p>
        </div>
        <div className="adm-view-toggle">
          <button
            className={`adm-toggle-btn ${view === "today" ? "active" : ""}`}
            onClick={() => setView("today")}
          >Today</button>
          <button
            className={`adm-toggle-btn ${view === "month" ? "active" : ""}`}
            onClick={() => setView("month")}
          >This month</button>
        </div>
      </div>

      {/* Today section */}
      <SectionDivider label={`Today — ${fmtSectionDate()}`} />

      <div className="adm-metrics-grid-6">
        {todayCards.map(c => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* Insights: donut + product revenue */}
      <div className="adm-insights-grid">

        {/* Delivery status donut */}
        <div className="bento-card adm-donut-card">
          <h4 className="adm-card-heading">Delivery status breakdown</h4>
          <div className="adm-donut-wrap">
            <svg viewBox="0 0 36 36" className="adm-donut-svg">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#e6e1e0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#012d1d" strokeWidth="3"
                strokeDasharray="84 16" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#7d562d" strokeWidth="3"
                strokeDasharray="11 89" strokeDashoffset="-84" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ffb781" strokeWidth="3"
                strokeDasharray="5 95" strokeDashoffset="-95" />
            </svg>
            <div className="adm-donut-center">
              <span className="adm-donut-pct">84%</span>
              <span className="adm-donut-lbl">Complete</span>
            </div>
          </div>
          <div className="adm-donut-legend">
            {[
              { color: "#012d1d", label: "Delivered", val: "148 (84%)" },
              { color: "#7d562d", label: "Pending",   val: "20 (11%)"  },
              { color: "#ffb781", label: "Paused",    val: "8 (5%)"    },
            ].map(item => (
              <div key={item.label} className="adm-legend-row">
                <span className="adm-legend-dot" style={{ background: item.color }} />
                <span className="adm-legend-name">{item.label}</span>
                <span className="adm-legend-val">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by product */}
        <div className="bento-card adm-product-card">
          <div className="adm-card-heading-row">
            <h4 className="adm-card-heading">Today's revenue by product</h4>
            <button className="adm-text-link" onClick={() => navigate("/admin/finance")}>View details</button>
          </div>
          <div className="adm-product-grid">
            {PRODUCTS.map(p => (
              <div key={p.name} className="adm-product-tile">
                <div className="adm-product-icon-wrap">
                  <span className="material-symbols-outlined adm-product-icon">{p.icon}</span>
                </div>
                <p className="adm-product-name">{p.name}</p>
                <p className="adm-product-revenue">{p.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly section */}
      <SectionDivider label={`This month — ${fmtMonth()}`} />

      <div className="adm-metrics-grid-6">
        {monthCards.map(c => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* Recent orders table */}
      <div className="bento-card adm-table-card">
        <div className="adm-table-header">
          <div className="adm-table-header-left">
            <span className="material-symbols-outlined" style={{ color: "var(--admin-primary)" }}>history</span>
            <h3 className="adm-section-title">Recent orders &amp; new sign-ups</h3>
          </div>
          <Link to="/admin/orders" className="adm-view-all-link">View all</Link>
        </div>
        <div className="admin-table-wrap" style={{ borderRadius: 0, border: "none" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Customer name</th>
                <th>Type</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Payment</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "var(--admin-on-surface-variant)", padding: "2rem" }}>
                    No orders yet
                  </td>
                </tr>
              ) : recentOrders.map((row, i) => {
                const name     = `${row.first_name} ${row.last_name}`;
                const clientId = `GR${String(row.id).padStart(5, "0")}`;
                return (
                  <tr key={row.id}>
                    <td className="adm-cell-muted">{clientId}</td>
                    <td><span className="adm-customer-name">{name}</span></td>
                    <td><span className="adm-badge-type">Subscription</span></td>
                    <td className="adm-cell-muted">{row.product_name}</td>
                    <td className="adm-cell-muted">{row.qty}</td>
                    <td><span className={`admin-badge admin-badge-${row.status}`}>{row.status}</span></td>
                    <td><span className="adm-amount">{row.amount ? `₹${row.amount}` : "—"}</span></td>
                    <td><span className="adm-badge-paid">Paid</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button className="adm-view-btn" onClick={() => navigate("/admin/orders")}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert bars */}
      <div className="adm-alerts-grid">
        <div className="adm-alert-bar adm-alert-primary">
          <div className="adm-alert-left">
            <span className="material-symbols-outlined adm-alert-icon">sync_problem</span>
            <p>3 refund requests waiting</p>
          </div>
          <button className="adm-alert-action" onClick={() => navigate("/admin/refunds")}>Review</button>
        </div>
        <div className="adm-alert-bar adm-alert-tertiary">
          <div className="adm-alert-left">
            <span className="material-symbols-outlined adm-alert-icon">warning</span>
            <p>8 customers overdue</p>
          </div>
          <button className="adm-alert-action" onClick={() => navigate("/admin/billing")}>Remind</button>
        </div>
        <div className="adm-alert-bar adm-alert-green">
          <div className="adm-alert-left">
            <span className="material-symbols-outlined adm-alert-icon">star</span>
            <p>5 new reviews received</p>
          </div>
          <button className="adm-alert-action">Read</button>
        </div>
      </div>

    </div>
  );
}

export { AdminDashboard };
