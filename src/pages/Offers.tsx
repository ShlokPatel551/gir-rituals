import { Link, useParams } from 'react-router-dom';
import { offers } from '../data/mockData';

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function Offers() {
  return (
    <div>
      <h1 className="page-title">Offers</h1>
      {offers.map((o) => {
        const days = daysUntil(o.validUntil);
        return (
          <Link key={o.id} to={`/offers/${o.id}`} className="card" style={{ display: 'block', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <strong>{o.title}</strong>
              {o.upcoming
                ? <span className="badge badge-pending">Coming Soon</span>
                : days <= 7
                  ? <span className="badge badge-unpaid">Ends in {days}d</span>
                  : null
              }
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{o.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--green-700)' }}>Valid until {o.validUntil}</span>
              {o.upcoming && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Starts in {days} days
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function OfferDetail() {
  const { id } = useParams();
  const offer = offers.find((o) => o.id === id);
  if (!offer) return <p>Offer not found</p>;

  const days = daysUntil(offer.validUntil);

  return (
    <div>
      <Link to="/offers" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Back</Link>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
          <h1 className="page-title" style={{ margin: 0 }}>{offer.title}</h1>
          {offer.upcoming
            ? <span className="badge badge-pending">Coming Soon</span>
            : <span className="badge badge-delivered">Active</span>
          }
        </div>
        <p style={{ marginBottom: '1rem' }}>{offer.description}</p>
        <div style={{ padding: '0.75rem', background: 'var(--green-50)', borderRadius: 8, marginBottom: '1rem' }}>
          {offer.upcoming ? (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--green-700)', fontWeight: 600 }}>
              ⏰ Starts in {days} days — Save the date!
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: days <= 7 ? '#b45309' : 'var(--green-700)', fontWeight: 600 }}>
              {days <= 7 ? `⚠️ Ends in ${days} days — Hurry!` : `✅ Valid until ${offer.validUntil}`}
            </p>
          )}
        </div>
        {!offer.upcoming && (
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block' }}>Shop Now</Link>
        )}
      </div>
    </div>
  );
}
