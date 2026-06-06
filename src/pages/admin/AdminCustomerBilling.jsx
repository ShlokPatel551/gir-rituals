import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminCustomerBilling.css";

/* ── Mock data ── */
const MOCK_CUSTOMER = {
  GR00124: { name: "Priya Shah"    },
  GR00089: { name: "Rahul Mehta"   },
  GR00201: { name: "Anjali Kapoor" },
  GR00057: { name: "Meena Patel"   },
  GR00312: { name: "Suresh Joshi"  },
  GR00098: { name: "Kavita Rao"    },
  GR00143: { name: "Deepak Nair"   },
  GR00178: { name: "Sunita Verma"  },
  GR00234: { name: "Arjun Desai"   },
  GR00267: { name: "Pooja Sharma"  },
};

const MOCK_BILLS = [
  {
    month: "May 2026",
    note: "Current month (Due 31/05)",
    noteVariant: "normal",
    sub: "₹2,940",
    extras: "₹650",
    extrasNote: "1 extra item",
    total: "₹3,590",
    paid: "₹0",
    status: "unpaid",
    variant: "current",
  },
  {
    month: "April 2026",
    note: "Overdue since 30/04",
    noteVariant: "error",
    sub: "₹2,800",
    extras: "₹0",
    extrasNote: null,
    total: "₹2,800",
    paid: "₹0",
    status: "overdue",
    variant: "overdue",
  },
  {
    month: "March 2026",
    note: "Paid on 28/03",
    noteVariant: "normal",
    sub: "₹2,800",
    extras: "₹325",
    extrasNote: "1 extra item",
    total: "₹3,125",
    paid: "₹3,125",
    status: "paid",
    variant: "normal",
  },
];

const MOCK_ITEMS = [
  { date: "25/05/2026", product: "Cow Ghee",      isExtra: true,  qty: "250g", amount: "₹325", status: "paid",         method: "UPI (10:15 AM)"      },
  { date: "18/05/2026", product: "Buffalo Milk",   isExtra: false, qty: "2L",   amount: "₹150", status: "unpaid",       method: "Pay immediate"       },
  { date: "10/05/2026", product: "Paneer",         isExtra: false, qty: "500g", amount: "₹375", status: "added-to-bill", method: "Monthly settlement" },
];

const BILL_STATUS = {
  paid:         { label: "Paid",         cls: "cb-status-paid"    },
  unpaid:       { label: "Unpaid",       cls: "cb-status-unpaid"  },
  overdue:      { label: "Overdue",      cls: "cb-status-overdue" },
  "added-to-bill": { label: "Added to bill", cls: "cb-status-bill" },
};

const NAV_TABS = [
  { key: "schedule",      label: "Schedule"      },
  { key: "bills",         label: "Bills"         },
  { key: "orders",        label: "Orders"        },
  { key: "order-history", label: "Order History" },
  { key: "transactions",  label: "Transactions"  },
];

function AdminCustomerBilling() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [fabOpen,  setFabOpen]  = useState(false);

  const customer = MOCK_CUSTOMER[id] || { name: id || "Customer" };

  function handleTabClick(key) {
    if (key === "bills") return;
    if (key === "schedule")     navigate(`/admin/customers/${id}`);
    if (key === "orders")       navigate(`/admin/customers/${id}/orders`);
    if (key === "order-history")navigate(`/admin/customers/${id}/orders`);
    if (key === "transactions") navigate(`/admin/customers/${id}/transactions`);
  }

  return (
    <div className="cb-page">

      {/* ── Breadcrumb + actions ── */}
      <div className="cb-topbar">
        <nav className="cb-breadcrumb">
          <Link to="/admin/customers" className="cb-crumb-link">Customers</Link>
          <span className="material-symbols-outlined cb-crumb-sep">chevron_right</span>
          <Link to={`/admin/customers/${id}`} className="cb-crumb-link">{customer.name}</Link>
          <span className="material-symbols-outlined cb-crumb-sep">chevron_right</span>
          <span className="cb-crumb-current">Billing</span>
        </nav>
        <button type="button" className="cb-btn-whatsapp">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
          Send bill on WhatsApp
        </button>
      </div>

      {/* ── Sub-nav tabs ── */}
      <div className="cb-tabs-row">
        {NAV_TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`cb-tab${t.key === "bills" ? " cb-tab-active" : ""}`}
            onClick={() => handleTabClick(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {/* ── KPI grid ── */}
      <div className="cb-kpi-grid">
        <div className="cb-kpi-card">
          <p className="cb-kpi-label">Total Month Bill Amt</p>
          <h3 className="cb-kpi-value">₹3,590</h3>
          <p className="cb-kpi-note">For May 2026</p>
        </div>
        <div className="cb-kpi-card">
          <p className="cb-kpi-label">Total Paid in Month</p>
          <h3 className="cb-kpi-value cb-kpi-paid">₹700</h3>
          <p className="cb-kpi-note">Updated 5 mins ago</p>
        </div>
        <div className="cb-kpi-card">
          <p className="cb-kpi-label">Amount Remaining to Pay of Month</p>
          <h3 className="cb-kpi-value">₹2,890</h3>
          <p className="cb-kpi-note">Due by 31 May 2026</p>
        </div>
        <div className="cb-kpi-card cb-kpi-card-overdue">
          <p className="cb-kpi-label cb-kpi-label-error">Total Amt Remaining to Pay Till Current Dt</p>
          <h3 className="cb-kpi-value cb-kpi-overdue">₹6,390</h3>
          <p className="cb-kpi-note cb-kpi-note-error">Includes overdue amounts</p>
        </div>
      </div>

      {/* ── Monthly Bills History ── */}
      <section className="cb-section">
        <div className="cb-section-header">
          <div className="cb-section-title-row">
            <span className="material-symbols-outlined cb-section-icon">receipt_long</span>
            <h3 className="cb-section-title">Monthly Bills History</h3>
          </div>
          <div className="cb-section-badges">
            <span className="cb-tag cb-tag-error">1 Overdue</span>
            <span className="cb-tag cb-tag-paid">3 Paid</span>
          </div>
        </div>

        <div className="cb-table-card">
          <div className="cb-table-scroll">
            <table className="cb-table cb-bills-table">
              <thead>
                <tr>
                  <th>Month / Year</th>
                  <th>Subscription</th>
                  <th>Extras</th>
                  <th>Total Bill</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th className="cb-th-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BILLS.map((b, i) => (
                  <tr key={i} className={`cb-bill-row cb-bill-${b.variant}`}>
                    <td>
                      <div className={`cb-month-name ${b.variant === "overdue" ? "cb-month-error" : ""}`}>{b.month}</div>
                      <div className={`cb-month-note ${b.variant === "overdue" ? "cb-month-note-error" : ""}`}>{b.note}</div>
                    </td>
                    <td>{b.sub}</td>
                    <td>
                      {b.extras}
                      {b.extrasNote && <span className="cb-extras-note">{b.extrasNote}</span>}
                    </td>
                    <td className={`cb-total-cell ${b.variant === "overdue" ? "cb-total-error" : ""}`}>{b.total}</td>
                    <td className={b.status === "paid" ? "cb-paid-cell" : ""}>{b.paid}</td>
                    <td>
                      <span className={`cb-status-badge ${BILL_STATUS[b.status]?.cls}`}>
                        {BILL_STATUS[b.status]?.label}
                      </span>
                    </td>
                    <td className="cb-action-cell">
                      {b.variant === "current" && (
                        <div className="cb-action-btns">
                          <button type="button" className="cb-act-primary">Mark paid</button>
                          <button type="button" className="cb-act-outline">View</button>
                        </div>
                      )}
                      {b.variant === "overdue" && (
                        <div className="cb-action-btns">
                          <button type="button" className="cb-act-error">Remind</button>
                          <button type="button" className="cb-act-outline">View</button>
                        </div>
                      )}
                      {b.variant === "normal" && (
                        <button type="button" className="cb-act-outline">View</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="cb-tfoot-row">
                  <td colSpan={3} className="cb-tfoot-label">Total across all months</td>
                  <td className="cb-tfoot-total">₹15,485</td>
                  <td className="cb-tfoot-paid">₹9,095 paid</td>
                  <td colSpan={2} className="cb-tfoot-pending">₹6,390 pending</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="cb-info-bar">
          <span className="material-symbols-outlined cb-info-icon">info</span>
          <p className="cb-info-text">
            Monthly bill calculation: Subscription deliveries × rate + individual items "Added to month bill".
            Items already paid individually are <strong>NOT</strong> counted again in the monthly bill.
          </p>
        </div>
      </section>

      {/* ── Individual Items ── */}
      <section className="cb-section">
        <div className="cb-section-header">
          <div className="cb-section-title-row">
            <span className="material-symbols-outlined cb-section-icon cb-section-icon-secondary">shopping_basket</span>
            <h3 className="cb-section-title">Individual Items — May 2026</h3>
          </div>
          <button type="button" className="cb-export-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>ios_share</span>
            Export CSV
          </button>
        </div>

        <div className="cb-table-card">
          <div className="cb-table-scroll">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th className="cb-th-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ITEMS.map((item, i) => (
                  <tr key={i} className={item.status === "unpaid" ? "cb-row-error" : ""}>
                    <td className="cb-td-bold">{item.date}</td>
                    <td>
                      {item.product}
                      {item.isExtra && <span className="cb-extra-chip">Extra</span>}
                    </td>
                    <td>{item.qty}</td>
                    <td>{item.amount}</td>
                    <td>
                      <span className={`cb-status-badge ${BILL_STATUS[item.status]?.cls}`}>
                        {BILL_STATUS[item.status]?.label}
                      </span>
                    </td>
                    <td className={`cb-method-cell ${item.status === "unpaid" ? "cb-method-error" : ""}`}>{item.method}</td>
                    <td className="cb-action-cell">
                      {item.status === "unpaid" ? (
                        <button type="button" className="cb-act-primary">Mark Paid</button>
                      ) : (
                        <button type="button" className="cb-icon-btn material-symbols-outlined">visibility</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAB ── */}
      <div className="cb-fab-wrap">
        {fabOpen && (
          <div className="cb-fab-menu">
            <button type="button" className="cb-fab-item">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>mail</span>
              Email Statement
            </button>
            <button type="button" className="cb-fab-item">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
              Print Invoice
            </button>
          </div>
        )}
        <button
          type="button"
          className={`cb-fab${fabOpen ? " cb-fab-open" : ""}`}
          onClick={() => setFabOpen(v => !v)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
        </button>
      </div>

    </div>
  );
}

export { AdminCustomerBilling };
