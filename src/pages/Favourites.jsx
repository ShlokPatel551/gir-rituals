import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Favourites.css";

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

function FavCard({ p, onRemove, onAddToCart }) {
  const img   = PRODUCT_IMGS[p.id];
  const badge = PRODUCT_BADGES[p.id];

  return (
    <div className="fv-card">
      <div className="fv-img-wrap">
        {img ? (
          <img
            src={img}
            alt={p.name}
            className="fv-img"
            onError={e => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="fv-img-fallback">{p.image}</div>
        )}

        <button
          type="button"
          className="fv-remove-btn"
          onClick={() => onRemove(p.id)}
          aria-label="Remove from favourites"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: 18 }}
          >favorite</span>
        </button>

        {badge && (
          <span className={`fv-badge fv-badge-${badge.variant}`}>{badge.label}</span>
        )}
      </div>

      <div className="fv-body">
        <div className="fv-title-row">
          <h3 className="fv-name">
            <Link to={`/products/${p.id}`} className="fv-name-link">{p.name}</Link>
          </h3>
          <span className="fv-price">
            ₹{p.price}<span className="fv-unit">/{p.unit}</span>
          </span>
        </div>

        <p className="fv-desc">{p.benefits?.[0] ?? p.description}</p>

        <button
          type="button"
          className="fv-cart-btn"
          onClick={() => onAddToCart(p.id, p.name)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function Favourites() {
  const { favourites, toggleFavourite, addToCart, products } = useApp();
  const { showToast } = useToast();

  const items = products.filter(p => favourites.includes(p.id));

  function handleRemove(id) {
    const p = products.find(x => x.id === id);
    toggleFavourite(id);
    if (p) showToast(`${p.name} removed from favourites`);
  }

  function handleAddToCart(id, name) {
    addToCart(id);
    showToast(`${name} added to cart!`);
  }

  return (
    <div className="fv-page">
      <section className="fv-header">
        <div className="fv-header-inner">
          <div>
            <h2 className="fv-title">My Favourites</h2>
            <p className="fv-subtitle">Your curated collection of sacred dairy.</p>
          </div>
          {items.length > 0 && (
            <span className="fv-count">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </section>

      {items.length === 0 ? (
        <div className="fv-empty">
          <span className="material-symbols-outlined fv-empty-icon">favorite</span>
          <h3 className="fv-empty-title">No favourites yet</h3>
          <p className="fv-empty-desc">Tap the heart on any product to save it here.</p>
          <Link to="/products" className="fv-empty-cta">Browse Products</Link>
        </div>
      ) : (
        <div className="fv-grid">
          {items.map(p => (
            <FavCard key={p.id} p={p} onRemove={handleRemove} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

export { Favourites };
