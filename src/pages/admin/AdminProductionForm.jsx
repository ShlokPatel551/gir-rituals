import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminProductionForm.css";

const ENTRY_DATA = {
  cow_milk: {
    name: "Cow Milk", unit: "litre", produced: 150, sold: 100, pricePerUnit: 30,
    leftoverAction: "Stored in refrigerator for tomorrow's morning delivery", notes: "",
  },
  buffalo_milk: {
    name: "Buffalo Milk", unit: "litre", produced: 380, sold: 300, pricePerUnit: 25,
    leftoverAction: "Converted to curd for sale", notes: "",
  },
  paneer: {
    name: "Paneer", unit: "kg", produced: 80, sold: 40, pricePerUnit: 50,
    leftoverAction: "Packed and stored for next day dispatch",
    notes: "Batch quality excellent — extra firm texture noted.",
  },
  cow_ghee: {
    name: "Cow Ghee", unit: "kg", produced: 20, sold: 16, pricePerUnit: 500,
    leftoverAction: "Stored in warehouse — will be dispatched next week",
    notes: "Bilona method batch. Premium grade.",
  },
};

const PRODUCT_OPTIONS = [
  { id: "cow_milk",     name: "Cow Milk"     },
  { id: "buffalo_milk", name: "Buffalo Milk" },
  { id: "paneer",       name: "Paneer"       },
  { id: "cow_ghee",     name: "Cow Ghee"     },
];

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function AdminProductionForm() {
  const { productId } = useParams();
  const navigate      = useNavigate();
  const isNew         = productId === "new";
  const entry         = ENTRY_DATA[productId];

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const [form, setForm] = useState({
    productId:     isNew ? "cow_milk" : (productId ?? "cow_milk"),
    unit:          entry?.unit ?? "litre",
    produced:      entry?.produced?.toString() ?? "",
    sold:          entry?.sold?.toString() ?? "",
    pricePerUnit:  entry?.pricePerUnit?.toString() ?? "",
    leftoverAction:entry?.leftoverAction ?? "",
    notes:         entry?.notes ?? "",
  });

  const produced  = parseFloat(form.produced)  || 0;
  const sold      = parseFloat(form.sold)      || 0;
  const price     = parseFloat(form.pricePerUnit) || 0;
  const leftover  = Math.max(0, produced - sold);
  const income    = sold * price;
  const sellRate  = produced > 0 ? ((sold / produced) * 100).toFixed(1) : "0.0";
  const unitShort = form.unit === "litre" ? "L" : form.unit === "kg" ? "kg" : "pkt";

  const displayName = isNew
    ? PRODUCT_OPTIONS.find(p => p.id === form.productId)?.name ?? "New Entry"
    : (entry?.name ?? "Entry");

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleProductChange(id) {
    const data = ENTRY_DATA[id];
    setForm(prev => ({ ...prev, productId: id, unit: data?.unit ?? prev.unit }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        navigate(`/admin/production/${isNew ? form.productId : productId}`);
      }, 1000);
    }, 800);
  }

  function handleDiscard() {
    navigate(isNew ? "/admin/production" : `/admin/production/${productId}`);
  }

  return (
    <div className="pf-page">

      {/* ── Breadcrumb + topbar ── */}
      <div className="pf-topbar">
        <div>
          <nav className="pf-breadcrumb">
            <Link to="/admin/production" className="pf-crumb-link">Production</Link>
            <span className="material-symbols-outlined pf-crumb-sep">chevron_right</span>
            <span className="pf-crumb-cur pf-crumb-accent">
              {isNew ? "New Entry" : "Edit Entry"}
            </span>
          </nav>
          <h2 className="pf-title">
            <span
              className="material-symbols-outlined pf-title-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              edit_note
            </span>
            {isNew
              ? "New production entry"
              : `Edit production entry — ${displayName} — 29 May 2026`}
          </h2>
        </div>
        <button type="button" className="pf-back-btn" onClick={handleDiscard}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to all products
        </button>
      </div>

      {/* ── Main form card ── */}
      <div className="pf-card">
        <form className="pf-form" onSubmit={handleSubmit} noValidate>

          {/* Row 1 — Product name + Unit */}
          <div className="pf-grid-2">
            <div className="pf-field">
              <label className="pf-label">Product name</label>
              {isNew ? (
                <div className="pf-select-wrap">
                  <select
                    className="pf-select"
                    value={form.productId}
                    onChange={e => handleProductChange(e.target.value)}
                  >
                    {PRODUCT_OPTIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pf-select-arrow">expand_more</span>
                </div>
              ) : (
                <input
                  type="text"
                  className="pf-input pf-input-readonly"
                  value={entry?.name ?? ""}
                  readOnly
                />
              )}
            </div>
            <div className="pf-field">
              <label className="pf-label">Unit of measurement</label>
              <div className="pf-select-wrap">
                <select
                  className="pf-select"
                  value={form.unit}
                  onChange={e => set("unit", e.target.value)}
                >
                  <option value="litre">Litre</option>
                  <option value="kg">Kilogram</option>
                  <option value="packet (500ml)">Packet (500 ml)</option>
                </select>
                <span className="material-symbols-outlined pf-select-arrow">expand_more</span>
              </div>
            </div>
          </div>

          {/* Row 2 — Produced + Sold */}
          <div className="pf-grid-2">
            <div className="pf-field">
              <label className="pf-label">Qty produced today</label>
              <input
                type="number"
                className="pf-input"
                min="0"
                placeholder="0"
                value={form.produced}
                onChange={e => set("produced", e.target.value)}
              />
            </div>
            <div className="pf-field">
              <label className="pf-label">Qty sold today</label>
              <input
                type="number"
                className="pf-input"
                min="0"
                placeholder="0"
                value={form.sold}
                onChange={e => set("sold", e.target.value)}
              />
            </div>
          </div>

          {/* Row 3 — Price + Leftover (auto) */}
          <div className="pf-grid-2">
            <div className="pf-field">
              <label className="pf-label">Price per unit (₹)</label>
              <div className="pf-prefix-wrap">
                <span className="pf-prefix-sym">₹</span>
                <input
                  type="number"
                  className="pf-input pf-input-prefixed"
                  min="0"
                  placeholder="0"
                  value={form.pricePerUnit}
                  onChange={e => set("pricePerUnit", e.target.value)}
                />
              </div>
            </div>
            <div className="pf-field">
              <label className="pf-label">
                Leftover qty
                <span className="pf-label-note">— auto calculated</span>
              </label>
              <input
                type="text"
                className="pf-input pf-input-readonly pf-input-leftover"
                value={produced > 0 ? `${leftover} ${unitShort}` : "—"}
                readOnly
              />
            </div>
          </div>

          {/* Leftover action */}
          <div className="pf-field">
            <label className="pf-label">
              What did you do with the leftover today?
            </label>
            <input
              type="text"
              className="pf-input"
              placeholder="e.g. Stored in refrigerator for tomorrow's morning delivery"
              value={form.leftoverAction}
              onChange={e => set("leftoverAction", e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="pf-field">
            <label className="pf-label">
              Extra notes about today's production
              <span className="pf-label-note">— optional</span>
            </label>
            <textarea
              className="pf-textarea"
              rows={3}
              placeholder="e.g. production was lower due to rain, extra demand from new customer..."
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
            />
          </div>

          {/* ── Calculated summary ── */}
          <div className="pf-summary-section">
            <h4 className="pf-summary-heading">
              Calculated summary
              <span className="pf-summary-note">— updates automatically</span>
            </h4>
            <div className="pf-summary-box">
              <div className="pf-sum-row">
                <span className="pf-sum-key">Qty produced</span>
                <span className="pf-sum-val">
                  {produced > 0 ? `${produced} ${unitShort}` : "—"}
                </span>
              </div>
              <div className="pf-sum-row">
                <span className="pf-sum-key">Qty sold</span>
                <span className="pf-sum-val">
                  {sold > 0 ? `${sold} ${unitShort}` : "—"}
                </span>
              </div>
              <div className="pf-sum-row">
                <span className="pf-sum-key">Price per {form.unit}</span>
                <span className="pf-sum-val">{price > 0 ? fmt(price) : "—"}</span>
              </div>
              <div className="pf-sum-row">
                <span className="pf-sum-key">
                  Leftover qty
                  <span className="pf-sum-sub"> (produced – sold)</span>
                </span>
                <span className="pf-sum-val pf-sum-leftover">
                  {produced > 0 ? `${leftover} ${unitShort}` : "—"}
                </span>
              </div>
              <div className="pf-sum-row pf-sum-total">
                <span className="pf-sum-total-key">
                  Total income today
                  <span className="pf-sum-sub"> (sold qty × price)</span>
                </span>
                <span className="pf-sum-total-val">{income > 0 ? fmt(income) : "₹0"}</span>
              </div>
              <div className="pf-sum-row">
                <span className="pf-sum-key">
                  Sell-through rate
                  <span className="pf-sum-sub"> (sold ÷ produced × 100)</span>
                </span>
                <span className="pf-sum-rate">{sellRate}%</span>
              </div>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="pf-actions">
            <button type="button" className="pf-btn-discard" onClick={handleDiscard}>
              Discard changes
            </button>
            <button
              type="submit"
              className={`pf-btn-save${saved ? " pf-btn-done" : ""}`}
              disabled={saving || saved}
            >
              {saved ? (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Saved!
                </>
              ) : saving ? (
                <>
                  <span className="material-symbols-outlined pf-spin">progress_activity</span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check</span>
                  Save entry
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* ── Impact info alert ── */}
      <div className="pf-alert">
        <span className="material-symbols-outlined pf-alert-icon">info</span>
        <div className="pf-alert-body">
          <p className="pf-alert-title">Impact Analysis</p>
          <p className="pf-alert-text">
            After saving — this product's income, leftover, and qty data will instantly update
            in the master production table on the overview page. The total income card on the
            overview page will also recalculate automatically.
          </p>
        </div>
      </div>

      {/* ── Footer meta ── */}
      <div className="pf-footer-meta">
        {!isNew && <p>Last saved: 29 May 2026 — 09:14 AM</p>}
        <p>By: Admin (owner)</p>
      </div>

    </div>
  );
}

export { AdminProductionForm };
