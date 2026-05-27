import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sampleOrders } from '../data/mockData';

export function Orders() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const active = sampleOrders.filter((o) => o.status === 'active');
  const history = sampleOrders.filter((o) => o.status !== 'active');

  const list = tab === 'active' ? active : history;

  return (
    <div>
      <h1 className="page-title">Orders & History</h1>
      <div className="tabs">
        <button type="button" className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active</button>
        <button type="button" className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>
      {list.map((o) => (
        <div key={o.id} className="card" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{o.id}</strong>
            <span className={`badge badge-${o.status === 'active' ? 'pending' : 'delivered'}`}>{o.status}</span>
          </div>
          <p>{o.productName} · {o.qty} unit(s)</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Started {o.startDate}</p>
          <Link to={`/orders/${o.id}`} style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: '0.9rem' }}>View Details →</Link>
        </div>
      ))}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const order = sampleOrders.find((o) => o.id === id);
  if (!order) return <p>Order not found</p>;

  return (
    <div>
      <Link to="/orders" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Orders</Link>
      <h1 className="page-title">{order.id}</h1>
      <div className="card" style={{ marginBottom: '0.75rem' }}>
        <p><strong>Product:</strong> {order.productName}</p>
        <p><strong>Quantity:</strong> {order.qty}</p>
        <p><strong>Start date:</strong> {order.startDate}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Total delivered:</strong> 22 days</p>
        <p><strong>Total paused:</strong> 2 days</p>
        <p><strong>Total billed:</strong> ₹2,100</p>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '0.5rem' }}>Timeline</h3>
        <p style={{ fontSize: '0.9rem' }}>Apr 1 — Subscription started</p>
        <p style={{ fontSize: '0.9rem' }}>Apr 28 — Payment received</p>
      </div>
      <Link to="/contact" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>Request Refund</Link>
    </div>
  );
}
