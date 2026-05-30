import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProduction.css";

const TODAY_DATE = new Date().toISOString().split("T")[0];

const PRODUCTS = [
  {
    id:           "cow_milk",
    name:         "Cow Milk",
    unit:         "litre",
    icon:         "water_drop",
    produced:     150,
    sold:         100,
    priceLabel:   "₹30 / L",
    incomeToday:  3000,
    leftover:     50,
    leftoverNote: "Stored in refrigerator for tomorrow",
  },
  {
    id:           "buffalo_milk",
    name:         "Buffalo Milk",
    unit:         "litre",
    icon:         "opacity",
    produced:     380,
    sold:         300,
    priceLabel:   "₹25 / L",
    incomeToday:  7500,
    leftover:     80,
    leftoverNote: "Converted to curd for sale",
  },
  {
    id:           "paneer",
    name:         "Paneer",
    unit:         "kg",
    icon:         "inventory_2",
    produced:     80,
    sold:         40,
    priceLabel:   "₹50 / kg",
    incomeToday:  2000,
    leftover:     40,
    leftoverNote: "Packed and stored for next day",
  },
  {
    id:           "cow_ghee",
    name:         "Cow Ghee",
    unit:         "kg",
    icon:         "oil_barrel",
    produced:     500,
    sold:         400,
    priceLabel:   "₹500 / kg",
    incomeToday:  2000,
    leftover:     100,
    leftoverNote: "Stored in warehouse",
  },
];

const CATS = [
  { key: "all",          label: "All Products"  },
  { key: "cow_milk",     label: "Cow Milk"       },
  { key: "buffalo_milk", label: "Buffalo Milk"   },
  { key: "cow_ghee",     label: "Cow Ghee"       },
  { key: "paneer",       label: "Paneer"         },
];

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function unitLabel(u) {
  return u === "litre" ? "L" : "kg";
}

function AdminProduction() {
  const navigate          = useNavigate();
  const [date, setDate]   = useState(TODAY_DATE);
  const [cat, setCat]     = useState("all");
  const [toast, setToast] = useState("");

  const filtered     = cat === "all" ? PRODUCTS : PRODUCTS.filter(e => e.id === cat);
  const totalProduced = filtered.reduce((s, e) => s + e.produced, 0);
  const totalSold     = filtered.reduce((s, e) => s + e.sold, 0);
  const totalIncome   = filtered.reduce((s, e) => s + e.incomeToday, 0);
  const totalLeftover = filtered.reduce((s, e) => s + e.leftover, 0);
  const sellRate      = totalProduced > 0
    ? ((totalSold / totalProduced) * 100).toFixed(1)
    : "0.0";

  const isToday = date === TODAY_DATE;
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  return (
    <div className="pd-page">

      {/* Toast */}
      {toast && (
        <div className="pd-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div className="pd-header">
        <div>
          <div className="pd-title-row">
            <span className="material-symbols-outlined pd-title-icon">receipt_long</span>
            <h2 className="pd-title">Production log</h2>
          </div>
          <div className="pd-date-chip">
            <span className="material-symbols-outlined pd-chip-icon">calendar_month</span>
            <span className="pd-chip-text">
              Showing data for: <strong>{displayDate}</strong>
            </span>
            {isToday && <span className="pd-today-badge">Today</span>}
          </div>
        </div>
        <div className="pd-header-actions">
          <div className="pd-date-field">
            <label className="pd-date-label">Select date:</label>
            <div className="pd-date-wrap">
              <input
                type="date"
                className="pd-date-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
              <span className="material-symbols-outlined pd-date-icon">calendar_today</span>
            </div>
          </div>
          <button type="button" className="pd-btn-solid"
            onClick={() => navigate("/admin/production/new/edit")}>
            <span className="material-symbols-outlined">add_circle</span>
            Add new entry
          </button>
          <button type="button" className="pd-btn-outline"
            onClick={() => showToast("Exporting production report as PDF…")}>
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Production hub quick-nav ── */}
      <div className="pd-hub-strip">
        <button type="button" className="pd-hub-tile"
          onClick={() => navigate("/admin/production-log")}>
          <div className="pd-hub-tile-icon pd-hub-icon-log">
            <span className="material-symbols-outlined">receipt_long</span>
          </div>
          <div className="pd-hub-tile-body">
            <p className="pd-hub-tile-title">Finalized Production Log</p>
            <p className="pd-hub-tile-desc">Today's consolidated output & income</p>
          </div>
          <span className="material-symbols-outlined pd-hub-tile-arrow">chevron_right</span>
        </button>
        <button type="button" className="pd-hub-tile"
          onClick={() => navigate("/admin/leftover-stock")}>
          <div className="pd-hub-tile-icon pd-hub-icon-leftover">
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <div className="pd-hub-tile-body">
            <p className="pd-hub-tile-title">Manage Leftover Stock</p>
            <p className="pd-hub-tile-desc">Reconcile carry-forward & expired units</p>
          </div>
          <span className="material-symbols-outlined pd-hub-tile-arrow">chevron_right</span>
        </button>
        <button type="button" className="pd-hub-tile"
          onClick={() => navigate("/admin/stock-history")}>
          <div className="pd-hub-tile-icon pd-hub-icon-history">
            <span className="material-symbols-outlined">history</span>
          </div>
          <div className="pd-hub-tile-body">
            <p className="pd-hub-tile-title">Stock History Ledger</p>
            <p className="pd-hub-tile-desc">Full inventory flow & expiry records</p>
          </div>
          <span className="material-symbols-outlined pd-hub-tile-arrow">chevron_right</span>
        </button>
      </div>

      {/* ── Stats bento ── */}
      <div className="pd-stats-grid">
        <div className="pd-stat-card">
          <div className="pd-stat-hd">
            <span className="material-symbols-outlined">payments</span>
            <span className="pd-stat-lbl">Total Income today</span>
          </div>
          <p className="pd-stat-val pd-val-income">{fmt(totalIncome)}</p>
          <p className="pd-stat-trend pd-trend-up">
            <span className="material-symbols-outlined">trending_up</span>
            +8% vs yesterday
          </p>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-hd">
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="pd-stat-lbl">Products produced</span>
          </div>
          <p className="pd-stat-val">{filtered.length} products</p>
          <p className="pd-stat-note">{totalProduced.toLocaleString("en-IN")} total units</p>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-hd">
            <span className="material-symbols-outlined">sell</span>
            <span className="pd-stat-lbl">Total qty sold</span>
          </div>
          <p className="pd-stat-val">{totalSold.toLocaleString("en-IN")} units</p>
          <p className="pd-stat-trend pd-trend-up">
            of {totalProduced.toLocaleString("en-IN")} produced
          </p>
        </div>
        <div className="pd-stat-card pd-stat-card-warn">
          <div className="pd-stat-hd">
            <span className="material-symbols-outlined">assignment_return</span>
            <span className="pd-stat-lbl">Total leftover qty</span>
          </div>
          <p className="pd-stat-val pd-val-warn">{totalLeftover.toLocaleString("en-IN")} units</p>
          <p className="pd-stat-note">across all products</p>
        </div>
        <div className="pd-stat-card">
          <div className="pd-stat-hd">
            <span className="material-symbols-outlined">analytics</span>
            <span className="pd-stat-lbl">Overall sell rate</span>
          </div>
          <p className="pd-stat-val">{sellRate}%</p>
          <p className="pd-stat-note">of total produced qty</p>
        </div>
      </div>

      {/* ── Category filter bar ── */}
      <div className="pd-filter-bar">
        <div className="pd-filter-tabs">
          {CATS.map(c => (
            <button
              key={c.key}
              type="button"
              className={`pd-filter-tab${cat === c.key ? " pd-filter-tab-active" : ""}`}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="pd-filter-hint">
          <span className="material-symbols-outlined">filter_list</span>
          <span className="pd-filter-hint-text">Filter results</span>
        </div>
      </div>

      {/* ── Category overview cards ── */}
      <div className="pd-section">
        <h3 className="pd-section-label">
          <span className="material-symbols-outlined">grid_view</span>
          Category Overview
        </h3>
        <div className="pd-cards-grid">
          {filtered.map(entry =>
            entry.id === "cow_milk" && cat === "all" ? (
              /* Highlight card — dark green */
              <div key={entry.id} className="pd-card-hl">
                <span className="material-symbols-outlined pd-card-hl-bg">{entry.icon}</span>
                <div className="pd-card-hl-inner">
                  <div className="pd-card-hl-top">
                    <span className="material-symbols-outlined pd-card-hl-icon">{entry.icon}</span>
                    <span className="pd-card-hl-badge">Standard</span>
                  </div>
                  <h4 className="pd-card-hl-name">{entry.name}</h4>
                  <div className="pd-card-hl-stats">
                    <p>Produced: <span>{entry.produced} {unitLabel(entry.unit)}</span></p>
                    <p>Sold: <span>{entry.sold} {unitLabel(entry.unit)}</span></p>
                    <p className="pd-card-hl-leftover">
                      Leftover: <span>{entry.leftover} {unitLabel(entry.unit)}</span>
                    </p>
                  </div>
                  <div className="pd-card-hl-bottom">
                    <p className="pd-card-hl-income">
                      {fmt(entry.incomeToday)} <span className="pd-card-hl-income-lbl">today</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal card — white */
              <div key={entry.id} className="pd-card">
                <span className="material-symbols-outlined pd-card-bg-icon">{entry.icon}</span>
                <div className="pd-card-inner">
                  <span className="material-symbols-outlined pd-card-icon">{entry.icon}</span>
                  <h4 className="pd-card-name">{entry.name}</h4>
                  <div className="pd-card-stats">
                    <p>Produced: <span className="pd-card-val">{entry.produced} {unitLabel(entry.unit)}</span></p>
                    <p>Sold: <span className="pd-card-val">{entry.sold} {unitLabel(entry.unit)}</span></p>
                    <p className="pd-card-leftover">
                      Leftover: <span className="pd-card-leftover-val">{entry.leftover} {unitLabel(entry.unit)}</span>
                    </p>
                  </div>
                  <div className="pd-card-bottom">
                    <p className="pd-card-income">
                      {fmt(entry.incomeToday)} <span className="pd-card-income-lbl">today</span>
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Detailed production logs table ── */}
      <div className="pd-section">
        <h3 className="pd-section-label">
          <span className="material-symbols-outlined">table_rows</span>
          Detailed Production Logs
        </h3>
        <div className="pd-table-wrap">
          <div className="pd-table-scroll">
            <table className="pd-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Produced qty</th>
                  <th>Sold qty</th>
                  <th>Price / unit</th>
                  <th>Income today</th>
                  <th>Leftover</th>
                  <th>Leftover Management</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td>
                      <p className="pd-td-name">{entry.name}</p>
                      <p className="pd-td-unit">Unit: {entry.unit}</p>
                    </td>
                    <td className="pd-td-produced">
                      {entry.produced} {unitLabel(entry.unit)}
                    </td>
                    <td className="pd-td-sold">
                      {entry.sold} {unitLabel(entry.unit)}
                    </td>
                    <td className="pd-td-price">{entry.priceLabel}</td>
                    <td className="pd-td-income">{fmt(entry.incomeToday)}</td>
                    <td>
                      <span className="pd-leftover-badge">
                        {entry.leftover} {unitLabel(entry.unit)}
                      </span>
                    </td>
                    <td className="pd-td-note">{entry.leftoverNote}</td>
                    <td>
                      <div className="pd-action-btns">
                        <button
                          type="button"
                          className="pd-action-btn pd-action-edit"
                          onClick={() => showToast(`Editing ${entry.name} entry…`)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="pd-action-btn pd-action-view"
                          onClick={() => navigate(`/admin/production/${entry.id}`)}
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pd-tfoot-label">TOTAL</td>
                  <td className="pd-tfoot-val">{totalProduced.toLocaleString("en-IN")} units</td>
                  <td className="pd-tfoot-val">{totalSold.toLocaleString("en-IN")} units</td>
                  <td className="pd-tfoot-muted">—</td>
                  <td className="pd-tfoot-income">{fmt(totalIncome)}</td>
                  <td className="pd-tfoot-leftover">{totalLeftover.toLocaleString("en-IN")} units</td>
                  <td className="pd-tfoot-muted">—</td>
                  <td className="pd-tfoot-muted">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminProduction };
