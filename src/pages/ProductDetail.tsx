import { useParams, useNavigate, Link } from 'react-router-dom';
import { products } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, favourites, toggleFavourite } = useApp();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <div className="empty-state"><p>Product not found</p><Link to="/products">Back to Products</Link></div>;
  }

  return (
    <div>
      <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
      <div className="card" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '4rem' }}>{product.image}</span>
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>{product.name}</h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--green-700)' }}>₹{product.price}/{product.unit}</p>
        <button type="button" onClick={() => toggleFavourite(product.id)} style={{ background: 'none', fontSize: '1.5rem', marginTop: '0.5rem' }}>
          {favourites.includes(product.id) ? '❤️ Favourited' : '🤍 Add to Favourites'}
        </button>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>About</h3>
        <p>{product.description}</p>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Benefits</h3>
        <ul style={{ paddingLeft: '1.25rem' }}>
          {product.benefits.map((b) => <li key={b}>{b}</li>)}
        </ul>
      </div>
      <button type="button" className="btn btn-primary" onClick={() => { addToCart(product.id); navigate('/cart'); }}>
        Add to Cart
      </button>
    </div>
  );
}
