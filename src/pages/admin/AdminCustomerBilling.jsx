import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomerBilling.css";

const BILL_STATUS = {
  paid:            { label: "Paid",         cls: "cb-status-paid"    },
  unpaid:          { label: "Unpaid",       cls: "cb-status-unpaid"  },
  overdue:         { label: "Overdue",      cls: "cb-status-overdue" },
  "added-to-bill": { label: "Added to bill", cls: "cb-status-bill"  },
};

const NAV_TABS = [
  { key: "schedule",      label: "Schedule"      },
  { key: "bills",         label: "Bills"         },
  { key: "orders",        label: "Orders"        },
  { key: "order-history", label: "Order History" },
  { key: "transactions",  label: "Transactions"  },
];

function fmt(n) {
  return n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";
}

function billVariant(bill) {
  if (bill.status === "paid") return "normal";
  const due = bill.due_date ? new Date(bill.due_date) : null;
  if (due && due < new Date()) return "overdue";
  return "current";
}

function billStatus(bill) {
  if (bill.status === "paid") return "paid";
  const due = bill.due_date ? new Date(bill.due_date) : null;
  if (due && due < new Date()) return "overdue";
  return "unpaid";
}

function AdminCustomerBilling() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [data,     setData]    = useState(null);
  const [fabOpen,  setFabOpen] = useState(false);

  useEffect(() => {
    api.adminCustomer(id).then(setData).catch(() => {});
  }, [id]);

  const customerName = data ? `${data.firstName} ${data.lastName}`.trim() : id;
  const rawBills     = data?.bills ?? [];
  const rawOrders    = data?.orders ?? [];

  // Enrich bills with variant + status
  const bills = rawBills.map(b => ({
    ...b,
    variant: billVariant(b),
    billStatus: billStatus(b),
    paidAmt: b.status === "paid" ? b.amount : 0,
  }));

  // KPI values
  const now         = new Date();
  const thisMonthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const currentBill = bills.find(b => b.period === thisMonthLabel) || bills[0];
  const totalMonthAmt  = currentBill ? currentBill.amount : 0;
  const totalPaidMonth = currentBill?.status === "paid" ? currentBill.amount : 0;
  const remaining      = totalMonthAmt - totalPaidMonth;
  const totalPending   = bills.filter(b => b.status !== "paid").reduce((s, b) => s + b.amount, 0);

  // Totals row
  const grandTotal   = bills.reduce((s, b) => s + b.amount, 0);
  const grandPaid    = bills.reduce((s, b) => s + b.paidAmt, 0);
  const grandPending = grandTotal - grandPaid;

  const overdueCount = bills.filter(b => b.billStatus === "overdue").length;
  const paidCount    = bills.filter(b => b.billStatus === "paid").length;

  // Individual items from orders
  const items = rawOrders.map(o => ({
    date:    o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : "—",
    product: o.product_name,
    qty:     o.qty != null ? String(o.qty) : "—",
    amount:  fmt(o.total),
    status:  o.status === "active" ? "unpaid" : "paid",
    method:  o.status === "active" ? "Pending" : "Settled",
  }));

  function handleTabClick(key) {
    if (key === "bills") return;
    if (key === "schedule")      navigate(`/admin/customers/${id}`);
    if (key === "orders")        navigate(`/admin/customers/${id}/orders`);
    if (key === "order-history") navigate(`/admin/customers/${id}/orders`);
    if (key === "transactions")  navigate(`/admin/customers/${id}/transactions`);
  }

  return (
    <div className="cb-page">

      {/* ── Breadcrumb + actions ── */}
      <div className="cb-topbar">
        <nav className="cb-breadcrumb">
          <Link to="/admin/customers" className="cb-crumb-link">Customers</Link>
          <span className="material-symbols-outlined cb-crumb-sep">chevron_right</span>
          <Link to={`/admin/customers/${id}`} className="cb-crumb-link">{customerName}</Link>
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
          <h3 className="cb-kpi-value">{fmt(totalMonthAmt)}</h3>
          <p className="cb-kpi-note">For {thisMonthLabel}</p>
        </div>
        <div className="cb-kpi-card">
          <p className="cb-kpi-label">Total Paid in Month</p>
          <h3 className="cb-kpi-value cb-kpi-paid">{fmt(totalPaidMonth)}</h3>
          <p className="cb-kpi-note">Current month payments</p>
        </div>
        <div className="cb-kpi-card">
          <p className="cb-kpi-label">Amount Remaining to Pay of Month</p>
          <h3 className="cb-kpi-value">{fmt(remaining)}</h3>
          <p className="cb-kpi-note">{currentBill?.due_date ? `Due by ${currentBill.due_date}` : "—"}</p>
        </div>
        <div className="cb-kpi-card cb-kpi-card-overdue">
          <p className="cb-kpi-label cb-kpi-label-error">Total Amt Remaining to Pay Till Current Dt</p>
          <h3 className="cb-kpi-value cb-kpi-overdue">{fmt(totalPending)}</h3>
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
            {overdueCount > 0 && <span className="cb-tag cb-tag-error">{overdueCount} Overdue</span>}
            {paidCount   > 0 && <span className="cb-tag cb-tag-paid">{paidCount} Paid</span>}
          </div>
        </div>

        <div className="cb-table-card">
          <div className="cb-table-scroll">
            <table className="cb-table cb-bills-table">
              <thead>
                <tr>
                  <th>Month / Year</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th className="cb-th-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>No bills yet</td></tr>
                )}
                {bills.map((b, i) => {
                  const st = b.billStatus;
                  return (
                    <tr key={i} className={`cb-bill-row cb-bill-${b.variant}`}>
                      <td>
                        <div className={`cb-month-name${st === "overdue" ? " cb-month-error" : ""}`}>{b.period}</div>
                        {st === "overdue" && <div className="cb-month-note cb-month-note-error">Overdue since {b.due_date}</div>}
                        {st === "paid"    && <div className="cb-month-note">Paid on {b.paid_date || "—"}</div>}
                        {st === "unpaid"  && <div className="cb-month-note">Due {b.due_date || "—"}</div>}
                      </td>
                      <td className={`cb-total-cell${st === "overdue" ? " cb-total-error" : ""}`}>{fmt(b.amount)}</td>
                      <td className={b.status === "paid" ? "cb-paid-cell" : ""}>{fmt(b.paidAmt)}</td>
                      <td>
                        <span className={`cb-status-badge ${BILL_STATUS[st]?.cls}`}>
                          {BILL_STATUS[st]?.label}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8125rem", color: "var(--admin-on-surface-variant)" }}>
                        {b.due_date || "—"}
                      </td>
                      <td className="cb-action-cell">
                        {st === "unpaid" && (
                          <div className="cb-action-btns">
                            <button type="button" className="cb-act-primary">Mark paid</button>
                            <button type="button" className="cb-act-outline">View</button>
                          </div>
                        )}
                        {st === "overdue" && (
                          <div className="cb-action-btns">
                            <button type="button" className="cb-act-error">Remind</button>
                            <button type="button" className="cb-act-outline">View</button>
                          </div>
                        )}
                        {st === "paid" && (
                          <button type="button" className="cb-act-outline">View</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {bills.length > 0 && (
                <tfoot>
                  <tr className="cb-tfoot-row">
                    <td className="cb-tfoot-label">Total across all months</td>
                    <td className="cb-tfoot-total">{fmt(grandTotal)}</td>
                    <td className="cb-tfoot-paid">{fmt(grandPaid)} paid</td>
                    <td colSpan={3} className="cb-tfoot-pending">{fmt(grandPending)} pending</td>
                  </tr>
                </tfoot>
              )}
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
            <h3 className="cb-section-title">Individual Items — {thisMonthLabel}</h3>
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
                {items.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>No individual items</td></tr>
                )}
                {items.map((item, i) => (
                  <tr key={i} className={item.status === "unpaid" ? "cb-row-error" : ""}>
                    <td className="cb-td-bold">{item.date}</td>
                    <td>{item.product}</td>
                    <td>{item.qty}</td>
                    <td>{item.amount}</td>
                    <td>
                      <span className={`cb-status-badge ${BILL_STATUS[item.status]?.cls}`}>
                        {BILL_STATUS[item.status]?.label}
                      </span>
                    </td>
                    <td className={`cb-method-cell${item.status === "unpaid" ? " cb-method-error" : ""}`}>{item.method}</td>
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
