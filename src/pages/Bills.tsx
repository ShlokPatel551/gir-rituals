import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { billLineItems } from '../data/mockData';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const statementTypeLabel: Record<string, string> = {
  delivery: '📦 Delivery',
  extra: '➕ Extra Order',
  pause: '⏸ Paused',
  payment: '✅ Payment',
  refund: '↩ Refund',
  store_credit: '💳 Store Credit',
};

export function Bills() {
  const { bills, statementEntries, walletBalance, addWalletCredit } = useApp();
  const [tab, setTab] = useState<'paid' | 'unpaid' | 'statement'>('unpaid');
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState('All');

  const paid = bills.filter((b) => b.status === 'paid');
  const unpaid = bills.filter((b) => b.status === 'unpaid');

  const availableMonths = ['All', ...Array.from(new Set(statementEntries.map((e) => e.month)))];
  const filteredStatements = filterMonth === 'All'
    ? statementEntries
    : statementEntries.filter((e) => e.month === filterMonth);

  return (
    <div>
      <h1 className="page-title">My Bills</h1>

      {walletBalance > 0 && (
        <div className="card" style={{ marginBottom: '1rem', background: 'var(--green-50)', border: '1px solid var(--green-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Wallet Balance</strong>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green-700)', margin: 0 }}>₹{walletBalance.toFixed(2)}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Use at checkout · Valid 6 months</p>
            </div>
            <span style={{ fontSize: '2rem' }}>💳</span>
          </div>
        </div>
      )}

      <div className="tabs">
        <button type="button" className={`tab ${tab === 'paid' ? 'active' : ''}`} onClick={() => setTab('paid')}>Paid</button>
        <button type="button" className={`tab ${tab === 'unpaid' ? 'active' : ''}`} onClick={() => setTab('unpaid')}>Unpaid</button>
        <button type="button" className={`tab ${tab === 'statement' ? 'active' : ''}`} onClick={() => setTab('statement')}>Statement</button>
      </div>

      {tab === 'paid' && (
        <>
          {paid.length === 0 && <div className="empty-state card"><p>No paid bills yet.</p></div>}
          {paid.map((b) => (
            <div key={b.id} className="card" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{b.period}</strong>
                <span className="badge badge-delivered">Paid</span>
              </div>
              <p style={{ marginTop: '0.25rem' }}>₹{b.amount.toFixed(2)} · {b.paidDate} · {b.method}</p>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => alert('Invoice download coming soon — PDF generation requires backend.')}
              >
                Download Invoice
              </button>
            </div>
          ))}
        </>
      )}

      {tab === 'unpaid' && (
        <>
          {unpaid.length === 0 && <div className="empty-state card"><p>No pending bills. You're all clear!</p></div>}
          {unpaid.map((b) => {
            const lineItems = billLineItems[b.id] ?? [];
            const isExpanded = expandedBill === b.id;
            return (
              <div key={b.id} className="card" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{b.period}</strong>
                  <span className="badge badge-unpaid">Unpaid</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Due: {b.dueDate}</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--green-700)' }}>₹{b.amount.toFixed(2)}</p>

                {lineItems.length > 0 && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '0.25rem 0', fontSize: '0.85rem', marginBottom: '0.25rem' }}
                      onClick={() => setExpandedBill(isExpanded ? null : b.id)}
                    >
                      {isExpanded ? 'Hide breakdown ▲' : 'View itemized breakdown ▼'}
                    </button>
                    {isExpanded && (
                      <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '0.3rem 0' }}>Item</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.35rem 0' }}>{item.description}</td>
                              <td style={{ textAlign: 'right', fontWeight: item.description.startsWith('GST') ? 400 : 600 }}>
                                ₹{item.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}

                <Link to={`/payment?amount=${b.amount}&billId=${b.id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                  Pay Now
                </Link>
              </div>
            );
          })}
        </>
      )}

      {tab === 'statement' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter:</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--border)' }}
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', marginLeft: 'auto' }}
              onClick={() => alert('PDF download requires backend integration.')}
            >
              Download PDF
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredStatements.length === 0 && (
              <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</p>
            )}
            {filteredStatements.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderBottom: i < filteredStatements.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{statementTypeLabel[entry.type] ?? entry.type}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{entry.description}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{entry.date}</p>
                </div>
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: entry.credit ? 'var(--green-700)' : 'var(--md-error, #b00020)',
                }}>
                  {entry.credit ? '+' : '−'} {entry.amount > 0 ? `₹${entry.amount.toFixed(2)}` : '—'}
                </span>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: '1rem', background: 'var(--green-50)' }}>
            <strong>Refund → Store Credit</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem' }}>
              Received a refund? Add it to your wallet for instant use on future orders.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { addWalletCredit(140); alert('₹140 store credit added to your wallet!'); }}
            >
              + Add Demo Store Credit (₹140)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
