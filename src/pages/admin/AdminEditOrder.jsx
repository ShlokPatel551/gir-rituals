import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminEditOrder.css";

const PRODUCTS    = ["A2 Gir Cow Milk", "A2 Desi Ghee", "Organic Paneer", "Buffalo Milk", "Fresh Curd"];
const FREQUENCIES = ["Daily — every day", "Alternate days", "Twice a week", "Custom"];
const PAY_METHODS = ["Monthly bill", "Prepaid Wallet", "Weekly Settlement"];
const PAUSE_REASONS  = ["Customer requested", "Out of stock", "Delivery boy leave", "Other"];
const CANCEL_REASONS = ["Customer moving out", "Quality issues", "Pricing concerns", "Found alternative"];

const STATUS_OPTIONS = [
  { key: "delivered",        icon: "check_circle",  label: "Delivered",        sub: "Mark as delivered",   color: "primary"    },
  { key: "pending",          icon: "schedule",       label: "Pending",          sub: "Awaiting delivery",   color: "secondary"  },
  { key: "out_for_delivery", icon: "local_shipping", label: "Out for delivery", sub: "On the way",          color: "primary"    },
  { key: "paused",           icon: "pause_circle",   label: "Paused",           sub: "Customer paused",     color: "muted"      },
  { key: "cancelled",        icon: "cancel",         label: "Cancelled",        sub: "Cancel this order",   color: "error"      },
  { key: "resume",           icon: "cached",         label: "Resume",           sub: "Resume paused order", color: "secondary"  },
];

function fmt(n) {
  return n.toLocaleString("en-IN");
}

function AdminEditOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const orderId = id ?? "ORD-92831";

  const [product,       setProduct]       = useState("A2 Gir Cow Milk");
  const [qty,           setQty]           = useState(2);
  const [frequency,     setFrequency]     = useState("Daily — every day");
  const [payMethod,     setPayMethod]     = useState("Monthly bill");
  const [address,       setAddress]       = useState("Navrangpura, Ahmedabad — 380009");
  const [adminNotes,    setAdminNotes]    = useState("");
  const [status,        setStatus]        = useState("delivered");
  const [pauseDate,     setPauseDate]     = useState("2026-06-07");
  const [pauseReason,   setPauseReason]   = useState("Customer requested");
  const [pauseDates,    setPauseDates]    = useState([]);
  const [cancelReason,  setCancelReason]  = useState("");

  const rate    = 68;
  const monthly = rate * qty * 30;

  function addPauseDate() {
    if (pauseDate && !pauseDates.find(p => p.date === pauseDate)) {
      setPauseDates(prev => [...prev, { date: pauseDate, reason: pauseReason }]);
    }
  }

  function removePauseDate(i) {
    setPauseDates(prev => prev.filter((_, j) => j !== i));
  }

  return (
    <div className="eo-page">

      {/* ── Breadcrumb ── */}
      <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#9aa3a0", marginBottom: 4 }}>
        <Link to="/admin/orders" style={{ color: "#414844", fontWeight: 600, textDecoration: "none" }}>Orders</Link>
        <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>chevron_right</span>
        <Link to={`/admin/orders/${orderId}`} style={{ color: "#414844", fontWeight: 600, textDecoration: "none" }}>#{orderId}</Link>
        <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>chevron_right</span>
        <span>Edit</span>
      </nav>

      {/* ── Title ── */}
      <div className="eo-title-section">
        <h2 className="eo-page-title">Edit order — #{orderId}</h2>
        <p className="eo-page-sub">Aditi Sharma (CLT-0041) • A2 Gir Cow Milk Subscription</p>
      </div>

      {/* ── Alert ── */}
      <div className="eo-alert">
        <span className="material-symbols-outlined">info</span>
        <p>
          <strong>Changes to quantity or product apply from tomorrow onwards.</strong> Today's delivery is already processed. Changing status affects the current day only unless specified.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="eo-layout">

        {/* Left: Form */}
        <div className="eo-left">
          <div className="eo-card">
            <div className="eo-card-head">
              <span className="material-symbols-outlined">assignment</span>
              <h3 className="eo-card-title">Order details — editable</h3>
            </div>
            <div className="eo-card-body">

              {/* Read-only row */}
              <div className="eo-grid-3">
                <div className="eo-field">
                  <label className="eo-label eo-label-muted">Order ID — cannot edit</label>
                  <input type="text" className="eo-input eo-input-disabled" value={`#${orderId}`} disabled />
                </div>
                <div className="eo-field">
                  <label className="eo-label eo-label-muted">Customer — cannot edit</label>
                  <input type="text" className="eo-input eo-input-disabled" value="Aditi Sharma (CLT-0041)" disabled />
                </div>
                <div className="eo-field">
                  <label className="eo-label eo-label-muted">Order type — cannot edit</label>
                  <input type="text" className="eo-input eo-input-disabled" value="Subscription — Daily" disabled />
                </div>
              </div>

              {/* Editable row */}
              <div className="eo-grid-3">
                <div className="eo-field">
                  <label className="eo-label eo-label-primary">Product <span className="eo-required">*</span></label>
                  <div className="eo-select-wrap">
                    <select className="eo-input eo-select" value={product} onChange={e => setProduct(e.target.value)}>
                      {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <span className="material-symbols-outlined eo-sel-arrow">expand_more</span>
                  </div>
                  <p className="eo-hint">Changing product takes effect from tomorrow.</p>
                </div>
                <div className="eo-field">
                  <label className="eo-label eo-label-primary">Quantity per delivery (L) <span className="eo-required">*</span></label>
                  <input
                    type="number"
                    className="eo-input"
                    value={qty}
                    min={1}
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <p className="eo-hint">Current: {qty}L/day. Change applies from tomorrow.</p>
                </div>
                <div className="eo-field">
                  <label className="eo-label eo-label-primary">Frequency <span className="eo-required">*</span></label>
                  <div className="eo-select-wrap">
                    <select className="eo-input eo-select" value={frequency} onChange={e => setFrequency(e.target.value)}>
                      {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <span className="material-symbols-outlined eo-sel-arrow">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Auto-calculated display */}
              <div className="eo-grid-2">
                <div className="eo-field">
                  <label className="eo-label eo-label-muted">Subscription rate (₹/L)</label>
                  <div className="eo-display-field">₹{rate} / litre</div>
                  <p className="eo-hint">Rate is set in Products section.</p>
                </div>
                <div className="eo-field">
                  <label className="eo-label eo-label-muted">Monthly amount — auto</label>
                  <div className="eo-display-field">₹{fmt(monthly)} / month</div>
                  <p className="eo-hint">{rate} × {qty}L × 30 = ₹{fmt(monthly)}</p>
                </div>
              </div>

              {/* Payment */}
              <div className="eo-field">
                <label className="eo-label eo-label-primary">Payment method</label>
                <div className="eo-select-wrap">
                  <select className="eo-input eo-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    {PAY_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <span className="material-symbols-outlined eo-sel-arrow">expand_more</span>
                </div>
              </div>

              {/* Address */}
              <div className="eo-field">
                <label className="eo-label eo-label-primary">Delivery address</label>
                <textarea
                  className="eo-input eo-textarea"
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>

              {/* Admin notes */}
              <div className="eo-field">
                <label className="eo-label eo-label-primary">
                  Admin notes{" "}
                  <span className="eo-label-internal">(internal only — customer cannot see)</span>
                </label>
                <textarea
                  className="eo-input eo-textarea"
                  rows={3}
                  placeholder="Add any note about this order change..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                />
              </div>

            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="eo-right">

          {/* Status */}
          <div className="eo-card">
            <div className="eo-card-head">
              <span className="material-symbols-outlined">sync</span>
              <h3 className="eo-card-title">Update order status</h3>
            </div>
            <div className="eo-card-body">
              <p className="eo-status-hint">
                Current status: <strong className="eo-status-current">Delivered</strong> • Select new status if needed:
              </p>
              <div className="eo-status-grid">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s.key}
                    type="button"
                    className={`eo-status-card${status === s.key ? " eo-status-active" : ""}`}
                    onClick={() => setStatus(s.key)}
                  >
                    <span className={`material-symbols-outlined eo-status-icon eo-icon-${s.color}`}>{s.icon}</span>
                    <p className={`eo-status-label${status === s.key ? " eo-status-label-active" : ""}`}>{s.label}</p>
                    <p className="eo-status-sub">{s.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pause dates */}
          <div className="eo-card">
            <div className="eo-card-head">
              <span className="material-symbols-outlined">calendar_today</span>
              <h3 className="eo-card-title">Pause or cancel specific dates</h3>
            </div>
            <div className="eo-card-body">

              <div className="eo-field">
                <label className="eo-label eo-label-muted">Pause delivery for specific date(s)</label>
                <input
                  type="date"
                  className="eo-input"
                  value={pauseDate}
                  onChange={e => setPauseDate(e.target.value)}
                />
                <p className="eo-hint">Delivery will not happen on this date. Customer is not charged.</p>
              </div>

              <div className="eo-field">
                <label className="eo-label eo-label-muted">Reason for pause</label>
                <div className="eo-select-wrap">
                  <select className="eo-input eo-select" value={pauseReason} onChange={e => setPauseReason(e.target.value)}>
                    {PAUSE_REASONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <span className="material-symbols-outlined eo-sel-arrow">expand_more</span>
                </div>
              </div>

              {pauseDates.length > 0 && (
                <div className="eo-pause-list">
                  {pauseDates.map((p, i) => (
                    <div key={i} className="eo-pause-tag">
                      <span className="material-symbols-outlined">event_busy</span>
                      <span className="eo-pause-date">{p.date}</span>
                      <span className="eo-pause-reason">({p.reason})</span>
                      <button type="button" className="eo-pause-remove" onClick={() => removePauseDate(i)}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button type="button" className="eo-add-pause-btn" onClick={addPauseDate}>
                <span className="material-symbols-outlined">add_circle</span>
                Add pause date
              </button>

            </div>
          </div>

          {/* Danger zone */}
          <div className="eo-card eo-card-danger">
            <div className="eo-card-head eo-card-head-danger">
              <span className="material-symbols-outlined">report_problem</span>
              <h3 className="eo-card-title eo-card-title-danger">Cancel this order permanently</h3>
            </div>
            <div className="eo-card-body">
              <p className="eo-danger-desc">
                Cancelling will stop all future deliveries. If customer has already paid for this month, a refund will be initiated.
              </p>

              <div className="eo-field">
                <label className="eo-label eo-label-error">
                  Reason for cancellation <span className="eo-required">*</span>
                </label>
                <div className="eo-select-wrap">
                  <select
                    className="eo-input eo-select eo-select-error"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                  >
                    <option value="" disabled>Select reason...</option>
                    {CANCEL_REASONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <span className="material-symbols-outlined eo-sel-arrow">expand_more</span>
                </div>
              </div>

              <button type="button" className="eo-cancel-order-btn">
                <span className="material-symbols-outlined">delete_forever</span>
                Cancel this order
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky footer ── */}
      <footer className="eo-footer">
        <div className="eo-footer-meta">
          <span className="material-symbols-outlined">info</span>
          Last saved: 1 Oct 2023 — By: Admin (owner)
        </div>
        <div className="eo-footer-actions">
          <button type="button" className="eo-discard-btn" onClick={() => navigate(`/admin/orders/${orderId}`)}>
            <span className="material-symbols-outlined">close</span>
            Discard changes
          </button>
          <button type="button" className="eo-save-btn">
            <span className="material-symbols-outlined">save</span>
            Save changes
          </button>
        </div>
      </footer>

    </div>
  );
}

export { AdminEditOrder };
