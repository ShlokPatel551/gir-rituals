import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLowStock.css";

const LOW_STOCK_ITEMS = [
  {
    id: "PRD-002",
    name: "Fresh buffalo milk",
    subLabel: null,
    critical: true,
    icon: "water_drop",
    iconBg: "#e6e1e0",
    category: "MILK",
    catCls: "ls-cat-milk",
    subRate: "₹65", subRateUnit: "/L",
    buyRate: "₹54", buyRateUnit: "/L",
    currentQty: 18, currentUnit: "L",
    goalQty: 50,    goalUnit: "L",
    stockPct: 36,
    alertText: "Alert below 20L",
    alertCls: "ls-alert-critical",
    barCls: "ls-bar-error",
    qtyCls: "ls-qty-error",
    restockDefault: 32, restockUnit: "L",
  },
  {
    id: "PRD-005",
    name: "Cow curd",
    subLabel: "Set curd — daily fresh",
    critical: false,
    icon: "soup_kitchen",
    iconBg: "#e6e1e0",
    category: "CURD",
    catCls: "ls-cat-curd",
    subRate: "₹45", subRateUnit: "/200g",
    buyRate: "₹35", buyRateUnit: "/200g",
    currentQty: 8, currentUnit: "kg",
    goalQty: 20,   goalUnit: "kg",
    stockPct: 40,
    alertText: "Alert below 15 kg",
    alertCls: "ls-alert-normal",
    barCls: "ls-bar-secondary",
    qtyCls: "ls-qty-secondary",
    restockDefault: 12, restockUnit: "kg",
  },
  {
    id: "PRD-008",
    name: "Cow butter",
    subLabel: "Fresh white butter",
    critical: false,
    icon: "kitchen",
    iconBg: "#ffdcc4",
    category: "BUTTER",
    catCls: "ls-cat-butter",
    subRate: "₹75", subRateUnit: "/100g",
    buyRate: "₹60", buyRateUnit: "/100g",
    currentQty: 8, currentUnit: "kg",
    goalQty: 15,   goalUnit: "kg",
    stockPct: 53,
    alertText: "Alert below 10 kg",
    alertCls: "ls-alert-normal",
    barCls: "ls-bar-secondary",
    qtyCls: "ls-qty-secondary",
    restockDefault: 7, restockUnit: "kg",
  },
];

const initRestock = () => {
  const m = {};
  LOW_STOCK_ITEMS.forEach(p => { m[p.id] = p.restockDefault; });
  return m;
};

function AdminLowStock() {
  const navigate = useNavigate();
  const [restockQty, setRestockQty] = useState(initRestock);

  function setQty(id, val) {
    setRestockQty(prev => ({ ...prev, [id]: Math.max(0, parseInt(val) || 0) }));
  }

  return (
    <div className="ls-page">

      {/* ── Page title ── */}
      <h2 className="ls-page-title">Low stock</h2>

      {/* ── KPI cards ── */}
      <div className="ls-kpi-grid">

        {/* Low Stock Products */}
        <div className="ls-kpi-card ls-kpi-secondary">
          <div className="ls-kpi-icon-row">
            <span className="material-symbols-outlined ls-kpi-icon ls-icon-secondary">warning</span>
            <span className="ls-kpi-badge ls-badge-urgent">Urgent</span>
          </div>
          <p className="ls-kpi-label">Low Stock Products</p>
          <div className="ls-kpi-count-row">
            <span className="ls-kpi-big">{LOW_STOCK_ITEMS.length}</span>
            <span className="ls-kpi-unit">Items</span>
          </div>
          <ul className="ls-kpi-list">
            {LOW_STOCK_ITEMS.map(p => (
              <li key={p.id} className="ls-kpi-list-item">
                <span className="ls-kpi-dot ls-dot-secondary" />
                {p.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Expires Soon */}
        <div className="ls-kpi-card ls-kpi-error">
          <div className="ls-kpi-icon-row">
            <span className="material-symbols-outlined ls-kpi-icon ls-icon-error">history</span>
            <span className="ls-kpi-badge ls-badge-critical">Critical</span>
          </div>
          <p className="ls-kpi-label">Expires Soon</p>
          <div className="ls-kpi-count-row">
            <span className="ls-kpi-big ls-big-error">1</span>
            <span className="ls-kpi-unit">Item</span>
          </div>
          <ul className="ls-kpi-list">
            <li className="ls-kpi-list-item">
              <span className="ls-kpi-dot ls-dot-error" />
              Buffalo milk (18L)
            </li>
          </ul>
        </div>

        {/* Total Low Qty */}
        <div className="ls-kpi-card ls-kpi-primary">
          <div className="ls-kpi-icon-row">
            <span className="material-symbols-outlined ls-kpi-icon ls-icon-primary">inventory</span>
          </div>
          <p className="ls-kpi-label">Total Low Qty</p>
          <div className="ls-kpi-count-row">
            <span className="ls-kpi-big">34</span>
            <span className="ls-kpi-unit">Units</span>
          </div>
          <p className="ls-kpi-sub">Across {LOW_STOCK_ITEMS.length} products</p>
        </div>

        {/* Subscribers Affected */}
        <div className="ls-kpi-card ls-kpi-green">
          <div className="ls-kpi-icon-row">
            <span className="material-symbols-outlined ls-kpi-icon ls-icon-green">groups</span>
          </div>
          <p className="ls-kpi-label">Subscribers Affected</p>
          <div className="ls-kpi-count-row">
            <span className="ls-kpi-big ls-big-primary">47</span>
            <span className="ls-kpi-unit">People</span>
          </div>
          <p className="ls-kpi-sub">Risk if not restocked</p>
        </div>

      </div>

      {/* ── Table card with tabs ── */}
      <div className="ls-table-card">

        {/* Tabs inside card */}
        <div className="ls-tabs">
          <button type="button" className="ls-tab" onClick={() => navigate("/admin/products")}>
            All products
          </button>
          <button type="button" className="ls-tab ls-tab-active">
            Low stock
          </button>
          <button type="button" className="ls-tab" onClick={() => navigate("/admin/out-of-stock")}>
            Out of stock
          </button>
        </div>

        {/* Table */}
        <div className="ls-table-scroll">
          <table className="ls-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Sub Rate</th>
                <th>Buy Rate</th>
                <th>Current Stock</th>
                <th>Restock Qty</th>
                <th>Total Stock After Restock</th>
                <th className="ls-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {LOW_STOCK_ITEMS.map(p => {
                const total = p.currentQty + (restockQty[p.id] || 0);
                return (
                  <tr key={p.id} className="ls-row">
                    <td className="ls-td-id">{p.id}</td>
                    <td>
                      <div className="ls-product-cell">
                        <div className="ls-thumb-box" style={{ background: p.iconBg }}>
                          <span className="material-symbols-outlined ls-thumb-icon">{p.icon}</span>
                        </div>
                        <div>
                          <p className="ls-product-name">{p.name}</p>
                          {p.critical
                            ? <span className="ls-critical-badge">Most critical</span>
                            : <p className="ls-product-sub">{p.subLabel}</p>
                          }
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`ls-cat-badge ${p.catCls}`}>{p.category}</span>
                    </td>
                    <td className="ls-td-rate">
                      {p.subRate} <span className="ls-td-unit">{p.subRateUnit}</span>
                    </td>
                    <td className="ls-td-rate ls-rate-muted">
                      {p.buyRate} <span className="ls-td-unit">{p.buyRateUnit}</span>
                    </td>
                    <td>
                      <div className="ls-stock-cell">
                        <div className="ls-stock-row">
                          <span className={`ls-stock-qty ${p.qtyCls}`}>
                            {p.currentQty} {p.currentUnit}
                          </span>
                          <span className="ls-stock-goal">Goal: {p.goalQty}{p.goalUnit}</span>
                        </div>
                        <div className="ls-stock-track">
                          <div className={`ls-stock-fill ${p.barCls}`} style={{ width: `${p.stockPct}%` }} />
                        </div>
                        <p className={`ls-alert-text ${p.alertCls}`}>{p.alertText}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ls-restock-wrap">
                        <input
                          type="number"
                          className={`ls-restock-input${p.critical ? " ls-input-critical" : ""}`}
                          value={restockQty[p.id]}
                          min={0}
                          onChange={e => setQty(p.id, e.target.value)}
                        />
                        <span className="ls-restock-unit">{p.restockUnit}</span>
                      </div>
                    </td>
                    <td className="ls-td-total">
                      {total} {p.currentUnit}
                    </td>
                    <td className="ls-th-right">
                      <div className="ls-act-row">
                        <button type="button" className="ls-act-btn" title="Edit product" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button type="button" className="ls-act-btn" title="View details" onClick={() => navigate(`/admin/products/${p.id}`)}>
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="ls-card-footer">
          <p className="ls-footer-text">
            {LOW_STOCK_ITEMS.length} products with low stock — sorted by most critical first
          </p>
        </div>

      </div>
    </div>
  );
}

export { AdminLowStock };
