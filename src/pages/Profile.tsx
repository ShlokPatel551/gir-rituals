import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authenticateCustomer } from '../lib/customerStore';
import { useApp } from '../context/AppContext';

export function Profile() {
  const { user, logout, walletBalance } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 0.75rem' }}>
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <strong>{user.firstName} {user.lastName}</strong>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Client ID: {user.clientId}</p>
        {walletBalance > 0 && (
          <p style={{ color: 'var(--green-700)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>
            💳 Wallet: ₹{walletBalance.toFixed(2)}
          </p>
        )}
      </div>

      <Link to="/profile/settings" className="card" style={{ display: 'block', marginBottom: '0.75rem' }}>Account Settings →</Link>
      <Link to="/profile/feedback" className="card" style={{ display: 'block', marginBottom: '0.75rem' }}>Ritual Experience (Feedback) →</Link>
      <button type="button" className="btn btn-danger" style={{ width: '100%' }} onClick={handleLogout}>Logout</button>
    </div>
  );
}

export function AccountSettings() {
  const { user, paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [newMethodLabel, setNewMethodLabel] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (!authenticateCustomer(user.email, currentPass)) {
      setPassError('Current password is incorrect');
      return;
    }
    if (newPass.length < 8 || !/\d/.test(newPass) || !/[^A-Za-z0-9]/.test(newPass)) {
      setPassError('New password needs 8+ chars, a number, and a special character');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match');
      return;
    }

    sessionStorage.setItem('gir_change_password', newPass);
    navigate(
      `/otp?purpose=change_password&phone=${encodeURIComponent(user.phone)}&email=${encodeURIComponent(user.email)}`,
    );
  };

  const handleAddMethod = () => {
    if (!newMethodLabel.trim()) return;
    addPaymentMethod({ type: newMethodType, label: newMethodLabel.trim(), isDefault: false });
    setNewMethodLabel('');
    setShowAddMethod(false);
  };

  return (
    <div>
      <Link to="/profile" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Profile</Link>
      <h1 className="page-title">Account Settings</h1>
      {successMessage && (
        <p className="card" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--md-primary)' }}>
          {successMessage}
        </p>
      )}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Personal Info</h3>
        <div className="form-group"><label>Name</label><input defaultValue={`${user.firstName} ${user.lastName}`} /></div>
        <div className="form-group"><label>Email</label><input defaultValue={user.email} readOnly /></div>
        <div className="form-group"><label>Phone</label><input defaultValue={user.phone} /></div>
        <button type="button" className="btn btn-primary">Save Changes</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Change Password</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)', marginBottom: '1rem' }}>
          OTP will be sent to your phone and email before the new password is saved.
        </p>
        <form onSubmit={handleChangePassword}>
          {passError && <p style={{ color: 'var(--md-error)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{passError}</p>}
          <div className="form-group"><label>Current password</label><input type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} /></div>
          <div className="form-group"><label>New password</label><input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} /></div>
          <div className="form-group"><label>Confirm new password</label><input type="password" required value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} /></div>
          <button type="submit" className="btn btn-secondary">Send OTP & Update</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Billing Address</h3>
        <div className="form-group"><label>Street</label><input defaultValue={user.billingAddress.street} /></div>
        <div className="form-group"><label>City</label><input defaultValue={user.billingAddress.city} /></div>
        <div className="form-group"><label>State</label><input defaultValue={user.billingAddress.state} /></div>
        <div className="form-group"><label>PIN Code</label><input defaultValue={user.billingAddress.pinCode} /></div>
        <button type="button" className="btn btn-secondary">Save Billing Address</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Delivery Address</h3>
        <div className="form-group"><label>Street</label><input defaultValue={user.deliveryAddress.street} /></div>
        <div className="form-group"><label>City</label><input defaultValue={user.deliveryAddress.city} /></div>
        <div className="form-group"><label>State</label><input defaultValue={user.deliveryAddress.state} /></div>
        <div className="form-group"><label>PIN Code</label><input defaultValue={user.deliveryAddress.pinCode} /></div>
        <button type="button" className="btn btn-secondary">Save Delivery Address</button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>Payment Methods</h3>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setShowAddMethod((v) => !v)}>
            + Add
          </button>
        </div>

        {paymentMethods.map((pm) => (
          <div key={pm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ flex: 1 }}>
              {pm.type === 'upi' ? '📲' : pm.type === 'card' ? '💳' : '🏦'} {pm.label}
            </span>
            {pm.isDefault && <span className="badge badge-delivered" style={{ fontSize: '0.7rem' }}>Default</span>}
            {!pm.isDefault && (
              <button type="button" style={{ fontSize: '0.75rem', background: 'none', color: 'var(--green-700)', border: 'none', cursor: 'pointer' }} onClick={() => setDefaultPaymentMethod(pm.id)}>
                Set Default
              </button>
            )}
            <button type="button" style={{ fontSize: '0.75rem', background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer' }} onClick={() => removePaymentMethod(pm.id)}>
              Remove
            </button>
          </div>
        ))}

        {showAddMethod && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--green-50)', borderRadius: 8 }}>
            <div className="form-group">
              <label>Type</label>
              <select value={newMethodType} onChange={(e) => setNewMethodType(e.target.value as 'upi' | 'card' | 'netbanking')}>
                <option value="upi">UPI</option>
                <option value="card">Credit / Debit Card</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
            <div className="form-group">
              <label>{newMethodType === 'upi' ? 'UPI ID' : newMethodType === 'card' ? 'Card number (last 4)' : 'Bank name'}</label>
              <input value={newMethodLabel} onChange={(e) => setNewMethodLabel(e.target.value)} placeholder={newMethodType === 'upi' ? 'yourname@upi' : ''} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-primary" onClick={handleAddMethod}>Save</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAddMethod(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Feedback() {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="empty-state">
        <div className="emoji">🙏</div>
        <h2>Thank you!</h2>
        <p>Your feedback helps us improve your ritual.</p>
        <Link to="/profile" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Profile</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/profile" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>← Profile</Link>
      <h1 className="page-title">Ritual Experience</h1>
      <div className="card">
        <p style={{ marginBottom: '0.75rem' }}>Rate your experience</p>
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} style={{ background: 'none', fontSize: '1.5rem' }}>{n <= rating ? '★' : '☆'}</button>
          ))}
        </div>
        <textarea rows={4} placeholder="Tell us more…" style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)' }} />
        <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setSubmitted(true)}>Submit</button>
      </div>
    </div>
  );
}
