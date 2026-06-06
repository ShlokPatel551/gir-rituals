import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomerDetail.css";

/* ── Mock data ── */
const MOCK_MAP = {
  GR00124: { clientId: "GR00124", name: "Priya Shah",    phone: "9876543210", email: "priya.shah@gmail.com",      joined: "12 Jan 2025", deliveryAddress: "Plot 42, Navrangpura, Ahmedabad 380009", status: "active" },
  GR00089: { clientId: "GR00089", name: "Rahul Mehta",   phone: "9876502002", email: "rahul.mehta@yahoo.com",     joined: "05 Feb 2026", deliveryAddress: "B-12, Satellite, Ahmedabad 380015",        status: "active" },
  GR00201: { clientId: "GR00201", name: "Anjali Kapoor", phone: "9876503003", email: "anjali.k@hotmail.com",      joined: "20 Feb 2026", deliveryAddress: "17/A, Bopal, Ahmedabad 380058",            status: "active" },
  GR00057: { clientId: "GR00057", name: "Meena Patel",   phone: "9876504004", email: "meena.patel@gmail.com",     joined: "08 Nov 2025", deliveryAddress: "—",                                        status: "paused" },
  GR00312: { clientId: "GR00312", name: "Suresh Joshi",  phone: "9876505005", email: "suresh.j@gmail.com",        joined: "15 Mar 2026", deliveryAddress: "Vastrapur Lake Road, Ahmedabad 380054",    status: "active" },
  GR00098: { clientId: "GR00098", name: "Kavita Rao",    phone: "9876506006", email: "kavita.rao@rediffmail.com", joined: "03 Dec 2025", deliveryAddress: "—",                                        status: "active" },
  GR00143: { clientId: "GR00143", name: "Deepak Nair",   phone: "9876507007", email: "deepak.nair@gmail.com",     joined: "28 Mar 2026", deliveryAddress: "—",                                        status: "new"    },
  GR00178: { clientId: "GR00178", name: "Sunita Verma",  phone: "9876508008", email: "sunita.v@gmail.com",        joined: "14 Apr 2026", deliveryAddress: "—",                                        status: "active" },
  GR00234: { clientId: "GR00234", name: "Arjun Desai",   phone: "9876509009", email: "arjun.desai@outlook.com",   joined: "01 May 2026", deliveryAddress: "—",                                        status: "new"    },
  GR00267: { clientId: "GR00267", name: "Pooja Sharma",  phone: "9876510010", email: "pooja.s@gmail.com",         joined: "10 May 2026", deliveryAddress: "—",                                        status: "paused" },
};

const MOCK_HISTORY = [
  { date: "28 May", dayNum: 28, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "",       dayNum: 28, type: "Extra",         product: "A2 Desi Cow Milk",     qty: "+1 L",  rate: "₹70",  amount: "₹70",  deliveryStatus: "delivered", amtStatus: "paid-upi" },
  { date: "27 May", dayNum: 27, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "pending",   amtStatus: "mobill"   },
  { date: "26 May", dayNum: 26, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "25 May", dayNum: 25, type: "Individual",   product: "Organic Gir Cow Ghee", qty: "250g",  rate: "₹650", amount: "₹162", deliveryStatus: "delivered", amtStatus: "paid-upi" },
  { date: "24 May", dayNum: 24, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "23 May", dayNum: 23, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "22 May", dayNum: 22, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "21 May", dayNum: 21, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "20 May", dayNum: 20, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "19 May", dayNum: 19, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "18 May", dayNum: 18, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "17 May", dayNum: 17, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "16 May", dayNum: 16, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "15 May", dayNum: 15, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", deliveryStatus: "delivered", amtStatus: "mobill"   },
  { date: "14 May", dayNum: 14, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "—",     rate: "₹70",  amount: "₹0",   deliveryStatus: "paused",    amtStatus: null       },
  { date: "13 May", dayNum: 13, type: "Subscription", product: "A2 Desi Cow Milk",     qty: "—",     rate: "₹70",  amount: "₹0",   deliveryStatus: "paused",    amtStatus: null       },
];

const MONTHLY_SUMMARY = {
  month:           "May 2025",
  cycle:           "1st – 31st May",
  totalDeliveries: 24,
  totalPaid:       "₹1,240",
  totalUnpaid:     "₹650",
  billTotal:       "₹2,140",
  products: [
    { icon: "water_drop", name: "A2 Desi Cow Milk",     qty: "48 L"  },
    { icon: "egg_alt",    name: "Organic Gir Cow Ghee", qty: "750g"  },
  ],
};

const MOCK_BILLS = [
  { id: "B-0041", period: "May 2026", amount: "₹2,100", paid: true  },
  { id: "B-0038", period: "Apr 2026", amount: "₹2,100", paid: true  },
  { id: "B-0035", period: "Mar 2026", amount: "₹1,960", paid: false },
];

const MOCK_ORDERS = [
  { id: "ORD-1041", product: "Gir Milk",    qty: "2 L",  amount: "₹140", date: "27 May" },
  { id: "ORD-1038", product: "Bilona Ghee", qty: "500g", amount: "₹600", date: "25 May" },
  { id: "ORD-1031", product: "Gir Milk",    qty: "1 L",  amount: "₹70",  date: "20 May" },
];

const MOCK_TXNS = [
  { id: "TXN-8821", desc: "May subscription payment", date: "27 May", amount: "+₹2,100", credit: true  },
  { id: "TXN-8811", desc: "Extra ghee order",          date: "25 May", amount: "+₹162",   credit: true  },
  { id: "TXN-8790", desc: "Wallet top-up",             date: "20 May", amount: "+₹500",   credit: true  },
  { id: "TXN-8780", desc: "Refund processed",          date: "10 May", amount: "-₹140",   credit: false },
];

const MOCK_NOTES_INIT = [
  { author: "Meera Desai", text: "Customer requested delivery time moved to 6:30 AM instead of 7:30 AM starting from next week.", time: "2 hours ago" },
];

const MOCK_SUBSCRIPTION = {
  plan: "A2 Gir Cow Milk", variant: "2 L / day", frequency: "Daily",
  startDate: "12 Jan 2025", nextRenewal: "01 Jun 2026", monthlyAmt: "₹2,100", status: "active",
  addOns: [
    { name: "Bilona Ghee 250g",     freq: "Weekly",    price: "₹325" },
    { name: "Organic Paneer 200g",  freq: "Bi-weekly", price: "₹120" },
  ],
};

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
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [apiCustomer, setApiCustomer] = useState(null);

  useEffect(() => {
    api.adminCustomer(id).then(c => {
      setApiCustomer({
        clientId:        c.clientId,
        name:            `${c.firstName} ${c.lastName}`,
        phone:           c.phone || "—",
        email:           c.email,
        joined:          c.createdAt
          ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        deliveryAddress: [c.deliveryAddress?.line1, c.deliveryAddress?.city, c.deliveryAddress?.pincode]
          .filter(Boolean).join(", ") || "—",
        status: "active",
      });
    }).catch(() => {});
  }, [id]);

  const customer = apiCustomer || (id ? MOCK_MAP[id] : undefined);

  const [activeTab, setActiveTab] = useState("schedule");
  const [showAll,   setShowAll]   = useState(false);
  const [noteText,  setNoteText]  = useState("");
  const [notes,     setNotes]     = useState(MOCK_NOTES_INIT);

  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  function prevMonth() { if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); } else setCalMonth(m => m - 1); }
  function nextMonth() { if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); } else setCalMonth(m => m + 1); }

  const daysInMonth    = getDaysInMonth(calYear, calMonth);
  const firstDayOffset = getFirstDayOffset(calYear, calMonth);
  const today          = now.getDate();
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();
  const dotMap         = {};
  MOCK_HISTORY.forEach(r => { if (r.dayNum && !dotMap[r.dayNum]) dotMap[r.dayNum] = r.deliveryStatus; });

  const visibleHistory = showAll ? MOCK_HISTORY : MOCK_HISTORY.slice(0, 5);

  function addNote() {
    if (!noteText.trim()) return;
    setNotes(prev => [{ author: "Admin", text: noteText, time: "Just now" }, ...prev]);
    setNoteText("");
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
            <h3 className="cd-ms-title">Monthly Summary — {MONTHLY_SUMMARY.month}</h3>
            <div className="cd-ms-cycle-badge">
              <span>Cycle: {MONTHLY_SUMMARY.cycle}</span>
            </div>
          </div>

          <div className="cd-ms-stats-grid">
            <div className="cd-ms-stat">
              <p className="cd-ms-stat-label">Total Deliveries</p>
              <p className="cd-ms-stat-value">{MONTHLY_SUMMARY.totalDeliveries}</p>
            </div>
            <div className="cd-ms-stat">
              <p className="cd-ms-stat-label">Total Paid</p>
              <p className="cd-ms-stat-value cd-ms-paid">{MONTHLY_SUMMARY.totalPaid}</p>
            </div>
            <div className="cd-ms-stat">
              <p className="cd-ms-stat-label">Total Unpaid</p>
              <p className="cd-ms-stat-value cd-ms-unpaid">{MONTHLY_SUMMARY.totalUnpaid}</p>
            </div>
            <div className="cd-ms-stat cd-ms-stat-total">
              <p className="cd-ms-stat-label cd-ms-total-label">Month Bill Total</p>
              <p className="cd-ms-stat-value">{MONTHLY_SUMMARY.billTotal}</p>
            </div>
          </div>

          <div className="cd-ms-products-section">
            <p className="cd-ms-products-label">Total Products Delivered</p>
            <div className="cd-ms-products-row">
              {MONTHLY_SUMMARY.products.map(p => (
                <div key={p.name} className="cd-ms-product-chip">
                  <span className="material-symbols-outlined cd-ms-product-icon">{p.icon}</span>
                  <div>
                    <p className="cd-ms-product-name">{p.name}</p>
                    <p className="cd-ms-product-qty">{p.qty}</p>
                  </div>
                </div>
              ))}
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
          <div className="cd-card cd-sub-plan-card">
            <div className="cd-sub-plan-top">
              <div className="cd-sub-plan-icon"><span className="material-symbols-outlined">water_drop</span></div>
              <div className="cd-sub-plan-info">
                <div className="cd-sub-plan-name-row">
                  <h3 className="cd-sub-plan-name">{MOCK_SUBSCRIPTION.plan}</h3>
                  <span className="cd-badge cd-badge-delivered cd-sub-status-badge">
                    <span className="cd-sub-status-dot" />Active
                  </span>
                </div>
                <p className="cd-sub-plan-variant">{MOCK_SUBSCRIPTION.variant} · {MOCK_SUBSCRIPTION.frequency}</p>
              </div>
              <div className="cd-sub-plan-actions">
                <button type="button" className="cd-sub-btn-pause"><span className="material-symbols-outlined">pause_circle</span>Pause</button>
                <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/active-orders`)}><span className="material-symbols-outlined">edit</span>Edit Plan</button>
              </div>
            </div>
            <div className="cd-sub-meta-grid">
              <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Started</p><p className="cd-sub-meta-val">{MOCK_SUBSCRIPTION.startDate}</p></div>
              <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Next Renewal</p><p className="cd-sub-meta-val">{MOCK_SUBSCRIPTION.nextRenewal}</p></div>
              <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Monthly Amount</p><p className="cd-sub-meta-val cd-sub-meta-amount">{MOCK_SUBSCRIPTION.monthlyAmt}</p></div>
              <div className="cd-sub-meta-item"><p className="cd-sub-meta-label">Frequency</p><p className="cd-sub-meta-val">{MOCK_SUBSCRIPTION.frequency}</p></div>
            </div>
          </div>

          <div className="cd-card cd-sub-addons-card">
            <div className="cd-sub-section-header">
              <h4 className="cd-sub-section-title">Add-ons</h4>
              <button type="button" className="cd-sub-btn-add" onClick={() => navigate("/admin/orders/new")}><span className="material-symbols-outlined">add</span>Add product</button>
            </div>
            <div className="cd-sub-addons-list">
              {MOCK_SUBSCRIPTION.addOns.map((a, i) => (
                <div key={i} className="cd-sub-addon-row">
                  <div className="cd-sub-addon-icon"><span className="material-symbols-outlined">grocery</span></div>
                  <div className="cd-sub-addon-info">
                    <p className="cd-sub-addon-name">{a.name}</p>
                    <p className="cd-sub-addon-freq">{a.freq}</p>
                  </div>
                  <span className="cd-sub-addon-price">{a.price}</span>
                  <button type="button" className="cd-sub-addon-remove"><span className="material-symbols-outlined">remove_circle_outline</span></button>
                </div>
              ))}
            </div>
          </div>

          <div className="cd-card cd-sub-timeline-card">
            <h4 className="cd-sub-section-title" style={{ marginBottom: "1rem" }}>Renewal History</h4>
            <div className="cd-sub-timeline">
              {[
                { date: "01 May 2026", amount: "₹2,100", paid: true  },
                { date: "01 Apr 2026", amount: "₹2,100", paid: true  },
                { date: "01 Mar 2026", amount: "₹1,960", paid: true  },
                { date: "01 Feb 2026", amount: "₹1,960", paid: true  },
                { date: "01 Jan 2026", amount: "₹1,960", paid: true  },
              ].map((r, i) => (
                <div key={i} className="cd-sub-tl-row">
                  <div className="cd-sub-tl-dot" />
                  <div className="cd-sub-tl-line" />
                  <div className="cd-sub-tl-content">
                    <p className="cd-sub-tl-date">{r.date}</p>
                    <p className="cd-sub-tl-desc">Monthly renewal — {r.amount}</p>
                  </div>
                  <span className={`cd-badge ${r.paid ? "cd-badge-delivered" : "cd-badge-paused"}`}>{r.paid ? "Paid" : "Pending"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ Bills tab ══ */}
      {activeTab === "bills" && (
        <div className="cd-card cd-tab-panel">
          <div className="cd-table-scroll">
            <table className="cd-table">
              <thead><tr><th>Bill #</th><th>Period</th><th>Amount</th><th>Status</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
              <tbody>
                {MOCK_BILLS.map(b => (
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
                {MOCK_ORDERS.map(o => (
                  <tr key={o.id}>
                    <td className="cd-td-bold cd-td-muted">{o.id}</td>
                    <td>{o.product}</td>
                    <td className="cd-td-muted">{o.qty}</td>
                    <td className="cd-td-bold">{o.amount}</td>
                    <td className="cd-td-muted">{o.date}</td>
                    <td><span className="cd-badge cd-badge-delivered">Delivered</span></td>
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
                {MOCK_TXNS.map(t => (
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
