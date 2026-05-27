import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { banners, products } from '../data/mockData';
import { useApp } from '../context/AppContext';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { rituals, togglePause, addExtra } = useApp();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [extraModal, setExtraModal] = useState(false);
  const [extraProduct, setExtraProduct] = useState('milk');
  const [extraQty, setExtraQty] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, []);

  const banner = banners[bannerIndex];

  const handleBannerTap = () => {
    if (banner.linkType === 'offer') navigate(`/offers/${banner.linkId}`);
    else navigate(`/products/${banner.linkId}`);
  };

  const confirmExtra = () => {
    addExtra(extraProduct, extraQty);
    setExtraModal(false);
  };

  return (
    <div className="home-page">
      <section className="banner-carousel" onClick={handleBannerTap}>
        <div className="banner-slide">
          <span className="banner-emoji">{banner.image}</span>
          <h3>{banner.title}</h3>
        </div>
        <div className="banner-dots">
          {banners.map((_, i) => (
            <button key={i} type="button" className={i === bannerIndex ? 'active' : ''} onClick={(e) => { e.stopPropagation(); setBannerIndex(i); }} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title">Your Daily Rituals</h2>
        {rituals.length === 0 ? (
          <div className="empty-state card">
            <div className="emoji">🌿</div>
            <p>No active deliveries yet</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Start Your Ritual</Link>
          </div>
        ) : (
          rituals.map((ritual) => {
            const product = products.find((p) => p.id === ritual.productId)!;
            const isPaused = ritual.status === 'Paused';
            return (
              <div key={ritual.id} className="ritual-card card">
                <div className="ritual-header">
                  <span className="ritual-img">{product.image}</span>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{ritual.quantity} {product.unit} · ₹{product.price}/{product.unit}</p>
                  </div>
                  <span className={`badge badge-${
                    ritual.status === 'Delivered' ? 'delivered' :
                    ritual.status === 'Paused' ? 'paused' :
                    ritual.status === 'Cancelled' ? 'unpaid' :
                    ritual.status === 'Extra' ? 'extra' :
                    ritual.status === 'Out for Delivery' ? 'out-for-delivery' :
                    'pending'
                  }`}>{ritual.status}</span>
                </div>
                <div className="ritual-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setExtraModal(true)}>Add Extra</button>
                  <button type="button" className="btn btn-ghost" onClick={() => togglePause(ritual.id)}>
                    {isPaused ? 'Resume' : 'Pause Delivery'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">Our Products</h2>
          <Link to="/products">View All →</Link>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-mini card">
              <span className="product-emoji">{p.image}</span>
              <strong>{p.name}</strong>
              <span>₹{p.price}/{p.unit}</span>
            </Link>
          ))}
        </div>
      </section>

      {extraModal && (
        <div className="modal-overlay" onClick={() => setExtraModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Add Extra for Today</h3>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Product</label>
              <select value={extraProduct} onChange={(e) => setExtraProduct(e.target.value)}>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min={1} value={extraQty} onChange={(e) => setExtraQty(Number(e.target.value))} />
            </div>
            <button type="button" className="btn btn-primary" onClick={confirmExtra}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}
