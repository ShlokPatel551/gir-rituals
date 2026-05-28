import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OtpInput } from "../../components/OtpInput";
import {
  DEFAULT_ADMIN,
  completeAdminLogin,
  isAdminLoggedIn,
  maskAdminPhone,
  setAdminPendingLogin,
  validateAdminCredentials
} from "../../lib/adminAuth";
import {
  getResendCooldownSeconds,
  sendOtp,
  verifyOtp
} from "../../lib/otpService";
import "../../styles/admin-theme.css";
import "./AdminLogin.css";
const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDwoLG26VvHxu4bvmj7FtPYVTgKF6BtQ5kGULcBik2T6F3q-frJfuSnhAud4j1Nk6-TZ7Yfz9rF4oImcH_wjHLcOHSxM7cuWqgca91Yylyi9uFiQvCR_k0qgNPLO4OGyLbSBGyvud7BywxAz2JStojJJaAhsCedbyx6irBEXOOI71652DYUXLoW3PDiwwPsiiPKwoDv2fpEc9eOEYJ8tSKWBARRt-yZ5aEWWfEfct1lmeP7N1EheMGGI9UQRHDbgUD-I3k8vPidTzOP";
function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState(DEFAULT_ADMIN.email);
  const [password, setPassword] = useState(DEFAULT_ADMIN.password);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState(null);
  const [resendSec, setResendSec] = useState(0);
  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);
  useEffect(() => {
    if (resendSec <= 0 || step !== "otp") return;
    const t = setInterval(() => {
      setResendSec(
        getResendCooldownSeconds(DEFAULT_ADMIN.phone, DEFAULT_ADMIN.email, "admin_login")
      );
    }, 1e3);
    return () => clearInterval(t);
  }, [resendSec, step]);
  const startOtpStep = () => {
    const result = sendOtp(DEFAULT_ADMIN.phone, DEFAULT_ADMIN.email, "admin_login");
    if (!result.ok) {
      setError(result.error ?? "Could not send OTP");
      return;
    }
    setDemoCode(result.demoCode ?? null);
    setResendSec(getResendCooldownSeconds(DEFAULT_ADMIN.phone, DEFAULT_ADMIN.email, "admin_login"));
    setAdminPendingLogin();
    setStep("otp");
    setError("");
  };
  const handleCredentials = (e) => {
    e.preventDefault();
    setError("");
    if (!validateAdminCredentials(email, password)) {
      setError("Invalid email or password");
      return;
    }
    startOtpStep();
  };
  const handleResend = () => {
    setError("");
    const result = sendOtp(DEFAULT_ADMIN.phone, DEFAULT_ADMIN.email, "admin_login");
    if (result.ok) {
      setDemoCode(result.demoCode ?? null);
      setResendSec(getResendCooldownSeconds(DEFAULT_ADMIN.phone, DEFAULT_ADMIN.email, "admin_login"));
    } else {
      setError(result.error ?? "Could not resend");
    }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    const result = verifyOtp(DEFAULT_ADMIN.phone, DEFAULT_ADMIN.email, "admin_login", otp);
    if (!result.ok) {
      setError(result.error ?? "Invalid OTP");
      setLoading(false);
      return;
    }
    completeAdminLogin();
    navigate("/admin", { replace: true });
  };
  return <div className="admin-login-page hero-pattern">
      <main className="admin-login-card">
        {
    /* Brand / visual side */
  }
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

        {
    /* Form side */
  }
        <section className="admin-login-form-col">
          <div className="admin-login-form-inner">
            {step === "credentials" ? <>
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
                <form className="admin-login-form" onSubmit={handleCredentials}>
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
    onChange={(e) => setEmail(e.target.value)}
    placeholder="name@company.com"
  />
                    </div>
                  </div>
                  <div className="admin-field">
                    <div className="admin-field-row">
                      <label htmlFor="admin-password">Password</label>
                      <span className="admin-forgot-link">Forgot password?</span>
                    </div>
                    <div className="admin-input-wrap">
                      <span className="material-symbols-outlined admin-input-icon">lock</span>
                      <input
    id="admin-password"
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
  />
                    </div>
                  </div>
                  <button type="submit" className="admin-btn-primary">
                    Sign in
                    <span className="material-symbols-outlined admin-btn-icon">arrow_forward</span>
                  </button>
                  <p className="admin-otp-hint">
                    OTP will be sent to your registered phone after password
                  </p>
                </form>
              </> : <div className="admin-otp-section">
                <div className="admin-mobile-logo">
                  <span className="material-symbols-outlined admin-mobile-logo-icon">
                    temp_preferences_custom
                  </span>
                  <span className="admin-mobile-logo-name">Gir Rituals</span>
                </div>

                <header className="admin-login-header">
                  <h2 className="admin-login-title-lg">Two-Factor Authentication</h2>
                  <p className="admin-login-sub">
                    Enter the 6-digit verification code sent to{" "}
                    <strong className="admin-phone-highlight">
                      {maskAdminPhone(DEFAULT_ADMIN.phone)}
                    </strong>
                  </p>
                </header>

                {demoCode && <div className="admin-demo-otp">
                    <span>Demo SMS</span>
                    <code>{demoCode}</code>
                  </div>}

                <form onSubmit={handleVerifyOtp} className="admin-otp-form">
                  {error && <p className="admin-login-error">{error}</p>}

                  <div className="admin-otp-inputs">
                    <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                  </div>

                  <div className="admin-otp-actions">
                    <button
    type="submit"
    className="admin-btn-primary admin-btn-verify"
    disabled={loading || otp.length !== 6}
  >
                      {loading ? <>
                          <span className="material-symbols-outlined admin-btn-spin">
                            progress_activity
                          </span>
                          Authenticating…
                        </> : <>
                          Verify &amp; Enter Panel
                          <span className="material-symbols-outlined admin-btn-icon">login</span>
                        </>}
                    </button>

                    <div className="admin-otp-timer-row">
                      <p className={`admin-timer-text${resendSec <= 0 ? " admin-timer-hidden" : ""}`}>
                        <span className="material-symbols-outlined admin-timer-icon">schedule</span>
                        Resend OTP in{" "}
                        <strong className="admin-timer-count">{resendSec}</strong> seconds
                      </p>
                      <button
    type="button"
    className={`admin-resend-btn${resendSec > 0 ? " admin-resend-disabled" : ""}`}
    onClick={handleResend}
    disabled={resendSec > 0}
  >
                        Resend Code
                      </button>
                    </div>
                  </div>
                </form>

                <footer className="admin-otp-footer">
                  <button
    type="button"
    className="admin-back-link"
    onClick={() => {
      setStep("credentials");
      setOtp("");
      setError("");
    }}
  >
                    <span className="material-symbols-outlined admin-back-link-icon">arrow_back</span>
                    Back to Login
                  </button>
                  <div className="admin-footer-icons">
                    <span
    className="material-symbols-outlined admin-footer-icon"
    title="Support"
  >
                      help_outline
                    </span>
                    <span
    className="material-symbols-outlined admin-footer-icon"
    title="Secure Encryption"
  >
                      security
                    </span>
                  </div>
                </footer>
              </div>}
          </div>
        </section>
      </main>
    </div>;
}
export {
  AdminLogin
};
