import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminCustomerTransactions.css";

/* ── Customer name lookup ── */
const MOCK_NAMES = {
  GR00124: "Priya Shah",    GR00089: "Rahul Mehta",
  GR00201: "Anjali Kapoor", GR00057: "Meena Patel",
  GR00312: "Suresh Joshi",  GR00098: "Kavita Rao",
  GR00143: "Deepak Nair",   GR00178: "Sunita Verma",
  GR00234: "Arjun Desai",   GR00267: "Pooja Sharma",
};

/* ── Mock transaction rows ── */
const ALL_TXNS = [
  { id: "TXN-99823", date: "02/06/2026", time: "11:45 AM", planType: "Wallet",       planNote: null,             methodIcon: "smartphone",      method: "Immediate Online (GPay)",          amount: "+ ₹500",   credit: true,  status: "success", action: "print"      },
  { id: "TXN-98412", date: "31/05/2026", time: "08:12 AM", planType: "Subscription", planNote: "May Summary",     methodIcon: "payments",        method: "Month Bill Cash (Driver)",         amount: "+ ₹2,310", credit: true,  status: "success", action: "print"      },
  { id: "TXN-97304", date: "28/05/2026", time: "09:30 AM", planType: "Individual",   planNote: "Ghee",            methodIcon: "smartphone",      method: "Immediate Online (PhonePe)",       amount: "+ ₹650",   credit: true,  status: "success", action: "print"      },
  { id: "TXN-REF44", date: "22/05/2026", time: "04:20 PM", planType: "Extra",        planNote: "Damaged Milk",    methodIcon: "account_balance", method: "Immediate Online (Bank Transfer)",  amount: "- ₹150",   credit: false, status: "success", action: "visibility" },
  { id: "TXN-95112", date: "15/05/2026", time: "07:15 PM", planType: "Individual",   planNote: "Paneer",          methodIcon: "smartphone",      method: "Immediate Online (Paytm)",         amount: "+ ₹130",   credit: true,  status: "failed",  action: "replay"     },
  { id: "TXN-93880", date: "10/05/2026", time: "02:00 PM", planType: "Subscription", planNote: "Apr Summary",     methodIcon: "payments",        method: "Month Bill Cash (Driver)",         amount: "+ ₹2,100", credit: true,  status: "success", action: "print"      },
  { id: "TXN-92441", date: "05/05/2026", time: "10:15 AM", planType: "Wallet",       planNote: null,             methodIcon: "smartphone",      method: "Immediate Online (GPay)",          amount: "+ ₹1,000", credit: true,  status: "success", action: "print"      },
  { id: "TXN-91104", date: "01/05/2026", time: "06:45 AM", planType: "Extra",        planNote: "Cow Butter",      methodIcon: "local_shipping",  method: "COD (Driver)",                     amount: "+ ₹150",   credit: true,  status: "success", action: "print"      },
  { id: "TXN-89740", date: "28/04/2026", time: "08:00 AM", planType: "Subscription", planNote: "Mar Summary",     methodIcon: "payments",        method: "Month Bill Cash (Driver)",         amount: "+ ₹2,100", credit: true,  status: "success", action: "print"      },
  { id: "TXN-88301", date: "20/04/2026", time: "03:30 PM", planType: "Individual",   planNote: "Paneer",          methodIcon: "smartphone",      method: "Immediate Online (Paytm)",         amount: "+ ₹260",   credit: true,  status: "success", action: "print"      },
];

/* ── KPI data ── */
const KPIS = [
  { label: "Total Transactions",       value: "128",     icon: "receipt_long",    iconBg: "ct-icon-primary",    valCls: ""           },
  { label: "Total COD Amount",         value: "₹12,450", icon: "payments",        iconBg: "ct-icon-secondary",  valCls: ""           },
  { label: "Total Paid Till Date",     value: "₹45,200", icon: "payments",        iconBg: "ct-icon-primary",    valCls: ""           },
  { label: "Total Online Transactions",value: "86",       icon: "smartphone",      iconBg: "ct-icon-primary",    valCls: ""           },
  { label: "Total Online Amount",      value: "₹32,750", icon: "credit_card",     iconBg: "ct-icon-primary",    valCls: ""           },
  { label: "Total COD",                value: "42",       icon: "local_shipping",  iconBg: "ct-icon-secondary",  valCls: ""           },
  { label: "Total Refunds",            value: "₹1,240",  icon: "keyboard_return", iconBg: "ct-icon-error",      valCls: "ct-kpi-error" },
];

const SUB_TABS = [
  { key: "schedule",      label: "Schedule"      },
  { key: "bills",         label: "Bills"         },
  { key: "orders",        label: "Orders"        },
  { key: "order-history", label: "Order History" },
  { key: "transactions",  label: "Transactions"  },
];

const PAGE_SIZE = 5;

/* ══ Component ══ */
function AdminCustomerTransactions() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [viewMode,   setViewMode]   = useState("month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rangeFilter,setRangeFilter]= useState("6m");
  const [page,       setPage]       = useState(1);

  const name = MOCK_NAMES[id] || id || "Customer";

  function handleTabClick(key) {
    if (key === "transactions") return;
    if (key === "schedule")      navigate(`/admin/customers/${id}`);
    if (key === "bills")         navigate(`/admin/customers/${id}/billing`);
    if (key === "orders")        navigate(`/admin/customers/${id}/orders`);
    if (key === "order-history") navigate(`/admin/customers/${id}/orders`);
  }

  const filtered = ALL_TXNS.filter(t => {
    if (typeFilter === "all") return true;
    if (typeFilter === "wallet")       return t.planType === "Wallet";
    if (typeFilter === "subscription") return t.planType === "Subscription";
    if (typeFilter === "order")        return t.planType === "Individual" || t.planType === "Extra";
    if (typeFilter === "refund")       return !t.credit;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeType(val) { setTypeFilter(val); setPage(1); }

  return (
    <div className="ct-page">

      {/* ── Breadcrumb + controls ── */}
      <div className="ct-topbar">
        <nav className="ct-breadcrumb">
          <Link to="/admin/customers" className="ct-crumb-link">Customers</Link>
          <span className="material-symbols-outlined ct-crumb-sep">chevron_right</span>
          <Link to={`/admin/customers/${id}`} className="ct-crumb-link">{name}</Link>
          <span className="material-symbols-outlined ct-crumb-sep">chevron_right</span>
          <span className="ct-crumb-current">Transactions</span>
        </nav>
        <div className="ct-topbar-right">
          <div className="ct-view-toggle">
            <button
              type="button"
              className={`ct-toggle-btn${viewMode === "today" ? " ct-toggle-active" : ""}`}
              onClick={() => setViewMode("today")}
            >Today</button>
            <button
              type="button"
              className={`ct-toggle-btn${viewMode === "month" ? " ct-toggle-active" : ""}`}
              onClick={() => setViewMode("month")}
            >This Month</button>
            <button type="button" className="ct-toggle-icon">
              <span className="material-symbols-outlined">calendar_today</span>
            </button>
          </div>
          <button type="button" className="ct-btn-solid">
            <span className="material-symbols-outlined">add</span>
            Manual Credit/Debit
          </button>
        </div>
      </div>

      {/* ── Sub-nav tabs ── */}
      <div className="ct-sub-tabs">
        {SUB_TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`ct-sub-tab${t.key === "transactions" ? " ct-sub-tab-active" : ""}`}
            onClick={() => handleTabClick(t.key)}
          >{t.label}</button>
        ))}
      </div>

      {/* ── 7 KPI cards ── */}
      <div className="ct-kpi-grid">
        {KPIS.map(k => (
          <div key={k.label} className="ct-kpi-card">
            <div>
              <p className="ct-kpi-label">{k.label}</p>
              <h4 className={`ct-kpi-value ${k.valCls}`}>{k.value}</h4>
            </div>
            <div className={`ct-kpi-icon-box ${k.iconBg}`}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Transaction Ledger ── */}
      <div className="ct-ledger">
        <div className="ct-ledger-header">
          <h3 className="ct-ledger-title">Transaction Ledger</h3>
          <div className="ct-ledger-filters">
            <div className="ct-select-wrap">
              <select className="ct-select" value={typeFilter} onChange={e => changeType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="wallet">Wallet Recharge</option>
                <option value="subscription">Subscription</option>
                <option value="order">Order Payment</option>
                <option value="refund">Refund</option>
              </select>
              <span className="material-symbols-outlined ct-select-arrow">expand_more</span>
            </div>
            <div className="ct-select-wrap">
              <select className="ct-select" value={rangeFilter} onChange={e => setRangeFilter(e.target.value)}>
                <option value="6m">Last 6 Months</option>
                <option value="30d">Last 30 Days</option>
                <option value="2023">Year 2023</option>
              </select>
              <span className="material-symbols-outlined ct-select-arrow">expand_more</span>
            </div>
          </div>
        </div>

        <div className="ct-table-scroll">
          <table className="ct-table">
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>TXN ID</th>
                <th>Plan Type</th>
                <th>Method / Mode</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="ct-th-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(txn => (
                <tr key={txn.id} className="ct-row">
                  <td>
                    <div className="ct-date">{txn.date}</div>
                    <div className="ct-time">{txn.time}</div>
                  </td>
                  <td className="ct-td-id">{txn.id}</td>
                  <td>
                    <div className="ct-plan-name">{txn.planType}</div>
                    {txn.planNote && <div className="ct-plan-note">({txn.planNote})</div>}
                  </td>
                  <td>
                    <div className="ct-method-cell">
                      <span className="material-symbols-outlined ct-method-icon">{txn.methodIcon}</span>
                      <span className="ct-method-text">{txn.method}</span>
                    </div>
                  </td>
                  <td className={`ct-amount ${txn.credit ? "ct-amount-credit" : "ct-amount-debit"}`}>
                    {txn.amount}
                  </td>
                  <td>
                    {txn.status === "success" ? (
                      <span className="ct-status ct-status-success">
                        <span className="ct-status-dot" />
                        Success
                      </span>
                    ) : (
                      <span className="ct-status ct-status-failed">
                        <span className="ct-status-dot ct-dot-error" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="ct-th-center">
                    <button type="button" className={`ct-action-btn ${txn.status === "failed" ? "ct-action-secondary" : ""}`}>
                      <span className="material-symbols-outlined">{txn.action}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ct-pagination">
          <p className="ct-page-info">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
          </p>
          <div className="ct-page-controls">
            <button className="ct-page-arrow" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                className={`ct-page-num${page === n ? " ct-page-num-active" : ""}`}
                onClick={() => setPage(n)}
              >{n}</button>
            ))}
            <button className="ct-page-arrow" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export { AdminCustomerTransactions };
