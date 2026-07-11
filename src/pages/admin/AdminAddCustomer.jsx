import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAddOrder.css";

const STATES = [
  "Gujarat", "Maharashtra", "Rajasthan", "Madhya Pradesh",
  "Karnataka", "Delhi", "Uttar Pradesh", "Tamil Nadu",
];

const CUSTOMER_TYPES = [
  { key: "subscription", icon: "calendar_today",  label: "Subscription" },
  { key: "individual",   icon: "shopping_bag",    label: "Individual"   },
  { key: "both",         icon: "loyalty",         label: "Both"         },
];

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
}

function AdminAddCustomer() {
  const navigate = useNavigate();

  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [email,   setEmail]   = useState("");
  const [address, setAddress] = useState("");
  const [city,    setCity]    = useState("");
  const [state,   setState]   = useState("Gujarat");
  const [pincode, setPincode] = useState("");
  const [type,    setType]    = useState("subscription");

  const isValid = name.trim() && phone.trim().length >= 10;

  function handleCreate() {
    navigate("/admin/customers");
  }

  const avatarLabel = name.trim() ? initials(name.trim()) : "?";

  return (
    <div className="aord-page">

      {/* ── Header ── */}
      <div className="aord-header">
        <nav className="aord-breadcrumb">
          <button type="button" className="aord-crumb-link" onClick={() => navigate("/admin/customers")}>Customers</button>
          <span className="material-symbols-outlined aord-crumb-sep">chevron_right</span>
          <span className="aord-crumb-current">Add new customer</span>
        </nav>
        <div className="aord-header-row">
          <div>
            <h2 className="aord-page-title">Add new customer</h2>
            <p className="aord-page-sub">Register a new customer and set their delivery preferences</p>
          </div>
          <button type="button" className="aord-back-btn" onClick={() => navigate("/admin/customers")}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to customers
          </button>
        </div>
      </div>

      <div className="aord-layout">

        {/* ── Left: form steps ── */}
        <div className="aord-steps">

          {/* Step 1 — Personal info */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">1</span>
              <h3 className="aord-step-title">Personal information</h3>
            </div>

            <div className="aord-grid-2" style={{ marginBottom: 20 }}>
              <div className="aord-field">
                <label className="aord-label">Full Name *</label>
                <input
                  type="text"
                  className="aord-input"
                  placeholder="e.g. Priya Shah"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="aord-field">
                <label className="aord-label">Phone Number *</label>
                <div className="aord-icon-right-wrap">
                  <input
                    type="tel"
                    className="aord-input aord-icon-right-input"
                    placeholder="+91 98765 40000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <span className="material-symbols-outlined aord-icon-right">phone</span>
                </div>
              </div>
            </div>

            <div className="aord-field">
              <label className="aord-label">Email Address</label>
              <div className="aord-icon-right-wrap">
                <input
                  type="email"
                  className="aord-input aord-icon-right-input"
                  placeholder="priya.s@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <span className="material-symbols-outlined aord-icon-right">mail</span>
              </div>
            </div>
          </section>

          {/* Step 2 — Address */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">2</span>
              <h3 className="aord-step-title">Delivery address</h3>
            </div>

            <div className="aord-field aord-field-full">
              <label className="aord-label">Address Line</label>
              <input
                type="text"
                className="aord-input"
                placeholder="House / Flat no, Street, Locality"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="aord-grid-2" style={{ marginTop: 20 }}>
              <div className="aord-field">
                <label className="aord-label">City</label>
                <input
                  type="text"
                  className="aord-input"
                  placeholder="e.g. Ahmedabad"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                />
              </div>
              <div className="aord-field">
                <label className="aord-label">State</label>
                <div className="aord-select-wrap">
                  <select className="aord-input aord-select" value={state} onChange={e => setState(e.target.value)}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <span className="material-symbols-outlined aord-sel-arrow">expand_more</span>
                </div>
              </div>
            </div>

            <div className="aord-field" style={{ marginTop: 20 }}>
              <label className="aord-label">Pincode</label>
              <input
                type="text"
                className="aord-input"
                placeholder="e.g. 380001"
                value={pincode}
                maxLength={6}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ""))}
                style={{ maxWidth: 200 }}
              />
            </div>
          </section>

          {/* Step 3 — Customer type */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">3</span>
              <h3 className="aord-step-title">Order preference</h3>
            </div>

            <div className="aord-type-grid">
              {CUSTOMER_TYPES.map(t => {
                const active = type === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    className={`aord-type-btn${active ? " aord-type-active" : " aord-type-inactive"}`}
                    onClick={() => setType(t.key)}
                  >
                    <span className={`material-symbols-outlined aord-type-icon${active ? " aord-type-icon-active" : ""}`}>
                      {t.icon}
                    </span>
                    <span className={`aord-type-label${active ? " aord-type-label-active" : ""}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {type === "subscription" && (
              <div className="aord-callout aord-callout-info">
                <span className="material-symbols-outlined">info</span>
                <p>Subscription customers receive daily deliveries and are billed monthly.</p>
              </div>
            )}
            {type === "individual" && (
              <div className="aord-callout aord-callout-amber">
                <span className="material-symbols-outlined">warning</span>
                <p>Individual customers place one-off orders. Each order requires separate payment.</p>
              </div>
            )}
            {type === "both" && (
              <div className="aord-callout aord-callout-info">
                <span className="material-symbols-outlined">info</span>
                <p>Customer can place both subscription and individual orders.</p>
              </div>
            )}
          </section>

        </div>

        {/* ── Right: sidebar preview ── */}
        <aside className="aord-sidebar">
          <div className="aord-summary-card">
            <h4 className="aord-summary-title">
              <span className="material-symbols-outlined aord-summary-icon">person</span>
              Customer preview
            </h4>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, paddingBottom: 20, borderBottom: "1px solid rgba(193,200,194,0.3)", marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "var(--admin-primary)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.25rem", fontWeight: 700,
              }}>
                {avatarLabel}
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem", color: "#1c1b1b", textAlign: "center" }}>
                {name.trim() || <span style={{ color: "#c0c8c4", fontStyle: "italic", fontWeight: 400 }}>No name</span>}
              </p>
            </div>

            <div className="aord-summary-rows">
              <div className="aord-summary-row">
                <p className="aord-sum-key">Phone</p>
                <p className="aord-sum-val">{phone.trim() || <span className="aord-sum-empty">—</span>}</p>
              </div>
              <div className="aord-summary-row">
                <p className="aord-sum-key">Email</p>
                <p className="aord-sum-val">{email.trim() || <span className="aord-sum-empty">—</span>}</p>
              </div>
              <div className="aord-summary-row">
                <p className="aord-sum-key">City / State</p>
                <p className="aord-sum-val">
                  {city.trim() ? `${city.trim()}, ${state}` : state}
                </p>
              </div>
              <div className="aord-summary-row">
                <p className="aord-sum-key">Order preference</p>
                <p className="aord-sum-val">{CUSTOMER_TYPES.find(t => t.key === type)?.label}</p>
              </div>
            </div>
          </div>

          <div className="aord-actions">
            <button type="button" className="aord-confirm-btn" disabled={!isValid} onClick={handleCreate}>
              <span className="material-symbols-outlined">person_add</span>
              Create customer
            </button>
            <button type="button" className="aord-cancel-btn" onClick={() => navigate("/admin/customers")}>
              Cancel
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}

export { AdminAddCustomer };
