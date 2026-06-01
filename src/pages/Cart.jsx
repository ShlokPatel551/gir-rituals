import { useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Cart.css";

/* ── Product images ─────────────────────────────────────────── */
const PRODUCT_IMGS = {
  milk:   "https://lh3.googleusercontent.com/aida-public/AB6AXuDUBwAsVrFtBz-ThjfsL4wBtlGs5nkhWQgbrGKAD4I09yAX3lMOPqVJotnKFNC4lR2cC7t6BJ-VhO-BKtcMtISnH6CDjA36vO224abotHkxliKJnqyOoeSmKJA3Jd7-9Zm_7uVAYA1vtjIe6ZBzTpwTi1bgxtOh7lFH2YMxaNHQjknJaxJYUF8FxoDwpmVJ1l60lfkN4R8Ae9o3wulP14SJseRIpXHgkh_15uf00nvdKYMVe9xPORLksOA3uPwRljhPrRDk5kWbBa-K",
  ghee:   "https://lh3.googleusercontent.com/aida-public/AB6AXuCiTmIEx28DBMRj6KXJ0fTF9ImOqxnUJJyBknqmNlhmc5sw8JRMpTjYS0AYkJU3bkMOiWIr78g54IIhA1MZc4GJn9tXMa_W88DN6khO_gwHSi9pXukLWE2xyI3qYh6aT-QOtZd4_1U_EHdTrbkjnYwS_mBeDGOAw2pszut3hlr1ausDueRYx4wQHWF3XvOUpgWrBizIr_5tZOLbTPrqSg079S8WEXp4dvgU9HJpHn5PUW5niqW0AuSnAOPw-P5Pz58MI8XRcc5u9QjJ",
  paneer: "https://lh3.googleusercontent.com/aida-public/AB6AXuAatjBp5DXyWvUZZ4BB_9zx4pERQNU1w3VjAvJuJDoLOdyY9IGaAGC921C5xATSHLlQyf7HnkQNWZVsBIiA2Sf-7HGvB8LEn0ohhFobBJ863tviw017miklgYNuulbmq4QpWg0XtFZiY8DzykMODS2yN56yIJDalRLaXk2qAQSuEK1d-zlangC9RaFhYpYwtaPr0Aw5jUw6RAc3w7OTanhzGTsGV5cCivK1sRS0Zhzu79GRYxzC1CMjlnUAJSyTxdE4ZMQQuiGH2Lk7",
  honey:  "https://lh3.googleusercontent.com/aida-public/AB6AXuBCNOyK7_HTwbAMW4DZ59PdwTo0dg8yTMKRp6go0eBbyTxKZI1VzMpAlAwAb754GeYn7jILXdnHAeNNBG9EJVhRHqQwNI9_tR8LnJ6_nxXjYLzsTyenjB0QUJIk9kyLZgB2sBFmTFCm6H3oxk3frSTOegnTlNJnM0NT6D6gCnqqQpR8u1vDkcuVRZSm-wINzvOmmxsGDRpflXVP68KqVKJJwicJJ36raXQKC3DbVtyr15CsuT59qHpmYvASsXhpiUFRla0_BZ0Qb5MS",
};

const MOCK_CART_ITEMS = [
  { productId: "milk", quantity: 2, name: "Fresh A2 Gir Cow Milk",  subtitle: "1 Litre • Glass Bottle Refill",        price: 90   },
  { productId: "ghee", quantity: 1, name: "Bilona A2 Gir Ghee",     subtitle: "500ml • Traditional Bilona Method",    price: 1450 },
];

const MOCK_WALLET = 450;

const STEP_LABELS = ["Order Review", "Delivery Details", "Payment"];

const PAYMENT_METHODS = [
  { id: "upi",        icon: "smartphone",      label: "UPI"                 },
  { id: "netbanking", icon: "account_balance", label: "Net Banking"         },
  { id: "card",       icon: "credit_card",     label: "Credit / Debit Card" },
];

function imgKey(productId = "") {
  if (productId.includes("ghee"))   return "ghee";
  if (productId.includes("paneer")) return "paneer";
  if (productId.includes("honey"))  return "honey";
  return "milk";
}

/* ── Step Indicator ─────────────────────────────────────────── */
function StepIndicator({ step }) {
  return (
    <div className="ct-steps">
      {STEP_LABELS.map((label, i) => {
        const num    = i + 1;
        const active = num === step;
        const done   = num < step;
        return (
          <Fragment key={label}>
            <div className="ct-step-group">
              <div className={`ct-step-circle ${active ? "ct-step-circle-active" : done ? "ct-step-circle-done" : ""}`}>
                {done
                  ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                  : num
                }
              </div>
              <span className={`ct-step-label ${active ? "ct-step-label-active" : ""}`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="ct-step-divider" />}
          </Fragment>
        );
      })}
    </div>
  );
}

/* ── Product Card ────────────────────────────────────────────── */
function CartProductCard({ item, isReal, onQtyChange, onRemove, deliveryType, onTypeChange }) {
  const img = PRODUCT_IMGS[imgKey(item.productId)];
  const lineTotal = item.price * item.quantity;
  return (
    <div className="ct-product-card">
      <div className="ct-product-thumb">
        <img
          src={img}
          alt={item.name}
          className="ct-product-thumb-img"
          onError={e => { e.target.style.display = "none"; }}
        />
      </div>
      <div className="ct-product-body">
        <div className="ct-product-header">
          <div>
            <h3 className="ct-product-name">{item.name}</h3>
            <p className="ct-product-sub">{item.subtitle}</p>
          </div>
          <button
            type="button"
            className="ct-delete-btn"
            onClick={() => onRemove(item.productId)}
            aria-label="Remove item"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>

        {/* ── Delivery type selector ── */}
        <div className="ct-delivery-seg" role="group" aria-label="Delivery type">
          <button
            type="button"
            className={`ct-delivery-opt${deliveryType === "ritual" ? " ct-delivery-opt-active" : ""}`}
            onClick={() => onTypeChange(item.productId, "ritual")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>autorenew</span>
            Daily Ritual
          </button>
          <button
            type="button"
            className={`ct-delivery-opt${deliveryType === "today" ? " ct-delivery-opt-active" : ""}`}
            onClick={() => onTypeChange(item.productId, "today")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>today</span>
            Just for Today
          </button>
        </div>

        {deliveryType === "ritual" && (
          <p className="ct-delivery-hint">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
            Delivered every day — pause or cancel anytime from your schedule.
          </p>
        )}

        <div className="ct-product-footer">
          <div className="ct-qty-stepper">
            <button
              type="button"
              className="ct-qty-btn"
              onClick={() => onQtyChange(item.productId, item.quantity - 1)}
            >−</button>
            <span className="ct-qty-val">{String(item.quantity).padStart(2, "0")}</span>
            <button
              type="button"
              className="ct-qty-btn"
              onClick={() => onQtyChange(item.productId, item.quantity + 1)}
            >+</button>
          </div>
          <span className="ct-product-price">₹{lineTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Cart Component ─────────────────────────────────────── */
function Cart() {
  const { cart, cartTotal, updateCartQty, removeFromCart, user, products } = useApp();
  const { showToast } = useToast();

  const [step,          setStep]          = useState(1);
  const [coupon,        setCoupon]        = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [success,       setSuccess]       = useState(false);
  const [deliveryTypes, setDeliveryTypes] = useState({});

  const getDeliveryType  = (id) => deliveryTypes[id] ?? "today";
  const handleTypeChange = (id, type) => setDeliveryTypes(prev => ({ ...prev, [id]: type }));

  const isRealCart = cart.length > 0;

  const effectiveItems = useMemo(() => {
    if (isRealCart) {
      return cart.map(c => {
        const p = products.find(x => x.id === c.productId);
        return {
          productId: c.productId,
          quantity:  c.quantity,
          name:      p?.name ?? c.productId,
          subtitle:  p?.unit ?? "",
          price:     p?.price ?? 0,
        };
      });
    }
    return MOCK_CART_ITEMS;
  }, [cart, products, isRealCart]);

  const subtotal = isRealCart ? cartTotal : MOCK_CART_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0);
  const total    = subtotal;

  const addr = user?.deliveryAddress ?? { street: "12 Farm Lane", city: "Ahmedabad", state: "Gujarat", pinCode: "380001" };

  const handleQtyChange = (productId, qty) => {
    if (isRealCart) updateCartQty(productId, qty);
    else showToast("Demo mode — connect backend to update quantity.", "info");
  };

  const handleRemove = (productId) => {
    if (isRealCart) {
      removeFromCart(productId);
      showToast("Item removed from cart.", "info");
    } else {
      showToast("Demo mode — connect backend to remove items.", "info");
    }
  };

  const handleApplyCoupon = () => {
    if (!coupon.trim()) { showToast("Please enter a coupon code.", "info"); return; }
    showToast(`Coupon "${coupon}" applied! (Demo)`, "success");
  };

  const proceedLabel = step === 1 ? "Proceed to Checkout" : step === 2 ? "Continue to Payment" : "Complete Payment";
  const proceedIcon  = step === 3 ? "lock" : "arrow_forward";

  const handleProceed = () => {
    if (step < 3) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ── Success View ── */
  if (success) {
    return (
      <div className="ct-page">
        <div className="ct-success-view">
          <div className="ct-success-icon-wrap">
            <span
              className="material-symbols-outlined ct-success-icon"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h1 className="ct-success-title">Ritual Confirmed!</h1>
          <p className="ct-success-desc">
            Your journey to wellness continues. We've started preparing your order with the utmost care.
          </p>

          <div className="ct-order-info-card">
            {[
              { label: "Order ID",           value: "#GIR-998210" },
              { label: "Estimated Delivery", value: "Tomorrow, 6:00 AM – 8:00 AM" },
              { label: "Payment Mode",       value: PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label ?? "Ritual Wallet" },
              { label: "Amount Paid",        value: `₹${total.toLocaleString("en-IN")}` },
            ].map(r => (
              <div key={r.label} className="ct-order-info-row">
                <span className="ct-order-info-label">{r.label}</span>
                <span className="ct-order-info-value">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="ct-success-btns">
            <Link to="/orders" className="ct-btn-primary">Track Order</Link>
            <button
              type="button"
              className="ct-btn-outline"
              onClick={() => showToast("Invoice download requires backend.", "info")}
            >
              Download Invoice
            </button>
          </div>

          <Link to="/products" className="ct-continue-link">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ct-page">

      {/* Steps */}
      <StepIndicator step={step} />

      {/* 2-column grid */}
      <div className="ct-grid">

        {/* ══ LEFT ══ */}
        <div className="ct-left">

          {/* Step 1 — Order Review */}
          {step === 1 && (
            <>
              <h2 className="ct-section-title">Your Selected Rituals</h2>

              <div className="ct-products-list">
                {effectiveItems.map(item => (
                  <CartProductCard
                    key={item.productId}
                    item={item}
                    isReal={isRealCart}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                    deliveryType={getDeliveryType(item.productId)}
                    onTypeChange={handleTypeChange}
                  />
                ))}
              </div>

              {/* Coupon */}
              <div className="ct-extras">
                <div className="ct-coupon-row">
                  <input
                    type="text"
                    className="ct-coupon-input"
                    placeholder="Coupon Code"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                  />
                  <button type="button" className="ct-apply-btn" onClick={handleApplyCoupon}>
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2 — Delivery Details */}
          {step === 2 && (
            <>
              <h2 className="ct-section-title">Delivery Details</h2>

              <div className="ct-address-card">
                <div className="ct-address-icon-wrap">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div className="ct-address-body">
                  <p className="ct-address-label">Delivering to</p>
                  <p className="ct-address-main">{addr.street}</p>
                  <p className="ct-address-sub">
                    {addr.city}, {addr.state} – {addr.pinCode}
                  </p>
                  <Link to="/profile/settings" className="ct-edit-link">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                    Edit Address
                  </Link>
                </div>
              </div>

              <div className="ct-delivery-note">
                <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>schedule</span>
                <p>
                  Expected delivery: <strong>Tomorrow, 6:00 AM – 8:00 AM</strong>.
                  Our delivery partner will call 30 minutes before arrival.
                </p>
              </div>

              <div className="ct-delivery-note ct-delivery-note-eco">
                <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>eco</span>
                <p>All orders are shipped in <strong>eco-friendly, returnable packaging</strong>. Glass bottles will be collected on next delivery.</p>
              </div>
            </>
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <>
              <h2 className="ct-section-title">Choose Payment Method</h2>

              <div className="ct-payment-options">
                {PAYMENT_METHODS.map(m => (
                  <label
                    key={m.id}
                    className={`ct-payment-option ${paymentMethod === m.id ? "ct-payment-option-active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="ct-payment-radio"
                    />
                    <span className="ct-payment-icon-wrap">
                      <span className="material-symbols-outlined">{m.icon}</span>
                    </span>
                    <span className="ct-payment-label">{m.label}</span>
                    {paymentMethod === m.id && (
                      <span
                        className="material-symbols-outlined ct-payment-check"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <div className="ct-secure-note">
                <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>verified_user</span>
                <p>
                  Your payment is protected with 256-bit SSL encryption.
                  GIR RITUALS never stores card details.
                </p>
              </div>
            </>
          )}
        </div>

        {/* ══ RIGHT — Summary ══ */}
        <aside className="ct-right">
          <div className="ct-summary-card">
            <h3 className="ct-summary-title">Summary</h3>

            <div className="ct-summary-rows">
              {effectiveItems.map(item => (
                <div key={item.productId} className="ct-summary-row">
                  <span className="ct-summary-item-name">{item.name}</span>
                  <span className={`ct-summary-type-chip ${getDeliveryType(item.productId) === "ritual" ? "ct-type-ritual" : "ct-type-today"}`}>
                    {getDeliveryType(item.productId) === "ritual" ? "Daily" : "1×"}
                  </span>
                </div>
              ))}
              <div className="ct-summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="ct-summary-row">
                <span>Delivery Fee</span>
                <span className="ct-free-tag">FREE</span>
              </div>
            </div>

            <div className="ct-summary-divider" />

            <div className="ct-summary-total">
              <span>Total</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <button type="button" className="ct-proceed-btn" onClick={handleProceed}>
              {proceedLabel}
              <span className="material-symbols-outlined">{proceedIcon}</span>
            </button>

            {step > 1 && (
              <button
                type="button"
                className="ct-back-btn"
                onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Back
              </button>
            )}

            <div className="ct-trust-badges">
              <div className="ct-trust-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span>
                Safe &amp; Secure Payments
              </div>
              <div className="ct-trust-badge">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>eco</span>
                Eco-friendly Packaging Guaranteed
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { Cart };
