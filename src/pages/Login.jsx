import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { api } from "../lib/api";
import { handleGoogleUser, googleEnabled } from "../lib/googleAuth";
import { useApp } from "../context/AppContext";
import "./Login.css";

const APPLE_CLIENT_ID   = import.meta.env.VITE_APPLE_CLIENT_ID   || null;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin;
const appleEnabled = !!APPLE_CLIENT_ID;

const LIFESTYLE_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBE-YdOuzgGXDtyegxFdlxAp_sUhFmZlVt5Tene_qt6FlnmlLV2BHuHaiZxGy0fF4gVeq5rmWfLFT7mFmhqlzp8QCZR_KEwqeNp5HrP9PuAvmxWO5zfbuSW2XCwEqRSEY9HjRLZMmzRYCZqbUETZFo-Yj6ixDWJ4pbbWqZnYCVphKD5Q0oUMkx7jnnr-2bfeoj4PW0726hURyaGP0dRp9SZg43KmM-pEzyO1TPeDd5kKf6Hy3Vp9Oi_F7YrDcmVr5rWnM-cYMbmV1_8";

const TESTIMONIALS = [
  {
    quote:
      "The ritual of starting my morning with Gir Rituals ghee has transformed my wellness journey. Truly the gold standard.",
    author: "Ananya S., Wellness Consultant",
    stars: true,
  },
  {
    quote:
      "Pure, ethical, and delivered with such elegance. My family has never tasted dairy this authentic.",
    author: "Dr. Rohan Mehra, Nutritionist",
    stars: false,
  },
];

const GoogleSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05 1.61-3.21 1.61-1.12 0-1.5-.68-2.84-.68-1.35 0-1.78.65-2.84.68-1.11.03-2.23-.71-3.21-1.61C2.95 18.43 1.89 15.45 1.89 12.55c0-4.66 2.84-7.11 5.54-7.11 1.39 0 2.52.83 3.37.83.84 0 2.03-.83 3.39-.83 2.14 0 4.14 1.17 5.09 3.01-4.22 1.68-3.53 7.39.61 9.04-.61 1.41-1.45 2.91-2.84 3.79zM12.03 5.4c-.06-1.95 1.5-3.62 3.28-3.78.21 2.08-1.92 3.77-3.28 3.78z" />
  </svg>
);

function GoogleLoginBtn({ onError, onStart, onFinish, disabled }) {
  const { login } = useApp();
  const navigate = useNavigate();
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      onStart();
      try {
        const { token, user } = await handleGoogleUser(tokenResponse);
        login(user, token);
        navigate("/home");
      } catch {
        onError("Google sign-in failed. Please try again.");
        onFinish();
      }
    },
    onError: () => { onError("Google sign-in was cancelled or blocked."); onFinish(); },
  });

  if (!googleEnabled) {
    return (
      <button
        type="button"
        className="lr-social-btn"
        onClick={() => onError("Add VITE_GOOGLE_CLIENT_ID to .env to enable Google login.")}
        disabled={disabled}
      >
        <GoogleSvg /> Google
      </button>
    );
  }

  return (
    <button
      type="button"
      className="lr-social-btn"
      onClick={() => { onError(""); googleLogin(); }}
      disabled={disabled}
    >
      <GoogleSvg /> Google
    </button>
  );
}

function AppleLoginBtn({ onError, onStart, onFinish, disabled }) {
  const { login } = useApp();
  const navigate = useNavigate();

  async function handleApple() {
    if (!appleEnabled) {
      onError("Add VITE_APPLE_CLIENT_ID to .env to enable Apple login.");
      return;
    }
    onError("");
    onStart();
    try {
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: APPLE_REDIRECT_URI,
        usePopup: true,
      });
      const response = await window.AppleID.auth.signIn();
      const { authorization, user: appleUser } = response;
      const firstName = appleUser?.name?.firstName || "";
      const lastName  = appleUser?.name?.lastName  || "";
      const { token, user } = await api.appleAuth(
        authorization.id_token,
        firstName,
        lastName,
        appleUser?.email || ""
      );
      login(user, token);
      navigate("/home");
    } catch (err) {
      if (err?.error !== "popup_closed_by_user") {
        onError("Apple sign-in failed. Please try again.");
      }
      onFinish();
    }
  }

  return (
    <button
      type="button"
      className="lr-social-btn"
      onClick={handleApple}
      disabled={disabled}
    >
      <AppleSvg /> Apple
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
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);

  // Mouse parallax on testimonial cards
  useEffect(() => {
    const handleMouseMove = (e) => {
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;
      if (card1Ref.current)
        card1Ref.current.style.transform = `translate(${mx * 5}px, ${my * 5}px)`;
      if (card2Ref.current)
        card2Ref.current.style.transform = `translate(${mx * 10}px, ${my * 10}px)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.login(email.trim(), password, rememberMe);
      login(user, token);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Incorrect email or password.");
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("demo@girrituals.com");
    setPassword("Demo@1234");
    setError("");
  }

  return (
    <main className="lr-page">

      {/* ── LEFT: Branding ── */}
      <section className="lr-brand">
        <div className="lr-brand-bg">
          <img src={LIFESTYLE_IMG} alt="Sacred Gir Dairy" />
          <div className="lr-brand-bg-overlay" />
        </div>

        <div className="lr-brand-content">
          <div className="lr-brand-top">
            <h1>Gir Rituals</h1>
            <p>The Sacred Alchemy of Purity</p>
          </div>

          <div className="lr-testimonials">
            <div className="lr-card" ref={card1Ref}>
              <div className="lr-card-stars">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20, color: "#e9c176" }}>stars</span>
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 16, color: "#e9c176" }}>star</span>
                ))}
              </div>
              <blockquote>"{TESTIMONIALS[0].quote}"</blockquote>
              <cite>— {TESTIMONIALS[0].author}</cite>
            </div>

            <div className="lr-card" ref={card2Ref}>
              <blockquote>"{TESTIMONIALS[1].quote}"</blockquote>
              <cite>— {TESTIMONIALS[1].author}</cite>
            </div>
          </div>

          <div className="lr-badges">
            {["A2 Certified", "Slow Churned", "Vedic Process"].map(b => (
              <span key={b} className="lr-badge">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIGHT: Form ── */}
      <section className="lr-form-panel">
        <div className="lr-form-inner">

          <p className="lr-mobile-brand">Gir Rituals</p>

          <header className="lr-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access your ritual sanctuary.</p>
          </header>

          {successMessage && <div className="lr-success">{successMessage}</div>}
          {error && <div className="lr-error">{error}</div>}

          <form className="lr-form" onSubmit={handleSubmit}>
            {/* Floating email */}
            <div className="lr-field">
              <input
                id="lr-email"
                type="email"
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label htmlFor="lr-email">Email Address</label>
            </div>

            {/* Floating password */}
            <div className="lr-field">
              <input
                id="lr-password"
                type={showPass ? "text" : "password"}
                placeholder=" "
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <label htmlFor="lr-password">Password</label>
              <button
                type="button"
                className="lr-field-eye"
                onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined">
                  {showPass ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <div className="lr-form-row">
              <label className="lr-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="lr-forgot">Forgot Password?</Link>
            </div>

            <button type="submit" className="lr-submit" disabled={loading}>
              {loading ? "Signing in…" : "Login to Account"}
            </button>
          </form>

          <div className="lr-divider">
            <span>Or Continue With</span>
          </div>

          <div className="lr-socials">
            <GoogleLoginBtn
              onError={setError}
              onStart={() => { setError(""); setLoading(true); }}
              onFinish={() => setLoading(false)}
              disabled={loading}
            />
            <AppleLoginBtn
              onError={setError}
              onStart={() => { setError(""); setLoading(true); }}
              onFinish={() => setLoading(false)}
              disabled={loading}
            />
          </div>

          <button type="button" className="lr-demo-btn" onClick={fillDemo}>
            🌿 Fill demo credentials
          </button>

          <footer className="lr-footer">
            <p>
              New to the Ritual?{" "}
              <Link to="/register">Create an Account</Link>
            </p>
            <Link to="/admin/login" className="lr-admin-link">Admin portal →</Link>
          </footer>

        </div>
      </section>
    </main>
  );
}

export { Login };
