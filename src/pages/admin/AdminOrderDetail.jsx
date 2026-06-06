import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminOrderDetail.css";

const MOCK_ORDER = {
  id: "ORD-92831",
  product: "A2 Gir Cow Milk",
  type: "Subscription — Daily",
  typeIcon: "autorenew",
  qty: "2 Litres / day",
  subRate: "₹68 / litre",
  subRateDetail: "₹136 per delivery",
  frequency: "Daily — every day",
  startDate: "1 October 2023",
  address: "Navrangpura, Ahmedabad — 380009",
  paymentMethod: "Monthly bill",
  monthlyAmount: "₹4,080 / month",
  monthlyCalc: "₹68 × 2L × 30 days",
  statusToday: "Delivered",
  kpis: [
    { label: "Monthly Amount",  value: "₹4,080",     sub: "₹68/L × 2L × 30 days",  tertiary: false },
    { label: "Total Deliveries", value: "872",        sub: "since 1 Oct 2023",       tertiary: false },
    { label: "Active Since",    value: "Oct 2023",    sub: "2 years 8 months",       tertiary: false },
    { label: "Total Billed",    value: "₹1,32,600",  sub: "lifetime total",          tertiary: false },
    { label: "Outstanding",     value: "₹0",         sub: "all paid up",             tertiary: true  },
  ],
};

const MOCK_CUSTOMER = {
  initials: "AS",
  name: "Aditi Sharma",
  id: "CLT-0041",
  email: "aditi.s@gmail.com",
  phone: "9876500041",
  memberSince: "15 Aug 2023",
  totalOrders: "3 active subscriptions + 12 individual",
  wallet: "₹0",
  outstanding: "₹0 — all paid",
};

const TABS = ["Order details", "View profile", "Order history"];

function AdminOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  const order = MOCK_ORDER;
  const customer = MOCK_CUSTOMER;

  const detailRows = [
    { key: "Order ID",              type: "text",  val: `#${order.id}` },
    { key: "Order type",            type: "chip",  chip: { icon: order.typeIcon, text: order.type,         color: "primary" } },
    { key: "Product",               type: "text",  val: order.product },
    { key: "Quantity per delivery", type: "text",  val: order.qty },
    { key: "Subscription rate",     type: "sub",   val: order.subRate, sub: order.subRateDetail },
    { key: "Frequency",             type: "text",  val: order.frequency },
    { key: "Start date",            type: "text",  val: order.startDate },
    { key: "Delivery address",      type: "text",  val: order.address },
    { key: "Payment method",        type: "chip",  chip: { text: order.paymentMethod,                      color: "secondary" } },
    { key: "Monthly amount",        type: "sub",   val: order.monthlyAmount, sub: order.monthlyCalc, primary: true },
    { key: "Status today",          type: "chip",  chip: { icon: "check", text: order.statusToday,          color: "delivered" }, highlight: true },
  ];

  return (
    <div className="od-page">

      {/* ── Breadcrumb ── */}
      <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#9aa3a0", marginBottom: 4 }}>
        <Link to="/admin/orders" style={{ color: "#414844", fontWeight: 600, textDecoration: "none" }}>Orders</Link>
        <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>chevron_right</span>
        <span>#{order.id}</span>
      </nav>

      {/* ── Page header ── */}
      <div className="od-page-header">
        <h2 className="od-page-title">Order #{order.id} — {order.product}</h2>
        <div className="od-header-actions">
          <button type="button" className="od-action-btn">
            <span className="material-symbols-outlined">chat</span>
            Send WhatsApp
          </button>
          <button type="button" className="od-action-btn od-action-danger">
            <span className="material-symbols-outlined">cancel</span>
            Cancel order
          </button>
          <button type="button" className="od-action-btn od-action-primary" onClick={() => navigate(`/admin/orders/${order.id}/edit`)}>
            <span className="material-symbols-outlined">edit</span>
            Edit order
          </button>
        </div>
      </div>

      {/* ── KPI bento grid ── */}
      <div className="od-kpi-grid">
        {order.kpis.map((k, i) => (
          <div key={i} className="od-kpi-card">
            <p className="od-kpi-label">{k.label}</p>
            <p className={`od-kpi-value${k.tertiary ? " od-kpi-tertiary" : ""}`}>{k.value}</p>
            <p className="od-kpi-sub">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="od-tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`od-tab${activeTab === i ? " od-tab-active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Order details ── */}
      {activeTab === 0 && (
        <div className="od-content-grid">

          <div className="od-left">
            <section className="od-card">
              <div className="od-card-head">
                <span className="material-symbols-outlined">receipt_long</span>
                <h3 className="od-card-title">Order details</h3>
              </div>
              <div className="od-table">
                {detailRows.map((row, i) => (
                  <div key={i} className={`od-row${row.highlight ? " od-row-highlight" : ""}`}>
                    <span className="od-row-key">{row.key}</span>
                    <div className="od-row-val">
                      {row.type === "chip" ? (
                        <span className={`od-chip od-chip-${row.chip.color}`}>
                          {row.chip.icon && (
                            <span className="material-symbols-outlined od-chip-icon">{row.chip.icon}</span>
                          )}
                          {row.chip.text}
                        </span>
                      ) : row.type === "sub" ? (
                        <>
                          <p className={`od-val-text${row.primary ? " od-val-primary" : ""}`}>{row.val}</p>
                          <p className="od-val-sub">{row.sub}</p>
                        </>
                      ) : (
                        <p className="od-val-text">{row.val}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="od-right">
            <section className="od-card">
              <div className="od-card-head">
                <span className="material-symbols-outlined">person</span>
                <h3 className="od-card-title">Customer details</h3>
              </div>
              <div className="od-cust-body">
                <div className="od-cust-top">
                  <div className="od-cust-avatar">{customer.initials}</div>
                  <div>
                    <h4 className="od-cust-name">{customer.name}</h4>
                    <p className="od-cust-meta">{customer.id} • {customer.email} • {customer.phone}</p>
                  </div>
                </div>
                <div className="od-cust-rows">
                  <div className="od-cust-row">
                    <p className="od-cust-row-label">Member since</p>
                    <p className="od-cust-row-val">{customer.memberSince}</p>
                  </div>
                  <div className="od-cust-row">
                    <p className="od-cust-row-label">Total orders</p>
                    <p className="od-cust-row-val">{customer.totalOrders}</p>
                  </div>
                  <div className="od-cust-row">
                    <p className="od-cust-row-label">Wallet balance</p>
                    <p className="od-cust-row-val od-cust-row-dim">{customer.wallet}</p>
                  </div>
                  <div className="od-cust-row">
                    <p className="od-cust-row-label">Outstanding dues</p>
                    <p className="od-cust-row-val od-cust-row-bold od-cust-row-primary">{customer.outstanding}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      )}

      {activeTab === 1 && (
        <div className="od-placeholder">
          <span className="material-symbols-outlined">person_outline</span>
          <p>Customer profile view coming soon</p>
        </div>
      )}

      {activeTab === 2 && (
        <div className="od-placeholder">
          <span className="material-symbols-outlined">history</span>
          <p>Order history view coming soon</p>
        </div>
      )}

    </div>
  );
}

export { AdminOrderDetail };
