import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import "./Register.css";

const COW_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuADnrluIjvtXRnONlCsNvry63gTbkT2PRHfk0d3WGtvidNFjcH8Y84557LiNXBcXfrUGfJGuuEdtJzGiDLFPa9FqjLnEJ3CZ0tPBWCfz-d31UL6Nh5JIUTVO4oDA-wcvLzoc4x_kPxcI63K_2p6IWc8blDFXIU78QgeUw2KOjSzNHawtdTh9Exf5iLGPt1YVSPBXzQhTm99vl6tlhmu4xoUh2dmWejr3ikOF1Dsm7zMe2a1XUcO_eFEYxreAPd1nSTlsomKjuPG14jp";

const TOTAL = 4;

const INITIAL = {
  firstName: "", lastName: "", email: "", phone: "",
  password: "", confirmPassword: "",
  street: "", city: "", state: "", pinCode: "",
  sameAsBilling: true,
  deliveryStreet: "", deliveryCity: "", deliveryState: "", deliveryPin: "",
};

/* ─── Step components ─── */

function Step1({ form, set, showPass, setShowPass, showConfirm, setShowConfirm }) {
  return (
    <>
      <h3 className="rr-step-title">Personal Essence</h3>
      <p className="rr-step-desc">Tell us who you are so we may personalise your experience.</p>
      <div className="rr-fields">
        <div className="rr-row-2">
          <div className="rr-field">
            <label className="rr-label">First Name</label>
            <input className="rr-input" value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Priya" required />
          </div>
          <div className="rr-field">
            <label className="rr-label">Last Name</label>
            <input className="rr-input" value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Sharma" required />
          </div>
        </div>

        <div className="rr-row-2">
          <div className="rr-field">
            <label className="rr-label">Email Address</label>
            <input className="rr-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@ritual.com" required autoComplete="email" />
          </div>
          <div className="rr-field">
            <label className="rr-label">Phone Number</label>
            <input className="rr-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit number" required />
          </div>
        </div>

        <div className="rr-field">
          <label className="rr-label">Secure Password</label>
          <div className="rr-pass-wrap">
            <input className="rr-input" type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" required autoComplete="new-password" />
            <button type="button" className="rr-eye" onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Hide" : "Show"}>
              <span className="material-symbols-outlined">{showPass ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          <p className="rr-hint">8+ characters, include a number &amp; special character</p>
        </div>

        <div className="rr-field">
          <label className="rr-label">Confirm Password</label>
          <div className="rr-pass-wrap">
            <input className="rr-input" type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Re-enter password" required autoComplete="new-password" />
            <button type="button" className="rr-eye" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide" : "Show"}>
              <span className="material-symbols-outlined">{showConfirm ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Step2({ form, set }) {
  return (
    <>
      <h3 className="rr-step-title">Billing Sanctuary</h3>
      <p className="rr-step-desc">Where shall we send your ritual invoices?</p>
      <div className="rr-fields">
        <div className="rr-field">
          <label className="rr-label">Street Address</label>
          <input className="rr-input" value={form.street} onChange={e => set("street", e.target.value)} placeholder="123 Lotus Lane, Satellite" required />
        </div>
        <div className="rr-row-2">
          <div className="rr-field">
            <label className="rr-label">City</label>
            <input className="rr-input" value={form.city} onChange={e => set("city", e.target.value)} placeholder="Ahmedabad" required />
          </div>
          <div className="rr-field">
            <label className="rr-label">State</label>
            <input className="rr-input" value={form.state} onChange={e => set("state", e.target.value)} placeholder="Gujarat" required />
          </div>
        </div>
        <div className="rr-field" style={{ maxWidth: 180 }}>
          <label className="rr-label">PIN Code</label>
          <input className="rr-input" value={form.pinCode} onChange={e => set("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="380001" required />
        </div>
      </div>
    </>
  );
}

function Step3({ form, set }) {
  return (
    <>
      <h3 className="rr-step-title">Delivery Destination</h3>
      <p className="rr-step-desc">Where shall your morning ritual be placed?</p>

      <label className="rr-same-check">
        <input type="checkbox" checked={form.sameAsBilling} onChange={e => set("sameAsBilling", e.target.checked)} />
        Same as billing address
      </label>

      {form.sameAsBilling ? (
        <div className="rr-addr-preview">
          <span>📍</span>
          <div>
            <p>{form.street}</p>
            <p>{form.city}, {form.state} — {form.pinCode}</p>
          </div>
        </div>
      ) : (
        <div className="rr-fields">
          <div className="rr-field">
            <label className="rr-label">Street Address</label>
            <input className="rr-input" value={form.deliveryStreet} onChange={e => set("deliveryStreet", e.target.value)} placeholder="Apartment, Wing, Floor" required />
          </div>
          <div className="rr-row-2">
            <div className="rr-field">
              <label className="rr-label">City</label>
              <input className="rr-input" value={form.deliveryCity} onChange={e => set("deliveryCity", e.target.value)} placeholder="Ahmedabad" required />
            </div>
            <div className="rr-field">
              <label className="rr-label">State</label>
              <input className="rr-input" value={form.deliveryState} onChange={e => set("deliveryState", e.target.value)} placeholder="Gujarat" required />
            </div>
          </div>
          <div className="rr-field" style={{ maxWidth: 180 }}>
            <label className="rr-label">PIN Code</label>
            <input className="rr-input" value={form.deliveryPin} onChange={e => set("deliveryPin", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="380001" required />
          </div>
        </div>
      )}
    </>
  );
}

function Step4({ otp, otpRefs, onKey, onKeyDown, onResend, sentCode }) {
  return (
    <>
      <h3 className="rr-step-title">Sacred Verification</h3>
      <p className="rr-step-desc">Enter the 6-digit code sent to your phone to confirm your intent.</p>

      <div className="rr-otp-row">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => { otpRefs.current[i] = el; }}
            className="rr-otp-box"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => onKey(i, e)}
            onKeyDown={e => onKeyDown(i, e)}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {sentCode && (
        <p className="rr-otp-hint">Demo code: <strong>{sentCode}</strong></p>
      )}

      <p className="rr-resend">
        Didn't receive it?{" "}
        <button type="button" onClick={onResend}>Resend Ritual Code</button>
      </p>
    </>
  );
}

function SuccessScreen({ user, onEnter }) {
  return (
    <div className="rr-success-page">
      <div className="rr-success-icon">
        <span className="material-symbols-outlined">check_circle</span>
      </div>
      <h2 className="rr-success-title">The Ritual Commences</h2>
      <p className="rr-success-body">
        Welcome, <strong>{user.firstName}</strong>. Your journey toward ancestral wellness has officially begun.
      </p>
      <div className="rr-client-card">
        <p className="rr-client-label">Your Ritual Client ID</p>
        <p className="rr-client-id">{user.clientId}</p>
      </div>
      <button type="button" className="rr-enter-btn" onClick={onEnter}>
        Enter Dashboard
      </button>
    </div>
  );
}

/* ─── Main component ─── */

function Register() {
  const navigate = useNavigate();
  const { register } = useApp();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sentCode, setSentCode] = useState("");
  const [done, setDone] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const otpRefs = useRef([]);
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  function validate() {
    setError("");
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim())
        return setError("First and last name are required."), false;
      if (!form.email.includes("@"))
        return setError("Enter a valid email address."), false;
      if (!/^[0-9]{10}$/.test(form.phone))
        return setError("Phone must be exactly 10 digits."), false;
      if (form.password.length < 8 || !/\d/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password))
        return setError("Password needs 8+ chars, a number, and a special character."), false;
      if (form.password !== form.confirmPassword)
        return setError("Passwords do not match."), false;
    }
    if (step === 2) {
      if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.pinCode.trim())
        return setError("All billing address fields are required."), false;
      if (!/^\d{6}$/.test(form.pinCode))
        return setError("PIN code must be 6 digits."), false;
    }
    if (step === 3 && !form.sameAsBilling) {
      if (!form.deliveryStreet.trim() || !form.deliveryCity.trim() || !form.deliveryState.trim() || !form.deliveryPin.trim())
        return setError("All delivery address fields are required."), false;
      if (!/^\d{6}$/.test(form.deliveryPin))
        return setError("Delivery PIN must be 6 digits."), false;
    }
    return true;
  }

  async function advance() {
    if (!validate()) return;
    if (step === 3) {
      setLoading(true);
      try {
        const res = await api.sendOtp(form.phone);
        setSentCode(res.code || "");
        setError("");
        setStep(4);
      } catch {
        setError("Failed to send OTP. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
    setError("");
    setStep(s => s + 1);
  }

  async function handleOtpSubmit() {
    const code = otp.join("");
    if (code.length < 6) return setError("Enter all 6 digits.");
    setError("");
    setLoading(true);
    try {
      await api.verifyOtp(form.phone, code);
      const billing = { street: form.street, city: form.city, state: form.state, pinCode: form.pinCode };
      const delivery = form.sameAsBilling ? billing : { street: form.deliveryStreet, city: form.deliveryCity, state: form.deliveryState, pinCode: form.deliveryPin };
      const { token, user } = await api.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        billingAddress: billing,
        deliveryAddress: delivery,
      });
      register(user, token);
      setRegisteredUser(user);
      setDone(true);
    } catch (err) {
      setError(err.message || "Verification failed. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setError("");
    try {
      const res = await api.sendOtp(form.phone);
      setSentCode(res.code || "");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend OTP. Please try again.");
    }
  }

  function handleOtpKey(index, e) {
    const val = e.target.value.replace(/\D/, "");
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  if (done && registeredUser) {
    return <SuccessScreen user={registeredUser} onEnter={() => navigate("/home")} />;
  }

  return (
    <div className="rr-page">
      <header className="rr-header">
        <h1 className="rr-brand-name">Gir Rituals</h1>
        <p className="rr-brand-sub">Ancestral Purity</p>
      </header>

      <main className="rr-main">
        <div className="rr-blob rr-blob-1" />
        <div className="rr-blob rr-blob-2" />

        <div className="rr-card">
          {/* Left visual */}
          <div className="rr-left">
            <img src={COW_IMG} alt="Majestic Gir Cow" className="rr-left-img" />
            <div className="rr-left-overlay" />
            <div className="rr-left-content">
              <span className="rr-left-eyebrow">The Journey Begins</span>
              <h2 className="rr-left-headline">Secure your daily dose of vitality.</h2>
              <p className="rr-left-body">Experience the ritual of A2 dairy, delivered with reverence from our farm to your home.</p>
            </div>
          </div>

          {/* Right form */}
          <div className="rr-right">
            <div className="rr-progress">
              {Array.from({ length: TOTAL }, (_, i) => (
                <div key={i} className={`rr-dot ${i < step ? "rr-dot-active" : ""}`} />
              ))}
              <span className="rr-progress-label">Step {step} of {TOTAL}</span>
            </div>

            {error && <div className="rr-error">{error}</div>}

            <div className="rr-step-wrap" key={step}>
              {step === 1 && (
                <Step1 form={form} set={set} showPass={showPass} setShowPass={setShowPass} showConfirm={showConfirm} setShowConfirm={setShowConfirm} />
              )}
              {step === 2 && <Step2 form={form} set={set} />}
              {step === 3 && <Step3 form={form} set={set} />}
              {step === 4 && (
                <Step4
                  otp={otp}
                  otpRefs={otpRefs}
                  onKey={handleOtpKey}
                  onKeyDown={handleOtpKeyDown}
                  onResend={resendOtp}
                  sentCode={sentCode}
                />
              )}
            </div>

            <div className="rr-actions">
              {step > 1 && (
                <button type="button" className="rr-prev-btn" onClick={() => { setError(""); setStep(s => s - 1); }}>
                  <span className="material-symbols-outlined">arrow_back</span>
                  Previous
                </button>
              )}
              <button
                type="button"
                className="rr-next-btn"
                disabled={loading}
                onClick={step === 4 ? handleOtpSubmit : advance}
              >
                {loading ? "Please wait…" : step === 4 ? "Complete Ritual" : "Continue Ritual"}
              </button>
            </div>

            <p className="rr-login-link">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="rr-footer">
        <p>© 2024 Gir Rituals • A2 Dairy Traditions</p>
      </footer>
    </div>
  );
}

export { Register };
