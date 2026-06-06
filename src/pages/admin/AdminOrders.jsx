import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";

const TABS = [
  { id: "all",              label: "All orders"       },
  { id: "pending",          label: "Pending"          },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered",        label: "Delivered"        },
  { id: "paused",           label: "Paused"           },
  { id: "cancelled",        label: "Cancelled"        },
];

/* Per-status tab active pill colours */
const TAB_COLORS = {
  all:              { bg: "rgba(27,67,50,0.07)", text: "#5A3B22", border: "rgba(27,67,50,0.25)" },
  pending:          { bg: "#fffbeb",             text: "#d97706", border: "#fcd34d"              },
  out_for_delivery: { bg: "#eff6ff",             text: "#2563eb", border: "#93c5fd"              },
  delivered:        { bg: "#F9F3E9",             text: "#5A3B22", border: "#F5DFC8"              },
  paused:           { bg: "#f9fafb",             text: "#4b5563", border: "#e5e7eb"              },
  cancelled:        { bg: "#fef2f2",             text: "#b91c1c", border: "#fca5a5"              },
};

const ORDER_TYPE_META = {
  subscription: { label: "Subscription", rowBorderCls: "om-row-border-sub", pillCls: "om-pill-sub" },
  individual:   { label: "Individual",   rowBorderCls: "om-row-border-ind", pillCls: "om-pill-ind" },
  extra:        { label: "Extra order",  rowBorderCls: "om-row-border-ext", pillCls: "om-pill-ext" },
};

const PAYMENT_META = {
  monthly_bill:   { label: "Monthly bill",   cls: "om-pay-monthly"   },
  unpaid:         { label: "Unpaid",         cls: "om-pay-unpaid"    },
  add_to_bill:    { label: "Add to bill",    cls: "om-pay-add-bill"  },
  paid_upi:       { label: "Paid — UPI",     cls: "om-pay-paid-upi"  },
  refunded:       { label: "Refunded",       cls: "om-pay-refunded"  },
  pending_refund: { label: "Pending refund", cls: "om-pay-pend-ref"  },
};

const STATUS_META = {
  pending:          { label: "Pending",          cls: "om-status-pending"   },
  out_for_delivery: { label: "Out for delivery", cls: "om-status-delivery"  },
  delivered:        { label: "Delivered",        cls: "om-status-delivered" },
  paused:           { label: "Paused",           cls: "om-status-paused"    },
  cancelled:        { label: "Cancelled",        cls: "om-status-cancelled" },
};

/* Fixed value colours per KPI, separate active-label/border for the highlighted state */
const KPI = [
  { label: "Total Orders",     value: "1,284", noteText: "+ 12% this month",  noteColor: "#8B6B4A", valueColor: "#5A3B22", statusKey: null,              activeLabelColor: "#5A3B22", activeBorderColor: "#5A3B22" },
  { label: "Pending",          value: "42",    noteText: "need action today", noteColor: "#9ca3af", valueColor: "#d97706", statusKey: "pending",         activeLabelColor: "#d97706", activeBorderColor: "#d97706" },
  { label: "Out for delivery", value: "18",    noteText: "live right now",    noteColor: "#9ca3af", valueColor: "#2563eb", statusKey: "out_for_delivery", activeLabelColor: "#2563eb", activeBorderColor: "#2563eb" },
  { label: "Delivered",        value: "86",    noteText: "completed today",   noteColor: "#9ca3af", valueColor: "#5A3B22", statusKey: "delivered",        activeLabelColor: "#5A3B22", activeBorderColor: "#8B6B4A" },
  { label: "Paused",           value: "12",    noteText: "customer paused",   noteColor: "#9ca3af", valueColor: "#374151", statusKey: "paused",           activeLabelColor: "#4b5563", activeBorderColor: "#9ca3af" },
  { label: "Cancelled",        value: "5",     noteText: "today",             noteColor: "#9ca3af", valueColor: "#b91c1c", statusKey: "cancelled",        activeLabelColor: "#dc2626", activeBorderColor: "#ef4444" },
];

const ORDERS = [
  /* ── pending ── */
  { id: "#ORD-92855", initials: "MP", avatarBg: "#F5DFC8", avatarFg: "#2C1500", customer: "Meera Patel",    clientId: "CLT-0023", orderType: "subscription", product: "Buffalo Milk",             qty: "1 L",        frequency: "Alternate days",  orderDate: "12 May 2026", deliveryDate: "5 June 2026", amount: "₹1,100", amountNote: "/month",       payment: "monthly_bill",  status: "pending"          },
  { id: "#ORD-92872", initials: "SK", avatarBg: "#ffdcbd", avatarFg: "#7a532a", customer: "Sanjay Kapoor", clientId: "CLT-0209", orderType: "individual",   product: "Organic Curd",             qty: "1 kg × 3",   frequency: "One time",        orderDate: "5 June 2026", deliveryDate: "6 June 2026", amount: "₹540",   amountNote: "unpaid",       payment: "unpaid",        status: "pending"          },
  { id: "#ORD-92901", initials: "AR", avatarBg: "#ffdcc4", avatarFg: "#2f1400", customer: "Anita Rao",     clientId: "CLT-0512", orderType: "subscription", product: "A2 Gir Cow Milk",          qty: "1 L",        frequency: "Daily",           orderDate: "2 June 2026", deliveryDate: "5 June 2026", amount: "₹2,040", amountNote: "/month",       payment: "monthly_bill",  status: "pending"          },
  { id: "#ORD-92910", initials: "DK", avatarBg: "#D9C5B2", avatarFg: "#2C1500", customer: "Dev Kapadia",   clientId: "CLT-0621", orderType: "extra",        product: "Fresh Paneer",             qty: "500 g",      frequency: "One time add-on", orderDate: "5 June 2026", deliveryDate: "5 June 2026", amount: "₹420",   amountNote: "add to bill",  payment: "add_to_bill",   status: "pending"          },
  { id: "#ORD-92918", initials: "SM", avatarBg: "#ffca98", avatarFg: "#7a532a", customer: "Sunita Modi",   clientId: "CLT-0788", orderType: "subscription", product: "Cow Ghee A2",              qty: "250 g",      frequency: "Weekly",          orderDate: "10 Mar 2026", deliveryDate: "5 June 2026", amount: "₹1,300", amountNote: "/month",       payment: "monthly_bill",  status: "pending"          },
  /* ── out for delivery ── */
  { id: "#ORD-92880", initials: "PD", avatarBg: "#F5DFC8", avatarFg: "#2C1500", customer: "Priya Desai",   clientId: "CLT-0318", orderType: "subscription", product: "A2 Cow Ghee",              qty: "500 g",      frequency: "Weekly",          orderDate: "15 Apr 2026", deliveryDate: "5 June 2026", amount: "₹2,600", amountNote: "/month",       payment: "monthly_bill",  status: "out_for_delivery" },
  { id: "#ORD-92915", initials: "DK", avatarBg: "#D9C5B2", avatarFg: "#2C1500", customer: "Dev Kapadia",   clientId: "CLT-0621", orderType: "subscription", product: "A2 Gir Cow Milk",          qty: "3 L",        frequency: "Daily",           orderDate: "1 Feb 2026",  deliveryDate: "5 June 2026", amount: "₹6,120", amountNote: "/month",       payment: "monthly_bill",  status: "out_for_delivery" },
  { id: "#ORD-92930", initials: "RV", avatarBg: "#ffdcc4", avatarFg: "#2f1400", customer: "Ravi Varma",    clientId: "CLT-0891", orderType: "individual",   product: "Organic Curd",             qty: "1 kg × 2",   frequency: "One time",        orderDate: "4 June 2026", deliveryDate: "5 June 2026", amount: "₹720",   amountNote: "paid",         payment: "paid_upi",      status: "out_for_delivery" },
  { id: "#ORD-92938", initials: "PM", avatarBg: "#ffdcbd", avatarFg: "#7a532a", customer: "Pooja Mehta",   clientId: "CLT-0944", orderType: "extra",        product: "Fresh Paneer",             qty: "500 g",      frequency: "One time add-on", orderDate: "5 June 2026", deliveryDate: "5 June 2026", amount: "₹420",   amountNote: "add to bill",  payment: "add_to_bill",   status: "out_for_delivery" },
  /* ── delivered ── */
  { id: "#ORD-92831", initials: "AS", avatarBg: "#ffdcc4", avatarFg: "#2f1400", customer: "Aditi Sharma",  clientId: "CLT-0010", orderType: "subscription", product: "A2 Gir Milk 2L",           qty: "2 L",        frequency: "Daily",           orderDate: "24 May 2026", deliveryDate: "5 June 2026", amount: "₹1,450", amountNote: "/month",       payment: "monthly_bill",  status: "delivered"        },
  { id: "#ORD-92840", initials: "RJ", avatarBg: "#F5DFC8", avatarFg: "#2C1500", customer: "Rajesh Jain",   clientId: "CLT-0045", orderType: "individual",   product: "Raw Honey 250g",           qty: "1 unit",     frequency: "One time",        orderDate: "25 May 2026", deliveryDate: "4 June 2026", amount: "₹650",   amountNote: "paid",         payment: "paid_upi",      status: "delivered"        },
  /* ── paused ── */
  { id: "#ORD-92860", initials: "VM", avatarBg: "#ffdcbd", avatarFg: "#7a532a", customer: "Vikram Mehta",  clientId: "CLT-0156", orderType: "subscription", product: "A2 Gir Milk + Buttermilk", qty: "1L + 500ml", frequency: "Daily",           orderDate: "3 Jan 2026",  deliveryDate: "—",           amount: "₹2,480", amountNote: "/month",       payment: "monthly_bill",  status: "paused"           },
  { id: "#ORD-92944", initials: "SM", avatarBg: "#bfdbfe", avatarFg: "#1e40af", customer: "Sunita Modi",   clientId: "CLT-0788", orderType: "subscription", product: "Fresh Paneer",             qty: "500 g",      frequency: "Weekly",          orderDate: "5 Mar 2026",  deliveryDate: "—",           amount: "₹1,200", amountNote: "/month",       payment: "monthly_bill",  status: "paused"           },
  { id: "#ORD-92967", initials: "KS", avatarBg: "#bbf7d0", avatarFg: "#7B5233", customer: "Kiran Shah",    clientId: "CLT-0901", orderType: "subscription", product: "A2 Gir Cow Milk",          qty: "1.5 L",      frequency: "Daily",           orderDate: "12 Jan 2025", deliveryDate: "—",           amount: "₹3,060", amountNote: "/month",       payment: "monthly_bill",  status: "paused"           },
  { id: "#ORD-92981", initials: "MR", avatarBg: "#fecaca", avatarFg: "#dc2626", customer: "Mohan Reddy",   clientId: "CLT-1105", orderType: "subscription", product: "Buffalo Milk",             qty: "2 L",        frequency: "Alternate days",  orderDate: "8 Apr 2026",  deliveryDate: "—",           amount: "₹1,600", amountNote: "/month",       payment: "monthly_bill",  status: "paused"           },
  /* ── cancelled ── */
  { id: "#ORD-92891", initials: "NK", avatarBg: "#fef3c7", avatarFg: "#d97706", customer: "Neha Kulkarni", clientId: "CLT-0445", orderType: "individual",   product: "Fresh Paneer",             qty: "250 g × 2",  frequency: "One time",        orderDate: "4 June 2026", deliveryDate: "—",           amount: "₹350",   amountNote: "refunded",     payment: "refunded",      status: "cancelled"        },
  { id: "#ORD-92962", initials: "RV", avatarBg: "#dbeafe", avatarFg: "#1d4ed8", customer: "Ravi Varma",    clientId: "CLT-0891", orderType: "subscription", product: "Buffalo Milk",             qty: "2 L",        frequency: "Daily",           orderDate: "1 Jan 2025",  deliveryDate: "—",           amount: "₹3,200", amountNote: "pending refund",payment: "pending_refund", status: "cancelled"        },
  { id: "#ORD-92975", initials: "AS", avatarBg: "#fecaca", avatarFg: "#991b1b", customer: "Amit Sharma",   clientId: "CLT-1041", orderType: "individual",   product: "Organic Curd",             qty: "500 g × 3",  frequency: "One time",        orderDate: "3 June 2026", deliveryDate: "—",           amount: "₹540",   amountNote: "refunded",     payment: "refunded",      status: "cancelled"        },
  { id: "#ORD-92988", initials: "PK", avatarBg: "#dcfce7", avatarFg: "#7B5233", customer: "Priti Kumar",   clientId: "CLT-1188", orderType: "subscription", product: "A2 Gir Cow Milk",          qty: "1 L",        frequency: "Daily",           orderDate: "15 Feb 2026", deliveryDate: "—",           amount: "₹2,040", amountNote: "no refund",    payment: "monthly_bill",  status: "cancelled"        },
  { id: "#ORD-92870", initials: "VB", avatarBg: "#ffdad6", avatarFg: "#991b1b", customer: "Vinod Bhat",    clientId: "CLT-0301", orderType: "subscription", product: "Gir Milk 1L",              qty: "1 L",        frequency: "Daily",           orderDate: "26 May 2026", deliveryDate: "—",           amount: "₹320",   amountNote: "/month",       payment: "monthly_bill",  status: "cancelled"        },
];

const PAGE_SIZE = 5;

function AdminOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("cancelled");
  const [page, setPage] = useState(1);

  const filtered   = activeTab === "all" ? ORDERS : ORDERS.filter(o => o.status === activeTab);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeTab(id) { setActiveTab(id); setPage(1); }

  const showFrom = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showTo   = Math.min(page * PAGE_SIZE, filtered.length);
  const tabLabel = TABS.find(t => t.id === activeTab)?.label ?? "orders";

  return (
    <div className="om-page">

      {/* ── Title & actions ── */}
      <section className="om-title-section">
        <div>
          <h2 className="om-title">Orders management</h2>
          <div className="om-date-row">
            <span className="om-date-label">
              <span className="material-symbols-outlined om-date-cal-icon">calendar_month</span>
              View by date:
            </span>
            <div className="om-date-picker">
              <select className="om-date-select">
                <option>This month</option>
                <option>Last month</option>
                <option>This week</option>
                <option>Custom range</option>
              </select>
              <div className="om-date-input-wrap">
                <input type="text" className="om-date-input" defaultValue="05-06-2026" readOnly />
                <span className="material-symbols-outlined om-date-cal-icon">calendar_month</span>
              </div>
            </div>
          </div>
        </div>
        <div className="om-title-actions">
          <button type="button" className="om-add-btn" onClick={() => navigate("/admin/orders/new")}>
            <span className="material-symbols-outlined">add</span>
            Add new order
          </button>
          <p className="om-showing-hint">
            <span className="om-dot-hint" />
            Showing: 5 June 2026
          </p>
        </div>
      </section>

      {/* ── 6 KPI cards ── */}
      <section className="om-kpi-grid">
        {KPI.map(k => {
          const isActive = k.statusKey === activeTab;
          return (
            <div
              key={k.label}
              className="om-kpi-card"
              style={isActive ? { border: `2px solid ${k.activeBorderColor}` } : {}}
            >
              <p
                className="om-kpi-label"
                style={isActive ? { color: k.activeLabelColor } : {}}
              >
                {k.label}
              </p>
              <p className="om-kpi-value" style={{ color: k.valueColor }}>
                {k.value}
              </p>
              <p
                className="om-kpi-note"
                style={{ color: isActive ? k.activeLabelColor : k.noteColor }}
              >
                {isActive ? "• viewing now" : k.noteText}
              </p>
            </div>
          );
        })}
      </section>

      {/* ── Tab row (sits on border-bottom line) ── */}
      <div className="om-tab-row">
        <div className="om-tabs-list">
          {TABS.map(t => {
            const isActive = activeTab === t.id;
            const c = TAB_COLORS[t.id] || TAB_COLORS.all;
            return (
              <button
                key={t.id}
                type="button"
                className={`om-tab${isActive ? " om-tab-active" : ""}`}
                style={isActive ? {
                  background:   c.bg,
                  color:        c.text,
                  borderLeft:   `1px solid ${c.border}`,
                  borderRight:  `1px solid ${c.border}`,
                  borderTop:    `1px solid ${c.border}`,
                  borderBottom: "none",
                } : {}}
                onClick={() => changeTab(t.id)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="om-filter-right">
          <span className="om-results-text">
            Showing {showFrom}–{showTo} of {filtered.length} {tabLabel.toLowerCase()} results
          </span>
          <button type="button" className="om-filter-btn">
            <span className="material-symbols-outlined om-filter-icon">tune</span>
            Filters
          </button>
        </div>
      </div>

      {/* ── Table card (standalone, all corners rounded) ── */}
      <section className="om-table-section">
        <div className="om-table-scroll">
          <table className="om-table">
            <thead>
              <tr className="om-thead-row">
                <th className="om-th">Order ID</th>
                <th className="om-th">Customer</th>
                <th className="om-th">Client ID</th>
                <th className="om-th">Order Type</th>
                <th className="om-th">Product Details</th>
                <th className="om-th om-th-center">Qty</th>
                <th className="om-th">Frequency</th>
                <th className="om-th">Order Date</th>
                <th className="om-th om-th-center">Delivery Date</th>
                <th className="om-th">Amount</th>
                <th className="om-th">Payment Method</th>
                <th className="om-th om-th-center">Status</th>
                <th className="om-th">Actions</th>
              </tr>
            </thead>
            <tbody className="om-tbody">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={13} className="om-empty">No orders found</td>
                </tr>
              ) : paginated.map(o => {
                const tm = ORDER_TYPE_META[o.orderType] ?? ORDER_TYPE_META.subscription;
                const pm = PAYMENT_META[o.payment]      ?? PAYMENT_META.monthly_bill;
                const sm = STATUS_META[o.status]        ?? STATUS_META.pending;
                const isDateDash = o.deliveryDate === "—";
                return (
                  <tr key={o.id} className={`om-row ${tm.rowBorderCls}`}>

                    <td className="om-td om-td-id">{o.id}</td>

                    <td className="om-td">
                      <div className="om-customer-cell">
                        <span className="om-avatar" style={{ background: o.avatarBg, color: o.avatarFg }}>
                          {o.initials}
                        </span>
                        <span className="om-customer-name">{o.customer}</span>
                      </div>
                    </td>

                    <td className="om-td om-td-muted">{o.clientId}</td>

                    <td className="om-td">
                      <span className={`om-type-pill ${tm.pillCls}`}>
                        ▢ {tm.label}
                      </span>
                    </td>

                    <td className="om-td om-td-product">{o.product}</td>

                    <td className="om-td om-td-center">{o.qty}</td>

                    <td className="om-td om-td-muted om-td-freq">{o.frequency}</td>

                    <td className="om-td">{o.orderDate}</td>

                    <td className={`om-td om-td-center${isDateDash ? " om-td-dash" : ""}`}>
                      {o.deliveryDate}
                    </td>

                    <td className="om-td">
                      <div className="om-amount">{o.amount}</div>
                      <div className="om-amount-note">{o.amountNote}</div>
                    </td>

                    <td className="om-td">
                      <span className={`om-pay-badge ${pm.cls}`}>{pm.label}</span>
                    </td>

                    <td className="om-td om-td-center">
                      <span className={`om-status-badge ${sm.cls}`}>
                        <span className="om-status-dot" />
                        {sm.label}
                      </span>
                    </td>

                    <td className="om-td">
                      <div className="om-row-actions">
                        <button type="button" className="om-action-btn" onClick={() => navigate(`/admin/orders/${o.id.replace('#', '')}`)}>
                          <span className="material-symbols-outlined om-action-icon">visibility</span>
                          View
                        </button>
                        <button type="button" className="om-action-btn" onClick={() => navigate(`/admin/orders/${o.id.replace('#', '')}/edit`)}>
                          <span className="material-symbols-outlined om-action-icon">edit</span>
                          Edit
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Legend + pagination ── */}
      <div className="om-bottom-row">
        <div className="om-legend">
          <div className="om-legend-item">
            <span className="om-legend-bar om-bar-sub" /> Green border = Subscription
          </div>
          <div className="om-legend-item">
            <span className="om-legend-bar om-bar-ext" /> Blue border = Extra order
          </div>
          <div className="om-legend-item">
            <span className="om-legend-bar om-bar-ind" /> Amber border = Individual
          </div>
        </div>
        <div className="om-pg-controls">
          <button
            type="button"
            className="om-pg-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              type="button"
              className={`om-pg-num${page === n ? " om-pg-active" : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="om-pg-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <p className="om-footer-count">
        Showing {showFrom}–{showTo} of {filtered.length} {tabLabel.toLowerCase()} orders — 5 June 2026
      </p>

    </div>
  );
}

export { AdminOrders };
