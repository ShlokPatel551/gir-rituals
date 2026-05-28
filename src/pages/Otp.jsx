import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { OtpInput } from "../components/OtpInput";
import { useApp } from "../context/AppContext";
import {
  clearPendingRegistration,
  emailExists,
  findCustomerByEmail,
  generateClientId,
  getPendingRegistration,
  registerCustomer,
  updateCustomerPassword
} from "../lib/customerStore";
import {
  getResendCooldownSeconds,
  OTP_EXPIRY_MINUTES,
  sendOtp,
  verifyOtp
} from "../lib/otpService";
import "./Otp.css";
function Otp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, login } = useApp();
  const purpose = searchParams.get("purpose") || "register";
  const pending = getPendingRegistration();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState(null);
  const [resendSec, setResendSec] = useState(0);
  const [expiresLabel, setExpiresLabel] = useState(`${OTP_EXPIRY_MINUTES} min`);
  const phone = pending?.user.phone ?? searchParams.get("phone") ?? "";
  const email = pending?.user.email ?? searchParams.get("email") ?? "";
  useEffect(() => {
    if (purpose === "register" && !pending) {
      navigate("/register", { replace: true });
      return;
    }
    if (purpose === "reset_password" && !phone && !email) {
      navigate("/forgot-password", { replace: true });
    }
    if (purpose === "change_password" && !phone && !email) {
      navigate("/profile/settings", { replace: true });
    }
  }, [purpose, pending, phone, email, navigate]);
  useEffect(() => {
    if (!phone || !email) return;
    const result = sendOtp(phone, email, purpose);
    if (result.demoCode) setDemoCode(result.demoCode);
    if (!result.ok && result.error) setError(result.error);
    setResendSec(getResendCooldownSeconds(phone, email, purpose));
  }, []);
  useEffect(() => {
    if (resendSec <= 0) return;
    const t = setInterval(() => {
      setResendSec(getResendCooldownSeconds(phone, email, purpose));
    }, 1e3);
    return () => clearInterval(t);
  }, [resendSec, phone, email, purpose]);
  const maskedPhone = phone ? `******${phone.slice(-4)}` : "";
  const maskedEmail = email ? `${email[0]}***@${email.split("@")[1] || ""}` : "";
  const handleResend = () => {
    setError("");
    const result = sendOtp(phone, email, purpose);
    if (result.ok) {
      setDemoCode(result.demoCode ?? null);
      setResendSec(getResendCooldownSeconds(phone, email, purpose));
      setExpiresLabel(`${OTP_EXPIRY_MINUTES} min`);
    } else {
      setError(result.error ?? "Could not resend OTP");
    }
  };
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    const result = verifyOtp(phone, email, purpose, otp);
    if (!result.ok) {
      setError(result.error ?? "Verification failed");
      setLoading(false);
      return;
    }
    if (purpose === "register") {
      const reg = getPendingRegistration();
      if (!reg) {
        setError("Registration session expired. Please register again.");
        setLoading(false);
        return;
      }
      if (emailExists(reg.user.email)) {
        setError("An account with this email already exists.");
        setLoading(false);
        return;
      }
      const clientId = generateClientId();
      const user = { ...reg.user, clientId };
      registerCustomer(user, reg.password);
      clearPendingRegistration();
      register(user);
      navigate("/home", { replace: true });
    } else if (purpose === "reset_password") {
      const newPass = sessionStorage.getItem("gir_reset_password");
      if (!newPass) {
        setError("Reset session expired. Start again.");
        navigate("/forgot-password");
        setLoading(false);
        return;
      }
      updateCustomerPassword(email, newPass);
      sessionStorage.removeItem("gir_reset_password");
      navigate("/login", { replace: true, state: { message: "Password updated. Please sign in." } });
    } else if (purpose === "change_password") {
      const newPass = sessionStorage.getItem("gir_change_password");
      if (!newPass) {
        setError("Session expired. Try again from Account Settings.");
        navigate("/profile/settings");
        setLoading(false);
        return;
      }
      updateCustomerPassword(email, newPass);
      sessionStorage.removeItem("gir_change_password");
      const stored = findCustomerByEmail(email);
      if (stored) login(stored);
      navigate("/profile/settings", { replace: true, state: { message: "Password updated successfully." } });
    }
    setLoading(false);
  };
  const purposeTitle = purpose === "register" ? "Verify your account" : purpose === "reset_password" ? "Reset password" : "Verify identity";
  return <div className="auth-page otp-page">
      <div className="auth-header">
        <h1>{purposeTitle}</h1>
        <p>
          Enter the 6-digit code sent to
          <br />
          <strong>{maskedPhone}</strong> and <strong>{maskedEmail}</strong>
        </p>
      </div>

      {demoCode && <div className="otp-demo-banner card">
          <span className="otp-demo-label">Demo SMS (dev only)</span>
          <code className="otp-demo-code">{demoCode}</code>
          <span className="otp-demo-hint">Admin panel also shows OTP logs</span>
        </div>}

      <form onSubmit={handleVerify}>
        {error && <p className="otp-error">{error}</p>}
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />
        <p className="otp-expiry">Code expires in {expiresLabel}</p>
        <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
          {loading ? "Verifying\u2026" : "Verify & Continue"}
        </button>
      </form>

      <p className="auth-footer">
        {resendSec > 0 ? <>Resend OTP in <strong>{resendSec}s</strong></> : <button type="button" className="otp-resend-link" onClick={handleResend}>
            Resend OTP
          </button>}
      </p>

      <p className="auth-footer">
        <Link
    to={purpose === "register" ? "/register" : purpose === "change_password" ? "/profile/settings" : "/login"}
  >
          ← Go back
        </Link>
      </p>
    </div>;
}
export {
  Otp
};
