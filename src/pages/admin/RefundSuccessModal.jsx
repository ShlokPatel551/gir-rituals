import "./RefundSuccessModal.css";

const METHOD_META = {
  upi:  { label: "UPI transfer",  refLabel: "UPI reference (UTR)",              badgeCls: "rsm-badge-blue" },
  cash: { label: "Cash",          refLabel: "Reference / Note",                  badgeCls: "rsm-badge-amber" },
  bank: { label: "Bank transfer", refLabel: "Transaction reference (UTR/IMPS)",  badgeCls: "rsm-badge-blue" },
};

const ROTATE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const CHECK_ICON = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const MSG_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

function RefundSuccessModal({ refund, confirmedData, onClose, onViewRecord }) {
  const { method, paymentRef, refundedAt } = confirmedData;
  const meta = METHOD_META[method] ?? METHOD_META.upi;

  return (
    <div
      className="rsm-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="rsm-modal">

        {/* ── Header ── */}
        <header className="rsm-header">
          <div className="rsm-header-left">
            {ROTATE_ICON}
            <h1 className="rsm-title">Refund completed</h1>
          </div>
          <button type="button" className="rsm-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </header>

        {/* ── Success ── */}
        <section className="rsm-success">
          <div className="rsm-check-outer">
            <div className="rsm-check-inner">
              {CHECK_ICON}
            </div>
          </div>
          <h2 className="rsm-amount">₹{refund.amount} refunded</h2>
          <p className="rsm-recipient">to {refund.name} — {refund.customerId}</p>
        </section>

        {/* ── Details ── */}
        <section className="rsm-details">
          <hr className="rsm-hr" />
          <div className="rsm-rows">
            <div className="rsm-row">
              <span className="rsm-row-label">Order</span>
              <span className="rsm-row-value">{refund.orderId} • {refund.product}</span>
            </div>
            <div className="rsm-row">
              <span className="rsm-row-label">Refund method</span>
              <span className={`rsm-badge ${meta.badgeCls}`}>{meta.label}</span>
            </div>
            {paymentRef && (
              <div className="rsm-row">
                <span className="rsm-row-label">{meta.refLabel}</span>
                <span className="rsm-row-value rsm-row-mono">{paymentRef}</span>
              </div>
            )}
            <div className="rsm-row">
              <span className="rsm-row-label">Date of refund</span>
              <span className="rsm-row-value">{refundedAt}</span>
            </div>
            <div className="rsm-row">
              <span className="rsm-row-label">Processed by</span>
              <span className="rsm-row-value">Admin</span>
            </div>
          </div>

          <div className="rsm-notif-banner">
            <span className="rsm-notif-icon">{MSG_ICON}</span>
            <p>Customer notified via WhatsApp and SMS with refund confirmation and reference number.</p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="rsm-footer">
          <button
            type="button"
            className="rsm-btn-outline"
            onClick={onViewRecord ?? onClose}
          >
            View refund record
          </button>
          <button
            type="button"
            className="rsm-btn-filled"
            onClick={onClose}
          >
            Back to refunds
          </button>
        </footer>

      </div>
    </div>
  );
}

export { RefundSuccessModal };
