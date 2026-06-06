import { useState, useEffect } from "react";
import "./AdminCampaigns.css";
const BANNERS = [
  {
    id: "b1",
    title: "A2 Milk Harvest Sale",
    description: "Promotion for subscription-based A2 milk deliveries.",
    location: "Home Page",
    status: "live",
    stat1Label: "Schedule",
    stat1Value: "Oct 01 \u2013 Oct 31",
    stat2Label: "Clicks",
    stat2Value: "12,402",
    stat3Label: "CTR",
    stat3Value: "5.2%",
    stat3Primary: true,
    gradient: "linear-gradient(150deg, #7B5233 0%, #5A3B22 55%, #3f6653 100%)",
    emoji: "\u{1F95B}"
  },
  {
    id: "b2",
    title: "Artisan Paneer Series",
    description: "New launch showcase for hand-crafted paneer varieties.",
    location: "Categories",
    status: "scheduled",
    stat1Label: "Schedule",
    stat1Value: "Nov 05 \u2013 Nov 20",
    stat2Label: "Target",
    stat2Value: "Web Tier 1",
    stat3Label: "Est. Reach",
    stat3Value: "45,000",
    stat3Primary: true,
    gradient: "linear-gradient(150deg, #f7f0e8 0%, #ffdcbd 60%, #f0bd8b 100%)",
    emoji: "\u{1F9C0}"
  }
];
const LOG_ROWS = [
  { id: "l1", name: "Bilona Ghee Promo", gradient: "linear-gradient(135deg, #f59e0b, #d97706)", emoji: "\u{1FAD9}", location: "App Home Carousel", ctrPct: 65, ctrLabel: "6.8%", duration: "Sep 15 \u2013 Oct 15", status: "expired" },
  { id: "l2", name: "Farm Storytelling", gradient: "linear-gradient(135deg, #7B5233, #A08060)", emoji: "\u{1F33E}", location: "Checkout Page", ctrPct: 42, ctrLabel: "3.1%", duration: "Permanent", status: "active" },
  { id: "l3", name: "Diwali Specials", gradient: "linear-gradient(135deg, #b5451b, #ff8f00)", emoji: "\u{1FA94}", location: "Category Top", ctrPct: null, ctrLabel: null, duration: "Oct 24 \u2013 Nov 04", status: "pending" }
];
const LOG_STATUS_CSS = {
  active: "camp-badge-active",
  expired: "camp-badge-expired",
  pending: "camp-badge-pending"
};
const LOG_STATUS_LABEL = {
  active: "ACTIVE",
  expired: "EXPIRED",
  pending: "PENDING"
};
function AdminCampaigns() {
  const [logFilter, setLogFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const visibleLog = logFilter === "all" ? LOG_ROWS : LOG_ROWS.filter((r) => r.status === logFilter);
  function showToast(msg) {
    setToastMsg(msg);
    setToastVisible(true);
  }
  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(t);
  }, [toastVisible]);
  return <div className="camp-page">

      {
    /* ── Page header ── */
  }
      <div className="camp-page-header">
        <div>
          <nav className="camp-breadcrumb">
            <span>Marketing</span>
            <span className="material-symbols-outlined camp-bc-chevron">chevron_right</span>
            <span className="camp-bc-current">Campaigns</span>
          </nav>
          <h2 className="camp-page-title">Banners &amp; Campaigns</h2>
          <p className="camp-page-sub">Manage all promotional assets across mobile app and web platforms.</p>
        </div>
        <button
    type="button"
    className="camp-btn-filled"
    onClick={() => showToast("Banner upload coming soon!")}
  >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_photo_alternate</span>
          Upload New Banner
        </button>
      </div>

      {
    /* ── Stats bento ── */
  }
      <div className="camp-stats-grid">

        <div className="bento-card camp-stat-card">
          <p className="camp-stat-label">Active Campaigns</p>
          <div className="camp-stat-bottom">
            <span className="camp-stat-value">12</span>
            <span className="camp-stat-pill camp-pill-green">+2 this week</span>
          </div>
        </div>

        <div className="bento-card camp-stat-card">
          <p className="camp-stat-label">Total CTR</p>
          <div className="camp-stat-bottom">
            <span className="camp-stat-value">4.8%</span>
            <span className="camp-stat-pill camp-pill-green">Optimal</span>
          </div>
        </div>

        <div className="bento-card camp-stat-card">
          <p className="camp-stat-label">Engagement</p>
          <div className="camp-stat-bottom">
            <span className="camp-stat-value">24.5k</span>
            <span className="camp-stat-pill camp-pill-tan">Trending</span>
          </div>
        </div>

        <div className="bento-card camp-stat-card">
          <p className="camp-stat-label">Space Used</p>
          <div className="camp-stat-bottom">
            <span className="camp-stat-value">82%</span>
            <div className="camp-space-bar-track">
              <div className="camp-space-bar-fill" style={{ width: "82%" }} />
            </div>
          </div>
        </div>

      </div>

      {
    /* ── Banner cards grid ── */
  }
      <div className="camp-banners-grid">
        {BANNERS.map((b) => <div key={b.id} className="camp-banner-card">

            {
    /* Gradient image area */
  }
            <div className="camp-banner-img-wrap">
              <div className="camp-banner-img" style={{ background: b.gradient }}>
                <span className="camp-banner-emoji">{b.emoji}</span>
              </div>
              <div className="camp-banner-badges">
                <span className="camp-location-badge">{b.location}</span>
                {b.status === "live" ? <span className="camp-status-badge camp-status-live">Live</span> : <span className="camp-status-badge camp-status-scheduled">Scheduled</span>}
              </div>
            </div>

            {
    /* Card body */
  }
            <div className="camp-banner-body">
              <div className="camp-banner-info-row">
                <div>
                  <h3 className="camp-banner-title">{b.title}</h3>
                  <p className="camp-banner-desc">{b.description}</p>
                </div>
                <div className="camp-banner-actions">
                  <button
    type="button"
    className="camp-action-btn"
    onClick={() => showToast(`Editing ${b.title}\u2026`)}
  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                  </button>
                  <button
    type="button"
    className="camp-action-btn camp-action-del"
    onClick={() => showToast(`${b.title} deleted.`)}
  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
                  </button>
                </div>
              </div>

              <div className="camp-banner-stats">
                <div className="camp-stat-col">
                  <p className="camp-stat-col-label">{b.stat1Label}</p>
                  <p className="camp-stat-col-value">{b.stat1Value}</p>
                </div>
                <div className="camp-stat-col">
                  <p className="camp-stat-col-label">{b.stat2Label}</p>
                  <p className="camp-stat-col-value">{b.stat2Value}</p>
                </div>
                <div className="camp-stat-col">
                  <p className="camp-stat-col-label">{b.stat3Label}</p>
                  <p className={`camp-stat-col-value ${b.stat3Primary ? "camp-value-primary" : ""}`}>{b.stat3Value}</p>
                </div>
              </div>
            </div>
          </div>)}
      </div>

      {
    /* ── Campaign log table ── */
  }
      <div className="bento-card camp-log-card">

        <div className="camp-log-header">
          <h3 className="camp-log-title">Detailed Campaign Log</h3>
          <div className="camp-tab-group">
            {["all", "active", "expired"].map((f) => <button
    key={f}
    type="button"
    className={`camp-tab-btn ${logFilter === f ? "camp-tab-active" : ""}`}
    onClick={() => setLogFilter(f)}
  >
                {f === "all" ? "All" : f === "active" ? "Active" : "Expired"}
              </button>)}
          </div>
        </div>

        <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="admin-table camp-log-table">
            <thead>
              <tr>
                <th>Banner Info</th>
                <th>Location</th>
                <th>Performance</th>
                <th>Duration</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }} />
              </tr>
            </thead>
            <tbody>
              {visibleLog.map((row) => <tr key={row.id}>
                  <td>
                    <div className="camp-log-name-cell">
                      <div className="camp-log-thumb" style={{ background: row.gradient }}>
                        <span className="camp-log-thumb-emoji">{row.emoji}</span>
                      </div>
                      <span className="camp-log-name">{row.name}</span>
                    </div>
                  </td>
                  <td className="adm-cell-muted">{row.location}</td>
                  <td>
                    {row.ctrPct !== null ? <div className="camp-ctr-cell">
                        <div className="camp-ctr-track">
                          <div className="camp-ctr-fill" style={{ width: `${row.ctrPct}%` }} />
                        </div>
                        <span className="camp-ctr-label">{row.ctrLabel}</span>
                      </div> : <span className="camp-waiting">Waiting for data…</span>}
                  </td>
                  <td className="adm-cell-muted">{row.duration}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`camp-log-badge ${LOG_STATUS_CSS[row.status]}`}>
                      {LOG_STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
    type="button"
    className="camp-more-btn"
    onClick={() => showToast(`Options for ${row.name}`)}
  >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

      </div>

      {
    /* ── Toast ── */
  }
      <div className={`camp-toast ${toastVisible ? "camp-toast-visible" : ""}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--admin-primary-fixed)" }}>
          check_circle
        </span>
        <p className="camp-toast-msg">{toastMsg}</p>
        <button type="button" className="camp-toast-close" onClick={() => setToastVisible(false)}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>

    </div>;
}
export {
  AdminCampaigns
};
