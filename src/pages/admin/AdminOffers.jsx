import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOffers.css";

const OFFERS = [
  {
    id: "o1",
    title: "Monsoon Milk Festival",
    deal: "₹60/L",
    subtitle: "A2 Cow Milk — limited days",
    description: "Get A2 Cow Milk at ₹60/L instead of ₹68/L. One-time purchase only. Limited period.",
    tags: ["Individual only", "A2 Cow Milk"],
    dateRange: "20 Jun — 25 Jun 2026",
    status: "active",
    headerColor: "#2d6a4f",
    icon: "water_drop",
    ordersPlaced: 62,
    target: 100,
    targetLabel: "62 orders placed of 100 target",
  },
  {
    id: "o2",
    title: "Pure Ghee Weekend Deal",
    deal: "₹550",
    subtitle: "Ghee 500g — save ₹70",
    description: "Buy Cow Ghee A2 500g at ₹550 instead of ₹620. Every weekend only. Saturday & Sunday.",
    tags: ["Individual only", "Weekends", "Every Sat-Sun — Jun 2026"],
    dateRange: "Every Sat-Sun — Jun 2026",
    status: "active",
    headerColor: "#d4a017",
    icon: "opacity",
    ordersPlaced: 28,
    target: 60,
    targetLabel: "28 orders placed of 60 target",
  },
  {
    id: "o3",
    title: "Paneer 3-Pack Offer",
    deal: "Buy 2 Get 1",
    subtitle: "Fresh Paneer 250g packs",
    description: "Buy 2 packs of Fresh Paneer 250g and get 1 pack free. Pay for 2, get 3. Today only.",
    tags: ["Individual only", "Today only", "10 Jun 2026 only"],
    dateRange: "10 Jun 2026 only",
    status: "active",
    headerColor: "#2980b9",
    icon: "lunch_dining",
    ordersPlaced: 17,
    target: 20,
    targetLabel: "17 of 20 packs claimed",
  },
  {
    id: "o4",
    title: "Morning Boost Offer",
    deal: "Free 500ml",
    subtitle: "On orders above 3L",
    description: "Order 3L or more A2 Milk in one purchase and get extra 500ml absolutely free added to your order.",
    tags: ["Individual only", "Min 3L order", "15 Jun — 30 Jun 2026"],
    dateRange: "15 Jun — 30 Jun 2026",
    status: "active",
    headerColor: "#6c5ce7",
    icon: "local_drink",
    ordersPlaced: 12,
    target: 40,
    targetLabel: "12 orders placed",
  },
  {
    id: "o5",
    title: "Summer Curd Special",
    deal: "₹35/200g",
    subtitle: "Curd — save ₹10",
    description: "Fresh Cow Curd at ₹35/200g instead of ₹45. Perfect summer offer. Stock limited daily.",
    tags: ["Individual only", "Summer special", "Starts 1 Jul 2026"],
    dateRange: "Starts 1 Jul 2026",
    status: "upcoming",
    headerColor: "#8e6b41",
    icon: "local_drink",
    countdown: "Starts in 21 days",
  },
  {
    id: "o6",
    title: "Butter Bonanza — July",
    deal: "₹70/100g",
    subtitle: "Table Butter — save ₹20",
    description: "Table Butter at ₹70/100g instead of ₹90. Fresh white butter made daily. Order any quantity.",
    tags: ["Individual only", "First week July", "1 Jul — 7 Jul 2026"],
    dateRange: "1 Jul — 7 Jul 2026",
    status: "upcoming",
    headerColor: "#d4a017",
    icon: "cookie",
    countdown: "Starts in 21 days",
  },
  {
    id: "o7",
    title: "Navratri Celebration Offer",
    deal: "15% OFF",
    subtitle: "All products — Navratri",
    description: "15% off on all individual orders during Navratri. Fresh dairy for your puja and celebrations.",
    tags: ["Individual only", "Festival", "2 Oct — 11 Oct 2026"],
    dateRange: "2 Oct — 11 Oct 2026",
    status: "upcoming",
    headerColor: "#b91c1c",
    icon: "celebration",
    countdown: "Scheduled — 4 months away",
  },
  {
    id: "o8",
    title: "Holi Dhamaka Offer",
    deal: "₹55/L",
    subtitle: "Holi special milk offer",
    description: "Fresh Cow Milk at ₹55/L for 3 days during Holi. Huge success — 210 orders placed.",
    tags: ["Individual only", "Festival", "13 Mar — 15 Mar 2026 — Ended"],
    dateRange: "13 Mar — 15 Mar 2026",
    status: "expired",
    headerColor: "#6b7280",
    icon: "water_drop",
    ordersPlaced: 210,
    target: 210,
    targetLabel: "210 orders — 100% target reached",
  },
  {
    id: "o9",
    title: "New Year Ghee Bonanza",
    deal: "₹500 Ghee",
    subtitle: "New Year Ghee offer",
    description: "Cow Ghee 500g at ₹500 for New Year week. 87 jars sold.",
    tags: ["Individual only", "1 Jan — 7 Jan 2026 — Ended"],
    dateRange: "1 Jan — 7 Jan 2026",
    status: "expired",
    headerColor: "#6b7280",
    icon: "opacity",
    ordersPlaced: 87,
    target: 100,
    targetLabel: "87 orders placed",
  },
  {
    id: "o10",
    title: "Diwali Combo — Ghee + Paneer",
    deal: "Combo Pack",
    subtitle: "Diwali special combo",
    description: "Buy Ghee 500g + Paneer 500g together at ₹900 instead of ₹1,070. Diwali gift packs.",
    tags: ["Individual only", "Combo", "1 Nov — 5 Nov 2025 — Ended"],
    dateRange: "1 Nov — 5 Nov 2025",
    status: "expired",
    headerColor: "#8e8d41",
    icon: "inventory_2",
    ordersPlaced: 95,
    target: 100,
    targetLabel: "95 combos sold",
  },
];

const TABS = [
  { key: "all",      label: "All" },
  { key: "active",   label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "expired",  label: "Expired / History" },
];

const STATUS_BADGE = {
  active:   { label: "Active",   cls: "of-badge-active" },
  upcoming: { label: "Upcoming", cls: "of-badge-upcoming" },
  expired:  { label: "Expired",  cls: "of-badge-expired" },
};

function AdminOffers() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("expired");

  const counts = {
    all:      OFFERS.length,
    active:   OFFERS.filter(o => o.status === "active").length,
    upcoming: OFFERS.filter(o => o.status === "upcoming").length,
    expired:  OFFERS.filter(o => o.status === "expired").length,
  };

  const visible = tab === "all" ? OFFERS : OFFERS.filter(o => o.status === tab);

  return (
    <div className="promo-page">

      {/* ── Header ── */}
      <div className="of-page-header">
        <h2 className="of-page-title">Offers &amp; Promotions</h2>
        <button type="button" className="of-create-btn" onClick={() => navigate("/admin/offers/create")}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Create new offer
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="of-kpi-grid">
        {[
          { key: "all",      icon: "local_activity", iconCls: "of-kpi-icon-green",  value: counts.all,      label: "Total offers created" },
          { key: "active",   icon: "bolt",           iconCls: "of-kpi-icon-yellow", value: counts.active,   label: "Currently active" },
          { key: "upcoming", icon: "schedule",       iconCls: "of-kpi-icon-blue",   value: counts.upcoming, label: "Upcoming / scheduled" },
        ].map(card => {
          const isFiltered = tab !== "all" && tab !== "expired";
          const isHighlight = tab === card.key;
          const isDim = isFiltered && !isHighlight;
          return (
            <button
              key={card.key}
              type="button"
              className={`of-kpi-card of-kpi-btn${isHighlight ? " of-kpi-card-highlight" : ""}${isDim ? " of-kpi-card-dim" : ""}`}
              onClick={() => setTab(card.key)}
            >
              <div className={`of-kpi-icon ${card.iconCls}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{card.icon}</span>
              </div>
              <div>
                <p className="of-kpi-value">{card.value}</p>
                <p className="of-kpi-label">{card.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div className="of-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`of-tab${tab === t.key ? " of-tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className={`of-tab-count${tab === t.key ? " of-tab-count-active" : ""}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Cards grid ── */}
      <div className="of-cards-grid">
        {visible.map(offer => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

    </div>
  );
}

function OfferCard({ offer }) {
  const badge    = STATUS_BADGE[offer.status];
  const isExpired  = offer.status === "expired";
  const isUpcoming = offer.status === "upcoming";
  const pct = offer.target ? Math.round((offer.ordersPlaced / offer.target) * 100) : 0;

  return (
    <article className={`of-card${isExpired ? " of-card-expired" : ""}`}>

      {/* ── Card header ── */}
      <header className="of-card-hdr" style={{ background: offer.headerColor }}>
        <div className="of-card-hdr-top">
          <div className="of-card-hdr-left">
            <div className="of-card-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>
                {offer.icon}
              </span>
            </div>
            <div className="of-card-deal-block">
              <span className="of-card-deal">{offer.deal}</span>
              <span className="of-card-subtitle">{offer.subtitle}</span>
            </div>
          </div>
          <span className={`of-badge ${badge.cls}`}>
            {offer.status === "active" && <span className="of-badge-dot" />}
            {offer.status === "expired" && <span className="of-badge-x">✕ </span>}
            {badge.label}
          </span>
        </div>
      </header>

      {/* ── Card body ── */}
      <div className="of-card-body">
        <h3 className="of-card-title">{offer.title}</h3>
        <p className="of-card-desc">{offer.description}</p>

        <div className="of-card-tags">
          {offer.tags.map(tag => (
            <span key={tag} className="of-tag">
              <span className="of-tag-dot" />
              {tag}
            </span>
          ))}
        </div>

        <p className="of-card-date">
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_today</span>
          {offer.dateRange}
        </p>

        <div className="of-card-bottom">
          {/* Active: label above bar */}
          {!isUpcoming && !isExpired && (
            <>
              <div className="of-progress-label">{offer.targetLabel}</div>
              <div className="of-progress-track">
                <div
                  className="of-progress-fill"
                  style={{ width: `${Math.min(pct, 100)}%`, background: offer.headerColor }}
                />
              </div>
            </>
          )}

          {/* Expired: thin bar then label below */}
          {isExpired && (
            <>
              <div className="of-progress-track of-progress-track-thin">
                <div className="of-progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: "#9ca3af" }} />
              </div>
              <div className="of-expired-label">{offer.targetLabel}</div>
            </>
          )}

          {/* Upcoming: countdown banner */}
          {isUpcoming && (
            <div className="of-countdown">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
              {offer.countdown}
            </div>
          )}

          {/* Actions */}
          <div className="of-card-actions">
            {!isExpired ? (
              <>
                <button type="button" className="of-action-outline">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                  View
                </button>
                <button type="button" className="of-action-outline">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                  Edit
                </button>
                <button type="button" className="of-action-danger">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    {isUpcoming ? "delete" : "stop_circle"}
                  </span>
                  {isUpcoming ? "Delete" : "Stop"}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="of-action-outline">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>bar_chart</span>
                  View report
                </button>
                <button type="button" className="of-action-outline">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>content_copy</span>
                  Duplicate
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </article>
  );
}

export { AdminOffers };
