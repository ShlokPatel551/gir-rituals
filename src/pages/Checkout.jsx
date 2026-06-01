import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
const GST_RATE = 0.05;
function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, user, products } = useApp();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [promo, setPromo] = useState("");
  const gst = Math.round(cartTotal * GST_RATE);
  const netPayable = cartTotal + gst;
  const steps = ["Order Review", "Delivery Address", "Payment Method", "Order Summary"];
  const handleConfirm = () => {
    navigate(`/payment?amount=${netPayable}&checkout=1`);
  };
  return <div style={{ maxWidth: 480, margin: "0 auto", padding: "1rem" }}>
      <h1 className="page-title">Checkout</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>Step {step} of 4 — {steps[step - 1]}</p>

      {step === 1 && <div className="card">
          {cart.map((item) => {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return null;
    return <div key={item.productId} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                {p.name} × {item.quantity} — ₹{p.price * item.quantity}
              </div>;
  })}
          <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
          </div>
          <p style={{ fontWeight: 700, marginTop: "0.5rem", fontSize: "1.1rem" }}>Total: ₹{(cartTotal + gst).toFixed(2)}</p>
          <Link to="/cart" style={{ fontSize: "0.9rem", color: "var(--green-700)" }}>Edit cart</Link>
        </div>}

      {step === 2 && <div className="card">
          <p>{user.deliveryAddress.street}</p>
          <p>{user.deliveryAddress.city}, {user.deliveryAddress.state} {user.deliveryAddress.pinCode}</p>
        </div>}

      {step === 3 && <div className="card">
          {["upi", "netbanking", "card"].map((m) => <label key={m} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", cursor: "pointer" }}>
              <input type="radio" name="pay" value={m} checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
              {m === "upi" && "\u{1F4F2} UPI"}
              {m === "netbanking" && "\u{1F3E6} Net Banking"}
              {m === "card" && "\u{1F4B3} Credit / Debit Card"}
            </label>)}
          <div className="form-group" style={{ marginTop: "0.75rem" }}>
            <label>Promo code</label>
            <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Enter promo code" />
          </div>
        </div>}

      {step === 4 && <div className="card">
          <p><strong>Items:</strong> {cart.length} product(s)</p>
          <p><strong>Delivery to:</strong> {user.deliveryAddress.street}, {user.deliveryAddress.city}</p>
          <p><strong>Payment:</strong> {paymentMethod === "upi" ? "UPI" : paymentMethod === "netbanking" ? "Net Banking" : "Credit/Debit Card"}</p>
          <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
          </div>
          <p style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.5rem" }}>Net Payable: ₹{netPayable.toFixed(2)}</p>
        </div>}

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        {step > 1 && <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 4 ? <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(step + 1)}>Continue</button> : <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>Confirm & Pay</button>}
      </div>
    </div>;
}
export {
  Checkout
};
