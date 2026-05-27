import { Link } from 'react-router-dom';
import { products } from '../data/mockData';
import { useApp } from '../context/AppContext';

export function Cart() {
  const { cart, cartTotal, updateCartQty, removeFromCart, user } = useApp();

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="page-title">Cart</h1>
        <div className="empty-state card">
          <div className="emoji">🛒</div>
          <p>Your cart is empty</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  const addr = user.deliveryAddress;

  return (
    <div>
      <h1 className="page-title">Cart</h1>
      {cart.map((item) => {
        const p = products.find((x) => x.id === item.productId)!;
        return (
          <div key={item.productId} className="card" style={{ marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem' }}>{p.image}</span>
            <div style={{ flex: 1 }}>
              <strong>{p.name}</strong>
              <p>₹{p.price}/{p.unit}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => updateCartQty(item.productId, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateCartQty(item.productId, item.quantity + 1)}>+</button>
                <button type="button" onClick={() => removeFromCart(item.productId)} style={{ marginLeft: 'auto', background: 'none' }}>🗑</button>
              </div>
            </div>
            <strong>₹{p.price * item.quantity}</strong>
          </div>
        );
      })}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Delivery to:</p>
        <p>{addr.street}, {addr.city}, {addr.state} {addr.pinCode}</p>
        <Link to="/profile/settings" style={{ fontSize: '0.85rem', color: 'var(--green-700)' }}>Edit address</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        <span>Total</span>
        <span>₹{cartTotal}</span>
      </div>
      <Link to="/checkout" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>Proceed to Payment</Link>
    </div>
  );
}
