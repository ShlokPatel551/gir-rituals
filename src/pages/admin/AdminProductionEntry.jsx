import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminProductionEntry.css";

const ENTRIES = {
  cow_milk: {
    name:          "Cow Milk",
    unit:          "litre",
    unitShort:     "L",
    icon:          "water_drop",
    produced:      150,
    sold:          100,
    pricePerUnit:  30,
    leftoverAction:"Stored in refrigerator for tomorrow's morning delivery",
    notes:         null,
    targetIncome:  2500,
    date:          "Friday, 29 May 2026",
    savedBy:       "Admin (owner)",
    savedAt:       "29 May 2026, 09:14 AM",
    qaCertified:   true,
    qaColdChain:   true,
    qaNote:        "This entry has been validated against the production log. No anomalies were detected in the fat percentage or pasteurization timestamps for this batch.",
  },
  buffalo_milk: {
    name:          "Buffalo Milk",
    unit:          "litre",
    unitShort:     "L",
    icon:          "opacity",
    produced:      380,
    sold:          300,
    pricePerUnit:  25,
    leftoverAction:"Converted to curd for sale",
    notes:         null,
    targetIncome:  6000,
    date:          "Friday, 29 May 2026",
    savedBy:       "Admin (owner)",
    savedAt:       "29 May 2026, 09:18 AM",
    qaCertified:   true,
    qaColdChain:   true,
    qaNote:        "Entry validated. No anomalies detected in fat content or temperature logs for this batch.",
  },
  paneer: {
    name:          "Paneer",
    unit:          "kg",
    unitShort:     "kg",
    icon:          "inventory_2",
    produced:      80,
    sold:          40,
    pricePerUnit:  50,
    leftoverAction:"Packed and stored for next day dispatch",
    notes:         "Batch quality excellent — extra firm texture noted.",
    targetIncome:  1500,
    date:          "Friday, 29 May 2026",
    savedBy:       "Admin (owner)",
    savedAt:       "29 May 2026, 09:22 AM",
    qaCertified:   true,
    qaColdChain:   false,
    qaNote:        "Batch passed freshness and texture checks. Cold chain was briefly interrupted during afternoon packaging — resolved.",
  },
  cow_ghee: {
    name:          "Cow Ghee",
    unit:          "kg",
    unitShort:     "kg",
    icon:          "oil_barrel",
    produced:      20,
    sold:          16,
    pricePerUnit:  500,
    leftoverAction:"Stored in warehouse — will be dispatched next week",
    notes:         "Bilona method batch from this morning. Premium grade.",
    targetIncome:  7000,
    date:          "Friday, 29 May 2026",
    savedBy:       "Admin (owner)",
    savedAt:       "29 May 2026, 09:30 AM",
    qaCertified:   true,
    qaColdChain:   true,
    qaNote:        "Ghee batch validated for colour, aroma, and grain texture. Meets premium export standards.",
  },
};

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function AdminProductionEntry() {
  const { productId } = useParams();
  const navigate      = useNavigate();
  const entry         = ENTRIES[productId];
  const [bannerVisible, setBannerVisible] = useState(true);

  if (!entry) {
    return (
      <div className="pe-not-found">
        <span className="material-symbols-outlined pe-not-found-icon">inventory_2</span>
        <p className="pe-not-found-title">Entry not found</p>
        <Link to="/admin/production" className="pe-back-link">← Back to Production</Link>
      </div>
    );
  }

  const income      = entry.sold * entry.pricePerUnit;
  const leftover    = entry.produced - entry.sold;
  const sellRate    = ((entry.sold / entry.produced) * 100).toFixed(1);
  const soldPct     = (entry.sold / entry.produced) * 100;
  const aboveTarget = income > entry.targetIncome;
  const targetDiff  = aboveTarget
    ? `+${Math.round(((income - entry.targetIncome) / entry.targetIncome) * 100)}%`
    : `-${Math.round(((entry.targetIncome - income) / entry.targetIncome) * 100)}%`;

  return (
    <div className="pe-page">

      {/* ── Breadcrumb ── */}
      <nav className="pe-breadcrumb">
        <Link to="/admin/production" className="pe-crumb-link">Production</Link>
        <span className="material-symbols-outlined pe-crumb-sep">chevron_right</span>
        <Link to="/admin/production" className="pe-crumb-link">Entries</Link>
        <span className="material-symbols-outlined pe-crumb-sep">chevron_right</span>
        <span className="pe-crumb-cur">May 2026</span>
      </nav>

      {/* ── Page header ── */}
      <div className="pe-header">
        <div>
          <div className="pe-header-title-row">
            <h2 className="pe-title">{entry.name}</h2>
            <span className="pe-saved-badge">
              <span className="material-symbols-outlined pe-saved-icon">check_circle</span>
              Saved
            </span>
          </div>
          <p className="pe-subtitle">Record for {entry.date}</p>
        </div>
        <div className="pe-header-actions">
          <button
            type="button"
            className="pe-btn-secondary"
            onClick={() => navigate("/admin/production")}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            All products
          </button>
          <button type="button" className="pe-btn-primary"
            onClick={() => navigate(`/admin/production/${productId}/edit`)}>
            <span className="material-symbols-outlined">edit</span>
            Edit entry
          </button>
        </div>
      </div>

      {/* ── Success banner ── */}
      {bannerVisible && (
        <div className="pe-banner">
          <div className="pe-banner-icon-box">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div className="pe-banner-body">
            <p className="pe-banner-title">Entry saved successfully.</p>
            <p className="pe-banner-sub">
              Master production table and total income have been updated for{" "}
              {entry.date.split(", ")[1] || entry.date}.
            </p>
          </div>
          <button
            type="button"
            className="pe-banner-close"
            onClick={() => setBannerVisible(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* ── Summary bento cards ── */}
      <div className="pe-bento">

        <div className="pe-stat-card pe-stat-produced">
          <p className="pe-stat-label">Produced today</p>
          <div className="pe-stat-value-row">
            <span className="pe-stat-num">{entry.produced}</span>
            <span className="pe-stat-unit">{entry.unitShort}</span>
          </div>
          <div className="pe-stat-bar-track">
            <div className="pe-stat-bar-fill pe-bar-produced" style={{ width: "100%" }} />
          </div>
        </div>

        <div className="pe-stat-card pe-stat-sold">
          <p className="pe-stat-label">Sold today</p>
          <div className="pe-stat-value-row">
            <span className="pe-stat-num">{entry.sold}</span>
            <span className="pe-stat-unit">{entry.unitShort}</span>
          </div>
          <div className="pe-stat-bar-track">
            <div className="pe-stat-bar-fill pe-bar-sold" style={{ width: `${soldPct}%` }} />
          </div>
        </div>

        <div className="pe-stat-card pe-stat-income">
          <p className="pe-stat-label">Income today</p>
          <div className="pe-stat-value-row">
            <span className="pe-stat-income-val">{fmt(income)}</span>
          </div>
          <p className="pe-stat-note">
            Target: {fmt(entry.targetIncome)}{" "}
            <span className={aboveTarget ? "pe-note-above" : "pe-note-below"}>
              ({targetDiff})
            </span>
          </p>
        </div>

        <div className="pe-stat-card pe-stat-leftover">
          <p className="pe-stat-label">Leftover qty</p>
          <div className="pe-stat-value-row">
            <span className="pe-stat-leftover-val">{leftover}</span>
            <span className="pe-stat-unit">{entry.unitShort}</span>
          </div>
          <p className="pe-stat-warning">
            <span className="material-symbols-outlined">warning</span>
            Needs storage
          </p>
        </div>

        <div className="pe-stat-card pe-stat-rate">
          <p className="pe-stat-label">Sell rate</p>
          <div className="pe-stat-value-row">
            <span className="pe-stat-rate-val">{sellRate}%</span>
          </div>
          <p className="pe-stat-note">of produced qty</p>
        </div>

      </div>

      {/* ── Full entry details table ── */}
      <div className="pe-detail-card">
        <div className="pe-detail-head">
          <div className="pe-detail-head-left">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            <h3 className="pe-detail-title">
              Full entry details — {entry.name} — 29 May 2026
            </h3>
          </div>
          <button type="button" className="pe-print-btn">
            <span className="material-symbols-outlined">print</span>
          </button>
        </div>

        <div className="pe-detail-body">

          <div className="pe-detail-row pe-row-alt">
            <span className="pe-row-key">Product</span>
            <span className="pe-row-val pe-row-bold">{entry.name}</span>
          </div>
          <div className="pe-detail-row">
            <span className="pe-row-key">Date</span>
            <span className="pe-row-val">{entry.date}</span>
          </div>
          <div className="pe-detail-row pe-row-alt">
            <span className="pe-row-key">Unit</span>
            <span className="pe-row-val">{entry.unit.charAt(0).toUpperCase() + entry.unit.slice(1)} ({entry.unitShort})</span>
          </div>
          <div className="pe-detail-row">
            <span className="pe-row-key">Qty produced today</span>
            <span className="pe-row-val pe-row-bold">{entry.produced} {entry.unitShort}</span>
          </div>
          <div className="pe-detail-row pe-row-alt">
            <span className="pe-row-key">Qty sold today</span>
            <span className="pe-row-val pe-row-bold pe-row-sold">{entry.sold} {entry.unitShort}</span>
          </div>
          <div className="pe-detail-row">
            <span className="pe-row-key">Price per {entry.unit}</span>
            <span className="pe-row-val">{fmt(entry.pricePerUnit)}</span>
          </div>
          <div className="pe-detail-row pe-row-highlight">
            <span className="pe-row-key">Total income today</span>
            <span className="pe-row-val">
              <span className="pe-row-income">{fmt(income)}</span>
              <span className="pe-row-formula">
                ({entry.sold} {entry.unitShort} × {fmt(entry.pricePerUnit)})
              </span>
            </span>
          </div>
          <div className="pe-detail-row pe-row-alt">
            <span className="pe-row-key">Leftover qty</span>
            <span className="pe-row-val">
              <span className="pe-row-leftover">{leftover} {entry.unitShort}</span>
              <span className="pe-row-formula">
                ({entry.produced} produced − {entry.sold} sold)
              </span>
            </span>
          </div>
          <div className="pe-detail-row">
            <span className="pe-row-key">Leftover action taken</span>
            <span className="pe-row-val pe-row-italic">{entry.leftoverAction}</span>
          </div>
          <div className="pe-detail-row pe-row-alt">
            <span className="pe-row-key">Notes</span>
            <span className="pe-row-val pe-row-muted">
              {entry.notes ?? "— (No additional notes added)"}
            </span>
          </div>
          <div className="pe-detail-row">
            <span className="pe-row-key">Sell-through rate</span>
            <span className="pe-row-val">
              <span className="pe-row-rate-badge">{sellRate}%</span>
              <span className="pe-row-formula">of produced quantity was sold today</span>
            </span>
          </div>
          <div className="pe-detail-row pe-row-alt">
            <span className="pe-row-key">Saved by</span>
            <span className="pe-row-val pe-row-saved-by">
              <span className="pe-avatar">AS</span>
              <span>{entry.savedBy} — {entry.savedAt}</span>
            </span>
          </div>

        </div>
      </div>

      {/* ── Quality Assurance section ── */}
      <div className="pe-qa-card">
        <div className="pe-qa-image-box">
          <span className="material-symbols-outlined pe-qa-bg-icon">{entry.icon}</span>
          <span className="material-symbols-outlined pe-qa-center-icon">{entry.icon}</span>
        </div>
        <div className="pe-qa-content">
          <h4 className="pe-qa-title">Quality Assurance Check</h4>
          <p className="pe-qa-desc">{entry.qaNote}</p>
          <div className="pe-qa-badges">
            {entry.qaCertified && (
              <div className="pe-qa-badge">
                <span className="material-symbols-outlined">verified_user</span>
                <span>Certified Batch</span>
              </div>
            )}
            {entry.qaColdChain ? (
              <div className="pe-qa-badge">
                <span className="material-symbols-outlined">ac_unit</span>
                <span>Cold Chain Intact</span>
              </div>
            ) : (
              <div className="pe-qa-badge pe-qa-badge-warn">
                <span className="material-symbols-outlined">warning</span>
                <span>Cold Chain Issue — Resolved</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminProductionEntry };
