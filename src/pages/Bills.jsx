import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Bills.css";

/* ── Static chart / mix data ─────────────────────────────────── */
const CHART_MONTHS = [
  { label: "JAN", height: 96,  amount: 1200 },
  { label: "FEB", height: 128, amount: 1680 },
  { label: "MAR", height: 112, amount: 1450 },
  { label: "APR", height: 160, amount: 2450, highlight: true },
  { label: "MAY", height: 80,  amount: 980  },
  { label: "JUN", height: 144, amount: 1890 },
];

const RITUAL_MIX = [
  { name: "A2 Gir Milk",   pct: 65 },
  { name: "Vedic Ghee",    pct: 25 },
  { name: "Organic Honey", pct: 10 },
];

/* Mock fallback data (shown when backend returns nothing) */
const MOCK_BILLS = [
  { id: "mock-1", invoiceId: "GR-2024-04", period: "April 2024", status: "unpaid", amount: 3420.00, dueDate: "15 April, 2024",   lineItems: [] },
  { id: "mock-2", invoiceId: "GR-2024-05", period: "May 2024",   status: "unpaid", amount: 2850.00, dueDate: "15 May, 2024",     lineItems: [] },
];

const MOCK_STATEMENTS = [
  { id: "TRX-88291", date: "Apr 12, 2024", type: "Wallet Recharge",          method: "UPI (GPay)",     amount: 5000, credit: true,  month: "Apr 2024" },
  { id: "TRX-77120", date: "Mar 28, 2024", type: "Bill Payment #GR-2024-03", method: "Ritual Wallet",  amount: 3210, credit: false, month: "Mar 2024" },
  { id: "TRX-66105", date: "Mar 15, 2024", type: "Vedic Ghee — Subscription",method: "Credit Card",    amount: 1450, credit: false, month: "Mar 2024" },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function isOverdue(bill) {
  if (bill.status !== "unpaid") return false;
  const due = new Date(bill.dueDate);
  return !isNaN(due) && due < new Date();
}

function billInvoiceId(bill) {
  return bill.invoiceId ?? `GR-${bill.id}`;
}

/* ── Bill Card ───────────────────────────────────────────────── */
function BillCard({ bill, onPay, onDownload }) {
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdue(bill);
  const paid    = bill.status === "paid";

  return (
    <div className="bl-bill-card">
      {/* Top row: icon + badge */}
      <div className="bl-bill-card-top">
        <div className={`bl-bill-icon ${paid ? "bl-bill-icon-paid" : ""}`}>
          <span
            className="material-symbols-outlined"
            style={paid ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {paid ? "check_circle" : "description"}
          </span>
        </div>
        <span className={`bl-bill-badge ${paid ? "bl-badge-settled" : overdue ? "bl-badge-overdue" : "bl-badge-upcoming"}`}>
          {paid ? "Settled" : overdue ? "Overdue" : "Upcoming"}
        </span>
      </div>

      {/* Invoice info */}
      <h5 className="bl-bill-title">Invoice #{billInvoiceId(bill)}</h5>
      <p className="bl-bill-date">
        {paid ? `Paid on ${bill.paidDate ?? "—"}` : `Due on ${bill.dueDate ?? "—"}`}
      </p>

      {/* Amount + PDF */}
      <div className="bl-bill-amount-row">
        <div>
          {!paid && <p className="bl-bill-amount-lbl">Total Amount</p>}
          <p className="bl-bill-amount">₹{Number(bill.amount).toFixed(2)}</p>
        </div>
        <button type="button" className="bl-pdf-btn" onClick={() => onDownload?.()}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
          {paid ? "Receipt" : "PDF"}
        </button>
      </div>

      {/* Line-items accordion */}
      {bill.lineItems?.length > 0 && (
        <>
          <button type="button" className="bl-expand-btn" onClick={() => setExpanded(e => !e)}>
            {expanded ? "Hide breakdown ▲" : "View breakdown ▼"}
          </button>
          {expanded && (
            <div className="bl-line-items">
              {bill.lineItems.map((item, i) => (
                <div key={i} className="bl-line-item">
                  <span>{item.description}</span>
                  <span>₹{Number(item.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Action button */}
      {!paid && (
        <Link
          to={`/payment?amount=${bill.amount}&billId=${bill.id}`}
          className={`bl-pay-btn ${overdue ? "bl-pay-btn-primary" : "bl-pay-btn-secondary"}`}
          onClick={() => onPay?.(bill.id)}
        >
          Pay Now
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </Link>
      )}
    </div>
  );
}

/* ── Main Bills component ────────────────────────────────────── */
function Bills() {
  const { bills, statementEntries, payBill } = useApp();
  const { showToast } = useToast();

  const [tab,         setTab]         = useState("unpaid");
  const [filterMonth, setFilterMonth] = useState("All");

  /* Use real data if present, else mock */
  const effectiveBills      = bills.length > 0 ? bills : MOCK_BILLS;
  const effectiveStatements = statementEntries.length > 0 ? statementEntries : MOCK_STATEMENTS;

  const paid   = effectiveBills.filter(b => b.status === "paid");
  const unpaid = effectiveBills.filter(b => b.status === "unpaid");

  const availableMonths = useMemo(() =>
    ["All", ...Array.from(new Set(effectiveStatements.map(e => e.month).filter(Boolean)))],
    [effectiveStatements]
  );

  const filteredStatements = filterMonth === "All"
    ? effectiveStatements
    : effectiveStatements.filter(e => e.month === filterMonth);

  const totalSpent = CHART_MONTHS.reduce((s, m) => s + m.amount, 0);

  const handleDownload = () => showToast("Invoice download requires backend.", "info");
  const handlePayBill  = (id) => {
    if (payBill) payBill(id);
    showToast("Redirecting to payment...", "info");
  };

  return (
    <div className="bl-page">

      {/* ══ HEADER ══ */}
      <div className="bl-header">
        <div>
          <h2 className="bl-title">My Bills</h2>
          <p className="bl-subtitle">Manage your subscriptions and ritual expenditures.</p>
        </div>
        <div className="bl-tabs">
          {[
            { key: "unpaid",     label: "Unpaid Bills" },
            { key: "paid",       label: "Paid Bills"   },
            { key: "statements", label: "Statements"   },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              className={`bl-tab ${tab === t.key ? "bl-tab-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === "unpaid" && unpaid.length > 0 && (
                <span className="bl-tab-count">{unpaid.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BENTO STATS ══ */}
      <div className="bl-bento">

        {/* Monthly spending bar chart */}
        <div className="bl-card bl-chart-card">
          <div className="bl-chart-header">
            <div>
              <h3 className="bl-chart-title">Monthly Spending</h3>
              <p className="bl-chart-sub">Yearly Overview {new Date().getFullYear()}</p>
            </div>
            <div className="bl-chart-total">
              <span className="bl-chart-total-amt">₹{totalSpent.toLocaleString("en-IN")}</span>
              <span className="material-symbols-outlined bl-chart-trend">trending_up</span>
            </div>
          </div>

          <div className="bl-chart-bars">
            {CHART_MONTHS.map(m => (
              <div key={m.label} className="bl-bar-col">
                <div className="bl-bar-area">
                  <div
                    className={`bl-bar${m.highlight ? " bl-bar-highlight" : ""}`}
                    style={{ height: m.height }}
                    title={`₹${m.amount.toLocaleString("en-IN")}`}
                  >
                    <span className={`bl-bar-tip${m.highlight ? " bl-bar-tip-on" : ""}`}>
                      ₹{m.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <span className={`bl-bar-label${m.highlight ? " bl-bar-label-active" : ""}`}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ritual Mix */}
        <div className="bl-ritual-card">
          <div className="bl-ritual-glow" />
          <div className="bl-ritual-inner">
            <h3 className="bl-ritual-title">Ritual Mix</h3>
            <div className="bl-ritual-items">
              {RITUAL_MIX.map(item => (
                <div key={item.name} className="bl-ritual-item">
                  <div className="bl-ritual-item-row">
                    <span>{item.name}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="bl-ritual-track">
                    <div className="bl-ritual-fill" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ UNPAID BILLS ══ */}
      {tab === "unpaid" && (
        <div className="bl-section">
          <h4 className="bl-section-title">Pending Payments</h4>
          {unpaid.length === 0 ? (
            <div className="bl-empty-state">
              <span className="material-symbols-outlined bl-empty-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <p>No pending bills. You're all clear!</p>
            </div>
          ) : (
            <div className="bl-cards-grid">
              {unpaid.map(b => (
                <BillCard key={b.id} bill={b} onPay={handlePayBill} onDownload={handleDownload} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ PAID BILLS ══ */}
      {tab === "paid" && (
        <div className="bl-section">
          <h4 className="bl-section-title">Historical Receipts</h4>
          {paid.length === 0 ? (
            <div className="bl-empty-state">
              <span className="material-symbols-outlined bl-empty-icon">receipt_long</span>
              <p>No paid bills yet.</p>
            </div>
          ) : (
            <div className="bl-cards-grid">
              {paid.map(b => (
                <BillCard key={b.id} bill={b} onDownload={handleDownload} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ STATEMENTS ══ */}
      {tab === "statements" && (
        <div className="bl-section">
          <div className="bl-section-hdr">
            <h4 className="bl-section-title" style={{ margin: 0 }}>Recent Transactions</h4>
            <div className="bl-stmt-controls">
              <select
                className="bl-month-select"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
              >
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button
                type="button"
                className="bl-download-btn"
                onClick={() => showToast("PDF download requires backend.", "info")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                Download PDF
              </button>
            </div>
          </div>

          <div className="bl-table-card">
            {filteredStatements.length === 0 ? (
              <div className="bl-empty-state" style={{ padding: "3rem 1rem" }}>
                <span className="material-symbols-outlined bl-empty-icon">receipt_long</span>
                <p>No transactions found.</p>
              </div>
            ) : (
              <div className="bl-table-wrap">
                <table className="bl-table">
                  <thead className="bl-thead">
                    <tr>
                      <th className="bl-th">Date</th>
                      <th className="bl-th">Transaction ID</th>
                      <th className="bl-th">Description</th>
                      <th className="bl-th">Method</th>
                      <th className="bl-th bl-th-right">Amount</th>
                      <th className="bl-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStatements.map((e, i) => (
                      <tr key={e.id ?? i} className="bl-tr">
                        <td className="bl-td">{e.date}</td>
                        <td className="bl-td bl-td-mono">#{e.id ?? `TRX-${i + 10000}`}</td>
                        <td className="bl-td bl-td-bold">{e.type}</td>
                        <td className="bl-td">{e.method ?? "—"}</td>
                        <td className={`bl-td bl-td-right bl-td-bold ${e.credit ? "bl-credit-amt" : "bl-debit-amt"}`}>
                          {e.credit ? "+" : "−"}₹{Number(e.amount ?? 0).toLocaleString("en-IN")}
                        </td>
                        <td className="bl-td">
                          <span className="bl-status-pill">
                            <span className="bl-status-dot" />
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Store credit card */}
          <div className="bl-card bl-store-credit-card">
            <strong className="bl-credit-card-title">Refund → Store Credit</strong>
            <p className="bl-credit-card-desc">
              Received a refund? Add it to your wallet for instant use on future orders.
            </p>
            <button
              type="button"
              className="bl-credit-card-btn"
              onClick={() => {
                if (addWalletCredit) addWalletCredit(140);
                showToast("₹140 store credit added to your wallet!");
              }}
            >
              + Add Demo Store Credit (₹140)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Bills };
