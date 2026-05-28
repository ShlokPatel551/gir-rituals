import { Link, useParams } from "react-router-dom";
import { offers } from "../data/mockData";
import { useToast } from "../context/ToastContext";
function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
}
function isExpired(dateStr, upcoming) {
  if (upcoming) return false;
  return daysUntil(dateStr) < 0;
}
function Offers() {
  const { showToast } = useToast();
  const handleCopy = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code).catch(() => {
    });
    showToast(`Code "${code}" copied!`);
  };
  return <div>
      <h1 className="page-title">Offers</h1>

      {offers.map((o) => {
    const days = daysUntil(o.validUntil);
    const expired = isExpired(o.validUntil, o.upcoming);
    return <Link
      key={o.id}
      to={`/offers/${o.id}`}
      className="card"
      style={{
        display: "block",
        marginBottom: "0.75rem",
        opacity: expired ? 0.55 : 1,
        pointerEvents: expired ? "none" : "auto"
      }}
    >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <strong>{o.title}</strong>
              {expired ? <span className="badge badge-paused">Expired</span> : o.upcoming ? <span className="badge badge-pending">Coming Soon</span> : days <= 7 ? <span className="badge badge-unpaid">Ends in {days}d</span> : null}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.5rem 0" }}>
              {o.description}
            </p>

            {
      /* Promo code */
    }
            {o.promoCode && !expired && !o.upcoming && <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.75rem",
        background: "var(--md-primary-container)",
        borderRadius: "var(--md-radius-sm)",
        marginBottom: "0.5rem"
      }}
    >
                <span style={{ fontSize: "0.75rem", color: "var(--md-on-surface-variant)" }}>Promo code</span>
                <strong style={{ fontFamily: "monospace", fontSize: "0.9rem", color: "var(--green-900)", letterSpacing: "0.05em" }}>
                  {o.promoCode}
                </strong>
                <button
      type="button"
      onClick={(e) => handleCopy(o.promoCode, e)}
      style={{
        marginLeft: "auto",
        background: "var(--md-primary)",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "0.2rem 0.6rem",
        fontSize: "0.75rem",
        cursor: "pointer",
        fontFamily: "inherit"
      }}
    >
                  Copy
                </button>
              </div>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: expired ? "var(--text-muted)" : "var(--green-700)" }}>
                {expired ? "Expired" : `Valid until ${o.validUntil}`}
              </span>
              {o.upcoming && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Starts in {days} days
                </span>}
            </div>
          </Link>;
  })}
    </div>;
}
function OfferDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const offer = offers.find((o) => o.id === id);
  if (!offer) return <p>Offer not found</p>;
  const days = daysUntil(offer.validUntil);
  const expired = isExpired(offer.validUntil, offer.upcoming);
  const handleCopy = () => {
    if (!offer.promoCode) return;
    navigator.clipboard.writeText(offer.promoCode).catch(() => {
    });
    showToast(`Code "${offer.promoCode}" copied!`);
  };
  return <div>
      <Link to="/offers" className="btn btn-ghost" style={{ marginBottom: "1rem", display: "inline-block" }}>← Back</Link>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
          <h1 className="page-title" style={{ margin: 0 }}>{offer.title}</h1>
          {expired ? <span className="badge badge-paused">Expired</span> : offer.upcoming ? <span className="badge badge-pending">Coming Soon</span> : <span className="badge badge-delivered">Active</span>}
        </div>
        <p style={{ marginBottom: "1rem" }}>{offer.description}</p>

        <div style={{ padding: "0.75rem", background: expired ? "var(--md-surface-container)" : "var(--md-primary-container)", borderRadius: 8, marginBottom: "1rem" }}>
          {expired ? <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
              This offer has expired.
            </p> : offer.upcoming ? <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--green-700)", fontWeight: 600 }}>
              ⏰ Starts in {days} days — Save the date!
            </p> : <p style={{ margin: 0, fontSize: "0.9rem", color: days <= 7 ? "#b45309" : "var(--green-700)", fontWeight: 600 }}>
              {days <= 7 ? `\u26A0\uFE0F Ends in ${days} days \u2014 Hurry!` : `\u2705 Valid until ${offer.validUntil}`}
            </p>}
        </div>

        {
    /* Promo code block */
  }
        {offer.promoCode && !expired && !offer.upcoming && <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Apply this code at checkout:</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", background: "var(--md-surface-container)", borderRadius: "var(--md-radius-sm)", border: "1px dashed var(--border)" }}>
              <strong style={{ fontFamily: "monospace", fontSize: "1.125rem", letterSpacing: "0.08em", color: "var(--green-900)", flex: 1 }}>
                {offer.promoCode}
              </strong>
              <button
    type="button"
    className="btn btn-secondary"
    style={{ fontSize: "0.8rem", padding: "0.375rem 0.875rem" }}
    onClick={handleCopy}
  >
                Copy Code
              </button>
            </div>
          </div>}

        {!offer.upcoming && !expired && <Link to="/products" className="btn btn-primary" style={{ display: "inline-block" }}>
            Shop Now
          </Link>}
      </div>
    </div>;
}
export {
  OfferDetail,
  Offers
};
