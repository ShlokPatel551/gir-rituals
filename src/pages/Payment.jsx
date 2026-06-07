import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../lib/api";

const GST_RATE = 0.05;

const RAZORPAY_ENABLED = !!import.meta.env.VITE_RAZORPAY_KEY_ID;

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id  = 'razorpay-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, walletBalance, paymentMethods, payBill } = useApp();

  const amount = Number(searchParams.get("amount") || 0);
  const billId = searchParams.get("billId");

  const [processing, setProcessing] = useState(false);
  const [error, setError]           = useState("");
  const [method, setMethod]         = useState(
    paymentMethods.find((m) => m.isDefault)?.id ?? "razorpay"
  );
  const [useWallet, setUseWallet] = useState(false);

  const gst          = Math.round(amount * GST_RATE);
  const subtotal     = amount;
  const walletApplied = useWallet ? Math.min(walletBalance, subtotal + gst) : 0;
  const netPayable   = Math.max(0, subtotal + gst - walletApplied);

  const handlePay = async () => {
    setError("");
    setProcessing(true);

    try {
      // If entire amount covered by wallet, skip Razorpay
      if (netPayable === 0) {
        if (billId) await payBill(billId);
        navigate(`/payment/success?amount=0&orderId=WALLET-${Date.now().toString().slice(-6)}`);
        return;
      }

      if (!RAZORPAY_ENABLED) {
        // Dev fallback when Razorpay keys are not configured
        if (billId) await payBill(billId);
        navigate(`/payment/success?amount=${netPayable}&orderId=DEV-${Date.now().toString().slice(-6)}`);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay. Check your internet connection.');

      // Create order on backend
      const orderData = await api.createPaymentOrder(netPayable, billId);

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      orderData.amount,
          currency:    orderData.currency,
          order_id:    orderData.orderId,
          name:        'Gir Rituals',
          description: billId ? `Bill payment${billId ? ` — ${billId}` : ''}` : 'Order payment',
          prefill: {
            name:    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
            email:   user?.email ?? '',
            contact: user?.phone ?? '',
          },
          theme: { color: '#4a7c59' },
          handler: async (response) => {
            try {
              await api.verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                billId,
                walletApplied,
              });
              navigate(`/payment/success?amount=${netPayable}&orderId=${response.razorpay_payment_id}`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        });
        rzp.on('payment.failed', (resp) => {
          reject(new Error(resp.error?.description || 'Payment failed'));
        });
        rzp.open();
      });
    } catch (err) {
      if (err.message === 'Payment cancelled') {
        setError('Payment was cancelled.');
      } else {
        navigate(`/payment/failure?amount=${netPayable}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem", minHeight: "100vh" }}>
      <h1 className="page-title">Payment</h1>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Order Summary</h3>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid var(--border)" }}>
          <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          <span>GST (5%)</span><span>₹{gst.toFixed(2)}</span>
        </div>
        {walletApplied > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid var(--border)", color: "var(--green-700)", fontSize: "0.9rem" }}>
            <span>Wallet credit applied</span><span>− ₹{walletApplied.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontWeight: 700, fontSize: "1.1rem" }}>
          <span>Net Payable</span><span>₹{netPayable.toFixed(2)}</span>
        </div>
      </div>

      {walletBalance > 0 && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} />
            <div>
              <strong>Use Wallet Balance</strong>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>Available: ₹{walletBalance.toFixed(2)}</p>
            </div>
          </label>
        </div>
      )}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Payment Method</h3>
        {paymentMethods.map((pm) => (
          <label key={pm.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", cursor: "pointer" }}>
            <input type="radio" name="pay" value={pm.id} checked={method === pm.id} onChange={() => setMethod(pm.id)} />
            <span>{pm.label}</span>
            {pm.isDefault && <span className="badge badge-delivered" style={{ fontSize: "0.7rem" }}>Default</span>}
          </label>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", cursor: "pointer" }}>
          <input type="radio" name="pay" value="razorpay" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} />
          <span>UPI / Cards / Net Banking (Razorpay)</span>
        </label>
      </div>

      {error && (
        <p style={{ color: "var(--error)", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>
      )}

      <button type="button" className="btn btn-primary" onClick={handlePay} disabled={processing} style={{ width: "100%" }}>
        {processing ? "Processing…" : netPayable === 0 ? "Pay from Wallet" : `Pay ₹${netPayable.toFixed(2)}`}
      </button>
      <Link to="/cart" className="btn btn-ghost" style={{ display: "block", textAlign: "center", marginTop: "0.75rem" }}>Cancel</Link>
    </div>
  );
}

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const amount  = searchParams.get("amount");
  const orderId = searchParams.get("orderId");
  return (
    <div className="payment-success">
      <div className="check">✓</div>
      <h1>Payment Successful</h1>
      <p style={{ margin: "1rem 0", color: "var(--text-muted)" }}>
        {orderId} · ₹{amount} paid
      </p>
      <p style={{ fontSize: "0.9rem", marginBottom: "2rem" }}>Bills and schedule updated. Confirmation sent to your email and WhatsApp.</p>
      <Link to="/home" className="btn btn-primary" style={{ marginBottom: "0.5rem", maxWidth: 280 }}>Go to Home</Link>
      <Link to="/schedule" className="btn btn-secondary" style={{ maxWidth: 280 }}>View Schedule</Link>
    </div>
  );
}

function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");
  return (
    <div className="payment-failure">
      <div style={{ fontSize: "4rem" }}>✕</div>
      <h1>Payment Failed</h1>
      <p style={{ margin: "1rem 0" }}>Could not process ₹{amount}. Your cart is preserved.</p>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>Please try again or use a different payment method.</p>
      <Link to={`/payment?amount=${amount}`} className="btn btn-primary" style={{ marginBottom: "0.5rem", maxWidth: 280 }}>Retry Payment</Link>
      <Link to="/checkout" className="btn btn-secondary" style={{ marginBottom: "0.5rem", maxWidth: 280 }}>Change Method</Link>
      <Link to="/contact" className="btn btn-ghost" style={{ maxWidth: 280 }}>Request Refund / Store Credit</Link>
    </div>
  );
}

export { Payment, PaymentFailure, PaymentSuccess };
