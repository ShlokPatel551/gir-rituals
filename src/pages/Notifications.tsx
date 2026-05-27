import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Notifications() {
  const { notifications, markAllNotificationsRead } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Notifications</h1>
        {unread > 0 && (
          <button type="button" className="btn btn-ghost" style={{ fontSize: '0.85rem' }} onClick={markAllNotificationsRead}>
            Mark all read
          </button>
        )}
      </div>
      {notifications.map((n) => (
        <Link
          key={n.id}
          to={n.link || '#'}
          className="card"
          style={{ display: 'block', marginBottom: '0.75rem', opacity: n.read ? 0.85 : 1, borderLeft: n.read ? undefined : '4px solid var(--green-600)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong>{n.title}</strong>
            {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-600)' }} />}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>{n.message}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
        </Link>
      ))}
    </div>
  );
}
