import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminOffers.css';

type PromoType   = 'seasonal' | 'discount' | 'loyalty';
type PromoStatus = 'active' | 'expired' | 'scheduled';

interface Promo {
  id: string;
  title: string;
  code: string;
  type: PromoType;
  discount: string;
  discountSub: string;
  used: number;
  limit: number | null;
  usedPct: number;
  status: PromoStatus;
  expired: boolean;
}

const PROMOS: Promo[] = [
  {
    id: 'p1', title: 'Monsoon Fresh Start', code: 'FRESHMILK20',
    type: 'seasonal', discount: '20%', discountSub: 'OFF',
    used: 1245, limit: 5000, usedPct: 25, status: 'active', expired: false,
  },
  {
    id: 'p2', title: 'First Order Delight', code: 'GIRRITUALS100',
    type: 'discount', discount: '₹100', discountSub: 'FLAT',
    used: 4992, limit: null, usedPct: 100, status: 'active', expired: false,
  },
  {
    id: 'p3', title: 'Summer Wellness Week', code: 'SUMMERHEAL',
    type: 'seasonal', discount: '15%', discountSub: 'OFF',
    used: 2100, limit: 2100, usedPct: 100, status: 'expired', expired: true,
  },
];

const TYPE_LABEL: Record<PromoType, string> = {
  seasonal: 'Seasonal Deal',
  discount: 'Discount Code',
  loyalty:  'Loyalty',
};

const TYPE_CSS: Record<PromoType, string> = {
  seasonal: 'promo-type-seasonal',
  discount: 'promo-type-discount',
  loyalty:  'promo-type-loyalty',
};

const LOYALTY_PERKS = [
  { icon: 'military_tech', title: 'Gold Tier Benefit',  sub: 'Free weekend Ghee jar delivery (above 1L order).' },
  { icon: 'person_add',    title: 'Referral Bonus',     sub: '50% off first month for both referee and referrer.' },
  { icon: 'celebration',   title: 'Anniversary Treat',  sub: 'Complimentary Artisanal Butter on 1st Year completion.' },
];

const USAGE_BARS = [
  { label: 'Mon', pct: 40 },
  { label: 'Tue', pct: 65 },
  { label: 'Wed', pct: 55 },
  { label: 'Thu', pct: 90 },
  { label: 'Fri', pct: 80 },
  { label: 'Sat', pct: 70 },
  { label: 'Sun', pct: 100 },
];

const TYPE_FILTER_OPTIONS  = ['All Types', 'Discount Codes', 'Seasonal Deals', 'Loyalty'] as const;
const STATUS_FILTER_OPTIONS = ['Active Status', 'Scheduled', 'Expired'] as const;

export function AdminOffers() {
  const navigate = useNavigate();
  const [typeFilter,   setTypeFilter]   = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('Active Status');

  const visible = PROMOS.filter((p) => {
    const typeOk = typeFilter === 'All Types'
      || (typeFilter === 'Discount Codes' && p.type === 'discount')
      || (typeFilter === 'Seasonal Deals' && p.type === 'seasonal')
      || (typeFilter === 'Loyalty'        && p.type === 'loyalty');
    const statusOk = statusFilter === 'Active Status' || statusFilter.toLowerCase() === p.status;
    return typeOk && statusOk;
  });

  return (
    <div className="promo-page">

      {/* ── Page header ── */}
      <div className="promo-page-header">
        <div>
          <nav className="promo-breadcrumb">
            <span>Marketing</span>
            <span className="material-symbols-outlined promo-bc-chevron">chevron_right</span>
            <span className="promo-bc-current">Offers &amp; Promotions</span>
          </nav>
          <h2 className="promo-page-title">Manage Promotions</h2>
          <p className="promo-page-sub">Configure discount codes, loyalty rewards, and seasonal milk subscription deals.</p>
        </div>
        <button type="button" className="promo-btn-filled">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_circle</span>
          Create New Offer
        </button>
      </div>

      {/* ── Stats bento ── */}
      <div className="promo-stats-grid">

        <div className="bento-card promo-stat-card promo-stat-lift">
          <div className="promo-stat-top">
            <div className="promo-stat-icon-wrap" style={{ background: 'var(--admin-primary-fixed)', color: 'var(--admin-primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>local_activity</span>
            </div>
            <span className="promo-stat-badge promo-badge-green">+12% vs last month</span>
          </div>
          <p className="promo-stat-label">Active Offers</p>
          <p className="promo-stat-value">24</p>
        </div>

        <div className="bento-card promo-stat-card promo-stat-lift">
          <div className="promo-stat-top">
            <div className="promo-stat-icon-wrap" style={{ background: '#ffdcbd', color: '#7a532a' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>stars</span>
            </div>
            <span className="promo-stat-badge promo-badge-muted">Target: 5000</span>
          </div>
          <p className="promo-stat-label">Loyalty Claims</p>
          <p className="promo-stat-value">3,842</p>
        </div>

        <div className="bento-card promo-stat-card promo-stat-lift">
          <div className="promo-stat-top">
            <div className="promo-stat-icon-wrap" style={{ background: '#a5d0b9', color: '#274e3d' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>trending_up</span>
            </div>
            <span className="promo-stat-badge promo-badge-primary">Top Performing</span>
          </div>
          <p className="promo-stat-label">Total Revenue Impact</p>
          <p className="promo-stat-value">₹8.2L</p>
        </div>

        <div className="promo-campaign-card">
          <span className="material-symbols-outlined promo-campaign-decor">eco</span>
          <p className="promo-campaign-eyebrow">Seasonal Campaign</p>
          <p className="promo-campaign-name">Monsoon Freshness</p>
          <p className="promo-campaign-ends">Ends in 4 days</p>
          <div className="promo-campaign-bar-track">
            <div className="promo-campaign-bar-fill" style={{ width: '75%' }} />
          </div>
        </div>

      </div>

      {/* ── Loyalty rewards ── */}
      <div className="bento-card promo-loyalty-card">
        <div className="promo-loyalty-header">
          <div className="promo-loyalty-header-left">
            <div className="promo-loyalty-icon">
              <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <div>
              <h4 className="promo-loyalty-title">Loyalty Rewards Program</h4>
              <p className="promo-loyalty-sub">Manage tier-based benefits for your most recurring customers.</p>
            </div>
          </div>
          <button type="button" className="promo-loyalty-link" onClick={() => navigate('/admin/analytics')}>
            View Analytics
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>open_in_new</span>
          </button>
        </div>
        <div className="promo-loyalty-perks">
          {LOYALTY_PERKS.map((perk) => (
            <div key={perk.icon} className="promo-perk-card">
              <div className="promo-perk-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{perk.icon}</span>
              </div>
              <div>
                <p className="promo-perk-title">{perk.title}</p>
                <p className="promo-perk-sub">{perk.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Promotions table ── */}
      <div className="bento-card promo-table-card">
        <div className="promo-table-header">
          <h4 className="promo-section-title">Recent Promotions</h4>
          <div className="promo-table-filters">
            <select
              className="promo-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {TYPE_FILTER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <select
              className="promo-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table promo-table">
            <thead>
              <tr>
                <th>Title &amp; Code</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className={p.expired ? 'promo-row-expired' : ''}>
                  <td>
                    <div className="promo-title-cell">
                      <span className="promo-promo-name">{p.title}</span>
                      <code className={`promo-code ${p.expired ? 'promo-code-expired' : ''}`}>{p.code}</code>
                    </div>
                  </td>
                  <td>
                    <span className={`promo-type-badge ${TYPE_CSS[p.type]}`}>{TYPE_LABEL[p.type]}</span>
                  </td>
                  <td>
                    <span className="promo-discount">
                      {p.discount} <span className="promo-discount-sub">{p.discountSub}</span>
                    </span>
                  </td>
                  <td>
                    <div className="promo-usage">
                      <span className="promo-usage-count">
                        {p.used.toLocaleString('en-IN')}{' '}
                        <span className="promo-usage-limit">/ {p.limit !== null ? p.limit.toLocaleString('en-IN') : '∞'}</span>
                      </span>
                      <div className="promo-usage-track">
                        <div
                          className="promo-usage-fill"
                          style={{ width: `${p.usedPct}%`, opacity: p.expired ? 0.3 : 1 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.status === 'active' ? (
                      <span className="promo-status promo-status-active">
                        <span className="promo-status-dot promo-dot-active" />
                        Active
                      </span>
                    ) : p.status === 'expired' ? (
                      <span className="promo-status promo-status-expired">
                        <span className="promo-status-dot promo-dot-expired" />
                        Expired
                      </span>
                    ) : (
                      <span className="promo-status promo-status-scheduled">
                        <span className="promo-status-dot promo-dot-scheduled" />
                        Scheduled
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="promo-more-btn">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="promo-table-footer">
          <span>Showing {visible.length} of 42 active promotions</span>
          <div className="promo-pag">
            <button type="button" className="promo-pag-arrow" disabled>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
            </button>
            {[1, 2, 3].map((n) => (
              <button key={n} type="button" className={`promo-pag-num ${n === 1 ? 'promo-pag-active' : ''}`}>{n}</button>
            ))}
            <button type="button" className="promo-pag-arrow">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom grid: chart + AI card ── */}
      <div className="promo-bottom-grid">

        {/* Usage trend chart */}
        <div className="bento-card promo-chart-card">
          <h4 className="promo-section-title" style={{ marginBottom: '1.25rem' }}>Usage Trend</h4>
          <div className="promo-bars-area">
            {USAGE_BARS.map((b) => (
              <div key={b.label} className="promo-bar-col">
                <div className="promo-bar" style={{ height: `${b.pct}%` }} />
              </div>
            ))}
          </div>
          <div className="promo-bars-labels">
            {USAGE_BARS.map((b) => (
              <span key={b.label}>{b.label}</span>
            ))}
          </div>
        </div>

        {/* AI suggestion card */}
        <div className="bento-card promo-ai-card">
          <div className="promo-ai-inner">
            <span className="material-symbols-outlined promo-ai-icon">auto_awesome</span>
            <h4 className="promo-ai-title">Need a New Campaign?</h4>
            <p className="promo-ai-sub">
              Our AI suggests a 'Festival Harvest' discount based on last year's festive peaks.
            </p>
            <button type="button" className="promo-ai-btn">Generate Template</button>
          </div>
        </div>

      </div>

    </div>
  );
}
