import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { OtpInput } from "../components/OtpInput";
import { api } from "../lib/api";
import "./Otp.css";

function Otp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purpose = searchParams.get("purpose") || "reset_password";
  const phone = searchParams.get("phone") || "";
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState(null);

  useEffect(() => {
    if (!email) {
      navigate(purpose === "change_password" ? "/profile/settings" : "/forgot-password", { replace: true });
    }
  }, [email, purpose, navigate]);

  const maskedPhone = phone ? `******${phone.slice(-4)}` : "";
  const maskedEmail = email ? `${email[0]}***@${email.split("@")[1] || ""}` : "";

  const purposeTitle = purpose === "reset_password" ? "Reset password" : "Verify identity";

  const handleResend = async () => {
    setError("");
    try {
      const res = await api.forgotPassword(email);
      if (res.code) setDemoCode(res.code);
    } catch (err) {
      setError(err.message || "Could not resend OTP");
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
    try {
      if (purpose === "reset_password") {
        const newPassword = sessionStorage.getItem("gir_reset_password");
        if (!newPassword) {
          setError("Session expired. Please start again.");
          navigate("/forgot-password");
          return;
        }
        await api.resetPassword(email, otp, newPassword);
        sessionStorage.removeItem("gir_reset_password");
        sessionStorage.removeItem("gir_reset_email");
        navigate("/login", { replace: true, state: { message: "Password updated. Please sign in." } });
      }
    } catch (err) {
      setError(err.message || "Verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="auth-page otp-page">
      <div className="auth-header">
        <h1>{purposeTitle}</h1>
        <p>
          Enter the 6-digit code sent to
          <br />
          {maskedPhone && <><strong>{maskedPhone}</strong> and </>}
          <strong>{maskedEmail}</strong>
        </p>
      </div>

      {demoCode && (
        <div className="otp-demo-banner card">
          <span className="otp-demo-label">Demo OTP (dev only)</span>
          <code className="otp-demo-code">{demoCode}</code>
          <span className="otp-demo-hint">Admin panel also shows OTP logs</span>
        </div>
      )}

      <form onSubmit={handleVerify}>
        {error && <p className="otp-error">{error}</p>}
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />
        <p className="otp-expiry">Code expires in 5 min</p>
        <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}>
          {loading ? "Verifying…" : "Verify & Continue"}
        </button>
      </form>

      <p className="auth-footer">
        <button type="button" className="otp-resend-link" onClick={handleResend}>
          Resend OTP
        </button>
      </p>

      <p className="auth-footer">
        <Link to={purpose === "change_password" ? "/profile/settings" : "/forgot-password"}>
          ← Go back
        </Link>
      </p>
    </div>
  );
}

export { Otp };
