import { useState } from "react";
import { Link } from "react-router-dom";
import "./AdminOrders.css";
const ORDERS = [
  { id: "#ORD-92831", customer: "Aditi Sharma", initials: "AS", email: "aditi.s@gmail.com", avatarBg: "#ffdcbd", avatarColor: "#2c1600", product: "A2 Gir Milk 2L, Vedic Ghee 500g", amount: "\u20B91,450", date: "May 24, 2026", status: "delivered" },
  { id: "#ORD-92842", customer: "Rajesh Jain", initials: "RJ", email: "rajesh@outlook.com", avatarBg: "#ffdcc4", avatarColor: "#2f1400", product: "Raw Honey 250g", amount: "\u20B9650", date: "May 25, 2026", status: "processing" },
  { id: "#ORD-92855", customer: "Meera Patel", initials: "MP", email: "meera.p@icloud.com", avatarBg: "#ffca98", avatarColor: "#7a532a", product: "Desi Cow Paneer 500g (\xD72)", amount: "\u20B9840", date: "May 25, 2026", status: "shipped" },
  { id: "#ORD-92860", customer: "Vikram Mehta", initials: "VM", email: "vik@mehta.co", avatarBg: "#ffdad6", avatarColor: "#93000a", product: "Gir Milk 1L, A2 Buttermilk 500ml", amount: "\u20B9320", date: "May 26, 2026", status: "cancelled" },
  { id: "#ORD-92872", customer: "Sanjay Kapoor", initials: "SK", email: "s.kapoor@hot.com", avatarBg: "#a5d0b9", avatarColor: "#274e3d", product: "Organic Curd 1kg (\xD73)", amount: "\u20B9540", date: "May 26, 2026", status: "processing" },
  { id: "#ORD-92884", customer: "Priya Shah", initials: "PS", email: "priya.s@email.com", avatarBg: "#c1ecd4", avatarColor: "#012d1d", product: "Bilona Ghee 500g", amount: "\u20B9600", date: "May 27, 2026", status: "delivered" },
  { id: "#ORD-92891", customer: "Rahul Mehta", initials: "RM", email: "rahul_45@provider.in", avatarBg: "#ffdcbd", avatarColor: "#2c1600", product: "Gir Milk 2L (subscription)", amount: "\u20B9140", date: "May 27, 2026", status: "shipped" },
  { id: "#ORD-92902", customer: "Anjali Kapoor", initials: "AK", email: "anjali.k@gmail.com", avatarBg: "#ffdcc4", avatarColor: "#2f1400", product: "A2 Ghee 1kg", amount: "\u20B91,200", date: "May 27, 2026", status: "pending" }
];
const STATUS_LABEL = {
  delivered: "Delivered",
  processing: "Processing",
  shipped: "Shipped",
  cancelled: "Cancelled",
  pending: "Pending"
};
const BADGE_CLASS = {
  delivered: "ord-badge-delivered",
  processing: "ord-badge-processing",
  shipped: "ord-badge-shipped",
  cancelled: "ord-badge-cancelled",
  pending: "ord-badge-pending"
};
const TAB_STATUSES = {
  all: ["delivered", "processing", "shipped", "cancelled", "pending"],
  pending: ["pending", "processing"],
  active: ["shipped"]
};
function AdminOrders() {
  const [tab, setTab] = useState("all");
  const visible = ORDERS.filter((o) => TAB_STATUSES[tab].includes(o.status));
  const counts = {
    all: ORDERS.length,
    delivered: ORDERS.filter((o) => o.status === "delivered").length,
    pending: ORDERS.filter((o) => ["pending", "processing"].includes(o.status)).length,
    shipped: ORDERS.filter((o) => o.status === "shipped").length,
    cancelled: ORDERS.filter((o) => o.status === "cancelled").length
  };
  return <div className="ord-page">

      {
    /* ── Page header ── */
  }
      <div className="ord-page-header">
        <div>
          <h2 className="ord-page-title">Orders Management</h2>
          <p className="ord-page-sub">Review and fulfil fresh dairy deliveries</p>
        </div>
        <div className="ord-header-actions">
          <button type="button" className="ord-btn-outline">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>file_download</span>
            Export CSV
          </button>
          <button type="button" className="ord-btn-filled">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Create New Order
          </button>
        </div>
      </div>

      {
    /* ── Bento metrics ── */
  }
      <div className="ord-metrics-grid">

        <div className="bento-card ord-metric-card">
          <div className="ord-metric-top">
            <span className="material-symbols-outlined ord-metric-icon" style={{ background: "rgba(1,45,29,0.08)", color: "var(--admin-primary)" }}>shopping_bag</span>
            <span className="ord-metric-pill ord-pill-green">+12%</span>
          </div>
          <p className="ord-metric-label">Total Orders</p>
          <p className="ord-metric-value">1,284</p>
          <div className="ord-metric-accent" style={{ background: "rgba(1,45,29,0.1)" }} />
        </div>

        <div className="bento-card ord-metric-card">
          <div className="ord-metric-top">
            <span className="material-symbols-outlined ord-metric-icon" style={{ background: "#ffdcc4", color: "#5f2f00" }}>pending_actions</span>
            <span className="ord-metric-pill ord-pill-error">High</span>
          </div>
          <p className="ord-metric-label">Pending</p>
          <p className="ord-metric-value">{counts.pending}</p>
          <div className="ord-metric-accent" style={{ background: "rgba(95,47,0,0.12)" }} />
        </div>

        <div className="bento-card ord-metric-card">
          <div className="ord-metric-top">
            <span className="material-symbols-outlined ord-metric-icon" style={{ background: "#ffdcbd", color: "#7d562d" }}>local_shipping</span>
            <span className="ord-metric-pill ord-pill-muted">Live</span>
          </div>
          <p className="ord-metric-label">Out for Delivery</p>
          <p className="ord-metric-value">{counts.shipped + 15}</p>
          <div className="ord-metric-accent" style={{ background: "rgba(125,86,45,0.1)" }} />
        </div>

        <div className="bento-card ord-metric-card">
          <div className="ord-metric-top">
            <span className="material-symbols-outlined ord-metric-icon" style={{ background: "#a5d0b9", color: "#274e3d" }}>task_alt</span>
            <span className="ord-metric-pill ord-pill-muted">Today</span>
          </div>
          <p className="ord-metric-label">Completed</p>
          <p className="ord-metric-value">{counts.delivered + 84}</p>
          <div className="ord-metric-accent" style={{ background: "rgba(165,208,185,0.3)" }} />
        </div>

      </div>

      {
    /* ── Orders table ── */
  }
      <div className="bento-card ord-table-card">

        {
    /* Controls row */
  }
        <div className="ord-controls-row">
          <div className="ord-controls-left">
            <div className="ord-tab-group">
              {["all", "pending", "active"].map((t) => <button
    key={t}
    type="button"
    className={`ord-tab-btn ${tab === t ? "ord-tab-active" : ""}`}
    onClick={() => setTab(t)}
  >
                  {t === "all" ? "All Orders" : t === "pending" ? "Pending" : "Active"}
                </button>)}
            </div>
            <button type="button" className="ord-filter-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
              Filters
            </button>
          </div>
          <p className="ord-results-info">Showing 1–{visible.length} of {ORDERS.length} results</p>
        </div>

        {
    /* Table */
  }
        <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="admin-table ord-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product Details</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => <tr key={row.id} className="ord-row">
                  <td className="ord-order-id">{row.id}</td>
                  <td>
                    <div className="adm-customer-cell">
                      <div
    className="adm-avatar"
    style={{ background: row.avatarBg, color: row.avatarColor }}
  >
                        {row.initials}
                      </div>
                      <div>
                        <p className="adm-customer-name">{row.customer}</p>
                        <p className="ord-email">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="adm-cell-muted ord-product">{row.product}</td>
                  <td className="ord-amount">{row.amount}</td>
                  <td className="adm-cell-muted">{row.date}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`ord-badge ${BADGE_CLASS[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="ord-row-actions">
                      <button type="button" className="ord-action-btn ord-action-view" title="View Details">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>visibility</span>
                      </button>
                      <button type="button" className="ord-action-btn ord-action-edit" title="Update Status">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit_square</span>
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
        <div className="ord-pagination">
          <button type="button" className="ord-page-nav" disabled>Previous</button>
          <div className="ord-page-nums">
            {[1, 2, 3].map((n) => <button key={n} type="button" className={`ord-page-num ${n === 1 ? "ord-page-active" : ""}`}>{n}</button>)}
            <span className="ord-page-ellipsis">…</span>
            <button type="button" className="ord-page-num">128</button>
          </div>
          <button type="button" className="ord-page-nav">Next</button>
        </div>

      </div>

      {
    /* ── Quick action cards ── */
  }
      <div className="ord-quick-grid">
        <div className="bento-card ord-quick-card">
          <div className="ord-quick-icon-wrap ord-quick-icon-green">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <div className="ord-quick-text">
            <h4 className="ord-quick-title">Assign Couriers</h4>
            <p className="ord-quick-sub">{counts.pending} pending orders need delivery partners assigned.</p>
          </div>
          <Link to="/admin/deliveries" className="ord-quick-link">Start Auto-Assign</Link>
        </div>

        <div className="bento-card ord-quick-card">
          <div className="ord-quick-icon-wrap ord-quick-icon-tan">
            <span className="material-symbols-outlined">inventory</span>
          </div>
          <div className="ord-quick-text">
            <h4 className="ord-quick-title">Inventory Alert</h4>
            <p className="ord-quick-sub">Gir Milk 2L stock is low (8 bottles remaining).</p>
          </div>
          <Link to="/admin/products" className="ord-quick-link ord-quick-link-tan">Restock Now</Link>
        </div>
      </div>

    </div>;
}
export {
  AdminOrders
};
