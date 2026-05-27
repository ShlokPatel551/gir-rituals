import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authenticateCustomer } from '../lib/customerStore';
import { useApp } from '../context/AppContext';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const successMessage = (location.state as { message?: string } | null)?.message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const customer = authenticateCustomer(email.trim(), password);
    if (!customer) {
      setError('Invalid email or password. Register if you are new.');
      return;
    }

    login(customer);
    navigate('/home');
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1>GIR RITUALS</h1>
        <p>Welcome back to your daily ritual</p>
      </div>
      {successMessage && (
        <p className="card" style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--md-primary)' }}>
          {successMessage}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'var(--md-error)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none' }}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <p style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--md-primary)' }}>Forgot Password?</Link>
        </p>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <p className="auth-footer">
        New here? <Link to="/register">Create Account</Link>
      </p>
      <p className="auth-footer" style={{ marginTop: '0.5rem' }}>
        <Link to="/admin/login" style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>Admin portal →</Link>
      </p>
    </div>
  );
}
