import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AdminEditProduct.css";

const PRODUCT_DATA = {
  "PRD-001": {
    id: "PRD-001", name: "Cow milk (A2)",     icon: "water_drop",            iconBg: "#F5DFC8", iconBg2: "#d4eef8", iconBg3: "#d6f0de",
    category: "Milk",   unit: "Litre",
    subRate: "68", buyOnceRate: "75", gst: "0% (Exempt)",
    currentStock: "150", lowStockThreshold: "20", shelfLife: "1",
    status: "Active — visible to customers",
    shortDesc: "Pure A2 milk from Indigenous Gir cows. No preservatives, no adulteration.",
    fullDesc: "Pure A2 milk from Indigenous Gir cows. No preservatives, no adulteration. Farm fresh, delivered daily to your doorstep. Our cows are ethically raised on natural feed with no hormones or antibiotics.",
    benefits: "Rich in A2 protein\nOmega-3 fatty acids\nAids digestion\nNo hormones or antibiotics",
    lastSaved: "01 Apr 2024, 10:20 AM", lastSavedBy: "Admin (owner)",
  },
  "PRD-002": {
    id: "PRD-002", name: "Buffalo milk",       icon: "water_drop",            iconBg: "#e6e1e0", iconBg2: "#d4d0cf", iconBg3: "#c1c8c2",
    category: "Milk",   unit: "Litre",
    subRate: "52", buyOnceRate: "58", gst: "0% (Exempt)",
    currentStock: "18",  lowStockThreshold: "20", shelfLife: "1",
    status: "Active — visible to customers",
    shortDesc: "Fresh buffalo milk — rich, creamy, high-fat.",
    fullDesc: "Premium fresh buffalo milk with naturally high fat content. Sourced daily from ethically kept buffaloes. Ideal for making paneer, khoa, and rich desserts.",
    benefits: "High natural fat content\nRich in calcium\nIdeal for sweets and paneer",
    lastSaved: "28 Mar 2024, 07:00 AM", lastSavedBy: "Admin (owner)",
  },
  "PRD-003": {
    id: "PRD-003", name: "Cow ghee (A2)",      icon: "local_fire_department", iconBg: "#ffca98", iconBg2: "#ffdcbd", iconBg3: "#ffe8d0",
    category: "Ghee",   unit: "Kilogram",
    subRate: "620", buyOnceRate: "680", gst: "5%",
    currentStock: "42",  lowStockThreshold: "10", shelfLife: "365",
    status: "Active — visible to customers",
    shortDesc: "Pure cultured Gir cow ghee made by traditional Bilona method.",
    fullDesc: "Our A2 ghee is made from the milk of indigenous Gir cows using the traditional bilona (hand-churned) method. It retains all the natural nutrients, aroma, and medicinal properties.",
    benefits: "Hand-churned bilona method\nRich in fat-soluble vitamins\nBoosts immunity\nDairy A2 protein",
    lastSaved: "15 Mar 2024, 11:30 AM", lastSavedBy: "Admin (owner)",
  },
};

function getProduct(id) {
  return PRODUCT_DATA[id] || PRODUCT_DATA["PRD-001"];
}

function AdminEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = getProduct(id);

  const [form, setForm] = useState({
    name:               product.name,
    category:           product.category,
    unit:               product.unit,
    subRate:            product.subRate,
    buyOnceRate:        product.buyOnceRate,
    gst:                product.gst,
    currentStock:       product.currentStock,
    lowStockThreshold:  product.lowStockThreshold,
    shelfLife:          product.shelfLife,
    status:             product.status,
    shortDesc:          product.shortDesc,
    fullDesc:           product.fullDesc,
    benefits:           product.benefits,
  });

  const [visibility, setVisibility] = useState({
    mobileApp: true, website: true, subscription: true, buyOnce: true,
  });

  function handleField(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function toggleVis(key) {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleDiscard() {
    setForm({
      name:               product.name,
      category:           product.category,
      unit:               product.unit,
      subRate:            product.subRate,
      buyOnceRate:        product.buyOnceRate,
      gst:                product.gst,
      currentStock:       product.currentStock,
      lowStockThreshold:  product.lowStockThreshold,
      shelfLife:          product.shelfLife,
      status:             product.status,
      shortDesc:          product.shortDesc,
      fullDesc:           product.fullDesc,
      benefits:           product.benefits,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div className="ep-page">

      {/* ── Breadcrumbs + header ── */}
      <div className="ep-header">
        <div>
          <div className="ep-breadcrumbs">
            <button type="button" className="ep-breadcrumb-link" onClick={() => navigate("/admin/products")}>
              Products
            </button>
            <span className="material-symbols-outlined ep-breadcrumb-sep">chevron_right</span>
            <span className="ep-breadcrumb-active">Edit Product</span>
          </div>
          <h1 className="ep-title">Edit product — {product.name} — {product.id}</h1>
        </div>
        <button type="button" className="ep-cancel-btn" onClick={() => navigate("/admin/products")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Cancel
        </button>
      </div>

      {/* ── Info alert ── */}
      <div className="ep-info-alert">
        <span className="material-symbols-outlined ep-info-icon">info</span>
        <p className="ep-info-text">
          Changing the subscription rate or buy-once rate applies to <strong>new orders only</strong>. All existing customer bills use the rate that was active at the time of delivery. Rate change history is saved automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="ep-grid">

          {/* ── Left column (2/3) ── */}
          <div className="ep-col-main">

            {/* Basic Information */}
            <section className="ep-card">
              <div className="ep-card-heading">
                <span className="material-symbols-outlined ep-card-icon">info</span>
                <h3 className="ep-card-title">Basic Information</h3>
              </div>
              <div className="ep-field-grid">
                <div className="ep-field">
                  <label className="ep-label">Product ID (auto, cannot edit)</label>
                  <input className="ep-input ep-input-disabled" type="text" value={product.id} disabled />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Product name</label>
                  <input className="ep-input" type="text" name="name" value={form.name} onChange={handleField} />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Category</label>
                  <div className="ep-select-wrap">
                    <select className="ep-input ep-select" name="category" value={form.category} onChange={handleField}>
                      <option>Milk</option>
                      <option>Ghee</option>
                      <option>Paneer</option>
                      <option>Yogurt</option>
                      <option>Curd</option>
                      <option>Butter</option>
                      <option>Sweet</option>
                    </select>
                    <span className="material-symbols-outlined ep-select-arrow">expand_more</span>
                  </div>
                </div>
                <div className="ep-field">
                  <label className="ep-label">Unit of measurement</label>
                  <div className="ep-select-wrap">
                    <select className="ep-input ep-select" name="unit" value={form.unit} onChange={handleField}>
                      <option>Litre</option>
                      <option>Kilogram</option>
                      <option>Pack (500g)</option>
                      <option>Bottle</option>
                      <option>100g</option>
                      <option>200ml</option>
                    </select>
                    <span className="material-symbols-outlined ep-select-arrow">expand_more</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="ep-card">
              <div className="ep-card-heading">
                <span className="material-symbols-outlined ep-card-icon">payments</span>
                <h3 className="ep-card-title">Pricing</h3>
              </div>
              <div className="ep-field-grid ep-field-grid-3">
                <div className="ep-field">
                  <label className="ep-label">Subscription rate (₹)</label>
                  <input className="ep-input" type="number" name="subRate" value={form.subRate} onChange={handleField} min="0" />
                  <p className="ep-hint">charged per litre for daily delivery customers</p>
                </div>
                <div className="ep-field">
                  <label className="ep-label">Buy once rate (₹)</label>
                  <input className="ep-input" type="number" name="buyOnceRate" value={form.buyOnceRate} onChange={handleField} min="0" />
                  <p className="ep-hint">charged per litre for one-time purchases</p>
                </div>
                <div className="ep-field">
                  <label className="ep-label">GST rate (%)</label>
                  <div className="ep-select-wrap">
                    <select className="ep-input ep-select" name="gst" value={form.gst} onChange={handleField}>
                      <option>0% (Exempt)</option>
                      <option>5%</option>
                      <option>12%</option>
                    </select>
                    <span className="material-symbols-outlined ep-select-arrow">expand_more</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Product Content */}
            <section className="ep-card">
              <div className="ep-card-heading">
                <span className="material-symbols-outlined ep-card-icon">description</span>
                <h3 className="ep-card-title">Product Content</h3>
              </div>
              <div className="ep-content-fields">
                <div className="ep-field">
                  <label className="ep-label">Short description (shown on product card)</label>
                  <input className="ep-input" type="text" name="shortDesc" value={form.shortDesc} onChange={handleField} />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Full description (shown on product detail page)</label>
                  <textarea className="ep-input ep-textarea" name="fullDesc" value={form.fullDesc} onChange={handleField} rows={3} />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Benefits (one per line — shown as tags on product page)</label>
                  <textarea className="ep-input ep-textarea ep-textarea-mono" name="benefits" value={form.benefits} onChange={handleField} rows={4} />
                </div>
              </div>
            </section>

          </div>

          {/* ── Right column (1/3) ── */}
          <div className="ep-col-side">

            {/* Availability */}
            <section className="ep-card">
              <div className="ep-card-heading">
                <span className="material-symbols-outlined ep-card-icon">inventory</span>
                <h3 className="ep-card-title">Availability</h3>
              </div>
              <div className="ep-side-fields">
                <div className="ep-field">
                  <label className="ep-label">Current stock quantity</label>
                  <input className="ep-input" type="number" name="currentStock" value={form.currentStock} onChange={handleField} min="0" />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Low stock alert threshold</label>
                  <input className="ep-input" type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleField} min="0" />
                  <p className="ep-hint">admin gets alert when stock falls below this number</p>
                </div>
                <div className="ep-field">
                  <label className="ep-label">Shelf life (days) — for expiry tracking</label>
                  <input className="ep-input" type="number" name="shelfLife" value={form.shelfLife} onChange={handleField} min="0" />
                  <p className="ep-hint">used in production carry-forward expiry logic</p>
                </div>
                <div className="ep-field">
                  <label className="ep-label">Product status</label>
                  <div className="ep-select-wrap">
                    <select className="ep-input ep-select" name="status" value={form.status} onChange={handleField}>
                      <option>Active — visible to customers</option>
                      <option>Draft</option>
                      <option>Discontinued</option>
                    </select>
                    <span className="material-symbols-outlined ep-select-arrow">expand_more</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Visibility */}
            <section className="ep-card">
              <div className="ep-card-heading">
                <span className="material-symbols-outlined ep-card-icon">visibility</span>
                <h3 className="ep-card-title">Visibility</h3>
              </div>
              <div className="ep-checkbox-list">
                {[
                  { key: "mobileApp",    label: "Show on mobile app" },
                  { key: "website",      label: "Show on website" },
                  { key: "subscription", label: "Available for subscription" },
                  { key: "buyOnce",      label: "Available for one-time buy" },
                ].map(item => (
                  <label key={item.key} className="ep-checkbox-row">
                    <input
                      type="checkbox"
                      className="ep-checkbox"
                      checked={visibility[item.key]}
                      onChange={() => toggleVis(item.key)}
                    />
                    <span className="ep-checkbox-label">{item.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Product Images */}
            <section className="ep-card">
              <div className="ep-card-heading">
                <span className="material-symbols-outlined ep-card-icon">image</span>
                <h3 className="ep-card-title">Product Images</h3>
              </div>
              <div className="ep-image-grid">
                {/* Primary image slot */}
                <div className="ep-image-slot ep-image-primary">
                  <div className="ep-img-box" style={{ background: product.iconBg }}>
                    <span className="material-symbols-outlined ep-img-icon">{product.icon}</span>
                  </div>
                  <div className="ep-primary-badge">Primary</div>
                  <button type="button" className="ep-img-remove">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                {/* Slot 2 */}
                <div className="ep-image-slot">
                  <div className="ep-img-box" style={{ background: product.iconBg2 }}>
                    <span className="material-symbols-outlined ep-img-icon">opacity</span>
                  </div>
                  <button type="button" className="ep-img-remove">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                {/* Slot 3 */}
                <div className="ep-image-slot">
                  <div className="ep-img-box" style={{ background: product.iconBg3 }}>
                    <span className="material-symbols-outlined ep-img-icon">eco</span>
                  </div>
                  <button type="button" className="ep-img-remove">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                {/* Add new image */}
                <button type="button" className="ep-image-add">
                  <span className="material-symbols-outlined">add</span>
                  <span className="ep-image-add-label">Add Image</span>
                </button>
              </div>
              <p className="ep-image-hint">Click any image to set as primary. Drag to reorder. Max 6 images. Recommended: 800×800 px.</p>
            </section>

          </div>
        </div>

        {/* ── Sticky footer ── */}
        <footer className="ep-footer">
          <p className="ep-footer-meta">
            Last saved: {product.lastSaved} — by {product.lastSavedBy}
          </p>
          <div className="ep-footer-actions">
            <button type="button" className="ep-discard-btn" onClick={handleDiscard}>
              Discard changes
            </button>
            <button type="submit" className="ep-save-btn">
              <span className="material-symbols-outlined">save</span>
              Save changes
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}

export { AdminEditProduct };
