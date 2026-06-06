import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOutOfStock.css";

const OUT_OF_STOCK = [
  {
    id: "PRD-004",
    name: "Soft fresh paneer",
    icon: "bakery_dining",
    iconBg: "#ffdcbd",
    outDate: "28 May 2024",
    category: "PANEER",
    catCls: "os-cat-paneer",
    subRate: "₹90",
    buyRate: "₹110",
    restockUnit: "kg",
  },
  {
    id: "PRD-005",
    name: "Cow curd set",
    icon: "soup_kitchen",
    iconBg: "#e6e1e0",
    outDate: "26 May 2024",
    category: "CURD",
    catCls: "os-cat-curd",
    subRate: "₹45",
    buyRate: "₹55",
    restockUnit: "kg",
  },
  {
    id: "PRD-008",
    name: "Cow butter white",
    icon: "kitchen",
    iconBg: "#ffdcc4",
    outDate: "27 May 2024",
    category: "BUTTER",
    catCls: "os-cat-butter",
    subRate: "₹75",
    buyRate: "₹90",
    restockUnit: "kg",
  },
  {
    id: "PRD-002",
    name: "Buffalo milk fresh",
    icon: "water_drop",
    iconBg: "#e6e1e0",
    outDate: "29 May 2024",
    category: "MILK",
    catCls: "os-cat-milk",
    subRate: "₹65",
    buyRate: "₹54",
    restockUnit: "L",
  },
  {
    id: "PRD-012",
    name: "Flavored Milk Kesar",
    icon: "local_cafe",
    iconBg: "#c1ecd4",
    outDate: "30 May 2024",
    category: "MILK",
    catCls: "os-cat-milk",
    subRate: "₹55",
    buyRate: "₹45",
    restockUnit: "L",
  },
  {
    id: "PRD-015",
    name: "Greek Yogurt",
    icon: "soup_kitchen",
    iconBg: "#e6e1e0",
    outDate: "01 Jun 2024",
    category: "CURD",
    catCls: "os-cat-curd",
    subRate: "₹80",
    buyRate: "₹65",
    restockUnit: "kg",
  },
];

const initRestock = () => {
  const m = {};
  OUT_OF_STOCK.forEach(p => { m[p.id] = 0; });
  return m;
};

function AdminOutOfStock() {
  const navigate = useNavigate();
  const [restockQty, setRestockQty] = useState(initRestock);

  function setQty(id, val) {
    setRestockQty(prev => ({ ...prev, [id]: Math.max(0, parseInt(val) || 0) }));
  }

  return (
    <div className="os-page">

      {/* ── Critical alert banner ── */}
      <div className="os-alert-banner">
        <div className="os-alert-left">
          <div className="os-alert-icon-box">
            <span className="material-symbols-outlined os-alert-icon">report</span>
          </div>
          <div>
            <p className="os-alert-title">Critical stock alert</p>
            <p className="os-alert-sub">
              {OUT_OF_STOCK.length} products are currently out of stock and hidden from customer ordering.
            </p>
          </div>
        </div>
        <div className="os-alert-actions">
          <button type="button" className="os-alert-btn-ghost">
            <span className="material-symbols-outlined">download</span>
            Export list
          </button>
          <button type="button" className="os-alert-btn-solid">
            <span className="material-symbols-outlined">notifications_active</span>
            Alert supplier
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="os-kpi-grid">

        {/* Total out of stock */}
        <div className="os-kpi-card">
          <div className="os-kpi-icon-box">
            <span className="material-symbols-outlined os-kpi-icon">inventory_2</span>
          </div>
          <div>
            <p className="os-kpi-label">Total Out of Stock</p>
            <div className="os-kpi-count-row">
              <span className="os-kpi-big">{OUT_OF_STOCK.length}</span>
              <span className="os-kpi-unit">Products</span>
            </div>
            <p className="os-kpi-sub">Hidden from ordering</p>
          </div>
        </div>

        {/* Affected products list */}
        <div className="os-kpi-card os-kpi-card-list">
          <p className="os-kpi-label">Affected Products</p>
          <ul className="os-product-list">
            {OUT_OF_STOCK.map(p => (
              <li key={p.id} className="os-product-list-item">
                <span className="os-product-dot" />
                {p.name}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Filter pill tabs ── */}
      <div className="os-filter-pills">
        <button type="button" className="os-pill" onClick={() => navigate("/admin/products")}>
          All products
        </button>
        <button type="button" className="os-pill" onClick={() => navigate("/admin/stock")}>
          In stock
        </button>
        <button type="button" className="os-pill" onClick={() => navigate("/admin/low-stock")}>
          Low stock
        </button>
        <button type="button" className="os-pill os-pill-active">
          Out of stock
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="os-table-card">
        <div className="os-table-scroll">
          <table className="os-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Date of Out of Stock</th>
                <th>Category</th>
                <th>Sub Rate</th>
                <th>Buy Rate</th>
                <th>Stock</th>
                <th className="os-th-center">Add Restock Qty</th>
                <th className="os-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {OUT_OF_STOCK.map(p => (
                <tr key={p.id} className="os-row">
                  <td className="os-td-id">{p.id}</td>
                  <td>
                    <div className="os-product-cell">
                      <div className="os-thumb-box" style={{ background: p.iconBg }}>
                        <span className="material-symbols-outlined os-thumb-icon">{p.icon}</span>
                      </div>
                      <span className="os-product-name">{p.name}</span>
                    </div>
                  </td>
                  <td className="os-td-date">{p.outDate}</td>
                  <td>
                    <span className={`os-cat-badge ${p.catCls}`}>{p.category}</span>
                  </td>
                  <td className="os-td-rate">{p.subRate}</td>
                  <td className="os-td-rate os-rate-muted">{p.buyRate}</td>
                  <td>
                    <div className="os-stock-cell">
                      <span className="os-stock-zero">0</span>
                      <span className="os-stock-label">OUT OF STOCK</span>
                    </div>
                  </td>
                  <td className="os-th-center">
                    <div className="os-restock-wrap">
                      <input
                        type="number"
                        className="os-restock-input"
                        value={restockQty[p.id]}
                        min={0}
                        onChange={e => setQty(p.id, e.target.value)}
                      />
                      <span className="os-restock-unit">{p.restockUnit}</span>
                    </div>
                  </td>
                  <td className="os-th-right">
                    <button type="button" className="os-restock-btn">
                      <span className="material-symbols-outlined">add_circle</span>
                      Restock now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="os-card-footer">
          <p className="os-footer-text">
            {OUT_OF_STOCK.length} products out of stock — hidden from customer ordering
          </p>
          <div className="os-footer-actions">
            <button type="button" className="os-footer-btn">
              <span className="material-symbols-outlined">print</span>
              Print label
            </button>
            <button type="button" className="os-footer-btn">
              <span className="material-symbols-outlined">history</span>
              View logs
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminOutOfStock };
