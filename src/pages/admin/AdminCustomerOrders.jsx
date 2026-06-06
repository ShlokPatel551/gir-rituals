import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminCustomerOrders.css";

/* ── Customer name lookup ── */
const MOCK_NAMES = {
  GR00124: "Priya Shah",    GR00089: "Rahul Mehta",
  GR00201: "Anjali Kapoor", GR00057: "Meena Patel",
  GR00312: "Suresh Joshi",  GR00098: "Kavita Rao",
  GR00143: "Deepak Nair",   GR00178: "Sunita Verma",
  GR00234: "Arjun Desai",   GR00267: "Pooja Sharma",
};

/* ── Mock order rows ── */
const ALL_ORDERS = [
  { id: "ORD-0998", planType: "extra",        product: "Buffalo Milk",     icon: "water_drop",    qty: "2 L",   amount: "₹50",  method: "Immediate",  mode: "Online (GPay)",    orderDate: "28/05/2026", orderTime: "07:11 AM", deliveryDate: "28/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0985", planType: "individual",   product: "Organic Ghee",     icon: "liquor",        qty: "500g",  amount: "₹650", method: "Month Bill", mode: "COD (Driver)",     orderDate: "26/05/2026", orderTime: "11:45 AM", deliveryDate: "27/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0964", planType: "individual",   product: "Paneer",           icon: "bakery_dining", qty: "250g",  amount: "₹130", method: "Immediate",  mode: "Online (Paytm)",   orderDate: "24/05/2026", orderTime: "03:22 PM", deliveryDate: "25/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0950", planType: "extra",        product: "Cow Milk",         icon: "water_drop",    qty: "1 L",   amount: "₹35",  method: "Immediate",  mode: "Online (PhonePe)", orderDate: "22/05/2026", orderTime: "08:02 AM", deliveryDate: "22/05/2026", slot: "Morning", status: "cancelled" },
  { id: "ORD-0911", planType: "individual",   product: "Shrikhand",        icon: "icecream",      qty: "500g",  amount: "₹180", method: "Month Bill", mode: "COD (Driver)",     orderDate: "19/05/2026", orderTime: "05:14 PM", deliveryDate: "20/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0892", planType: "extra",        product: "Cow Butter",       icon: "kitchen",       qty: "200g",  amount: "₹150", method: "Immediate",  mode: "Online (GPay)",    orderDate: "15/05/2026", orderTime: "09:30 AM", deliveryDate: "15/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0871", planType: "subscription", product: "A2 Desi Cow Milk", icon: "water_drop",    qty: "2 L",   amount: "₹140", method: "Month Bill", mode: "COD (Driver)",     orderDate: "10/05/2026", orderTime: "06:30 AM", deliveryDate: "10/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0842", planType: "subscription", product: "A2 Desi Cow Milk", icon: "water_drop",    qty: "2 L",   amount: "₹140", method: "Month Bill", mode: "COD (Driver)",     orderDate: "05/05/2026", orderTime: "06:30 AM", deliveryDate: "05/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0820", planType: "extra",        product: "Bilona Ghee",      icon: "liquor",        qty: "250g",  amount: "₹325", method: "Immediate",  mode: "Online (GPay)",    orderDate: "01/05/2026", orderTime: "10:00 AM", deliveryDate: "02/05/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0798", planType: "subscription", product: "A2 Desi Cow Milk", icon: "water_drop",    qty: "2 L",   amount: "₹140", method: "Month Bill", mode: "COD (Driver)",     orderDate: "28/04/2026", orderTime: "06:30 AM", deliveryDate: "28/04/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0771", planType: "individual",   product: "Paneer",           icon: "bakery_dining", qty: "500g",  amount: "₹260", method: "Immediate",  mode: "Online (Paytm)",   orderDate: "20/04/2026", orderTime: "02:15 PM", deliveryDate: "21/04/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0755", planType: "subscription", product: "A2 Desi Cow Milk", icon: "water_drop",    qty: "2 L",   amount: "₹140", method: "Month Bill", mode: "COD (Driver)",     orderDate: "15/04/2026", orderTime: "06:30 AM", deliveryDate: "15/04/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0730", planType: "extra",        product: "Cow Milk",         icon: "water_drop",    qty: "2 L",   amount: "₹70",  method: "Immediate",  mode: "Online (GPay)",    orderDate: "10/04/2026", orderTime: "07:45 AM", deliveryDate: "10/04/2026", slot: "Morning", status: "delivered" },
  { id: "ORD-0701", planType: "individual",   product: "Organic Ghee",     icon: "liquor",        qty: "250g",  amount: "₹325", method: "Month Bill", mode: "COD (Driver)",     orderDate: "05/04/2026", orderTime: "11:00 AM", deliveryDate: "06/04/2026", slot: "Morning", status: "delivered" },
];

/* ── Config maps ── */
const PLAN_CFG = {
  extra:        { label: "Extra",        cls: "co-plan-extra"        },
  individual:   { label: "Individual",   cls: "co-plan-individual"   },
  subscription: { label: "Subscription", cls: "co-plan-subscription" },
};

const STATUS_CFG = {
  delivered: { label: "Delivered", cls: "co-status-delivered" },
  cancelled: { label: "Cancelled", cls: "co-status-cancelled" },
  pending:   { label: "Pending",   cls: "co-status-pending"   },
};

const TYPE_TABS = [
  { key: "all",          label: "All Orders"    },
  { key: "subscription", label: "Subscription"  },
  { key: "extra",        label: "Extra"         },
  { key: "individual",   label: "Individual"    },
];

const PAGE_SIZE = 6;

/* ── KPI constants (would come from API in prod) ── */
const KPI = { total: 28, subscription: 8, extra: 6, individual: 2, mostOrdered: "A2 Desi Cow Milk", mostCount: 18 };

/* ══ Component ══ */
function AdminCustomerOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewMode,    setViewMode]    = useState("today");
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [page,        setPage]        = useState(1);

  const name = MOCK_NAMES[id] || id || "Customer";

  const filtered = useMemo(() => {
    if (typeFilter === "all") return ALL_ORDERS;
    return ALL_ORDERS.filter(o => o.planType === typeFilter);
  }, [typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeType(key) { setTypeFilter(key); setPage(1); }

  return (
    <div className="co-page">

      {/* ── Breadcrumb + view toggle ── */}
      <div className="co-topbar">
        <nav className="co-breadcrumb">
          <Link to="/admin/customers" className="co-crumb-link">Customers</Link>
          <span className="material-symbols-outlined co-crumb-sep">chevron_right</span>
          <Link to={`/admin/customers/${id}`} className="co-crumb-link">{name}</Link>
          <span className="material-symbols-outlined co-crumb-sep">chevron_right</span>
          <span className="co-crumb-current">Order History</span>
        </nav>
        <div className="co-view-toggle">
          <button
            type="button"
            className={`co-toggle-btn${viewMode === "today" ? " co-toggle-active" : ""}`}
            onClick={() => setViewMode("today")}
          >Today</button>
          <button
            type="button"
            className={`co-toggle-btn${viewMode === "month" ? " co-toggle-active" : ""}`}
            onClick={() => setViewMode("month")}
          >This Month</button>
          <button type="button" className="co-toggle-icon">
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div className="co-kpi-grid">
        <div className="co-kpi-card">
          <p className="co-kpi-label">Total Orders</p>
          <h3 className="co-kpi-val co-kpi-primary">{KPI.total}</h3>
        </div>
        <div className="co-kpi-card">
          <p className="co-kpi-label">Subscription</p>
          <h3 className="co-kpi-val co-kpi-secondary">{KPI.subscription}</h3>
        </div>
        <div className="co-kpi-card">
          <p className="co-kpi-label">Extra</p>
          <h3 className="co-kpi-val co-kpi-tertiary">{KPI.extra}</h3>
        </div>
        <div className="co-kpi-card">
          <p className="co-kpi-label">Individual</p>
          <h3 className="co-kpi-val co-kpi-brown">{KPI.individual}</h3>
        </div>
        <div className="co-kpi-card co-kpi-dark">
          <div className="co-kpi-dark-body">
            <p className="co-kpi-label co-kpi-label-light">Mostly Ordered</p>
            <h3 className="co-kpi-dark-name">{KPI.mostOrdered}</h3>
            <p className="co-kpi-dark-sub">{KPI.mostCount} times</p>
          </div>
          <span className="material-symbols-outlined co-kpi-dark-icon">water_drop</span>
        </div>
      </div>

      {/* ── Type filter tabs ── */}
      <div className="co-type-tabs">
        {TYPE_TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`co-type-tab${typeFilter === t.key ? " co-type-tab-active" : ""}`}
            onClick={() => changeType(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="co-table-card">
        {/* Table header */}
        <div className="co-table-hdr">
          <h4 className="co-table-title">
            Orders History — {name}&nbsp;({id})
            <span className="co-table-subtitle">VIEW-ONLY ARCHIVED HISTORY</span>
          </h4>
        </div>

        {/* Table */}
        <div className="co-table-scroll">
          <table className="co-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Plan Type</th>
                <th>Product Details</th>
                <th className="co-th-center">Qty</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Mode</th>
                <th>Order Date/Time</th>
                <th className="co-th-center">Delivery Date</th>
                <th className="co-th-center">Status</th>
                <th className="co-th-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(order => {
                const plan   = PLAN_CFG[order.planType]   || PLAN_CFG.extra;
                const status = STATUS_CFG[order.status]   || STATUS_CFG.pending;
                return (
                  <tr key={order.id} className="co-row">
                    <td className="co-td-id">{order.id}</td>
                    <td>
                      <span className={`co-plan-badge ${plan.cls}`}>{plan.label}</span>
                    </td>
                    <td>
                      <div className="co-product-cell">
                        <div className="co-product-icon-box">
                          <span className="material-symbols-outlined co-product-icon">{order.icon}</span>
                        </div>
                        {order.product}
                      </div>
                    </td>
                    <td className="co-td-center">{order.qty}</td>
                    <td className="co-td-amount">{order.amount}</td>
                    <td className="co-td-method">{order.method}</td>
                    <td className="co-td-mode">{order.mode}</td>
                    <td>
                      <div className="co-order-date">{order.orderDate}</div>
                      <div className="co-order-time">{order.orderTime}</div>
                    </td>
                    <td className="co-td-center">
                      <div className="co-del-date">{order.deliveryDate}</div>
                      <div className="co-del-slot">({order.slot})</div>
                    </td>
                    <td className="co-td-center">
                      <span className={`co-status-badge ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="co-td-center">
                      <button type="button" className="co-details-btn" onClick={() => navigate(`/admin/orders/${o.id}`)}>Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="co-pagination">
          <p className="co-page-info">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} historical records
          </p>
          <div className="co-page-controls">
            <button className="co-page-arrow" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                className={`co-page-num${page === n ? " co-page-num-active" : ""}`}
                onClick={() => setPage(n)}
              >{n}</button>
            ))}
            <button className="co-page-arrow" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminCustomerOrders };
