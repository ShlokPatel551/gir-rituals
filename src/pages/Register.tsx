import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { emailExists, savePendingRegistration } from '../lib/customerStore';

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    deliveryStreet: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPin: '',
    sameAsBilling: true,
  });

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (): boolean => {
    setError('');
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError('Name is required');
        return false;
      }
      if (!form.email.includes('@')) {
        setError('Enter a valid email');
        return false;
      }
      if (emailExists(form.email)) {
        setError('Email already registered. Please login.');
        return false;
      }
      if (form.password.length < 8 || !/\d/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
        setError('Password needs 8+ chars, a number, and a special character');
        return false;
      }
      if (!/^[0-9]{10}$/.test(form.phone)) {
        setError('Phone must be 10 digits');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    savePendingRegistration({
      user: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        billingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          pinCode: form.pinCode,
        },
        deliveryAddress: form.sameAsBilling
          ? { street: form.street, city: form.city, state: form.state, pinCode: form.pinCode }
          : {
              street: form.deliveryStreet,
              city: form.deliveryCity,
              state: form.deliveryState,
              pinCode: form.deliveryPin,
            },
      },
      password: form.password,
    });

    navigate('/otp?purpose=register');
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>Create Account</h1>
        <p>Step {step} of 3</p>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'var(--md-error)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        {step === 1 && (
          <>
            <div className="form-group">
              <label>First Name</label>
              <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password (min 8 chars, number & special)</label>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone (10 digits)</label>
              <input required pattern="[0-9]{10}" value={form.phone} onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Billing Address</h3>
            <div className="form-group"><label>Street</label><input required value={form.street} onChange={(e) => update('street', e.target.value)} /></div>
            <div className="form-group"><label>City</label><input required value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
            <div className="form-group"><label>State</label><input required value={form.state} onChange={(e) => update('state', e.target.value)} /></div>
            <div className="form-group"><label>PIN Code</label><input required value={form.pinCode} onChange={(e) => update('pinCode', e.target.value)} /></div>
          </>
        )}
        {step === 3 && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={form.sameAsBilling} onChange={(e) => update('sameAsBilling', e.target.checked)} />
              Same as billing address
            </label>
            {!form.sameAsBilling && (
              <>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Delivery Address</h3>
                <div className="form-group"><label>Street</label><input required value={form.deliveryStreet} onChange={(e) => update('deliveryStreet', e.target.value)} /></div>
                <div className="form-group"><label>City</label><input required value={form.deliveryCity} onChange={(e) => update('deliveryCity', e.target.value)} /></div>
                <div className="form-group"><label>State</label><input required value={form.deliveryState} onChange={(e) => update('deliveryState', e.target.value)} /></div>
                <div className="form-group"><label>PIN Code</label><input required value={form.deliveryPin} onChange={(e) => update('deliveryPin', e.target.value)} /></div>
              </>
            )}
          </>
        )}
        <button type="submit" className="btn btn-primary">{step < 3 ? 'Continue' : 'Send OTP & Verify'}</button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
