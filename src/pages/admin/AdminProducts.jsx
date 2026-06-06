import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProducts.css";

const PRODUCTS = [
  { id: "PRD-001", name: "Cow milk (A2)",    desc: "Pure Gir cow milk",          icon: "water_drop",       iconBg: "#F5DFC8", category: "MILK",   catCls: "inv-cat-milk",   subRate: "₹68 / L",       buyOnceRate: "₹75 / L",       stockQty: "150 L",  stockPct: 85, stockStatus: "in_stock"     },
  { id: "PRD-002", name: "Buffalo milk",      desc: "Fresh buffalo milk",          icon: "water_drop",       iconBg: "#e6e1e0", category: "MILK",   catCls: "inv-cat-milk",   subRate: "₹52 / L",       buyOnceRate: "₹58 / L",       stockQty: "18 L",   stockPct: 20, stockStatus: "low_stock"    },
  { id: "PRD-003", name: "Cow ghee (A2)",     desc: "Pure cultured ghee",          icon: "local_fire_department", iconBg: "#ffca98", category: "GHEE", catCls: "inv-cat-ghee",   subRate: "₹620 / 500g",   buyOnceRate: "₹680 / 500g",   stockQty: "42 kg",  stockPct: 65, stockStatus: "in_stock"     },
  { id: "PRD-004", name: "Paneer (fresh)",    desc: "Soft fresh paneer",           icon: "bakery_dining",    iconBg: "#ffdcbd", category: "PANEER", catCls: "inv-cat-paneer", subRate: "₹90 / 250g",    buyOnceRate: "₹110 / 250g",   stockQty: "0 kg",   stockPct: 0,  stockStatus: "out_of_stock" },
  { id: "PRD-005", name: "Cow curd",          desc: "Set curd — daily fresh",      icon: "soup_kitchen",     iconBg: "#e6e1e0", category: "CURD",   catCls: "inv-cat-curd",   subRate: "₹45 / 200g",    buyOnceRate: "₹55 / 200g",    stockQty: "8 kg",   stockPct: 12, stockStatus: "low_stock"    },
  { id: "PRD-006", name: "White butter",      desc: "Fresh Gir cow makhan",        icon: "kitchen",          iconBg: "#ffdcc4", category: "BUTTER", catCls: "inv-cat-butter", subRate: "₹180 / 200g",   buyOnceRate: "₹220 / 200g",   stockQty: "25 kg",  stockPct: 55, stockStatus: "in_stock"     },
  { id: "PRD-007", name: "Shrikhand",         desc: "Sweetened strained yoghurt",  icon: "icecream",         iconBg: "#ffdcbd", category: "CURD",   catCls: "inv-cat-curd",   subRate: "₹120 / 500g",   buyOnceRate: "₹150 / 500g",   stockQty: "30 kg",  stockPct: 60, stockStatus: "in_stock"     },
  { id: "PRD-008", name: "Bilona ghee",       desc: "Hand-churned bilona method",  icon: "local_fire_department", iconBg: "#ffca98", category: "GHEE", catCls: "inv-cat-ghee",   subRate: "₹950 / 500g",   buyOnceRate: "₹1,050 / 500g", stockQty: "12 kg",  stockPct: 22, stockStatus: "low_stock"    },
  { id: "PRD-009", name: "Lassi (sweet)",     desc: "Chilled churned lassi",       icon: "local_cafe",       iconBg: "#F5DFC8", category: "CURD",   catCls: "inv-cat-curd",   subRate: "₹35 / 200ml",   buyOnceRate: "₹42 / 200ml",   stockQty: "60 L",   stockPct: 75, stockStatus: "in_stock"     },
  { id: "PRD-010", name: "Cow colostrum",     desc: "First-milk superfood",        icon: "water_drop",       iconBg: "#F5DFC8", category: "MILK",   catCls: "inv-cat-milk",   subRate: "₹120 / 200ml",  buyOnceRate: "₹150 / 200ml",  stockQty: "10 L",   stockPct: 18, stockStatus: "low_stock"    },
  { id: "PRD-011", name: "Peda (milk sweet)", desc: "Traditional milk sweet",      icon: "cake",             iconBg: "#ffdcbd", category: "SWEET",  catCls: "inv-cat-sweet",  subRate: "₹60 / 100g",    buyOnceRate: "₹75 / 100g",    stockQty: "20 kg",  stockPct: 40, stockStatus: "in_stock"     },
  { id: "PRD-012", name: "Buttermilk (Chaas)", desc: "Spiced salted buttermilk",   icon: "local_cafe",       iconBg: "#e6e1e0", category: "CURD",   catCls: "inv-cat-curd",   subRate: "₹20 / 200ml",   buyOnceRate: "₹28 / 200ml",   stockQty: "80 L",   stockPct: 90, stockStatus: "in_stock"     },
];

const STOCK_LABELS = { in_stock: "In stock", low_stock: "Low stock", out_of_stock: "Out of stock" };

const FILTER_TABS = [
  { key: "all",          label: "All products"  },
  { key: "in_stock",     label: "In stock"      },
  { key: "low_stock",    label: "Low stock"     },
  { key: "out_of_stock", label: "Out of stock"  },
];

const PAGE_SIZE = 5;

function AdminProducts() {
  const navigate = useNavigate();
  const [filter,   setFilter]   = useState("all");
  const [showAll,  setShowAll]  = useState(false);

  const filtered = PRODUCTS.filter(p => filter === "all" || p.stockStatus === filter);
  const visible  = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  function changeFilter(key) { setFilter(key); setShowAll(false); }

  return (
    <div className="inv-page">

      {/* ── Page heading + Add button ── */}
      <div className="inv-topbar">
        <h2 className="inv-page-title">Products</h2>
        <button type="button" className="inv-add-btn" onClick={() => navigate("/admin/products/new")}>
          <span className="material-symbols-outlined">add</span>
          Add new product
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="inv-kpi-grid">
        <div className="inv-kpi-card inv-kpi-primary" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/stock")}>
          <div className="inv-kpi-top">
            <span className="inv-kpi-label">Total products</span>
            <span className="material-symbols-outlined inv-kpi-icon inv-icon-primary">inventory</span>
          </div>
          <p className="inv-kpi-big inv-big-primary">{PRODUCTS.length}</p>
          <p className="inv-kpi-sub">view stock inventory →</p>
        </div>
        <div className="inv-kpi-card inv-kpi-secondary" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/finance")}>
          <div className="inv-kpi-top">
            <span className="inv-kpi-label">Highest selling</span>
            <span className="material-symbols-outlined inv-kpi-icon inv-icon-secondary">trending_up</span>
          </div>
          <p className="inv-kpi-name inv-name-secondary">Cow milk</p>
          <p className="inv-kpi-sub">1,240 L sold — view finance →</p>
        </div>
        <div className="inv-kpi-card inv-kpi-warning" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/low-stock")}>
          <div className="inv-kpi-top">
            <span className="inv-kpi-label">Low stock alerts</span>
            <span className="material-symbols-outlined inv-kpi-icon inv-icon-warning">warning</span>
          </div>
          <p className="inv-kpi-big inv-big-warning">
            {PRODUCTS.filter(p => p.stockStatus === "low_stock").length}
          </p>
          <p className="inv-kpi-sub">products running low — view →</p>
        </div>
        <div className="inv-kpi-card inv-kpi-error" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/out-of-stock")}>
          <div className="inv-kpi-top">
            <span className="inv-kpi-label">Out of stock</span>
            <span className="material-symbols-outlined inv-kpi-icon inv-icon-error">block</span>
          </div>
          <p className="inv-kpi-big inv-big-error">
            {PRODUCTS.filter(p => p.stockStatus === "out_of_stock").length}
          </p>
          <p className="inv-kpi-sub">product unavailable — view →</p>
        </div>
      </div>

      {/* ── Filter pill tabs ── */}
      <div className="inv-filter-row">
        <span className="inv-filter-label">Category:</span>
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`inv-filter-pill${filter === t.key ? " inv-filter-pill-active" : ""}`}
            onClick={() => changeFilter(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="inv-table-card">
        <div className="inv-table-scroll">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product name</th>
                <th>Category</th>
                <th>Sub rate</th>
                <th>Buy once rate</th>
                <th>Stock</th>
                <th className="inv-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p.id} className="inv-row">
                  <td className="inv-td-id">{p.id}</td>
                  <td>
                    <div className="inv-product-cell">
                      <div className="inv-thumb-box" style={{ background: p.iconBg }}>
                        <span className="material-symbols-outlined inv-thumb-icon">{p.icon}</span>
                      </div>
                      <div>
                        <p className="inv-product-name">{p.name}</p>
                        <p className="inv-product-desc">{p.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`inv-cat-badge ${p.catCls}`}>{p.category}</span>
                  </td>
                  <td className="inv-td-rate">{p.subRate}</td>
                  <td className="inv-td-rate">{p.buyOnceRate}</td>
                  <td>
                    <div className="inv-stock-cell">
                      <div className="inv-stock-meta">
                        <span className={`inv-stock-qty inv-qty-${p.stockStatus}`}>{p.stockQty}</span>
                        <span className={`inv-stock-lbl inv-lbl-${p.stockStatus}`}>
                          {STOCK_LABELS[p.stockStatus]}
                        </span>
                      </div>
                      <div className="inv-stock-track">
                        <div
                          className={`inv-stock-fill inv-fill-${p.stockStatus}`}
                          style={{ width: `${p.stockPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="inv-td-actions">
                    <button type="button" className="inv-act-btn inv-act-edit" title="Edit" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button type="button" className="inv-act-btn inv-act-view" title="View" onClick={() => navigate(`/admin/products/${p.id}`)}>
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="inv-table-footer">
          <p className="inv-foot-info">Showing {visible.length} of {filtered.length} products</p>
          <div className="inv-foot-actions">
            <button type="button" className="inv-foot-btn" disabled>Previous</button>
            {!showAll && filtered.length > PAGE_SIZE && (
              <button type="button" className="inv-foot-btn-primary" onClick={() => setShowAll(true)}>
                Show all {filtered.length}
              </button>
            )}
            {showAll && (
              <button type="button" className="inv-foot-btn-primary" onClick={() => setShowAll(false)}>
                Show less
              </button>
            )}
            <button type="button" className="inv-foot-btn" disabled={!showAll || filtered.length <= PAGE_SIZE}>
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminProducts };
