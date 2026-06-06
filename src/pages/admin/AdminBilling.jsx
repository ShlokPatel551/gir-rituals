import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBilling.css";
const SUBSCRIPTIONS = [
  { id: "s1", clientId: "GR00124", initials: "AV", avatarBg: "#ffca98", avatarColor: "#7a532a", name: "Ananya Varma", subId: "GR-SUB-4291", plan: "A2 Desi Milk (2L/day)", renewal: "Oct 24, 2023", amount: "\u20B95,400", status: "paid" },
  { id: "s2", clientId: "GR00089", initials: "RK", avatarBg: "#ffdcc4", avatarColor: "#6f3800", name: "Rahul Kapoor", subId: "GR-SUB-8812", plan: "Farm Fresh Paneer (Weekly)", renewal: "Oct 21, 2023", amount: "\u20B92,850", status: "overdue" },
  { id: "s3", clientId: "GR00201", initials: "SM", avatarBg: "#F5DFC8", avatarColor: "#2C1500", name: "Sanya Malhotra", subId: "GR-SUB-1054", plan: "Classic Gir Milk (1L/day)", renewal: "Oct 26, 2023", amount: "\u20B92,100", status: "pending" }
];
const ORDERS = [
  { id: "o1", orderId: "#ORD-9021", product: "A2 Vedic Ghee (500ml)", payMethod: "upi", payIcon: "payments", amount: "\u20B91,250", status: "success", time: "10:45 AM" },
  { id: "o2", orderId: "#ORD-9022", product: "Himalayan Honey (250g)", payMethod: "card", payIcon: "credit_card", amount: "\u20B9450", status: "failed", time: "09:12 AM" },
  { id: "o3", orderId: "#ORD-9018", product: "Bilona Ghee Combo", payMethod: "cash", payIcon: "currency_rupee", amount: "\u20B93,400", status: "processing", time: "Yesterday" }
];
const SUB_STATUS_CSS = {
  paid: "bil-badge-paid",
  overdue: "bil-badge-overdue",
  pending: "bil-badge-pending"
};
const SUB_STATUS_LABEL = {
  paid: "PAID",
  overdue: "OVERDUE",
  pending: "PENDING"
};
const ORD_STATUS_CSS = {
  success: "bil-badge-success",
  failed: "bil-badge-failed",
  processing: "bil-badge-processing"
};
const ORD_STATUS_LABEL = {
  success: "SUCCESS",
  failed: "FAILED",
  processing: "PROCESSING"
};
const PAY_LABEL = {
  upi: "UPI",
  card: "Card",
  cash: "Cash"
};
function AdminBilling() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  function showToast(msg) {
    setToastMsg(msg);
    setToastVisible(true);
  }
  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(t);
  }, [toastVisible]);
  return <div className="bil-page">

      {
    /* ── Page header ── */
  }
      <div>
        <h2 className="bil-page-title">Billing Overview</h2>
        <p className="bil-page-sub">Manage recurring dairy subscriptions and retail product orders.</p>
      </div>

      {
    /* ── Metrics grid ── */
  }
      <div className="bil-metrics-grid">

        <div className="bento-card bil-metric-card">
          <div className="bil-metric-top">
            <span className="bil-metric-label">Total Outstanding</span>
            <span className="material-symbols-outlined bil-icon-brown">account_balance_wallet</span>
          </div>
          <div className="bil-metric-value">₹42,850.00</div>
          <div className="bil-metric-note bil-note-error">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_upward</span>
            8% from last week
          </div>
        </div>

        <div className="bento-card bil-metric-card">
          <div className="bil-metric-top">
            <span className="bil-metric-label">Active Subscriptions</span>
            <span className="material-symbols-outlined bil-icon-green">autoplay</span>
          </div>
          <div className="bil-metric-value">1,284</div>
          <div className="bil-metric-note bil-note-green">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
            +12 new today
          </div>
        </div>

        <div className="bento-card bil-metric-card">
          <div className="bil-metric-top">
            <span className="bil-metric-label">Monthly Revenue</span>
            <span className="material-symbols-outlined bil-icon-secondary">calendar_month</span>
          </div>
          <div className="bil-metric-value">₹8.42L</div>
          <div className="bil-metric-note bil-note-green">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
            Target 92% achieved
          </div>
        </div>

        <div className="bento-card bil-metric-card">
          <div className="bil-metric-top">
            <span className="bil-metric-label">One-off Revenue</span>
            <span className="material-symbols-outlined bil-icon-amber">shopping_bag</span>
          </div>
          <div className="bil-metric-value">₹1.15L</div>
          <div className="bil-metric-note bil-note-green">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>stars</span>
            Ghee sales peaked
          </div>
        </div>

      </div>

      {
    /* ── Tabs card ── */
  }
      <div className="bento-card bil-tabs-card">

        <div className="bil-tab-bar">
          <button
    type="button"
    className={`bil-tab-btn ${activeTab === "subscriptions" ? "bil-tab-active" : ""}`}
    onClick={() => setActiveTab("subscriptions")}
  >
            Monthly Subscriptions
          </button>
          <button
    type="button"
    className={`bil-tab-btn ${activeTab === "orders" ? "bil-tab-active" : ""}`}
    onClick={() => setActiveTab("orders")}
  >
            Individual Orders
          </button>
        </div>

        {
    /* ── Subscriptions panel ── */
  }
        {activeTab === "subscriptions" && <div className="bil-tab-panel">
            <div className="bil-panel-toolbar">
              <div className="bil-toolbar-left">
                <div className="bil-search-wrap">
                  <span className="material-symbols-outlined bil-search-icon">person_search</span>
                  <input type="text" className="bil-search-input" placeholder="Search by Customer ID or Name..." />
                </div>
                <select className="bil-select">
                  <option>Renewal: All</option>
                  <option>Due Today</option>
                  <option>Due in 3 Days</option>
                  <option>Next Week</option>
                </select>
              </div>
              <div className="bil-toolbar-right">
                <button type="button" className="bil-btn-primary" onClick={() => showToast("Generating new bill\u2026")}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                  Generate New Bill
                </button>
                <button type="button" className="bil-btn-outline" onClick={() => showToast("Sending bulk invoices\u2026")}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mail</span>
                  Send Bulk Invoices
                </button>
              </div>
            </div>

            <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Renewal Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBSCRIPTIONS.map((row) => <tr key={row.id}>
                      <td>
                        <div
    className="adm-customer-cell bil-customer-link"
    onClick={() => navigate(`/admin/customers/${row.clientId}`)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && navigate(`/admin/customers/${row.clientId}`)}
  >
                          <div className="adm-avatar" style={{ background: row.avatarBg, color: row.avatarColor }}>
                            {row.initials}
                          </div>
                          <div>
                            <p className="adm-customer-name">{row.name}</p>
                            <p className="adm-cell-muted">{row.subId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="adm-cell-muted">{row.plan}</td>
                      <td className="adm-cell-muted">{row.renewal}</td>
                      <td><strong className="bil-amount">{row.amount}</strong></td>
                      <td>
                        <span className={`bil-badge ${SUB_STATUS_CSS[row.status]}`}>
                          {SUB_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td>
                        <div className="bil-row-actions">
                          <button
    type="button"
    className="bil-icon-btn"
    title="Generate Bill"
    onClick={() => showToast(`Bill generated for ${row.name}`)}
  >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>receipt_long</span>
                          </button>
                          <button
    type="button"
    className="bil-icon-btn"
    title="Send Invoice"
    onClick={() => showToast(`Invoice sent to ${row.name}`)}
  >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                          </button>
                          <button
    type="button"
    className="bil-icon-btn bil-icon-btn-warn"
    title="Pause Billing"
    onClick={() => showToast(`Billing paused for ${row.name}`)}
  >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>pause_circle</span>
                          </button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}

        {
    /* ── Orders panel ── */
  }
        {activeTab === "orders" && <div className="bil-tab-panel">
            <div className="bil-panel-toolbar">
              <div className="bil-toolbar-left">
                <div className="bil-search-wrap">
                  <span className="material-symbols-outlined bil-search-icon">search</span>
                  <input type="text" className="bil-search-input" placeholder="Search Order ID..." />
                </div>
                <select className="bil-select">
                  <option>Status: All</option>
                  <option>Success</option>
                  <option>Failed</option>
                  <option>Processing</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERS.map((row) => <tr key={row.id}>
                      <td><strong className="bil-amount">{row.orderId}</strong></td>
                      <td className="adm-cell-muted">{row.product}</td>
                      <td>
                        <div className="bil-pay-cell">
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--admin-on-surface-variant)" }}>
                            {row.payIcon}
                          </span>
                          <span className="adm-cell-muted">{PAY_LABEL[row.payMethod]}</span>
                        </div>
                      </td>
                      <td><strong className="bil-amount">{row.amount}</strong></td>
                      <td>
                        <span className={`bil-badge ${ORD_STATUS_CSS[row.status]}`}>
                          {ORD_STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="adm-cell-muted">{row.time}</td>
                      <td style={{ textAlign: "right" }}>
                        <div className="bil-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button
    type="button"
    className="bil-icon-btn"
    title="Generate Bill"
    onClick={() => showToast(`Bill generated for ${row.orderId}`)}
  >
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>receipt_long</span>
                          </button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}

      </div>

      {
    /* ── Insights bento grid ── */
  }
      <div className="bil-insights-grid">

        <div className="bil-insights-dark">
          <div className="bil-insights-decor" />
          <div className="bil-insights-body-wrap">
            <h3 className="bil-insights-title">Automated Renewal Insights</h3>
            <p className="bil-insights-desc">
              Our predictive engine estimates a 15% increase in subscription renewals for November
              due to the festive season. Ensure logistics are ready.
            </p>
            <div className="bil-insights-btns">
              <button
    type="button"
    className="bil-insights-btn-light"
    onClick={() => navigate("/admin/analytics")}
  >
                View Projection Report
              </button>
              <button
    type="button"
    className="bil-insights-btn-ghost"
    onClick={() => showToast("Dismissed.")}
  >
                Dismiss
              </button>
            </div>
          </div>
        </div>

        <div className="bento-card bil-refund-card">
          <div className="bil-refund-icon-wrap">
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--admin-primary)" }}>
              settings_backup_restore
            </span>
          </div>
          <h3 className="bil-refund-title">Refund Processing</h3>
          <p className="bil-refund-desc">
            There are 3 pending refund requests from last night's logistics delay.
          </p>
          <button
    type="button"
    className="bil-refund-btn"
    onClick={() => navigate("/admin/refunds")}
  >
            Review Requests
          </button>
        </div>

      </div>

      {
    /* ── FAB ── */
  }
      <button
    type="button"
    className="bil-fab"
    onClick={() => showToast("Generate new bill\u2026")}
    aria-label="Generate bill"
  >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add</span>
      </button>

      {
    /* ── Toast ── */
  }
      <div className={`bil-toast ${toastVisible ? "bil-toast-visible" : ""}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--admin-primary-fixed)" }}>
          check_circle
        </span>
        <p className="bil-toast-msg">{toastMsg}</p>
        <button type="button" className="bil-toast-close" onClick={() => setToastVisible(false)}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>

    </div>;
}
export {
  AdminBilling
};
