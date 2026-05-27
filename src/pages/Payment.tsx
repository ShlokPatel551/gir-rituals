import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const GST_RATE = 0.05;

export function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { payBill, walletBalance, paymentMethods } = useApp();
  const amount = Number(searchParams.get('amount') || 0);
  const billId = searchParams.get('billId');
  const [processing, setProcessing] = useState(false);
  const [simulateFail, setSimulateFail] = useState(false);
  const [method, setMethod] = useState<string>(
    paymentMethods.find((m) => m.isDefault)?.id ?? 'upi-manual',
  );
  const [useWallet, setUseWallet] = useState(false);
  const [upiId, setUpiId] = useState('demo@upi');

  const gst = Math.round(amount * GST_RATE);
  const subtotal = amount;
  const walletApplied = useWallet ? Math.min(walletBalance, subtotal + gst) : 0;
  const netPayable = Math.max(0, subtotal + gst - walletApplied);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      if (simulateFail) {
        navigate('/payment/failure?amount=' + netPayable);
      } else {
        if (billId) payBill(billId, walletApplied);
        navigate('/payment/success?amount=' + netPayable + '&orderId=ORD-' + Date.now().toString().slice(-6));
      }
      setProcessing(false);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem', minHeight: '100vh' }}>
      <h1 className="page-title">Payment</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Order Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
          <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span>GST (5%)</span><span>₹{gst.toFixed(2)}</span>
        </div>
        {walletApplied > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', color: 'var(--green-700)', fontSize: '0.9rem' }}>
            <span>Wallet credit applied</span><span>− ₹{walletApplied.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 700, fontSize: '1.1rem' }}>
          <span>Net Payable</span><span>₹{netPayable.toFixed(2)}</span>
        </div>
      </div>

      {walletBalance > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} />
            <div>
              <strong>Use Wallet Balance</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Available: ₹{walletBalance.toFixed(2)}</p>
            </div>
          </label>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Payment Method</h3>
        {paymentMethods.map((pm) => (
          <label key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', cursor: 'pointer' }}>
            <input type="radio" name="pay" value={pm.id} checked={method === pm.id} onChange={() => setMethod(pm.id)} />
            <span>{pm.label}</span>
            {pm.isDefault && <span className="badge badge-delivered" style={{ fontSize: '0.7rem' }}>Default</span>}
          </label>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', cursor: 'pointer' }}>
          <input type="radio" name="pay" value="upi-manual" checked={method === 'upi-manual'} onChange={() => setMethod('upi-manual')} />
          <span>Enter UPI ID</span>
        </label>
        {method === 'upi-manual' && (
          <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" style={{ marginTop: '0.5rem' }} />
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', cursor: 'pointer' }}>
          <input type="radio" name="pay" value="netbanking" checked={method === 'netbanking'} onChange={() => setMethod('netbanking')} />
          <span>Net Banking</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', cursor: 'pointer' }}>
          <input type="radio" name="pay" value="paymonthly" checked={method === 'paymonthly'} onChange={() => setMethod('paymonthly')} />
          <span>Pay Monthly (Add to monthly bill)</span>
        </label>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <input type="checkbox" checked={simulateFail} onChange={(e) => setSimulateFail(e.target.checked)} />
        Simulate payment failure (demo)
      </label>

      <button type="button" className="btn btn-primary" onClick={handlePay} disabled={processing} style={{ width: '100%' }}>
        {processing ? 'Processing…' : `Pay ₹${netPayable.toFixed(2)}`}
      </button>
      <Link to="/cart" className="btn btn-ghost" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem' }}>Cancel</Link>
    </div>
  );
}

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');

  return (
    <div className="payment-success">
      <div className="check">✓</div>
      <h1>Payment Successful</h1>
      <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
        Order {orderId} · ₹{amount} paid
      </p>
      <p style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>Schedule, bills, and orders updated. WhatsApp confirmation sent.</p>
      <Link to="/home" className="btn btn-primary" style={{ marginBottom: '0.5rem', maxWidth: 280 }}>Go to Home</Link>
      <Link to="/schedule" className="btn btn-secondary" style={{ maxWidth: 280 }}>View Schedule</Link>
    </div>
  );
}

export function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount');

  return (
    <div className="payment-failure">
      <div style={{ fontSize: '4rem' }}>✕</div>
      <h1>Payment Failed</h1>
      <p style={{ margin: '1rem 0' }}>Could not process ₹{amount}. Your cart is preserved.</p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Reason: Bank declined / timeout. Please try again.</p>
      <Link to={`/payment?amount=${amount}`} className="btn btn-primary" style={{ marginBottom: '0.5rem', maxWidth: 280 }}>Retry Payment</Link>
      <Link to="/checkout" className="btn btn-secondary" style={{ marginBottom: '0.5rem', maxWidth: 280 }}>Change Method</Link>
      <Link to="/contact" className="btn btn-ghost" style={{ maxWidth: 280 }}>Request Refund / Store Credit</Link>
    </div>
  );
}
