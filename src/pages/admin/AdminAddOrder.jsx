import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminAddOrder.css";

const CUSTOMERS = [
  { id: "GR00124", name: "Priya Shah",    email: "priya.s@gmail.com",        phone: "+91 98765 40041", initials: "PS" },
  { id: "GR00089", name: "Rahul Mehta",   email: "rahul.m@gmail.com",        phone: "+91 98765 40089", initials: "RM" },
  { id: "GR00201", name: "Anjali Kapoor", email: "anjali.k@gmail.com",       phone: "+91 98765 40201", initials: "AK" },
  { id: "GR00057", name: "Meena Patel",   email: "meena.p@gmail.com",        phone: "+91 98765 40057", initials: "MP" },
  { id: "GR00312", name: "Suresh Joshi",  email: "suresh.j@gmail.com",       phone: "+91 98765 40312", initials: "SJ" },
  { id: "GR00098", name: "Rajesh Jain",   email: "rjain_premium@email.com",  phone: "+91 98765 43210", initials: "RJ" },
];

const PRODUCTS = [
  { id: "PRD-001", name: "Desi Cow Paneer",    unit: "Pack (500g)", subRate: 220, buyRate: 240 },
  { id: "PRD-002", name: "Fresh Buffalo Milk", unit: "Litre",       subRate: 52,  buyRate: 58  },
  { id: "PRD-003", name: "A2 Gir Cow Ghee",    unit: "500ml",       subRate: 620, buyRate: 680 },
  { id: "PRD-004", name: "A2 Gir Cow Milk",    unit: "Litre",       subRate: 68,  buyRate: 75  },
  { id: "PRD-005", name: "Cow Curd",            unit: "200g",        subRate: 45,  buyRate: 55  },
  { id: "PRD-006", name: "White Butter",        unit: "200g",        subRate: 180, buyRate: 220 },
];

const ORDER_TYPES = [
  { key: "subscription", icon: "calendar_today", label: "Subscription" },
  { key: "extra",        icon: "add_box",         label: "Extra order"  },
  { key: "individual",   icon: "shopping_bag",    label: "Individual"   },
];

const PAYMENT_METHODS = ["UPI", "Bank Transfer", "Cash on Delivery"];

function fmt(n) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function AdminAddOrder() {
  const navigate = useNavigate();

  const [editingCustomer, setEditingCustomer] = useState(false);
  const [searchText,      setSearchText]      = useState("");
  const [showDropdown,    setShowDropdown]    = useState(false);
  const [customer,        setCustomer]        = useState(CUSTOMERS[5]);

  const [orderType,     setOrderType]     = useState("individual");
  const [productId,     setProductId]     = useState("PRD-001");
  const [qty,           setQty]           = useState(2);
  const [deliveryDate,  setDeliveryDate]  = useState(today());
  const [address,       setAddress]       = useState("42, Heritage Enclave, Sector 12");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("UPI_982348123X");

  const product = PRODUCTS.find(p => p.id === productId) ?? PRODUCTS[0];
  const rate    = orderType === "individual" ? product.buyRate : product.subRate;
  const total   = rate * qty;

  const searchResults = useMemo(() => {
    if (!searchText.trim()) return [];
    const q = searchText.toLowerCase();
    return CUSTOMERS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.phone.replace(/\s/g,"").includes(q.replace(/\s/g,""))
    ).slice(0, 5);
  }, [searchText]);

  function selectCustomer(c) {
    setCustomer(c);
    setSearchText("");
    setShowDropdown(false);
    setEditingCustomer(false);
  }

  const typeWarning = {
    subscription: null,
    extra: "Extra order is a one-day add-on. It is separate from the customer's existing subscription and will be billed according to the payment method selected below.",
    individual: "Individual order requires immediate payment and cannot be added to the monthly billing cycle.",
  };

  return (
    <div className="aord-page">

      {/* ── Header ── */}
      <div className="aord-header">
        <nav className="aord-breadcrumb">
          <button type="button" className="aord-crumb-link" onClick={() => navigate("/admin/orders")}>Orders</button>
          <span className="material-symbols-outlined aord-crumb-sep">chevron_right</span>
          <span className="aord-crumb-current">Add new order</span>
        </nav>
        <div className="aord-header-row">
          <div>
            <h2 className="aord-page-title">Add new order</h2>
            <p className="aord-page-sub">Create an order on behalf of a customer — subscription, extra, or individual purchase</p>
          </div>
          <button type="button" className="aord-back-btn" onClick={() => navigate("/admin/orders")}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to orders
          </button>
        </div>
      </div>

      <div className="aord-layout">

        {/* ── Left: form steps ── */}
        <div className="aord-steps">

          {/* Step 1 — Customer */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">1</span>
              <h3 className="aord-step-title">Select customer</h3>
            </div>

            {!editingCustomer && customer ? (
              <div className="aord-customer-selected">
                <span className="material-symbols-outlined aord-cust-person">person</span>
                <div className="aord-cust-info">
                  <p className="aord-cust-name">{customer.name}</p>
                  <p className="aord-cust-meta">{customer.email} • {customer.phone}</p>
                </div>
                <button type="button" className="aord-cust-edit" onClick={() => setEditingCustomer(true)}>
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
            ) : (
              <div className="aord-search-wrap">
                <input
                  type="text"
                  className="aord-input aord-search-input"
                  placeholder="Search by name, ID, or phone…"
                  value={searchText}
                  autoFocus
                  onChange={e => { setSearchText(e.target.value); setShowDropdown(true); }}
                  onBlur={() => setTimeout(() => { setShowDropdown(false); setEditingCustomer(false); }, 150)}
                />
                <span className="material-symbols-outlined aord-search-icon">search</span>
                {showDropdown && searchResults.length > 0 && (
                  <div className="aord-dropdown">
                    {searchResults.map(c => (
                      <button key={c.id} type="button" className="aord-dd-item" onMouseDown={() => selectCustomer(c)}>
                        <div className="aord-dd-avatar">{c.initials}</div>
                        <div>
                          <p className="aord-dd-name">{c.name}</p>
                          <p className="aord-dd-meta">{c.email} · {c.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {customer && (
                  <button type="button" className="aord-cancel-edit" onClick={() => setEditingCustomer(false)}>
                    Cancel
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Step 2 — Order type */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">2</span>
              <h3 className="aord-step-title">Select order type</h3>
            </div>

            <div className="aord-type-grid">
              {ORDER_TYPES.map(t => {
                const active = orderType === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    className={`aord-type-btn${active ? " aord-type-active" : " aord-type-inactive"}`}
                    onClick={() => setOrderType(t.key)}
                  >
                    <span className={`material-symbols-outlined aord-type-icon${active ? " aord-type-icon-active" : ""}`}>
                      {t.icon}
                    </span>
                    <span className={`aord-type-label${active ? " aord-type-label-active" : ""}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {typeWarning[orderType] && (
              <div className="aord-callout aord-callout-amber">
                <span className="material-symbols-outlined">warning</span>
                <p>{typeWarning[orderType]}</p>
              </div>
            )}
          </section>

          {/* Step 3 — Product + Quantity */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">3</span>
              <h3 className="aord-step-title">Product + quantity</h3>
            </div>

            <div className="aord-prod-grid">
              <div className="aord-field">
                <label className="aord-label">Product</label>
                <div className="aord-select-wrap">
                  <select className="aord-input aord-select" value={productId} onChange={e => setProductId(e.target.value)}>
                    {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined aord-sel-arrow">expand_more</span>
                </div>
              </div>

              <div className="aord-qty-unit-grid">
                <div className="aord-field">
                  <label className="aord-label">Quantity</label>
                  <input
                    type="number"
                    className="aord-input"
                    value={qty}
                    min={1}
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className="aord-field">
                  <label className="aord-label">Unit</label>
                  <div className="aord-select-wrap">
                    <select className="aord-input aord-select">
                      <option>{product.unit}</option>
                    </select>
                    <span className="material-symbols-outlined aord-sel-arrow">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="aord-rate-bar">
              <p className="aord-rate-text">
                Rate: <strong className="aord-rate-val">₹{fmt(rate)}</strong>
                {" "}&times; {qty} = <strong className="aord-rate-total">₹{fmt(total)}</strong>
              </p>
            </div>
          </section>

          {/* Step 4 — Delivery */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">4</span>
              <h3 className="aord-step-title">Delivery date + address</h3>
            </div>

            <div className="aord-grid-2">
              <div className="aord-field">
                <label className="aord-label">Delivery Date</label>
                <div className="aord-icon-right-wrap">
                  <input
                    type="text"
                    className="aord-input aord-icon-right-input"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                  />
                  <span className="material-symbols-outlined aord-icon-right">calendar_today</span>
                </div>
              </div>
              <div className="aord-field">
                <label className="aord-label">Delivery Address</label>
                <div className="aord-icon-right-wrap">
                  <input
                    type="text"
                    className="aord-input aord-icon-right-input"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                  <span className="material-symbols-outlined aord-icon-right">location_on</span>
                </div>
              </div>
            </div>

            <div className="aord-callout aord-callout-info">
              <span className="material-symbols-outlined">info</span>
              <p>
                {orderType === "individual"
                  ? "Individual order delivers on one specific date. For recurring deliveries, use the Subscription option."
                  : "Delivery schedule follows the customer's subscription frequency."}
              </p>
            </div>
          </section>

          {/* Step 5 — Payment */}
          <section className="aord-card">
            <div className="aord-step-head">
              <span className="aord-step-num">5</span>
              <h3 className="aord-step-title">Payment</h3>
            </div>

            {orderType === "individual" && (
              <div className="aord-callout aord-callout-credit">
                <span className="material-symbols-outlined">credit_card</span>
                <p className="aord-callout-bold">Payment is mandatory for individual orders before processing.</p>
              </div>
            )}

            <div className="aord-grid-2 aord-grid-top">
              <div className="aord-field">
                <label className="aord-label">Payment Method</label>
                <div className="aord-select-wrap">
                  <select className="aord-input aord-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <span className="material-symbols-outlined aord-sel-arrow">expand_more</span>
                </div>
              </div>
              <div className="aord-field">
                <label className="aord-label">Status</label>
                <div className="aord-paid-status">
                  <span className="material-symbols-outlined aord-paid-icon">check_circle</span>
                  Paid — payment received
                </div>
              </div>
            </div>

            <div className="aord-field aord-field-full">
              <label className="aord-label">Transaction ID / Reference</label>
              <input
                type="text"
                className="aord-input"
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder="e.g. UPI_982348123X"
              />
            </div>

            {orderType === "individual" && (
              <div className="aord-callout aord-callout-error">
                <span className="material-symbols-outlined">error</span>
                <p>Monthly bill option is not available for individual orders to maintain cash-flow integrity.</p>
              </div>
            )}
          </section>

        </div>

        {/* ── Right: Sidebar summary ── */}
        <aside className="aord-sidebar">

          <div className="aord-summary-card">
            <h4 className="aord-summary-title">
              <span className="material-symbols-outlined aord-summary-icon">receipt_long</span>
              Order summary
            </h4>

            <div className="aord-summary-rows">
              <div className="aord-summary-row">
                <p className="aord-sum-key">Customer</p>
                <p className="aord-sum-val aord-sum-primary">
                  {customer ? customer.name : <span className="aord-sum-empty">Not selected</span>}
                </p>
              </div>

              <div className="aord-summary-row">
                <p className="aord-sum-key">Order Type</p>
                <div className="aord-sum-type">
                  <span className="material-symbols-outlined aord-sum-type-icon">
                    {ORDER_TYPES.find(t => t.key === orderType)?.icon}
                  </span>
                  {ORDER_TYPES.find(t => t.key === orderType)?.label} order
                </div>
              </div>

              <div className="aord-summary-row">
                <p className="aord-sum-key">Product</p>
                <p className="aord-sum-val">{qty} × {product.name} ({product.unit})</p>
              </div>

              <div className="aord-summary-row">
                <p className="aord-sum-key">Delivery Date</p>
                <p className="aord-sum-val">{deliveryDate || "—"}</p>
              </div>

              <div className="aord-summary-row">
                <p className="aord-sum-key">Payment</p>
                <div className="aord-sum-pay-row">
                  <p className="aord-sum-val">{paymentMethod} (Paid)</p>
                  <span className="aord-sum-amount">₹{fmt(total)}</span>
                </div>
              </div>

              <div className="aord-repeats-box">
                <div className="aord-repeats-head">
                  <span className="material-symbols-outlined aord-repeats-icon">
                    {orderType === "subscription" ? "sync" : "sync_disabled"}
                  </span>
                  Repeats?
                </div>
                <p className="aord-repeats-val">
                  {orderType === "subscription" ? "Yes — recurring subscription" : "No — one-time purchase only"}
                </p>
              </div>
            </div>

            <div className="aord-grand-total">
              <span className="aord-total-label">Grand Total</span>
              <span className="aord-total-amount">₹{fmt(total)}</span>
            </div>
          </div>

          <div className="aord-actions">
            <button type="button" className="aord-confirm-btn" disabled={!customer}>
              Confirm and create order
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button type="button" className="aord-cancel-btn" onClick={() => navigate("/admin/orders")}>
              Cancel
            </button>
          </div>

        </aside>
      </div>

    </div>
  );
}

export { AdminAddOrder };
