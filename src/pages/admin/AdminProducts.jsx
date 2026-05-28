import { useState, useEffect } from "react";
import "./AdminProducts.css";
const PRODUCTS = [
  {
    id: "milk",
    name: "Premium Gir Cow Milk",
    sku: "GR-MLK-001",
    category: "Dairy / Milk",
    price: "\u20B995.00 / L",
    stock: 142,
    maxStock: 200,
    stockLevel: "full",
    stockLabel: "Full Stock",
    status: "active",
    emoji: "\u{1F95B}",
    thumbBg: "#c1ecd4"
  },
  {
    id: "ghee",
    name: "Handcrafted A2 Gir Ghee",
    sku: "GR-GHE-042",
    category: "Dairy / Ghee",
    price: "\u20B91,250.00 / 500g",
    stock: 5,
    maxStock: 50,
    stockLevel: "low",
    stockLabel: "5 left",
    status: "active",
    emoji: "\u{1FAD9}",
    thumbBg: "#ffdcc4"
  },
  {
    id: "paneer",
    name: "Artisanal Malai Paneer",
    sku: "GR-PAN-015",
    category: "Dairy / Cheese",
    price: "\u20B9120.00 / 200g",
    stock: 24,
    maxStock: 100,
    stockLevel: "reorder",
    stockLabel: "Reorder Soon",
    status: "active",
    emoji: "\u{1F9C0}",
    thumbBg: "#ffdcbd"
  },
  {
    id: "curd",
    name: "Farm-Fresh Vedic Curd",
    sku: "GR-CRD-088",
    category: "Dairy / Yogurt",
    price: "\u20B960.00 / 500g",
    stock: 0,
    maxStock: 80,
    stockLevel: "out",
    stockLabel: "Out of Stock",
    status: "hidden",
    emoji: "\u{1F963}",
    thumbBg: "#e6e1e0"
  },
  {
    id: "butter",
    name: "White Butter (Makhan)",
    sku: "GR-BUT-007",
    category: "Dairy / Butter",
    price: "\u20B9280.00 / 200g",
    stock: 38,
    maxStock: 60,
    stockLevel: "reorder",
    stockLabel: "Reorder Soon",
    status: "active",
    emoji: "\u{1F9C8}",
    thumbBg: "#ffca98"
  },
  {
    id: "honey",
    name: "Raw Forest Honey",
    sku: "GR-HON-023",
    category: "Natural / Honey",
    price: "\u20B9650.00 / 250g",
    stock: 67,
    maxStock: 100,
    stockLevel: "full",
    stockLabel: "Full Stock",
    status: "active",
    emoji: "\u{1F36F}",
    thumbBg: "#ffdcbd"
  }
];
const CATEGORIES = ["All Categories", "Dairy / Milk", "Dairy / Ghee", "Dairy / Cheese", "Dairy / Yogurt", "Dairy / Butter", "Natural / Honey"];
const STOCK_FILTERS = ["Stock Status: All", "Full Stock", "Reorder Soon", "Low Stock", "Out of Stock"];
const STOCK_LEVEL_TO_FILTER = {
  full: "Full Stock",
  reorder: "Reorder Soon",
  low: "Low Stock",
  out: "Out of Stock"
};
function AdminProducts() {
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("Stock Status: All");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("Inventory updated successfully.");
  const filtered = PRODUCTS.filter((p) => {
    const catOk = categoryFilter === "All Categories" || p.category === categoryFilter;
    const stOk = stockFilter === "Stock Status: All" || STOCK_LEVEL_TO_FILTER[p.stockLevel] === stockFilter;
    return catOk && stOk;
  });
  const allChecked = selected.size === filtered.length && filtered.length > 0;
  function toggleAll() {
    setSelected(allChecked ? /* @__PURE__ */ new Set() : new Set(filtered.map((p) => p.id)));
  }
  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function showToast(msg) {
    setToastMsg(msg);
    setToastVisible(true);
  }
  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 3500);
    return () => clearTimeout(t);
  }, [toastVisible]);
  const lowStockCount = PRODUCTS.filter((p) => p.stockLevel === "low" || p.stockLevel === "reorder").length;
  const outCount = PRODUCTS.filter((p) => p.stockLevel === "out").length;
  return <div className="inv-page">

      {
    /* ── Page header ── */
  }
      <div className="inv-page-header">
        <div>
          <h2 className="inv-page-title">Product Inventory</h2>
          <p className="inv-page-sub">Manage your premium dairy heritage catalog and stock levels.</p>
        </div>
        <div className="inv-header-actions">
          <button type="button" className="inv-btn-ghost">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>file_download</span>
            Export CSV
          </button>
          <button
    type="button"
    className="inv-btn-filled"
    onClick={() => showToast("New product form coming soon!")}
  >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            New Product
          </button>
        </div>
      </div>

      {
    /* ── Stats mini bento ── */
  }
      <div className="inv-stats-grid">
        <div className="bento-card inv-stat-card">
          <p className="inv-stat-label">Total Products</p>
          <p className="inv-stat-value inv-stat-green">{PRODUCTS.length}</p>
        </div>
        <div className="bento-card inv-stat-card">
          <p className="inv-stat-label">Low Stock Alerts</p>
          <p className="inv-stat-value inv-stat-error">{lowStockCount}</p>
        </div>
        <div className="bento-card inv-stat-card">
          <p className="inv-stat-label">In Transit</p>
          <p className="inv-stat-value inv-stat-tan">420 Units</p>
        </div>
        <div className="bento-card inv-stat-card">
          <p className="inv-stat-label">Out of Stock</p>
          <p className="inv-stat-value inv-stat-muted">{outCount} Items</p>
        </div>
      </div>

      {
    /* ── Filter bar ── */
  }
      <div className="inv-filter-bar">
        <div className="inv-filter-left">
          <label className="inv-select-all-label">
            <input
    type="checkbox"
    className="inv-checkbox"
    checked={allChecked}
    onChange={toggleAll}
  />
            <span>Select All</span>
          </label>
          <div className="inv-filter-divider" />
          <div className="inv-bulk-actions">
            <button
    type="button"
    className="inv-bulk-btn"
    disabled={selected.size === 0}
    onClick={() => showToast(`${selected.size} product(s) hidden.`)}
  >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility_off</span>
              Hide Selected
            </button>
            <button
    type="button"
    className="inv-bulk-btn inv-bulk-delete"
    disabled={selected.size === 0}
    onClick={() => showToast(`${selected.size} product(s) deleted.`)}
  >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
              Delete
            </button>
          </div>
        </div>
        <div className="inv-filter-right">
          <select
    className="inv-select"
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
  >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
    className="inv-select"
    value={stockFilter}
    onChange={(e) => setStockFilter(e.target.value)}
  >
            {STOCK_FILTERS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {
    /* ── Products table ── */
  }
      <div className="bento-card inv-table-card">
        <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="admin-table inv-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
    type="checkbox"
    className="inv-checkbox"
    checked={allChecked}
    onChange={toggleAll}
  />
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => <tr
    key={p.id}
    className={`inv-row ${p.status === "hidden" ? "inv-row-hidden" : ""} ${selected.has(p.id) ? "inv-row-selected" : ""}`}
    onClick={(e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
        toggleRow(p.id);
      }
    }}
  >
                  <td>
                    <input
    type="checkbox"
    className="inv-checkbox"
    checked={selected.has(p.id)}
    onChange={() => toggleRow(p.id)}
    onClick={(e) => e.stopPropagation()}
  />
                  </td>
                  <td>
                    <div className="inv-product-cell">
                      <div className="inv-thumb" style={{ background: p.thumbBg }}>
                        <span>{p.emoji}</span>
                      </div>
                      <div>
                        <p className="inv-product-name">{p.name}</p>
                        <p className="inv-product-sku">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="adm-cell-muted">{p.category}</td>
                  <td className="inv-price">{p.price}</td>
                  <td>
                    {p.stockLevel === "low" ? <div className="inv-stock-low">
                        <span className="inv-stock-low-count">{p.stock} left</span>
                        <div className="inv-stock-bar-track">
                          <div
    className="inv-stock-bar-fill inv-bar-error"
    style={{ width: `${Math.round(p.stock / p.maxStock * 100)}%` }}
  />
                        </div>
                      </div> : p.stockLevel === "reorder" ? <div>
                        <p className="inv-stock-count">{p.stock} Units</p>
                        <div className="inv-stock-bar-track" style={{ marginTop: 4 }}>
                          <div
    className="inv-stock-bar-fill inv-bar-warning"
    style={{ width: `${Math.round(p.stock / p.maxStock * 100)}%` }}
  />
                        </div>
                        <p className="inv-stock-label inv-label-tan">{p.stockLabel}</p>
                      </div> : p.stockLevel === "out" ? <div>
                        <p className="inv-stock-count">0 Units</p>
                        <p className="inv-stock-label inv-label-error">{p.stockLabel}</p>
                      </div> : <div>
                        <p className="inv-stock-count">{p.stock} Units</p>
                        <p className="inv-stock-label inv-label-green">{p.stockLabel}</p>
                      </div>}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.status === "active" ? <span className="inv-badge inv-badge-active">
                        <span className="inv-dot inv-dot-green" />
                        Active
                      </span> : <span className="inv-badge inv-badge-hidden">
                        <span className="inv-dot inv-dot-grey" />
                        Hidden
                      </span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="inv-action-row">
                      <button
    type="button"
    className="inv-action-btn"
    title="Edit"
    onClick={(e) => {
      e.stopPropagation();
      showToast(`Editing ${p.name}\u2026`);
    }}
  >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
                      </button>
                      <button
    type="button"
    className="inv-action-btn"
    title="More options"
    onClick={(e) => e.stopPropagation()}
  >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

        {
    /* Pagination */
  }
        <div className="inv-pagination">
          <p className="inv-page-info">
            Showing <strong>{filtered.length}</strong> of <strong>124</strong> products
          </p>
          <div className="inv-page-nums">
            <button type="button" className="inv-page-arrow" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {[1, 2, 3].map((n) => <button key={n} type="button" className={`inv-page-num ${n === 1 ? "inv-page-active" : ""}`}>{n}</button>)}
            <span className="inv-page-ellipsis">…</span>
            <button type="button" className="inv-page-num">31</button>
            <button type="button" className="inv-page-arrow">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {
    /* ── Toast notification ── */
  }
      <div className={`inv-toast ${toastVisible ? "inv-toast-visible" : ""}`}>
        <span className="material-symbols-outlined" style={{ color: "var(--admin-primary-fixed)", fontSize: 20 }}>check_circle</span>
        <p className="inv-toast-msg">{toastMsg}</p>
        <button type="button" className="inv-toast-close" onClick={() => setToastVisible(false)}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>

    </div>;
}
export {
  AdminProducts
};
