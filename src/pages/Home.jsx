import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Home.css";

/* ── Lifestyle images (AIDA-generated, same palette as reference design) ── */
const BANNER_SLIDES = [
  {
    id: "b1",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3tw0wLDkVuUDkSiijIK3NGmna1R3Ro67a9J4gMHYMwiELAIaHaraPRctTccSH7Q00oN34GndFbve9mnk_dUGqyr4LzTF4qcfnhfGPbUm47ef9f4LsCpl8JfFOFQqvDMy5Vi1lJ4QRU3fCZzl3g6KyUW98eqTBN2vlaCYdwweQgBTKB-8U1sCe2IzXAoKkesQ6VLPp1jbEPYTOKT5ZCJk2N9hBIVjK2wXjUCdd0PYCrWqXHNH4j1C8rpqoM4KNXvPBs0dsot5xQfUl",
    eyebrow: "SEASONAL RITUALS",
    title: "Bilona Ghee: Infused with Ancient Vedic Wisdom",
    cta: "Discover the Process",
    linkType: "product", linkId: "ghee",
  },
  {
    id: "b2",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP9surZqYxAFh7td60BgLbiF-ZnYeO644PBDJPMQQ3p3LmCJGlpM-eTq4BqaQ_1TVuAaQgCAKCv5auEuXgqvsHsOktHmr3UIVUlTNO3Tq0wFwOABonl44V_DJh6ECp-is5Tihc_MXCzS2GfhctBNyo2m5lqeaEYlRq1wqBqmkKwy-Dc1T7R51oRjUXMh8iOD2PdpgELHSpxbCUgCoYI7Y9RJy_-fHRCXTc2l6Xy1QzIkQMHihb3GyXdxStLQqfqmX69OYX0V8OiFb7",
    eyebrow: "MORNING RITUAL",
    title: "Start Your Day with Pure A2 Gir Cow Milk",
    cta: "Subscribe Now",
    linkType: "product", linkId: "milk",
  },
  {
    id: "b3",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfcykhebv5piwR3bsy4uMpxE0wZwOrg8Y0K5lHiZKcyE0_2LlUfMn_8Za-CJ9FAjSDZ4CresnlafXXHtEh9V0LJDb6FhYhxxQ5r2RSKyeTQO1sZoz3uqcQexZUBus7nYXcUDjJeFgpg3Mimkk2UhkTBiV2hZkKwmXgQw_PtPQxSYcyIa101JowmKpqBlJ4mwW6edgDpm6nLBXST4ljyNfAyheV3MnucyehwJ-GYARiyrUpdmQg6a7mHVeeyaWl-rpMqb6U_SRJ9oPu",
    eyebrow: "HERITAGE COLLECTION",
    title: "Hand-Churned Bilona Ghee — Pure Gold in a Jar",
    cta: "Shop Now",
    linkType: "product", linkId: "ghee",
  },
];

/* ── Product lifestyle photo overrides (keyed to product id) ── */
const PRODUCT_IMG = {
  milk:   "https://lh3.googleusercontent.com/aida-public/AB6AXuDB31B3FJvR6BwHjlsAWh5j67tFf20fBD1UYecMFJ2LzdqobgNh64oOkHvinTtSq6XQtmkR0zVqHz6ikEUcdXFASu_ZQRpDt1maIB0DiBEDOZSP81P8KvCmM-WGXCqxeI71KsrbtfoLWvgY3tTCkcupKMlSZ6Wz8Ve62_IK2EYO680hCBOUogilk4f_vvq5x-GvkS5Jp9d8ZCPAh7cFVUFbzfKlXSwado_dTC28aB2WiyjIJ0NJZ45b15g5vIfBq46ZKv9Bz2C8k0Xo",
  ghee:   "https://lh3.googleusercontent.com/aida-public/AB6AXuCfcykhebv5piwR3bsy4uMpxE0wZwOrg8Y0K5lHiZKcyE0_2LlUfMn_8Za-CJ9FAjSDZ4CresnlafXXHtEh9V0LJDb6FhYhxxQ5r2RSKyeTQO1sZoz3uqcQexZUBus7nYXcUDjJeFgpg3Mimkk2UhkTBiV2hZkKwmXgQw_PtPQxSYcyIa101JowmKpqBlJ4mwW6edgDpm6nLBXST4ljyNfAyheV3MnucyehwJ-GYARiyrUpdmQg6a7mHVeeyaWl-rpMqb6U_SRJ9oPu",
  curd:   "https://lh3.googleusercontent.com/aida-public/AB6AXuAwVjdlYAVIOT6NcVJE906dSmgKwOEc_GhvHKuAVxKZ_YqskxqkX1LbFtcW6hMMKAhKJpddrOr2ycDS8RpobINFGkFvfZOMf5BXx4E-KGfT2z6HRRi4-oKZ4bNssuSgvhSyeYG_0Q5MExfF3rELNToL2QeLnPO5d2sRrLMgjbijok_vZVadN9IJIcR0q3zuF8HI0hp3BSU12OyBQf84D6BsxcIm1OztkqDxbOt_WEnpPELLR0Q1qzOvLpqgnsRF8dCFxep63lNcR94M",
  paneer: "https://lh3.googleusercontent.com/aida-public/AB6AXuBu0Z2CDluHXs1ZlUK16okWtcxJeMb1VXiUL1Fkr3RfetTPvySZZcTFkoQ31mEGnBjh6dJHOb3rLYBn7FepRThPMy4z5DW2Ybq83kj0YWaIEFzv-57-6XSchWzKlyMhoIyUGfQJ5L0qFGeirv12wIfo6tGaBF0uDYZhZ3KgToqELvlwR8ydudykGIpAuy0pq09vVNOVrr3okQq20o6qS2Ch3pNswlOxRLVC1bcx2dUAFt9fF5hS1lq2Q4CEySdw_cqi2n3QWMgSeuhb",
  honey:  "https://lh3.googleusercontent.com/aida-public/AB6AXuAFh2oxtDJTMYnZwDPxM81QFh2YEJHcprWtjmD-YR-t7hgLFnhbCjdATbWHy9aaoWnrZnz3gpkR5wkix2sLy2jEF86sKy_jjOCrVzy79f5cdSOzWOnatq7y3wH6ZiGKRtNXyErgp-HA5BRDalRAWDNnSBm0wembnDLUjni4dX2FrBtuZcsyRdDat7WQcI2zWobN6GYFuiDAjgNgXVxoXq-4_RizbN3IQwdXVttjbqRAhJSLzDAPczfX5pic8jlnufKN2abDGtT0-FzL",
  butter: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Z5MVtDJeWRp1xPojfOL7yibxfOb6Uxm0FzAQbMcf6QCUZZc6eJZdSTv9eBFC-VRjpVywWccf_SI5WEPwSHxT0BdzhSOp3x6OOaf4lT8YRCxRWqhejFuhCfQw-iaG-OK_m9pmr8WTTMVB-j-QQk1dfz27pXVyw0Ihj9NhwFSWyc5X4n1wm9wbqsktUzxmsUbKsyBsNGHlBbr5bdGw440WbuqE3gRF0T1PHnAuZhniyXU0HpWc7vS225P_m5RVsYSh1wM__5HuyEIQ",
};

function ProductThumb({ productId, emoji, className }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = PRODUCT_IMG[productId];
  if (!src || imgFailed) {
    return <span className={className + " h-emoji-fallback"}>{emoji}</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={() => setImgFailed(true)}
    />
  );
}

function Home() {
  const navigate = useNavigate();
  const { rituals, togglePause, addExtra, products, user } = useApp();
  const { showToast } = useToast();

  const [bannerIdx, setBannerIdx] = useState(0);
  const [extraModal, setExtraModal] = useState(false);
  const [extraProduct, setExtraProduct] = useState("");
  const [extraQty, setExtraQty] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNER_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const slide = BANNER_SLIDES[bannerIdx];

  const handleBannerClick = () => {
    if (slide.linkType === "offer") navigate(`/offers/${slide.linkId}`);
    else navigate(`/products/${slide.linkId}`);
  };

  const openExtra = (productId) => {
    setExtraProduct(productId || products[0]?.id || "");
    setExtraQty(1);
    setExtraModal(true);
  };

  const confirmExtra = () => {
    addExtra(extraProduct, extraQty);
    setExtraModal(false);
    const p = products.find(x => x.id === extraProduct);
    showToast(`Extra ${p?.name} added!`);
  };

  const activeRitual = rituals.find(r => r.status !== "Paused" && r.status !== "Cancelled");
  const activeProduct = activeRitual ? products.find(p => p.id === activeRitual.productId) : null;

  return (
    <div className="home-page">

      {/* ══ HERO ══ */}
      <section className="h-hero">
        <div className="h-hero-top">
          <div>
            <h2 className="h-greeting">Namaste, {user?.firstName ?? "Guest"}.</h2>
            <p className="h-subtitle">
              {activeRitual ? "Your morning ritual is on its way." : "Start your daily ritual today."}
            </p>
          </div>
        </div>

        <div className="h-bento">
          {/* Delivery summary card */}
          <div className="h-delivery">
            <div className="h-delivery-thumb">
              <ProductThumb
                productId={activeProduct?.id}
                emoji={activeProduct?.image ?? "🌿"}
                className="h-delivery-photo"
              />
            </div>
            <div className="h-delivery-body">
              <div className="h-delivery-tags">
                <span className="h-tag-upcoming">UPCOMING DELIVERY</span>
                <span className="h-delivery-when">• Tomorrow, 6:00 AM</span>
              </div>
              <h3 className="h-delivery-title">
                {activeProduct?.name ?? "A2 Desi Cow Milk & Organic Ghee"}
              </h3>
              <div className="h-delivery-meta">
                <div>
                  <p className="h-meta-lbl">Quantity</p>
                  <p className="h-meta-val">
                    {activeRitual ? `${activeRitual.quantity} ${activeProduct?.unit}` : "2L + 500g"}
                  </p>
                </div>
                <div>
                  <p className="h-meta-lbl">Status</p>
                  <p className="h-meta-val h-status-green">
                    {activeRitual?.status ?? "Confirmed"}
                  </p>
                </div>
              </div>
            </div>
            <Link to="/schedule" className="h-manage-btn">Manage Ritual</Link>
          </div>

          {/* Membership card */}
          <div className="h-membership">
            <h3 className="h-mem-h">Ritual Member</h3>
            <p className="h-mem-body">
              You've saved ₹420 this month with your subscription plan.
            </p>
            <div className="h-billing-row">
              <span>NEXT BILLING</span>
              <span>24 OCT</span>
            </div>
            <div className="h-progress-bar">
              <div className="h-progress-fill" style={{ width: "66%" }} />
            </div>
            <Link to="/bills" className="h-mem-link">
              View Plan Details
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <div className="h-mem-glow" />
          </div>
        </div>
      </section>

      {/* ══ BANNER CAROUSEL ══ */}
      <section
        className="h-banner"
        role="button"
        tabIndex={0}
        onClick={handleBannerClick}
        onKeyDown={e => e.key === "Enter" && handleBannerClick()}
      >
        <img
          className="h-banner-bg"
          src={slide.img}
          alt=""
          onError={e => { e.target.style.opacity = "0"; }}
        />
        <div className="h-banner-overlay">
          <span className="h-banner-eyebrow">{slide.eyebrow}</span>
          <h2 className="h-banner-title">{slide.title}</h2>
          <button
            type="button"
            className="h-banner-cta"
            onClick={e => { e.stopPropagation(); handleBannerClick(); }}
          >
            {slide.cta}
          </button>
        </div>
        <div className="h-banner-dots">
          {BANNER_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-dot ${i === bannerIdx ? "h-dot-active" : ""}`}
              onClick={e => { e.stopPropagation(); setBannerIdx(i); }}
            />
          ))}
        </div>
      </section>

      {/* ══ DAILY RITUALS ══ */}
      <section className="h-section">
        <div className="h-section-hdr">
          <h2 className="h-section-title">Daily Rituals</h2>
          <Link to="/schedule" className="h-sec-link">Modify Schedule</Link>
        </div>

        {rituals.length === 0 ? (
          <div className="h-empty">
            <span className="material-symbols-outlined h-empty-icon">eco</span>
            <p className="h-empty-msg">No active deliveries yet</p>
            <Link to="/products" className="h-manage-btn" style={{ textDecoration: "none" }}>
              Start Your Ritual
            </Link>
          </div>
        ) : (
          <div className="h-rituals-grid">
            {rituals.map(ritual => {
              const product = products.find(p => p.id === ritual.productId);
              const isPaused = ritual.status === "Paused";
              return (
                <div key={ritual.id} className={`h-ritual-card${isPaused ? " h-ritual-paused" : ""}`}>
                  <div className="h-ritual-top">
                    <div className="h-ritual-img">
                      <ProductThumb
                        productId={product?.id}
                        emoji={product?.image}
                        className="h-ritual-photo"
                      />
                    </div>
                    <span className={`h-ritual-badge ${isPaused ? "h-badge-paused" : "h-badge-active"}`}>
                      {isPaused ? "PAUSED" : "ACTIVE"}
                    </span>
                  </div>

                  <h4 className="h-ritual-name">{product?.name}</h4>
                  <p className="h-ritual-qty">
                    Quantity: {ritual.quantity} {product?.unit} / Day
                  </p>

                  <div className="h-ritual-actions">
                    <button
                      type="button"
                      className="h-toggle-row"
                      onClick={() => togglePause(ritual.id)}
                    >
                      <div className={`h-toggle${isPaused ? "" : " h-toggle-on"}`}>
                        <div className={`h-knob${isPaused ? "" : " h-knob-on"}`} />
                      </div>
                      <span className={isPaused ? "h-lbl-off" : "h-lbl-on"}>
                        {isPaused ? "Resume" : "Pause"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="h-extra-btn"
                      disabled={isPaused}
                      onClick={() => openExtra(ritual.productId)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                      Extra
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ PRODUCT CATALOGUE ══ */}
      <section className="h-section">
        <div className="h-section-hdr">
          <h2 className="h-section-title">Explore the Catalogue</h2>
          <Link to="/products" className="h-sec-link">View All →</Link>
        </div>

        <div className="h-products-grid">
          {products.map(p => (
            <Link key={p.id} to={`/products/${p.id}`} className="h-product-card">
              <div className="h-product-img-box">
                <ProductThumb
                  productId={p.id}
                  emoji={p.image}
                  className="h-product-photo"
                />
                <button
                  type="button"
                  className="h-fav-btn"
                  onClick={e => e.preventDefault()}
                  aria-label="Favourite"
                >
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <div className="h-product-body">
                <div className="h-product-row1">
                  <h4 className="h-product-name">{p.name}</h4>
                  <span className="h-rating">
                    <span className="material-symbols-outlined h-star">star</span>
                    4.9
                  </span>
                </div>
                <p className="h-product-sub">{p.unit} | A2 Premium</p>
                <div className="h-product-footer">
                  <span className="h-product-price">₹{p.price}</span>
                  <button
                    type="button"
                    className="h-cart-btn"
                    onClick={e => { e.preventDefault(); navigate(`/products/${p.id}`); }}
                    aria-label="View product"
                  >
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ EXTRA MODAL ══ */}
      {extraModal && (
        <div className="modal-overlay" onClick={() => setExtraModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3>Add Extra for Today</h3>
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Product</label>
              <select value={extraProduct} onChange={e => setExtraProduct(e.target.value)}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min={1}
                value={extraQty}
                onChange={e => setExtraQty(Number(e.target.value))}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={confirmExtra}>
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Home };
