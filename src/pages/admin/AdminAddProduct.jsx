import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAddProduct.css";

const EMPTY_FORM = {
  name: "",
  category: "Milk",
  unit: "Litre",
  subRate: "",
  buyOnceRate: "",
  gst: "0% (Exempt)",
  openingStock: "",
  lowStockThreshold: "",
  shelfLife: "",
  status: "Active — visible to customers",
  shortDesc: "",
  fullDesc: "",
  benefits: "",
};

const EMPTY_VIS = {
  mobileApp: true,
  website: true,
  subscription: true,
  buyOnce: true,
};

function AdminAddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [visibility, setVisibility] = useState(EMPTY_VIS);
  const [dragOver, setDragOver] = useState(false);

  function handleField(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function toggleVis(key) {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleDragOver(e) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave() { setDragOver(false); }
  function handleDrop(e) { e.preventDefault(); setDragOver(false); }

  function handleClear() {
    setForm(EMPTY_FORM);
    setVisibility(EMPTY_VIS);
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div className="ap-page">

      {/* ── Header ── */}
      <div className="ap-header">
        <div>
          <h2 className="ap-title">Add New Product</h2>
          <p className="ap-subtitle">List a new dairy essential to your catalog.</p>
        </div>
        <button type="button" className="ap-cancel-btn" onClick={() => navigate("/admin/products")}>
          <span className="material-symbols-outlined">close</span>
          Cancel
        </button>
      </div>

      <form className="ap-form" onSubmit={handleSubmit}>

        {/* ── Main grid: 2/3 + 1/3 ── */}
        <div className="ap-grid">

          {/* Left column */}
          <div className="ap-col-main">

            {/* Basic Information */}
            <div className="ap-card">
              <div className="ap-card-heading">
                <span className="material-symbols-outlined ap-card-icon">info</span>
                <h3 className="ap-card-title">Basic Information</h3>
              </div>
              <div className="ap-field-grid">
                <div className="ap-field">
                  <label className="ap-label">Product ID (auto-generated)</label>
                  <input className="ap-input ap-input-disabled" type="text" value="PRD-013 (auto)" disabled />
                </div>
                <div className="ap-field">
                  <label className="ap-label">
                    Product Name <span className="ap-required">*</span>
                  </label>
                  <input
                    className="ap-input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleField}
                    placeholder="e.g. A2 Buffalo Milk"
                  />
                </div>
                <div className="ap-field">
                  <label className="ap-label">
                    Category <span className="ap-required">*</span>
                  </label>
                  <div className="ap-select-wrap">
                    <select className="ap-input ap-select" name="category" value={form.category} onChange={handleField}>
                      <option>Milk</option>
                      <option>Ghee</option>
                      <option>Paneer</option>
                      <option>Yogurt</option>
                      <option>Curd</option>
                      <option>Butter</option>
                      <option>Sweet</option>
                    </select>
                    <span className="material-symbols-outlined ap-select-arrow">expand_more</span>
                  </div>
                </div>
                <div className="ap-field">
                  <label className="ap-label">
                    Unit of Measurement <span className="ap-required">*</span>
                  </label>
                  <div className="ap-select-wrap">
                    <select className="ap-input ap-select" name="unit" value={form.unit} onChange={handleField}>
                      <option>Litre</option>
                      <option>Kilogram</option>
                      <option>Pack (500g)</option>
                      <option>Bottle</option>
                      <option>100g</option>
                      <option>200ml</option>
                    </select>
                    <span className="material-symbols-outlined ap-select-arrow">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="ap-card">
              <div className="ap-card-heading">
                <span className="material-symbols-outlined ap-card-icon">payments</span>
                <h3 className="ap-card-title">Pricing</h3>
              </div>
              <div className="ap-field-grid ap-field-grid-3">
                <div className="ap-field">
                  <label className="ap-label">
                    Subscription Rate (₹) <span className="ap-required">*</span>
                  </label>
                  <input className="ap-input" type="number" name="subRate" value={form.subRate} onChange={handleField} placeholder="70" min="0" />
                  <p className="ap-hint">Daily delivery subscribers</p>
                </div>
                <div className="ap-field">
                  <label className="ap-label">
                    Buy Once Rate (₹) <span className="ap-required">*</span>
                  </label>
                  <input className="ap-input" type="number" name="buyOnceRate" value={form.buyOnceRate} onChange={handleField} placeholder="75" min="0" />
                  <p className="ap-hint">One-time purchases</p>
                </div>
                <div className="ap-field">
                  <label className="ap-label">GST Rate (%)</label>
                  <div className="ap-select-wrap">
                    <select className="ap-input ap-select" name="gst" value={form.gst} onChange={handleField}>
                      <option>0% (Exempt)</option>
                      <option>5%</option>
                      <option>12%</option>
                    </select>
                    <span className="material-symbols-outlined ap-select-arrow">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock & Availability */}
            <div className="ap-card">
              <div className="ap-card-heading">
                <span className="material-symbols-outlined ap-card-icon">inventory</span>
                <h3 className="ap-card-title">Stock &amp; Availability</h3>
              </div>
              <div className="ap-field-grid">
                <div className="ap-field">
                  <label className="ap-label">
                    Opening Stock Quantity <span className="ap-required">*</span>
                  </label>
                  <input className="ap-input" type="number" name="openingStock" value={form.openingStock} onChange={handleField} placeholder="80" min="0" />
                </div>
                <div className="ap-field">
                  <label className="ap-label">
                    Low Stock Threshold <span className="ap-required">*</span>
                  </label>
                  <input className="ap-input" type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleField} placeholder="10" min="0" />
                </div>
                <div className="ap-field">
                  <label className="ap-label">Shelf Life (Days)</label>
                  <input className="ap-input" type="number" name="shelfLife" value={form.shelfLife} onChange={handleField} placeholder="1" min="0" />
                </div>
                <div className="ap-field">
                  <label className="ap-label">Product Status</label>
                  <div className="ap-select-wrap">
                    <select className="ap-input ap-select" name="status" value={form.status} onChange={handleField}>
                      <option>Active — visible to customers</option>
                      <option>Draft — internal only</option>
                      <option>Archived</option>
                    </select>
                    <span className="material-symbols-outlined ap-select-arrow">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="ap-col-side">

            {/* Visibility */}
            <div className="ap-card">
              <div className="ap-card-heading">
                <span className="material-symbols-outlined ap-card-icon">visibility</span>
                <h3 className="ap-card-title">Visibility</h3>
              </div>
              <div className="ap-checkbox-list">
                {[
                  { key: "mobileApp",    label: "Show on mobile app" },
                  { key: "website",      label: "Show on website" },
                  { key: "subscription", label: "Available for subscription" },
                  { key: "buyOnce",      label: "Available for one-time buy" },
                ].map(item => (
                  <label key={item.key} className="ap-checkbox-row">
                    <input
                      type="checkbox"
                      className="ap-checkbox"
                      checked={visibility[item.key]}
                      onChange={() => toggleVis(item.key)}
                    />
                    <span className="ap-checkbox-label">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Product Images */}
            <div className="ap-card">
              <div className="ap-card-heading">
                <span className="material-symbols-outlined ap-card-icon">photo_camera</span>
                <h3 className="ap-card-title">Product Images</h3>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden />
              <div
                className={`ap-upload-zone${dragOver ? " ap-upload-zone-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined ap-upload-icon">cloud_upload</span>
                <p className="ap-upload-title">Click to upload product images</p>
                <p className="ap-upload-hint">JPG, PNG, WebP — max 2MB each — up to 6 images</p>
              </div>
              <div className="ap-image-grid">
                <div className="ap-image-slot ap-image-slot-filled">
                  <span className="material-symbols-outlined ap-image-icon-ph">image</span>
                </div>
                <div className="ap-image-slot ap-image-slot-empty">
                  <span className="material-symbols-outlined ap-image-icon-add">add</span>
                </div>
                <div className="ap-image-slot ap-image-slot-empty">
                  <span className="material-symbols-outlined ap-image-icon-add">add</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Product Content (full width) ── */}
        <div className="ap-card ap-card-full">
          <div className="ap-card-heading">
            <span className="material-symbols-outlined ap-card-icon">description</span>
            <h3 className="ap-card-title">Product Content</h3>
          </div>
          <div className="ap-content-fields">
            <div className="ap-field">
              <label className="ap-label">Short Description (shown on product card)</label>
              <input
                className="ap-input"
                type="text"
                name="shortDesc"
                value={form.shortDesc}
                onChange={handleField}
                placeholder="e.g. Fresh A2 Buffalo milk from grass-fed cows"
              />
            </div>
            <div className="ap-field">
              <label className="ap-label">Full Description (shown on product detail page)</label>
              <textarea
                className="ap-input ap-textarea"
                name="fullDesc"
                value={form.fullDesc}
                onChange={handleField}
                placeholder="Describe the product's origin, taste, and quality..."
                rows={4}
              />
            </div>
            <div className="ap-field">
              <label className="ap-label">Benefits (one per line)</label>
              <textarea
                className="ap-input ap-textarea"
                name="benefits"
                value={form.benefits}
                onChange={handleField}
                placeholder={"• Rich in A2 Beta-casein\n• Easily digestible\n• Farm fresh delivery"}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ── Warning callout ── */}
        <div className="ap-warning">
          <span className="material-symbols-outlined ap-warning-icon">warning</span>
          <p className="ap-warning-text">
            Fields marked <strong>*</strong> are required. Product ID is auto-generated by the system after saving. Once saved, the product is immediately visible on the app and website based on visibility settings above.
          </p>
        </div>

        {/* ── Sticky footer ── */}
        <div className="ap-footer">
          <p className="ap-footer-note">All required fields must be filled before saving</p>
          <div className="ap-footer-actions">
            <button type="button" className="ap-footer-btn-ghost" onClick={handleClear}>
              Clear form
            </button>
            <button type="submit" className="ap-footer-btn-primary">
              <span className="material-symbols-outlined ap-save-icon">check</span>
              Save new product
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

export { AdminAddProduct };
