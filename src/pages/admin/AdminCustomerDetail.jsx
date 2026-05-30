import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomerDetail.css";

const MOCK_MAP = {
  GR00124: { clientId: "GR00124", name: "Priya Shah",    phone: "9876543210", email: "priya.shah@gmail.com",     joined: "12 Jan 2025", walletBalance: 120,  status: "active" },
  GR00089: { clientId: "GR00089", name: "Rahul Mehta",   phone: "9876502002", email: "rahul.mehta@yahoo.com",    joined: "05 Feb 2026", walletBalance: 0,    status: "active" },
  GR00201: { clientId: "GR00201", name: "Anjali Kapoor", phone: "9876503003", email: "anjali.k@hotmail.com",     joined: "20 Feb 2026", walletBalance: 350,  status: "active" },
  GR00057: { clientId: "GR00057", name: "Meena Patel",   phone: "9876504004", email: "meena.patel@gmail.com",    joined: "08 Nov 2025", walletBalance: 0,    status: "paused" },
  GR00312: { clientId: "GR00312", name: "Suresh Joshi",  phone: "9876505005", email: "suresh.j@gmail.com",       joined: "15 Mar 2026", walletBalance: 200,  status: "active" },
  GR00098: { clientId: "GR00098", name: "Kavita Rao",    phone: "9876506006", email: "kavita.rao@rediffmail.com",joined: "03 Dec 2025", walletBalance: 75,   status: "active" },
  GR00143: { clientId: "GR00143", name: "Deepak Nair",   phone: "9876507007", email: "deepak.nair@gmail.com",    joined: "28 Mar 2026", walletBalance: 0,    status: "new"    },
  GR00178: { clientId: "GR00178", name: "Sunita Verma",  phone: "9876508008", email: "sunita.v@gmail.com",       joined: "14 Apr 2026", walletBalance: 500,  status: "active" },
  GR00234: { clientId: "GR00234", name: "Arjun Desai",   phone: "9876509009", email: "arjun.desai@outlook.com",  joined: "01 May 2026", walletBalance: 0,    status: "new"    },
  GR00267: { clientId: "GR00267", name: "Pooja Sharma",  phone: "9876510010", email: "pooja.s@gmail.com",        joined: "10 May 2026", walletBalance: 0,    status: "paused" },
};

const MOCK_HISTORY = [
  { date: "27 May", dayNum: 27, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "today"     },
  { date: "26 May", dayNum: 26, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "25 May", dayNum: 25, product: "Organic Gir Cow Ghee", qty: "+250g", rate: "₹650", amount: "₹162", status: "extra"     },
  { date: "24 May", dayNum: 24, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "23 May", dayNum: 23, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "22 May", dayNum: 22, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "21 May", dayNum: 21, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "20 May", dayNum: 20, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "19 May", dayNum: 19, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "18 May", dayNum: 18, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "17 May", dayNum: 17, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "16 May", dayNum: 16, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "15 May", dayNum: 15, product: "A2 Desi Cow Milk",     qty: "2 L",   rate: "₹70",  amount: "₹140", status: "delivered" },
  { date: "14 May", dayNum: 14, product: "A2 Desi Cow Milk",     qty: "0",     rate: "₹70",  amount: "₹0",   status: "paused"    },
  { date: "13 May", dayNum: 13, product: "A2 Desi Cow Milk",     qty: "0",     rate: "₹70",  amount: "₹0",   status: "paused"    },
];

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
  { author: "Meera Desai", text: "Customer requested to move the delivery time to 6:30 AM instead of 7:30 AM starting from next week.", time: "2 hours ago" },
];

const STATUS_LABEL = {
  today:     "Today delivery",
  delivered: "Delivered",
  extra:     "Extra — paid",
  paused:    "Paused",
  cancelled: "Cancelled",
};

const STATUS_DOT = {
  today:     "var(--admin-primary-container)",
  delivered: "var(--admin-primary-container)",
  extra:     "var(--admin-secondary)",
  paused:    "#7d562d",
  cancelled: "var(--admin-error)",
};

const BADGE_CLASS = {
  today:     "cd-badge-today",
  delivered: "cd-badge-delivered",
  extra:     "cd-badge-extra",
  paused:    "cd-badge-paused",
  cancelled: "cd-badge-cancelled",
};

const WEEKDAYS    = ["M","T","W","T","F","S","S"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MOCK_SUBSCRIPTION = {
  plan:       "A2 Gir Cow Milk",
  variant:    "2 L / day",
  frequency:  "Daily",
  startDate:  "12 Jan 2025",
  nextRenewal:"01 Jun 2026",
  monthlyAmt: "₹2,100",
  status:     "active",
  addOns: [
    { name: "Bilona Ghee 250g",  freq: "Weekly",  price: "₹325" },
    { name: "Organic Paneer 200g", freq: "Bi-weekly", price: "₹120" },
  ],
};

const TABS = [
  { key: "schedule",     label: "Schedule"     },
  { key: "subscription", label: "Subscription" },
  { key: "bills",        label: "Bills"        },
  { key: "orders",       label: "Orders"       },
  { key: "transactions", label: "Transactions" },
  { key: "notes",        label: "Notes"        },
];

function getDaysInMonth(y, m)    { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOffset(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

function AdminCustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiCustomer, setApiCustomer] = useState(null);

  useEffect(() => {
    api.adminCustomer(id).then(c => {
      setApiCustomer({
        clientId:      c.clientId,
        name:          `${c.firstName} ${c.lastName}`,
        phone:         c.phone || "",
        email:         c.email,
        joined:        c.createdAt
          ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        walletBalance: c.walletBalance || 0,
        status:        "active",
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

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  const daysInMonth    = getDaysInMonth(calYear, calMonth);
  const firstDayOffset = getFirstDayOffset(calYear, calMonth);
  const today          = now.getDate();
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();
  const dotMap         = {};
  MOCK_HISTORY.forEach(r => { dotMap[r.dayNum] = r.status; });

  const visibleHistory = showAll ? MOCK_HISTORY : MOCK_HISTORY.slice(0, 4);

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
          <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/billing`)}>
            <span className="material-symbols-outlined">receipt_long</span>
            View Billing
          </button>
          <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/orders`)}>
            <span className="material-symbols-outlined">shopping_basket</span>
            Orders
          </button>
          <button type="button" className="cd-btn-primary" onClick={() => navigate(`/admin/customers/${id}/transactions`)}>
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Transactions
          </button>
          <button type="button" className="cd-btn-primary">
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
          <p className="cd-info-label">Wallet Balance</p>
          <p className="cd-info-value cd-info-wallet">₹{customer.walletBalance}</p>
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
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Schedule tab ── */}
      {activeTab === "schedule" && (
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
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="cd-cal-weekday">{d}</div>
              ))}
              {Array.from({ length: firstDayOffset }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day     = i + 1;
                const isToday = isCurrentMonth && day === today;
                const dot     = isCurrentMonth ? dotMap[day] : undefined;
                return (
                  <div key={day} className={`cd-cal-day${isToday ? " cd-cal-today" : ""}`}>
                    <span className="cd-cal-num">{day}</span>
                    {dot && !isToday && (
                      <span className="cd-cal-dot" style={{ background: STATUS_DOT[dot] }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="cd-cal-legend">
              <div className="cd-legend-row">
                <span className="cd-legend-dot" style={{ background: "var(--admin-primary-container)" }} />
                <span>Delivered</span>
              </div>
              <div className="cd-legend-row">
                <span className="cd-legend-dot" style={{ background: "#7d562d" }} />
                <span>Paused</span>
              </div>
              <div className="cd-legend-row">
                <span className="cd-legend-dot" style={{ background: "var(--admin-error)" }} />
                <span>Cancelled</span>
              </div>
            </div>
          </div>

          {/* Delivery history table */}
          <div className="cd-card cd-history-card">
            <div className="cd-table-scroll">
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map((row, i) => (
                    <tr key={i}>
                      <td className="cd-td-bold">{row.date}</td>
                      <td>{row.product}</td>
                      <td className="cd-td-muted">{row.qty}</td>
                      <td className="cd-td-muted">{row.rate}</td>
                      <td className="cd-td-bold">{row.amount}</td>
                      <td>
                        <span className={`cd-badge ${BADGE_CLASS[row.status]}`}>
                          {STATUS_LABEL[row.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
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
      )}

      {/* ── Subscription tab ── */}
      {activeTab === "subscription" && (
        <div className="cd-sub-page">

          {/* Active plan card */}
          <div className="cd-card cd-sub-plan-card">
            <div className="cd-sub-plan-top">
              <div className="cd-sub-plan-icon">
                <span className="material-symbols-outlined">water_drop</span>
              </div>
              <div className="cd-sub-plan-info">
                <div className="cd-sub-plan-name-row">
                  <h3 className="cd-sub-plan-name">{MOCK_SUBSCRIPTION.plan}</h3>
                  <span className="cd-badge cd-badge-delivered cd-sub-status-badge">
                    <span className="cd-sub-status-dot" />
                    Active
                  </span>
                </div>
                <p className="cd-sub-plan-variant">{MOCK_SUBSCRIPTION.variant} &nbsp;·&nbsp; {MOCK_SUBSCRIPTION.frequency}</p>
              </div>
              <div className="cd-sub-plan-actions">
                <button type="button" className="cd-sub-btn-pause">
                  <span className="material-symbols-outlined">pause_circle</span>
                  Pause
                </button>
                <button type="button" className="cd-btn-primary">
                  <span className="material-symbols-outlined">edit</span>
                  Edit Plan
                </button>
              </div>
            </div>

            <div className="cd-sub-meta-grid">
              <div className="cd-sub-meta-item">
                <p className="cd-sub-meta-label">Started</p>
                <p className="cd-sub-meta-val">{MOCK_SUBSCRIPTION.startDate}</p>
              </div>
              <div className="cd-sub-meta-item">
                <p className="cd-sub-meta-label">Next Renewal</p>
                <p className="cd-sub-meta-val">{MOCK_SUBSCRIPTION.nextRenewal}</p>
              </div>
              <div className="cd-sub-meta-item">
                <p className="cd-sub-meta-label">Monthly Amount</p>
                <p className="cd-sub-meta-val cd-sub-meta-amount">{MOCK_SUBSCRIPTION.monthlyAmt}</p>
              </div>
              <div className="cd-sub-meta-item">
                <p className="cd-sub-meta-label">Frequency</p>
                <p className="cd-sub-meta-val">{MOCK_SUBSCRIPTION.frequency}</p>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="cd-card cd-sub-addons-card">
            <div className="cd-sub-section-header">
              <h4 className="cd-sub-section-title">Add-ons</h4>
              <button type="button" className="cd-sub-btn-add">
                <span className="material-symbols-outlined">add</span>
                Add product
              </button>
            </div>
            <div className="cd-sub-addons-list">
              {MOCK_SUBSCRIPTION.addOns.map((a, i) => (
                <div key={i} className="cd-sub-addon-row">
                  <div className="cd-sub-addon-icon">
                    <span className="material-symbols-outlined">grocery</span>
                  </div>
                  <div className="cd-sub-addon-info">
                    <p className="cd-sub-addon-name">{a.name}</p>
                    <p className="cd-sub-addon-freq">{a.freq}</p>
                  </div>
                  <span className="cd-sub-addon-price">{a.price}</span>
                  <button type="button" className="cd-sub-addon-remove">
                    <span className="material-symbols-outlined">remove_circle_outline</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Renewal timeline */}
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
                  <span className={`cd-badge ${r.paid ? "cd-badge-delivered" : "cd-badge-paused"}`}>
                    {r.paid ? "Paid" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Bills tab ── */}
      {activeTab === "bills" && (
        <div className="cd-card cd-tab-panel">
          <div className="cd-table-scroll">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BILLS.map(b => (
                  <tr key={b.id}>
                    <td className="cd-td-bold cd-td-muted">{b.id}</td>
                    <td>{b.period}</td>
                    <td className="cd-td-bold">{b.amount}</td>
                    <td>
                      <span className={`cd-badge ${b.paid ? "cd-badge-delivered" : "cd-badge-paused"}`}>
                        {b.paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="cd-action-link">
                        {b.paid ? "Download" : "Collect"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Orders tab ── */}
      {activeTab === "orders" && (
        <div className="cd-card cd-tab-panel">
          <div className="cd-table-scroll">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
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
              View All Orders
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Transactions tab ── */}
      {activeTab === "transactions" && (
        <div className="cd-card cd-tab-panel">
          <div className="cd-table-scroll">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TXNS.map(t => (
                  <tr key={t.id}>
                    <td className="cd-td-bold cd-td-muted">{t.id}</td>
                    <td>{t.desc}</td>
                    <td className="cd-td-muted">{t.date}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: t.credit ? "#2d6a4f" : "var(--admin-error)" }}>
                      {t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cd-history-footer">
            <button type="button" className="cd-view-all" onClick={() => navigate(`/admin/customers/${id}/transactions`)}>
              View Full Ledger
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button type="button" className="cd-view-all" onClick={() => navigate("/admin/refunds")}>
              <span className="material-symbols-outlined">assignment_return</span>
              Refund Requests
            </button>
          </div>
        </div>
      )}

      {/* ── Notes tab ── */}
      {activeTab === "notes" && (
        <div className="cd-notes-section">
          <div className="cd-card cd-note-compose">
            <textarea
              className="cd-note-input"
              placeholder="Add an internal note about this customer…"
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <div className="cd-note-compose-footer">
              <button
                type="button"
                className="cd-btn-primary"
                onClick={addNote}
                disabled={!noteText.trim()}
              >
                Add note
              </button>
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

      {/* ── Internal notes shown inline below schedule ── */}
      {activeTab === "schedule" && (
        <div className="cd-card cd-inline-notes">
          <div className="cd-inline-notes-decor" />
          <div className="cd-inline-notes-inner">
            <h4 className="cd-inline-notes-title">Internal Notes</h4>
            <div className="cd-notes-list">
              {notes.map((note, i) => (
                <div
                  key={i}
                  className="cd-note-card"
                  style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}
                >
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
      )}

    </div>
  );
}

export { AdminCustomerDetail };
