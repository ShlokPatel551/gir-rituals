import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export function Cart() {
  const { cart, cartTotal, updateCartQty, removeFromCart, user } = useApp();
  const { showToast } = useToast();
  const [savedForLater, setSavedForLater] = useState<string[]>([]);

  const handleSaveForLater = (productId: string, name: string) => {
    setSavedForLater((prev) => [...prev, productId]);
    removeFromCart(productId);
    showToast(`${name} saved for later.`, 'info');
  };

  const handleMoveToCart = (productId: string) => {
    setSavedForLater((prev) => prev.filter((id) => id !== productId));
    const product = products.find((p) => p.id === productId);
    if (product) showToast(`${product.name} moved to cart.`);
  };

  const savedProducts = savedForLater
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  if (cart.length === 0 && savedProducts.length === 0) {
    return (
      <div>
        <h1 className="page-title">Cart</h1>
        <div className="empty-state card">
          <div className="emoji">🛒</div>
          <p>Your cart is empty</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const addr = user.deliveryAddress;

  return (
    <div>
      <h1 className="page-title">Cart</h1>

      {/* Cart items */}
      {cart.length > 0 && (
        <>
          {cart.map((item) => {
            const p = products.find((x) => x.id === item.productId)!;
            return (
              <div
                key={item.productId}
                className="card"
                style={{ marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
              >
                <span style={{ fontSize: '2rem' }}>{p.image}</span>
                <div style={{ flex: 1 }}>
                  <strong>{p.name}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{p.price}/{p.unit}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: 32, height: 32, padding: 0, fontSize: '1rem' }}
                        onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: 32, height: 32, padding: 0, fontSize: '1rem' }}
                        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveForLater(item.productId, p.name)}
                      style={{ background: 'none', fontSize: '0.8rem', color: 'var(--green-700)', fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Save for later
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.125rem' }}
                      aria-label="Remove"
                    >
                      🗑
                    </button>
                  </div>
                </div>
                <strong style={{ flexShrink: 0 }}>₹{p.price * item.quantity}</strong>
              </div>
            );
          })}

          {/* Delivery address */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Delivery to:</p>
            <p>{addr.street}, {addr.city}, {addr.state} {addr.pinCode}</p>
            <Link to="/profile/settings" style={{ fontSize: '0.85rem', color: 'var(--green-700)' }}>Edit address</Link>
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            <span>Total</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem' }}>
            Proceed to Payment
          </Link>
        </>
      )}

      {/* Saved for later section */}
      {savedProducts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            Saved for Later ({savedProducts.length})
          </h2>
          {savedProducts.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{ marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: 0.8 }}
            >
              <span style={{ fontSize: '2rem' }}>{p.image}</span>
              <div style={{ flex: 1 }}>
                <strong>{p.name}</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{p.price}/{p.unit}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem', whiteSpace: 'nowrap' }}
                onClick={() => handleMoveToCart(p.id)}
              >
                Move to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
