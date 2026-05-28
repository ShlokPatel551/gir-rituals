import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { banners, offers, products } from "../data/mockData";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Home.css";
const BRAND_VALUES = [
  { icon: "\u{1F404}", title: "A2 Gir Milk", desc: "Pure A2 protein from indigenous Gir cows" },
  { icon: "\u{1F33F}", title: "No Preservatives", desc: "Farm-fresh, additive-free, every day" },
  { icon: "\u{1F69A}", title: "Daily Delivery", desc: "At your door by 7 AM, rain or shine" },
  { icon: "\u{1FAD9}", title: "Bilona Ghee", desc: "Hand-churned using ancient Vedic methods" }
];
const TESTIMONIALS = [
  { name: "Priya S.", city: "Ahmedabad", text: "The milk tastes exactly like what I had at my grandparents' farm. Rich, thick and absolutely pure.", stars: 5 },
  { name: "Ramesh M.", city: "Surat", text: "Been subscribing for 6 months. The bilona ghee is medicinal-grade quality. My family loves it.", stars: 5 },
  { name: "Ananya K.", city: "Mumbai", text: "Delivery is always on time and the packaging is eco-friendly. Great service!", stars: 5 }
];
const WHY_ITEMS = [
  { icon: "\u{1F3E1}", title: "From Our Farm", desc: "Our Gir cows roam freely on 50+ acres of natural pastures in Gir, Gujarat." },
  { icon: "\u{1F9EA}", title: "Quality Tested", desc: "Every batch is tested for adulteration and quality before reaching your home." },
  { icon: "\u2764\uFE0F", title: "Ethical Farming", desc: "Our cows are treated with love \u2014 no hormones, no stress, no shortcuts." },
  { icon: "\u267B\uFE0F", title: "Sustainable", desc: "Eco-packaging and zero-waste operations at every step of the supply chain." }
];
function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 864e5);
}
function Home() {
  const navigate = useNavigate();
  const { rituals, togglePause, addExtra } = useApp();
  const { showToast } = useToast();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [extraModal, setExtraModal] = useState(false);
  const [extraProduct, setExtraProduct] = useState("milk");
  const [extraQty, setExtraQty] = useState(1);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % banners.length), 4e3);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length), 5e3);
    return () => clearInterval(t);
  }, []);
  const banner = banners[bannerIndex];
  const handleBannerTap = () => {
    if (banner.linkType === "offer") navigate(`/offers/${banner.linkId}`);
    else navigate(`/products/${banner.linkId}`);
  };
  const confirmExtra = () => {
    addExtra(extraProduct, extraQty);
    setExtraModal(false);
    const p = products.find((x) => x.id === extraProduct);
    showToast(`Extra ${p?.name} added!`);
  };
  const activeOffers = offers.filter((o) => !o.upcoming && daysUntil(o.validUntil) >= 0).slice(0, 2);
  const testimonial = TESTIMONIALS[testimonialIndex];
  return <div className="home-page">
      {
    /* Banner carousel */
  }
      <section className="banner-carousel" onClick={handleBannerTap}>
        <div className="banner-slide">
          <span className="banner-emoji">{banner.image}</span>
          <h3>{banner.title}</h3>
        </div>
        <div className="banner-dots">
          {banners.map((_, i) => <button
    key={i}
    type="button"
    className={i === bannerIndex ? "active" : ""}
    onClick={(e) => {
      e.stopPropagation();
      setBannerIndex(i);
    }}
  />)}
        </div>
      </section>

      {
    /* Brand value strip */
  }
      <section className="home-section">
        <div className="brand-values-strip">
          {BRAND_VALUES.map((v) => <div key={v.title} className="brand-value-tile">
              <span className="brand-value-icon">{v.icon}</span>
              <strong>{v.title}</strong>
              <p>{v.desc}</p>
            </div>)}
        </div>
      </section>

      {
    /* Daily Rituals */
  }
      <section className="home-section">
        <h2 className="section-title">Your Daily Rituals</h2>
        {rituals.length === 0 ? <div className="empty-state card">
            <div className="emoji">🌿</div>
            <p>No active deliveries yet</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
              Start Your Ritual
            </Link>
          </div> : rituals.map((ritual) => {
    const product = products.find((p) => p.id === ritual.productId);
    const isPaused = ritual.status === "Paused";
    return <div key={ritual.id} className="ritual-card card">
                <div className="ritual-header">
                  <span className="ritual-img">{product.image}</span>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{ritual.quantity} {product.unit} · ₹{product.price}/{product.unit}</p>
                  </div>
                  <span className={`badge badge-${ritual.status === "Delivered" ? "delivered" : ritual.status === "Paused" ? "paused" : ritual.status === "Cancelled" ? "cancelled" : ritual.status === "Extra" ? "extra" : ritual.status === "Out for Delivery" ? "out-for-delivery" : "pending"}`}>{ritual.status}</span>
                </div>
                <div className="ritual-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setExtraModal(true)}>Add Extra</button>
                  <button type="button" className="btn btn-ghost" onClick={() => togglePause(ritual.id)}>
                    {isPaused ? "Resume" : "Pause Delivery"}
                  </button>
                </div>
              </div>;
  })}
      </section>

      {
    /* Active Offers */
  }
      {activeOffers.length > 0 && <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Current Offers</h2>
            <Link to="/offers">View All →</Link>
          </div>
          {activeOffers.map((o) => {
    const days = daysUntil(o.validUntil);
    return <Link key={o.id} to={`/offers/${o.id}`} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", textDecoration: "none" }}>
                <div>
                  <strong style={{ fontSize: "0.9375rem" }}>{o.title}</strong>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>{o.description}</p>
                  {o.promoCode && <span style={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: "var(--green-700)", background: "var(--md-primary-container)", padding: "0.15rem 0.4rem", borderRadius: 4, marginTop: "0.25rem", display: "inline-block" }}>
                      {o.promoCode}
                    </span>}
                </div>
                {days <= 7 && <span className="badge badge-unpaid">Ends {days}d</span>}
              </Link>;
  })}
        </section>}

      {
    /* Products */
  }
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Our Products</h2>
          <Link to="/products">View All →</Link>
        </div>
        <div className="product-grid">
          {products.map((p) => <Link key={p.id} to={`/products/${p.id}`} className="product-mini card">
              <span className="product-emoji">{p.image}</span>
              <strong>{p.name}</strong>
              <span>₹{p.price}/{p.unit}</span>
            </Link>)}
        </div>
      </section>

      {
    /* Why Gir Rituals */
  }
      <section className="home-section why-section">
        <h2 className="section-title">Why Gir Rituals?</h2>
        <div className="why-grid">
          {WHY_ITEMS.map((item) => <div key={item.title} className="why-card card">
              <span className="why-icon">{item.icon}</span>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </div>)}
        </div>
      </section>

      {
    /* Testimonials */
  }
      <section className="home-section">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="testimonial-card card">
          <div className="testimonial-stars">
            {"\u2605".repeat(testimonial.stars)}{"\u2606".repeat(5 - testimonial.stars)}
          </div>
          <p className="testimonial-text">"{testimonial.text}"</p>
          <div className="testimonial-author">
            <strong>{testimonial.name}</strong>
            <span>{testimonial.city}</span>
          </div>
          <div className="testimonial-dots">
            {TESTIMONIALS.map((_, i) => <button
    key={i}
    type="button"
    className={i === testimonialIndex ? "active" : ""}
    onClick={() => setTestimonialIndex(i)}
  />)}
          </div>
        </div>
      </section>

      {
    /* Footer CTA */
  }
      <section className="home-section footer-cta-section">
        <div className="footer-cta card">
          <h2>Start Your Ritual Today</h2>
          <p>Pure A2 milk and traditional bilona ghee, delivered every morning.</p>
          <Link to="/products" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>
            Shop Now
          </Link>
        </div>
      </section>

      {
    /* Extra modal */
  }
      {extraModal && <div className="modal-overlay" onClick={() => setExtraModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Add Extra for Today</h3>
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label>Product</label>
              <select value={extraProduct} onChange={(e) => setExtraProduct(e.target.value)}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min={1} value={extraQty} onChange={(e) => setExtraQty(Number(e.target.value))} />
            </div>
            <button type="button" className="btn btn-primary" onClick={confirmExtra}>Confirm</button>
          </div>
        </div>}
    </div>;
}
export {
  Home
};
