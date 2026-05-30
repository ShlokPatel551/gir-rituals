import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Orders.css";

/* ── Product images ──────────────────────────────────────────── */
const ORDER_IMGS = {
  milk:   "https://lh3.googleusercontent.com/aida-public/AB6AXuDjFMY5rN_iVNG1ktwRQH3quC9KYDsTTIxxClDsTG_iP0TBUtqGp7GYjQEduejvPeiTDuNPM2vd8SAt0iD2YtVqrABTb0eNGzMMiMx6Vi0KdEKUsz8t_kiDSKHPIH5B5afArwauaUUGMqzQrr5MwQ0ym2Vrs3OFZjpFwuaRIst_BrN-XyA7P9JOtXp0ds813zU-iARGgw9VwF6ucE5e6ZAKJOB0hD77XTIurPXPuI3MkrgMXJp5q7PFJIqFHvpzv9C5AdzO2Ms5bTEJ",
  ghee:   "https://lh3.googleusercontent.com/aida-public/AB6AXuAwMLzYW_gAT3citUfklOmoOJvA1_4O_ENkNxM29Ydejo2a1e2NuzVVFFCVmhu7ELxZQIQi47AG8_-PfxOQVQNggxkn78XrzEpWorUYbA3f6odTjR9vDiWcnTXXJbIpksd8yDbj3H-Q1Z7V8DVDdGCD8rLlsqpZLWU9EIRsk5Ei9qdQHIsoJfeFG0lSH1LwosomhY7_ywDFeIIKmMqhGga7ZBalMKV8XOqddYNb0v4u-mkdwLS9a2KRJFQ6Eeu_Idi2ZFgi0H50yxIz",
  paneer: "https://lh3.googleusercontent.com/aida-public/AB6AXuAatjBp5DXyWvUZZ4BB_9zx4pERQNU1w3VjAvJuJDoLOdyY9IGaAGC921C5xATSHLlQyf7HnkQNWZVsBIiA2Sf-7HGvB8LEn0ohhFobBJ863tviw017miklgYNuulbmq4QpWg0XtFZiY8DzykMODS2yN56yIJDalRLaXk2qAQSuEK1d-zlangC9RaFhYpYwtaPr0Aw5jUw6RAc3w7OTanhzGTsGV5cCivK1sRS0Zhzu79GRYxzC1CMjlnUAJSyTxdE4ZMQQuiGH2Lk7",
  curd:   "https://lh3.googleusercontent.com/aida-public/AB6AXuDTj12UG9xox--k9MDP4YKO1eQ6UUCEJKYh3VoALRS9SNlF3puL9cRBQ3pMa3pzC7V4f_6MfqZN_0-E9zSHvynLCnmqV7juEngskdMKQEUXMcQiQiDJ3LRoRTnU3sJOInd7DxMgh8bAWwvD9Yo0_R2f8XYVv0v3yhdKojnhw1JF7xzmeoh7cTm7ZJW9IGmL4hv1a1wfitdzie2k9BLkh20wdJ_jzcTatknO3RIECygRrjpyKuEfBSvluPq_OpOFxStDBocyLtwWXWww",
  honey:  "https://lh3.googleusercontent.com/aida-public/AB6AXuBCNOyK7_HTwbAMW4DZ59PdwTo0dg8yTMKRp6go0eBbyTxKZI1VzMpAlAwAb754GeYn7jILXdnHAeNNBG9EJVhRHqQwNI9_tR8LnJ6_nxXjYLzsTyenjB0QUJIk9kyLZgB2sBFmTFCm6H3oxk3frSTOegnTlNJnM0NT6D6gCnqqQpR8u1vDkcuVRZSm-wINzvOmmxsGDRpflXVP68KqVKJJwicJJ36raXQKC3DbVtyr15CsuT59qHpmYvASsXhpiUFRla0_BZ0Qb5MS",
};

/* ── Mock fallback data ──────────────────────────────────────── */
const MOCK_ACTIVE = [
  {
    id: "GR-9942",
    productName: "Daily A2 Fresh Milk Ritual",
    description: "2 Litres • Delivery expected by 7:30 AM Tomorrow",
    imgKey: "milk",
    status: "active",
    timelineStep: 2,
    paymentLabel: "Paid via Wallet",
    qty: 2,
    startDate: "Oct 1, 2023",
  },
  {
    id: "GR-8812",
    productName: "Bilona Ghee Sacred Batch",
    description: "500ml Jar • Hand-churned on Full Moon",
    imgKey: "ghee",
    status: "active",
    timelineStep: 1,
    amount: 2450,
    qty: 1,
    startDate: "Oct 20, 2023",
  },
];

const MOCK_HISTORY = [
  { id: "GR-7210", productName: "A2 Malai Paneer (250g)",    imgKey: "paneer", date: "Oct 24, 2023", status: "delivered", amount: 450 },
  { id: "GR-6992", productName: "Greek Style Probiotic Curd", imgKey: "curd",   date: "Oct 20, 2023", status: "delivered", amount: 180 },
  { id: "GR-6541", productName: "Forest Raw Honey Ritual",    imgKey: "honey",  date: "Oct 12, 2023", status: "cancelled", amount: 890 },
];

/* ── Helpers ─────────────────────────────────────────────────── */
const TIMELINE_STEPS = [
  { icon: "inventory",      label: "Packed"     },
  { icon: "local_shipping", label: "Dispatched" },
  { icon: "home_pin",       label: "Delivered"  },
];

function imgKeyFromName(name = "") {
  const n = name.toLowerCase();
  if (n.includes("ghee"))   return "ghee";
  if (n.includes("paneer")) return "paneer";
  if (n.includes("curd") || n.includes("yogurt")) return "curd";
  if (n.includes("honey"))  return "honey";
  return "milk";
}

function statusLabel(status) {
  if (status === "active")    return "In Transit";
  if (status === "processing") return "Processing";
  if (status === "delivered") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  if (status === "completed") return "Delivered";
  return status;
}

function statusBadgeClass(status) {
  if (status === "active" || status === "in-transit") return "or-badge-transit";
  if (status === "processing") return "or-badge-processing";
  if (status === "delivered" || status === "completed") return "or-badge-delivered";
  if (status === "cancelled") return "or-badge-cancelled";
  return "or-badge-processing";
}

/* ── Delivery Timeline ───────────────────────────────────────── */
function OrderTimeline({ stepsComplete }) {
  const pct = stepsComplete <= 1
    ? 0
    : ((stepsComplete - 1) / (TIMELINE_STEPS.length - 1)) * 100;

  return (
    <div className="or-timeline">
      <div className="or-tl-track" />
      <div className="or-tl-progress" style={{ width: `${pct}%` }} />
      <div className="or-tl-steps">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i < stepsComplete;
          return (
            <div key={step.label} className={`or-tl-step${done ? "" : " or-tl-step-pending"}`}>
              <div className={`or-tl-circle${done ? " or-tl-circle-done" : ""}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{step.icon}</span>
              </div>
              <span className="or-tl-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Active Order Card ───────────────────────────────────────── */
function ActiveOrderCard({ order }) {
  const { showToast } = useToast();
  const img  = ORDER_IMGS[order.imgKey ?? imgKeyFromName(order.productName)];
  const step = order.timelineStep ?? (order.status === "active" ? 2 : 1);
  const hasTimeline = order.status === "active" || order.status === "in-transit" || order.status === "processing";
  const statusText  = statusLabel(order.status);
  const badgeClass  = statusBadgeClass(order.status);

  return (
    <div className="or-glass-card">
      {/* Top row */}
      <div className="or-card-top">
        <div className="or-card-left">
          <div className="or-card-thumb">
            <img
              src={img}
              alt={order.productName}
              className="or-card-thumb-img"
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <div>
            <div className="or-card-meta">
              <span className="or-card-id">ORDER #{order.id}</span>
              <span className={`or-badge ${badgeClass}`}>{statusText}</span>
            </div>
            <h3 className="or-card-title">{order.productName}</h3>
            <p className="or-card-desc">
              {order.description ?? `${order.qty} unit(s) • Started ${order.startDate}`}
            </p>
          </div>
        </div>
        <div className="or-card-right">
          {order.paymentLabel ? (
            <>
              <p className="or-card-right-label">Payment Status</p>
              <div className="or-card-paid">
                <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {order.paymentLabel}
              </div>
            </>
          ) : (
            <>
              <p className="or-card-right-label">Total Amount</p>
              <p className="or-card-amount">₹{Number(order.amount ?? 0).toLocaleString("en-IN")}</p>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      {hasTimeline && <OrderTimeline stepsComplete={step} />}

      {/* Action bar */}
      <div className="or-card-actions">
        <div className="or-card-btns">
          <button
            type="button"
            className="or-btn-outline"
            onClick={() => showToast("Live tracking coming soon.", "info")}
          >
            Track Live
          </button>
          <button
            type="button"
            className="or-btn-ghost"
            onClick={() => showToast("Order modification requires backend.", "info")}
          >
            Modify Order
          </button>
        </div>
        <Link to="/contact" className="or-support-link">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>support_agent</span>
          Contact Support
        </Link>
      </div>
    </div>
  );
}

/* ── Main Orders component ───────────────────────────────────── */
function Orders() {
  const { orders, addToCart, cancelOrder, products } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState("active");

  /* Use real data when present, else mock */
  const realActive  = orders.filter(o => o.status === "active");
  const realHistory = orders.filter(o => o.status !== "active");
  const activeOrders  = realActive.length  > 0 ? realActive  : MOCK_ACTIVE;
  const historyOrders = realHistory.length > 0 ? realHistory : MOCK_HISTORY;

  const handleReorder = (order) => {
    const name = order.productName ?? "";
    const product = products.find(p => p.name === name || p.id === imgKeyFromName(name));
    if (product) addToCart(product.id);
    showToast(`${name} added to cart!`);
  };

  const handleCancel = async (order) => {
    if (cancelOrder) await cancelOrder(order.id);
    showToast(`Order #${order.id} cancelled.`, "info");
  };

  return (
    <div className="or-page">

      {/* ══ HEADER ══ */}
      <div className="or-header">
        <div>
          <h2 className="or-title">Your Ritual History</h2>
          <p className="or-subtitle">Tracking your journey of pure A2 nourishment.</p>
        </div>
        <div className="or-tabs">
          <button
            type="button"
            className={`or-tab ${tab === "active" ? "or-tab-active" : ""}`}
            onClick={() => setTab("active")}
          >
            Active Orders
            {activeOrders.length > 0 && (
              <span className="or-tab-count">{activeOrders.length}</span>
            )}
          </button>
          <button
            type="button"
            className={`or-tab ${tab === "history" ? "or-tab-active" : ""}`}
            onClick={() => setTab("history")}
          >
            Order History
          </button>
        </div>
      </div>

      {/* ══ ACTIVE ORDERS ══ */}
      {tab === "active" && (
        <div className="or-active-list">
          {activeOrders.length === 0 ? (
            <div className="or-empty">
              <span className="material-symbols-outlined or-empty-icon">shopping_bag</span>
              <p>No active orders right now.</p>
              <Link to="/products" className="or-btn-primary">Browse Products</Link>
            </div>
          ) : (
            activeOrders.map(order => (
              <ActiveOrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}

      {/* ══ ORDER HISTORY TABLE ══ */}
      {tab === "history" && (
        <div className="or-history">
          {historyOrders.length === 0 ? (
            <div className="or-empty">
              <span className="material-symbols-outlined or-empty-icon">history</span>
              <p>No order history yet.</p>
            </div>
          ) : (
            <div className="or-table-card">
              <div className="or-table-wrap">
                <table className="or-table">
                  <thead className="or-thead">
                    <tr>
                      <th className="or-th">Order ID</th>
                      <th className="or-th">Products</th>
                      <th className="or-th">Date</th>
                      <th className="or-th">Status</th>
                      <th className="or-th">Amount</th>
                      <th className="or-th" />
                    </tr>
                  </thead>
                  <tbody>
                    {historyOrders.map((order, i) => {
                      const img     = ORDER_IMGS[order.imgKey ?? imgKeyFromName(order.productName)];
                      const status  = order.status;
                      const isCancelled = status === "cancelled";
                      const isDone = status === "delivered" || status === "completed";
                      return (
                        <tr key={order.id ?? i} className="or-tr">
                          <td className="or-td">
                            <span className="or-history-id">#{order.id}</span>
                          </td>
                          <td className="or-td">
                            <div className="or-history-product">
                              <div className="or-history-thumb">
                                <img
                                  src={img}
                                  alt={order.productName}
                                  className="or-history-thumb-img"
                                  onError={e => { e.target.style.display = "none"; }}
                                />
                              </div>
                              <span className="or-history-name">{order.productName}</span>
                            </div>
                          </td>
                          <td className="or-td or-td-muted">
                            {order.date ?? order.startDate ?? "—"}
                          </td>
                          <td className="or-td">
                            <span className={`or-history-badge ${
                              isDone      ? "or-hbadge-delivered"  :
                              isCancelled ? "or-hbadge-cancelled"  :
                                            "or-hbadge-pending"
                            }`}>
                              {isDone ? "Delivered" : isCancelled ? "Cancelled" : statusLabel(status)}
                            </span>
                          </td>
                          <td className="or-td or-td-bold">
                            ₹{Number(order.amount ?? 0).toLocaleString("en-IN")}
                          </td>
                          <td className="or-td or-td-right">
                            {isCancelled ? (
                              <button
                                type="button"
                                className="or-action-icon"
                                title="View details"
                                onClick={() => showToast("Cancellation details available soon.", "info")}
                              >
                                <span className="material-symbols-outlined">info</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="or-action-icon"
                                title="Receipt / Reorder"
                                onClick={() => handleReorder(order)}
                              >
                                <span className="material-symbols-outlined">receipt</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ FOOTER CTA ══ */}
      <div className="or-footer-cta">
        <p className="or-footer-quote">"Purity is not an act, but a habit."</p>
        <Link to="/products" className="or-footer-btn">Order a New Ritual</Link>
      </div>
    </div>
  );
}

/* ── OrderDetail (reskinned) ─────────────────────────────────── */
function OrderDetail() {
  const { id } = useParams();
  const { orders, addToCart, products } = useApp();
  const { showToast } = useToast();

  const order = orders.find(o => o.id === id);
  if (!order) return (
    <div className="or-page">
      <Link to="/orders" className="or-back-link">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Orders
      </Link>
      <div className="or-empty" style={{ marginTop: "2rem" }}>
        <span className="material-symbols-outlined or-empty-icon">search_off</span>
        <p>Order not found.</p>
      </div>
    </div>
  );

  const imgKey = imgKeyFromName(order.productName);
  const img    = ORDER_IMGS[imgKey];
  const step   = order.status === "active" ? 2 : order.status === "delivered" || order.status === "completed" ? 3 : 1;

  const handleReorder = () => {
    const product = products.find(p => p.name === order.productName || p.id === imgKey);
    if (product) addToCart(product.id);
    showToast(`${order.productName} added to cart!`);
  };

  return (
    <div className="or-page">
      <Link to="/orders" className="or-back-link">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Orders
      </Link>

      <div className="or-detail-header">
        <h2 className="or-title" style={{ marginBottom: "0.25rem" }}>Order #{order.id}</h2>
        <span className={`or-badge ${statusBadgeClass(order.status)}`}>{statusLabel(order.status)}</span>
      </div>

      {/* Main card */}
      <div className="or-glass-card" style={{ marginTop: "1.5rem" }}>
        <div className="or-card-top">
          <div className="or-card-left">
            <div className="or-card-thumb">
              <img src={img} alt={order.productName} className="or-card-thumb-img" onError={e => { e.target.style.display = "none"; }} />
            </div>
            <div>
              <h3 className="or-card-title">{order.productName}</h3>
              <p className="or-card-desc">{order.qty} unit(s) • Started {order.startDate}</p>
            </div>
          </div>
        </div>
        <OrderTimeline stepsComplete={step} />
      </div>

      {/* Stats */}
      <div className="or-detail-stats">
        {[
          { label: "Total Delivered", value: "22 days" },
          { label: "Days Paused",     value: "2 days"  },
          { label: "Total Billed",    value: "₹2,100"  },
        ].map(s => (
          <div key={s.label} className="or-stat-box">
            <span className="or-stat-lbl">{s.label}</span>
            <span className="or-stat-val">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Timeline events */}
      <div className="or-glass-card" style={{ marginTop: "1.5rem" }}>
        <h4 className="or-detail-section-title">Timeline</h4>
        <div className="or-event-list">
          <div className="or-event">
            <span className="or-event-dot" />
            <div>
              <p className="or-event-label">Subscription started</p>
              <p className="or-event-date">{order.startDate}</p>
            </div>
          </div>
          <div className="or-event">
            <span className="or-event-dot" />
            <div>
              <p className="or-event-label">Payment received</p>
              <p className="or-event-date">Apr 28, 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="or-detail-actions">
        <Link to="/contact" className="or-btn-outline" style={{ textDecoration: "none" }}>Request Refund</Link>
        {(order.status === "completed" || order.status === "delivered") && (
          <button type="button" className="or-btn-primary" onClick={handleReorder}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
            Re-order
          </button>
        )}
      </div>
    </div>
  );
}

export { OrderDetail, Orders };
