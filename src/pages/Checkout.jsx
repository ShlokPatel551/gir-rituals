import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Checkout.css";

const GST_RATE = 0.05;

const PRODUCT_IMGS = {
  milk:   "https://lh3.googleusercontent.com/aida-public/AB6AXuDUBwAsVrFtBz-ThjfsL4wBtlGs5nkhWQgbrGKAD4I09yAX3lMOPqVJotnKFNC4lR2cC7t6BJ-VhO-BKtcMtISnH6CDjA36vO224abotHkxliKJnqyOoeSmKJA3Jd7-9Zm_7uVAYA1vtjIe6ZBzTpwTi1bgxtOh7lFH2YMxaNHQjknJaxJYUF8FxoDwpmVJ1l60lfkN4R8Ae9o3wulP14SJseRIpXHgkh_15uf00nvdKYMVe9xPORLksOA3uPwRljhPrRDk5kWbBa-K",
  ghee:   "https://lh3.googleusercontent.com/aida-public/AB6AXuCiTmIEx28DBMRj6KXJ0fTF9ImOqxnUJJyBknqmNlhmc5sw8JRMpTjYS0AYkJU3bkMOiWIr78g54IIhA1MZc4GJn9tXMa_W88DN6khO_gwHSi9pXukLWE2xyI3qYh6aT-QOtZd4_1U_EHdTrbkjnYwS_mBeDGOAw2pszut3hlr1ausDueRYx4wQHWF3XvOUpgWrBizIr_5tZOLbTPrqSg079S8WEXp4dvgU9HJpHn5PUW5niqW0AuSnAOPw-P5Pz58MI8XRcc5u9QjJ",
  paneer: "https://lh3.googleusercontent.com/aida-public/AB6AXuAatjBp5DXyWvUZZ4BB_9zx4pERQNU1w3VjAvJuJDoLOdyY9IGaAGC921C5xATSHLlQyf7HnkQNWZVsBIiA2Sf-7HGvB8LEn0ohhFobBJ863tviw017miklgYNuulbmq4QpWg0XtFZiY8DzykMODS2yN56yIJDalRLaXk2qAQSuEK1d-zlangC9RaFhYpYwtaPr0Aw5jUw6RAc3w7OTanhzGTsGV5cCivK1sRS0Zhzu79GRYxzC1CMjlnUAJSyTxdE4ZMQQuiGH2Lk7",
  honey:  "https://lh3.googleusercontent.com/aida-public/AB6AXuBCNOyK7_HTwbAMW4DZ59PdwTo0dg8yTMKRp6go0eBbyTxKZI1VzMpAlAwAb754GeYn7jILXdnHAeNNBG9EJVhRHqQwNI9_tR8LnJ6_nxXjYLzsTyenjB0QUJIk9kyLZgB2sBFmTFCm6H3oxk3frSTOegnTlNJnM0NT6D6gCnqqQpR8u1vDkcuVRZSm-wINzvOmmxsGDRpflXVP68KqVKJJwicJJ36raXQKC3DbVtyr15CsuT59qHpmYvASsXhpiUFRla0_BZ0Qb5MS",
};

const STEPS = ["Order Review", "Delivery", "Payment", "Confirm"];

const PAYMENT_METHODS = [
  { id: "upi",        icon: "smartphone",      label: "UPI" },
  { id: "netbanking", icon: "account_balance", label: "Net Banking" },
  { id: "card",       icon: "credit_card",     label: "Credit / Debit Card" },
];

function imgKey(productId = "") {
  if (productId.includes("ghee"))   return "ghee";
  if (productId.includes("paneer")) return "paneer";
  if (productId.includes("honey"))  return "honey";
  return "milk";
}

function StepIndicator({ step }) {
  return (
    <div className="chk-steps">
      {STEPS.map((label, i) => {
        const num    = i + 1;
        const active = num === step;
        const done   = num < step;
        return (
          <Fragment key={label}>
            <div className="chk-step-group">
              <div className={`chk-step-circle ${active ? "chk-step-circle-active" : done ? "chk-step-circle-done" : ""}`}>
                {done
                  ? <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check</span>
                  : num}
              </div>
              <span className={`chk-step-label ${active ? "chk-step-label-active" : ""}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="chk-step-line" />}
          </Fragment>
        );
      })}
    </div>
  );
}

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, user, products } = useApp();

  const [step,          setStep]          = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const gst        = Math.round(cartTotal * GST_RATE);
  const netPayable = cartTotal + gst;
  const addr       = user?.deliveryAddress ?? {};

  const items = cart.map(c => {
    const p = products.find(x => x.id === c.productId);
    return { productId: c.productId, quantity: c.quantity, name: p?.name ?? c.productId, unit: p?.unit ?? "", price: p?.price ?? 0 };
  });

  const handleConfirm = () => {
    navigate(`/payment?amount=${netPayable}&checkout=1`);
  };

  return (
    <div className="chk-page">
      <StepIndicator step={step} />

      <div className="chk-body">

        {/* ── Step 1: Order Review ── */}
        {step === 1 && (
          <>
            <div className="chk-card">
              <div className="chk-card-hdr">
                <div className="chk-card-hdr-icon">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <h3>Your Order</h3>
              </div>
              <div className="chk-card-body">
                {items.length === 0 ? (
                  <p style={{ color: "#9a8578", fontSize: "0.875rem" }}>Your cart is empty.</p>
                ) : (
                  <div className="chk-items">
                    {items.map(item => (
                      <div key={item.productId} className="chk-item">
                        <div className="chk-item-img">
                          {PRODUCT_IMGS[imgKey(item.productId)]
                            ? <img src={PRODUCT_IMGS[imgKey(item.productId)]} alt={item.name} onError={e => { e.target.style.display = "none"; }} />
                            : "🌿"
                          }
                        </div>
                        <div className="chk-item-info">
                          <p className="chk-item-name">{item.name}</p>
                          <p className="chk-item-sub">{item.quantity} × {item.unit}</p>
                        </div>
                        <span className="chk-item-price">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <hr className="chk-divider" />
                <div className="chk-totals">
                  <div className="chk-total-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                  <div className="chk-total-row"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
                  <div className="chk-total-row"><span>Delivery</span><span style={{ color: "#2e7d32", fontWeight: 700 }}>FREE</span></div>
                  <div className="chk-total-row chk-total-grand"><span>Total</span><span>₹{netPayable.toFixed(2)}</span></div>
                </div>
                <Link to="/cart" className="chk-edit-link">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
                  Edit cart
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Delivery ── */}
        {step === 2 && (
          <div className="chk-card">
            <div className="chk-card-hdr">
              <div className="chk-card-hdr-icon">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <h3>Delivery Details</h3>
            </div>
            <div className="chk-card-body">
              <div className="chk-address">
                <div className="chk-addr-icon">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div className="chk-addr-body">
                  <p className="chk-addr-label">Delivering to</p>
                  <p className="chk-addr-main">{addr.street || "No address on file"}</p>
                  {addr.city && (
                    <p className="chk-addr-sub">{addr.city}, {addr.state} – {addr.pinCode}</p>
                  )}
                  <Link to="/profile/settings" className="chk-addr-edit">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                    Edit address
                  </Link>
                </div>
              </div>

              <div className="chk-info-note">
                <span className="material-symbols-outlined">schedule</span>
                <span>Expected delivery: <strong>Tomorrow, 6:00 AM – 8:00 AM</strong>. Our partner will call 30 min before arrival.</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Payment ── */}
        {step === 3 && (
          <div className="chk-card">
            <div className="chk-card-hdr">
              <div className="chk-card-hdr-icon">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3>Payment Method</h3>
            </div>
            <div className="chk-card-body">
              <div className="chk-pay-options">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`chk-pay-option ${paymentMethod === m.id ? "chk-pay-option-active" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="chk-pay-radio"
                    />
                    <div className="chk-pay-icon">
                      <span className="material-symbols-outlined">{m.icon}</span>
                    </div>
                    <span className="chk-pay-label">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirm ── */}
        {step === 4 && (
          <div className="chk-card">
            <div className="chk-card-hdr">
              <div className="chk-card-hdr-icon">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <h3>Order Summary</h3>
            </div>
            <div className="chk-card-body">
              <div className="chk-totals">
                <div className="chk-total-row"><span>Items ({items.length})</span><span>₹{cartTotal.toFixed(2)}</span></div>
                <div className="chk-total-row"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
                <div className="chk-total-row"><span>Delivery to</span><span>{addr.city || "—"}</span></div>
                <div className="chk-total-row"><span>Payment via</span><span>{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span></div>
                <div className="chk-total-row chk-total-grand"><span>Net Payable</span><span>₹{netPayable.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom Summary + Actions ── */}
        {step < 4 && (
          <div className="chk-summary-card">
            <p className="chk-summary-title">Order Total</p>
            <div className="chk-summary-rows">
              <div className="chk-summary-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
              <div className="chk-summary-row"><span>GST</span><span>₹{gst.toFixed(2)}</span></div>
            </div>
            <div className="chk-summary-total"><span>Total</span><span>₹{netPayable.toFixed(2)}</span></div>
          </div>
        )}

        <div className="chk-actions">
          {step < 4 ? (
            <button type="button" className="chk-btn-primary" onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button type="button" className="chk-btn-primary" onClick={handleConfirm}>
              <span className="material-symbols-outlined">lock</span>
              Confirm &amp; Pay ₹{netPayable.toFixed(2)}
            </button>
          )}

          {step > 1 && (
            <button type="button" className="chk-btn-secondary" onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>
          )}

          <p className="chk-secure-note">
            <span className="material-symbols-outlined">verified_user</span>
            256-bit SSL encrypted · GIR RITUALS never stores card details
          </p>
        </div>
      </div>
    </div>
  );
}

export { Checkout };
