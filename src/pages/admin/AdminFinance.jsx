import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminFinance.css";
const TRANSACTIONS = [
  { id: "t1", date: "May 27, 2026", customer: "Rajesh Kumar", initials: "RK", avatarBg: "#F5DFC8", avatarColor: "#7B5233", type: "subscription", amount: "\u20B94,500", isDebit: false, status: "completed" },
  { id: "t2", date: "May 26, 2026", customer: "Sanya Mehta", initials: "SM", avatarBg: "#ffdcbd", avatarColor: "#7a532a", type: "sale", amount: "\u20B91,250", isDebit: false, status: "pending" },
  { id: "t3", date: "May 25, 2026", customer: "Vikram Jain", initials: "VJ", avatarBg: "#ece7e6", avatarColor: "#414844", type: "refund", amount: "\u20B9890", isDebit: true, status: "completed" },
  { id: "t4", date: "May 25, 2026", customer: "Priya Shah", initials: "PS", avatarBg: "#F5DFC8", avatarColor: "#7B5233", type: "subscription", amount: "\u20B92,100", isDebit: false, status: "completed" },
  { id: "t5", date: "May 24, 2026", customer: "Anjali Kapoor", initials: "AK", avatarBg: "#ffdcc4", avatarColor: "#5f2f00", type: "sale", amount: "\u20B9600", isDebit: false, status: "completed" },
  { id: "t6", date: "May 23, 2026", customer: "Suresh Joshi", initials: "SJ", avatarBg: "#ffca98", avatarColor: "#7a532a", type: "refund", amount: "\u20B9140", isDebit: true, status: "completed" }
];
const TYPE_TAB_MAP = {
  all: ["subscription", "sale", "refund"],
  sales: ["subscription", "sale"],
  refunds: ["refund"]
};
const TYPE_LABEL = {
  subscription: "Subscription",
  sale: "Sale",
  refund: "Refund"
};
const CHART_BARS = [
  { label: "Jan", curr: 80, prev: 75 },
  { label: "Feb", curr: 65, prev: 50 },
  { label: "Mar", curr: 85, prev: 60 },
  { label: "Apr", curr: 95, prev: 70 },
  { label: "May", curr: 55, prev: 40 },
  { label: "Jun", curr: 75, prev: 80 }
];
const TOOLS = [
  { icon: "receipt_long",    label: "Billing Management",  sub: "View and send customer invoices",      path: "/admin/billing"   },
  { icon: "local_activity",  label: "Offers & Promotions", sub: "Create and manage discount offers",    path: "/admin/offers"    },
  { icon: "campaign",        label: "Marketing Campaigns", sub: "SMS, WhatsApp & push campaigns",       path: "/admin/campaigns" },
  { icon: "analytics",       label: "Reports & Analytics", sub: "Revenue insights and trends",          path: "/admin/analytics" },
  { icon: "group",           label: "Customers",           sub: "View all customer accounts",           path: "/admin/customers" },
  { icon: "assignment_return", label: "Refund Requests",   sub: "Review pending refund approvals",      path: "/admin/refunds"   },
];
function AdminFinance() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const visible = TRANSACTIONS.filter(
    (t) => TYPE_TAB_MAP[tab].includes(t.type)
  );
  return <div className="fin-page">

      {
    /* ── Page header ── */
  }
      <div className="fin-page-header">
        <div>
          <h2 className="fin-page-title">Finance Management</h2>
          <p className="fin-page-sub">Real-time revenue tracking and financial health overview.</p>
        </div>
        <div className="fin-header-actions">
          <button type="button" className="fin-btn-outline">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
            This Month
          </button>
          <button type="button" className="fin-btn-filled">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            Export Report
          </button>
        </div>
      </div>

      {
    /* ── Bento metrics ── */
  }
      <div className="fin-metrics-grid">

        <div className="bento-card fin-metric-card">
          <div className="fin-metric-top">
            <span className="material-symbols-outlined fin-metric-icon" style={{ background: "var(--admin-primary-fixed)", color: "var(--admin-primary)" }}>payments</span>
            <span className="fin-metric-badge fin-badge-green">+12.5%</span>
          </div>
          <p className="fin-metric-label">Total Revenue</p>
          <p className="fin-metric-value">₹4,28,500</p>
        </div>

        <div className="bento-card fin-metric-card">
          <div className="fin-metric-top">
            <span className="material-symbols-outlined fin-metric-icon" style={{ background: "#ffdcbd", color: "#7a532a" }}>pending_actions</span>
            <span className="fin-metric-badge fin-badge-muted">4 Items</span>
          </div>
          <p className="fin-metric-label">Pending Payouts</p>
          <p className="fin-metric-value">₹82,400</p>
        </div>

        <div className="bento-card fin-metric-card">
          <div className="fin-metric-top">
            <span className="material-symbols-outlined fin-metric-icon" style={{ background: "rgba(165,208,185,0.3)", color: "var(--admin-primary)" }}>trending_up</span>
            <span className="fin-metric-badge fin-badge-green">+8.2%</span>
          </div>
          <p className="fin-metric-label">Net Profit</p>
          <p className="fin-metric-value">₹1,95,000</p>
        </div>

        <div className="bento-card fin-metric-card">
          <div className="fin-metric-top">
            <span className="material-symbols-outlined fin-metric-icon" style={{ background: "#ffdcc4", color: "#6f3800" }}>account_balance</span>
            <span className="fin-metric-badge fin-badge-muted">GST 18%</span>
          </div>
          <p className="fin-metric-label">Tax Collected</p>
          <p className="fin-metric-value">₹77,130</p>
        </div>

      </div>

      {
    /* ── Body: 2-col + sidebar ── */
  }
      <div className="fin-body-grid">

        {
    /* ── LEFT: chart + table ── */
  }
        <div className="fin-left-col">

          {
    /* Revenue trend chart */
  }
          <div className="bento-card fin-chart-card">
            <div className="fin-chart-header">
              <h4 className="fin-section-title">Revenue Trends</h4>
              <div className="fin-chart-legend">
                <span className="fin-legend-item">
                  <span className="fin-legend-dot fin-dot-primary" />
                  This Year
                </span>
                <span className="fin-legend-item">
                  <span className="fin-legend-dot fin-dot-secondary" />
                  Last Year
                </span>
              </div>
            </div>
            <div className="fin-bars-area">
              {CHART_BARS.map((b) => <div key={b.label} className="fin-bar-group">
                  <div className="fin-bars-col">
                    <div className="fin-bar-prev" style={{ height: `${b.prev}%` }} />
                    <div className={`fin-bar-curr ${b.curr >= 90 ? "fin-bar-peak" : ""}`} style={{ height: `${b.curr}%` }} />
                  </div>
                  <span className="fin-bar-label">{b.label}</span>
                </div>)}
            </div>
          </div>

          {
    /* Transaction history */
  }
          <div className="bento-card fin-txn-card">
            <div className="fin-txn-header">
              <h4 className="fin-section-title">Transaction History</h4>
              <div className="fin-txn-controls">
                <div className="fin-tab-group">
                  {["all", "sales", "refunds"].map((t) => <button
    key={t}
    type="button"
    className={`fin-tab-btn ${tab === t ? "fin-tab-active" : ""}`}
    onClick={() => setTab(t)}
  >
                      {t === "all" ? "All" : t === "sales" ? "Sales" : "Refunds"}
                    </button>)}
                </div>
                <button type="button" className="fin-filter-btn">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
                </button>
              </div>
            </div>

            <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="admin-table fin-txn-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((tx) => <tr key={tx.id}>
                      <td className="adm-cell-muted fin-txn-date">{tx.date}</td>
                      <td>
                        <div className="adm-customer-cell">
                          <div className="adm-avatar" style={{ background: tx.avatarBg, color: tx.avatarColor, fontSize: "0.6875rem" }}>
                            {tx.initials}
                          </div>
                          <span className="adm-customer-name">{tx.customer}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`fin-cat-badge fin-cat-${tx.type}`}>
                          {TYPE_LABEL[tx.type]}
                        </span>
                      </td>
                      <td className={`fin-txn-amount ${tx.isDebit ? "fin-amount-debit" : ""}`}>
                        {tx.isDebit ? "-" : ""}{tx.amount}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`fin-status-badge fin-status-${tx.status}`}>
                          <span className="fin-status-dot" />
                          {tx.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className="fin-more-btn">
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_vert</span>
                        </button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            <div className="fin-txn-footer">
              <span>Showing 1–{visible.length} of 254 transactions</span>
              <div className="fin-txn-pag">
                <button type="button" className="fin-pag-btn" disabled>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
                </button>
                <button type="button" className="fin-pag-btn">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {
    /* ── RIGHT sidebar ── */
  }
        <div className="fin-right-col">

          {
    /* Payout overview card */
  }
          <div className="fin-payout-card">
            <div className="fin-payout-decor" />
            <div className="fin-payout-inner">
              <div className="fin-payout-top-row">
                <h4 className="fin-payout-heading">Payout Overview</h4>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>account_balance_wallet</span>
              </div>
              <p className="fin-payout-label">Next Scheduled Payout</p>
              <p className="fin-payout-amount">₹82,400</p>
              <div className="fin-payout-date-row">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>event</span>
                <span className="fin-payout-date">Jun 15, 2026</span>
                <span className="fin-payout-verified">Verified</span>
              </div>
              <div className="fin-payout-method-section">
                <p className="fin-payout-method-label">Payout Method</p>
                <div className="fin-payout-method-row">
                  <div className="fin-payout-method-left">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>credit_card</span>
                    <span className="fin-payout-bank">HDFC Bank .... 8920</span>
                  </div>
                  <button type="button" className="fin-payout-edit">Edit</button>
                </div>
              </div>
              <button type="button" className="fin-payout-cta">
                Request Early Payout
              </button>
            </div>
          </div>

          {
    /* Financial tools */
  }
          <div className="bento-card fin-tools-card">
            <h4 className="fin-section-title" style={{ marginBottom: "1rem" }}>Financial Tools</h4>
            <div className="fin-tools-list">
              {TOOLS.map((tool) => <button key={tool.icon} type="button" className="fin-tool-btn" onClick={() => tool.path && navigate(tool.path)}>
                  <div className="fin-tool-left">
                    <div className="fin-tool-icon">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{tool.icon}</span>
                    </div>
                    <div className="fin-tool-text">
                      <p className="fin-tool-label">{tool.label}</p>
                      <p className="fin-tool-sub">{tool.sub}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined fin-tool-chevron">chevron_right</span>
                </button>)}
            </div>
          </div>

          {
    /* Revenue health */
  }
          <div className="fin-health-card">
            <h5 className="fin-health-title">Revenue Health</h5>
            <div className="fin-health-row">
              <span className="fin-health-metric-label">Retention Rate</span>
              <span className="fin-health-metric-value">94%</span>
            </div>
            <div className="fin-health-bar-track">
              <div className="fin-health-bar-fill" style={{ width: "94%" }} />
            </div>
            <p className="fin-health-note">
              Subscription retention is up by{" "}
              <strong style={{ color: "var(--admin-secondary)" }}>4.2%</strong>{" "}
              this month. Great job in maintaining customer loyalty!
            </p>
          </div>

        </div>
      </div>
    </div>;
}
export {
  AdminFinance
};
