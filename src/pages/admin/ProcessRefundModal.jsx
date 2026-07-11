import { useState } from "react";
import "./ProcessRefundModal.css";

const METHODS = [
  { key: "cash", icon: "💵", label: "Cash",          desc: "Handed over by delivery boy" },
  { key: "upi",  icon: "📱", label: "UPI transfer",  desc: "Admin transfers manually" },
  { key: "bank", icon: "🏦", label: "Bank transfer", desc: "Direct to customer's account" },
];

const CAL_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const INFO_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

function ProcessRefundModal({ refund, onClose, onConfirm }) {
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");

  const [method,    setMethod]    = useState("cash");
  const [reference, setReference] = useState("");
  const [upiId,     setUpiId]     = useState(refund.upiId ?? "");
  const [utrNumber, setUtrNumber] = useState("");
  const [date,      setDate]      = useState(today);

  const [bankAccountName,   setBankAccountName]   = useState(refund.bankAccountName ?? refund.name ?? "");
  const [bankAccountNumber, setBankAccountNumber] = useState(refund.bankAccountNumber ?? "");
  const [bankIfsc,          setBankIfsc]          = useState(refund.bankIfsc ?? "");
  const [bankTxnRef,        setBankTxnRef]        = useState("");

  const handleSubmit = () => {
    const paymentRef = method === "upi"  ? utrNumber
      : method === "bank" ? bankTxnRef
      : reference;
    onConfirm({
      method,
      paymentRef,
      refundPaymentMethod: METHODS.find(m => m.key === method)?.label ?? method,
      refundedAt: date,
      notificationSent: true,
    });
  };

  return (
    <div
      className="prm-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="prm-modal">

        {/* ── Header ── */}
        <header className="prm-header">
          <div className="prm-header-left">
            <div className="prm-icon-box">
              <div className="prm-icon-dot" />
            </div>
            <h1 className="prm-title">Process refund payment</h1>
          </div>
          <button type="button" className="prm-close" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </header>

        {/* ── Customer banner ── */}
        <section className="prm-banner">
          <div>
            <h2 className="prm-banner-name">{refund.name} — {refund.customerId}</h2>
            <p className="prm-banner-meta">
              {refund.orderId} • {refund.product} • Approved {refund.approvedAt ?? "—"}
            </p>
          </div>
          <span className="prm-banner-amount">₹{refund.amount}</span>
        </section>

        {/* ── Form body ── */}
        <div className="prm-body">

          {/* Refund method */}
          <div className="prm-group">
            <p className="prm-label">Refund Method</p>
            <div className="prm-methods">
              {METHODS.map(m => (
                <label
                  key={m.key}
                  className={`prm-method${method === m.key ? " prm-method-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="refund_method"
                    value={m.key}
                    checked={method === m.key}
                    onChange={() => setMethod(m.key)}
                    className="prm-radio-sr"
                  />
                  <span className={`prm-radio${method === m.key ? " prm-radio-checked" : ""}`} />
                  <span className="prm-method-icon">{m.icon}</span>
                  <span>
                    <span className="prm-method-label">{m.label}</span>
                    <span className="prm-method-desc">{m.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Cash fields ── */}
          {method === "cash" && (
            <>
              <div className="prm-group">
                <label className="prm-label" htmlFor="prm-ref">Reference / Note *</label>
                <input
                  id="prm-ref"
                  type="text"
                  className="prm-input"
                  placeholder="Enter reference note..."
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                />
              </div>
              <div className="prm-group">
                <label className="prm-label" htmlFor="prm-date-cash">Date of Refund *</label>
                <div className="prm-input-wrap">
                  <input
                    id="prm-date-cash"
                    type="text"
                    className="prm-input"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                  <span className="prm-input-icon">{CAL_ICON}</span>
                </div>
              </div>
            </>
          )}

          {/* ── UPI fields ── */}
          {method === "upi" && (
            <>
              <div className="prm-group">
                <label className="prm-label" htmlFor="prm-upi">Customer's UPI ID</label>
                <input
                  id="prm-upi"
                  type="text"
                  className="prm-input prm-input-tinted"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. name@ybl"
                />
                <p className="prm-hint">Auto-filled from customer profile if available, editable</p>
              </div>
              <div className="prm-two-col">
                <div className="prm-group">
                  <label className="prm-label" htmlFor="prm-utr">UPI Reference (UTR) *</label>
                  <input
                    id="prm-utr"
                    type="text"
                    className="prm-input prm-input-tinted"
                    placeholder="12-digit UTR"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value)}
                  />
                </div>
                <div className="prm-group">
                  <label className="prm-label" htmlFor="prm-date-upi">Date of Transfer *</label>
                  <div className="prm-input-wrap">
                    <input
                      id="prm-date-upi"
                      type="text"
                      className="prm-input prm-input-tinted"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                    <span className="prm-input-icon">{CAL_ICON}</span>
                  </div>
                </div>
              </div>
              <div className="prm-info-box">
                <span className="prm-info-icon">{INFO_ICON}</span>
                <p>Find this 12-digit UTR number in your UPI app's transaction history right after sending the payment.</p>
              </div>
            </>
          )}

          {/* ── Bank fields ── */}
          {method === "bank" && (
            <>
              <div className="prm-two-col">
                <div className="prm-group">
                  <label className="prm-label" htmlFor="prm-bank-name">Account Holder Name</label>
                  <input
                    id="prm-bank-name"
                    type="text"
                    className="prm-input prm-input-tinted"
                    value={bankAccountName}
                    onChange={e => setBankAccountName(e.target.value)}
                  />
                </div>
                <div className="prm-group">
                  <label className="prm-label" htmlFor="prm-bank-acc">Account Number</label>
                  <input
                    id="prm-bank-acc"
                    type="text"
                    className="prm-input prm-input-tinted"
                    placeholder="Bank account number"
                    value={bankAccountNumber}
                    onChange={e => setBankAccountNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="prm-two-col">
                <div className="prm-group">
                  <label className="prm-label" htmlFor="prm-bank-ifsc">IFSC Code</label>
                  <input
                    id="prm-bank-ifsc"
                    type="text"
                    className="prm-input prm-input-tinted"
                    placeholder="e.g. HDFC0001234"
                    value={bankIfsc}
                    onChange={e => setBankIfsc(e.target.value)}
                  />
                </div>
                <div className="prm-group">
                  <label className="prm-label" htmlFor="prm-date-bank">Date of Transfer *</label>
                  <div className="prm-input-wrap">
                    <input
                      id="prm-date-bank"
                      type="text"
                      className="prm-input prm-input-tinted"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                    <span className="prm-input-icon">{CAL_ICON}</span>
                  </div>
                </div>
              </div>
              <div className="prm-group">
                <label className="prm-label" htmlFor="prm-bank-txn">Transaction Reference (UTR/IMPS) *</label>
                <input
                  id="prm-bank-txn"
                  type="text"
                  className="prm-input prm-input-tinted"
                  placeholder="e.g. IMPS2026061187654321"
                  value={bankTxnRef}
                  onChange={e => setBankTxnRef(e.target.value)}
                />
              </div>
            </>
          )}

        </div>

        {/* ── Footer ── */}
        <footer className="prm-footer">
          <button type="button" className="prm-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="prm-submit" onClick={handleSubmit}>
            <div className="prm-submit-icon">
              <div className="prm-submit-dot" />
            </div>
            Mark as refunded
          </button>
        </footer>

      </div>
    </div>
  );
}

export { ProcessRefundModal };
