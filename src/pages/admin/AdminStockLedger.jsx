import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminStockLedger.css";

const PAGE_SIZE = 5;

const PRODUCTS = [
  { id: "all",          label: "All products"  },
  { id: "cow_milk",     label: "Cow milk"       },
  { id: "buffalo_milk", label: "Buffalo milk"   },
  { id: "paneer",       label: "Paneer"         },
  { id: "cow_ghee",     label: "Cow ghee"       },
];

const ENTRIES = [
  /* ── 29 May ── */
  {
    id: 1, date: "29 May", product: "Cow milk", productId: "cow_milk", unit: "L",
    opening: 0, fresh: 150, total: 150, sold: 100, converted: null, convertedQty: 0, dumped: 0,
    closing: "50 L → 30 May", expiryLabel: "30 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  {
    id: 2, date: "29 May", product: "Buffalo milk", productId: "buffalo_milk", unit: "L",
    opening: 0, fresh: 380, total: 380, sold: 300, converted: null, convertedQty: 0, dumped: 0,
    closing: "80 L → 30 May", expiryLabel: "30 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  {
    id: 3, date: "29 May", product: "Paneer", productId: "paneer", unit: "kg",
    opening: 0, fresh: 80, total: 80, sold: 72, converted: null, convertedQty: 0, dumped: 0,
    closing: "8 kg → 30 May", expiryLabel: "01 June", expiryWarn: false, expired: false,
    status: "carried_fwd",
  },
  /* ── 30 May ── */
  {
    id: 4, date: "30 May", product: "Cow milk", productId: "cow_milk", unit: "L",
    opening: 50, fresh: 20, total: 70, sold: 65, converted: null, convertedQty: 0, dumped: 5,
    closing: "0 L — cleared", expiryLabel: "30 May — expired", expiryWarn: false, expired: true,
    status: "cleared",
  },
  {
    id: 5, date: "30 May", product: "Buffalo milk", productId: "buffalo_milk", unit: "L",
    opening: 80, fresh: 0, total: 80, sold: 40, converted: "40 L → curd", convertedQty: 40, dumped: 0,
    closing: "0 L — cleared", expiryLabel: "30 May — expired", expiryWarn: false, expired: true,
    status: "cleared",
  },
  /* ── 28 May ── */
  {
    id: 6, date: "28 May", product: "Cow milk", productId: "cow_milk", unit: "L",
    opening: 10, fresh: 140, total: 150, sold: 140, converted: null, convertedQty: 0, dumped: 0,
    closing: "10 L → 29 May", expiryLabel: "29 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  {
    id: 7, date: "28 May", product: "Buffalo milk", productId: "buffalo_milk", unit: "L",
    opening: 0, fresh: 350, total: 350, sold: 310, converted: null, convertedQty: 0, dumped: 0,
    closing: "40 L → 29 May", expiryLabel: "29 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  {
    id: 8, date: "28 May", product: "Paneer", productId: "paneer", unit: "kg",
    opening: 0, fresh: 75, total: 75, sold: 67, converted: null, convertedQty: 0, dumped: 0,
    closing: "8 kg → 29 May", expiryLabel: "30 May", expiryWarn: false, expired: false,
    status: "carried_fwd",
  },
  /* ── 27 May ── */
  {
    id: 9, date: "27 May", product: "Cow milk", productId: "cow_milk", unit: "L",
    opening: 0, fresh: 145, total: 145, sold: 135, converted: null, convertedQty: 0, dumped: 0,
    closing: "10 L → 28 May", expiryLabel: "28 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  {
    id: 10, date: "27 May", product: "Buffalo milk", productId: "buffalo_milk", unit: "L",
    opening: 0, fresh: 360, total: 360, sold: 320, converted: null, convertedQty: 0, dumped: 0,
    closing: "40 L → 28 May", expiryLabel: "28 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  {
    id: 11, date: "27 May", product: "Cow ghee", productId: "cow_ghee", unit: "kg",
    opening: 0, fresh: 20, total: 20, sold: 16, converted: null, convertedQty: 0, dumped: 0,
    closing: "4 kg → 01 June", expiryLabel: "01 June", expiryWarn: false, expired: false,
    status: "in_storage",
  },
  /* ── 26 May ── */
  {
    id: 12, date: "26 May", product: "Cow milk", productId: "cow_milk", unit: "L",
    opening: 5, fresh: 150, total: 155, sold: 150, converted: null, convertedQty: 0, dumped: 5,
    closing: "0 L — cleared", expiryLabel: "26 May — expired", expiryWarn: false, expired: true,
    status: "cleared",
  },
  {
    id: 13, date: "26 May", product: "Paneer", productId: "paneer", unit: "kg",
    opening: 0, fresh: 80, total: 80, sold: 76, converted: null, convertedQty: 0, dumped: 0,
    closing: "4 kg → 27 May", expiryLabel: "27 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  /* ── 25 May ── */
  {
    id: 14, date: "25 May", product: "Cow milk", productId: "cow_milk", unit: "L",
    opening: 0, fresh: 160, total: 160, sold: 155, converted: null, convertedQty: 0, dumped: 0,
    closing: "5 L → 26 May", expiryLabel: "26 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
  {
    id: 15, date: "25 May", product: "Buffalo milk", productId: "buffalo_milk", unit: "L",
    opening: 0, fresh: 370, total: 370, sold: 340, converted: null, convertedQty: 0, dumped: 0,
    closing: "30 L → 26 May", expiryLabel: "26 May (1 day)", expiryWarn: true, expired: false,
    status: "carried_fwd",
  },
];

const STATUS_META = {
  carried_fwd: { label: "Carried fwd", cls: "sl-badge-carried"  },
  cleared:     { label: "Cleared",     cls: "sl-badge-cleared"  },
  in_storage:  { label: "In Storage",  cls: "sl-badge-storage"  },
  wasted:      { label: "Wasted",      cls: "sl-badge-wasted"   },
};

function AdminStockLedger() {
  const navigate = useNavigate();
  const [activeProduct, setActiveProduct] = useState("all");
  const [page, setPage]                   = useState(1);
  const [toast, setToast]                 = useState("");

  const filtered   = activeProduct === "all" ? ENTRIES : ENTRIES.filter(e => e.productId === activeProduct);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalFresh     = ENTRIES.reduce((s, e) => s + e.fresh, 0);
  const totalDumped    = ENTRIES.reduce((s, e) => s + e.dumped, 0);
  const totalConverted = ENTRIES.reduce((s, e) => s + e.convertedQty, 0);
  const convRate       = totalFresh > 0 ? ((totalConverted / totalFresh) * 100).toFixed(2) : "0.00";

  function changeProduct(id) {
    setActiveProduct(id);
    setPage(1);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  return (
    <div className="sl-page">

      {/* Toast */}
      {toast && (
        <div className="sl-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {toast}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="sl-header">
        <div>
          <div className="sl-title-row">
            <span className="material-symbols-outlined sl-title-icon">history</span>
            <h2 className="sl-title">Stock history ledger</h2>
          </div>
          <p className="sl-desc">
            Monitor inventory flow, production outputs, and clearing cycles with high precision for premium dairy products.
          </p>
        </div>
        <div className="sl-controls-bar">
          <div className="sl-select-wrap">
            <select
              className="sl-select"
              value={activeProduct}
              onChange={e => changeProduct(e.target.value)}
            >
              {PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined sl-select-arrow">expand_more</span>
          </div>
          <div className="sl-ctrl-divider" />
          <div className="sl-month-chip">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>May 2026</span>
          </div>
          <button
            type="button"
            className="sl-back-btn"
            onClick={() => navigate("/admin/production")}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Production
          </button>
          <button
            type="button"
            className="sl-export-btn"
            onClick={() => showToast("Exporting stock history as Excel…")}
          >
            <span className="material-symbols-outlined">download</span>
            Export Excel
          </button>
        </div>
      </div>

      {/* ── Product tabs ── */}
      <div className="sl-tabs-bar">
        {PRODUCTS.map(p => (
          <button
            key={p.id}
            type="button"
            className={`sl-tab${activeProduct === p.id ? " sl-tab-active" : ""}`}
            onClick={() => changeProduct(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Ledger table card ── */}
      <div className="sl-table-card">
        <div className="sl-table-scroll">
          <table className="sl-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Opening</th>
                <th>Fresh Prod.</th>
                <th>Total Avail.</th>
                <th>Sold</th>
                <th>Converted</th>
                <th>Dumped</th>
                <th>Closing</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={11} className="sl-empty">No entries found</td>
                </tr>
              ) : paginated.map(entry => {
                const sm = STATUS_META[entry.status];
                return (
                  <tr key={entry.id} className="sl-row">
                    <td className="sl-td-date">{entry.date}</td>
                    <td className="sl-td-product">{entry.product}</td>
                    <td className="sl-td sl-td-muted">{entry.opening} {entry.unit}</td>
                    <td className="sl-td sl-td-muted">
                      {entry.fresh > 0 ? `${entry.fresh} ${entry.unit}` : "0"}
                    </td>
                    <td className="sl-td sl-td-total">{entry.total} {entry.unit}</td>
                    <td className="sl-td-sold-cell">
                      <span className="sl-sold-pill">{entry.sold} {entry.unit}</span>
                    </td>
                    <td className={`sl-td${entry.converted ? " sl-td-converted" : " sl-td-muted"}`}>
                      {entry.converted ?? "0"}
                    </td>
                    <td className={`sl-td${entry.dumped > 0 ? " sl-td-dumped" : " sl-td-muted"}`}>
                      {entry.dumped > 0 ? `${entry.dumped} ${entry.unit}` : "0"}
                    </td>
                    <td className="sl-td sl-td-muted">{entry.closing}</td>
                    <td
                      className={`sl-td${
                        entry.expired   ? " sl-td-expired"
                      : entry.expiryWarn ? " sl-td-expiry-warn"
                      : " sl-td-muted"
                      }`}
                    >
                      {entry.expiryLabel}
                    </td>
                    <td>
                      <span className={`sl-badge ${sm.cls}`}>{sm.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="sl-pagination">
          <p className="sl-pg-info">
            Showing{" "}
            <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong>
            {" "}of <strong>{filtered.length}</strong> entries
          </p>
          <div className="sl-pg-controls">
            <button
              type="button"
              className="sl-pg-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                className={`sl-pg-btn sl-pg-num${page === n ? " sl-pg-active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="sl-pg-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Insights grid ── */}
      <div className="sl-insights-grid">

        <div className="sl-insight-card">
          <div className="sl-insight-hd">
            <span className="sl-insight-lbl">Total Fresh Produced</span>
            <span className="material-symbols-outlined sl-icon-primary">trending_up</span>
          </div>
          <p className="sl-insight-val">
            {totalFresh.toLocaleString("en-IN")} Units
            <span className="sl-insight-sub"> this month</span>
          </p>
        </div>

        <div className="sl-insight-card">
          <div className="sl-insight-hd">
            <span className="sl-insight-lbl">Conversion Rate</span>
            <span className="material-symbols-outlined sl-icon-secondary">transform</span>
          </div>
          <p className="sl-insight-val">
            {convRate}%
            <span className="sl-insight-sub"> Milk to Curd</span>
          </p>
        </div>

        <div className="sl-insight-card">
          <div className="sl-insight-hd">
            <span className="sl-insight-lbl">Dumped / Waste</span>
            <span className="material-symbols-outlined sl-icon-error">delete_forever</span>
          </div>
          <p className="sl-insight-val sl-val-error">
            {totalDumped} Units
            <span className="sl-insight-sub sl-sub-muted"> Total Loss</span>
          </p>
        </div>

      </div>

    </div>
  );
}

export { AdminStockLedger };
