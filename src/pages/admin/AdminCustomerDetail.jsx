import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAllCustomers } from "../../lib/customerStore";
import "./AdminCustomerDetail.css";
const MOCK_MAP = {
  GR00124: { clientId: "GR00124", name: "Priya Shah", initials: "PS", phone: "9876501001", email: "priya.shah@gmail.com", city: "Navrangpura, Ahmd", joined: "12 Jan 2026", walletBalance: 120, avatarBg: "var(--admin-primary-fixed)", status: "active" },
  GR00089: { clientId: "GR00089", name: "Rahul Mehta", initials: "RM", phone: "9876502002", email: "rahul.mehta@yahoo.com", city: "Satellite, Ahmd", joined: "05 Feb 2026", walletBalance: 0, avatarBg: "#ffdcbd", status: "active" },
  GR00201: { clientId: "GR00201", name: "Anjali Kapoor", initials: "AK", phone: "9876503003", email: "anjali.k@hotmail.com", city: "Vastrapur, Ahmd", joined: "20 Feb 2026", walletBalance: 350, avatarBg: "#ffdcc4", status: "active" },
  GR00057: { clientId: "GR00057", name: "Meena Patel", initials: "MP", phone: "9876504004", email: "meena.patel@gmail.com", city: "Bopal, Ahmd", joined: "08 Nov 2025", walletBalance: 0, avatarBg: "var(--admin-surface-container-high)", status: "paused" },
  GR00312: { clientId: "GR00312", name: "Suresh Joshi", initials: "SJ", phone: "9876505005", email: "suresh.j@gmail.com", city: "Paldi, Ahmd", joined: "15 Mar 2026", walletBalance: 200, avatarBg: "#c8e6c9", status: "active" },
  GR00098: { clientId: "GR00098", name: "Kavita Rao", initials: "KR", phone: "9876506006", email: "kavita.rao@rediffmail.com", city: "Maninagar, Ahmd", joined: "03 Dec 2025", walletBalance: 75, avatarBg: "#ffe0b2", status: "active" },
  GR00143: { clientId: "GR00143", name: "Deepak Nair", initials: "DN", phone: "9876507007", email: "deepak.nair@gmail.com", city: "Rajkot", joined: "28 Mar 2026", walletBalance: 0, avatarBg: "var(--admin-primary-fixed)", status: "new" },
  GR00178: { clientId: "GR00178", name: "Sunita Verma", initials: "SV", phone: "9876508008", email: "sunita.v@gmail.com", city: "Ahmedabad", joined: "14 Apr 2026", walletBalance: 500, avatarBg: "#ffdcbd", status: "active" },
  GR00234: { clientId: "GR00234", name: "Arjun Desai", initials: "AD", phone: "9876509009", email: "arjun.desai@outlook.com", city: "Surat", joined: "01 May 2026", walletBalance: 0, avatarBg: "#ffdcc4", status: "new" },
  GR00267: { clientId: "GR00267", name: "Pooja Sharma", initials: "PS", phone: "9876510010", email: "pooja.s@gmail.com", city: "Gandhinagar", joined: "10 May 2026", walletBalance: 0, avatarBg: "var(--admin-surface-container-high)", status: "paused" }
};
const STATUS_LABEL = {
  today: "Today delivery",
  delivered: "Delivered",
  extra: "Extra \u2014 paid",
  paused: "Paused",
  cancelled: "Cancelled"
};
const STATUS_CLASS = {
  today: "cd-badge-today",
  delivered: "cd-badge-delivered",
  extra: "cd-badge-extra",
  paused: "cd-badge-paused",
  cancelled: "cd-badge-cancelled"
};
const MOCK_HISTORY = [
  { date: "27 May", dayNum: 27, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "today" },
  { date: "26 May", dayNum: 26, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "25 May", dayNum: 25, product: "Organic Gir Cow Ghee", qty: "+250g", rate: "\u20B9650", amount: "\u20B9162", status: "extra" },
  { date: "24 May", dayNum: 24, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "23 May", dayNum: 23, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "22 May", dayNum: 22, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "21 May", dayNum: 21, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "20 May", dayNum: 20, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "19 May", dayNum: 19, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "18 May", dayNum: 18, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "17 May", dayNum: 17, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "16 May", dayNum: 16, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "15 May", dayNum: 15, product: "A2 Desi Cow Milk", qty: "2 L", rate: "\u20B970", amount: "\u20B9140", status: "delivered" },
  { date: "14 May", dayNum: 14, product: "A2 Desi Cow Milk", qty: "0", rate: "\u20B970", amount: "\u20B90", status: "paused" },
  { date: "13 May", dayNum: 13, product: "A2 Desi Cow Milk", qty: "0", rate: "\u20B970", amount: "\u20B90", status: "paused" }
];
const STATUS_DOT = {
  today: "var(--admin-primary-container)",
  delivered: "var(--admin-primary-container)",
  extra: "var(--admin-secondary)",
  paused: "#7d562d",
  cancelled: "var(--admin-error)"
};
const MOCK_NOTES = [
  { author: "Meera Desai", text: "Customer requested to move the delivery time to 6:30 AM instead of 7:30 AM starting from next week.", time: "2 hours ago" }
];
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function AdminCustomerDetail() {
  const { id } = useParams();
  const realCustomers = getAllCustomers();
  const realCustomer = realCustomers.find((c) => c.clientId === id);
  const mockCustomer = id ? MOCK_MAP[id] : void 0;
  const customer = realCustomer ? {
    clientId: realCustomer.clientId,
    name: `${realCustomer.firstName} ${realCustomer.lastName}`,
    initials: `${realCustomer.firstName[0]}${realCustomer.lastName[0]}`.toUpperCase(),
    phone: realCustomer.phone,
    email: realCustomer.email,
    city: realCustomer.deliveryAddress.city,
    joined: new Date(realCustomer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    walletBalance: 120,
    avatarBg: "var(--admin-primary-fixed)",
    status: "active"
  } : mockCustomer;
  const [activeTab, setActiveTab] = useState("schedule");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const now = /* @__PURE__ */ new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  function prevMonth() {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else setCalMonth((m) => m + 1);
  }
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayOffset = getFirstDayOfWeek(calYear, calMonth);
  const today = now.getDate();
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();
  const dotMap = {};
  MOCK_HISTORY.forEach((r) => {
    dotMap[r.dayNum] = r.status;
  });
  const visibleHistory = showAllHistory ? MOCK_HISTORY : MOCK_HISTORY.slice(0, 4);
  function addNote() {
    if (!noteText.trim()) return;
    setNotes((prev) => [{ author: "Admin", text: noteText, time: "Just now" }, ...prev]);
    setNoteText("");
  }
  if (!customer) {
    return <div className="cd-not-found">
        <span className="material-symbols-outlined cd-not-found-icon">person_off</span>
        <p className="cd-not-found-title">Customer not found</p>
        <Link to="/admin/customers" className="cd-back-link">← Back to Customers</Link>
      </div>;
  }
  const TABS = [
    { key: "schedule", label: "Schedule" },
    { key: "bills", label: "Bills" },
    { key: "orders", label: "Orders" },
    { key: "transactions", label: "Transactions" },
    { key: "notes", label: "Notes" }
  ];
  return <div className="cd-page">

      {
    /* ── Breadcrumb + actions ── */
  }
      <div className="cd-topbar">
        <nav className="cd-breadcrumb">
          <Link to="/admin/customers" className="cd-breadcrumb-link">Customers</Link>
          <span className="material-symbols-outlined cd-chevron">chevron_right</span>
          <h2 className="cd-breadcrumb-title">{customer.name} — {customer.clientId}</h2>
        </nav>
        <div className="cd-actions">
          <button type="button" className="cd-btn-whatsapp">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
            Send WhatsApp
          </button>
          <button type="button" className="cd-btn-deactivate">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>block</span>
            Deactivate
          </button>
        </div>
      </div>

      {
    /* ── Info cards ── */
  }
      <div className="cd-info-grid">
        <div className="bento-card cd-info-card">
          <p className="cd-info-label">Phone</p>
          <p className="cd-info-value">{customer.phone}</p>
        </div>
        <div className="bento-card cd-info-card">
          <p className="cd-info-label">Email</p>
          <p className="cd-info-value cd-info-email">{customer.email}</p>
        </div>
        <div className="bento-card cd-info-card">
          <p className="cd-info-label">Registered</p>
          <p className="cd-info-value">{customer.joined}</p>
        </div>
        <div className="bento-card cd-info-card">
          <p className="cd-info-label">Wallet balance</p>
          <p className="cd-info-value cd-info-wallet">₹{customer.walletBalance}</p>
        </div>
      </div>

      {
    /* ── Tabs ── */
  }
      <div className="cd-tabs-bar">
        {TABS.map((t) => <button
    key={t.key}
    type="button"
    className={`cd-tab ${activeTab === t.key ? "cd-tab-active" : ""}`}
    onClick={() => setActiveTab(t.key)}
  >
            {t.label}
          </button>)}
      </div>

      {
    /* ── Schedule tab ── */
  }
      {activeTab === "schedule" && <div className="cd-schedule-grid">

          {
    /* Calendar */
  }
          <div className="bento-card cd-calendar-card">
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
    const day = i + 1;
    const isToday = isCurrentMonth && day === today;
    const dot = isCurrentMonth ? dotMap[day] : void 0;
    return <div key={day} className={`cd-cal-day ${isToday ? "cd-cal-today" : ""}`}>
                    <span className="cd-cal-day-num">{day}</span>
                    {dot && !isToday && <span className="cd-cal-dot" style={{ background: STATUS_DOT[dot] }} />}
                  </div>;
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

          {
    /* Delivery history table */
  }
          <div className="bento-card cd-history-card">
            <div className="admin-table-wrap" style={{ borderRadius: 0, border: "none" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleHistory.map((row, i) => <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.date}</td>
                      <td className="adm-cell-muted">{row.product}</td>
                      <td className="adm-cell-muted">{row.qty}</td>
                      <td className="adm-cell-muted">{row.rate}</td>
                      <td style={{ fontWeight: 600 }}>{row.amount}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`cd-badge ${STATUS_CLASS[row.status]}`}>
                          {STATUS_LABEL[row.status]}
                        </span>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <div className="cd-history-footer">
              <button
    type="button"
    className="cd-view-all-btn"
    onClick={() => setShowAllHistory((v) => !v)}
  >
                {showAllHistory ? "Show less" : "View all history"}
              </button>
            </div>
          </div>
        </div>}

      {
    /* ── Bills tab ── */
  }
      {activeTab === "bills" && <div className="bento-card cd-tab-panel">
          <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
    { id: "B-0041", period: "May 2026", amount: "\u20B92,100", paid: true },
    { id: "B-0038", period: "Apr 2026", amount: "\u20B92,100", paid: true },
    { id: "B-0035", period: "Mar 2026", amount: "\u20B91,960", paid: false }
  ].map((b) => <tr key={b.id}>
                    <td className="adm-cell-muted" style={{ fontWeight: 600 }}>{b.id}</td>
                    <td>{b.period}</td>
                    <td style={{ fontWeight: 600 }}>{b.amount}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`admin-badge ${b.paid ? "admin-badge-active" : "admin-badge-pending"}`}>
                        {b.paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="adm-view-btn">{b.paid ? "Download" : "Collect"}</button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {
    /* ── Orders tab ── */
  }
      {activeTab === "orders" && <div className="bento-card cd-tab-panel">
          <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
    { id: "ORD-1041", product: "Gir Milk", qty: "2 L", amount: "\u20B9140", date: "27 May", status: "delivered" },
    { id: "ORD-1038", product: "Bilona Ghee", qty: "500g", amount: "\u20B9600", date: "25 May", status: "delivered" },
    { id: "ORD-1031", product: "Gir Milk", qty: "1 L", amount: "\u20B970", date: "20 May", status: "delivered" }
  ].map((o) => <tr key={o.id}>
                    <td className="adm-cell-muted" style={{ fontWeight: 600 }}>{o.id}</td>
                    <td>{o.product}</td>
                    <td className="adm-cell-muted">{o.qty}</td>
                    <td style={{ fontWeight: 600 }}>{o.amount}</td>
                    <td className="adm-cell-muted">{o.date}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="admin-badge admin-badge-active">Delivered</span>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {
    /* ── Transactions tab ── */
  }
      {activeTab === "transactions" && <div className="bento-card cd-tab-panel">
          <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
    { id: "TXN-8821", desc: "May subscription payment", date: "27 May", amount: "+\u20B92,100", credit: true },
    { id: "TXN-8811", desc: "Extra ghee order", date: "25 May", amount: "+\u20B9162", credit: true },
    { id: "TXN-8790", desc: "Wallet top-up", date: "20 May", amount: "+\u20B9500", credit: true },
    { id: "TXN-8780", desc: "Refund processed", date: "10 May", amount: "-\u20B9140", credit: false }
  ].map((t) => <tr key={t.id}>
                    <td className="adm-cell-muted" style={{ fontWeight: 600 }}>{t.id}</td>
                    <td>{t.desc}</td>
                    <td className="adm-cell-muted">{t.date}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: t.credit ? "#2d6a4f" : "var(--admin-error)" }}>
                      {t.amount}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>}

      {
    /* ── Notes tab ── */
  }
      {activeTab === "notes" && <div className="cd-notes-section">
          {
    /* Add note */
  }
          <div className="bento-card cd-note-compose">
            <textarea
    className="cd-note-input"
    placeholder="Add an internal note about this customer…"
    rows={3}
    value={noteText}
    onChange={(e) => setNoteText(e.target.value)}
  />
            <div className="cd-note-compose-footer">
              <button type="button" className="cd-btn-whatsapp" onClick={addNote} disabled={!noteText.trim()}>
                Add note
              </button>
            </div>
          </div>

          {
    /* Note list */
  }
          <div className="cd-notes-list">
            {notes.map((note, i) => <div key={i} className="bento-card cd-note-card">
                <div className="cd-note-avatar">{note.author[0]}</div>
                <div className="cd-note-body">
                  <div className="cd-note-bubble">{note.text}</div>
                  <div className="cd-note-meta">
                    <span className="cd-note-author">{note.author}</span>
                    <span className="cd-note-time">• {note.time}</span>
                  </div>
                </div>
              </div>)}
          </div>
        </div>}

      {
    /* ── Notes always shown below schedule ── */
  }
      {activeTab === "schedule" && <div className="bento-card cd-inline-notes">
          <div className="cd-inline-notes-bg" />
          <div className="cd-inline-notes-content">
            <h4 className="cd-inline-notes-title">Internal Notes</h4>
            {notes.map((note, i) => <div key={i} className="cd-note-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
                <div className="cd-note-avatar">{note.author[0]}</div>
                <div className="cd-note-body">
                  <div className="cd-note-bubble">{note.text}</div>
                  <div className="cd-note-meta">
                    <span className="cd-note-author">{note.author}</span>
                    <span className="cd-note-time">• {note.time}</span>
                  </div>
                </div>
              </div>)}
          </div>
        </div>}

    </div>;
}
export {
  AdminCustomerDetail
};
