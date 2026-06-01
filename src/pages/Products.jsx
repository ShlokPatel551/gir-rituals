import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Products.css";

/* ── Lifestyle images per product id ─────────────────────────────────────── */
const PRODUCT_IMGS = {
  milk:   "https://lh3.googleusercontent.com/aida-public/AB6AXuAR_BT_aSHwIoRnqUQzLW3rTHnWzadTsx6FHw33wIoLcdg7KfPPm4WkqJXtDWsaWgIi0Fe44awYr9udGyCClyLFC6zoCefRTK_Hffvtjzq8Pa2hw-ODBc0X3yqaP_PNO7vyWXNy64WFHbmKoRbwFbUuh1a0NLzvCWmHB-CyAQHCtzyOcTqNS--CV3_7wgawJlsusLlT4kVs9HXvoJMCUy0zkUsX0Gq9fBXgZCkZ_qVyjAaJ09ttp2AsCRsSfw68imzGHoUOm9v5zsAV",
  ghee:   "https://lh3.googleusercontent.com/aida-public/AB6AXuBkH9cRyZJ4ygV5bs5ynGbMnGTi9gdyXJlECQ-Bf0f4APbUFkg775QtOIQ11Oxz1oNZJBYlWdW2He_fZPLu2UQGOUajNuAHSzPmhiJf14zEFMH87nd2W6-3leaYwmlIbjSLMGK3-c3FQWX3yUFoG2r8fKUYIsB6eNVCF-_FSjX2yu1Qb7VxQOkjPuCHj8cxWOyrlan6rJQJjiNPcOEZyj6YiK3Xg8JQdx439tGU_oraelPPg8EcC1rCUkIea0Wpp06W-6TUcnwap535",
  curd:   "https://lh3.googleusercontent.com/aida-public/AB6AXuCJVc_ovarKYrMnx3sR0I6N_Zq8txjHNTISD5rnYwtIgNBKnnD46q65rzPmYnRW20sB62N2eJs3pDNIvD6ENqt8Bc9HZlsP5XoGz2Aw0kIyAexVaByPaeSdX5MK-c4nmP1UPdlH3QNhI502MHcyLQU1VBS3K5iaGi_e4jLFEUFpq-a2mQPJchjsjbvEaJW8rBJFDtXzpx-qtNU1yYjyW2h9CFiv_TvT89A6fHulmU0zalR_Py5foUpYbgfH1lhASScUV4fRLd8kU2Ii",
  paneer: "https://lh3.googleusercontent.com/aida-public/AB6AXuBu0Z2CDluHXs1ZlUK16okWtcxJeMb1VXiUL1Fkr3RfetTPvySZZcTFkoQ31mEGnBjh6dJHOb3rLYBn7FepRThPMy4z5DW2Ybq83kj0YWaIEFzv-57-6XSchWzKlyMhoIyUGfQJ5L0qFGeirv12wIfo6tGaBF0uDYZhZ3KgToqELvlwR8ydudykGIpAuy0pq09vVNOVrr3okQq20o6qS2Ch3pNswlOxRLVC1bcx2dUAFt9fF5hS1lq2Q4CEySdw_cqi2n3QWMgSeuhb",
  honey:  "https://lh3.googleusercontent.com/aida-public/AB6AXuAFh2oxtDJTMYnZwDPxM81QFh2YEJHcprWtjmD-YR-t7hgLFnhbCjdATbWHy9aaoWnrZnz3gpkR5wkix2sLy2jEF86sKy_jjOCrVzy79f5cdSOzWOnatq7y3wH6ZiGKRtNXyErgp-HA5BRDalRAWDNnSBm0wembnDLUjni4dX2FrBtuZcsyRdDat7WQcI2zWobN6GYFuiDAjgNgXVxoXq-4_RizbN3IQwdXVttjbqRAhJSLzDAPczfX5pic8jlnufKN2abDGtT0-FzL",
  butter: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Z5MVtDJeWRp1xPojfOL7yibxfOb6Uxm0FzAQbMcf6QCUZZc6eJZdSTv9eBFC-VRjpVywWccf_SI5WEPwSHxT0BdzhSOp3x6OOaf4lT8YRCxRWqhejFuhCfQw-iaG-OK_m9pmr8WTTMVB-j-QQk1dfz27pXVyw0Ihj9NhwFSWyc5X4n1wm9wbqsktUzxmsUbKsyBsNGHlBbr5bdGw440WbuqE3gRF0T1PHnAuZhniyXU0HpWc7vS225P_m5RVsYSh1wM__5HuyEIQ",
};

const PRODUCT_BADGES = {
  milk:   { label: "Limited Batch", variant: "dark" },
  ghee:   { label: "Vedic Method",  variant: "warm" },
  curd:   { label: "Probiotic",     variant: "gold" },
  paneer: { label: "Farm Fresh",    variant: "dark" },
  honey:  { label: "Raw Harvest",   variant: "gold" },
  butter: { label: "Artisanal",     variant: "warm" },
};

const CATEGORIES = [
  { key: "all",    label: "All Offerings" },
  { key: "milk",   label: "A2 Fresh Milk" },
  { key: "ghee",   label: "Vedic Ghee" },
  { key: "curd",   label: "Probiotic Curds" },
  { key: "paneer", label: "Artisanal Paneer" },
];

/* ── Single product card ─────────────────────────────────────────────────── */
function ProductCard({ p, isFav, onToggleFav, onAddToCart }) {
  const [qty, setQty]     = useState(1);
  const [subOn, setSubOn] = useState(false);
  const img   = PRODUCT_IMGS[p.id];
  const badge = PRODUCT_BADGES[p.id];

  return (
    <div className="pc-card">
      {/* Image */}
      <div className="pc-img-wrap">
        {img ? (
          <img
            src={img}
            alt={p.name}
            className="pc-img"
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="pc-img-fallback">{p.image}</div>
        )}

        <button
          type="button"
          className={`pc-fav-btn${isFav ? " pc-fav-on" : ""}`}
          onClick={() => onToggleFav(p.id)}
          aria-label={isFav ? "Remove favourite" : "Add to favourites"}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0", fontSize: 18 }}
          >favorite</span>
        </button>

        {badge && (
          <span className={`pc-badge pc-badge-${badge.variant}`}>{badge.label}</span>
        )}
      </div>

      {/* Body */}
      <div className="pc-body">
        <div className="pc-title-row">
          <h3 className="pc-name">
            <Link to={`/products/${p.id}`} className="pc-name-link">{p.name}</Link>
          </h3>
          <span className="pc-price">₹{p.price}<span className="pc-unit">/{p.unit}</span></span>
        </div>

        <p className="pc-desc">{p.benefits?.[0] ?? p.description}</p>

        <div className="pc-interactions">
          <div className="pc-controls-row">
            {/* Qty stepper */}
            <div className="pc-stepper">
              <button
                type="button"
                className="pc-step-btn"
                onClick={() => setQty(q => Math.max(1, q - 1))}
              >−</button>
              <span className="pc-qty">{qty}</span>
              <button
                type="button"
                className="pc-step-btn"
                onClick={() => setQty(q => q + 1)}
              >+</button>
            </div>

            {/* Subscription toggle */}
            <div className="pc-sub-row">
              <span className="pc-sub-lbl">Subscription</span>
              <button
                type="button"
                className={`pc-toggle${subOn ? " pc-toggle-on" : ""}`}
                onClick={() => setSubOn(s => !s)}
                aria-label="Toggle subscription"
              >
                <div className={`pc-knob${subOn ? " pc-knob-on" : ""}`} />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="pc-add-btn"
            onClick={() => onAddToCart(p.id, p.name, qty)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Products list page ──────────────────────────────────────────────────── */
function Products() {
  const { favourites, toggleFavourite, addToCart, products } = useApp();
  const { showToast } = useToast();

  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("default");
  const [category, setCategory] = useState("all");

  const handleAddToCart = (id, name, qty) => {
    for (let i = 0; i < qty; i++) addToCart(id);
    showToast(`${name} added to cart!`);
  };

  const handleToggleFav = (id) => {
    const isFav = favourites.includes(id);
    toggleFavourite(id);
    const p = products.find(x => x.id === id);
    if (p) showToast(isFav ? `${p.name} removed from favourites` : `${p.name} added to favourites!`);
  };

  const filtered = products
    .filter(p =>
      (category === "all" || p.id === category) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "price-asc")  return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="pr-page">

      {/* ══ HEADER ══ */}
      <section className="pr-header">
        <div className="pr-header-top">
          <div>
            <h2 className="pr-title">The Milk of Antiquity</h2>
            <p className="pr-subtitle">
              Pure A2 Vedic Gir Cow milk and artisanal dairy products, delivered with the reverence of a morning ritual.
            </p>
          </div>
          <div className="pr-sort-row">
            <span className="pr-sort-label">Sort By</span>
            <select
              className="pr-sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="default">Most Ritualistic</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="pr-cat-strip">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              className={`pr-cat-btn${category === c.key ? " pr-cat-active" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ══ BODY: FILTERS + GRID ══ */}
      <div className="pr-body">

        {/* Filter sidebar */}
        <aside className="pr-filters">
          <div className="pr-filter-group">
            <h4 className="pr-filter-heading">Subscription Plan</h4>
            <div className="pr-filter-list">
              {["Daily Ritual", "Alternate Days", "Weekend Wellness"].map(opt => (
                <label key={opt} className="pr-filter-item">
                  <input type="checkbox" className="pr-checkbox" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pr-filter-group">
            <h4 className="pr-filter-heading">Purity Markers</h4>
            <div className="pr-filter-list">
              {["A2 Certified", "Organic Fodder", "Cruelty Free"].map(opt => (
                <label key={opt} className="pr-filter-item">
                  <input type="checkbox" className="pr-checkbox" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pr-filter-cta-card">
            <h5 className="pr-filter-cta-title">Custom Ritual?</h5>
            <p className="pr-filter-cta-desc">
              Chat with our dairy sommelier to curate your subscription.
            </p>
            <Link to="/contact" className="pr-filter-cta-btn">Support</Link>
          </div>
        </aside>

        {/* Product grid + bento */}
        <div className="pr-content">
          {filtered.length === 0 ? (
            <div className="pr-empty">
              <span className="material-symbols-outlined pr-empty-icon">search_off</span>
              <p className="pr-empty-msg">
                No products found{search ? ` for "${search}"` : ""}.
              </p>
            </div>
          ) : (
            <div className="pr-grid">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  p={p}
                  isFav={favourites.includes(p.id)}
                  onToggleFav={handleToggleFav}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {/* ── Freshness Guarantee bento ── */}
          <div className="pr-bento">
            <div className="pr-bento-main">
              <div className="pr-bento-text">
                <h2 className="pr-bento-title">The 5:00 AM Freshness Guarantee.</h2>
                <p className="pr-bento-desc">
                  We deliver our milk within hours of milking, ensuring every drop retains
                  its life force and nutritional integrity.
                </p>
                <Link to="/schedule" className="pr-bento-cta">Start Your Ritual</Link>
              </div>
              <div className="pr-bento-watermark" aria-hidden="true">
                <span className="material-symbols-outlined">water_drop</span>
              </div>
            </div>

            <div className="pr-bento-side">
              <div>
                <span
                  className="material-symbols-outlined pr-bento-icon"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >verified</span>
                <h3 className="pr-bento-side-title">A2 Purity Certified</h3>
                <p className="pr-bento-side-desc">
                  Our cows are DNA tested for the A2 beta-casein protein, ensuring zero
                  digestive discomfort.
                </p>
              </div>
              <Link to="/about" className="pr-bento-side-link">
                Learn More
                <span className="material-symbols-outlined">arrow_right_alt</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Products };
