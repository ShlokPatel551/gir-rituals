import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { PROMO_NOTIFICATIONS } from "../lib/promoData";
import "./Notifications.css";

/* ── Type config ─────────────────────────────────────────────── */
const TYPE_CONFIG = {
  delivery: { icon: "local_shipping", bg: "#c5eadf", color: "#01261f" },
  payment:  { icon: "receipt_long",   bg: "#ebdec6", color: "#6a624f" },
  offer:    { icon: "celebration",    bg: "#ffdea5", color: "#261900" },
  info:     { icon: "info",           bg: "#efedec", color: "#414846" },
};

const TABS = [
  { key: "all",      label: "All Activity" },
  { key: "delivery", label: "Delivery"     },
  { key: "payment",  label: "Payments"     },
  { key: "offer",    label: "Offers"       },
];

/* ── Mock data ───────────────────────────────────────────────── */
const MOCK_NOTIFS = [
  // Active offer/banner notifications injected from admin promo data
  ...PROMO_NOTIFICATIONS,
  {
    id: "mn1", type: "delivery", group: "today", read: false,
    title: "Fresh A2 Milk Out for Delivery",
    message: "Your daily subscription of 2L Gir Cow A2 Milk is with our delivery partner and will reach you by 7:30 AM.",
    time: "06:45 AM",
    actions: [
      { label: "Track Delivery",     to: "/orders"                            },
      { label: "Pause for tomorrow", toast: "Delivery paused for tomorrow."   },
    ],
  },
  {
    id: "mn2", type: "payment", group: "today", read: true,
    title: "Wallet Recharged Successfully",
    message: "₹5,000 has been added to your wallet. You have received a bonus of ₹250 as part of the Loyalty Ritual.",
    time: "Yesterday, 09:15 PM",
  },
  {
    id: "mn3", type: "offer", group: "week", read: false,
    title: "The Vedic Ghee Ritual: Early Access",
    message: "Our limited batch of Hand-Churned Bilona Ghee is now available. As a ritual member, you get 20% off on your first purchase.",
    time: "Oct 24, 11:30 AM",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVjs53Ox8EDYhBxvk2H69t7_Oy1bsrfVN9jHn0qp0Zp4UB_RiprNn9kqtaxbJf3Fmc6aGPbAyQ6Ri5tPgdTAKCk12m_rU7s8tJLrLa7_GTTR14qbiwrNX7FVInF_eMDdEX5n2AjkhSGGW0eZ8JOd8iM56IM4vy8koKMN8Bie3jRAeUkJB67FFMlbE1tO9bhngoA5RHWhMqBMs_tCcIbQ2Z9Dg5w798R6XhFet0NtNPHH9lDBlQy2M5nsANiHFPeZTiGaG9zXZNN-0q",
    cta: { label: "Claim Offer", to: "/offers" },
  },
  {
    id: "mn4", type: "info", group: "week", read: true,
    title: "Scheduled Maintenance",
    message: "Our app will be undergoing maintenance on Sunday, Oct 27th between 2 AM and 4 AM. Subscription modifications will be unavailable during this time.",
    time: "Oct 23, 10:00 AM",
  },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function inferType(n) {
  const text = `${n.title ?? ""} ${n.message ?? ""}`.toLowerCase();
  if (/deliver|ship|dispatch|schedule|paused|resumed/.test(text)) return "delivery";
  if (/pay|wallet|bill|receipt|recharge|paid/.test(text))         return "payment";
  if (/offer|discount|deal|promo|\d+% off|combo/.test(text))      return "offer";
  return "info";
}

function assignGroup(timeStr) {
  if (!timeStr) return "older";
  const d = new Date(timeStr);
  if (isNaN(d)) return "older";
  const diffHours = (Date.now() - d) / 3600000;
  if (diffHours < 24)  return "today";
  if (diffHours < 168) return "week";
  return "older";
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const d = new Date(timeStr);
  if (isNaN(d)) return timeStr;
  const diffHours = (Date.now() - d) / 3600000;
  const timeOnly = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diffHours < 24) return timeOnly;
  if (diffHours < 48) return `Yesterday, ${timeOnly}`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + `, ${timeOnly}`;
}

function toNormalized(n) {
  const rawTime = n.time ?? n.createdAt ?? "";
  return {
    id:      n.id,
    type:    n.type ?? inferType(n),
    group:   assignGroup(rawTime),
    read:    !!n.read,
    title:   n.title ?? "",
    message: n.message ?? n.body ?? "",
    time:    formatTime(rawTime),
    link:    n.link,
  };
}

/* ── Notification Card ───────────────────────────────────────── */
function NotifCard({ notif, onRead, showToast }) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info;

  return (
    <div
      className={`nt-card ${notif.read ? "nt-card-read" : "nt-card-unread"}`}
      onClick={() => { if (!notif.read) onRead(notif.id); }}
    >
      {/* Icon */}
      <div className="nt-card-icon" style={{ background: cfg.bg }}>
        <span className="material-symbols-outlined" style={{ color: cfg.color }}>{cfg.icon}</span>
      </div>

      {/* Body */}
      <div className="nt-card-body">
        <div className="nt-card-hdr">
          <h4 className="nt-card-title">{notif.title}</h4>
          <span className="nt-card-time">{notif.time}</span>
        </div>

        <p className="nt-card-message">{notif.message}</p>

        {notif.image && (
          <img
            src={notif.image}
            alt={notif.title}
            className="nt-card-img"
            onError={e => { e.target.style.display = "none"; }}
          />
        )}

        {notif.actions?.length > 0 && (
          <div className="nt-card-actions">
            {notif.actions.map((a, i) =>
              a.to
                ? <Link key={i} to={a.to} className="nt-action-primary" onClick={e => e.stopPropagation()}>{a.label}</Link>
                : <button key={i} type="button" className="nt-action-secondary" onClick={e => { e.stopPropagation(); showToast(a.toast ?? a.label, "info"); }}>{a.label}</button>
            )}
          </div>
        )}

        {notif.cta && (
          <Link to={notif.cta.to} className="nt-card-cta" onClick={e => e.stopPropagation()}>
            {notif.cta.label}
          </Link>
        )}
      </div>

      {!notif.read && <div className="nt-unread-dot" />}
    </div>
  );
}

/* ── Timeline Section ────────────────────────────────────────── */
function TimelineSection({ icon, label, items, onRead, showToast }) {
  if (items.length === 0) return null;
  return (
    <div className="nt-section">
      <div className="nt-section-dot">
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <p className="nt-section-label">{label}</p>
      <div className="nt-cards">
        {items.map(n => (
          <NotifCard key={n.id} notif={n} onRead={onRead} showToast={showToast} />
        ))}
      </div>
    </div>
  );
}

/* ── Main Notifications Component ────────────────────────────── */
function Notifications() {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("all");
  const [localRead, setLocalRead] = useState(() => new Set());

  const isReal = notifications.length > 0;

  const allItems = useMemo(() => {
    const base = isReal ? notifications.map(toNormalized) : MOCK_NOTIFS;
    return base.map(n => ({ ...n, read: n.read || localRead.has(n.id) }));
  }, [notifications, isReal, localRead]);

  const filtered = activeTab === "all"
    ? allItems
    : allItems.filter(n => n.type === activeTab);

  const todayItems = filtered.filter(n => n.group === "today");
  const weekItems  = filtered.filter(n => n.group === "week");
  const olderItems = filtered.filter(n => n.group === "older");

  const unreadCount = allItems.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    if (isReal) markAllNotificationsRead();
    setLocalRead(new Set(allItems.map(n => n.id)));
    showToast("All notifications marked as read.");
  };

  const handleMarkRead = (id) => {
    setLocalRead(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (isReal) markNotificationRead(id);
  };

  return (
    <div className="nt-page">

      {/* ══ HEADER ══ */}
      <div className="nt-header">
        <div>
          <h2 className="nt-title">Notification Center</h2>
          <p className="nt-subtitle">Stay updated with your daily dairy rituals and subscriptions.</p>
        </div>
        <div className="nt-header-actions">
          {unreadCount > 0 && (
            <button type="button" className="nt-btn-outline" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          )}
          <button
            type="button"
            className="nt-btn-ghost"
            onClick={() => showToast("Notification settings coming soon.", "info")}
          >
            Settings
          </button>
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="nt-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`nt-tab ${activeTab === tab.key ? "nt-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ TIMELINE ══ */}
      <div className="nt-timeline">
        <TimelineSection
          icon="today"
          label="Today"
          items={todayItems}
          onRead={handleMarkRead}
          showToast={showToast}
        />
        <TimelineSection
          icon="history"
          label="Earlier this Week"
          items={weekItems}
          onRead={handleMarkRead}
          showToast={showToast}
        />
        <TimelineSection
          icon="calendar_month"
          label="Older"
          items={olderItems}
          onRead={handleMarkRead}
          showToast={showToast}
        />

        {filtered.length === 0 && (
          <div className="nt-empty">
            <span className="material-symbols-outlined nt-empty-icon">notifications_off</span>
            <p>No notifications in this category.</p>
          </div>
        )}
      </div>

      {/* ══ LOAD MORE ══ */}
      <div className="nt-load-more-wrap">
        <button
          type="button"
          className="nt-load-more"
          onClick={() => showToast("No older notifications.", "info")}
        >
          Load previous notifications
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      </div>

    </div>
  );
}

export { Notifications };
