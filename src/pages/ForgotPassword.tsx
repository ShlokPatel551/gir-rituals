import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { findCustomerByEmail } from '../lib/customerStore';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const customer = findCustomerByEmail(email.trim());
    if (!customer) {
      setError('No account found with this email');
      return;
    }
    if (password.length < 8 || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError('Password needs 8+ chars, a number, and a special character');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    sessionStorage.setItem('gir_reset_password', password);
    navigate(
      `/otp?purpose=reset_password&phone=${encodeURIComponent(customer.phone)}&email=${encodeURIComponent(customer.email)}`,
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>Forgot Password</h1>
        <p>We&apos;ll send an OTP to verify it&apos;s you</p>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'var(--md-error)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Registered email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Send OTP</button>
      </form>
      <p className="auth-footer">
        <Link to="/login">← Back to login</Link>
      </p>
    </div>
  );
}
