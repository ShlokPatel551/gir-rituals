import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminOffers.css";

const SEED_OFFERS = [
  {
    id: "s1",
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
    id: "s2",
    title: "Pure Ghee Weekend Deal",
    deal: "₹550",
    subtitle: "Ghee 500g — save ₹70",
    description: "Buy Cow Ghee A2 500g at ₹550 instead of ₹620. Every weekend only.",
    tags: ["Individual only", "Weekends"],
    dateRange: "Every Sat-Sun — Jun 2026",
    status: "active",
    headerColor: "#d4a017",
    icon: "opacity",
    ordersPlaced: 28,
    target: 60,
    targetLabel: "28 orders placed of 60 target",
  },
  {
    id: "s3",
    title: "Summer Curd Special",
    deal: "₹35/200g",
    subtitle: "Curd — save ₹10",
    description: "Fresh Cow Curd at ₹35/200g instead of ₹45.",
    tags: ["Individual only", "Summer special"],
    dateRange: "Starts 1 Jul 2026",
    status: "upcoming",
    headerColor: "#8e6b41",
    icon: "local_drink",
    countdown: "Starts in 21 days",
  },
  {
    id: "s4",
    title: "Holi Dhamaka Offer",
    deal: "₹55/L",
    subtitle: "Holi special milk offer",
    description: "Fresh Cow Milk at ₹55/L for 3 days during Holi.",
    tags: ["Individual only", "Festival"],
    dateRange: "13 Mar — 15 Mar 2026",
    status: "expired",
    headerColor: "#6b7280",
    icon: "water_drop",
    ordersPlaced: 210,
    target: 210,
    targetLabel: "210 orders — 100% target reached",
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
  draft:    { label: "Draft",    cls: "of-badge-upcoming" },
};

// map API offer to card-display shape
function normalizeOffer(o) {
  const pp = o.offerPrice ?? null;
  const op = o.origPrice  ?? null;
  const deal = pp != null
    ? `₹${pp}`
    : o.deal ?? "—";
  const dateRange = o.startDate && o.endDate
    ? `${o.startDate} — ${o.endDate}`
    : o.startDate
    ? `From ${o.startDate}`
    : o.dateRange ?? "";
  const target   = o.maxOrders   ?? o.target    ?? 0;
  const placed   = o.ordersPlaced ?? 0;
  return {
    ...o,
    deal,
    subtitle: op != null ? `instead of ₹${op}` : o.subtitle ?? "",
    tags: o.tags ?? [o.orderType === "subscription" ? "Subscriptions" : "Individual only"],
    dateRange,
    target,
    ordersPlaced: placed,
    targetLabel: target > 0 ? `${placed} orders placed of ${target} target` : `${placed} orders placed`,
    countdown: o.countdown ?? (o.startDate ? `Starts on ${o.startDate}` : "Scheduled"),
  };
}

function AdminOffers() {
  const navigate = useNavigate();
  const [offers, setOffers]   = useState(SEED_OFFERS);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab, setTab] = useState("all");

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.adminOffers();
      setOffers(data.length > 0 ? data.map(normalizeOffer) : SEED_OFFERS);
    } catch {
      // keep seed data on failure so UI is never empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOffers(); }, [loadOffers]);

  const handleStop = async (offer) => {
    if (!window.confirm(`Stop "${offer.title}"? This will end the offer for customers.`)) return;
    try {
      if (String(offer.id).startsWith("s")) {
        // seed data — just remove from local state
        setOffers(prev => prev.filter(o => o.id !== offer.id));
        return;
      }
      await api.adminUpdateOffer(offer.id, { status: "expired" });
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: "expired" } : o));
    } catch (e) {
      alert(e.message || "Failed to stop offer.");
    }
  };

  const handleDelete = async (offer) => {
    if (!window.confirm(`Delete "${offer.title}"? This cannot be undone.`)) return;
    try {
      if (String(offer.id).startsWith("s")) {
        setOffers(prev => prev.filter(o => o.id !== offer.id));
        return;
      }
      await api.adminDeleteOffer(offer.id);
      setOffers(prev => prev.filter(o => o.id !== offer.id));
    } catch (e) {
      alert(e.message || "Failed to delete offer.");
    }
  };

  const handleDuplicate = async (offer) => {
    try {
      const payload = {
        title:       `${offer.title} (Copy)`,
        description: offer.description,
        offerType:   offer.offerType  ?? "fixed_price",
        offerPrice:  offer.offerPrice ?? null,
        origPrice:   offer.origPrice  ?? null,
        orderType:   offer.orderType  ?? "individual",
        status:      "draft",
        headerColor: offer.headerColor,
        icon:        offer.icon,
      };
      const created = await api.adminCreateOffer(payload);
      setOffers(prev => [normalizeOffer(created), ...prev]);
    } catch (e) {
      alert(e.message || "Failed to duplicate offer.");
    }
  };

  const counts = {
    all:      offers.length,
    active:   offers.filter(o => o.status === "active").length,
    upcoming: offers.filter(o => o.status === "upcoming" || o.status === "draft").length,
    expired:  offers.filter(o => o.status === "expired").length,
  };

  const visible = tab === "all"
    ? offers
    : tab === "upcoming"
    ? offers.filter(o => o.status === "upcoming" || o.status === "draft")
    : offers.filter(o => o.status === tab);

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
          const isFiltered  = tab !== "all" && tab !== "expired";
          const isHighlight = tab === card.key;
          const isDim       = isFiltered && !isHighlight;
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
      {loading ? (
        <div className="of-loading">
          <span className="material-symbols-outlined of-spin">refresh</span>
          Loading offers…
        </div>
      ) : error ? (
        <div className="of-error">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button type="button" onClick={loadOffers} className="of-action-outline">Retry</button>
        </div>
      ) : (
        <div className="of-cards-grid">
          {visible.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onStop={handleStop}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onEdit={(o) => navigate(`/admin/offers/create?edit=${o.id}`)}
            />
          ))}
          {visible.length === 0 && (
            <div className="of-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#9ca3af" }}>local_activity</span>
              <p>No {tab === "all" ? "" : tab} offers yet.</p>
              <button type="button" className="of-create-btn" onClick={() => navigate("/admin/offers/create")}>
                Create first offer
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function OfferCard({ offer, onStop, onDelete, onDuplicate, onEdit }) {
  const badge     = STATUS_BADGE[offer.status] ?? STATUS_BADGE.active;
  const isExpired  = offer.status === "expired";
  const isUpcoming = offer.status === "upcoming" || offer.status === "draft";
  const pct = offer.target > 0 ? Math.round((offer.ordersPlaced / offer.target) * 100) : 0;

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
          {(offer.tags ?? []).map(tag => (
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

          {isExpired && (
            <>
              <div className="of-progress-track of-progress-track-thin">
                <div className="of-progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: "#9ca3af" }} />
              </div>
              <div className="of-expired-label">{offer.targetLabel}</div>
            </>
          )}

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
                <button type="button" className="of-action-outline" onClick={() => onEdit(offer)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                  Edit
                </button>
                <button type="button" className="of-action-danger" onClick={() => isUpcoming ? onDelete(offer) : onStop(offer)}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    {isUpcoming ? "delete" : "stop_circle"}
                  </span>
                  {isUpcoming ? "Delete" : "Stop"}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="of-action-outline" onClick={() => onDuplicate(offer)}>
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
