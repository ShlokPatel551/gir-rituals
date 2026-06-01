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

/* ── Invoice generator (browser print → Save as PDF) ─────────── */
function generateInvoice(bill, user) {
  const invoiceId = billInvoiceId(bill);
  const isPaid    = bill.status === "paid";
  const today     = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const lineRows = bill.lineItems?.length > 0
    ? bill.lineItems.map(it => `
        <tr>
          <td>${it.description ?? "—"}</td>
          <td class="center">${it.qty ?? 1}</td>
          <td class="right">₹${Number(it.rate ?? 0).toFixed(2)}</td>
          <td class="right amount-cell">₹${Number(it.amount ?? 0).toFixed(2)}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" class="center muted">No line items on record.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${invoiceId} — GIR RITUALS</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#3C2A21;background:#fff;font-size:13px;line-height:1.5}
  .page{max-width:760px;margin:0 auto;padding:48px 40px}

  /* Print button — hidden in print */
  .print-bar{background:#f9f3e9;border-bottom:1px solid #e3d6c5;padding:10px 40px;display:flex;align-items:center;gap:12px;justify-content:flex-end}
  .print-bar button{padding:8px 20px;background:#7B5233;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px}
  .print-bar button:hover{background:#5a3b22}
  @media print{.print-bar{display:none}}

  /* Header */
  .inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #f2e9dc}
  .brand-name{font-size:26px;font-weight:700;color:#7B5233;letter-spacing:-0.5px;margin-bottom:2px}
  .brand-tag{font-size:11px;color:#9A7B68;letter-spacing:0.08em;text-transform:uppercase}
  .brand-contact{font-size:11px;color:#6B5040;margin-top:8px;line-height:1.7}
  .inv-badge{text-align:right}
  .inv-badge-label{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9A7B68;margin-bottom:4px}
  .inv-id{font-size:22px;font-weight:700;color:#7B5233}

  /* Meta grid */
  .inv-meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;background:#f9f3e9;border-radius:12px;padding:20px 24px;margin-bottom:32px}
  .meta-label{font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9A7B68;margin-bottom:4px}
  .meta-value{font-size:13px;font-weight:600;color:#3C2A21}
  .meta-value.paid-color{color:#2e7d32}
  .meta-value.due-color{color:#ba1a1a}

  /* Bill to */
  .bill-to{margin-bottom:32px}
  .section-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9A7B68;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #f2e9dc}
  .bill-to-name{font-size:15px;font-weight:700;color:#3C2A21;margin-bottom:2px}
  .bill-to-detail{font-size:12px;color:#6B5040;line-height:1.7}

  /* Table */
  .items-table{width:100%;border-collapse:collapse;margin-bottom:0}
  .items-table th{padding:10px 16px;background:#7B5233;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;text-align:left}
  .items-table th.right,.items-table th.center{text-align:right}
  .items-table th.center{text-align:center}
  .items-table td{padding:11px 16px;font-size:12.5px;border-bottom:1px solid #f2e9dc;color:#3C2A21}
  .items-table tr:last-child td{border-bottom:none}
  .items-table tr:nth-child(even) td{background:#fdf9f5}
  .right{text-align:right}
  .center{text-align:center}
  .amount-cell{font-weight:600;color:#7B5233}
  .muted{color:#9A7B68;font-style:italic;padding:20px}

  /* Totals */
  .totals-section{display:flex;justify-content:flex-end;margin-top:0}
  .totals-box{width:280px;border:1px solid #f2e9dc;border-radius:0 0 12px 12px;overflow:hidden}
  .totals-row{display:flex;justify-content:space-between;padding:9px 16px;font-size:12.5px;border-top:1px solid #f2e9dc}
  .totals-row:first-child{border-top:none}
  .totals-row .lbl{color:#6B5040}
  .totals-total{background:#7B5233;color:#fff;font-weight:700;font-size:14px;padding:12px 16px}
  .totals-total .lbl{color:rgba(255,255,255,0.8)}

  /* Status stamp */
  .stamp-wrap{margin:28px 0;display:flex;justify-content:flex-start}
  .stamp{display:inline-block;padding:8px 28px;border-radius:6px;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border:2.5px solid}
  .stamp-paid{color:#2e7d32;border-color:#2e7d32;background:rgba(46,125,50,0.05)}
  .stamp-unpaid{color:#ba1a1a;border-color:#ba1a1a;background:rgba(186,26,26,0.05)}

  /* Footer */
  .inv-footer{margin-top:40px;padding-top:20px;border-top:1px solid #f2e9dc;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px}
  .footer-note{font-size:11px;color:#9A7B68;line-height:1.7}
  .footer-brand{font-size:12px;font-weight:700;color:#7B5233;text-align:right}
</style>
</head>
<body>
<div class="print-bar">
  <span style="font-size:12px;color:#6B5040">Preview your invoice below, then save as PDF.</span>
  <button onclick="window.print()">⬇ Save as PDF</button>
</div>
<div class="page">

  <!-- Header -->
  <div class="inv-header">
    <div>
      <div class="brand-name">GIR RITUALS</div>
      <div class="brand-tag">Pure · Natural · Daily</div>
      <div class="brand-contact">
        Gir Forest Region, Gujarat, India<br/>
        support@girrituals.com · +91 98765 43210
      </div>
    </div>
    <div class="inv-badge">
      <div class="inv-badge-label">Invoice</div>
      <div class="inv-id">#${invoiceId}</div>
    </div>
  </div>

  <!-- Meta -->
  <div class="inv-meta">
    <div>
      <div class="meta-label">Invoice Date</div>
      <div class="meta-value">${today}</div>
    </div>
    <div>
      <div class="meta-label">Billing Period</div>
      <div class="meta-value">${bill.period ?? "—"}</div>
    </div>
    <div>
      <div class="meta-label">${isPaid ? "Paid On" : "Due Date"}</div>
      <div class="meta-value ${isPaid ? "paid-color" : "due-color"}">${isPaid ? (bill.paidDate ?? "—") : (bill.dueDate ?? "—")}</div>
    </div>
  </div>

  <!-- Bill To -->
  <div class="bill-to">
    <div class="section-label">Bill To</div>
    <div class="bill-to-name">${user?.firstName ?? ""} ${user?.lastName ?? ""}</div>
    <div class="bill-to-detail">
      Client ID: ${user?.clientId ?? "—"}<br/>
      ${user?.email ?? ""}<br/>
      ${user?.phone ? user.phone + "<br/>" : ""}
      ${user?.billingAddress?.street ? user.billingAddress.street + ", " + user.billingAddress.city + ", " + user.billingAddress.state + " – " + user.billingAddress.pinCode : ""}
    </div>
  </div>

  <!-- Line Items -->
  <div class="section-label">Items</div>
  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="center">Qty</th>
        <th class="right">Rate</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>${lineRows}</tbody>
  </table>

  <!-- Totals -->
  <div class="totals-section">
    <div class="totals-box">
      <div class="totals-row">
        <span class="lbl">Subtotal</span>
        <span>₹${Number(bill.amount).toFixed(2)}</span>
      </div>
      <div class="totals-row">
        <span class="lbl">GST / Tax</span>
        <span>Included</span>
      </div>
      <div class="totals-row totals-total">
        <span class="lbl">Total Due</span>
        <span>₹${Number(bill.amount).toFixed(2)}</span>
      </div>
    </div>
  </div>

  <!-- Status Stamp -->
  <div class="stamp-wrap">
    <span class="stamp ${isPaid ? "stamp-paid" : "stamp-unpaid"}">
      ${isPaid ? "✓ Paid" : "⚠ Payment Pending"}
    </span>
  </div>

  <!-- Footer -->
  <div class="inv-footer">
    <div class="footer-note">
      Thank you for being part of the Gir Rituals family.<br/>
      For queries, write to support@girrituals.com or call +91 98765 43210.<br/>
      This is a computer-generated invoice and does not require a signature.
    </div>
    <div class="footer-brand">GIR RITUALS<br/><span style="font-weight:400;color:#9A7B68;font-size:11px">Pure · Natural · Daily</span></div>
  </div>

</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}

/* ── Statement PDF generator ─────────────────────────────────── */
function generateStatementPdf(entries, month, user) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const total  = entries.reduce((s, e) => s + (e.credit ? Number(e.amount) : -Number(e.amount)), 0);

  const rows = entries.map(e => `
    <tr>
      <td>${e.date ?? "—"}</td>
      <td class="mono">#${e.id ?? "—"}</td>
      <td class="bold">${e.type ?? "—"}</td>
      <td>${e.method ?? "—"}</td>
      <td class="right ${e.credit ? "credit" : "debit"}">${e.credit ? "+" : "−"}₹${Number(e.amount ?? 0).toLocaleString("en-IN")}</td>
      <td><span class="pill">Success</span></td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Statement ${month} — GIR RITUALS</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#3C2A21;font-size:13px;line-height:1.5}
  .print-bar{background:#f9f3e9;border-bottom:1px solid #e3d6c5;padding:10px 40px;display:flex;align-items:center;gap:12px;justify-content:flex-end}
  .print-bar button{padding:8px 20px;background:#7B5233;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer}
  @media print{.print-bar{display:none}}
  .page{max-width:900px;margin:0 auto;padding:48px 40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #f2e9dc}
  .brand{font-size:22px;font-weight:700;color:#7B5233}
  .brand-sub{font-size:11px;color:#9A7B68;letter-spacing:0.08em;text-transform:uppercase;margin-top:2px}
  .stmt-label{text-align:right}
  .stmt-title{font-size:18px;font-weight:700;color:#7B5233}
  .stmt-sub{font-size:11px;color:#9A7B68;margin-top:4px}
  .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;background:#f9f3e9;border-radius:10px;padding:16px 20px;margin-bottom:28px}
  .meta-label{font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9A7B68;margin-bottom:3px}
  .meta-value{font-size:13px;font-weight:600;color:#3C2A21}
  table{width:100%;border-collapse:collapse}
  th{padding:10px 14px;background:#7B5233;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;text-align:left}
  th.right{text-align:right}
  td{padding:10px 14px;font-size:12px;border-bottom:1px solid #f2e9dc;color:#3C2A21}
  tr:nth-child(even) td{background:#fdf9f5}
  .right{text-align:right}
  .mono{font-family:monospace;font-size:11px;opacity:0.65}
  .bold{font-weight:700}
  .credit{color:#2e7d32;font-weight:700}
  .debit{color:#ba1a1a;font-weight:700}
  .pill{display:inline-block;padding:2px 10px;background:#f5dfc8;color:#7B5233;border-radius:99px;font-size:10px;font-weight:700}
  .summary{display:flex;justify-content:flex-end;margin-top:0}
  .summary-box{width:260px;border:1px solid #f2e9dc;border-radius:0 0 10px 10px;overflow:hidden}
  .s-row{display:flex;justify-content:space-between;padding:9px 14px;font-size:12.5px;border-top:1px solid #f2e9dc}
  .s-row:first-child{border-top:none}
  .s-total{background:#7B5233;color:#fff;font-weight:700;padding:11px 14px;display:flex;justify-content:space-between;font-size:13.5px}
  .s-total .lbl{color:rgba(255,255,255,0.75)}
  .net-pos{color:#c8e6c9}
  .net-neg{color:#ffcdd2}
  .footer{margin-top:36px;padding-top:16px;border-top:1px solid #f2e9dc;font-size:11px;color:#9A7B68;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
</style>
</head><body>
<div class="print-bar">
  <span style="font-size:12px;color:#6B5040">Preview your statement, then save as PDF.</span>
  <button onclick="window.print()">⬇ Save as PDF</button>
</div>
<div class="page">
  <div class="header">
    <div><div class="brand">GIR RITUALS</div><div class="brand-sub">Pure · Natural · Daily</div></div>
    <div class="stmt-label"><div class="stmt-title">Account Statement</div><div class="stmt-sub">Period: ${month === "All" ? "All Time" : month}</div></div>
  </div>
  <div class="meta">
    <div><div class="meta-label">Account Holder</div><div class="meta-value">${user?.firstName ?? ""} ${user?.lastName ?? ""}</div></div>
    <div><div class="meta-label">Client ID</div><div class="meta-value">${user?.clientId ?? "—"}</div></div>
    <div><div class="meta-label">Generated On</div><div class="meta-value">${today}</div></div>
  </div>
  <table>
    <thead><tr>
      <th>Date</th><th>Transaction ID</th><th>Description</th><th>Method</th>
      <th class="right">Amount</th><th>Status</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="6" style="text-align:center;padding:20px;color:#9A7B68;font-style:italic">No transactions found.</td></tr>`}</tbody>
  </table>
  <div class="summary">
    <div class="summary-box">
      <div class="s-row"><span>Total Credits</span><span class="credit">+₹${entries.filter(e=>e.credit).reduce((s,e)=>s+Number(e.amount),0).toLocaleString("en-IN")}</span></div>
      <div class="s-row"><span>Total Debits</span><span class="debit">−₹${entries.filter(e=>!e.credit).reduce((s,e)=>s+Number(e.amount),0).toLocaleString("en-IN")}</span></div>
      <div class="s-total"><span class="lbl">Net Balance</span><span class="${total>=0?"net-pos":"net-neg"}">${total>=0?"+":"−"}₹${Math.abs(total).toLocaleString("en-IN")}</span></div>
    </div>
  </div>
  <div class="footer">
    <div>GIR RITUALS · support@girrituals.com · +91 98765 43210<br/>Gir Forest Region, Gujarat, India</div>
    <div>This is a system-generated statement. No signature required.</div>
  </div>
</div>
</body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
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
  const { bills, statementEntries, payBill, user } = useApp();
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

  const handleDownload = (bill) => generateInvoice(bill, user);
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
                <BillCard key={b.id} bill={b} onPay={handlePayBill} onDownload={() => handleDownload(b)} />
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
                <BillCard key={b.id} bill={b} onDownload={() => handleDownload(b)} />
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
                onClick={() => generateStatementPdf(filteredStatements, filterMonth, user)}
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
