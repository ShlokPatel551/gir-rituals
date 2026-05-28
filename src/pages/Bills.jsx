import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { billLineItems } from "../data/mockData";
import { useToast } from "../context/ToastContext";
const statementTypeLabel = {
  delivery: "\u{1F4E6} Delivery",
  extra: "\u2795 Extra Order",
  pause: "\u23F8 Paused",
  payment: "\u2705 Payment",
  refund: "\u21A9 Refund",
  store_credit: "\u{1F4B3} Store Credit"
};
function Bills() {
  const { bills, statementEntries, walletBalance, addWalletCredit, payBill } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState("unpaid");
  const [expandedBill, setExpandedBill] = useState(null);
  const [filterMonth, setFilterMonth] = useState("All");
  const [selectedBills, setSelectedBills] = useState(/* @__PURE__ */ new Set());
  const paid = bills.filter((b) => b.status === "paid");
  const unpaid = bills.filter((b) => b.status === "unpaid");
  const availableMonths = ["All", ...Array.from(new Set(statementEntries.map((e) => e.month)))];
  const filteredStatements = filterMonth === "All" ? statementEntries : statementEntries.filter((e) => e.month === filterMonth);
  const statementsWithBalance = filteredStatements.reduce((acc, entry) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    const delta = entry.credit ? entry.amount : -entry.amount;
    acc.push({ entry, balance: prev + delta });
    return acc;
  }, []);
  const toggleBillSelection = (id) => {
    setSelectedBills((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const bulkTotal = unpaid.filter((b) => selectedBills.has(b.id)).reduce((s, b) => s + b.amount, 0);
  const handleBulkPay = () => {
    selectedBills.forEach((id) => payBill(id));
    showToast(`Paid ${selectedBills.size} bill(s) \u2014 \u20B9${bulkTotal.toFixed(2)} total.`);
    setSelectedBills(/* @__PURE__ */ new Set());
  };
  return <div>
      <h1 className="page-title">My Bills</h1>

      {
    /* Wallet card */
  }
      {walletBalance > 0 && <div className="card" style={{ marginBottom: "1rem", background: "var(--md-primary-container)", border: "1px solid transparent" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Wallet Balance</strong>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--green-700)", margin: 0 }}>₹{walletBalance.toFixed(2)}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>Use at checkout · Valid 6 months</p>
            </div>
            <span style={{ fontSize: "2rem" }}>💳</span>
          </div>
        </div>}

      <div className="tabs">
        <button type="button" className={`tab ${tab === "paid" ? "active" : ""}`} onClick={() => setTab("paid")}>Paid</button>
        <button type="button" className={`tab ${tab === "unpaid" ? "active" : ""}`} onClick={() => setTab("unpaid")}>
          Unpaid {unpaid.length > 0 && `(${unpaid.length})`}
        </button>
        <button type="button" className={`tab ${tab === "statement" ? "active" : ""}`} onClick={() => setTab("statement")}>Statement</button>
      </div>

      {
    /* ── Paid tab ── */
  }
      {tab === "paid" && <>
          {paid.length === 0 && <div className="empty-state card"><p>No paid bills yet.</p></div>}
          {paid.map((b) => <div key={b.id} className="card" style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{b.period}</strong>
                <span className="badge badge-delivered">Paid</span>
              </div>
              <p style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>₹{b.amount.toFixed(2)} · {b.paidDate} · {b.method}</p>
              <button
    type="button"
    className="btn btn-secondary"
    style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}
    onClick={() => showToast("Invoice download requires backend.", "info")}
  >
                Download Invoice
              </button>
            </div>)}
        </>}

      {
    /* ── Unpaid tab ── */
  }
      {tab === "unpaid" && <>
          {unpaid.length === 0 && <div className="empty-state card"><p>No pending bills. You're all clear! ✅</p></div>}

          {
    /* Bulk pay bar */
  }
          {unpaid.length > 1 && <div className="card" style={{ marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", background: "var(--md-surface-container)" }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
                  {selectedBills.size > 0 ? `${selectedBills.size} selected \u2014 \u20B9${bulkTotal.toFixed(2)}` : "Select bills to pay together"}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Bulk Pay saves time</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
    type="button"
    className="btn btn-secondary"
    style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
    onClick={() => {
      if (selectedBills.size === unpaid.length) setSelectedBills(/* @__PURE__ */ new Set());
      else setSelectedBills(new Set(unpaid.map((b) => b.id)));
    }}
  >
                  {selectedBills.size === unpaid.length ? "Deselect All" : "Select All"}
                </button>
                {selectedBills.size > 0 && <button
    type="button"
    className="btn btn-primary"
    style={{ fontSize: "0.8rem", padding: "0.4rem 0.875rem" }}
    onClick={handleBulkPay}
  >
                    Pay Selected
                  </button>}
              </div>
            </div>}

          {unpaid.map((b) => {
    const lineItems = billLineItems[b.id] ?? [];
    const isExpanded = expandedBill === b.id;
    const isSelected = selectedBills.has(b.id);
    return <div
      key={b.id}
      className="card"
      style={{
        marginBottom: "0.75rem",
        borderLeft: isSelected ? "4px solid var(--md-primary)" : "4px solid transparent"
      }}
    >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", flex: 1 }}>
                    {unpaid.length > 1 && <input
      type="checkbox"
      checked={isSelected}
      onChange={() => toggleBillSelection(b.id)}
    />}
                    <strong>{b.period}</strong>
                  </label>
                  <span className="badge badge-unpaid">Unpaid</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Due: {b.dueDate}</p>
                <p style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0.5rem 0", color: "var(--green-700)" }}>₹{b.amount.toFixed(2)}</p>

                {lineItems.length > 0 && <>
                    <button
      type="button"
      className="btn btn-ghost"
      style={{ padding: "0.25rem 0", fontSize: "0.85rem", marginBottom: "0.25rem" }}
      onClick={() => setExpandedBill(isExpanded ? null : b.id)}
    >
                      {isExpanded ? "Hide breakdown \u25B2" : "View itemized breakdown \u25BC"}
                    </button>
                    {isExpanded && <table style={{ width: "100%", fontSize: "0.82rem", borderCollapse: "collapse", marginBottom: "0.5rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                            <th style={{ padding: "0.3rem 0" }}>Item</th>
                            <th style={{ textAlign: "right" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, i) => <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                              <td style={{ padding: "0.35rem 0" }}>{item.description}</td>
                              <td style={{ textAlign: "right", fontWeight: 600 }}>₹{item.amount.toFixed(2)}</td>
                            </tr>)}
                        </tbody>
                      </table>}
                  </>}

                <Link
      to={`/payment?amount=${b.amount}&billId=${b.id}`}
      className="btn btn-primary"
      style={{ display: "block", textAlign: "center" }}
    >
                  Pay Now
                </Link>
              </div>;
  })}
        </>}

      {
    /* ── Statement tab ── */
  }
      {tab === "statement" && <div>
          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Filter:</label>
            <select
    value={filterMonth}
    onChange={(e) => setFilterMonth(e.target.value)}
    style={{ fontSize: "0.85rem", padding: "0.25rem 0.5rem", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "inherit" }}
  >
              {availableMonths.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <button
    type="button"
    className="btn btn-secondary"
    style={{ fontSize: "0.8rem", marginLeft: "auto" }}
    onClick={() => showToast("PDF download requires backend.", "info")}
  >
              Download PDF
            </button>
          </div>

          {
    /* Statement table with running balance */
  }
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {statementsWithBalance.length === 0 && <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)" }}>No transactions found.</p>}
            {
    /* Table header */
  }
            {statementsWithBalance.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "0.5rem", padding: "0.5rem 1rem", borderBottom: "1px solid var(--border)", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <span>Transaction</span>
                <span style={{ textAlign: "right" }}>Debit</span>
                <span style={{ textAlign: "right" }}>Credit</span>
                <span style={{ textAlign: "right" }}>Balance</span>
              </div>}
            {statementsWithBalance.map(({ entry, balance }, i) => <div
    key={entry.id}
    style={{
      display: "grid",
      gridTemplateColumns: "1fr auto auto auto",
      gap: "0.5rem",
      alignItems: "center",
      padding: "0.75rem 1rem",
      borderBottom: i < statementsWithBalance.length - 1 ? "1px solid var(--border)" : "none"
    }}
  >
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: "0.875rem" }}>{statementTypeLabel[entry.type] ?? entry.type}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>{entry.date}</p>
                </div>
                <span style={{ fontSize: "0.875rem", color: "var(--md-error)", fontWeight: 600, textAlign: "right", minWidth: 64 }}>
                  {!entry.credit && entry.amount > 0 ? `\u20B9${entry.amount.toFixed(0)}` : "\u2014"}
                </span>
                <span style={{ fontSize: "0.875rem", color: "var(--green-700)", fontWeight: 600, textAlign: "right", minWidth: 64 }}>
                  {entry.credit && entry.amount > 0 ? `\u20B9${entry.amount.toFixed(0)}` : "\u2014"}
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, textAlign: "right", minWidth: 72, color: balance >= 0 ? "var(--green-700)" : "var(--md-error)" }}>
                  ₹{Math.abs(balance).toFixed(0)}
                </span>
              </div>)}
          </div>

          <div className="card" style={{ marginTop: "1rem", background: "var(--md-primary-container)" }}>
            <strong>Refund → Store Credit</strong>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.25rem 0 0.75rem" }}>
              Received a refund? Add it to your wallet for instant use on future orders.
            </p>
            <button
    type="button"
    className="btn btn-secondary"
    onClick={() => {
      addWalletCredit(140);
      showToast("\u20B9140 store credit added to your wallet!");
    }}
  >
              + Add Demo Store Credit (₹140)
            </button>
          </div>
        </div>}
    </div>;
}
export {
  Bills
};
