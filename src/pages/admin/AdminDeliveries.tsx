import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDeliveries.css';

type DeliveryStatus = 'delivered' | 'out_for_delivery' | 'today' | 'paused';

interface Delivery {
  id: string;
  clientId: string;
  name: string;
  initials: string;
  address: string;
  qty: string;
  status: DeliveryStatus;
  avatarBg: string;
}

const INITIAL_DELIVERIES: Delivery[] = [
  { id: '1', clientId: 'GR00124', name: 'Priya Shah',    initials: 'PS', address: 'Navrangpura, Ahmd', qty: '2 L',   status: 'delivered',        avatarBg: 'var(--admin-primary-fixed)' },
  { id: '2', clientId: 'GR00089', name: 'Rahul Mehta',   initials: 'RM', address: 'Satellite, Ahmd',   qty: '500g', status: 'out_for_delivery', avatarBg: '#ffdcbd' },
  { id: '3', clientId: 'GR00201', name: 'Anjali Kapoor', initials: 'AK', address: 'Vastrapur, Ahmd',   qty: '1 L',   status: 'today',            avatarBg: '#ffdcc4' },
  { id: '4', clientId: 'GR00057', name: 'Meena Patel',   initials: 'MP', address: 'Bopal, Ahmd',       qty: '1 L',   status: 'paused',           avatarBg: 'var(--admin-surface-container-high)' },
  { id: '5', clientId: 'GR00312', name: 'Suresh Joshi',  initials: 'SJ', address: 'Paldi, Ahmd',       qty: '2 L',   status: 'out_for_delivery', avatarBg: '#ffdcbd' },
  { id: '6', clientId: 'GR00098', name: 'Kavita Rao',    initials: 'KR', address: 'Maninagar, Ahmd',   qty: '500g', status: 'delivered',        avatarBg: 'var(--admin-primary-fixed)' },
];

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  delivered:        'Delivered',
  out_for_delivery: 'Out for delivery',
  today:            'Today delivery',
  paused:           'Paused',
};

const STATUS_CLASS: Record<DeliveryStatus, string> = {
  delivered:        'del-badge-delivered',
  out_for_delivery: 'del-badge-out',
  today:            'del-badge-today',
  paused:           'del-badge-paused',
};

function todayDisplay() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function AdminDeliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const TOTAL = 176;
  const PAGES = 3;

  const allChecked = selected.size === deliveries.length && deliveries.length > 0;

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(deliveries.map((d) => d.id)));
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function markDelivered(id: string) {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'delivered' as DeliveryStatus } : d)),
    );
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function markAllDelivered() {
    setDeliveries((prev) => prev.map((d) => ({ ...d, status: 'delivered' as DeliveryStatus })));
    setSelected(new Set());
  }

  function markSelectedFailed() {
    setDeliveries((prev) =>
      prev.map((d) => (selected.has(d.id) ? { ...d, status: 'paused' as DeliveryStatus } : d)),
    );
    setSelected(new Set());
  }

  const counts = {
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
    pending:   deliveries.filter((d) => d.status === 'out_for_delivery' || d.status === 'today').length,
    paused:    deliveries.filter((d) => d.status === 'paused').length,
  };

  return (
    <div className="del-page">

      {/* ── Header row ── */}
      <div className="del-header-row">
        <div>
          <h2 className="del-page-title">Deliveries Management</h2>
          <p className="del-page-sub">Manage daily logistics and fulfillment operations</p>
        </div>
        <div className="del-header-actions">
          <div className="del-date-chip">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
            <span>{todayDisplay()}</span>
          </div>
          <button type="button" className="del-btn-outline">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span>
            Print list
          </button>
          <button type="button" className="del-btn-filled">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Summary bento grid ── */}
      <div className="del-metrics-grid">
        <div className="bento-card del-metric-card">
          <span className="del-metric-label">Today's total</span>
          <span className="del-metric-value del-val-primary">{TOTAL}</span>
          <div className="del-metric-footer del-footer-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
            <span>12% vs yesterday</span>
          </div>
        </div>
        <div className="bento-card del-metric-card">
          <span className="del-metric-label">Delivered</span>
          <span className="del-metric-value del-val-tint">{counts.delivered + 142}</span>
          <div className="del-metric-footer del-footer-tint">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
            <span>84% completion</span>
          </div>
        </div>
        <div className="bento-card del-metric-card">
          <span className="del-metric-label">Pending</span>
          <span className="del-metric-value del-val-secondary">{counts.pending + 18}</span>
          <div className="del-metric-footer del-footer-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
            <span>In progress</span>
          </div>
        </div>
        <div className="bento-card del-metric-card">
          <span className="del-metric-label">Paused</span>
          <span className="del-metric-value del-val-error">{counts.paused + 7}</span>
          <div className="del-metric-footer del-footer-error">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>pause_circle</span>
            <span>Action required</span>
          </div>
        </div>
      </div>

      {/* ── Live tracking table ── */}
      <div className="bento-card del-table-card">
        <div className="del-table-header">
          <h3 className="del-section-title">Live Tracking</h3>
          <div className="del-bulk-actions">
            <button type="button" className="del-btn-filled del-btn-sm" onClick={markAllDelivered}>
              Mark all as delivered
            </button>
            <button
              type="button"
              className="del-btn-error del-btn-sm"
              onClick={markSelectedFailed}
              disabled={selected.size === 0}
            >
              Mark selected as failed
            </button>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ borderRadius: 0, border: 'none' }}>
          <table className="admin-table del-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    className="del-checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                  />
                </th>
                <th>Client ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Qty</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((row) => (
                <tr
                  key={row.id}
                  className={selected.has(row.id) ? 'del-row-selected' : ''}
                  onClick={(e) => {
                    const tag = (e.target as HTMLElement).tagName;
                    if (tag !== 'INPUT' && tag !== 'BUTTON') toggleRow(row.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="del-checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="adm-cell-muted del-client-id">{row.clientId}</td>
                  <td>
                    <div
                      className="adm-customer-cell"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${row.clientId}`); }}
                    >
                      <div className="adm-avatar" style={{ background: row.avatarBg }}>{row.initials}</div>
                      <span className="adm-customer-name" style={{ textDecoration: 'underline', textDecorationColor: 'transparent' }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = 'currentColor')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = 'transparent')}
                      >{row.name}</span>
                    </div>
                  </td>
                  <td className="adm-cell-muted">{row.address}</td>
                  <td>{row.qty}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`del-badge ${STATUS_CLASS[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {row.status === 'delivered' ? (
                      <button type="button" className="adm-view-btn" disabled>Delivered</button>
                    ) : row.status === 'paused' ? (
                      <button type="button" className="adm-view-btn" onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${row.clientId}`); }}>View Details</button>
                    ) : (
                      <button
                        type="button"
                        className="del-btn-filled del-btn-sm"
                        onClick={(e) => { e.stopPropagation(); markDelivered(row.id); }}
                      >
                        Mark delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="del-pagination">
          <p className="del-pagination-info">
            Showing 1–{deliveries.length} of {TOTAL} deliveries
          </p>
          <div className="del-pagination-btns">
            <button
              type="button"
              className="del-page-arrow"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: PAGES }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`del-page-num ${page === n ? 'del-page-active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="del-page-arrow"
              disabled={page === PAGES}
              onClick={() => setPage((p) => Math.min(PAGES, p + 1))}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Status flow legend ── */}
      <div className="del-legend">
        <span className="del-legend-label">Status Flow:</span>
        <div className="del-legend-item">
          <span className="del-legend-dot" style={{ background: 'var(--admin-surface-container-high)' }} />
          <span>Today delivery</span>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        <div className="del-legend-item">
          <span className="del-legend-dot" style={{ background: 'var(--admin-secondary-container)' }} />
          <span>Out for delivery</span>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        <div className="del-legend-item">
          <span className="del-legend-dot" style={{ background: 'var(--admin-primary-fixed)' }} />
          <span>Delivered</span>
        </div>
        <span style={{ margin: '0 4px' }}>/</span>
        <div className="del-legend-item">
          <span className="del-legend-dot" style={{ background: 'var(--admin-error-container)' }} />
          <span>Failed / Paused</span>
        </div>
      </div>

      {/* ── FAB ── */}
      <div className="del-fab-wrap">
        <button type="button" className="del-fab" title="New Delivery">
          <span className="material-symbols-outlined">add</span>
          <span className="del-fab-tooltip">New Delivery</span>
        </button>
      </div>

    </div>
  );
}
