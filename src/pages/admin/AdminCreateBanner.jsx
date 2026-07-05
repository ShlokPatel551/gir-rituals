import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminCreateBanner.css";

const COLORS = [
  { hex: "#1b4332", label: "Forest Green" },
  { hex: "#d97706", label: "Amber" },
  { hex: "#1e3a8a", label: "Navy Blue" },
  { hex: "#991b1b", label: "Crimson" },
  { hex: "#065f46", label: "Emerald" },
  { hex: "#3730a3", label: "Indigo" },
];

const PRODUCTS = [
  { value: "milk",   label: "🥛 A2 Cow Milk" },
  { value: "ghee",   label: "🧈 Desi Ghee" },
  { value: "paneer", label: "🧀 Fresh Paneer" },
  { value: "curd",   label: "🥣 Fresh Curd" },
  { value: "butter", label: "🧈 Table Butter" },
];

const LINK_OPTIONS = [
  { value: "product_milk",    label: "Product page — A2 Cow Milk" },
  { value: "product_ghee",    label: "Product page — Desi Ghee" },
  { value: "product_paneer",  label: "Product page — Fresh Paneer" },
  { value: "sub_silver",      label: "Subscription Plan — Silver" },
  { value: "sub_gold",        label: "Subscription Plan — Gold" },
  { value: "offers",          label: "Offers page" },
];

const ORDER_OPTIONS = [
  { value: "1", label: "1 — Show first" },
  { value: "2", label: "2 — Show second" },
  { value: "3", label: "3 — Show third" },
];

function AdminCreateBanner() {
  const navigate = useNavigate();

  const [eyebrow,      setEyebrow]      = useState("Monsoon special");
  const [title,        setTitle]        = useState("Pure A2 Milk · Farm Fresh Daily");
  const [subtitle,     setSubtitle]     = useState("Delivered to your door every morning");
  const [buttonText,   setButtonText]   = useState("Order now →");
  const [bgColor,      setBgColor]      = useState("#1b4332");
  const [product,      setProduct]      = useState("milk");
  const [startDate,    setStartDate]    = useState("");
  const [endDate,      setEndDate]      = useState("");
  const [linkTo,       setLinkTo]       = useState("product_milk");
  const [displayOrder, setDisplayOrder] = useState("2");

  const [sections, setSections] = useState({ content: true, design: true, schedule: true });

  function toggleSection(key) {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="cbn-page">

      {/* ── Page header ── */}
      <div className="cbn-page-header">
        <h2 className="cbn-page-title">Create new banner</h2>
        <button type="button" className="cbn-back-btn" onClick={() => navigate("/admin/campaigns")}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
          Back to banners
        </button>
      </div>

      <div className="cbn-content">

        {/* ── Section: Banner Content ── */}
        <section className="cbn-section">
          <div className="cbn-section-hdr">
            <label className="cbn-section-toggle">
              <input
                type="checkbox"
                className="cbn-toggle-check"
                checked={sections.content}
                onChange={() => toggleSection("content")}
              />
              <span className="cbn-toggle-box" />
            </label>
            <span className="cbn-section-title">Banner Content</span>
          </div>

          {sections.content && (
            <div className="cbn-section-body">
              <div className="cbn-field">
                <label className="cbn-label">Small label / eyebrow text</label>
                <div className="cbn-input-icon-wrap">
                  <span className="cbn-input-icon">🌧️</span>
                  <input
                    type="text"
                    className="cbn-input cbn-input-pl"
                    value={eyebrow}
                    onChange={e => setEyebrow(e.target.value)}
                  />
                </div>
              </div>

              <div className="cbn-field">
                <label className="cbn-label">
                  Main title (large text) <span className="cbn-required">*</span>
                </label>
                <input
                  type="text"
                  className="cbn-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <p className="cbn-hint">Keep short — 3–5 words max for best display</p>
              </div>

              <div className="cbn-field">
                <label className="cbn-label">Subtitle</label>
                <input
                  type="text"
                  className="cbn-input"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                />
              </div>

              <div className="cbn-field">
                <label className="cbn-label">Button text</label>
                <input
                  type="text"
                  className="cbn-input"
                  value={buttonText}
                  onChange={e => setButtonText(e.target.value)}
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Section: Banner Design ── */}
        <section className="cbn-section">
          <div className="cbn-section-hdr">
            <label className="cbn-section-toggle">
              <input
                type="checkbox"
                className="cbn-toggle-check"
                checked={sections.design}
                onChange={() => toggleSection("design")}
              />
              <span className="cbn-toggle-box" />
            </label>
            <span className="cbn-section-title">Banner Design</span>
          </div>

          {sections.design && (
            <div className="cbn-section-body">
              <div className="cbn-field">
                <label className="cbn-label">Background colour / theme</label>
                <div className="cbn-color-row">
                  {COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      className={`cbn-swatch${bgColor === c.hex ? " cbn-swatch-active" : ""}`}
                      style={{ background: c.hex }}
                      title={c.label}
                      onClick={() => setBgColor(c.hex)}
                    />
                  ))}
                </div>
              </div>

              <div className="cbn-field">
                <label className="cbn-label">Product image / icon on banner</label>
                <select
                  className="cbn-select"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                >
                  {PRODUCTS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="cbn-field">
                <label className="cbn-label">Upload custom banner image (optional)</label>
                <div className="cbn-upload-zone">
                  <span className="material-symbols-outlined cbn-upload-icon">add_photo_alternate</span>
                  <p className="cbn-upload-text">Click to upload image</p>
                  <p className="cbn-upload-hint">JPG, PNG, WebP — max 2 MB — recommended 1200 × 400 px</p>
                </div>
              </div>

              {/* Live mini-preview */}
              <div className="cbn-field">
                <label className="cbn-label">Preview</label>
                <div className="cbn-preview" style={{ background: bgColor }}>
                  <div className="cbn-preview-tag">{eyebrow || "Label"}</div>
                  <div className="cbn-preview-title">{title || "Banner title"}</div>
                  <div className="cbn-preview-sub">{subtitle || "Subtitle text"}</div>
                  {buttonText && (
                    <div className="cbn-preview-btn" style={{ color: bgColor }}>{buttonText}</div>
                  )}
                  <span className="cbn-preview-emoji">
                    {PRODUCTS.find(p => p.value === product)?.label.split(" ")[0] ?? "🥛"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── Section: Schedule ── */}
        <section className="cbn-section">
          <div className="cbn-section-hdr">
            <label className="cbn-section-toggle">
              <input
                type="checkbox"
                className="cbn-toggle-check"
                checked={sections.schedule}
                onChange={() => toggleSection("schedule")}
              />
              <span className="cbn-toggle-box" />
            </label>
            <span className="cbn-section-title">Schedule</span>
          </div>

          {sections.schedule && (
            <div className="cbn-section-body">
              <div className="cbn-row-2">
                <div className="cbn-field">
                  <label className="cbn-label">
                    Start date <span className="cbn-required">*</span>
                  </label>
                  <input
                    type="date"
                    className="cbn-input"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                  <p className="cbn-hint">Banner goes live on this date</p>
                </div>
                <div className="cbn-field">
                  <label className="cbn-label">
                    End date <span className="cbn-required">*</span>
                  </label>
                  <input
                    type="date"
                    className="cbn-input"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                  <p className="cbn-hint">Banner stops on this date</p>
                </div>
              </div>

              <div className="cbn-field">
                <label className="cbn-label">Link banner to (optional)</label>
                <select
                  className="cbn-select"
                  value={linkTo}
                  onChange={e => setLinkTo(e.target.value)}
                >
                  {LINK_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="cbn-hint">When customer taps banner this page opens</p>
              </div>

              <div className="cbn-field">
                <label className="cbn-label">Display order (position in carousel)</label>
                <select
                  className="cbn-select"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(e.target.value)}
                >
                  {ORDER_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>

      </div>

      {/* ── Sticky footer ── */}
      <footer className="cbn-footer">
        <p className="cbn-footer-note">Banner will go live automatically on start date</p>
        <div className="cbn-footer-actions">
          <button type="button" className="cbn-btn-draft">
            Save as draft
          </button>
          <button type="button" className="cbn-btn-save">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
            Save &amp; schedule banner
          </button>
        </div>
      </footer>

    </div>
  );
}

export { AdminCreateBanner };
