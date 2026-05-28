import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Schedule.css';

type DayStatus = 'delivered' | 'paused' | 'cancelled' | 'extra' | 'none';

function getDayStatus(day: number, month: number, year: number, today: Date): DayStatus {
  const d = new Date(year, month, day);
  if (d > today) return 'none';
  if (day % 7 === 0) return 'paused';
  if (day % 11 === 0) return 'extra';
  if (day % 13 === 0) return 'cancelled';
  return 'delivered';
}

function getDotClass(status: DayStatus): string {
  switch (status) {
    case 'delivered': return 'dot delivered';
    case 'paused': return 'dot paused';
    case 'cancelled': return 'dot cancelled';
    case 'extra': return 'dot extra';
    default: return '';
  }
}

function getDotLabel(status: DayStatus): string {
  return status === 'extra' ? '★' : '';
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthLabel(month: number, year: number): string {
  return new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function buildScheduleForDay(day: number, month: number, year: number, today: Date) {
  const status = getDayStatus(day, month, year, today);
  if (status === 'none') return [];
  const deliveryStatus =
    status === 'paused' ? 'Paused' :
    status === 'extra' ? 'Extra' :
    status === 'cancelled' ? 'Cancelled' :
    'Delivered';
  return [
    {
      productName: 'Pure Gir Cow Milk',
      qty: status === 'paused' || status === 'cancelled' ? 0 : 1,
      rate: 70,
      status: deliveryStatus,
    },
  ];
}

export function Schedule() {
  const today = useMemo(() => new Date(), []);
  const { showToast } = useToast();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const entries = buildScheduleForDay(selectedDay, viewMonth, viewYear, today);
  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(1);
  };

  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const deliveredDays = allDays.filter((d) => getDayStatus(d, viewMonth, viewYear, today) === 'delivered').length;
  const pausedDays = allDays.filter((d) => getDayStatus(d, viewMonth, viewYear, today) === 'paused').length;
  const extraOrders = allDays.filter((d) => getDayStatus(d, viewMonth, viewYear, today) === 'extra').length;

  const totalMilkL = deliveredDays + extraOrders;
  const monthlyBill = totalMilkL * 70;
  const gst = Math.round(monthlyBill * 0.05);
  const totalWithGst = monthlyBill + gst;

  const filteredDays = filterStatus === 'all'
    ? allDays
    : allDays.filter((d) => getDayStatus(d, viewMonth, viewYear, today) === filterStatus);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>My Schedule</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--md-radius-full)', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit' }}
          >
            <option value="all">All Days</option>
            <option value="delivered">Delivered</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="extra">Extras</option>
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}
            onClick={() => showToast('Export requires backend integration.', 'info')}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Desktop two-column layout */}
      <div className="schedule-desktop-grid">

        {/* Left — Calendar */}
        <div className="card schedule-calendar-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={prevMonth}>←</button>
            <strong>{getMonthLabel(viewMonth, viewYear)}</strong>
            <button type="button" className="btn btn-ghost" onClick={nextMonth}>→</button>
          </div>
          <div className="calendar-grid">
            {filteredDays.map((day) => {
              const status = getDayStatus(day, viewMonth, viewYear, today);
              const dotClass = getDotClass(status);
              const dotLabel = getDotLabel(status);
              const isToday = isCurrentMonth && day === today.getDate();
              const dimmed = filterStatus !== 'all' && status !== filterStatus;
              return (
                <button
                  key={day}
                  type="button"
                  className={`cal-day ${day === selectedDay ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  style={{ opacity: dimmed ? 0.3 : 1 }}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                  {dotClass && <span className={dotClass}>{dotLabel}</span>}
                </button>
              );
            })}
          </div>
          <div className="mini-summary" style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--green-700)' }}>● Delivered: {deliveredDays}</span>
            {' · '}
            <span style={{ color: '#f59e0b' }}>● Paused: {pausedDays}</span>
            {' · '}
            <span style={{ color: 'var(--green-700)' }}>★ Extras: {extraOrders}</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span><span style={{ color: '#ef4444' }}>●</span> Cancelled</span>
            <span><span style={{ color: '#9ca3af' }}>●</span> Future</span>
          </div>
        </div>

        {/* Right — Day detail + summary */}
        <div className="schedule-detail-col">
          {/* Day detail */}
          <div className="card" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong>{selectedDay} {getMonthLabel(viewMonth, viewYear)}</strong>
              <Link to={`/schedule/day/${selectedDay}`} style={{ fontSize: '0.82rem', color: 'var(--green-700)', fontWeight: 600 }}>
                Full view →
              </Link>
            </div>
            {entries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No delivery scheduled for this day.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.4rem 0' }}>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={i}>
                      <td style={{ padding: '0.4rem 0' }}>{e.productName}</td>
                      <td>{e.qty}</td>
                      <td>₹{e.rate}</td>
                      <td>₹{e.qty * e.rate}</td>
                      <td>
                        <span className={`badge badge-${
                          e.status === 'Delivered' ? 'delivered' :
                          e.status === 'Paused' ? 'paused' :
                          e.status === 'Extra' ? 'extra' :
                          'unpaid'
                        }`}>{e.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Monthly summary */}
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Monthly Summary — {getMonthLabel(viewMonth, viewYear)}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div className="card" style={{ background: 'var(--md-primary-container)', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Milk Delivered</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{deliveredDays} L</p>
              </div>
              <div className="card" style={{ background: 'var(--md-primary-container)', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Ghee Delivered</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>0.5 kg</p>
              </div>
              <div className="card" style={{ background: 'var(--md-primary-container)', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Extra Orders</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{extraOrders}</p>
              </div>
              <div className="card" style={{ background: 'var(--md-primary-container)', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Days Paused</p>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{pausedDays}</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <span>Subtotal</span><span>₹{monthlyBill.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>GST (5%)</span><span>₹{gst.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem' }}>
                <span>Total Monthly Bill</span><span>₹{totalWithGst.toFixed(2)}</span>
              </div>
            </div>
            <Link to={`/payment?amount=${totalWithGst}`} className="btn btn-primary" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
              Pay Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DayDetail() {
  const { day } = useParams();
  const today = new Date();
  const d = Number(day ?? today.getDate());
  const month = today.getMonth();
  const year = today.getFullYear();
  const entries = buildScheduleForDay(d, month, year, today);

  return (
    <div>
      <Link to="/schedule" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Schedule</Link>
      <h1 className="page-title">{d} {getMonthLabel(month, year)}</h1>
      {entries.length === 0 ? (
        <div className="empty-state card"><p>No deliveries scheduled for this day.</p></div>
      ) : (
        entries.map((e, i) => (
          <div key={i} className="card" style={{ marginBottom: '0.5rem' }}>
            <strong>{e.productName}</strong>
            <p style={{ margin: '0.25rem 0' }}>Qty: {e.qty} · Rate: ₹{e.rate} · Total: ₹{e.qty * e.rate}</p>
            <span className={`badge badge-${e.status === 'Delivered' ? 'delivered' : e.status === 'Paused' ? 'paused' : 'pending'}`}>{e.status}</span>
          </div>
        ))
      )}
      {entries.length > 0 && (
        <Link to={`/payment?amount=${entries.reduce((s, e) => s + e.qty * e.rate, 0)}&from=schedule`} className="btn btn-primary" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
          Pay for this day
        </Link>
      )}
    </div>
  );
}
