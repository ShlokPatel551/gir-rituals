import { useState } from "react";
import "./AdminProductionLog.css";

const DISPLAY_DATE  = "05/06/2026";
const OPENING_FROM  = "4 June";
const FRESH_DATE    = "5 June";

const LOG_ENTRIES = [
  {
    id:           "cow-milk",
    name:         "Cow milk",
    unit:         "Litre (L)",
    icon:         "water_drop",
    iconBg:       "#c1ecd4",
    iconColor:    "var(--admin-primary)",
    openingQty:   50,   openingUnit: "L",
    freshQty:     20,   freshUnit:   "L",
    totalUnit:    "L",
    soldQty:      65,
    priceLabel:   "₹30 / L",
    pricePerUnit: 30,
    leftoverQty:  5,
    rowCls:       "pl-row-expires-today",
    leftoverCls:  "pl-leftover-error",
    expiry:       "expires_today",
    expiryLabel:  "Expires today",
    expiryIcon:   "report",
  },
  {
    id:           "buffalo-milk",
    name:         "Buffalo milk",
    unit:         "Litre (L)",
    icon:         "water_drop",
    iconBg:       "#ece7e6",
    iconColor:    "var(--admin-outline)",
    openingQty:   80,   openingUnit: "L",
    freshQty:     0,    freshUnit:   "L",
    totalUnit:    "L",
    soldQty:      75,
    priceLabel:   "₹25 / L",
    pricePerUnit: 25,
    leftoverQty:  5,
    rowCls:       "pl-row-expires-today",
    leftoverCls:  "pl-leftover-error",
    expiry:       "expires_today",
    expiryLabel:  "Expires today",
    expiryIcon:   "report",
  },
  {
    id:           "paneer",
    name:         "Paneer",
    unit:         "Kilogram (kg)",
    icon:         "egg_alt",
    iconBg:       "#ffdcbd",
    iconColor:    "var(--admin-secondary)",
    openingQty:   40,   openingUnit: "kg",
    freshQty:     60,   freshUnit:   "kg",
    totalUnit:    "kg",
    soldQty:      55,
    priceLabel:   "₹50 / kg",
    pricePerUnit: 50,
    leftoverQty:  45,
    rowCls:       "pl-row-expires-soon",
    leftoverCls:  "pl-leftover-secondary",
    expiry:       "expires_soon",
    expiryLabel:  "Expires 7 June",
    expiryIcon:   "schedule",
  },
  {
    id:           "cow-ghee",
    name:         "Cow ghee",
    unit:         "Kilogram (kg)",
    icon:         "local_fire_department",
    iconBg:       "#ffca98",
    iconColor:    "#b05500",
    openingQty:   10,   openingUnit: "kg",
    freshQty:     5,    freshUnit:   "kg",
    totalUnit:    "kg",
    soldQty:      3,
    priceLabel:   "₹250 / kg",
    pricePerUnit: 250,
    leftoverQty:  12,
    rowCls:       "pl-row-safe",
    leftoverCls:  "pl-leftover-safe",
    expiry:       "safe",
    expiryLabel:  "Safe (30 days)",
    expiryIcon:   "check_circle",
  },
];

const EXPIRY_ICONS = {
  expires_today: "report",
  expires_soon:  "schedule",
  safe:          "check_circle",
};

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function AdminProductionLog() {
  const [activeTab, setActiveTab] = useState("all");

  const totalIncome = LOG_ENTRIES.reduce((s, e) => s + e.soldQty * e.pricePerUnit, 0);

  return (
    <div className="pl-page">

      {/* ── Page-level topbar ── */}
      <div className="pl-topbar">
        <div className="pl-topbar-left">
          <h2 className="pl-title">Production Log</h2>
          <div className="pl-date-chip">
            <span className="material-symbols-outlined pl-date-icon">calendar_today</span>
            <span className="pl-date-text">{DISPLAY_DATE}</span>
            <span className="material-symbols-outlined pl-date-caret">arrow_drop_down</span>
          </div>
        </div>
        <button type="button" className="pl-add-btn">
          <span className="material-symbols-outlined">add_circle</span>
          Add entry
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="pl-tabs">
        <button
          type="button"
          className={`pl-tab${activeTab === "all" ? " pl-tab-active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Production
        </button>
        <button
          type="button"
          className={`pl-tab${activeTab === "history" ? " pl-tab-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Stock History
        </button>
      </div>

      {/* ── Consolidated inventory table card ── */}
      <section className="pl-table-card">

        {/* Card header + legend */}
        <div className="pl-card-header">
          <h3 className="pl-card-title">Consolidated Inventory Status</h3>
          <div className="pl-legend">
            <div className="pl-legend-item">
              <span className="pl-legend-dot pl-dot-error" />
              <span className="pl-legend-label">Expires Today</span>
            </div>
            <div className="pl-legend-item">
              <span className="pl-legend-dot pl-dot-secondary" />
              <span className="pl-legend-label">1-3 Days Left</span>
            </div>
            <div className="pl-legend-item">
              <span className="pl-legend-dot pl-dot-safe" />
              <span className="pl-legend-label">Safe</span>
            </div>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="pl-table-scroll">
          <table className="pl-table">
            <thead>
              <tr className="pl-thead-row">
                <th className="pl-th">Product</th>
                <th className="pl-th pl-th-center">Opening Stock (from {OPENING_FROM})</th>
                <th className="pl-th pl-th-center">Fresh Today ({FRESH_DATE})</th>
                <th className="pl-th pl-th-center pl-th-highlight">Total Available</th>
                <th className="pl-th pl-th-center">Sold Today</th>
                <th className="pl-th pl-th-center">Price / Unit</th>
                <th className="pl-th pl-th-right">Income Today</th>
                <th className="pl-th pl-th-center">Leftover Qty</th>
                <th className="pl-th">Expiry Status</th>
                <th className="pl-th pl-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {LOG_ENTRIES.map(e => {
                const total = e.openingQty + e.freshQty;
                const income = e.soldQty * e.pricePerUnit;
                return (
                  <tr key={e.id} className={`pl-row ${e.rowCls}`}>

                    {/* Product */}
                    <td className="pl-td">
                      <div className="pl-product-cell">
                        <div className="pl-icon-box" style={{ background: e.iconBg }}>
                          <span
                            className="material-symbols-outlined pl-product-icon"
                            style={{ color: e.iconColor }}
                          >
                            {e.icon}
                          </span>
                        </div>
                        <div>
                          <p className="pl-product-name">{e.name}</p>
                          <p className="pl-product-unit">{e.unit}</p>
                        </div>
                      </div>
                    </td>

                    {/* Opening stock */}
                    <td className="pl-td pl-td-center">
                      <p className="pl-opening-qty">{e.openingQty} {e.openingUnit}</p>
                      <p className="pl-opening-note">carried from {OPENING_FROM}</p>
                    </td>

                    {/* Fresh today */}
                    <td className="pl-td pl-td-center pl-fresh-qty">
                      {e.freshQty} {e.freshUnit}
                    </td>

                    {/* Total available (highlighted) */}
                    <td className="pl-td pl-td-center pl-td-highlight">
                      <span className="pl-total-qty">{total} {e.totalUnit}</span>
                    </td>

                    {/* Sold today */}
                    <td className="pl-td pl-td-center pl-sold-qty">
                      {e.soldQty} {e.totalUnit}
                    </td>

                    {/* Price / unit */}
                    <td className="pl-td pl-td-center pl-price">
                      {e.priceLabel}
                    </td>

                    {/* Income today */}
                    <td className="pl-td pl-td-right pl-income">
                      {fmt(income)}
                    </td>

                    {/* Leftover qty */}
                    <td className="pl-td pl-td-center">
                      <span className={`pl-leftover ${e.leftoverCls}`}>
                        {e.leftoverQty} {e.totalUnit}
                      </span>
                    </td>

                    {/* Expiry status */}
                    <td className="pl-td">
                      <span className={`pl-expiry-badge pl-expiry-${e.expiry}`}>
                        <span className="material-symbols-outlined pl-expiry-icon">
                          {EXPIRY_ICONS[e.expiry]}
                        </span>
                        {e.expiryLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="pl-td pl-td-right">
                      <div className="pl-act-row">
                        <button type="button" className="pl-act-btn" title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button type="button" className="pl-act-btn" title="View">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

            {/* Summary footer row */}
            <tfoot>
              <tr className="pl-tfoot-row">
                <td className="pl-tfoot-label" colSpan={6}>
                  Daily totals — {LOG_ENTRIES.length} products
                </td>
                <td className="pl-tfoot-income">{fmt(totalIncome)}</td>
                <td colSpan={3} className="pl-tfoot-note">Consolidated & verified</td>
              </tr>
            </tfoot>
          </table>
        </div>

      </section>
    </div>
  );
}

export { AdminProductionLog };
