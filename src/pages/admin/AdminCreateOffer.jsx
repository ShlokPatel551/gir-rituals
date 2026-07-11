import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCreateOffer.css";

const OFFER_TYPES = [
  { key: "fixed_price",   icon: "payments",       iconBg: "#fef9c3", label: "Fixed price",       desc: "Set a flat price for a product (e.g. ₹60/L instead of ₹68/L)" },
  { key: "percentage",    icon: "percent",         iconBg: "#eff6ff", label: "Percentage off",     desc: "Discount by % (e.g. 15% off all products)" },
  { key: "buy_x_get_y",  icon: "card_giftcard",  iconBg: "#fff7ed", label: "Buy X get Y free",   desc: "Buy 2 get 1 free, buy 3 get 1 free etc" },
  { key: "combo",         icon: "inventory_2",    iconBg: "#f5f5f0", label: "Combo pack",          desc: "Two products together at a special combined price" },
];

const PRODUCTS = [
  { id: 1, emoji: "🥛", name: "A2 Cow Milk",   price: "₹68/L",        offerUnit: "/L" },
  { id: 2, emoji: "🐄", name: "Buffalo Milk",   price: "₹52/L",        offerUnit: "/L" },
  { id: 3, emoji: "🧈", name: "Cow Ghee A2",   price: "₹820/500g",    offerUnit: "/500g" },
  { id: 4, emoji: "🧀", name: "Fresh Paneer",   price: "₹110/250g",    offerUnit: "/250g" },
  { id: 5, emoji: "🧈", name: "Table Butter",   price: "₹90/100g",     offerUnit: "/100g" },
  { id: 6, emoji: "🥣", name: "Fresh Curd",     price: "₹45/200g",     offerUnit: "/200g" },
];

const ORDER_TYPES = [
  { value: "individual", label: "Individual orders only" },
  { value: "subscription", label: "Subscription orders" },
  { value: "both", label: "Both" },
];

function AdminCreateOffer() {
  const navigate = useNavigate();

  const [offerType,    setOfferType]    = useState("fixed_price");
  const [name,         setName]         = useState("");
  const [description,  setDescription]  = useState("");
  const [offerPrice,   setOfferPrice]   = useState("");
  const [origPrice,    setOrigPrice]    = useState("");
  const [selectedProds, setSelectedProds] = useState(new Set());
  const [startDate,    setStartDate]    = useState("");
  const [endDate,      setEndDate]      = useState("");
  const [maxOrders,    setMaxOrders]    = useState("");
  const [orderType,    setOrderType]    = useState("individual");
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState("");

  function toggleProduct(id) {
    setSelectedProds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function handleSave(asDraft) {
    if (!name.trim()) { setFormError("Offer name is required."); return; }
    if (!asDraft && (!startDate || !endDate)) { setFormError("Start and end dates are required to schedule."); return; }
    setFormError("");
    setSaving(true);
    try {
      const selectedColor = OFFER_TYPES.find(t => t.key === offerType)?.iconBg ?? "#f9fafb";
      const headerColor = offerType === "fixed_price" ? "#2d6a4f"
        : offerType === "percentage" ? "#1e40af"
        : offerType === "buy_x_get_y" ? "#d97706"
        : "#6b7280";
      await api.adminCreateOffer({
        title:      name.trim(),
        description: description.trim(),
        offerType,
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        origPrice:  origPrice  ? parseFloat(origPrice)  : null,
        productIds: Array.from(selectedProds),
        startDate:  startDate || null,
        endDate:    endDate   || null,
        maxOrders:  maxOrders ? parseInt(maxOrders) : null,
        orderType,
        status:     asDraft ? "draft" : "schedule",
        headerColor,
        icon: OFFER_TYPES.find(t => t.key === offerType)?.icon ?? "local_activity",
      });
      navigate("/admin/offers");
    } catch (e) {
      setFormError(e.message || "Failed to save offer. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Profit check calculations
  const op = parseFloat(origPrice)  || 0;
  const pp = parseFloat(offerPrice) || 0;
  const mo = parseInt(maxOrders)    || 0;
  const discountPerUnit = op - pp;
  const totalDiscount   = mo > 0 ? discountPerUnit * mo * 2 : null;

  // Preview data
  const previewName  = name        || "Offer name";
  const previewDesc  = description || "Short description will appear here.";
  const previewDeal  = pp > 0      ? `₹${pp}` : "₹—";
  const previewOrig  = op > 0      ? `₹${op}` : null;
  const previewDate  = startDate && endDate ? `${startDate} — ${endDate}` : "Date range";

  return (
    <div className="cof-page">

      {/* ── Page header ── */}
      <div className="cof-page-header">
        <h2 className="cof-page-title">Create new offer</h2>
        <button type="button" className="cof-back-btn" onClick={() => navigate("/admin/offers")}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
          Back to offers
        </button>
      </div>

      <div className="cof-layout">

        {/* ── Left: form ── */}
        <div className="cof-form">

          {/* Section: Offer Type */}
          <div className="cof-section">
            <div className="cof-section-hdr">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>category</span>
              Offer Type
            </div>
            <div className="cof-type-grid">
              {OFFER_TYPES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  className={`cof-type-card${offerType === t.key ? " cof-type-card-active" : ""}`}
                  onClick={() => setOfferType(t.key)}
                >
                  <div className="cof-type-icon" style={{ background: t.iconBg }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                  </div>
                  <div className="cof-type-text">
                    <span className="cof-type-label">{t.label}</span>
                    <span className="cof-type-desc">{t.desc}</span>
                  </div>
                  {offerType === t.key && (
                    <span className="material-symbols-outlined cof-type-check" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Offer Details */}
          <div className="cof-section">
            <div className="cof-section-hdr">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
              Offer Details
            </div>
            <div className="cof-section-body">
              <div className="cof-field">
                <label className="cof-label">Offer name (shown to customers) *</label>
                <input
                  type="text"
                  className="cof-input"
                  placeholder="e.g. Monsoon Milk Festival"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="cof-field">
                <label className="cof-label">Short description *</label>
                <textarea
                  className="cof-textarea"
                  rows={2}
                  placeholder="e.g. Get A2 Cow Milk at ₹60/L instead of ₹68/L. One-time purchase only."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="cof-row-2">
                <div className="cof-field">
                  <label className="cof-label">Offer price (₹) *</label>
                  <input
                    type="number"
                    className="cof-input"
                    placeholder="60"
                    value={offerPrice}
                    onChange={e => setOfferPrice(e.target.value)}
                  />
                  <p className="cof-hint">Customer pays this price</p>
                </div>
                <div className="cof-field">
                  <label className="cof-label">Original price (₹)</label>
                  <input
                    type="number"
                    className="cof-input cof-input-muted"
                    placeholder="68"
                    value={origPrice}
                    onChange={e => setOrigPrice(e.target.value)}
                  />
                  <p className="cof-hint cof-hint-italic">Auto shows strikethrough</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Applicable Products */}
          <div className="cof-section">
            <div className="cof-section-hdr">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>shopping_bag</span>
              Applicable Products
            </div>
            <div className="cof-section-body">
              <p className="cof-products-hint">Select which products this offer applies to</p>
              <div className="cof-products-list">
                {PRODUCTS.map(prod => {
                  const checked = selectedProds.has(prod.id);
                  return (
                    <label
                      key={prod.id}
                      className={`cof-product-row${checked ? " cof-product-row-checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="cof-checkbox"
                        checked={checked}
                        onChange={() => toggleProduct(prod.id)}
                      />
                      <span className="cof-product-emoji">{prod.emoji}</span>
                      <span className="cof-product-name">{prod.name}</span>
                      <span className="cof-product-price">
                        {checked && pp > 0 ? (
                          <>
                            <span className="cof-price-struck">{prod.price}</span>
                            <span className="cof-price-offer">→ ₹{pp}{prod.offerUnit}</span>
                          </>
                        ) : (
                          prod.price
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Schedule & Limits */}
          <div className="cof-section">
            <div className="cof-section-hdr">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_today</span>
              Schedule &amp; Limits
            </div>
            <div className="cof-section-body">
              <div className="cof-row-2">
                <div className="cof-field">
                  <label className="cof-label">Start date *</label>
                  <div className="cof-input-icon-wrap">
                    <input
                      type="date"
                      className="cof-input"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="cof-field">
                  <label className="cof-label">End date *</label>
                  <div className="cof-input-icon-wrap">
                    <input
                      type="date"
                      className="cof-input"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="cof-row-2">
                <div className="cof-field">
                  <label className="cof-label">Max orders (optional)</label>
                  <input
                    type="number"
                    className="cof-input"
                    placeholder="100"
                    value={maxOrders}
                    onChange={e => setMaxOrders(e.target.value)}
                  />
                  <p className="cof-hint">Offer stops after this many orders</p>
                </div>
                <div className="cof-field">
                  <label className="cof-label">Applicable order type</label>
                  <select
                    className="cof-select"
                    value={orderType}
                    onChange={e => setOrderType(e.target.value)}
                  >
                    {ORDER_TYPES.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right: preview + profit ── */}
        <aside className="cof-sidebar">

          {/* Live preview */}
          <div className="cof-section">
            <div className="cof-section-hdr">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
              Live Preview — Customer View
            </div>
            <div className="cof-preview-wrap">
              <div className="cof-preview-card">
                <div className="cof-preview-hdr">
                  <span className="material-symbols-outlined cof-preview-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {OFFER_TYPES.find(t => t.key === offerType)?.icon ?? "payments"}
                  </span>
                  <div>
                    <p className="cof-preview-deal">{previewDeal}</p>
                    {previewOrig && <p className="cof-preview-subtitle">instead of {previewOrig}</p>}
                  </div>
                </div>
                <div className="cof-preview-body">
                  <p className="cof-preview-name">{previewName}</p>
                  <p className="cof-preview-desc">{previewDesc}</p>
                  <p className="cof-preview-date">
                    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>calendar_today</span>
                    {previewDate}
                  </p>
                  {orderType && (
                    <span className="cof-preview-tag">
                      {ORDER_TYPES.find(o => o.value === orderType)?.label}
                    </span>
                  )}
                  <div className="cof-preview-footer">
                    <div>
                      {previewOrig && <span className="cof-preview-orig">{previewOrig}</span>}
                      <span className="cof-preview-price">{previewDeal}</span>
                    </div>
                    <button type="button" className="cof-preview-cta">
                      Order now
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
              <p className="cof-preview-note">This is how the offer will appear to customers in the app</p>
            </div>
          </div>

          {/* Profit check */}
          <div className="cof-section">
            <div className="cof-section-hdr">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>bar_chart</span>
              Profit Check
            </div>
            <div className="cof-section-body">
              <div className="cof-profit-row">
                <span className="cof-profit-key">Normal rate</span>
                <span className="cof-profit-val">{op > 0 ? `₹${op}` : "—"}</span>
              </div>
              <div className="cof-profit-row">
                <span className="cof-profit-key">Offer rate</span>
                <span className="cof-profit-val">{pp > 0 ? `₹${pp}` : "—"}</span>
              </div>
              <div className="cof-profit-row cof-profit-divider">
                <span className="cof-profit-key">Discount per unit</span>
                <span className={`cof-profit-val${discountPerUnit > 0 ? " cof-profit-loss" : ""}`}>
                  {discountPerUnit > 0 ? `-₹${discountPerUnit}` : "—"}
                </span>
              </div>
              {totalDiscount !== null && totalDiscount > 0 && (
                <div className="cof-profit-total-box">
                  <span className="cof-profit-total-label">If {mo} orders × 2 avg</span>
                  <span className="cof-profit-total-val">-₹{totalDiscount.toLocaleString("en-IN")} discount given</span>
                </div>
              )}
              {pp > 0 && op > 0 && (
                <div className="cof-profit-warning">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>info</span>
                  <p>Ensure your cost price per unit is below ₹{pp} before activating this offer.</p>
                </div>
              )}
            </div>
          </div>

        </aside>
      </div>

      {/* ── Sticky footer ── */}
      <footer className="cof-footer">
        <p className="cof-footer-note">
          {formError
            ? <span style={{ color: "#dc2626" }}>{formError}</span>
            : "All fields marked * are required"}
        </p>
        <div className="cof-footer-actions">
          <button type="button" className="cof-btn-draft" disabled={saving} onClick={() => handleSave(true)}>
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button type="button" className="cof-btn-save" disabled={saving} onClick={() => handleSave(false)}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
            {saving ? "Saving…" : "Save & schedule offer"}
          </button>
        </div>
      </footer>

    </div>
  );
}

export { AdminCreateOffer };
