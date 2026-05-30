import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomerBilling.css";

const MOCK_MAP = {
  GR00124: { clientId: "GR00124", name: "Priya Shah",    initials: "PS", joined: "Jan 2025", tier: "Premium Subscriber",   walletBalance: 120,  upi: "priya@upi"    },
  GR00089: { clientId: "GR00089", name: "Rahul Mehta",   initials: "RM", joined: "Feb 2026", tier: "Standard Subscriber",  walletBalance: 0,    upi: "rahul@upi"    },
  GR00201: { clientId: "GR00201", name: "Anjali Kapoor", initials: "AK", joined: "Feb 2026", tier: "Premium Subscriber",   walletBalance: 350,  upi: "anjali@upi"   },
  GR00057: { clientId: "GR00057", name: "Meena Patel",   initials: "MP", joined: "Nov 2025", tier: "Paused Subscriber",    walletBalance: 0,    upi: "meena@upi"    },
  GR00312: { clientId: "GR00312", name: "Suresh Joshi",  initials: "SJ", joined: "Mar 2026", tier: "Premium Subscriber",   walletBalance: 200,  upi: "suresh@upi"   },
  GR00098: { clientId: "GR00098", name: "Kavita Rao",    initials: "KR", joined: "Dec 2025", tier: "Standard Subscriber",  walletBalance: 75,   upi: "kavita@upi"   },
  GR00143: { clientId: "GR00143", name: "Deepak Nair",   initials: "DN", joined: "Mar 2026", tier: "New Subscriber",       walletBalance: 0,    upi: "deepak@upi"   },
  GR00178: { clientId: "GR00178", name: "Sunita Verma",  initials: "SV", joined: "Apr 2026", tier: "Premium Subscriber",   walletBalance: 500,  upi: "sunita@upi"   },
  GR00234: { clientId: "GR00234", name: "Arjun Desai",   initials: "AD", joined: "May 2026", tier: "New Subscriber",       walletBalance: 0,    upi: "arjun@upi"    },
  GR00267: { clientId: "GR00267", name: "Pooja Sharma",  initials: "PS", joined: "May 2026", tier: "Paused Subscriber",    walletBalance: 0,    upi: "pooja@upi"    },
};

const MOCK_BILLS = [
  { id: "#GIR-9982", date: "28 Oct 2024", period: "Oct 01 – Oct 28", amount: "₹3,420.00", status: "pending"  },
  { id: "#GIR-9214", date: "15 Oct 2024", period: "Sep 15 – Oct 14", amount: "₹830.00",   status: "overdue"  },
  { id: "#GIR-8851", date: "01 Oct 2024", period: "Sep 01 – Sep 30", amount: "₹1,840.00", status: "paid"     },
  { id: "#GIR-8120", date: "01 Sep 2024", period: "Aug 01 – Aug 31", amount: "₹2,100.00", status: "paid"     },
  { id: "#GIR-7544", date: "01 Aug 2024", period: "Jul 01 – Jul 31", amount: "₹1,950.00", status: "paid"     },
  { id: "#GIR-6901", date: "01 Jul 2024", period: "Jun 01 – Jun 30", amount: "₹1,780.00", status: "paid"     },
  { id: "#GIR-6210", date: "01 Jun 2024", period: "May 01 – May 31", amount: "₹1,680.00", status: "paid"     },
];

const CHART_DATA = [
  { month: "May", pct: 60  },
  { month: "Jun", pct: 80  },
  { month: "Jul", pct: 45  },
  { month: "Aug", pct: 90  },
  { month: "Sep", pct: 100, active: true },
  { month: "Oct", pct: 70  },
];

const BADGE = {
  paid:    { cls: "cb-badge-paid",    label: "Paid"    },
  pending: { cls: "cb-badge-pending", label: "Pending" },
  overdue: { cls: "cb-badge-overdue", label: "Overdue" },
};

const TABS = [
  { key: "general",       label: "General Info"   },
  { key: "subscriptions", label: "Subscriptions"  },
  { key: "orders",        label: "Order History"  },
  { key: "bills",         label: "Bills"          },
  { key: "preferences",   label: "Preferences"    },
];

function AdminCustomerBilling() {
  const { id } = useParams();
  const [apiCustomer, setApiCustomer] = useState(null);
  const [activeTab,   setActiveTab]   = useState("bills");
  const [showAll,     setShowAll]     = useState(false);

  useEffect(() => {
    api.adminCustomer(id).then(c => {
      setApiCustomer({
        clientId:      c.clientId,
        name:          `${c.firstName} ${c.lastName}`,
        initials:      `${c.firstName[0] || "?"}${c.lastName[0] || "?"}`.toUpperCase(),
        joined:        c.createdAt
          ? new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
          : "—",
        tier:          "Premium Subscriber",
        walletBalance: c.walletBalance || 0,
        upi:           `${c.firstName?.toLowerCase()}@upi`,
      });
    }).catch(() => {});
  }, [id]);

  const customer = apiCustomer || (id ? MOCK_MAP[id] : undefined);

  if (!customer) {
    return (
      <div className="cb-not-found">
        <span className="material-symbols-outlined cb-not-found-icon">person_off</span>
        <p className="cb-not-found-title">Customer not found</p>
        <Link to="/admin/customers" className="cb-back-link">← Back to Customers</Link>
      </div>
    );
  }

  const visibleBills = showAll ? MOCK_BILLS : MOCK_BILLS.slice(0, 5);

  return (
    <div className="cb-page">

      {/* ── Profile header ── */}
      <div className="cb-profile-header">
        <div className="cb-profile-row">
          <div className="cb-avatar">{customer.initials}</div>
          <div className="cb-profile-info">
            <h2 className="cb-profile-name">{customer.name}</h2>
            <p className="cb-profile-sub">{customer.tier} • Member since {customer.joined}</p>
          </div>
          <div className="cb-profile-actions">
            <Link to={`/admin/customers/${id}`} className="cb-btn-outline">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Detail
            </Link>
            <button type="button" className="cb-btn-solid">Actions</button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="cb-tabs-bar">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              className={`cb-tab${activeTab === t.key ? " cb-tab-active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Non-bills tabs placeholder ── */}
      {activeTab !== "bills" && (
        <div className="cb-placeholder">
          <span className="material-symbols-outlined cb-placeholder-icon">construction</span>
          <p className="cb-placeholder-text">{TABS.find(t => t.key === activeTab)?.label} coming soon</p>
        </div>
      )}

      {/* ── Bills tab ── */}
      {activeTab === "bills" && (
        <>
          {/* Summary cards */}
          <div className="cb-summary-grid">
            <div className="cb-summary-card cb-summary-dark">
              <span className="material-symbols-outlined cb-summary-bg-icon">payments</span>
              <p className="cb-summary-label">Total Outstanding</p>
              <h3 className="cb-summary-amount">₹4,250.00</h3>
              <p className="cb-summary-note">Next auto-debit on 05 Nov 2024</p>
            </div>

            <div className="cb-summary-card cb-summary-light">
              <p className="cb-summary-label">Last Payment</p>
              <h4 className="cb-summary-sub-amount">₹1,840.00</h4>
              <div className="cb-summary-verified">
                <span className="material-symbols-outlined">verified</span>
                Paid on 02 Oct 2024
              </div>
            </div>

            <div className="cb-summary-card cb-summary-light">
              <p className="cb-summary-label">Billing Method</p>
              <h4 className="cb-summary-sub-amount">UPI / Auto-pay</h4>
              <div className="cb-summary-method">
                <span className="material-symbols-outlined">credit_card</span>
                Linked: {customer.upi}
              </div>
            </div>
          </div>

          {/* Billing history table */}
          <div className="cb-table-card">
            <div className="cb-table-header">
              <h4 className="cb-table-title">Billing History</h4>
              <div className="cb-table-actions">
                <button type="button" className="cb-filter-btn">
                  <span className="material-symbols-outlined">filter_list</span>
                  Filter
                </button>
                <button type="button" className="cb-filter-btn">
                  <span className="material-symbols-outlined">calendar_today</span>
                  Date Range
                </button>
              </div>
            </div>

            <div className="cb-table-scroll">
              <table className="cb-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Date</th>
                    <th>Billing Period</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBills.map(bill => (
                    <tr key={bill.id}>
                      <td className="cb-td-id">{bill.id}</td>
                      <td>{bill.date}</td>
                      <td className="cb-td-muted">{bill.period}</td>
                      <td className="cb-td-bold">{bill.amount}</td>
                      <td>
                        <span className={`cb-badge ${BADGE[bill.status].cls}`}>
                          {BADGE[bill.status].label}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className="cb-download-btn">
                          <span className="material-symbols-outlined">download</span>
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cb-table-footer">
              <button type="button" className="cb-view-more" onClick={() => setShowAll(v => !v)}>
                {showAll ? "Show less" : "View More Billing History"}
                <span className="material-symbols-outlined">{showAll ? "expand_less" : "expand_more"}</span>
              </button>
            </div>
          </div>

          {/* Bento bottom */}
          <div className="cb-bento-grid">
            {/* Spending trend */}
            <div className="cb-bento-card">
              <div className="cb-bento-card-header">
                <h5 className="cb-bento-title">6-Month Spending Trend</h5>
                <span className="material-symbols-outlined cb-bento-icon">trending_up</span>
              </div>
              <div className="cb-chart">
                {CHART_DATA.map(bar => (
                  <div key={bar.month} className="cb-chart-col">
                    <div
                      className={`cb-bar${bar.active ? " cb-bar-active" : ""}`}
                      style={{ height: `${bar.pct}%` }}
                    />
                    <span className="cb-chart-label">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty savings */}
            <div className="cb-loyalty-card">
              <span className="material-symbols-outlined cb-loyalty-icon">loyalty</span>
              <h5 className="cb-loyalty-title">Loyalty Savings</h5>
              <p className="cb-loyalty-text">
                {customer.name.split(" ")[0]} has saved ₹2,150 this year through the premium A2 milk subscription plan.
              </p>
              <button type="button" className="cb-loyalty-btn">Review Plan Details</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { AdminCustomerBilling };
