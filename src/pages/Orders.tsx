import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sampleOrders } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export function Orders() {
  const { addToCart } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [cancelled, setCancelled] = useState<Set<string>>(new Set());

  const active = sampleOrders.filter((o) => o.status === 'active' && !cancelled.has(o.id));
  const history = [...sampleOrders.filter((o) => o.status !== 'active'), ...sampleOrders.filter((o) => cancelled.has(o.id))];

  const list = tab === 'active' ? active : history;

  const handleCancel = (id: string, _name: string) => {
    if (!window.confirm(`Cancel order ${id}?`)) return;
    setCancelled((prev) => new Set([...prev, id]));
    showToast(`Order ${id} cancelled.`, 'info');
  };

  const handleReorder = (productId: string, name: string) => {
    const id = productId === 'Pure Gir Cow Milk' ? 'milk' : 'ghee';
    addToCart(id);
    showToast(`${name} added to cart!`);
  };

  return (
    <div>
      <h1 className="page-title">Orders & History</h1>
      <div className="tabs">
        <button type="button" className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
          Active
        </button>
        <button type="button" className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          History
        </button>
      </div>

      {list.length === 0 && (
        <div className="empty-state card">
          <div className="emoji">📦</div>
          <p>No {tab === 'active' ? 'active' : ''} orders</p>
        </div>
      )}

      {list.map((o) => {
        const isCancelled = cancelled.has(o.id);
        return (
          <div key={o.id} className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{o.id}</strong>
              <span className={`badge badge-${isCancelled ? 'cancelled' : o.status === 'active' ? 'pending' : 'delivered'}`}>
                {isCancelled ? 'Cancelled' : o.status}
              </span>
            </div>
            <p style={{ marginTop: '0.25rem' }}>{o.productName} · {o.qty} unit(s)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Started {o.startDate}</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <Link to={`/orders/${o.id}`} style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: '0.9rem', alignSelf: 'center' }}>
                View Details →
              </Link>

              {tab === 'active' && !isCancelled && (
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
                  onClick={() => handleCancel(o.id, o.productName)}
                >
                  Cancel Order
                </button>
              )}

              {(tab === 'history' || isCancelled) && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
                  onClick={() => handleReorder(o.productName, o.productName)}
                >
                  🔄 Re-order
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { addToCart } = useApp();
  const { showToast } = useToast();
  const order = sampleOrders.find((o) => o.id === id);
  if (!order) return <p>Order not found</p>;

  const handleReorder = () => {
    const productId = order.productName === 'Pure Gir Cow Milk' ? 'milk' : 'ghee';
    addToCart(productId);
    showToast(`${order.productName} added to cart!`);
  };

  return (
    <div>
      <Link to="/orders" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        ← Orders
      </Link>
      <h1 className="page-title">{order.id}</h1>
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <p><strong>Product:</strong> {order.productName}</p>
        <p><strong>Quantity:</strong> {order.qty}</p>
        <p><strong>Start date:</strong> {order.startDate}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={`badge badge-${order.status === 'active' ? 'pending' : 'delivered'}`}>
            {order.status}
          </span>
        </p>
        <p><strong>Total delivered:</strong> 22 days</p>
        <p><strong>Total paused:</strong> 2 days</p>
        <p><strong>Total billed:</strong> ₹2,100</p>
      </div>
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Timeline</h3>
        <p style={{ fontSize: '0.9rem' }}>Apr 1 — Subscription started</p>
        <p style={{ fontSize: '0.9rem' }}>Apr 28 — Payment received</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/contact" className="btn btn-secondary" style={{ flex: 1 }}>Request Refund</Link>
        {order.status === 'completed' && (
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleReorder}>
            🔄 Re-order
          </button>
        )}
      </div>
    </div>
  );
}
