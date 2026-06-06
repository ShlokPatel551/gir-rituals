import { useNavigate, useParams } from "react-router-dom";
import "./AdminViewProduct.css";

const PRODUCT_DATA = {
  "PRD-001": {
    id: "PRD-001",
    name: "Cow milk (A2)",
    icon: "water_drop", iconBg: "#c1ecd4",
    icon2: "opacity",   iconBg2: "#d4eef8",
    icon3: "eco",       iconBg3: "#d6f0de",
    category: "Milk",   catCls: "pv-cat-milk",
    unit: "1 Litre",
    subRate: "₹68",     subRateUnit: "/ litre",
    buyRate: "₹75",     buyRateUnit: "/ litre",
    currentStock: "150 litres",
    stockStatusLabel: "In stock",  stockStatusCls: "pv-badge-instock",
    stockThreshold: "Below 20 litres — alert triggered",
    stockThresholdCls: "pv-threshold-alert",
    description: "Pure A2 milk from indigenous Gir cows. No preservatives, no adulteration. Farm fresh, delivered daily within 3 hours of milking to ensure peak nutritional integrity.",
    benefits: ["Rich in A2 protein", "Omega-3 fatty acids", "Aids digestion", "No hormones"],
    recipes: "3 recipes",
    recipesNote: "Masala milk, Haldi doodh, Shrikhand",
    createdOn: "12 Jan 2025", createdBy: "Admin (owner)",
    lastUpdated: "01 Apr 2026", lastUpdatedNote: "rate changed ₹65 → ₹68",
    statusLabel: "Active",
    channels: ["App", "Website"],
    visibilityNote: "Visible on mobile app and customer storefront",
  },
  "PRD-002": {
    id: "PRD-002",
    name: "Buffalo milk",
    icon: "water_drop", iconBg: "#e6e1e0",
    icon2: "opacity",   iconBg2: "#d4d0cf",
    icon3: "eco",       iconBg3: "#c1c8c2",
    category: "Milk",   catCls: "pv-cat-milk",
    unit: "1 Litre",
    subRate: "₹52",     subRateUnit: "/ litre",
    buyRate: "₹58",     buyRateUnit: "/ litre",
    currentStock: "18 litres",
    stockStatusLabel: "Low stock", stockStatusCls: "pv-badge-lowstock",
    stockThreshold: "Below 20 litres — alert triggered",
    stockThresholdCls: "pv-threshold-alert",
    description: "Premium fresh buffalo milk with naturally high fat content. Sourced daily from ethically kept buffaloes. Ideal for making paneer, khoa, and rich Indian sweets.",
    benefits: ["High natural fat", "Rich in calcium", "Ideal for sweets", "Farm fresh"],
    recipes: "2 recipes",
    recipesNote: "Paneer, Khoa barfi",
    createdOn: "15 Jan 2025", createdBy: "Admin (owner)",
    lastUpdated: "28 Mar 2026", lastUpdatedNote: "stock updated",
    statusLabel: "Active",
    channels: ["App", "Website"],
    visibilityNote: "Visible on mobile app and customer storefront",
  },
  "PRD-003": {
    id: "PRD-003",
    name: "Cow ghee (A2)",
    icon: "local_fire_department", iconBg: "#ffca98",
    icon2: "local_fire_department", iconBg2: "#ffdcbd",
    icon3: "eco",                   iconBg3: "#d6f0de",
    category: "Ghee",  catCls: "pv-cat-ghee",
    unit: "500g",
    subRate: "₹620",   subRateUnit: "/ 500g",
    buyRate: "₹680",   buyRateUnit: "/ 500g",
    currentStock: "42 kg",
    stockStatusLabel: "In stock", stockStatusCls: "pv-badge-instock",
    stockThreshold: "Below 10 kg",
    stockThresholdCls: "pv-threshold-normal",
    description: "Pure A2 ghee made from the milk of indigenous Gir cows using the traditional bilona (hand-churned) method. Retains all natural nutrients, aroma, and medicinal properties.",
    benefits: ["Hand-churned bilona", "Fat-soluble vitamins", "Boosts immunity", "A2 protein"],
    recipes: "5 recipes",
    recipesNote: "Dal tadka, Khichdi, Halwa, Roti, Laddoo",
    createdOn: "10 Jan 2025", createdBy: "Admin (owner)",
    lastUpdated: "15 Mar 2026", lastUpdatedNote: "description updated",
    statusLabel: "Active",
    channels: ["App", "Website"],
    visibilityNote: "Visible on mobile app and customer storefront",
  },
};

const FALLBACK = PRODUCT_DATA["PRD-001"];

function AdminViewProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const p = PRODUCT_DATA[id] || { ...FALLBACK, id: id || "PRD-001" };

  return (
    <div className="pv-page">

      {/* ── Header / actions ── */}
      <div className="pv-header">
        <div className="pv-header-left">
          <button type="button" className="pv-back-btn" onClick={() => navigate("/admin/products")}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to products
          </button>
          <div className="pv-title-block">
            <div className="pv-breadcrumb-row">
              <span className="pv-breadcrumb-label">Product Detail</span>
              <span className="pv-breadcrumb-line" />
            </div>
            <h2 className="pv-product-name">{p.name}</h2>
          </div>
        </div>
        <div className="pv-header-actions">
          <button type="button" className="pv-edit-btn" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
            <span className="material-symbols-outlined">edit</span>
            Edit this product
          </button>
          <button type="button" className="pv-deactivate-btn">
            <span className="material-symbols-outlined">visibility_off</span>
            Deactivate
          </button>
        </div>
      </div>

      {/* ── Bento grid ── */}
      <div className="pv-grid">

        {/* ── Left column (images + status) ── */}
        <div className="pv-col-left">

          {/* Image card */}
          <div className="pv-card pv-image-card">
            {/* Main image */}
            <div className="pv-main-image-wrap">
              <div className="pv-main-image" style={{ background: p.iconBg }}>
                <span className="material-symbols-outlined pv-main-icon">{p.icon}</span>
              </div>
              <span className="pv-primary-badge">Primary</span>
            </div>

            {/* Thumbnail strip */}
            <div className="pv-thumb-grid">
              <div className="pv-thumb pv-thumb-active" style={{ background: p.iconBg }}>
                <span className="material-symbols-outlined pv-thumb-icon">{p.icon}</span>
              </div>
              <div className="pv-thumb" style={{ background: p.iconBg2 }}>
                <span className="material-symbols-outlined pv-thumb-icon">{p.icon2}</span>
              </div>
              <div className="pv-thumb pv-thumb-add">
                <span className="material-symbols-outlined pv-thumb-add-icon">add</span>
              </div>
            </div>

            <p className="pv-image-hint">Green border = Primary image shown to customer</p>
          </div>

          {/* Status / visibility card */}
          <div className="pv-card pv-status-card">
            <div className="pv-status-row">
              <span className="pv-status-key">Status</span>
              <span className="pv-badge-active">{p.statusLabel}</span>
            </div>
            <div className="pv-status-row pv-status-row-bottom">
              <span className="pv-status-key">Channels</span>
              <div className="pv-channel-list">
                {p.channels.map(ch => (
                  <span key={ch} className="pv-channel-badge">{ch}</span>
                ))}
              </div>
            </div>
            <div className="pv-visibility-note">
              <span className="material-symbols-outlined pv-note-icon">info</span>
              <p className="pv-note-text">{p.visibilityNote}</p>
            </div>
          </div>
        </div>

        {/* ── Right column (spec table) ── */}
        <div className="pv-col-right">
          <div className="pv-card pv-spec-card">

            {/* Card header */}
            <div className="pv-spec-header">
              <h3 className="pv-spec-title">Core Specifications</h3>
            </div>

            <div className="pv-spec-body">

              {/* Product Name */}
              <div className="pv-spec-row">
                <span className="pv-spec-label">Product Name</span>
                <span className="pv-spec-value pv-spec-value-bold">{p.name}</span>
              </div>

              {/* Category */}
              <div className="pv-spec-row">
                <span className="pv-spec-label">Category</span>
                <span className={`pv-cat-badge ${p.catCls}`}>{p.category}</span>
              </div>

              {/* Unit */}
              <div className="pv-spec-row">
                <span className="pv-spec-label">Unit / Size</span>
                <span className="pv-spec-value">{p.unit}</span>
              </div>

              {/* Pricing */}
              <div className="pv-spec-row pv-spec-row-tall">
                <span className="pv-spec-label">Pricing Model</span>
                <div className="pv-price-grid">
                  <div className="pv-price-block">
                    <p className="pv-price-label">Subscription Rate</p>
                    <p className="pv-price-big pv-price-primary">
                      {p.subRate} <span className="pv-price-unit">{p.subRateUnit}</span>
                    </p>
                  </div>
                  <div className="pv-price-block">
                    <p className="pv-price-label">One-time Purchase</p>
                    <p className="pv-price-big pv-price-secondary">
                      {p.buyRate} <span className="pv-price-unit">{p.buyRateUnit}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Current stock */}
              <div className="pv-spec-row">
                <span className="pv-spec-label">Current Stock</span>
                <div className="pv-stock-row">
                  <span className="pv-stock-qty">{p.currentStock}</span>
                  <span className={`pv-stock-badge ${p.stockStatusCls}`}>{p.stockStatusLabel}</span>
                </div>
              </div>

              {/* Stock threshold */}
              <div className="pv-spec-row">
                <span className="pv-spec-label">Stock Threshold</span>
                <span className={`pv-threshold ${p.stockThresholdCls}`}>{p.stockThreshold}</span>
              </div>

              {/* Description */}
              <div className="pv-spec-row pv-spec-row-desc">
                <span className="pv-spec-label">Detailed Description</span>
                <div className="pv-desc-block">
                  <p className="pv-desc-text">{p.description}</p>
                  <div className="pv-benefits">
                    {p.benefits.map(b => (
                      <span key={b} className="pv-benefit-tag">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recipes */}
              <div className="pv-spec-row pv-spec-row-tinted">
                <span className="pv-spec-label">Recipes Integrated</span>
                <span className="pv-spec-value">
                  <strong>{p.recipes}</strong>
                  {" — "}
                  <span className="pv-recipes-note">{p.recipesNote}</span>
                </span>
              </div>

              {/* Created on */}
              <div className="pv-spec-row">
                <span className="pv-spec-label">Created on</span>
                <span className="pv-spec-value">
                  {p.createdOn} — by <strong>{p.createdBy}</strong>
                </span>
              </div>

              {/* Last updated */}
              <div className="pv-spec-row pv-spec-row-last">
                <span className="pv-spec-label">Last updated</span>
                <span className="pv-spec-value pv-last-updated">
                  {p.lastUpdated} — {p.lastUpdatedNote}
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export { AdminViewProduct };
