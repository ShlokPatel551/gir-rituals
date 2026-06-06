import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminProductionForm.css";

const PRODUCT_DATA = {
  "cow-milk": {
    name: "Cow milk",
    unit: "Litre",
    unitShort: "L",
    openingQty: 50,
    openingFrom: "4 June",
    defaultFresh: 20,
    defaultSold: 65,
    defaultPrice: 30,
    expiryLabel: "5 June 2026 (expires today)",
    date: "5 June 2026",
  },
  "buffalo-milk": {
    name: "Buffalo milk",
    unit: "Litre",
    unitShort: "L",
    openingQty: 80,
    openingFrom: "4 June",
    defaultFresh: 0,
    defaultSold: 75,
    defaultPrice: 25,
    expiryLabel: "5 June 2026 (expires today)",
    date: "5 June 2026",
  },
  paneer: {
    name: "Paneer",
    unit: "Kilogram",
    unitShort: "kg",
    openingQty: 40,
    openingFrom: "4 June",
    defaultFresh: 60,
    defaultSold: 55,
    defaultPrice: 50,
    expiryLabel: "7 June 2026",
    date: "5 June 2026",
  },
  "cow-ghee": {
    name: "Cow ghee",
    unit: "Kilogram",
    unitShort: "kg",
    openingQty: 10,
    openingFrom: "4 June",
    defaultFresh: 5,
    defaultSold: 3,
    defaultPrice: 250,
    expiryLabel: "Safe (30 days)",
    date: "5 June 2026",
  },
};

const FALLBACK = PRODUCT_DATA["cow-milk"];

const ACTION_LABELS = {
  dumped:    "Dumped",
  converted: "Converted to other products",
  staff:     "Reserved for staff",
};

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function AdminProductionForm() {
  const { productId } = useParams();
  const navigate      = useNavigate();
  const product       = PRODUCT_DATA[productId] ?? FALLBACK;

  const [freshQty,     setFreshQty]     = useState(product.defaultFresh.toString());
  const [soldQty,      setSoldQty]      = useState(product.defaultSold.toString());
  const [pricePerUnit, setPricePerUnit] = useState(product.defaultPrice.toString());
  const [action,       setAction]       = useState("dumped");
  const [convertedTo,  setConvertedTo]  = useState("");
  const [notes,        setNotes]        = useState(
    "5L was slightly sour — discarded safely before evening."
  );
  const [activeTab, setActiveTab] = useState("all");

  const freshNum   = parseFloat(freshQty)     || 0;
  const soldNum    = parseFloat(soldQty)       || 0;
  const priceNum   = parseFloat(pricePerUnit)  || 0;
  const totalAvail = product.openingQty + freshNum;
  const income     = soldNum * priceNum;
  const leftover   = Math.max(0, totalAvail - soldNum);
  const sellThrough = totalAvail > 0 ? ((soldNum / totalAvail) * 100).toFixed(1) : "0.0";

  function handleDiscard() {
    setFreshQty(product.defaultFresh.toString());
    setSoldQty(product.defaultSold.toString());
    setPricePerUnit(product.defaultPrice.toString());
    setAction("dumped");
    setConvertedTo("");
    setNotes("5L was slightly sour — discarded safely before evening.");
  }

  function handleSave() {
    navigate("/admin/production-log");
  }

  return (
    <div className="pf-page">

      {/* ── Page header ── */}
      <div className="pf-header">
        <div className="pf-header-left">
          <h2 className="pf-title">
            <span className="material-symbols-outlined pf-title-icon">edit_note</span>
            Edit production entry
            <span className="pf-title-sep">—</span>
            <span className="pf-title-product">{product.name}</span>
          </h2>
          <div className="pf-header-chips">
            <span className="pf-date-chip">
              <span className="material-symbols-outlined pf-chip-icon">calendar_today</span>
              {product.date}
            </span>
            <span className="pf-unit-chip">{product.unit}</span>
          </div>
        </div>
        <button
          type="button"
          className="pf-back-btn"
          onClick={() => navigate("/admin/production-log")}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
      </div>

      {/* ── KPI cards ── */}
      <div className="pf-kpi-grid">

        <div className="pf-kpi-card pf-kpi-opening">
          <div className="pf-kpi-top">
            <span className="pf-kpi-label">Opening Stock</span>
            <span className="material-symbols-outlined pf-kpi-icon">inventory_2</span>
          </div>
          <p className="pf-kpi-val">{product.openingQty} {product.unitShort}</p>
          <p className="pf-kpi-sub">from {product.openingFrom}</p>
          <span className="pf-kpi-auto">auto</span>
        </div>

        <div className="pf-kpi-card pf-kpi-fresh">
          <div className="pf-kpi-top">
            <span className="pf-kpi-label">Fresh Today</span>
            <span className="material-symbols-outlined pf-kpi-icon">add_circle</span>
          </div>
          <p className="pf-kpi-val pf-kpi-val-primary">{freshNum} {product.unitShort}</p>
          <p className="pf-kpi-sub">production today</p>
        </div>

        <div className="pf-kpi-card pf-kpi-total">
          <div className="pf-kpi-top">
            <span className="pf-kpi-label">Total Available</span>
            <span className="material-symbols-outlined pf-kpi-icon">calculate</span>
          </div>
          <p className="pf-kpi-val pf-kpi-val-primary">{totalAvail} {product.unitShort}</p>
          <p className="pf-kpi-sub">opening + fresh</p>
          <span className="pf-kpi-auto">auto</span>
        </div>

        <div className="pf-kpi-card pf-kpi-income">
          <div className="pf-kpi-top">
            <span className="pf-kpi-label">Income Today</span>
            <span className="material-symbols-outlined pf-kpi-icon">payments</span>
          </div>
          <p className="pf-kpi-val pf-kpi-val-income">{fmt(income)}</p>
          <p className="pf-kpi-sub">{soldNum} {product.unitShort} × ₹{priceNum}</p>
          <span className="pf-kpi-auto">auto</span>
        </div>

        <div className={`pf-kpi-card${leftover > 0 ? " pf-kpi-leftover" : " pf-kpi-safe"}`}>
          <div className="pf-kpi-top">
            <span className="pf-kpi-label">Leftover Qty</span>
            <span className="material-symbols-outlined pf-kpi-icon">
              {leftover > 0 ? "warning" : "check_circle"}
            </span>
          </div>
          <p className={`pf-kpi-val${leftover > 0 ? " pf-kpi-val-error" : " pf-kpi-val-primary"}`}>
            {leftover} {product.unitShort}
          </p>
          <p className="pf-kpi-sub">total − sold</p>
          <span className="pf-kpi-auto">auto</span>
        </div>

      </div>

      {/* ── Filter tabs ── */}
      <div className="pf-tabs">
        <button
          type="button"
          className={`pf-tab${activeTab === "all" ? " pf-tab-active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Production
        </button>
        <button
          type="button"
          className={`pf-tab${activeTab === "history" ? " pf-tab-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Stock History
        </button>
      </div>

      {/* ── Form card ── */}
      <div className="pf-form-card">

        {/* Production Numbers section */}
        <div className="pf-section">
          <div className="pf-section-hdr">
            <span className="material-symbols-outlined pf-section-icon">edit_note</span>
            <div>
              <h3 className="pf-section-title">Production Numbers</h3>
              <p className="pf-section-sub">
                Fill in fresh produced and sold quantities — other fields calculate automatically.
              </p>
            </div>
          </div>

          <div className="pf-form-grid">

            <div className="pf-field">
              <label className="pf-label">Opening stock</label>
              <input
                type="text"
                className="pf-input pf-input-gray"
                value={`${product.openingQty} ${product.unitShort}`}
                readOnly
              />
              <p className="pf-hint">Carried from {product.openingFrom}</p>
            </div>

            <div className="pf-field">
              <label className="pf-label">
                Fresh produced today <span className="pf-req">*</span>
              </label>
              <div className="pf-suffix-wrap">
                <input
                  type="number"
                  className="pf-input pf-input-has-suffix"
                  min="0"
                  value={freshQty}
                  onChange={e => setFreshQty(e.target.value)}
                />
                <span className="pf-suffix">{product.unitShort}</span>
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Total available</label>
              <input
                type="text"
                className="pf-input pf-input-green"
                value={`${totalAvail} ${product.unitShort}`}
                readOnly
              />
              <p className="pf-hint pf-hint-green">= Opening + Fresh</p>
            </div>

            <div className="pf-field">
              <label className="pf-label">
                Qty sold today <span className="pf-req">*</span>
              </label>
              <div className="pf-suffix-wrap">
                <input
                  type="number"
                  className="pf-input pf-input-has-suffix"
                  min="0"
                  value={soldQty}
                  onChange={e => setSoldQty(e.target.value)}
                />
                <span className="pf-suffix">{product.unitShort}</span>
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">
                Price per {product.unitShort} <span className="pf-req">*</span>
              </label>
              <div className="pf-prefix-wrap">
                <span className="pf-prefix-sym">₹</span>
                <input
                  type="number"
                  className="pf-input pf-input-prefixed"
                  min="0"
                  value={pricePerUnit}
                  onChange={e => setPricePerUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="pf-field">
              <label className="pf-label">Income today</label>
              <input
                type="text"
                className="pf-input pf-input-green pf-input-income"
                value={fmt(income)}
                readOnly
              />
              <p className="pf-hint pf-hint-green">= Sold × Price</p>
            </div>

            <div className="pf-field">
              <label className="pf-label">Leftover qty</label>
              <input
                type="text"
                className="pf-input pf-input-red"
                value={`${leftover} ${product.unitShort}`}
                readOnly
              />
              <p className="pf-hint pf-hint-red">= Total − Sold</p>
            </div>

            <div className="pf-field">
              <label className="pf-label">Expiry date</label>
              <input
                type="text"
                className="pf-input pf-input-gray"
                value={product.expiryLabel}
                readOnly
              />
            </div>

          </div>
        </div>

        <div className="pf-card-divider" />

        {/* Leftover Stock Action section */}
        <div className="pf-section">
          <div className="pf-section-hdr">
            <span className="material-symbols-outlined pf-section-icon pf-section-icon-warn">
              warning
            </span>
            <div>
              <h3 className="pf-section-title">Leftover Stock Action</h3>
              <p className="pf-section-sub">
                Record what happened to the {leftover} {product.unitShort} leftover.
              </p>
            </div>
          </div>

          <div className="pf-leftover-fields">

            <div className="pf-field">
              <label className="pf-label">
                What was done with leftover stock? <span className="pf-req">*</span>
              </label>
              <div className="pf-select-wrap">
                <select
                  className="pf-select"
                  value={action}
                  onChange={e => setAction(e.target.value)}
                >
                  <option value="dumped">Dumped</option>
                  <option value="converted">Converted to other products</option>
                  <option value="staff">Reserved for staff</option>
                </select>
                <span className="material-symbols-outlined pf-select-arrow">expand_more</span>
              </div>
            </div>

            {action === "converted" && (
              <div className="pf-field">
                <label className="pf-label">
                  If converted — what product? <span className="pf-req">*</span>
                </label>
                <input
                  type="text"
                  className="pf-input"
                  placeholder="e.g. Curd, Paneer, Ghee..."
                  value={convertedTo}
                  onChange={e => setConvertedTo(e.target.value)}
                />
              </div>
            )}

            <div className="pf-field">
              <label className="pf-label">
                Notes <span className="pf-label-opt">(optional)</span>
              </label>
              <textarea
                className="pf-textarea"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

          </div>
        </div>

        <div className="pf-card-divider" />

        {/* Calculated Summary section */}
        <div className="pf-section pf-section-summary">
          <h3 className="pf-summary-title">Calculated Summary</h3>
          <div className="pf-summary-grid">

            {/* Stock calculation */}
            <div className="pf-summary-card">
              <p className="pf-summary-card-title">
                <span className="material-symbols-outlined pf-summary-icon">inventory_2</span>
                Stock Calculation
              </p>
              <div className="pf-calc-rows">
                <div className="pf-calc-row">
                  <span className="pf-calc-key">Opening stock</span>
                  <span className="pf-calc-val">{product.openingQty} {product.unitShort}</span>
                </div>
                <div className="pf-calc-row pf-calc-row-op">
                  <span className="pf-calc-op">+</span>
                  <span className="pf-calc-key">Fresh today</span>
                  <span className="pf-calc-val">{freshNum} {product.unitShort}</span>
                </div>
                <div className="pf-calc-row pf-calc-row-eq">
                  <span className="pf-calc-key">= &nbsp;Total available</span>
                  <span className="pf-calc-val pf-calc-total">{totalAvail} {product.unitShort}</span>
                </div>
                <div className="pf-calc-row pf-calc-row-op">
                  <span className="pf-calc-op">−</span>
                  <span className="pf-calc-key">Qty sold</span>
                  <span className="pf-calc-val">{soldNum} {product.unitShort}</span>
                </div>
                <div className="pf-calc-row pf-calc-row-eq">
                  <span className="pf-calc-key">= &nbsp;Leftover</span>
                  <span className={`pf-calc-val${leftover > 0 ? " pf-calc-leftover" : " pf-calc-zero"}`}>
                    {leftover} {product.unitShort}
                  </span>
                </div>
              </div>
            </div>

            {/* Income calculation */}
            <div className="pf-summary-card">
              <p className="pf-summary-card-title">
                <span className="material-symbols-outlined pf-summary-icon">payments</span>
                Income Calculation
              </p>
              <div className="pf-calc-rows">
                <div className="pf-calc-row">
                  <span className="pf-calc-key">Qty sold</span>
                  <span className="pf-calc-val">{soldNum} {product.unitShort}</span>
                </div>
                <div className="pf-calc-row pf-calc-row-op">
                  <span className="pf-calc-op">×</span>
                  <span className="pf-calc-key">Price per {product.unitShort}</span>
                  <span className="pf-calc-val">₹{priceNum}</span>
                </div>
                <div className="pf-calc-row pf-calc-row-eq">
                  <span className="pf-calc-key">= &nbsp;Total income</span>
                  <span className="pf-calc-val pf-calc-income">{fmt(income)}</span>
                </div>
                <div className="pf-calc-divider" />
                <div className="pf-calc-row">
                  <span className="pf-calc-key">Sell-through rate</span>
                  <span className="pf-calc-val pf-calc-rate">{sellThrough}%</span>
                </div>
                <div className="pf-calc-row">
                  <span className="pf-calc-key">Leftover action</span>
                  <span className="pf-calc-val">{ACTION_LABELS[action]}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Sticky footer ── */}
      <div className="pf-footer">
        <p className="pf-footer-meta">
          <span className="material-symbols-outlined pf-footer-icon">schedule</span>
          Last saved: 5 June 2026 at 5:42 PM by admin
        </p>
        <div className="pf-footer-actions">
          <button type="button" className="pf-btn-discard" onClick={handleDiscard}>
            Discard changes
          </button>
          <button type="button" className="pf-btn-save" onClick={handleSave}>
            <span className="material-symbols-outlined">check</span>
            Save entry
          </button>
        </div>
      </div>

    </div>
  );
}

export { AdminProductionForm };
