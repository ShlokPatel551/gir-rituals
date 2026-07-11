import { useState } from "react";
import "./AdminNotifications.css";

const TABS = [
  { key: "all",       label: "All" },
  { key: "orders",    label: "Orders & subscriptions" },
  { key: "payments",  label: "Payments" },
  { key: "customers", label: "Customers" },
  { key: "stock",     label: "Stock" },
  { key: "refunds",   label: "Refunds" },
];

const TAB_DESC = {
  all:       "Showing all notifications across your dairy operations",
  orders:    "Showing notifications about new orders, subscriptions, extras, and cancellations",
  payments:  "Showing 5 notifications about payments received and reminders due",
  customers: "Showing notifications about new customer registrations",
  stock:     "Showing low stock and inventory alert notifications",
  refunds:   "Showing refund request and refund processed notifications",
};

const SEED_NOTIFS = [
  /* ── Payments ── */
  {
    id: "p01", category: "payments", day: "today",
    icon: "currency_rupee", iconBg: "#c1ecd4", iconColor: "#002114",
    title: "Payment received — Rakesh Mehta",
    desc: "₹650 for an individual order, paid via UPI",
    time: "11:42 AM", read: false, dotType: "primary",
  },
  {
    id: "p02", category: "payments", day: "today",
    icon: "currency_rupee", iconBg: "#c1ecd4", iconColor: "#002114",
    title: "Payment received — Arjun Patel",
    desc: "₹2,856 monthly bill paid via net banking",
    time: "10:05 AM", read: true,
  },
  {
    id: "p03", category: "payments", day: "today",
    icon: "warning", iconBg: "#ffdcc4", iconColor: "#6f3800",
    title: "Payment reminder due — Priya Shah",
    desc: "₹4,340 still unpaid, 6 days overdue",
    time: "09:00 AM", read: false, dotType: "tertiary",
  },
  {
    id: "p04", category: "payments", day: "today",
    icon: "notifications_active", iconBg: "#ffdcc4", iconColor: "#6f3800",
    title: "Payment reminder due — Sunita Rao",
    desc: "₹3,920 still unpaid, 22 days overdue",
    time: "09:05 AM", read: false, dotType: "tertiary",
  },
  {
    id: "p05", category: "payments", day: "today",
    icon: "receipt", iconBg: "#c1ecd4", iconColor: "#002114",
    title: "Payment received — Meena Joshi",
    desc: "₹150 for a one-time order, paid via card",
    time: "07:45 AM", read: true,
  },

  /* ── Orders & subscriptions ── */
  {
    id: "o01", category: "orders", day: "today",
    icon: "shopping_cart", iconBg: "#ffdcc4", iconColor: "#6f3800",
    title: "New one-time order — Rakesh Mehta",
    desc: "Cow ghee 500g, ₹650, paid via UPI",
    time: "11:40 AM", read: true,
  },
  {
    id: "o02", category: "orders", day: "today",
    icon: "card_membership", iconBg: "#ffca98", iconColor: "#7a532a",
    title: "New subscription started — Arjun Patel",
    desc: "Cow milk, 2L/day, starting today",
    time: "09:50 AM", read: true,
  },
  {
    id: "o03", category: "orders", day: "today",
    icon: "cancel", iconBg: "#ffdad6", iconColor: "#ba1a1a",
    title: "Subscription cancelled — Sunita Rao",
    desc: "Buffalo milk plan cancelled, effective today",
    time: "09:30 AM", read: false, dotType: "tertiary", accent: "error",
  },
  {
    id: "o04", category: "orders", day: "today",
    icon: "add_circle", iconBg: "#c1ecd4", iconColor: "#012d1d",
    title: "Extra added — Priya Shah",
    desc: "1L extra cow milk added to today's delivery",
    time: "08:55 AM", read: false, dotType: "primary", accent: "primary",
  },
  {
    id: "o05", category: "orders", day: "today",
    icon: "order_approve", iconBg: "#e6e1e0", iconColor: "#717973",
    title: "Order cancelled — Meena Joshi",
    desc: "One-time order ORD-1042 cancelled by customer",
    time: "07:20 AM", read: true,
  },

  /* ── Customers ── */
  {
    id: "c01", category: "customers", day: "today",
    icon: "person_add", iconBg: "#c1ecd4", iconColor: "#002114",
    title: "New customer registered — Meena Joshi",
    desc: "GR-0211, Surat",
    time: "10:15 AM", read: false, dotType: "primary",
  },
  {
    id: "c02", category: "customers", day: "today",
    icon: "person_add", iconBg: "#c1ecd4", iconColor: "#002114",
    title: "New customer registered — Vikram Joshi",
    desc: "GR-0212, Ahmedabad",
    time: "08:05 AM", read: true,
  },
  {
    id: "c03", category: "customers", day: "yesterday",
    icon: "person_add", iconBg: "#c1ecd4", iconColor: "#002114",
    title: "New customer registered — Anjali Desai",
    desc: "GR-0210, Ahmedabad",
    time: "1d ago", read: true,
  },

  /* ── Stock ── */
  {
    id: "s01", category: "stock", day: "today",
    icon: "inventory_2", iconBg: "#ffdcc4", iconColor: "#5f2f00",
    title: "Low stock alert — A2 Ghee 500ml",
    desc: "Only 12 units left. Consider restocking.",
    time: "08:00 AM", read: false, dotType: "tertiary",
  },

  /* ── Refunds ── */
  {
    id: "r01", category: "refunds", day: "today",
    icon: "settings_backup_restore", iconBg: "#ffdad6", iconColor: "#ba1a1a",
    title: "New refund request — Ananya Varma",
    desc: "₹450 refund requested for ORD-1088",
    time: "07:45 AM", read: false, dotType: "tertiary",
  },

  /* ── Deliveries (shows under "All" only) ── */
  {
    id: "d01", category: "deliveries", day: "yesterday",
    icon: "local_shipping", iconBg: "#a5d0b9", iconColor: "#274e3d",
    title: "All morning deliveries completed",
    desc: "247 of 247 deliveries marked successful for 17 June",
    time: "1d ago", read: true,
  },
];

function NotifItem({ notif, onDelete }) {
  const isUnread = !notif.read;

  // Read items use muted gray icon colors
  const iconBg    = notif.read ? "#f2edec" : notif.iconBg;
  const iconColor = notif.read ? "#717973" : notif.iconColor;

  let cls = `nc-item${notif.read ? " nc-item-read" : " nc-item-unread"}`;
  if (notif.accent === "error")   cls += " nc-item-accent-error";
  if (notif.accent === "primary") cls += " nc-item-accent-primary";

  return (
    <div className={cls}>
      <div className="nc-icon-box" style={{ background: iconBg, color: iconColor }}>
        <span className="material-symbols-outlined">{notif.icon}</span>
      </div>

      <div className="nc-item-body">
        <div className="nc-item-top">
          <div className="nc-item-title-row">
            {isUnread && (
              <span
                className="nc-pulse-dot"
                style={notif.dotType === "tertiary" ? { background: "#ea9147" } : undefined}
              />
            )}
            <h4 className="nc-item-title">{notif.title}</h4>
          </div>
          <span className="nc-time">{notif.time}</span>
        </div>
        <p className="nc-item-desc">{notif.desc}</p>
      </div>

      <button
        type="button"
        className="nc-delete-btn"
        onClick={e => { e.stopPropagation(); onDelete(notif.id); }}
        aria-label="Delete notification"
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  );
}

function AdminNotifications() {
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const [tab, setTab]       = useState("all");

  const tabFilter = n => tab === "all" || n.category === tab;
  const filtered       = notifs.filter(tabFilter);
  const todayItems     = filtered.filter(n => n.day === "today");
  const yesterdayItems = filtered.filter(n => n.day === "yesterday");

  const total  = notifs.length;
  const unread = notifs.filter(n => !n.read).length;
  const read   = total - unread;

  const tabCount = key =>
    key === "all" ? notifs.length : notifs.filter(n => n.category === key).length;

  const handleDelete     = id  => setNotifs(prev => prev.filter(n => n.id !== id));
  const handleMarkAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const handleDeleteAll   = () => setNotifs(prev => prev.filter(n => !tabFilter(n)));

  return (
    <div className="nc-page">

      {/* ── Page header ── */}
      <div className="nc-page-header">
        <div>
          <h2 className="nc-page-title">Notifications</h2>
          <p className="nc-page-desc">Stay updated with real-time activities across your dairy operations.</p>
        </div>
        <div className="nc-actions">
          <button type="button" className="nc-btn-outline" onClick={handleMarkAllRead}>
            <span className="material-symbols-outlined">done_all</span>
            Mark All as Read
          </button>
          <button type="button" className="nc-btn-danger" onClick={handleDeleteAll}>
            <span className="material-symbols-outlined">delete_sweep</span>
            Delete
          </button>
        </div>
      </div>

      {/* ── Date filter ── */}
      <div className="nc-date-filter">
        <div className="nc-date-btn">
          <span className="material-symbols-outlined">calendar_today</span>
          18 June 2026
        </div>
        <button type="button" className="nc-today-btn">Today</button>
      </div>

      {/* ── KPI cards ── */}
      <div className="nc-kpi-grid">
        <div className="nc-kpi-card">
          <p className="nc-kpi-label">Total notifications</p>
          <div className="nc-kpi-row">
            <p className="nc-kpi-value">{total}</p>
            <span className="nc-kpi-sub">Items today</span>
          </div>
        </div>
        <div className="nc-kpi-card">
          <p className="nc-kpi-label">Read</p>
          <div className="nc-kpi-row">
            <p className="nc-kpi-value nc-kpi-green">{read}</p>
            <span className="nc-kpi-sub">Managed</span>
          </div>
        </div>
        <div className="nc-kpi-card">
          <p className="nc-kpi-label">Unread</p>
          <div className="nc-kpi-row">
            <p className="nc-kpi-value nc-kpi-amber">{unread}</p>
            <span className="nc-kpi-sub">Pending action</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="nc-tabs-wrap">
        <div className="nc-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              className={`nc-tab${tab === t.key ? " nc-tab-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className={`nc-tab-badge${tab === t.key ? " nc-tab-badge-active" : ""}`}>
                {tabCount(t.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter description ── */}
      <p className="nc-filter-desc">{TAB_DESC[tab]}</p>

      {/* ── Notifications list ── */}
      <div className="nc-list">
        {todayItems.length > 0 && (
          <section>
            <h3 className="nc-group-title">Today</h3>
            <div className="nc-group-items">
              {todayItems.map(n => (
                <NotifItem key={n.id} notif={n} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {yesterdayItems.length > 0 && (
          <section>
            <h3 className="nc-group-title">Yesterday</h3>
            <div className="nc-group-items">
              {yesterdayItems.map(n => (
                <NotifItem key={n.id} notif={n} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="nc-empty">
            <span className="material-symbols-outlined">notifications_off</span>
            <p>No {tab === "all" ? "" : tab} notifications.</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="nc-footer">
        <p className="nc-footer-text">
          Showing {filtered.length} notification{filtered.length !== 1 ? "s" : ""} for 18 June 2026
        </p>
        <button type="button" className="nc-show-all-btn">
          Show all {total}
        </button>
      </div>

    </div>
  );
}

export { AdminNotifications };
