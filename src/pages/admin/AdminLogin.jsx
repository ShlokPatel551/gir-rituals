import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { isAdminLoggedIn, setAdminToken } from "../../lib/adminAuth";
import "../../styles/admin-theme.css";
import "./AdminLogin.css";

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDwoLG26VvHxu4bvmj7FtPYVTgKF6BtQ5kGULcBik2T6F3q-frJfuSnhAud4j1Nk6-TZ7Yfz9rF4oImcH_wjHLcOHSxM7cuWqgca91Yylyi9uFiQvCR_k0qgNPLO4OGyLbSBGyvud7BywxAz2JStojJJaAhsCedbyx6irBEXOOI71652DYUXLoW3PDiwwPsiiPKwoDv2fpEc9eOEYJ8tSKWBARRt-yZ5aEWWfEfct1lmeP7N1EheMGGI9UQRHDbgUD-I3k8vPidTzOP";

function AdminLogin() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState("owner@girrituals.com");
  const [password, setPassword] = useState("password123");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) navigate("/admin", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await api.adminLogin(email, password);
      setAdminToken(token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page hero-pattern">
      <main className="admin-login-card">

        {/* Brand / visual side */}
        <section className="admin-login-brand">
          <div className="admin-login-brand-bg" aria-hidden>
            <img src={HERO_IMAGE} alt="" />
          </div>
          <div className="admin-login-brand-content">
            <div className="admin-brand-logo">
              <span className="material-symbols-outlined admin-brand-logo-icon">
                temp_preferences_custom
              </span>
            </div>
            <h1 className="admin-login-title-xl">Gir Rituals</h1>
            <p className="admin-login-brand-text">
              Secure access to your premium artisanal management dashboard.
            </p>
          </div>
          <div className="admin-brand-deco-ring" aria-hidden />
          <div className="admin-brand-deco-glow" aria-hidden />
        </section>

        {/* Form side */}
        <section className="admin-login-form-col">
          <div className="admin-login-form-inner">
            <div className="admin-mobile-logo">
              <span className="material-symbols-outlined admin-mobile-logo-icon">
                temp_preferences_custom
              </span>
              <span className="admin-mobile-logo-name">Gir Rituals</span>
            </div>

            <header className="admin-login-header">
              <h3 className="admin-login-title-lg">Sign in to admin</h3>
              <p className="admin-login-sub">
                Enter your credentials to access the management suite.
              </p>
            </header>

            <form className="admin-login-form" onSubmit={handleSubmit}>
              {error && <p className="admin-login-error">{error}</p>}

              <div className="admin-field">
                <label htmlFor="admin-email">Email address</label>
                <div className="admin-input-wrap">
                  <span className="material-symbols-outlined admin-input-icon">mail</span>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="admin-field">
                <div className="admin-field-row">
                  <label htmlFor="admin-password">Password</label>
                </div>
                <div className="admin-input-wrap">
                  <span className="material-symbols-outlined admin-input-icon">lock</span>
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="admin-btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="material-symbols-outlined admin-btn-spin">progress_activity</span>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="material-symbols-outlined admin-btn-icon">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}

export { AdminLogin };
