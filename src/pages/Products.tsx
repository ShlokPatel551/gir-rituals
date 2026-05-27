import { Link } from 'react-router-dom';
import { products } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function Products() {
  const { favourites, toggleFavourite, addToCart } = useApp();

  return (
    <div>
      <h1 className="page-title">Products</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {products.map((p) => (
          <div key={p.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2.5rem' }}>{p.image}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <strong>{p.name}</strong>
                <button type="button" onClick={() => toggleFavourite(p.id)} style={{ background: 'none', fontSize: '1.25rem' }}>
                  {favourites.includes(p.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0' }}>{p.benefits[0]}</p>
              <p style={{ fontWeight: 600, color: 'var(--green-700)' }}>₹{p.price}/{p.unit}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <Link to={`/products/${p.id}`} className="btn btn-ghost" style={{ flex: 1, fontSize: '0.85rem' }}>View Details</Link>
                <button type="button" className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }} onClick={() => addToCart(p.id)}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
