import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { emailExists, savePendingRegistration } from "../lib/customerStore";
import { handleGoogleUser, googleEnabled } from "../lib/googleAuth";
import { useApp } from "../context/AppContext";
import "./Login.css";
import "./Register.css";
const STEPS = [
  { num: 1, label: "Personal", icon: "\u{1F464}" },
  { num: 2, label: "Billing", icon: "\u{1F3E0}" },
  { num: 3, label: "Delivery", icon: "\u{1F69A}" }
];
const INITIAL = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  street: "",
  city: "",
  state: "",
  pinCode: "",
  deliveryStreet: "",
  deliveryCity: "",
  deliveryState: "",
  deliveryPin: "",
  sameAsBilling: true
};
function Register() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const googleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const info = await res.json();
        const customer = handleGoogleUser(info);
        login(customer);
        navigate("/home");
      } catch {
        setError("Google sign-up failed. Please try again.");
        setGLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-up was cancelled or blocked.");
      setGLoading(false);
    }
  });
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  function validate() {
    setError("");
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError("First and last name are required.");
        return false;
      }
      if (!form.email.includes("@")) {
        setError("Enter a valid email address.");
        return false;
      }
      if (emailExists(form.email)) {
        setError("This email is already registered. Please log in.");
        return false;
      }
      if (!/^[0-9]{10}$/.test(form.phone)) {
        setError("Phone number must be exactly 10 digits.");
        return false;
      }
      if (form.password.length < 8 || !/\d/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
        setError("Password needs 8+ characters, a number, and a special character.");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.pinCode.trim()) {
        setError("All billing address fields are required.");
        return false;
      }
      if (!/^\d{6}$/.test(form.pinCode)) {
        setError("PIN code must be 6 digits.");
        return false;
      }
    }
    if (step === 3 && !form.sameAsBilling) {
      if (!form.deliveryStreet.trim() || !form.deliveryCity.trim() || !form.deliveryState.trim() || !form.deliveryPin.trim()) {
        setError("All delivery address fields are required.");
        return false;
      }
      if (!/^\d{6}$/.test(form.deliveryPin)) {
        setError("Delivery PIN code must be 6 digits.");
        return false;
      }
    }
    return true;
  }
  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    savePendingRegistration({
      user: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        billingAddress: { street: form.street, city: form.city, state: form.state, pinCode: form.pinCode },
        deliveryAddress: form.sameAsBilling ? { street: form.street, city: form.city, state: form.state, pinCode: form.pinCode } : { street: form.deliveryStreet, city: form.deliveryCity, state: form.deliveryState, pinCode: form.deliveryPin }
      },
      password: form.password
    });
    navigate("/otp?purpose=register");
  }
  return <div className="auth-split-page">
      {
    /* ── Left brand panel ── */
  }
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <span className="auth-brand-logo">GIR RITUALS</span>
          <h2 className="auth-brand-headline">Join the A2 dairy family.</h2>
          <p className="auth-brand-sub">
            Set up your account in under 2 minutes.<br />
            Fresh Gir milk at your doorstep from tomorrow.
          </p>
          <div className="auth-brand-values">
            {[
    { icon: "\u{1F305}", label: "Morning Deliveries" },
    { icon: "\u{1F95B}", label: "A2 Certified" },
    { icon: "\u23F8\uFE0F", label: "Pause Anytime" },
    { icon: "\u{1F4B3}", label: "Flexible Plans" }
  ].map((v) => <div key={v.label} className="auth-brand-value">
                <span>{v.icon}</span>
                <p>{v.label}</p>
              </div>)}
          </div>
        </div>
      </div>

      {
    /* ── Right form panel ── */
  }
      <div className="auth-form-panel reg-form-panel">
        <div className="auth-form-inner reg-form-inner">

          <p className="auth-form-logo-mobile">GIR RITUALS</p>
          <h1 className="auth-form-title">Create account</h1>
          <p className="auth-form-sub">Get started with your daily ritual</p>

          {
    /* Google sign-up */
  }
          {googleEnabled ? <button
    type="button"
    className="auth-google-btn"
    onClick={() => {
      setError("");
      googleSignUp();
    }}
    disabled={gLoading}
  >
              <svg className="auth-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {gLoading ? "Signing up\u2026" : "Sign up with Google"}
            </button> : <div className="auth-google-disabled">
              <svg className="auth-google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ccc" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ccc" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#ccc" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ccc" />
              </svg>
              Google sign-up — add VITE_GOOGLE_CLIENT_ID to .env
            </div>}

          <div className="auth-divider"><span>or fill the form</span></div>

          {
    /* Step indicator */
  }
          <div className="reg-steps">
            {STEPS.map((s, i) => {
    const done = step > s.num;
    const active = step === s.num;
    return <div
      key={s.num}
      className={`reg-step ${active ? "reg-step-active" : ""} ${done ? "reg-step-done" : ""}`}
    >
                  <div className="reg-step-dot">
                    {done ? "\u2713" : s.num}
                  </div>
                  <span className="reg-step-label">{s.label}</span>
                  {i < STEPS.length - 1 && <div className={`reg-step-line ${done ? "reg-step-line-done" : ""}`} />}
                </div>;
  })}
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">

            {
    /* ── Step 1: Personal details ── */
  }
            {step === 1 && <>
                <div className="reg-row-2">
                  <div className="auth-field">
                    <label>First name</label>
                    <input
    className="auth-plain-input"
    value={form.firstName}
    onChange={(e) => set("firstName", e.target.value)}
    placeholder="Priya"
    required
  />
                  </div>
                  <div className="auth-field">
                    <label>Last name</label>
                    <input
    className="auth-plain-input"
    value={form.lastName}
    onChange={(e) => set("lastName", e.target.value)}
    placeholder="Sharma"
    required
  />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-email">Email address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">✉️</span>
                    <input
    id="reg-email"
    type="email"
    value={form.email}
    onChange={(e) => set("email", e.target.value)}
    placeholder="you@email.com"
    required
    autoComplete="email"
  />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-phone">Phone number</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">📱</span>
                    <input
    id="reg-phone"
    type="tel"
    value={form.phone}
    onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
    placeholder="10-digit mobile number"
    required
  />
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-pass">Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔒</span>
                    <input
    id="reg-pass"
    type={showPass ? "text" : "password"}
    value={form.password}
    onChange={(e) => set("password", e.target.value)}
    placeholder="8+ chars, number & special"
    required
    autoComplete="new-password"
  />
                    <button
    type="button"
    className="auth-eye-btn"
    onClick={() => setShowPass(!showPass)}
  >
                      {showPass ? "\u{1F648}" : "\u{1F441}\uFE0F"}
                    </button>
                  </div>
                  <p className="reg-hint">Min 8 characters, include a number and special character</p>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-confirm">Confirm password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🔒</span>
                    <input
    id="reg-confirm"
    type={showConfirm ? "text" : "password"}
    value={form.confirmPassword}
    onChange={(e) => set("confirmPassword", e.target.value)}
    placeholder="Re-enter password"
    required
    autoComplete="new-password"
  />
                    <button
    type="button"
    className="auth-eye-btn"
    onClick={() => setShowConfirm(!showConfirm)}
  >
                      {showConfirm ? "\u{1F648}" : "\u{1F441}\uFE0F"}
                    </button>
                  </div>
                </div>
              </>}

            {
    /* ── Step 2: Billing address ── */
  }
            {step === 2 && <>
                <p className="reg-step-intro">
                  🏠 <strong>Billing address</strong> — used for invoicing
                </p>

                <div className="auth-field">
                  <label>Street / Flat / Area</label>
                  <input
    className="auth-plain-input"
    value={form.street}
    onChange={(e) => set("street", e.target.value)}
    placeholder="12, Farm Lane, Satellite"
    required
  />
                </div>

                <div className="reg-row-2">
                  <div className="auth-field">
                    <label>City</label>
                    <input
    className="auth-plain-input"
    value={form.city}
    onChange={(e) => set("city", e.target.value)}
    placeholder="Ahmedabad"
    required
  />
                  </div>
                  <div className="auth-field">
                    <label>State</label>
                    <input
    className="auth-plain-input"
    value={form.state}
    onChange={(e) => set("state", e.target.value)}
    placeholder="Gujarat"
    required
  />
                  </div>
                </div>

                <div className="auth-field" style={{ maxWidth: 180 }}>
                  <label>PIN Code</label>
                  <input
    className="auth-plain-input"
    value={form.pinCode}
    onChange={(e) => set("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
    placeholder="380001"
    required
  />
                </div>
              </>}

            {
    /* ── Step 3: Delivery address ── */
  }
            {step === 3 && <>
                <p className="reg-step-intro">
                  🚚 <strong>Delivery address</strong> — where we drop your order
                </p>

                <label className="reg-checkbox-row">
                  <input
    type="checkbox"
    checked={form.sameAsBilling}
    onChange={(e) => set("sameAsBilling", e.target.checked)}
  />
                  Same as billing address
                </label>

                {form.sameAsBilling ? <div className="reg-same-address-preview">
                    <span>📍</span>
                    <div>
                      <p>{form.street}</p>
                      <p>{form.city}, {form.state} — {form.pinCode}</p>
                    </div>
                  </div> : <>
                    <div className="auth-field">
                      <label>Street / Flat / Area</label>
                      <input
    className="auth-plain-input"
    value={form.deliveryStreet}
    onChange={(e) => set("deliveryStreet", e.target.value)}
    placeholder="Delivery address"
    required
  />
                    </div>

                    <div className="reg-row-2">
                      <div className="auth-field">
                        <label>City</label>
                        <input
    className="auth-plain-input"
    value={form.deliveryCity}
    onChange={(e) => set("deliveryCity", e.target.value)}
    placeholder="City"
    required
  />
                      </div>
                      <div className="auth-field">
                        <label>State</label>
                        <input
    className="auth-plain-input"
    value={form.deliveryState}
    onChange={(e) => set("deliveryState", e.target.value)}
    placeholder="State"
    required
  />
                      </div>
                    </div>

                    <div className="auth-field" style={{ maxWidth: 180 }}>
                      <label>PIN Code</label>
                      <input
    className="auth-plain-input"
    value={form.deliveryPin}
    onChange={(e) => set("deliveryPin", e.target.value.replace(/\D/g, "").slice(0, 6))}
    placeholder="380001"
    required
  />
                    </div>
                  </>}
              </>}

            {
    /* ── Navigation buttons ── */
  }
            <div className="reg-actions">
              {step > 1 && <button
    type="button"
    className="reg-back-btn"
    onClick={() => {
      setError("");
      setStep((s) => s - 1);
    }}
  >
                  ← Back
                </button>}
              <button type="submit" className="auth-submit-btn" style={{ flex: 1 }}>
                {step < 3 ? "Continue \u2192" : "\u2713 Create Account"}
              </button>
            </div>
          </form>

          <p className="auth-switch-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>;
}
export {
  Register
};
