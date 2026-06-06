import { useMemo, useState } from "react";
import "./AdminStockInventory.css";

const INVENTORY = [
  /* ── In stock ── */
  { id: "PRD-001", name: "Cow Milk A2",      category: "Daily Fresh",      icon: "water_drop",            iconBg: "#c1ecd4", subRate: "₹85",    buyOnce: "₹92",    units: 840,  unitsPct: 84, restockedDate: "Oct 12, 2023", restockedTime: "04:30 AM", stockStatus: "in_stock"     },
  { id: "PRD-003", name: "Cow Ghee A2",      category: "Premium Ghee",     icon: "local_fire_department", iconBg: "#ffca98", subRate: "₹650",   buyOnce: "₹680",   units: 215,  unitsPct: 92, restockedDate: "Oct 14, 2023", restockedTime: "11:15 AM", stockStatus: "in_stock"     },
  { id: "PRD-006", name: "Cheese Block",     category: "Artisanal Cheese", icon: "bakery_dining",         iconBg: "#ffdcbd", subRate: "₹340",   buyOnce: "₹365",   units: 158,  unitsPct: 76, restockedDate: "Oct 10, 2023", restockedTime: "09:00 AM", stockStatus: "in_stock"     },
  { id: "PRD-007", name: "Table Butter",     category: "Fresh Dairy",      icon: "kitchen",               iconBg: "#ffdcc4", subRate: "₹120",   buyOnce: "₹135",   units: 410,  unitsPct: 88, restockedDate: "Oct 13, 2023", restockedTime: "02:45 PM", stockStatus: "in_stock"     },
  { id: "PRD-010", name: "Buttermilk",       category: "Daily Fresh",      icon: "local_cafe",            iconBg: "#c1ecd4", subRate: "₹45",    buyOnce: "₹50",    units: 1200, unitsPct: 95, restockedDate: "Oct 15, 2023", restockedTime: "06:00 AM", stockStatus: "in_stock"     },
  { id: "PRD-012", name: "Sweet Curd",       category: "Fresh Dairy",      icon: "soup_kitchen",          iconBg: "#e6e1e0", subRate: "₹60",    buyOnce: "₹65",    units: 650,  unitsPct: 81, restockedDate: "Oct 14, 2023", restockedTime: "08:20 PM", stockStatus: "in_stock"     },
  { id: "PRD-009", name: "Lassi (sweet)",    category: "Daily Fresh",      icon: "local_cafe",            iconBg: "#c1ecd4", subRate: "₹35",    buyOnce: "₹42",    units: 480,  unitsPct: 75, restockedDate: "Oct 13, 2023", restockedTime: "07:00 AM", stockStatus: "in_stock"     },
  { id: "PRD-011", name: "Peda",             category: "Milk Sweet",       icon: "cake",                  iconBg: "#ffdcbd", subRate: "₹60",    buyOnce: "₹75",    units: 200,  unitsPct: 40, restockedDate: "Oct 11, 2023", restockedTime: "03:00 PM", stockStatus: "in_stock"     },
  /* ── Low stock ── */
  { id: "PRD-002", name: "Buffalo Milk",     category: "Daily Fresh",      icon: "water_drop",            iconBg: "#e6e1e0", subRate: "₹52",    buyOnce: "₹58",    units: 18,   unitsPct: 20, restockedDate: "Oct 08, 2023", restockedTime: "05:00 AM", stockStatus: "low_stock"    },
  { id: "PRD-005", name: "Cow Curd",         category: "Daily Fresh",      icon: "soup_kitchen",          iconBg: "#e6e1e0", subRate: "₹45",    buyOnce: "₹55",    units: 8,    unitsPct: 12, restockedDate: "Oct 09, 2023", restockedTime: "07:30 AM", stockStatus: "low_stock"    },
  { id: "PRD-008", name: "Bilona Ghee",      category: "Premium Ghee",     icon: "local_fire_department", iconBg: "#ffca98", subRate: "₹950",   buyOnce: "₹1,050", units: 12,   unitsPct: 22, restockedDate: "Oct 05, 2023", restockedTime: "10:00 AM", stockStatus: "low_stock"    },
  /* ── Out of stock ── */
  { id: "PRD-004", name: "Paneer (fresh)",   category: "Fresh Paneer",     icon: "bakery_dining",         iconBg: "#ffdcbd", subRate: "₹90",    buyOnce: "₹110",   units: 0,    unitsPct: 0,  restockedDate: "Sep 28, 2023", restockedTime: "09:00 AM", stockStatus: "out_of_stock" },
];

const FILTER_TABS = [
  { key: "all",          label: "All products"  },
  { key: "low_stock",    label: "Low stock"     },
  { key: "out_of_stock", label: "Out of stock"  },
  { key: "in_stock",     label: "In stock"      },
];

const PCT_CLS  = { in_stock: "si-pct-primary",  low_stock: "si-pct-secondary",  out_of_stock: "si-pct-error"  };
const FILL_CLS = { in_stock: "si-fill-primary", low_stock: "si-fill-secondary", out_of_stock: "si-fill-error" };

const LOW_COUNT = INVENTORY.filter(p => p.stockStatus === "low_stock").length;
const PAGE_SIZE = 6;

function AdminStockInventory() {
  const [filter, setFilter] = useState("in_stock");
  const [page,   setPage]   = useState(1);

  const filtered   = useMemo(() => filter === "all" ? INVENTORY : INVENTORY.filter(p => p.stockStatus === filter), [filter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeFilter(key) { setFilter(key); setPage(1); }

  return (
    <div className="si-page">

      {/* ── Page title ── */}
      <h2 className="si-page-title">IN STOCK</h2>

      {/* ── Filter tabs ── */}
      <div className="si-filter-tabs">
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`si-filter-tab${filter === t.key ? " si-filter-tab-active" : ""}`}
            onClick={() => changeFilter(t.key)}
          >
            {t.label}
            {t.key === "low_stock" && <span className="si-tab-badge">{LOW_COUNT}</span>}
          </button>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="si-table-card">
        <div className="si-table-scroll">
          <table className="si-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Sub Rate</th>
                <th>Buy Once</th>
                <th>Stock Status Level</th>
                <th>Last Restocked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} className="si-row">
                  <td className="si-td-id">{p.id}</td>
                  <td>
                    <div className="si-product-cell">
                      <div className="si-thumb-box" style={{ background: p.iconBg }}>
                        <span className="material-symbols-outlined si-thumb-icon">{p.icon}</span>
                      </div>
                      <span className="si-product-name">{p.name}</span>
                    </div>
                  </td>
                  <td className="si-category">{p.category}</td>
                  <td className="si-rate-primary">{p.subRate}</td>
                  <td className="si-rate-muted">{p.buyOnce}</td>
                  <td>
                    <div className="si-stock-cell">
                      <div className="si-stock-meta">
                        <span className="si-stock-units">{p.units.toLocaleString()} units</span>
                        <span className={`si-stock-pct ${PCT_CLS[p.stockStatus]}`}>{p.unitsPct}%</span>
                      </div>
                      <div className="si-stock-track">
                        <div
                          className={`si-stock-fill ${FILL_CLS[p.stockStatus]}`}
                          style={{ width: `${p.unitsPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="si-restock-date">{p.restockedDate}</div>
                    <div className="si-restock-time">{p.restockedTime}</div>
                  </td>
                  <td>
                    <div className="si-act-row">
                      <button type="button" className="si-act-btn si-act-edit" title="Edit">
                        <span className="material-symbols-outlined">edit_note</span>
                      </button>
                      <button type="button" className="si-act-btn si-act-view" title="View">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="si-pagination">
          <span className="si-page-info">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="si-page-controls">
            <button className="si-page-arrow" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                className={`si-page-num${page === n ? " si-page-num-active" : ""}`}
                onClick={() => setPage(n)}
              >{n}</button>
            ))}
            <button className="si-page-arrow" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminStockInventory };
