import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCampaigns.css";

const SEED_BANNERS = [
  {
    id: "s1",
    category: "Monsoon Special", categoryIcon: "water_drop",
    headline: "Pure A2 Milk\nFarm Fresh Daily",
    tagline: "Delivered to your door every morning",
    ctaLabel: "Order now", ctaColor: "#2d5a27",
    bgGradient: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", emoji: "🥛",
    status: "active", title: "Monsoon Fresh Milk Campaign",
    dateRange: "15 Jun — 30 Jun 2026",
    impressions: 1240, taps: 87, ctr: 7.0,
  },
  {
    id: "s2",
    category: "Pure & Natural", categoryIcon: "auto_awesome",
    headline: "A2 Cow Ghee\nHand Churned",
    tagline: "No preservatives. No chemicals. Only purity.",
    ctaLabel: "Shop ghee", ctaColor: "#cc8400",
    bgGradient: "linear-gradient(135deg, #7a532a 0%, #a07040 100%)", emoji: "🧈",
    status: "active", title: "Premium Ghee Awareness Banner",
    dateRange: "10 Jun — 25 Jun 2026",
    impressions: 980, taps: 64, ctr: 6.5,
  },
  {
    id: "s3",
    category: "Fresh Daily", categoryIcon: "ac_unit",
    headline: "Soft Fresh Paneer\nMade with A2 Milk",
    tagline: "Order before 8 AM for same-day delivery",
    ctaLabel: "Order paneer", ctaColor: "#4a89c3",
    bgGradient: "linear-gradient(135deg, #4a89c3 0%, #2d6ea6 100%)", emoji: "🧀",
    status: "upcoming", title: "Fresh Paneer Campaign — July",
    dateRange: "Starts 1 Jul 2026",
    countdown: "Goes live in 21 days", daysUntil: 21, readyForReview: false,
  },
  {
    id: "s4",
    category: "Festival Special", categoryIcon: "celebration",
    headline: "Navratri Offer\n15% Off All Products",
    tagline: "Pure dairy for your celebrations",
    ctaLabel: "Shop now", ctaColor: "#a53b49",
    bgGradient: "linear-gradient(135deg, #a53b49 0%, #7b2035 100%)", emoji: "🪔",
    status: "upcoming", title: "Navratri Festival Banner",
    dateRange: "2 Oct — 11 Oct 2026",
    countdown: "Goes live in 4 months", daysUntil: 120, readyForReview: false,
  },
  {
    id: "s5",
    category: "Festival", categoryIcon: "palette",
    headline: "Holi Special\n₹55/L Milk",
    tagline: "3-day Holi offer — ended",
    bgGradient: "linear-gradient(135deg, #a09c99 0%, #888480 100%)", emoji: "🎨",
    status: "expired", title: "Holi Special Banner",
    dateRange: "13 Mar — 15 Mar 2026 • Ended",
    impressions: 2100, taps: 210, ctr: 10.0,
  },
  {
    id: "s6",
    category: "New Year", categoryIcon: "celebration",
    headline: "New Year Ghee\n₹500 Only",
    tagline: "Ended — Jan 2026",
    bgGradient: "linear-gradient(135deg, #a09c99 0%, #888480 100%)", emoji: "🎉",
    status: "expired", title: "New Year Ghee Banner",
    dateRange: "1 Jan — 7 Jan 2026 • Ended",
    impressions: 1850, taps: 162, ctr: 8.8,
  },
];

const TABS = [
  { key: "all",      label: "All" },
  { key: "active",   label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "expired",  label: "Expired / History" },
];

const STATUS_CFG = {
  active:   { label: "Live",     cls: "bc-badge-live",     dot: "#22c55e" },
  upcoming: { label: "Upcoming", cls: "bc-badge-upcoming", dot: "#f97316" },
  draft:    { label: "Draft",    cls: "bc-badge-upcoming", dot: "#9ca3af" },
  expired:  { label: "Expired",  cls: "bc-badge-expired",  dot: "#9ca3af" },
};

function fmtNum(n) { return n.toLocaleString("en-IN"); }

function avgCtr(banners) {
  const b = banners.filter(x => x.ctr != null && x.impressions > 0);
  if (!b.length) return "—";
  const avg = b.reduce((s, x) => s + x.ctr, 0) / b.length;
  return `${avg % 1 === 0 ? avg : avg.toFixed(1)}%`;
}

function normalizeBanner(b) {
  const ctr = b.taps > 0 && b.impressions > 0
    ? parseFloat(((b.taps / b.impressions) * 100).toFixed(1))
    : b.ctr ?? 0;

  let bgGradient = b.bgGradient;
  if (!bgGradient && b.bgColor) {
    bgGradient = `linear-gradient(135deg, ${b.bgColor} 0%, ${b.bgColor}cc 100%)`;
  }

  let dateRange = b.dateRange;
  if (!dateRange) {
    dateRange = b.startDate && b.endDate
      ? `${b.startDate} — ${b.endDate}`
      : b.startDate
      ? `Starts ${b.startDate}`
      : "";
  }

  let daysUntil = b.daysUntil;
  if (daysUntil == null && b.startDate) {
    daysUntil = Math.ceil((new Date(b.startDate) - new Date()) / 86400000);
  }

  const countdown = b.countdown ?? (
    daysUntil != null && daysUntil > 0
      ? daysUntil < 31
        ? `Goes live in ${daysUntil} days`
        : `Goes live in ${Math.round(daysUntil / 30)} months`
      : "Scheduled"
  );

  return { ...b, bgGradient, dateRange, ctr, daysUntil, countdown };
}

function getKpis(tab, counts, banners, setTab) {
  const active  = banners.filter(b => b.status === "active");
  const upcoming = banners.filter(b => b.status === "upcoming" || b.status === "draft");
  const expired  = banners.filter(b => b.status === "expired");

  if (tab === "active") {
    const totalImp = active.reduce((s, b) => s + (b.impressions || 0), 0);
    return [
      { icon: "bolt",        iconCls: "bc-kpi-green",  value: counts.active,   label: "Active campaigns",         onClick: null },
      { icon: "ads_click",   iconCls: "bc-kpi-orange", value: fmtNum(totalImp), label: "Total active impressions", onClick: null },
      { icon: "trending_up", iconCls: "bc-kpi-blue",   value: avgCtr(active),   label: "Avg. active CTR",          onClick: null },
    ];
  }
  if (tab === "upcoming") {
    const valid   = upcoming.filter(b => b.daysUntil != null && b.daysUntil > 0);
    const minDays = valid.length ? valid.reduce((m, b) => b.daysUntil < m ? b.daysUntil : m, Infinity) : null;
    const nextLabel = minDays != null
      ? minDays < 31 ? `${minDays} Days` : `${Math.round(minDays / 30)} Months`
      : "—";
    const readyCount = upcoming.filter(b => b.readyForReview).length;
    return [
      { icon: "schedule",  iconCls: "bc-kpi-blue",   value: counts.upcoming, label: "Total upcoming banners", onClick: null },
      { icon: "alarm",     iconCls: "bc-kpi-orange", value: nextLabel,        label: "Next launch in",         onClick: null },
      { icon: "task_alt",  iconCls: "bc-kpi-green",  value: readyCount,       label: "Ready for review",       onClick: null },
    ];
  }
  if (tab === "expired") {
    const totalImp = expired.reduce((s, b) => s + (b.impressions || 0), 0);
    return [
      { icon: "history",     iconCls: "bc-kpi-green",  value: counts.expired,   label: "Expired campaigns",      onClick: null },
      { icon: "ads_click",   iconCls: "bc-kpi-orange", value: fmtNum(totalImp), label: "Total past impressions", onClick: null },
      { icon: "trending_up", iconCls: "bc-kpi-blue",   value: avgCtr(expired),  label: "Avg. historical CTR",    onClick: null },
    ];
  }
  return [
    { icon: "photo_library", iconCls: "bc-kpi-green",  value: counts.all,      label: "Total banners created", onClick: () => setTab("all") },
    { icon: "bolt",          iconCls: "bc-kpi-orange", value: counts.active,   label: "Currently live in app", onClick: () => setTab("active") },
    { icon: "schedule",      iconCls: "bc-kpi-blue",   value: counts.upcoming, label: "Upcoming / scheduled",  onClick: () => setTab("upcoming") },
  ];
}

function AdminCampaigns() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState(SEED_BANNERS);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.adminBanners();
      setBanners(data.length > 0 ? data.map(normalizeBanner) : SEED_BANNERS);
    } catch {
      // keep seed data on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBanners(); }, [loadBanners]);

  const handleStop = async (banner) => {
    if (!window.confirm(`Stop "${banner.title}"? It will no longer show to customers.`)) return;
    try {
      if (String(banner.id).startsWith("s")) {
        setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, status: "expired" } : b));
        return;
      }
      await api.adminUpdateBanner(banner.id, { status: "expired" });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, status: "expired" } : b));
    } catch (e) { alert(e.message || "Failed to stop banner."); }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete "${banner.title}"? This cannot be undone.`)) return;
    try {
      if (String(banner.id).startsWith("s")) {
        setBanners(prev => prev.filter(b => b.id !== banner.id));
        return;
      }
      await api.adminDeleteBanner(banner.id);
      setBanners(prev => prev.filter(b => b.id !== banner.id));
    } catch (e) { alert(e.message || "Failed to delete banner."); }
  };

  const handleDuplicate = async (banner) => {
    try {
      const payload = {
        title:       `${banner.title} (Copy)`,
        category:    banner.category,
        categoryIcon: banner.categoryIcon,
        headline:    banner.headline,
        tagline:     banner.tagline,
        ctaLabel:    banner.ctaLabel,
        ctaColor:    banner.ctaColor,
        bgColor:     banner.bgColor ?? "#1b4332",
        emoji:       banner.emoji,
        status:      "draft",
      };
      const created = normalizeBanner(await api.adminCreateBanner(payload));
      setBanners(prev => [created, ...prev]);
    } catch (e) { alert(e.message || "Failed to duplicate banner."); }
  };

  const upcomingBanners = banners.filter(b => b.status === "upcoming" || b.status === "draft");

  const counts = {
    all:      banners.length,
    active:   banners.filter(b => b.status === "active").length,
    upcoming: upcomingBanners.length,
    expired:  banners.filter(b => b.status === "expired").length,
  };

  const visible = tab === "all" ? banners
    : tab === "upcoming" ? upcomingBanners
    : banners.filter(b => b.status === tab);

  const kpis = getKpis(tab, counts, banners, setTab);

  return (
    <div className="bc-page">

      {/* ── Page header ── */}
      <div className="bc-page-header">
        <h2 className="bc-page-title">Banners &amp; Campaigns</h2>
        <button type="button" className="bc-create-btn" onClick={() => navigate("/admin/campaigns/create")}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_photo_alternate</span>
          Create new banner
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="bc-kpi-grid">
        {kpis.map((card, i) => {
          const Tag = card.onClick ? "button" : "div";
          return (
            <Tag
              key={i}
              type={card.onClick ? "button" : undefined}
              className={`bc-kpi-card${card.onClick ? " bc-kpi-btn" : ""}`}
              onClick={card.onClick || undefined}
            >
              <div className={`bc-kpi-icon ${card.iconCls}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{card.icon}</span>
              </div>
              <div>
                <p className="bc-kpi-value">{card.value}</p>
                <p className="bc-kpi-label">{card.label}</p>
              </div>
            </Tag>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div className="bc-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`bc-tab${tab === t.key ? " bc-tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className={`bc-tab-count${tab === t.key ? " bc-tab-count-active" : ""}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="bc-loading">
          <span className="material-symbols-outlined bc-spin">refresh</span>
          Loading banners…
        </div>
      ) : (
        <div className="bc-cards-grid">
          {visible.map(banner => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onStop={handleStop}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onEdit={(b) => navigate(`/admin/campaigns/create?edit=${b.id}`)}
            />
          ))}
          {visible.length === 0 && (
            <div className="bc-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#9ca3af" }}>photo_library</span>
              <p>No {tab === "all" ? "" : tab} banners yet.</p>
              <button type="button" className="bc-create-btn" onClick={() => navigate("/admin/campaigns/create")}>
                Create first banner
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function BannerCard({ banner, onStop, onDelete, onDuplicate, onEdit }) {
  const cfg       = STATUS_CFG[banner.status] ?? STATUS_CFG.active;
  const isExpired  = banner.status === "expired";
  const isUpcoming = banner.status === "upcoming" || banner.status === "draft";

  return (
    <article className={`bc-card${isExpired ? " bc-card-expired" : ""}`}>

      {/* ── Banner preview header ── */}
      <div className="bc-card-preview" style={{ background: banner.bgGradient }}>
        <div className="bc-card-preview-top">
          <div className="bc-card-category">
            <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>{banner.categoryIcon}</span>
            {banner.category}
          </div>
          <span className={`bc-badge ${cfg.cls}`}>
            <span className="bc-badge-dot" style={{ background: cfg.dot }} />
            {cfg.label}
          </span>
        </div>

        <div className="bc-card-preview-body">
          <h3 className="bc-card-headline">
            {(banner.headline || "").split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h3>
          <p className="bc-card-tagline">{banner.tagline}</p>
          {!isExpired && banner.ctaLabel && (
            <button type="button" className="bc-card-cta" style={{ color: banner.ctaColor }}>
              {banner.ctaLabel}
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
            </button>
          )}
        </div>

        <span className="bc-card-emoji" aria-hidden="true">{banner.emoji}</span>
      </div>

      {/* ── Card body ── */}
      <div className="bc-card-body">
        <p className="bc-card-title">{banner.title}</p>
        <p className="bc-card-date">
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>calendar_today</span>
          {banner.dateRange}
        </p>

        {!isUpcoming && (
          <div className="bc-stats-row">
            <div className="bc-stat-col">
              <p className="bc-stat-value">{fmtNum(banner.impressions)}</p>
              <p className="bc-stat-label">Impressions</p>
            </div>
            <div className="bc-stat-col">
              <p className="bc-stat-value">{banner.taps}</p>
              <p className="bc-stat-label">Taps</p>
            </div>
            <div className="bc-stat-col">
              <p className="bc-stat-value bc-stat-value-ctr">{banner.ctr}%</p>
              <p className="bc-stat-label">CTR</p>
            </div>
          </div>
        )}

        {isUpcoming && (
          <div className="bc-countdown">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
            {banner.countdown}
          </div>
        )}

        <div className="bc-card-actions">
          {!isExpired ? (
            <>
              <button type="button" className="bc-action-outline" onClick={() => onEdit(banner)}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                Edit
              </button>
              <button type="button" className="bc-action-danger" onClick={() => isUpcoming ? onDelete(banner) : onStop(banner)}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                  {isUpcoming ? "delete" : "stop_circle"}
                </span>
                {isUpcoming ? "Delete" : "Stop"}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="bc-action-outline" onClick={() => onDuplicate(banner)}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>content_copy</span>
                Duplicate
              </button>
            </>
          )}
        </div>
      </div>

    </article>
  );
}

export { AdminCampaigns };
