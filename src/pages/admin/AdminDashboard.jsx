import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminDashboard.css";

const AVATAR_COLORS = ["#F5DFC8", "#EBE0D2", "#F4E3D0", "#D9C5B2", "#ffdcbd"];

const REVENUE_BARS = [
  { day: "Mon", amt: "₹6.2k", h: 60,  dim: true  },
  { day: "Tue", amt: "₹7.8k", h: 75,  dim: true  },
  { day: "Wed", amt: "₹5.4k", h: 52,  dim: true  },
  { day: "Thu", amt: "₹9.1k", h: 88,  dim: true  },
  { day: "Fri", amt: "₹8.0k", h: 77,  dim: true  },
  { day: "Sat", amt: "₹10.4k",h: 100, dim: true  },
  { day: "Today",amt: "₹8.4k",h: 81,  dim: false },
];

const QUICK_ACTIONS = [
  { label: "New order",      sub: "Add one-time or subscription", icon: "add_shopping_cart", iconBg: "#d1fae5", iconColor: "#059669", path: "/admin/orders/new"    },
  { label: "Add customer",   sub: "Register a new customer",      icon: "person_add",        iconBg: "#dbeafe", iconColor: "#1d4ed8", path: "/admin/customers"      },
  { label: "View deliveries",sub: "Today's route & status",       icon: "local_shipping",    iconBg: "#fef3c7", iconColor: "#d97706", path: "/admin/deliveries"     },
  { label: "Log production", sub: "Record today's batch",         icon: "agriculture",       iconBg: "#f3e8ff", iconColor: "#7c3aed", path: "/admin/production"     },
];

const ACTIVITY_FEED = [
  { icon: "currency_rupee", cls: "act-green", title: "Payment received — Rakesh Mehta",   sub: "₹650 via UPI · 11:42 AM"             },
  { icon: "person_add",     cls: "act-blue",  title: "New customer — Meena Joshi",         sub: "GR-0247, Surat · 10:15 AM"            },
  { icon: "warning",        cls: "act-amber", title: "Payment overdue — Priya Shah",       sub: "₹4,340 · 6 days late · 09:00 AM"     },
  { icon: "cancel",         cls: "act-red",   title: "Subscription cancelled — Sunita Rao",sub: "Buffalo milk plan · 09:30 AM"         },
  { icon: "local_shipping", cls: "act-gray",  title: "Morning deliveries complete",        sub: "247 / 247 successful · Yesterday"     },
];

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

function fmtMonth() {
  return new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView]           = useState("today");
  const [stats, setStats]         = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    api.adminDashboard().then(setStats).catch(() => {});
    api.adminOrders().then(d => setRecentOrders((d.rows ?? []).slice(0, 5))).catch(() => {});
  }, []);

  const totalCustomers      = stats?.totalCustomers      ?? "—";
  const activeSubscriptions = stats?.activeSubscriptions ?? "—";
  const todayDeliveries     = stats?.totalOrders         ?? "—";
  const todayRevenue = stats
    ? `₹${Number(stats.totalRevenue / 30).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : "₹8,400";
  const monthlyRevenue = stats
    ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`
    : "₹2,52,000";

  const todayKpis = [
    { label: "Total customers",      value: totalCustomers,      sub: "Registered on app or website",       top: "green", trend: "up",   trendLabel: "+3 today"          },
    { label: "Active subscriptions", value: activeSubscriptions, sub: "Daily delivery customers",           top: "teal",  trend: "up",   trendLabel: "+2 today"          },
    { label: "Today's deliveries",   value: todayDeliveries,     sub: "148 done · 20 pending",             top: "amber", trend: "done", trendLabel: "84% done"          },
    { label: "Today's revenue",      value: todayRevenue,        sub: "From deliveries + extras",           top: "green", trend: "up",   trendLabel: "+12% vs yesterday" },
    { label: "Overdue payments",     value: "8",                 sub: "Customers past due date",            top: "red",   trend: "warn", trendLabel: "₹34,200 pending"   },
    { label: "Pending refunds",      value: "3",                 sub: "Awaiting review",                    top: "blue",  trend: "info", trendLabel: "Action needed"     },
  ];

  const monthKpis = [
    { label: "Total customers",      value: totalCustomers,      sub: "Active base",                        top: "green", trend: "up",   trendLabel: "+18 this month"    },
    { label: "Active subscriptions", value: activeSubscriptions, sub: "Daily deliveries",                   top: "teal",  trend: "up",   trendLabel: "+9 this month"     },
    { label: "Total deliveries",     value: "4,180",             sub: "Across all products",                top: "amber", trend: "done", trendLabel: "92% success rate"  },
    { label: "Monthly revenue",      value: monthlyRevenue,      sub: "+11% vs last month",                 top: "green", trend: "up",   trendLabel: "+11% vs last month"},
    { label: "Overdue payments",     value: "8",                 sub: "Customers past due date",            top: "red",   trend: "warn", trendLabel: "₹34,200 pending"   },
    { label: "Pending refunds",      value: "3",                 sub: "Awaiting review",                    top: "blue",  trend: "info", trendLabel: "Action needed"     },
  ];

  const kpis = view === "today" ? todayKpis : monthKpis;

  const TREND_META = {
    up:   { icon: "trending_up",   cls: "trend-up"   },
    down: { icon: "trending_down", cls: "trend-down" },
    done: { icon: "check_circle",  cls: "trend-done" },
    warn: { icon: "warning",       cls: "trend-warn" },
    info: { icon: "info",          cls: "trend-info" },
  };

  const DONUT_TODAY = {
    pct: "84%",
    segments: [
      { color: "#2d6a4f", dash: "84 16", offset: "0",   label: "Delivered", val: "148 (84%)" },
      { color: "#b45309", dash: "11 89", offset: "-84",  label: "Pending",   val: "20 (11%)"  },
      { color: "#fbbf24", dash: "5 95",  offset: "-95",  label: "Paused",    val: "8 (5%)"    },
    ],
  };
  const DONUT_MONTH = {
    pct: "92%",
    segments: [
      { color: "#2d6a4f", dash: "92 8",  offset: "0",   label: "Delivered", val: "4,180 (92%)" },
      { color: "#b45309", dash: "5 95",  offset: "-92",  label: "Pending",   val: "250 (5%)"    },
      { color: "#fbbf24", dash: "3 97",  offset: "-97",  label: "Paused",    val: "120 (3%)"    },
    ],
  };
  const donut = view === "today" ? DONUT_TODAY : DONUT_MONTH;

  const ALERTS = [
    { cls: "alert-red",   iconCls: "alert-icon-red",   icon: "sync_problem",  label: "3 refund requests",        sub: "Waiting for review",   cta: "Review",  ctaCls: "alert-cta-red",   path: "/admin/refunds"  },
    { cls: "alert-amber", iconCls: "alert-icon-amber",  icon: "warning",       label: "8 overdue customers",      sub: "₹34,200 uncollected",  cta: "Remind",  ctaCls: "alert-cta-amber", path: "/admin/billing"  },
    { cls: "alert-amber", iconCls: "alert-icon-amber",  icon: "inventory_2",   label: "Low stock — A2 Ghee",      sub: "Only 12 units left",   cta: "Restock", ctaCls: "alert-cta-amber", path: "/admin/products" },
    { cls: "alert-green", iconCls: "alert-icon-green",  icon: "check_circle",  label: "Morning route complete",   sub: "247 of 247 delivered", cta: "Details", ctaCls: "alert-cta-green", path: "/admin/deliveries"},
  ];

  return (
    <div className="adm-dashboard">

      {/* ── Greeting ── */}
      <div className="adm-greeting-row">
        <div>
          <h1 className="adm-greeting-title">{getGreeting()}, Gir Rituals 👋</h1>
          <p className="adm-greeting-sub">
            {fmtFullDate()} &nbsp;|&nbsp; <strong>Here's how your business looks today</strong>
          </p>
        </div>
        <div className="adm-toggle-wrap">
          <button className={`adm-toggle-btn${view === "today" ? " active" : ""}`} onClick={() => setView("today")}>Today</button>
          <button className={`adm-toggle-btn${view === "month" ? " active" : ""}`} onClick={() => setView("month")}>This month</button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="adm-kpi-strip adm-fade" key={`kpi-${view}`}>
        {kpis.map(k => {
          const tm = TREND_META[k.trend];
          return (
            <div key={k.label} className={`adm-kpi-card adm-top-${k.top}`}>
              <div className="adm-kpi-label">{k.label}</div>
              <div className="adm-kpi-value">{k.value}</div>
              <div className="adm-kpi-sub">{k.sub}</div>
              <span className={`adm-trend-badge ${tm.cls}`}>
                <span className="material-symbols-outlined adm-trend-icon">{tm.icon}</span>
                {k.trendLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Mid row: donut + revenue bars + quick actions ── */}
      <div className="adm-mid-row adm-fade" key={`mid-${view}`}>

        {/* Donut */}
        <div className="adm-card adm-donut-card">
          <h4 className="adm-card-title">Delivery status breakdown</h4>
          <div className="adm-donut-wrap">
            <svg className="adm-donut-svg" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f2edec" strokeWidth="3.5" />
              {donut.segments.map(seg => (
                <circle key={seg.label} cx="18" cy="18" r="15.915" fill="transparent"
                  stroke={seg.color} strokeWidth="3.5"
                  strokeDasharray={seg.dash} strokeDashoffset={seg.offset}
                />
              ))}
            </svg>
            <div className="adm-donut-center">
              <span className="adm-donut-pct">{donut.pct}</span>
              <span className="adm-donut-lbl">Complete</span>
            </div>
          </div>
          <div className="adm-donut-legend">
            {donut.segments.map(seg => (
              <div key={seg.label} className="adm-legend-row">
                <span className="adm-legend-dot" style={{ background: seg.color }} />
                <span className="adm-legend-name">{seg.label}</span>
                <span className="adm-legend-val">{seg.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue bar chart */}
        <div className="adm-card adm-rev-card">
          <div className="adm-card-title-row">
            <h4 className="adm-card-title" style={{ margin: 0 }}>Revenue — last 7 days</h4>
            <button className="adm-text-link" onClick={() => navigate("/admin/finance")}>View finance →</button>
          </div>
          <div className="adm-rev-chart">
            {REVENUE_BARS.map(b => (
              <div key={b.day} className="adm-bar-wrap">
                <span className="adm-bar-amt">{b.amt}</span>
                <div className={`adm-bar${b.dim ? " adm-bar-dim" : ""}`} style={{ height: `${b.h}%` }} />
                <span className={`adm-bar-day${!b.dim ? " adm-bar-day-today" : ""}`}>{b.day}</span>
              </div>
            ))}
          </div>
          <div className="adm-rev-summary">
            <div>
              <div className="adm-rev-stat-label">Today</div>
              <div className="adm-rev-stat-val">{todayRevenue}</div>
            </div>
            <div>
              <div className="adm-rev-stat-label">This week</div>
              <div className="adm-rev-stat-val">₹55,300</div>
            </div>
            <div>
              <div className="adm-rev-stat-label">This month</div>
              <div className="adm-rev-stat-val">{monthlyRevenue}</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div className="adm-rev-stat-label">vs last week</div>
              <div className="adm-rev-stat-val adm-rev-up">↑ 14%</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="adm-card adm-qa-card">
          <div className="adm-section-label">Quick actions</div>
          <div className="adm-qa-list">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} className="adm-qa-btn" onClick={() => navigate(a.path)}>
                <div className="adm-qa-icon" style={{ background: a.iconBg }}>
                  <span className="material-symbols-outlined" style={{ color: a.iconColor, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                </div>
                <div className="adm-qa-text">
                  <span className="adm-qa-label">{a.label}</span>
                  <span className="adm-qa-sub">{a.sub}</span>
                </div>
                <span className="material-symbols-outlined adm-qa-arrow">chevron_right</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: orders table + right panel ── */}
      <div className="adm-bot-row">

        {/* Recent orders */}
        <div className="adm-card adm-table-card">
          <div className="adm-table-hdr">
            <div className="adm-table-hdr-left">
              <span className="material-symbols-outlined" style={{ color: "#2d6a4f", fontSize: 20 }}>receipt_long</span>
              <h3 className="adm-card-title" style={{ margin: 0 }}>Recent orders &amp; sign-ups</h3>
            </div>
            <Link to="/admin/orders" className="adm-view-all-btn">View all</Link>
          </div>
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="adm-td-empty">No orders yet</td>
                  </tr>
                ) : recentOrders.map((row) => {
                  const name     = `${row.first_name} ${row.last_name}`;
                  const clientId = `GR-${String(row.id).padStart(4, "0")}`;
                  const status   = row.status ?? "completed";
                  return (
                    <tr key={row.id}>
                      <td className="adm-td-id">{clientId}</td>
                      <td className="adm-td-name">{name}</td>
                      <td><span className="adm-badge adm-badge-sub">Subscription</span></td>
                      <td className="adm-td-muted">{row.product_name}</td>
                      <td className="adm-td-muted">{row.qty}</td>
                      <td><span className={`adm-badge adm-badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                      <td className="adm-td-amount">{row.amount ? `₹${row.amount}` : "—"}</td>
                      <td><span className="adm-badge adm-badge-paid">Paid</span></td>
                      <td><button className="adm-action-btn" onClick={() => navigate(`/admin/orders/${row.id}`)}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="adm-right-panel">

          {/* Needs attention */}
          <div className="adm-card">
            <div className="adm-section-label">Needs attention</div>
            {ALERTS.map(a => (
              <div key={a.label} className={`adm-alert-item ${a.cls}`} onClick={() => navigate(a.path)}>
                <div className={`adm-alert-icon ${a.iconCls}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                </div>
                <div className="adm-alert-text">
                  <div className="adm-alert-label">{a.label}</div>
                  <div className="adm-alert-sub">{a.sub}</div>
                </div>
                <button className={`adm-alert-cta ${a.ctaCls}`} onClick={e => { e.stopPropagation(); navigate(a.path); }}>
                  {a.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="adm-card">
            <div className="adm-card-title-row" style={{ marginBottom: "0.875rem" }}>
              <div className="adm-section-label" style={{ margin: 0 }}>Recent activity</div>
              <button className="adm-text-link" onClick={() => navigate("/admin/notifications")}>View all →</button>
            </div>
            <div className="adm-activity-list">
              {ACTIVITY_FEED.map((a, i) => (
                <div key={i} className={`adm-activity-item${i < ACTIVITY_FEED.length - 1 ? " adm-activity-line" : ""}`}>
                  <div className={`adm-act-dot ${a.cls}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                  </div>
                  <div className="adm-act-body">
                    <div className="adm-act-title">{a.title}</div>
                    <div className="adm-act-time">{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export { AdminDashboard };
