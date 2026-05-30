import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomerTransactions.css";

const MOCK_MAP = {
  GR00124: { clientId: "GR00124", name: "Priya Shah",    initials: "PS", tier: "Premium Member",  city: "Navrangpura, Ahmd",  walletBalance: 12450.50, totalCredits: "₹45,200", totalDebits: "₹32,749" },
  GR00089: { clientId: "GR00089", name: "Rahul Mehta",   initials: "RM", tier: "Standard Member", city: "Satellite, Ahmd",    walletBalance: 0,        totalCredits: "₹18,400", totalDebits: "₹18,400" },
  GR00201: { clientId: "GR00201", name: "Anjali Kapoor", initials: "AK", tier: "Premium Member",  city: "Vastrapur, Ahmd",    walletBalance: 350,      totalCredits: "₹28,700", totalDebits: "₹28,350" },
  GR00057: { clientId: "GR00057", name: "Meena Patel",   initials: "MP", tier: "Paused Member",   city: "Bopal, Ahmd",        walletBalance: 0,        totalCredits: "₹9,200",  totalDebits: "₹9,200"  },
  GR00312: { clientId: "GR00312", name: "Suresh Joshi",  initials: "SJ", tier: "Premium Member",  city: "Paldi, Ahmd",        walletBalance: 200,      totalCredits: "₹15,600", totalDebits: "₹15,400" },
  GR00098: { clientId: "GR00098", name: "Kavita Rao",    initials: "KR", tier: "Standard Member", city: "Maninagar, Ahmd",    walletBalance: 75,       totalCredits: "₹11,200", totalDebits: "₹11,125" },
  GR00143: { clientId: "GR00143", name: "Deepak Nair",   initials: "DN", tier: "New Member",      city: "Rajkot",             walletBalance: 0,        totalCredits: "₹2,100",  totalDebits: "₹2,100"  },
  GR00178: { clientId: "GR00178", name: "Sunita Verma",  initials: "SV", tier: "Premium Member",  city: "Ahmedabad",          walletBalance: 500,      totalCredits: "₹34,500", totalDebits: "₹34,000" },
  GR00234: { clientId: "GR00234", name: "Arjun Desai",   initials: "AD", tier: "New Member",      city: "Surat",              walletBalance: 0,        totalCredits: "₹3,200",  totalDebits: "₹3,200"  },
  GR00267: { clientId: "GR00267", name: "Pooja Sharma",  initials: "PS", tier: "Paused Member",   city: "Gandhinagar",        walletBalance: 0,        totalCredits: "₹7,800",  totalDebits: "₹7,800"  },
};

const ALL_TXNS = [
  { id: "#TXN-88219", date: "Oct 24, 2023", time: "10:45 AM", desc: "Wallet Recharge",           type: "recharge", credit: true,  amount: "₹5,000.00", method: "HDFC Bank •••• 4291",  methodIcon: "credit_card",          status: "completed" },
  { id: "#TXN-88104", date: "Oct 22, 2023", time: "07:12 AM", desc: "Order Payment #ORD-552",    type: "order",    credit: false, amount: "₹1,240.00", method: "Wallet Balance",          methodIcon: "account_balance_wallet", status: "completed" },
  { id: "#TXN-87992", date: "Oct 19, 2023", time: "03:50 PM", desc: "Refund for #ORD-519",       type: "refund",   credit: true,  amount: "₹450.00",   method: "Wallet Balance",          methodIcon: "account_balance_wallet", status: "completed" },
  { id: "#TXN-87901", date: "Oct 15, 2023", time: "08:00 AM", desc: "Monthly Subscription Bill", type: "order",    credit: false, amount: "₹3,200.00", method: "Wallet Balance",          methodIcon: "account_balance_wallet", status: "completed" },
  { id: "#TXN-87610", date: "Oct 10, 2023", time: "11:30 AM", desc: "Wallet Recharge",           type: "recharge", credit: true,  amount: "₹5,000.00", method: "Paytm •••• 8812",         methodIcon: "credit_card",          status: "completed" },
  { id: "#TXN-87440", date: "Oct 05, 2023", time: "09:15 AM", desc: "Order Payment #ORD-541",    type: "order",    credit: false, amount: "₹840.00",   method: "Wallet Balance",          methodIcon: "account_balance_wallet", status: "completed" },
  { id: "#TXN-87201", date: "Sep 28, 2023", time: "06:45 AM", desc: "Refund for #ORD-498",       type: "refund",   credit: true,  amount: "₹280.00",   method: "Wallet Balance",          methodIcon: "account_balance_wallet", status: "completed" },
  { id: "#TXN-87050", date: "Sep 22, 2023", time: "10:00 AM", desc: "Monthly Subscription Bill", type: "order",    credit: false, amount: "₹3,200.00", method: "Wallet Balance",          methodIcon: "account_balance_wallet", status: "completed" },
];

const TYPE_META = {
  recharge: { icon: "add_card",          bg: "var(--admin-primary-fixed)",      color: "#274e3d"  },
  order:    { icon: "shopping_basket",   bg: "var(--admin-secondary-container)", color: "#7a532a" },
  refund:   { icon: "assignment_return", bg: "#ffdcc4",                         color: "#6f3800"  },
};

const PAGE_SIZE = 4;

function AdminCustomerTransactions() {
  const { id } = useParams();
  const [apiCustomer, setApiCustomer] = useState(null);
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    api.adminCustomer(id).then(c => {
      setApiCustomer({
        clientId:      c.clientId,
        name:          `${c.firstName} ${c.lastName}`,
        initials:      `${c.firstName[0] || "?"}${c.lastName[0] || "?"}`.toUpperCase(),
        tier:          "Premium Member",
        city:          c.deliveryAddress?.city || "Ahmedabad",
        walletBalance: c.walletBalance || 0,
        totalCredits:  "₹45,200",
        totalDebits:   "₹32,749",
      });
    }).catch(() => {});
  }, [id]);

  const customer = apiCustomer || (id ? MOCK_MAP[id] : undefined);

  if (!customer) {
    return (
      <div className="ct-not-found">
        <span className="material-symbols-outlined ct-not-found-icon">person_off</span>
        <p className="ct-not-found-title">Customer not found</p>
        <Link to="/admin/customers" className="ct-back-link">← Back to Customers</Link>
      </div>
    );
  }

  const filtered = typeFilter === "all"
    ? ALL_TXNS
    : ALL_TXNS.filter(t => t.type === typeFilter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleTypeChange(e) {
    setTypeFilter(e.target.value);
    setPage(1);
  }

  return (
    <div className="ct-page">

      {/* ── Breadcrumb + header ── */}
      <div className="ct-header">
        <div>
          <div className="ct-breadcrumb">
            <Link to="/admin/customers" className="ct-crumb-link">Customers</Link>
            <span className="material-symbols-outlined ct-crumb-sep">chevron_right</span>
            <span className="ct-crumb-cur">{customer.name}</span>
          </div>
          <h2 className="ct-name">{customer.name}</h2>
          <div className="ct-badges">
            <span className="ct-tier-badge">{customer.tier}</span>
            <span className="ct-location">
              <span className="material-symbols-outlined">location_on</span>
              {customer.city}
            </span>
          </div>
        </div>
        <div className="ct-header-actions">
          <button type="button" className="ct-btn-outline">Download Statement</button>
          <button type="button" className="ct-btn-solid">
            <span className="material-symbols-outlined">add</span>
            Manual Credit/Debit
          </button>
        </div>
      </div>

      {/* ── Top grid ── */}
      <div className="ct-top-grid">

        {/* Wallet balance bento */}
        <div className="ct-wallet-card">
          <span className="material-symbols-outlined ct-wallet-bg-icon">account_balance_wallet</span>
          <div className="ct-wallet-inner">
            <div className="ct-wallet-top">
              <div>
                <p className="ct-wallet-label">Wallet Balance</p>
                <h3 className="ct-wallet-amount">
                  ₹{customer.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="ct-wallet-icon-box">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
            <div className="ct-wallet-stats">
              <div className="ct-wallet-stat">
                <p className="ct-wallet-stat-label">Total Credits</p>
                <p className="ct-wallet-stat-val ct-credits">{customer.totalCredits}</p>
              </div>
              <div className="ct-wallet-stat">
                <p className="ct-wallet-stat-label">Total Debits</p>
                <p className="ct-wallet-stat-val ct-debits">{customer.totalDebits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics cards */}
        <div className="ct-metrics-grid">
          <div className="ct-metric-card">
            <div className="ct-metric-top">
              <div className="ct-metric-icon-box" style={{ background: "var(--admin-secondary-container)", color: "#7a532a" }}>
                <span className="material-symbols-outlined">shopping_basket</span>
              </div>
              <span className="ct-metric-badge">Last 30 Days</span>
            </div>
            <div className="ct-metric-body">
              <p className="ct-metric-label">Subscription Revenue</p>
              <h4 className="ct-metric-amount">₹8,400.00</h4>
              <div className="ct-metric-trend">
                <span className="material-symbols-outlined">trending_up</span>
                12% increase from last month
              </div>
            </div>
          </div>

          <div className="ct-metric-card">
            <div className="ct-metric-top">
              <div className="ct-metric-icon-box" style={{ background: "#ffdcc4", color: "#6f3800" }}>
                <span className="material-symbols-outlined">refresh</span>
              </div>
              <span className="ct-metric-badge">Active</span>
            </div>
            <div className="ct-metric-body">
              <p className="ct-metric-label">Auto-Recharge</p>
              <h4 className="ct-metric-amount">₹5,000.00</h4>
              <p className="ct-metric-note">Triggered at ₹1,000 balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Transaction ledger ── */}
      <div className="ct-ledger">
        <div className="ct-ledger-header">
          <h3 className="ct-ledger-title">Transaction Ledger</h3>
          <div className="ct-ledger-filters">
            <div className="ct-select-wrap">
              <select className="ct-select" value={typeFilter} onChange={handleTypeChange}>
                <option value="all">All Types</option>
                <option value="recharge">Wallet Recharge</option>
                <option value="order">Order Payment</option>
                <option value="refund">Refund</option>
              </select>
              <span className="material-symbols-outlined ct-select-arrow">expand_more</span>
            </div>
            <div className="ct-select-wrap">
              <select className="ct-select">
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
                <option>Year 2023</option>
              </select>
              <span className="material-symbols-outlined ct-select-arrow">expand_more</span>
            </div>
          </div>
        </div>

        <div className="ct-table-scroll">
          <table className="ct-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(txn => {
                const meta = TYPE_META[txn.type];
                return (
                  <tr key={txn.id}>
                    <td className="ct-td-id">{txn.id}</td>
                    <td>
                      <span className="ct-td-date">{txn.date}</span>
                      <span className="ct-td-time">{txn.time}</span>
                    </td>
                    <td>
                      <div className="ct-desc-cell">
                        <span
                          className="ct-desc-icon"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          <span className="material-symbols-outlined">{meta.icon}</span>
                        </span>
                        <span className="ct-desc-text">{txn.desc}</span>
                      </div>
                    </td>
                    <td className={`ct-amount ${txn.credit ? "ct-amount-credit" : "ct-amount-debit"}`}>
                      {txn.credit ? "+ " : "- "}₹{txn.amount}
                    </td>
                    <td>
                      <div className="ct-method-cell">
                        <span className="material-symbols-outlined ct-method-icon">{txn.methodIcon}</span>
                        <span className="ct-method-text">{txn.method}</span>
                      </div>
                    </td>
                    <td>
                      <span className="ct-status-badge">
                        <span className="ct-status-dot" />
                        Completed
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ct-pagination">
          <p className="ct-pagination-info">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
          </p>
          <div className="ct-pagination-controls">
            <button
              type="button"
              className="ct-page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                className={`ct-page-btn${page === n ? " ct-page-btn-active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="ct-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AdminCustomerTransactions };
