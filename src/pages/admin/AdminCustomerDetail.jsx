import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomerDetail.css";

function fmt(amount) {
  return amount != null ? `₹${Number(amount).toLocaleString("en-IN")}` : "—";
}
function fmtDate(d, opts = { day: "2-digit", month: "short" }) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", opts);
}

/* ── Delivery status helpers ── */
const DS_CONFIG = {
  delivered: { dot: "#7B5233", label: "Delivered",  cls: "cd-ds-delivered" },
  pending:   { dot: "#ea9147", label: "Pending",    cls: "cd-ds-pending"   },
  paused:    { dot: "#ea9147", label: "Paused",     cls: "cd-ds-pending"   },
  cancelled: { dot: "#ba1a1a", label: "Cancelled",  cls: "cd-ds-error"     },
};

const AMT_STATUS = {
  "mobill":   { label: "Mo. Bill", cls: "cd-amt-mobill"  },
  "paid-upi": { label: "Paid (UPI)", cls: "cd-amt-paid" },
};

/* ── Calendar helpers ── */
const WEEKDAYS    = ["M","T","W","T","F","S","S"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TABS = [
  { key: "schedule",     label: "Schedule"     },
  { key: "subscription", label: "Subscription" },
  { key: "bills",        label: "Bills"        },
  { key: "orders",       label: "Orders"       },
  { key: "transactions", label: "Transactions" },
  { key: "notes",        label: "Notes"        },
];

const CAL_DOT = {
  delivered: "var(--admin-primary-container)",
  pending:   "var(--admin-tertiary-fixed-dim)",
  paused:    "#7d562d",
  cancelled: "var(--admin-error)",
};

function getDaysInMonth(y, m)    { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOffset(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

/* ══ Component ══ */
function AdminCustomerDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [data,   setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminCustomer(id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const customer = data ? {
    clientId:        data.clientId,
    name:            `${data.firstName} ${data.lastName}`.trim(),
    phone:           data.phone || "—",
    email:           data.email,
    joined:          fmtDate(data.createdAt, { day: "2-digit", month: "short", year: "numeric" }),
    deliveryAddress: [data.street, data.city, data.state, data.pinCode].filter(Boolean).join(", ") || "—",
    status:          data.status || "active",
  } : null;

  // ── Real data derived from API ──
  const deliveries = data?.deliveries ?? [];
  const bills      = (data?.bills ?? []).map(b => ({
    id: b.id, period: b.period,
    amount: fmt(b.amount), paid: b.status === "paid",
  }));
  const orders = (data?.orders ?? []).map(o => ({
    id: o.id, product: o.product_name,
    qty: o.qty != null ? String(o.qty) : "—",
    amount: fmt(o.total),
    date: fmtDate(o.created_at),
    status: o.status,
  }));
  const txns = (data?.statement ?? []).map(s => ({
    id: s.id, desc: s.description,
    date: fmtDate(s.date),
    amount: `${s.credit ? "+" : "-"}${fmt(Math.abs(s.amount))}`,
    credit: !!s.credit,
  }));
  const activeSub = (data?.subscriptions ?? []).find(s => s.status === "active");

  // ── Monthly summary for current month ──
  const now        = new Date();
  const thisYM     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthDels  = deliveries.filter(d => d.date && d.date.startsWith(thisYM));
  const monthBills = (data?.bills ?? []).filter(b => b.period && b.period.includes(
    now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  ));
  const totalPaid   = monthBills.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const totalUnpaid = monthBills.filter(b => b.status !== "paid").reduce((s, b) => s + b.amount, 0);
  const monthlySummary = {
    month:           now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    totalDeliveries: monthDels.length,
    totalPaid:       fmt(totalPaid),
    totalUnpaid:     fmt(totalUnpaid),
  };

  // ── Calendar dot map from real deliveries ──
  const dotMap = {};
  deliveries.forEach(d => {
    if (!d.date) return;
    const [y, m, day] = d.date.split("-").map(Number);
    if (y === calYear && m - 1 === calMonth && !dotMap[day]) {
      dotMap[day] = (d.status || "pending").toLowerCase();
    }
  });

  // ── History rows for schedule tab ──
  const historyRows = deliveries.map(d => {
    const dateObj = d.date ? new Date(d.date) : null;
    return {
      date:           dateObj ? fmtDate(d.date) : "—",
      type:           "Subscription",
      product:        d.product_name || "—",
      qty:            d.quantity != null ? `${d.quantity} ${d.product_unit || ""}`.trim() : "—",
      rate:           d.product_price != null ? fmt(d.product_price) : "—",
      amount:         d.quantity != null && d.product_price != null ? fmt(d.quantity * d.product_price) : "—",
      deliveryStatus: (d.status || "Pending").toLowerCase(),
      amtStatus:      null,
    };
  });

  const [activeTab, setActiveTab] = useState("schedule");
  const [showAll,   setShowAll]   = useState(false);
  const [noteText,  setNoteText]  = useState("");
  const [notes,     setNotes]     = useState([]);

  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  function prevMonth() { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); }
  function nextMonth() { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); }

  const daysInMonth    = getDaysInMonth(calYear, calMonth);
  const firstDayOffset = getFirstDayOffset(calYear, calMonth);
  const today          = now.getDate();
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();

  const visibleHistory = showAll ? historyRows : historyRows.slice(0, 5);

  function addNote() {
    if (!noteText.trim()) return;
    setNotes(prev => [{ author: "Admin", text: noteText, time: "Just now" }, ...prev]);
    setNoteText("");
  }

  if (loading) {
    return <div className="cd-not-found"><p className="cd-not-found-title">Loading…</p></div>;
  }
  if (!customer) {
    return (
      <div className="cd-not-found">
        <span className="material-symbols-outlined cd-not-found-icon">person_off</span>
        <p className="cd-not-found-title">Customer not found</p>
        <Link to="/admin/customers" className="cd-back-link">← Back to Customers</Link>
      </div>
    );
  }

  return (
    <div className="cd-page">

      {/* ── Breadcrumb + actions ── */}
      <div className="cd-topbar">
        <nav className="cd-breadcrumb">
          <Link to="/admin/customers" className="cd-crumb-link">Customers</Link>
          <span className="material-symbols-outlined cd-crumb-sep">chevron_right</span>
          <h2 className="cd-crumb-title">{customer.name} — {customer.clientId}</h2>
        </nav>
        <div className="cd-actions">
          <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/active-orders`)}>
            <span className="material-symbols-outlined">pending_actions</span>
            Active Orders
          </button>
          <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/billing`)}>
            <span className="material-symbols-outlined">receipt_long</span>
            Billing
          </button>
          <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/orders`)}>
            <span className="material-symbols-outlined">shopping_basket</span>
            Orders
          </button>
          <button type="button" className="cd-btn-whatsapp">
            <span className="material-symbols-outlined">chat</span>
            Send WhatsApp
          </button>
          <button type="button" className="cd-btn-danger">
            <span className="material-symbols-outlined">block</span>
            Deactivate
          </button>
        </div>
      </div>

      {/* ── Profile summary cards ── */}
      <div className="cd-info-grid">
        <div className="cd-info-card">
          <p className="cd-info-label">Phone</p>
          <p className="cd-info-value">{customer.phone}</p>
        </div>
        <div className="cd-info-card">
          <p className="cd-info-label">Email</p>
          <p className="cd-info-value cd-info-email">{customer.email}</p>
        </div>
        <div className="cd-info-card">
          <p className="cd-info-label">Registered</p>
          <p className="cd-info-value">{customer.joined}</p>
        </div>
        <div className="cd-info-card">
          <p className="cd-info-label">Delivery Address</p>
          <p className="cd-info-value cd-info-address">{customer.deliveryAddress || "—"}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="cd-tabs-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`cd-tab${activeTab === t.key ? " cd-tab-active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {/* ══ Schedule tab ══ */}
      {activeTab === "schedule" && (<>

        {/* Monthly Summary */}
        <div className="cd-monthly-summary">
          <div className="cd-ms-header">
            <h3 className="cd-ms-title">Monthly Summary — {monthlySummary.month}</h3>
          </div>

          <div className="cd-ms-stats-grid">
            <div className="cd-ms-stat">
              <p className="cd-ms-stat-label">Total Deliveries</p>
              <p className="cd-ms-stat-value">{monthlySummary.totalDeliveries || "—"}</p>
            </div>
            <div className="cd-ms-stat">
              <p className="cd-ms-stat-label">Total Paid</p>
              <p className="cd-ms-stat-value cd-ms-paid">{monthlySummary.totalPaid}</p>
            </div>
            <div className="cd-ms-stat">
              <p className="cd-ms-stat-label">Total Unpaid</p>
              <p className="cd-ms-stat-value cd-ms-unpaid">{monthlySummary.totalUnpaid}</p>
            </div>
          </div>
        </div>

        {/* Calendar + History grid */}
        <div className="cd-schedule-grid">

          {/* Calendar */}
          <div className="cd-card cd-calendar">
            <div className="cd-cal-header">
              <button type="button" className="cd-cal-nav" onClick={prevMonth}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <h3 className="cd-cal-month">{MONTH_NAMES[calMonth]} {calYear}</h3>
              <button type="button" className="cd-cal-nav" onClick={nextMonth}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="cd-cal-grid">
              {WEEKDAYS.map((d, i) => <div key={i} className="cd-cal-weekday">{d}</div>)}
              {Array.from({ length: firstDayOffset }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day     = i + 1;
                const isToday = isCurrentMonth && day === today;
                const dot     = isCurrentMonth ? dotMap[day] : undefined;
                return (
                  <div key={day} className={`cd-cal-day${isToday ? " cd-cal-today" : ""}`}>
                    <span className="cd-cal-num">{day}</span>
                    {dot && !isToday && (
                      <span className="cd-cal-dot" style={{ background: CAL_DOT[dot] || CAL_DOT.delivered }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="cd-cal-legend">
              <div className="cd-legend-row"><span className="cd-legend-dot" style={{ background: "var(--admin-primary-container)" }} /><span>Delivered</span></div>
              <div className="cd-legend-row"><span className="cd-legend-dot" style={{ background: "#7d562d" }} /><span>Paused</span></div>
              <div className="cd-legend-row"><span className="cd-legend-dot" style={{ background: "var(--admin-error)" }} /><span>Cancelled</span></div>
            </div>
          </div>

          {/* Delivery history table */}
          <div className="cd-card cd-history-card">
            <div className="cd-table-scroll">
              <table className="cd-table cd-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Delivery Status</th>
                    <th>Amt Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map((row, i) => {
                    const ds  = DS_CONFIG[row.deliveryStatus] || DS_CONFIG.delivered;
                    const amt = row.amtStatus ? AMT_STATUS[row.amtStatus] : null;
                    return (
                      <tr key={i}>
                        <td className="cd-td-bold">{row.date}</td>
                        <td className="cd-td-muted">{row.type}</td>
                        <td>{row.product}</td>
                        <td className="cd-td-muted">{row.qty}</td>
                        <td className="cd-td-muted">{row.rate}</td>
                        <td className="cd-td-bold">{row.amount}</td>
                        <td>
                          <span className={`cd-ds-status ${ds.cls}`}>
                            <span className="cd-ds-dot" style={{ background: ds.dot }} />
                            {ds.label}
                          </span>
                        </td>
                        <td>
                          {amt && <span className={`cd-amt-badge ${amt.cls}`}>{amt.label}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="cd-history-footer">
              <button type="button" className="cd-view-all" onClick={() => setShowAll(v => !v)}>
                {showAll ? "Show less" : "View all history"}
              </button>
            </div>
          </div>
        </div>

        {/* Inline notes */}
        <div className="cd-card cd-inline-notes">
          <div className="cd-inline-notes-decor" />
          <div className="cd-inline-notes-inner">
            <h4 className="cd-inline-notes-title">Internal Notes</h4>
            <div className="cd-notes-list">
              {notes.map((note, i) => (
                <div key={i} className="cd-note-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
                  <div className="cd-note-avatar">{note.author[0]}</div>
                  <div className="cd-note-body">
                    <div className="cd-note-bubble">{note.text}</div>
                    <div className="cd-note-meta">
                      <span className="cd-note-author">{note.author}</span>
                      <span className="cd-note-time">• {note.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>)}

      {/* ══ Subscription tab ══ */}
      {activeTab === "subscription" && (
        <div className="cd-sub-page">
          {!activeSub ? (
            <div className="cd-card cd-tab-panel" style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
              No active subscription
            </div>
          ) : (
            <div className="cd-card cd-sub-plan-card">
              <div className="cd-sub-plan-top">
                <div className="cd-sub-plan-icon"><span className="material-symbols-outlined">water_drop</span></div>
                <div className="cd-sub-plan-info">
                  <div className="cd-sub-plan-name-row">
                    <h3 className="cd-sub-plan-name">{activeSub.product_name || activeSub.product_id}</h3>
                    <span className="cd-badge cd-badge-delivered cd-sub-status-badge">
                      <span className="cd-sub-status-dot" />{activeSub.status}
                    </span>
                  </div>
                  <p className="cd-sub-plan-variant">{activeSub.quantity} {activeSub.product_unit || ""} · {activeSub.frequency}</p>
                </div>
                <div className="cd-sub-plan-actions">
                  <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/active-orders`)}>
                    <span className="material-symbols-outlined">edit</span>Edit Plan
                  </button>
                </div>
              </div>
              <div className="cd-sub-meta-grid">
                <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Started</p><p className="cd-sub-meta-val">{fmtDate(activeSub.start_date, { day: "2-digit", month: "short", year: "numeric" })}</p></div>
                <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Frequency</p><p className="cd-sub-meta-val">{activeSub.frequency}</p></div>
                <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Unit Price</p><p className="cd-sub-meta-val cd-sub-meta-amount">{fmt(activeSub.product_price)}</p></div>
                <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Quantity</p><p className="cd-sub-meta-val">{activeSub.quantity} {activeSub.product_unit || ""}</p></div>
              </div>
            </div>
          )}

          {(data?.subscriptions ?? []).length > 1 && (
            <div className="cd-card cd-sub-timeline-card">
              <h4 className="cd-sub-section-title" style={{ marginBottom: "1rem" }}>All Subscriptions</h4>
              <div className="cd-sub-timeline">
                {(data.subscriptions).map((s, i) => (
                  <div key={i} className="cd-sub-tl-row">
                    <div className="cd-sub-tl-dot" />
                    <div className="cd-sub-tl-line" />
                    <div className="cd-sub-tl-content">
                      <p className="cd-sub-tl-date">{fmtDate(s.start_date, { day: "2-digit", month: "short", year: "numeric" })}</p>
                      <p className="cd-sub-tl-desc">{s.product_name || s.product_id} — {s.quantity} {s.product_unit || ""} / {s.frequency}</p>
                    </div>
                    <span className={`cd-badge ${s.status === "active" ? "cd-badge-delivered" : "cd-badge-paused"}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ Bills tab ══ */}
      {activeTab === "bills" && (
        <div className="cd-card cd-tab-panel">
          <div className="cd-table-scroll">
            <table className="cd-table">
              <thead><tr><th>Bill #</th><th>Period</th><th>Amount</th><th>Status</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
              <tbody>
                {bills.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>No bills yet</td></tr>
                )}
                {bills.map(b => (
                  <tr key={b.id}>
                    <td className="cd-td-bold cd-td-muted">{b.id}</td>
                    <td>{b.period}</td>
                    <td className="cd-td-bold">{b.amount}</td>
                    <td><span className={`cd-badge ${b.paid ? "cd-badge-delivered" : "cd-badge-paused"}`}>{b.paid ? "Paid" : "Unpaid"}</span></td>
                    <td style={{ textAlign: "right" }}><button type="button" className="cd-action-link">{b.paid ? "Download" : "Collect"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ Orders tab ══ */}
      {activeTab === "orders" && (
        <div className="cd-card cd-tab-panel">
          <div className="cd-table-scroll">
            <table className="cd-table">
              <thead><tr><th>Order ID</th><th>Product</th><th>Qty</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>No orders yet</td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="cd-td-bold cd-td-muted">{o.id}</td>
                    <td>{o.product}</td>
                    <td className="cd-td-muted">{o.qty}</td>
                    <td className="cd-td-bold">{o.amount}</td>
                    <td className="cd-td-muted">{o.date}</td>
                    <td><span className={`cd-badge ${o.status === "active" ? "cd-badge-delivered" : "cd-badge-paused"}`}>{o.status || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cd-history-footer">
            <button type="button" className="cd-view-all" onClick={() => navigate(`/admin/customers/${id}/orders`)}>
              View All Orders <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ══ Transactions tab ══ */}
      {activeTab === "transactions" && (
        <div className="cd-card cd-tab-panel">
          <div className="cd-table-scroll">
            <table className="cd-table">
              <thead><tr><th>Txn ID</th><th>Description</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
              <tbody>
                {txns.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>No transactions yet</td></tr>
                )}
                {txns.map(t => (
                  <tr key={t.id}>
                    <td className="cd-td-bold cd-td-muted">{t.id}</td>
                    <td>{t.desc}</td>
                    <td className="cd-td-muted">{t.date}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: t.credit ? "#7B5233" : "var(--admin-error)" }}>{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cd-history-footer">
            <button type="button" className="cd-view-all" onClick={() => navigate(`/admin/customers/${id}/transactions`)}>
              View Full Ledger <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button type="button" className="cd-view-all" onClick={() => navigate("/admin/refunds")}>
              <span className="material-symbols-outlined">assignment_return</span> Refund Requests
            </button>
          </div>
        </div>
      )}

      {/* ══ Notes tab ══ */}
      {activeTab === "notes" && (
        <div className="cd-notes-section">
          <div className="cd-card cd-note-compose">
            <textarea className="cd-note-input" placeholder="Add an internal note about this customer…" rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} />
            <div className="cd-note-compose-footer">
              <button type="button" className="cd-btn-primary" onClick={addNote} disabled={!noteText.trim()}>Add note</button>
            </div>
          </div>
          <div className="cd-notes-list">
            {notes.map((note, i) => (
              <div key={i} className="cd-card cd-note-card">
                <div className="cd-note-avatar">{note.author[0]}</div>
                <div className="cd-note-body">
                  <div className="cd-note-bubble">{note.text}</div>
                  <div className="cd-note-meta">
                    <span className="cd-note-author">{note.author}</span>
                    <span className="cd-note-time">• {note.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export { AdminCustomerDetail };
