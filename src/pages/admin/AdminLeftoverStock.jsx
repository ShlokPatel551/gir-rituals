import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminProductionNav } from "./AdminProductionNav";
import "./AdminLeftoverStock.css";

const TODAY_LABEL = "30 May 2026";
const PREV_LABEL  = "29 May";

const PRODUCTS = [
  { id: "cow_milk",     name: "Cow milk",     unit: "L",  icon: "water_drop",  opening: 50,  expiresToday: true  },
  { id: "buffalo_milk", name: "Buffalo milk", unit: "L",  icon: "opacity",     opening: 80,  expiresToday: true  },
  { id: "paneer",       name: "Fresh Paneer", unit: "kg", icon: "inventory_2", opening: 40,  expiresToday: false },
  { id: "cow_ghee",     name: "Cow Ghee",     unit: "kg", icon: "oil_barrel",  opening: 100, expiresToday: false },
];

const INIT_FORM = {
  cow_milk:     { freshProd: "20", sold: "65", used: "0", dumped: "5", status: "cleared", notes: "65 L sold in morning delivery batch. 5 L was slightly sour, dumped safely." },
  buffalo_milk: { freshProd: "0",  sold: "75", used: "0", dumped: "5", status: "cleared", notes: "" },
  paneer:       { freshProd: "0",  sold: "10", used: "5", dumped: "0", status: "carried", notes: "" },
  cow_ghee:     { freshProd: "0",  sold: "20", used: "0", dumped: "0", status: "carried", notes: "" },
};

const STATUS_OPTS = [
  { value: "cleared",  label: "Fully used / sold — no leftover" },
  { value: "carried",  label: "Partial leftover carried forward" },
  { value: "disposed", label: "Disposed all" },
];

function n(v) { return parseInt(v, 10) || 0; }

function AdminLeftoverStock() {
  const navigate = useNavigate();
  const [form, setForm]   = useState(INIT_FORM);
  const [saved, setSaved] = useState({});
  const [toast, setToast] = useState("");

  const expiringProducts = PRODUCTS.filter(p => p.expiresToday);
  const safeProducts     = PRODUCTS.filter(p => !p.expiresToday);
  const totalCarryFwd    = PRODUCTS.reduce((s, p) => s + p.opening, 0);

  function update(id, field, val) {
    setForm(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  }

  function getTotal(p)     { return p.opening + n(form[p.id].freshProd); }
  function getOut(p)       { return n(form[p.id].sold) + n(form[p.id].used); }
  function getDumped(p)    { return n(form[p.id].dumped); }
  function getRemaining(p) { return Math.max(0, getTotal(p) - getOut(p) - getDumped(p)); }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function handleSave(id, name) {
    setSaved(prev => ({ ...prev, [id]: "saving" }));
    setTimeout(() => {
      setSaved(prev => ({ ...prev, [id]: "done" }));
      showToast(`${name} stock saved successfully`);
      setTimeout(() => setSaved(prev => ({ ...prev, [id]: "" })), 3000);
    }, 700);
  }

  const cowMilk     = PRODUCTS[0];
  const buffaloMilk = PRODUCTS[1];
  const stdProducts = PRODUCTS.slice(2);

  return (
    <div className="ls-page">

      {toast && (
        <div className="ls-toast">
          <span className="material-symbols-outlined">check_circle</span>
          {toast}
        </div>
      )}

      {/* ── Page header ── */}
      <div className="ls-header">
        <div>
          <h2 className="ls-title">Manage leftover stock — {TODAY_LABEL}</h2>
          <p className="ls-desc">Audit and reconcile inventory carried forward from previous batches.</p>
        </div>
        <div className="ls-header-actions">
          <button type="button" className="ls-btn-outline"
            onClick={() => navigate("/admin/production")}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to production
          </button>
          <button type="button" className="ls-btn-solid"
            onClick={() => showToast("Exporting stock report…")}>
            <span className="material-symbols-outlined">download</span>
            Export stock report
          </button>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div className="ls-info-banner">
        <span className="material-symbols-outlined ls-info-icon">info</span>
        <p className="ls-info-text">
          These are leftover stocks that were NOT sold on {PREV_LABEL}. Items marked as "Expired"
          are automatically blocked from delivery dispatch for safety compliance.
        </p>
      </div>

      {/* ── Metric cards ── */}
      <div className="ls-metrics-grid">
        <div className="ls-metric-card">
          <span className="ls-metric-lbl">Products with leftover</span>
          <span className="ls-metric-val">{PRODUCTS.length} products</span>
        </div>
        <div className="ls-metric-card">
          <span className="ls-metric-lbl">Total carry-forward qty</span>
          <span className="ls-metric-val">{totalCarryFwd} units</span>
        </div>
        <div className="ls-metric-card ls-metric-error">
          <span className="ls-metric-lbl">Expiring today (Urgent)</span>
          <span className="ls-metric-val ls-val-error-big">{expiringProducts.length} products</span>
          <span className="ls-metric-note">Cow milk + Buffalo milk</span>
        </div>
        <div className="ls-metric-card ls-metric-safe">
          <span className="ls-metric-lbl">Safe to use</span>
          <span className="ls-metric-val ls-val-safe-big">{safeProducts.length} products</span>
          <span className="ls-metric-note">Paneer + Cow ghee</span>
        </div>
      </div>

      {/* ── Cross-navigation ── */}
      <AdminProductionNav />

      {/* ── Product sections ── */}
      <div className="ls-sections">

        {/* ──── Cow Milk — detailed layout ──── */}
        <section className="ls-section">
          <div className="ls-section-head">
            <div className="ls-section-head-left">
              <div className="ls-product-icon-box">
                <span className="material-symbols-outlined">{cowMilk.icon}</span>
              </div>
              <div>
                <h3 className="ls-product-name">{cowMilk.name}</h3>
                <p className="ls-product-sub">{cowMilk.opening} {cowMilk.unit} leftover from {PREV_LABEL}</p>
              </div>
            </div>
            <span className="ls-badge ls-badge-expires">
              <span className="material-symbols-outlined">priority_high</span>
              Expires today
            </span>
          </div>

          <div className="ls-body-detailed">
            <div className="ls-inputs-grid">
              <div className="ls-field">
                <label className="ls-label">Opening stock (from {PREV_LABEL})</label>
                <input type="text" className="ls-input ls-input-readonly"
                  value={`${cowMilk.opening} ${cowMilk.unit}`} disabled />
              </div>
              <div className="ls-field">
                <label className="ls-label">Fresh production today (30 May)</label>
                <div className="ls-input-unit-wrap">
                  <input type="number" className="ls-input"
                    value={form.cow_milk.freshProd}
                    onChange={e => update("cow_milk", "freshProd", e.target.value)} />
                  <span className="ls-unit-sfx">{cowMilk.unit}</span>
                </div>
              </div>
              <div className="ls-field">
                <label className="ls-label">
                  Qty sold today (from total {getTotal(cowMilk)} {cowMilk.unit})
                </label>
                <div className="ls-input-unit-wrap">
                  <input type="number" className="ls-input"
                    value={form.cow_milk.sold}
                    onChange={e => update("cow_milk", "sold", e.target.value)} />
                  <span className="ls-unit-sfx">{cowMilk.unit}</span>
                </div>
              </div>
              <div className="ls-field">
                <label className="ls-label">Qty used in making other products</label>
                <div className="ls-input-unit-wrap">
                  <input type="number" className="ls-input"
                    value={form.cow_milk.used}
                    onChange={e => update("cow_milk", "used", e.target.value)} />
                  <span className="ls-unit-sfx">{cowMilk.unit}</span>
                </div>
              </div>
              <div className="ls-field">
                <label className="ls-label ls-label-error">Qty dumped / discarded</label>
                <div className="ls-input-unit-wrap">
                  <input type="number" className="ls-input ls-input-error"
                    value={form.cow_milk.dumped}
                    onChange={e => update("cow_milk", "dumped", e.target.value)} />
                  <span className="ls-unit-sfx ls-unit-error">{cowMilk.unit}</span>
                </div>
              </div>
              <div className="ls-field">
                <label className="ls-label">Final status for today</label>
                <div className="ls-select-wrap">
                  <select className="ls-select" value={form.cow_milk.status}
                    onChange={e => update("cow_milk", "status", e.target.value)}>
                    {STATUS_OPTS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined ls-select-arrow">expand_more</span>
                </div>
              </div>
              <div className="ls-field ls-field-full">
                <label className="ls-label">Notes</label>
                <textarea className="ls-textarea" rows={2}
                  value={form.cow_milk.notes}
                  onChange={e => update("cow_milk", "notes", e.target.value)} />
              </div>
            </div>

            <div className="ls-summary-card">
              <h4 className="ls-summary-heading">Calculation Summary</h4>
              <ul className="ls-summary-list">
                <li className="ls-sum-row">
                  <span className="ls-sum-key">Opening + Fresh</span>
                  <span className="ls-sum-val">{getTotal(cowMilk)} {cowMilk.unit}</span>
                </li>
                <li className="ls-sum-row">
                  <span className="ls-sum-key">Out (Sold + Used)</span>
                  <span className="ls-sum-val ls-sum-minus">− {getOut(cowMilk)} {cowMilk.unit}</span>
                </li>
                <li className="ls-sum-row">
                  <span className="ls-sum-key">Waste (Dumped)</span>
                  <span className="ls-sum-val ls-sum-minus">− {getDumped(cowMilk)} {cowMilk.unit}</span>
                </li>
                <li className="ls-sum-row ls-sum-total-row">
                  <span className="ls-sum-key-total">Qty remaining after today</span>
                  <span className="ls-sum-val-total">{getRemaining(cowMilk)} {cowMilk.unit}</span>
                </li>
              </ul>
              <button type="button"
                className={`ls-save-btn${saved.cow_milk === "done" ? " ls-save-done" : ""}`}
                onClick={() => handleSave("cow_milk", cowMilk.name)}
                disabled={saved.cow_milk === "saving"}>
                <span className={`material-symbols-outlined${saved.cow_milk === "saving" ? " ls-spin" : ""}`}>
                  {saved.cow_milk === "saving" ? "progress_activity"
                   : saved.cow_milk === "done"   ? "check_circle"
                   : "save"}
                </span>
                {saved.cow_milk === "saving" ? "Saving…"
                 : saved.cow_milk === "done"   ? "Saved!"
                 : `Save ${cowMilk.name} stock`}
              </button>
            </div>
          </div>
        </section>

        {/* ──── Buffalo Milk — condensed layout ──── */}
        <section className="ls-section">
          <div className="ls-section-head">
            <div className="ls-section-head-left">
              <div className="ls-product-icon-box">
                <span className="material-symbols-outlined">{buffaloMilk.icon}</span>
              </div>
              <div>
                <h3 className="ls-product-name">{buffaloMilk.name}</h3>
                <p className="ls-product-sub">{buffaloMilk.opening} {buffaloMilk.unit} leftover from {PREV_LABEL}</p>
              </div>
            </div>
            <span className="ls-badge ls-badge-expires">
              <span className="material-symbols-outlined">priority_high</span>
              Expires today
            </span>
          </div>

          <div className="ls-body-condensed">
            <div className="ls-condensed-display">
              <p className="ls-label">Total available</p>
              <p className="ls-condensed-val">{buffaloMilk.opening} {buffaloMilk.unit}</p>
              <p className="ls-condensed-note">(No fresh production today)</p>
            </div>
            <div className="ls-field">
              <label className="ls-label">Qty sold today</label>
              <input type="number" className="ls-input"
                value={form.buffalo_milk.sold}
                onChange={e => update("buffalo_milk", "sold", e.target.value)} />
            </div>
            <div className="ls-field">
              <label className="ls-label">Qty dumped</label>
              <input type="number" className="ls-input"
                value={form.buffalo_milk.dumped}
                onChange={e => update("buffalo_milk", "dumped", e.target.value)} />
            </div>
            <div className="ls-condensed-save">
              <button type="button"
                className={`ls-save-btn ls-save-btn-full${saved.buffalo_milk === "done" ? " ls-save-done" : ""}`}
                onClick={() => handleSave("buffalo_milk", buffaloMilk.name)}
                disabled={saved.buffalo_milk === "saving"}>
                <span className={`material-symbols-outlined${saved.buffalo_milk === "saving" ? " ls-spin" : ""}`}>
                  {saved.buffalo_milk === "saving" ? "progress_activity" : "check_circle"}
                </span>
                {saved.buffalo_milk === "saving" ? "Saving…"
                 : saved.buffalo_milk === "done"   ? "Saved!"
                 : `Save ${buffaloMilk.name} stock`}
              </button>
            </div>
          </div>
        </section>

        {/* ──── Paneer + Cow Ghee — standard layout ──── */}
        {stdProducts.map(p => {
          const f       = form[p.id];
          const closing = Math.max(0, p.opening - n(f.sold) - n(f.used));
          return (
            <section key={p.id} className="ls-section">
              <div className="ls-section-head">
                <div className="ls-section-head-left">
                  <div className="ls-product-icon-box">
                    <span className="material-symbols-outlined">{p.icon}</span>
                  </div>
                  <div>
                    <h3 className="ls-product-name">{p.name}</h3>
                    <p className="ls-product-sub">{p.opening} {p.unit} leftover from {PREV_LABEL}</p>
                  </div>
                </div>
                <span className="ls-badge ls-badge-safe">
                  <span className="material-symbols-outlined">verified</span>
                  Safe to use
                </span>
              </div>

              <div className="ls-body-standard">
                <div className="ls-field">
                  <label className="ls-label">Total available</label>
                  <input type="text" className="ls-input ls-input-readonly ls-input-primary"
                    value={`${p.opening} ${p.unit}`} disabled />
                </div>
                <div className="ls-field">
                  <label className="ls-label">Qty sold today</label>
                  <input type="number" className="ls-input" value={f.sold}
                    onChange={e => update(p.id, "sold", e.target.value)} />
                </div>
                <div className="ls-field">
                  <label className="ls-label">Qty used (in production)</label>
                  <input type="number" className="ls-input" value={f.used}
                    onChange={e => update(p.id, "used", e.target.value)} />
                </div>
                <div className="ls-field">
                  <label className="ls-label">Closing leftover</label>
                  <input type="text" className="ls-input ls-input-closing"
                    value={`${closing} ${p.unit}`} disabled />
                </div>
                <div className="ls-standard-actions">
                  <button type="button" className="ls-btn-outline-sm"
                    onClick={() => showToast(`${p.name} inventory updated`)}>
                    Update Inventory Only
                  </button>
                  <button type="button"
                    className={`ls-btn-solid-sm${saved[p.id] === "done" ? " ls-save-done-sm" : ""}`}
                    onClick={() => handleSave(p.id, p.name)}
                    disabled={saved[p.id] === "saving"}>
                    {saved[p.id] === "saving" ? "Saving…"
                     : saved[p.id] === "done"   ? "Saved!"
                     : "Save Entry"}
                  </button>
                </div>
              </div>
            </section>
          );
        })}

      </div>
    </div>
  );
}

export { AdminLeftoverStock };
