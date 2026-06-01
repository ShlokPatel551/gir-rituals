import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProductionNav } from "./AdminProductionNav";
import "./AdminProductionLog.css";

const LOG_DATE  = "30 May 2026";
const NEXT_DATE = "31 May";

const LOG_ENTRIES = [
  {
    id:           "cow_milk",
    product:      "Cow milk",
    opening:      "50 L",
    freshProd:    "20 L",
    totalAvail:   "70 L",
    sold:         "65 L",
    converted:    null,
    dumped:       "5 L",
    income:       1950,
    incomeApprox: false,
    carriedFwd:   "0 — cleared",
    status:       "cleared",
  },
  {
    id:           "buffalo_milk",
    product:      "Buffalo milk",
    opening:      "80 L",
    freshProd:    "0 L",
    totalAvail:   "80 L",
    sold:         "40 L",
    converted:    "40 L → curd",
    dumped:       null,
    income:       1000,
    incomeApprox: false,
    carriedFwd:   "0 — cleared",
    status:       "cleared",
  },
  {
    id:           "paneer",
    product:      "Paneer",
    opening:      "40 kg",
    freshProd:    "60 kg",
    totalAvail:   "100 kg",
    sold:         "55 kg",
    converted:    null,
    dumped:       null,
    income:       2750,
    incomeApprox: false,
    carriedFwd:   `45 kg → ${NEXT_DATE}`,
    status:       "carried",
  },
  {
    id:           "cow_ghee",
    product:      "Cow ghee",
    opening:      "100 kg",
    freshProd:    "200 kg",
    totalAvail:   "300 kg",
    sold:         "250 kg",
    converted:    null,
    dumped:       null,
    income:       4250,
    incomeApprox: true,
    carriedFwd:   `50 kg → ${NEXT_DATE}`,
    status:       "carried",
  },
];

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function AdminProductionLog() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");

  const totalIncome = LOG_ENTRIES.reduce((s, e) => s + e.income, 0);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  return (
    <div className="pl-page">

      {/* Background decoration */}
      <div className="pl-bg-deco" aria-hidden="true">
        <span className="material-symbols-outlined">agriculture</span>
      </div>

      {toast && (
        <div className="pl-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {toast}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="pl-header">
        <div className="pl-header-left">
          <div className="pl-label-row">
            <span className="material-symbols-outlined pl-label-icon">event_note</span>
            <span className="pl-label-text">Daily Production Report</span>
          </div>
          <h2 className="pl-title">Production log — {LOG_DATE}</h2>
          <div className="pl-saved-row">
            <span
              className="material-symbols-outlined pl-saved-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >check_circle</span>
            <span className="pl-saved-text">All stock entries saved</span>
          </div>
        </div>
        <div className="pl-header-actions">
          <button type="button" className="pl-btn-ghost"
            onClick={() => navigate("/admin/production")}>
            <span className="material-symbols-outlined">arrow_back</span>
            Production
          </button>
          <button type="button" className="pl-btn-outline"
            onClick={() => navigate("/admin/leftover-stock")}>
            <span className="material-symbols-outlined">inventory</span>
            Manage Leftover
          </button>
          <button type="button" className="pl-btn-outline"
            onClick={() => navigate("/admin/stock-history")}>
            <span className="material-symbols-outlined">history</span>
            Stock History
          </button>
          <button type="button" className="pl-btn-solid"
            onClick={() => showToast("Exporting production log as PDF…")}>
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Reconciliation alert ── */}
      <div className="pl-alert">
        <div className="pl-alert-icon-box">
          <span className="material-symbols-outlined">info</span>
        </div>
        <div>
          <h4 className="pl-alert-title">Automatic Reconciliation Complete</h4>
          <p className="pl-alert-text">
            All leftover stock from 29 May has been resolved and recorded. Conversions to secondary
            products (Curd, Ghee) have been synchronized with the production batches for today.
          </p>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="pl-metrics-grid">

        <div className="pl-metric-card pl-metric-income">
          <div className="pl-metric-top">
            <div className="pl-icon-box pl-icon-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="pl-trend-badge">+12%</span>
          </div>
          <p className="pl-metric-lbl">Total Income today</p>
          <h5 className="pl-metric-val pl-val-primary">{fmt(totalIncome)}</h5>
          <p className="pl-metric-note">Includes carry-fwd stock sales</p>
        </div>

        <div className="pl-metric-card">
          <div className="pl-metric-top">
            <div className="pl-icon-box pl-icon-secondary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
          </div>
          <p className="pl-metric-lbl">Opening Stock Used</p>
          <h5 className="pl-metric-val pl-val-secondary">130 L</h5>
          <p className="pl-metric-note">Sold / converted from yesterday</p>
        </div>

        <div className="pl-metric-card">
          <div className="pl-metric-top">
            <div className="pl-icon-box pl-icon-error">
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
          </div>
          <p className="pl-metric-lbl">Dumped Today</p>
          <h5 className="pl-metric-val pl-val-error">5 L</h5>
          <p className="pl-metric-note">Cow milk — expired</p>
        </div>

        <div className="pl-metric-card">
          <div className="pl-metric-top">
            <div className="pl-icon-box pl-icon-tertiary">
              <span className="material-symbols-outlined">forward</span>
            </div>
          </div>
          <p className="pl-metric-lbl">Carry-forward to 31 May</p>
          <h5 className="pl-metric-val pl-val-tertiary">45 kg</h5>
          <p className="pl-metric-note">Paneer (1 day remaining)</p>
        </div>

        <div className="pl-metric-card">
          <div className="pl-metric-top">
            <div className="pl-icon-box pl-icon-muted">
              <span className="material-symbols-outlined">block</span>
            </div>
          </div>
          <p className="pl-metric-lbl">Expired — Blocked</p>
          <h5 className="pl-metric-val pl-val-muted">0</h5>
          <p className="pl-metric-note">Nothing expired unused</p>
        </div>

      </div>

      {/* ── Cross-navigation ── */}
      <AdminProductionNav />

      {/* ── Itemized production log table ── */}
      <div className="pl-table-card">
        <div className="pl-table-title-row">
          <h4 className="pl-table-title">Itemized Production Log</h4>
          <div className="pl-table-btns">
            <button type="button" className="pl-icon-btn"
              onClick={() => showToast("Filter options coming soon…")}>
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button type="button" className="pl-icon-btn"
              onClick={() => showToast("Downloading log data…")}>
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>

        <div className="pl-table-scroll">
          <table className="pl-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Opening Stock</th>
                <th>Fresh Produced</th>
                <th>Total Available</th>
                <th>Sold Today</th>
                <th>Converted</th>
                <th>Dumped</th>
                <th className="pl-th-right">Income Today</th>
                <th>Carried to {NEXT_DATE}</th>
                <th>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {LOG_ENTRIES.map(entry => (
                <tr key={entry.id} className="pl-row">
                  <td className="pl-td-product">{entry.product}</td>
                  <td className="pl-td">{entry.opening}</td>
                  <td className="pl-td">{entry.freshProd}</td>
                  <td className="pl-td pl-td-bold">{entry.totalAvail}</td>
                  <td className="pl-td">{entry.sold}</td>
                  <td className={`pl-td${entry.converted ? " pl-td-converted" : " pl-td-dim"}`}>
                    {entry.converted ?? "—"}
                  </td>
                  <td className={`pl-td${entry.dumped ? " pl-td-dumped" : " pl-td-dim"}`}>
                    {entry.dumped ?? "—"}
                  </td>
                  <td className="pl-td pl-td-income">
                    {fmt(entry.income)}
                    {entry.incomeApprox && <span className="pl-approx"> (approx)</span>}
                  </td>
                  <td className={`pl-td${entry.status === "carried" ? " pl-td-carried" : " pl-td-dim"}`}>
                    {entry.carriedFwd}
                  </td>
                  <td className="pl-td">
                    {entry.status === "cleared"
                      ? <span className="pl-badge pl-badge-cleared">Fully cleared</span>
                      : <span className="pl-badge pl-badge-carried">Partial carry-fwd</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="pl-tfoot-row">
                <td colSpan={7} className="pl-tfoot-label">Today's Aggregates</td>
                <td className="pl-tfoot-income">{fmt(totalIncome)}</td>
                <td colSpan={2} className="pl-tfoot-note">Consolidated and verified</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}

export { AdminProductionLog };
