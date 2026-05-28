import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { products } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const RECIPES: Record<string, { title: string; steps: string[] }[]> = {
  milk: [
    {
      title: 'Golden Turmeric Latte',
      steps: [
        'Heat 200 ml Gir Cow Milk until warm (not boiling)',
        'Add ½ tsp turmeric + pinch of black pepper',
        'Whisk in 1 tsp raw honey',
        'Serve warm for an Ayurvedic morning boost',
      ],
    },
    {
      title: 'Classic Mishti Doi',
      steps: [
        'Boil 500 ml Gir Milk, reduce by 20%',
        'Cool to 40°C, stir in 2 tbsp fresh curd as starter',
        'Sweeten with 3 tbsp jaggery, pour into earthen pots',
        'Set at room temp for 6–8 hrs, then refrigerate overnight',
      ],
    },
  ],
  ghee: [
    {
      title: 'Dal Tadka with Bilona Ghee',
      steps: [
        'Cook toor dal until soft, season with turmeric + salt',
        'Heat 1 tbsp Gir Ghee in a small tadka pan',
        'Add mustard seeds, cumin, 2 garlic cloves and 1 dry red chilli',
        'Pour the sizzling tadka over the dal and serve',
      ],
    },
    {
      title: 'Ghee-Roasted Makhana',
      steps: [
        'Heat 1 tsp Gir Ghee on medium flame',
        'Add 2 cups fox nuts (makhana), stir constantly',
        'Roast 10–12 min until crispy and golden',
        'Toss with rock salt + chaat masala — snack done!',
      ],
    },
  ],
};

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addExtra, favourites, toggleFavourite } = useApp();
  const { showToast } = useToast();
  const [openRecipe, setOpenRecipe] = useState<number | null>(null);
  const [subscribeModal, setSubscribeModal] = useState(false);
  const [subQty, setSubQty] = useState(1);

  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <div className="empty-state">
        <p>Product not found</p>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.id !== product.id);
  const recipes = RECIPES[product.id] ?? [];

  const handleAddToCart = () => {
    addToCart(product.id);
    showToast(`${product.name} added to cart!`);
  };

  const handleSubscribe = () => {
    addExtra(product.id, subQty);
    setSubscribeModal(false);
    showToast(`Subscribed to ${product.name}!`);
  };

  return (
    <div>
      <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      {/* Hero card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '4rem' }}>{product.image}</span>
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>{product.name}</h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--green-700)' }}>
          ₹{product.price}/{product.unit}
        </p>
        <button
          type="button"
          onClick={() => toggleFavourite(product.id)}
          style={{ background: 'none', fontSize: '1.375rem', marginTop: '0.5rem' }}
        >
          {favourites.includes(product.id) ? '❤️ Favourited' : '🤍 Add to Favourites'}
        </button>
      </div>

      {/* About */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>About</h3>
        <p>{product.description}</p>
      </div>

      {/* Benefits */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Benefits</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8 }}>
          {product.benefits.map((b) => <li key={b}>{b}</li>)}
        </ul>
      </div>

      {/* Best Recipes accordion */}
      {recipes.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>🍽 Best Recipes</h3>
          {recipes.map((recipe, i) => (
            <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <button
                type="button"
                onClick={() => setOpenRecipe(openRecipe === i ? null : i)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '0.75rem 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--md-on-surface)',
                  textAlign: 'left',
                }}
              >
                {recipe.title}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {openRecipe === i ? '▲' : '▼'}
                </span>
              </button>
              {openRecipe === i && (
                <ol style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem', lineHeight: 1.75 }}>
                  {recipe.steps.map((step, j) => (
                    <li key={j} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSubscribeModal(true)}>
          📅 Subscribe
        </button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleAddToCart}>
          🛒 Add to Cart
        </button>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '0.75rem' }}>You May Also Like</h3>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                to={`/products/${rp.id}`}
                className="card"
                style={{ textAlign: 'center', minWidth: 140, textDecoration: 'none' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{rp.image}</div>
                <strong style={{ fontSize: '0.8rem' }}>{rp.name}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--green-700)', fontWeight: 600 }}>
                  ₹{rp.price}/{rp.unit}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Subscribe modal */}
      {subscribeModal && (
        <div className="modal-overlay" onClick={() => setSubscribeModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Subscribe to {product.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>
              Add to your daily deliveries — starts tomorrow.
            </p>
            <div className="form-group">
              <label>Daily quantity ({product.unit})</label>
              <input
                type="number"
                min={1}
                value={subQty}
                onChange={(e) => setSubQty(Number(e.target.value))}
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--green-700)', fontWeight: 600, marginBottom: '1rem' }}>
              ₹{product.price * subQty}/{product.unit} per day
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSubscribeModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubscribe}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
