import { useState } from "react";
import { Link } from "react-router-dom";
import "./AdminRefunds.css";
const INITIAL_REQUESTS = [
  {
    id: "r1",
    name: "Priya Shah",
    initials: "PS",
    email: "priya.s@email.com",
    orderId: "ORD-089",
    reason: "Delivery not received",
    reasonSub: "Scheduled for May 12",
    amount: "\u20B9140",
    avatarBg: "var(--admin-primary-fixed)"
  },
  {
    id: "r2",
    name: "Rahul M.",
    initials: "RM",
    email: "rahul_45@provider.in",
    orderId: "ORD-045",
    reason: "Wrong quantity",
    reasonSub: "Received 2kg instead of 5kg",
    amount: "\u20B970",
    avatarBg: "#ffdcc4"
  },
  {
    id: "r3",
    name: "Meena Patel",
    initials: "MP",
    email: "meena.p@gmail.com",
    orderId: "ORD-031",
    reason: "Quality issue",
    reasonSub: "Milk soured before expiry",
    amount: "\u20B9210",
    avatarBg: "var(--admin-surface-container-high)"
  }
];
const BAR_DATA = [
  { h: 40, tip: "\u20B9450" },
  { h: 65, tip: null },
  { h: 30, tip: null },
  { h: 85, tip: "\u20B9920", highlight: true },
  { h: 55, tip: null },
  { h: 45, tip: null },
  { h: 25, tip: null },
  { h: 60, tip: null },
  { h: 75, tip: null },
  { h: 50, tip: null },
  { h: 95, tip: "\u20B91,140", highlight: true },
  { h: 40, tip: null }
];
function AdminRefunds() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [approvedCount, setApproved] = useState(7);
  const [totalRefunded, setTotal] = useState(1240);
  const [removingIds, setRemoving] = useState(/* @__PURE__ */ new Set());
  function dismiss(id, approve) {
    setRemoving((prev) => /* @__PURE__ */ new Set([...prev, id]));
    setTimeout(() => {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setRemoving((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      if (approve) {
        setApproved((c) => c + 1);
        const req = requests.find((r) => r.id === id);
        if (req) setTotal((t) => t + parseInt(req.amount.replace(/[₹,]/g, ""), 10));
      }
    }, 420);
  }
  const pendingCount = requests.length;
  return <div className="rf-page">

      {
    /* ── Breadcrumb + title ── */
  }
      <div className="rf-header">
        <div className="rf-breadcrumb">
          <Link to="/admin/finance" className="rf-breadcrumb-link">Finance</Link>
          <span className="material-symbols-outlined rf-chevron">chevron_right</span>
          <span className="rf-breadcrumb-current">Refund Requests</span>
        </div>
        <h2 className="rf-page-title">Refund Requests</h2>
      </div>

      {
    /* ── Metric cards ── */
  }
      <div className="rf-metrics-grid">
        {
    /* Pending */
  }
        <div className="bento-card rf-metric-card">
          <div className="rf-metric-glow rf-glow-primary" />
          <span className="material-symbols-outlined rf-metric-ghost">pending_actions</span>
          <p className="rf-metric-label">Pending requests</p>
          <div className="rf-metric-row">
            <span className="rf-metric-value">{pendingCount}</span>
            <span className="rf-pill rf-pill-error">+2 from yesterday</span>
          </div>
        </div>
        {
    /* Approved */
  }
        <div className="bento-card rf-metric-card">
          <div className="rf-metric-glow rf-glow-secondary" />
          <span className="material-symbols-outlined rf-metric-ghost">check_circle</span>
          <p className="rf-metric-label">Approved this month</p>
          <div className="rf-metric-row">
            <span className="rf-metric-value">{approvedCount}</span>
            <span className="rf-pill rf-pill-tan">Target: 10</span>
          </div>
        </div>
        {
    /* Total refunded */
  }
        <div className="bento-card rf-metric-card">
          <div className="rf-metric-glow rf-glow-tertiary" />
          <span className="material-symbols-outlined rf-metric-ghost">account_balance_wallet</span>
          <p className="rf-metric-label">Total refunded</p>
          <div className="rf-metric-row">
            <span className="rf-metric-value">₹{totalRefunded.toLocaleString("en-IN")}</span>
            <span className="rf-pill rf-pill-muted">FY 2024-25</span>
          </div>
        </div>
      </div>

      {
    /* ── Queue management table ── */
  }
      <div className="bento-card rf-table-card">
        <div className="rf-table-header">
          <div className="rf-table-header-left">
            <h4 className="rf-section-title">Queue Management</h4>
            <span className="rf-active-badge">{pendingCount} Active</span>
          </div>
          <div className="rf-table-actions">
            <button type="button" className="rf-tool-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
              Filter
            </button>
            <button type="button" className="rf-tool-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
              Export
            </button>
          </div>
        </div>

        {requests.length === 0 ? <div className="rf-empty">
            <span className="material-symbols-outlined rf-empty-icon">task_alt</span>
            <p className="rf-empty-title">All caught up!</p>
            <p className="rf-empty-sub">No pending refund requests at the moment.</p>
          </div> : <>
            <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="admin-table rf-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Order</th>
                    <th>Reason</th>
                    <th>Amount</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => <tr
    key={r.id}
    className={removingIds.has(r.id) ? "rf-row-removing" : ""}
  >
                      <td>
                        <div className="adm-customer-cell">
                          <div className="adm-avatar" style={{ background: r.avatarBg }}>{r.initials}</div>
                          <div>
                            <p className="adm-customer-name">{r.name}</p>
                            <p className="rf-email">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="rf-order-id">{r.orderId}</span>
                      </td>
                      <td>
                        <p className="rf-reason-main">{r.reason}</p>
                        <p className="rf-reason-sub">{r.reasonSub}</p>
                      </td>
                      <td>
                        <span className="rf-amount">{r.amount}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="rf-status-pending">
                          <span className="rf-pulse-dot" />
                          Pending
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="rf-row-actions">
                          <button
    type="button"
    className="rf-btn-approve"
    onClick={() => dismiss(r.id, true)}
  >
                            Approve
                          </button>
                          <button
    type="button"
    className="rf-btn-reject"
    onClick={() => dismiss(r.id, false)}
  >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <div className="rf-table-footer">
              <span>Showing {requests.length} of {requests.length} requests</span>
            </div>
          </>}
      </div>

      {
    /* ── Analytics ── */
  }
      <div className="rf-analytics-grid">

        {
    /* Bar chart */
  }
        <div className="bento-card rf-chart-card">
          <div className="rf-chart-header">
            <div>
              <h4 className="rf-section-title">Refund Trends</h4>
              <p className="rf-chart-sub">Daily refund volume vs. average</p>
            </div>
            <select className="rf-chart-select">
              <option>Last 30 days</option>
              <option>Last quarter</option>
            </select>
          </div>
          <div className="rf-bar-chart">
            {BAR_DATA.map((b, i) => <div key={i} className={`rf-bar-wrap ${b.highlight ? "rf-bar-highlight" : ""}`}>
                {b.tip && <span className="rf-bar-tip">{b.tip}</span>}
                <div className="rf-bar" style={{ height: `${b.h}%` }} />
              </div>)}
          </div>
        </div>

        {
    /* Ops pulse */
  }
        <div className="rf-pulse-card">
          <div className="rf-pulse-dots" />
          <div>
            <h4 className="rf-pulse-title">Operations Pulse</h4>
            <p className="rf-pulse-sub">
              Average turnaround for refund approvals is currently 4.2 hours.
            </p>
          </div>
          <div className="rf-pulse-metric">
            <div className="rf-pulse-metric-row">
              <span className="rf-pulse-metric-label">Approval Efficiency</span>
              <span className="rf-pulse-metric-value">94%</span>
            </div>
            <div className="rf-progress-track">
              <div className="rf-progress-fill" style={{ width: "94%" }} />
            </div>
          </div>
          <div className="rf-pulse-footer">
            <button type="button" className="rf-pulse-btn">View Team Performance</button>
          </div>
        </div>

      </div>
    </div>;
}
export {
  AdminRefunds
};
