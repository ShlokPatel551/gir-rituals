import { useState } from 'react';
import './AdminAnalytics.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

const GROWTH_BARS = [
  { label: 'Dec', h: 35, opacity: 0.2 },
  { label: 'Jan', h: 48, opacity: 0.3 },
  { label: 'Feb', h: 55, opacity: 0.4 },
  { label: 'Mar', h: 62, opacity: 0.55 },
  { label: 'Apr', h: 74, opacity: 0.7 },
  { label: 'May', h: 90, opacity: 1, highlight: true },
];

const INSIGHTS = [
  {
    icon: 'trending_up',
    color: 'var(--admin-primary)',
    bg: 'rgba(1,45,29,0.06)',
    title: 'Growth Opportunity',
    body: 'Milk subscriptions are up 18% month-over-month. Consider a referral campaign to capitalise on momentum.',
  },
  {
    icon: 'inventory_2',
    color: 'var(--admin-secondary)',
    bg: 'rgba(212,163,115,0.1)',
    title: 'Inventory Alert',
    body: 'A2 Ghee stock is at 14 kg — projected to run out in 3 days at current order velocity.',
  },
  {
    icon: 'warning',
    color: 'var(--admin-error)',
    bg: 'rgba(186,26,26,0.06)',
    title: 'Delivery Note',
    body: '8 deliveries were paused this week. Review pause reasons; churn risk is elevated for long pauses.',
  },
];

export function AdminAnalytics() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());

  return (
    <div className="an-page">

      {/* ── Header ── */}
      <div className="an-header">
        <div>
          <h2 className="an-page-title">Reports &amp; Analytics</h2>
          <p className="an-page-sub">Performance overview for your dairy operations</p>
        </div>
        <div className="an-header-actions">
          <select
            className="an-month-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m} 2026</option>
            ))}
          </select>
          <button type="button" className="an-btn-export">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="an-metrics-grid">

        <div className="bento-card an-metric-card">
          <div className="an-metric-icon-wrap" style={{ background: 'rgba(1,45,29,0.08)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--admin-primary)', fontSize: 22 }}>payments</span>
          </div>
          <p className="an-metric-label">Total Revenue</p>
          <p className="an-metric-value">₹82,400</p>
          <p className="an-metric-trend an-trend-up">↑ 12.4% vs last month</p>
        </div>

        <div className="bento-card an-metric-card">
          <div className="an-metric-icon-wrap" style={{ background: 'rgba(212,163,115,0.12)' }}>
            <span className="material-symbols-outlined" style={{ color: '#a0622a', fontSize: 22 }}>water_drop</span>
          </div>
          <p className="an-metric-label">Milk Delivered</p>
          <p className="an-metric-value">1,240 L</p>
          <p className="an-metric-trend an-trend-neutral">
            <span className="an-badge-optimal">Optimal</span>
          </p>
        </div>

        <div className="bento-card an-metric-card">
          <div className="an-metric-icon-wrap" style={{ background: 'rgba(95,47,0,0.07)' }}>
            <span className="material-symbols-outlined" style={{ color: '#5f2f00', fontSize: 22 }}>bakery_dining</span>
          </div>
          <p className="an-metric-label">Ghee Delivered</p>
          <p className="an-metric-value">48 kg</p>
          <p className="an-metric-trend an-trend-up">↑ 5.2% vs last month</p>
        </div>

        <div className="bento-card an-metric-card">
          <div className="an-metric-icon-wrap" style={{ background: 'rgba(1,45,29,0.06)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--admin-primary)', fontSize: 22 }}>person_add</span>
          </div>
          <p className="an-metric-label">New Customers</p>
          <p className="an-metric-value">12</p>
          <p className="an-metric-trend an-trend-up">↑ 3 more than April</p>
        </div>

        <div className="bento-card an-metric-card">
          <div className="an-metric-icon-wrap" style={{ background: 'rgba(1,45,29,0.06)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--admin-primary)', fontSize: 22 }}>shopping_bag</span>
          </div>
          <p className="an-metric-label">Extra Orders</p>
          <p className="an-metric-value">34</p>
          <p className="an-metric-trend an-trend-up">↑ 8 vs last month</p>
        </div>

        <div className="bento-card an-metric-card">
          <div className="an-metric-icon-wrap" style={{ background: 'rgba(186,26,26,0.07)' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--admin-error)', fontSize: 22 }}>undo</span>
          </div>
          <p className="an-metric-label">Refunds Issued</p>
          <p className="an-metric-value an-val-error">₹1,240</p>
          <p className="an-metric-trend an-trend-down">↓ 3 refunds processed</p>
        </div>

      </div>

      {/* ── Charts row ── */}
      <div className="an-charts-grid">

        {/* Revenue by product */}
        <div className="bento-card an-chart-card">
          <h3 className="an-chart-title">Revenue by product ({MONTHS[month].slice(0, 3)})</h3>
          <p className="an-chart-sub">Breakdown of revenue across product categories</p>
          <div className="an-product-chart">
            <div className="an-product-bar-wrap">
              <div className="an-product-bar-group">
                <div className="an-product-bar an-bar-milk" style={{ height: '85%' }}>
                  <span className="an-bar-tooltip">₹58,000</span>
                </div>
                <p className="an-product-bar-label">Milk</p>
                <p className="an-product-bar-value">₹58,000</p>
              </div>
              <div className="an-product-bar-group">
                <div className="an-product-bar an-bar-ghee" style={{ height: '35%' }}>
                  <span className="an-bar-tooltip">₹24,400</span>
                </div>
                <p className="an-product-bar-label">Ghee</p>
                <p className="an-product-bar-value">₹24,400</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer growth */}
        <div className="bento-card an-chart-card">
          <h3 className="an-chart-title">Customer growth (last 6 months)</h3>
          <p className="an-chart-sub">New subscribers added per month</p>
          <div className="an-growth-chart">
            <div className="an-growth-grid-lines">
              {[0, 1, 2, 3].map((i) => <div key={i} className="an-grid-line" />)}
            </div>
            <div className="an-growth-bars">
              {GROWTH_BARS.map((b) => (
                <div key={b.label} className="an-growth-bar-col">
                  <div
                    className={`an-growth-bar ${b.highlight ? 'an-growth-bar-highlight' : ''}`}
                    style={{ height: `${b.h}%`, opacity: b.opacity }}
                  />
                  <span className="an-growth-label">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Operational insights ── */}
      <div className="an-insights-section">
        <h3 className="an-section-title">Operational Insights</h3>
        <div className="an-insights-grid">
          {INSIGHTS.map((ins) => (
            <div key={ins.title} className="an-insight-card">
              <div className="an-insight-icon-wrap" style={{ background: ins.bg }}>
                <span className="material-symbols-outlined" style={{ color: ins.color, fontSize: 24 }}>
                  {ins.icon}
                </span>
              </div>
              <h4 className="an-insight-title" style={{ color: ins.color }}>{ins.title}</h4>
              <p className="an-insight-body">{ins.body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
