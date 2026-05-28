import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "../lib/api";
import { handleGoogleUser, googleEnabled } from "../lib/googleAuth";
import { useApp } from "../context/AppContext";
import "./Login.css";

const googleIcon = (
  <svg className="auth-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function GoogleLoginBtn({ onError, onStart, disabled }) {
  const { login } = useApp();
  const navigate = useNavigate();
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      onStart();
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const info = await res.json();
        const customer = handleGoogleUser(info);
        login(customer);
        navigate("/home");
      } catch {
        onError("Google sign-in failed. Please try again.");
      }
    },
    onError: () => onError("Google sign-in was cancelled or blocked.")
  });
  return (
    <button
      type="button"
      className="auth-google-btn"
      onClick={() => { onError(""); googleLogin(); }}
      disabled={disabled}
    >
      {googleIcon}
      Continue with Google
    </button>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.message;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.login(email.trim(), password);
      login(user, token);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Incorrect email or password. New user? Create an account.");
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("demo@girrituals.com");
    setPassword("Demo@1234");
    setError("");
  }

  return (
    <div className="auth-split-page">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <span className="auth-brand-logo">GIR RITUALS</span>
          <h2 className="auth-brand-headline">Pure A2 dairy,<br />delivered to your door.</h2>
          <p className="auth-brand-sub">
            Gir cows. Bilona ghee. Farm-fresh milk.<br />
            A daily ritual for your family's wellbeing.
          </p>
          <div className="auth-brand-values">
            {[
              { icon: "🐄", label: "100% A2 Milk" },
              { icon: "🌿", label: "No Preservatives" },
              { icon: "🚚", label: "Daily Delivery" },
              { icon: "🫙", label: "Bilona Ghee" }
            ].map((v) => (
              <div key={v.label} className="auth-brand-value">
                <span>{v.icon}</span>
                <p>{v.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <p className="auth-form-logo-mobile">GIR RITUALS</p>
          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-sub">Sign in to continue your daily ritual</p>

          {successMessage && <div className="auth-success-banner">{successMessage}</div>}
          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-pass">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="login-pass"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide" : "Show"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          {googleEnabled
            ? <GoogleLoginBtn
                onError={setError}
                onStart={() => setLoading(true)}
                disabled={loading}
              />
            : <div className="auth-google-disabled">
                <svg className="auth-google-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ccc" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ccc" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#ccc" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ccc" />
                </svg>
                Google login — add VITE_GOOGLE_CLIENT_ID to .env
              </div>
          }

          <button type="button" className="auth-demo-btn" onClick={fillDemo}>
            🌿 Fill demo credentials
          </button>

          <p className="auth-switch-text">
            New to Gir Rituals?{" "}
            <Link to="/register" className="auth-switch-link">Create account</Link>
          </p>

          <Link to="/admin/login" className="auth-admin-link">Admin portal →</Link>
        </div>
      </div>
    </div>
  );
}

export { Login };
