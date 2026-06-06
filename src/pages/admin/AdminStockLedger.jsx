import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminStockLedger.css";

const PAGE_SIZE = 6;

const PRODUCT_FILTERS = [
  { id: "all",          label: "All products"  },
  { id: "cow_milk",     label: "Cow Milk"      },
  { id: "cow_ghee",     label: "Cow Ghee"      },
  { id: "buffalo_milk", label: "Buffalo Milk"  },
  { id: "buffalo_ghee", label: "Buffalo Ghee"  },
];

const ENTRIES = [
  /* ── Cow Ghee ── */
  {
    id: 1, date: "5 June", isToday: true, product: "Cow Ghee", productId: "cow_ghee", unit: "kg",
    opening: 400, fresh: 200, available: 600, sold: 250, converted: 0, dumped: 0,
    income: 125000, closing: 350, actionTaken: "Stored in fridge", status: "carried_fwd",
  },
  {
    id: 2, date: "4 June", isToday: false, product: "Cow Ghee", productId: "cow_ghee", unit: "kg",
    opening: 500, fresh: 200, available: 700, sold: 300, converted: 0, dumped: 0,
    income: 150000, closing: 400, actionTaken: "Stored in fridge", status: "carried_fwd",
  },
  {
    id: 3, date: "3 June", isToday: false, product: "Cow Ghee", productId: "cow_ghee", unit: "kg",
    opening: 450, fresh: 300, available: 750, sold: 250, converted: 0, dumped: 0,
    income: 125000, closing: 500, actionTaken: "Stored in fridge", status: "carried_fwd",
  },
  {
    id: 4, date: "2 June", isToday: false, product: "Cow Ghee", productId: "cow_ghee", unit: "kg",
    opening: 300, fresh: 400, available: 700, sold: 250, converted: 0, dumped: 0,
    income: 125000, closing: 450, actionTaken: "Stored in fridge", status: "carried_fwd",
  },
  {
    id: 5, date: "1 June", isToday: false, product: "Cow Ghee", productId: "cow_ghee", unit: "kg",
    opening: 200, fresh: 350, available: 550, sold: 250, converted: 0, dumped: 0,
    income: 125000, closing: 300, actionTaken: "Stored in fridge", status: "carried_fwd",
  },
  {
    id: 6, date: "31 May", isToday: false, product: "Cow Ghee", productId: "cow_ghee", unit: "kg",
    opening: 450, fresh: 300, available: 750, sold: 250, converted: 0, dumped: 0,
    income: 125000, closing: 500, actionTaken: "Stored in fridge", status: "carried_fwd",
  },
  /* ── Cow Milk ── */
  {
    id: 7, date: "5 June", isToday: true, product: "Cow Milk", productId: "cow_milk", unit: "L",
    opening: 50, fresh: 20, available: 70, sold: 65, converted: 0, dumped: 5,
    income: 1950, closing: 0, actionTaken: "Dumped — expired", status: "cleared",
  },
  {
    id: 8, date: "4 June", isToday: false, product: "Cow Milk", productId: "cow_milk", unit: "L",
    opening: 0, fresh: 150, available: 150, sold: 100, converted: 0, dumped: 0,
    income: 3000, closing: 50, actionTaken: "Carried to 5 June", status: "carried_fwd",
  },
  {
    id: 9, date: "3 June", isToday: false, product: "Cow Milk", productId: "cow_milk", unit: "L",
    opening: 5, fresh: 145, available: 150, sold: 150, converted: 0, dumped: 0,
    income: 4500, closing: 0, actionTaken: "Fully sold out", status: "cleared",
  },
  {
    id: 10, date: "2 June", isToday: false, product: "Cow Milk", productId: "cow_milk", unit: "L",
    opening: 10, fresh: 140, available: 150, sold: 145, converted: 0, dumped: 0,
    income: 4350, closing: 5, actionTaken: "Carried to 3 June", status: "carried_fwd",
  },
  /* ── Buffalo Milk ── */
  {
    id: 11, date: "5 June", isToday: true, product: "Buffalo Milk", productId: "buffalo_milk", unit: "L",
    opening: 80, fresh: 0, available: 80, sold: 75, converted: 0, dumped: 5,
    income: 1875, closing: 0, actionTaken: "Dumped — expired", status: "cleared",
  },
  {
    id: 12, date: "4 June", isToday: false, product: "Buffalo Milk", productId: "buffalo_milk", unit: "L",
    opening: 0, fresh: 380, available: 380, sold: 300, converted: 0, dumped: 0,
    income: 7500, closing: 80, actionTaken: "Carried to 5 June", status: "carried_fwd",
  },
  {
    id: 13, date: "3 June", isToday: false, product: "Buffalo Milk", productId: "buffalo_milk", unit: "L",
    opening: 30, fresh: 350, available: 380, sold: 380, converted: 0, dumped: 0,
    income: 9500, closing: 0, actionTaken: "Fully sold out", status: "cleared",
  },
];

const STATUS_META = {
  carried_fwd: { label: "Carry Fwd", icon: "sync",          cls: "sl-badge-carried" },
  cleared:     { label: "Cleared",   icon: "check_circle",  cls: "sl-badge-cleared" },
  in_storage:  { label: "In Storage",icon: "inventory_2",   cls: "sl-badge-storage" },
  wasted:      { label: "Dumped",    icon: "delete",        cls: "sl-badge-wasted"  },
};

function fmtNum(n) {
  return n.toLocaleString("en-IN");
}

function AdminStockLedger() {
  const navigate = useNavigate();
  const [activeProduct, setActiveProduct] = useState("all");
  const [page,          setPage]          = useState(1);
  const [dateFrom,      setDateFrom]      = useState("2026-05-22");
  const [dateTo,        setDateTo]        = useState("2026-06-05");

  const filtered   = activeProduct === "all"
    ? ENTRIES
    : ENTRIES.filter(e => e.productId === activeProduct);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* KPI values */
  const totalProduced = ENTRIES.reduce((s, e) => s + e.fresh, 0);
  const totalSold     = ENTRIES.reduce((s, e) => s + e.sold, 0);
  const sellRate      = totalProduced > 0
    ? Math.round((totalSold / totalProduced) * 100)
    : 0;

  /* Tfoot totals for current filter */
  const tfFresh   = filtered.reduce((s, e) => s + e.fresh,     0);
  const tfSold    = filtered.reduce((s, e) => s + e.sold,      0);
  const tfConv    = filtered.reduce((s, e) => s + e.converted, 0);
  const tfDumped  = filtered.reduce((s, e) => s + e.dumped,    0);
  const tfIncome  = filtered.reduce((s, e) => s + e.income,    0);
  const tfClosing = filtered.reduce((s, e) => s + e.closing,   0);
  const filterLabel = PRODUCT_FILTERS.find(p => p.id === activeProduct)?.label ?? "Products";

  function changeProduct(id) {
    setActiveProduct(id);
    setPage(1);
  }

  return (
    <div className="sl-page">

      {/* ── Header: title + date range ── */}
      <div className="sl-header">
        <h2 className="sl-title">Stock history ledger</h2>
        <div className="sl-date-range">
          <span className="material-symbols-outlined sl-date-icon">calendar_today</span>
          <input
            type="date"
            className="sl-date-input"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
          <span className="sl-date-sep">—</span>
          <input
            type="date"
            className="sl-date-input"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sl-tabs">
        <button
          type="button"
          className="sl-tab"
          onClick={() => navigate("/admin/production-log")}
        >
          All Production
        </button>
        <button type="button" className="sl-tab sl-tab-active">
          Stock History
        </button>
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="sl-kpi-grid">

        <div className="sl-kpi-card">
          <div className="sl-kpi-deco sl-deco-primary" />
          <p className="sl-kpi-label">
            <span className="material-symbols-outlined sl-kpi-icon">trending_up</span>
            Total Produced
          </p>
          <div className="sl-kpi-val-row">
            <span className="sl-kpi-val sl-kpi-primary">{fmtNum(totalProduced)}</span>
            <span className="sl-kpi-unit">kg</span>
          </div>
          <p className="sl-kpi-sub">
            <span className="sl-kpi-up">↑ 12%</span> vs last period
          </p>
        </div>

        <div className="sl-kpi-card">
          <div className="sl-kpi-deco sl-deco-secondary" />
          <p className="sl-kpi-label">
            <span className="material-symbols-outlined sl-kpi-icon">shopping_basket</span>
            Total Sold
          </p>
          <div className="sl-kpi-val-row">
            <span className="sl-kpi-val sl-kpi-secondary">{fmtNum(totalSold)}</span>
            <span className="sl-kpi-unit">kg</span>
          </div>
          <p className="sl-kpi-sub">{sellRate}% sell rate achieved</p>
        </div>

        <div className="sl-kpi-card">
          <div className="sl-kpi-deco sl-deco-primary" />
          <p className="sl-kpi-label">
            <span className="material-symbols-outlined sl-kpi-icon">inventory_2</span>
            Current Stock
          </p>
          <div className="sl-kpi-val-row">
            <span className="sl-kpi-val sl-kpi-primary">350</span>
            <span className="sl-kpi-unit">kg</span>
          </div>
          <p className="sl-kpi-sub">As of Jun 5, 2026</p>
        </div>

        <div className="sl-kpi-card">
          <div className="sl-kpi-deco sl-deco-error" />
          <p className="sl-kpi-label sl-label-error">
            <span className="material-symbols-outlined sl-kpi-icon">notification_important</span>
            Expiring Soon
          </p>
          <div className="sl-kpi-val-row">
            <span className="sl-kpi-val sl-kpi-error">Dec 2026</span>
          </div>
          <p className="sl-kpi-sub">170+ days remaining — safe</p>
        </div>

      </div>

      {/* ── Product filter pills ── */}
      <div className="sl-pills-row">
        <span className="sl-pills-label">Filter by product:</span>
        {PRODUCT_FILTERS.map(p => (
          <button
            key={p.id}
            type="button"
            className={`sl-pill${activeProduct === p.id ? " sl-pill-active" : ""}`}
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
              <tr className="sl-thead-row">
                <th className="sl-th">Date</th>
                <th className="sl-th">Product</th>
                <th className="sl-th sl-th-right">Opening Stock</th>
                <th className="sl-th sl-th-right">Fresh Prod</th>
                <th className="sl-th sl-th-right">Available</th>
                <th className="sl-th sl-th-right">Sold</th>
                <th className="sl-th sl-th-right">Conv.</th>
                <th className="sl-th sl-th-right">Dumped</th>
                <th className="sl-th sl-th-right">Income (₹)</th>
                <th className="sl-th sl-th-right">Closing Stock</th>
                <th className="sl-th">Action Taken</th>
                <th className="sl-th sl-th-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="sl-empty">No entries found</td>
                </tr>
              ) : paginated.map(e => {
                const sm = STATUS_META[e.status] ?? STATUS_META.carried_fwd;
                return (
                  <tr key={e.id} className={`sl-row${e.isToday ? " sl-row-today" : ""}`}>
                    <td className="sl-td-date">
                      {e.date}
                      {e.isToday && <span className="sl-today-sub">Today</span>}
                    </td>
                    <td className="sl-td">{e.product}</td>
                    <td className="sl-td sl-td-right sl-td-opening">{e.opening} {e.unit}</td>
                    <td className="sl-td sl-td-right">{e.fresh} {e.unit}</td>
                    <td className="sl-td sl-td-right sl-td-avail">{e.available} {e.unit}</td>
                    <td className="sl-td sl-td-right">{e.sold} {e.unit}</td>
                    <td className="sl-td sl-td-right sl-td-muted">
                      {e.converted > 0 ? `${e.converted} ${e.unit}` : "—"}
                    </td>
                    <td className={`sl-td sl-td-right${e.dumped > 0 ? " sl-td-dumped" : " sl-td-muted"}`}>
                      {e.dumped > 0 ? `${e.dumped} ${e.unit}` : "—"}
                    </td>
                    <td className="sl-td sl-td-right sl-td-income">
                      {fmtNum(e.income)}
                    </td>
                    <td className="sl-td sl-td-right sl-td-closing">
                      {e.closing} {e.unit}
                    </td>
                    <td className="sl-td sl-td-action">{e.actionTaken}</td>
                    <td className="sl-td sl-td-center">
                      <span className={`sl-badge ${sm.cls}`}>
                        <span
                          className="material-symbols-outlined sl-badge-icon"
                          style={{ fontVariationSettings: "'wght' 700" }}
                        >
                          {sm.icon}
                        </span>
                        {sm.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="sl-tfoot-row">
                <td className="sl-tfoot-td" colSpan={2}>
                  TOTAL ({filterLabel})
                </td>
                <td className="sl-tfoot-td sl-td-right">—</td>
                <td className="sl-tfoot-td sl-td-right">{fmtNum(tfFresh)} kg</td>
                <td className="sl-tfoot-td sl-td-right">—</td>
                <td className="sl-tfoot-td sl-td-right">{fmtNum(tfSold)} kg</td>
                <td className="sl-tfoot-td sl-td-right">{tfConv > 0 ? `${tfConv} kg` : "0 kg"}</td>
                <td className="sl-tfoot-td sl-td-right sl-tfoot-dumped">
                  {tfDumped > 0 ? `${tfDumped} kg` : "0 kg"}
                </td>
                <td className="sl-tfoot-td sl-td-right sl-tfoot-income">
                  ₹ {fmtNum(tfIncome)}
                </td>
                <td className="sl-tfoot-td sl-td-right sl-tfoot-closing">
                  {fmtNum(tfClosing)} kg
                </td>
                <td className="sl-tfoot-td" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="sl-pagination">
          <p className="sl-pg-info">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}{" "}
            to {Math.min(page * PAGE_SIZE, filtered.length)}{" "}
            of {filtered.length} entries
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

    </div>
  );
}

export { AdminStockLedger };
