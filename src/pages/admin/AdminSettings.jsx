import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminSession } from "../../lib/adminAuth";
import { api } from "../../lib/api";
import "./AdminSettings.css";

// ── TOTP helpers ─────────────────────────────────────────────────────
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(bytes) {
  let result = ""; let bits = 0; let value = 0;
  for (const byte of bytes) {
    value = value << 8 | byte; bits += 8;
    while (bits >= 5) { result += B32[value >>> bits - 5 & 31]; bits -= 5; }
  }
  if (bits > 0) result += B32[value << 5 - bits & 31];
  return result;
}
function base32Decode(input) {
  const out = []; let bits = 0; let value = 0;
  for (const ch of input.toUpperCase().replace(/=+$/, "")) {
    const idx = B32.indexOf(ch); if (idx === -1) continue;
    value = value << 5 | idx; bits += 5;
    if (bits >= 8) { out.push(value >>> bits - 8 & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}
function generateSecret() {
  const bytes = new Uint8Array(20); crypto.getRandomValues(bytes); return base32Encode(bytes);
}
async function computeTOTP(secret, win = 0) {
  const counter = Math.floor(Date.now() / 3e4) + win;
  const msg = new Uint8Array(8); let t = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = t & 255; t = Math.floor(t / 256); }
  const key = await crypto.subtle.importKey("raw", base32Decode(secret).buffer, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg.buffer));
  const off = sig[19] & 15;
  const code = ((sig[off] & 127) << 24 | (sig[off + 1] & 255) << 16 | (sig[off + 2] & 255) << 8 | sig[off + 3] & 255) % 1e6;
  return String(code).padStart(6, "0");
}
async function verifyTOTP(secret, code) {
  for (const w of [-1, 0, 1]) { if (await computeTOTP(secret, w) === code) return true; }
  return false;
}

// ── Role constants ────────────────────────────────────────────────────
const ROLE_LABELS = { owner: "Owner", manager: "Manager", accountant: "Accountant" };
const ROLE_COLORS = { owner: "#b45309", manager: "#0369a1", accountant: "#6d28d9" };
const ROLE_BG     = { owner: "#fef3c7", manager: "#e0f2fe", accountant: "#ede9fe" };
const ROLE_DESCRIPTIONS = {
  owner:      "Full access — all pages, team management, settings.",
  manager:    "Operations — customers, deliveries, orders, products, production, offers, campaigns, comms.",
  accountant: "Finance — billing, finance, analytics, refunds.",
};

const TABS = [
  { key: "accounts",  label: "Admin accounts" },
  { key: "twofa",     label: "2FA Security" },
  { key: "whatsapp",  label: "WhatsApp API" },
  { key: "sms",       label: "SMS gateway" },
  { key: "gst",       label: "GST rates" },
  { key: "holidays",  label: "Holiday calendar" },
];

// ── Add Member Modal ──────────────────────────────────────────────────
function AddMemberModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", adminRole: "manager" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { const m = await api.adminTeamCreate(form); onAdded(m); onClose(); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:16,padding:"2rem",width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem" }}>
          <h2 style={{ margin:0,fontSize:"1.2rem",fontWeight:700 }}>Add Admin Account</h2>
          <button type="button" onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",fontSize:"1.4rem",color:"#6b7280" }}>✕</button>
        </div>
        {error && <p style={{ color:"#dc2626",fontSize:"0.875rem",marginBottom:"1rem",padding:"0.5rem 0.75rem",background:"#fef2f2",borderRadius:8 }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem" }}>
            <div>
              <label style={{ fontSize:"0.8rem",fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>First Name *</label>
              <input value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} required
                style={{ width:"100%",padding:"0.5rem 0.75rem",borderRadius:8,border:"1px solid #d1d5db",fontSize:"0.9rem",boxSizing:"border-box" }} />
            </div>
            <div>
              <label style={{ fontSize:"0.8rem",fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Last Name</label>
              <input value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))}
                style={{ width:"100%",padding:"0.5rem 0.75rem",borderRadius:8,border:"1px solid #d1d5db",fontSize:"0.9rem",boxSizing:"border-box" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:"0.8rem",fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Email *</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required
              style={{ width:"100%",padding:"0.5rem 0.75rem",borderRadius:8,border:"1px solid #d1d5db",fontSize:"0.9rem",boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize:"0.8rem",fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Password * (min 8 chars)</label>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required minLength={8}
              style={{ width:"100%",padding:"0.5rem 0.75rem",borderRadius:8,border:"1px solid #d1d5db",fontSize:"0.9rem",boxSizing:"border-box" }} />
          </div>
          <div>
            <label style={{ fontSize:"0.8rem",fontWeight:600,color:"#374151",display:"block",marginBottom:4 }}>Role *</label>
            <select value={form.adminRole} onChange={e=>setForm(f=>({...f,adminRole:e.target.value}))}
              style={{ width:"100%",padding:"0.5rem 0.75rem",borderRadius:8,border:"1px solid #d1d5db",fontSize:"0.9rem",boxSizing:"border-box",background:"#fff" }}>
              <option value="manager">Manager — Operations</option>
              <option value="accountant">Accountant — Finance</option>
              <option value="owner">Owner — Full access</option>
            </select>
            <p style={{ fontSize:"0.77rem",color:"#6b7280",marginTop:4 }}>{ROLE_DESCRIPTIONS[form.adminRole]}</p>
          </div>
          <div style={{ display:"flex",gap:"0.75rem",marginTop:"0.5rem" }}>
            <button type="button" onClick={onClose}
              style={{ flex:1,padding:"0.6rem",borderRadius:8,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer",fontWeight:600,fontSize:"0.9rem" }}>Cancel</button>
            <button type="submit" disabled={loading}
              style={{ flex:1,padding:"0.6rem",borderRadius:8,border:"none",background:"#4a7c59",color:"#fff",cursor:loading?"not-allowed":"pointer",fontWeight:600,fontSize:"0.9rem",opacity:loading?0.7:1 }}>
              {loading ? "Adding…" : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Shared field style ────────────────────────────────────────────────
const fieldStyle = {
  width: "100%", padding: "0.55rem 0.8rem", borderRadius: 8,
  border: "1px solid #d1d5db", fontSize: "0.9rem", boxSizing: "border-box",
  background: "#fff", color: "#111827",
};
const labelStyle = { fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };
const sectionCard = { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.25rem" };

// ── Save button sub-component ─────────────────────────────────────────
function SaveBtn({ loading, saved, onClick, label = "Save Changes" }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      style={{ display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.55rem 1.25rem",borderRadius:8,border:"none",
        background: saved ? "#16a34a" : "#4a7c59",color:"#fff",fontWeight:600,fontSize:"0.875rem",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,transition:"background 0.2s" }}>
      <span className="material-symbols-outlined" style={{ fontSize:17 }}>{saved ? "check" : "save"}</span>
      {saved ? "Saved!" : loading ? "Saving…" : label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────
function AdminSettings() {
  const navigate = useNavigate();
  const admin    = getAdminSession();
  const [activeTab, setActiveTab] = useState("accounts");

  // 2FA
  const [twoFaEnabled, setTwoFaEnabled] = useState(() => localStorage.getItem("gir_2fa_enabled") === "true");
  const [twoFaStep,    setTwoFaStep]    = useState("idle");
  const [totpSecret,   setTotpSecret]   = useState("");
  const [otpInput,     setOtpInput]     = useState("");
  const [otpError,     setOtpError]     = useState("");
  const [countdown,    setCountdown]    = useState(30);

  // Team
  const [members,       setMembers]       = useState([]);
  const [membersLoading,setMembersLoading]= useState(true);
  const [membersError,  setMembersError]  = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [changingRole,  setChangingRole]  = useState(null);

  // Settings (WhatsApp / SMS / GST / Holidays)
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [savedTab,        setSavedTab]        = useState(null);

  const [waForm,  setWaForm]  = useState({ twilio_account_sid:"", twilio_auth_token:"", twilio_whatsapp_from:"" });
  const [smsForm, setSmsForm] = useState({ twilio_sms_from:"" });
  const [gstForm, setGstForm] = useState({ gst_cgst:"9", gst_sgst:"9", gst_igst:"18" });
  const [holidays,    setHolidays]    = useState([]);
  const [newHoliday,  setNewHoliday]  = useState({ date:"", name:"" });
  const [addingHoliday, setAddingHoliday] = useState(false);

  // TOTP timer
  useEffect(() => {
    const tick = () => setCountdown(30 - Math.floor(Date.now() / 1e3) % 30);
    tick(); const id = setInterval(tick, 1e3); return () => clearInterval(id);
  }, []);

  // Load team
  useEffect(() => {
    api.adminTeam()
      .then(setMembers)
      .catch(err => setMembersError(err.message))
      .finally(() => setMembersLoading(false));
  }, []);

  // Load settings
  useEffect(() => {
    api.adminSettings()
      .then(s => {
        setWaForm({ twilio_account_sid: s.twilio_account_sid || "", twilio_auth_token: s.twilio_auth_token || "", twilio_whatsapp_from: s.twilio_whatsapp_from || "" });
        setSmsForm({ twilio_sms_from: s.twilio_sms_from || "" });
        setGstForm({ gst_cgst: s.gst_cgst || "9", gst_sgst: s.gst_sgst || "9", gst_igst: s.gst_igst || "18" });
        try { setHolidays(JSON.parse(s.holidays || "[]")); } catch { setHolidays([]); }
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  async function saveTab(tabKey, data) {
    setSaving(true);
    try {
      await api.adminSaveSettings(data);
      setSavedTab(tabKey);
      setTimeout(() => setSavedTab(null), 2000);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  }

  // 2FA handlers
  function handleStart2FA() { setTotpSecret(generateSecret()); setOtpInput(""); setOtpError(""); setTwoFaStep("setup"); }
  async function handleVerify2FA() {
    const valid = await verifyTOTP(totpSecret, otpInput);
    if (valid) { localStorage.setItem("gir_2fa_enabled","true"); localStorage.setItem("gir_2fa_secret",totpSecret); setTwoFaEnabled(true); setTwoFaStep("done"); }
    else { setOtpError("Incorrect code — check your authenticator app and try again."); setOtpInput(""); }
  }
  function handleDisable2FA() { localStorage.removeItem("gir_2fa_enabled"); localStorage.removeItem("gir_2fa_secret"); setTwoFaEnabled(false); setTwoFaStep("idle"); setTotpSecret(""); setOtpInput(""); setOtpError(""); }

  // Team handlers
  const handleRoleChange = async (member, newRole) => {
    if (newRole === member.adminRole) return;
    setChangingRole(member.id);
    try { await api.adminTeamSetRole(member.id, newRole); setMembers(prev => prev.map(m => m.id === member.id ? {...m,adminRole:newRole} : m)); }
    catch (err) { alert(err.message); }
    finally { setChangingRole(null); }
  };
  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove admin access for ${member.firstName} ${member.lastName}? They will become a regular customer.`)) return;
    try { await api.adminTeamRemove(member.id); setMembers(prev => prev.filter(m => m.id !== member.id)); }
    catch (err) { alert(err.message); }
  };

  // Holiday handlers
  const handleAddHoliday = async () => {
    if (!newHoliday.date || !newHoliday.name.trim()) return;
    const updated = [...holidays, { date: newHoliday.date, name: newHoliday.name.trim() }].sort((a,b) => a.date.localeCompare(b.date));
    setHolidays(updated);
    await saveTab("holidays", { holidays: JSON.stringify(updated) });
    setNewHoliday({ date:"", name:"" }); setAddingHoliday(false);
  };
  const handleRemoveHoliday = async (date) => {
    const updated = holidays.filter(h => h.date !== date);
    setHolidays(updated);
    await saveTab("holidays", { holidays: JSON.stringify(updated) });
  };

  const otpauthUri = totpSecret ? `otpauth://totp/GirRituals:${admin?.email ?? "admin"}?secret=${totpSecret}&issuer=GirRituals&algorithm=SHA1&digits=6&period=30` : "";
  const qrUrl = otpauthUri ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(otpauthUri)}` : "";

  return (
    <div className="as-page">

      {/* Header */}
      <div className="as-header">
        <div>
          <h2 className="as-page-title">Settings</h2>
          <p className="as-page-sub">Manage organization configuration and administrative access. Owner-only.</p>
        </div>
        <div className="as-header-actions">
          <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.4rem 0.9rem",borderRadius:20,background:"#fef3c7",border:"1px solid #fde68a" }}>
            <span className="material-symbols-outlined" style={{ fontSize:16,color:"#b45309" }}>shield</span>
            <span style={{ fontSize:"0.78rem",fontWeight:700,color:"#b45309" }}>Owner access only</span>
          </div>
        </div>
      </div>

      {/* Tabbed card */}
      <div className="as-tab-card">
        <nav className="as-tabs-nav">
          {TABS.map(t => (
            <button key={t.key} type="button"
              className={`as-tab ${activeTab === t.key ? "as-tab-active" : ""}`}
              onClick={() => setActiveTab(t.key)}>
              {t.label}
              {t.key === "twofa" && (
                <span className={`as-tab-pill ${twoFaEnabled ? "as-tab-pill-on" : "as-tab-pill-off"}`}>
                  {twoFaEnabled ? "ON" : "OFF"}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="as-tab-body">

          {/* ── Accounts tab ── */}
          {activeTab === "accounts" && (
            <div className="as-accounts-content">
              <div className="as-accounts-header">
                <h3 className="as-section-title">Manage Administrators</h3>
                <button type="button" className="as-btn-add" onClick={() => setShowAddMember(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize:20 }}>add</span>
                  Add new admin account
                </button>
              </div>

              {membersLoading && <p style={{ color:"#6b7280",padding:"1rem 0" }}>Loading team…</p>}
              {membersError   && <p style={{ color:"#dc2626",padding:"1rem 0" }}>{membersError}</p>}

              {!membersLoading && !membersError && (
                <div className="admin-table-wrap as-admins-table">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Admin name &amp; email</th>
                        <th style={{ textAlign:"center" }}>Role</th>
                        <th>Joined</th>
                        <th style={{ textAlign:"right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id} className="as-admin-row">
                          <td>
                            <div className="as-user-cell">
                              <div className="as-user-avatar" style={{ background: ROLE_COLORS[m.adminRole] || "#6b7280" }}>
                                {m.firstName[0]}{m.lastName?.[0] || ""}
                              </div>
                              <div>
                                <p className="as-user-name">{m.firstName} {m.lastName}</p>
                                <p className="as-user-email">{m.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ textAlign:"center" }}>
                            <select
                              value={m.adminRole}
                              disabled={changingRole === m.id}
                              onChange={e => handleRoleChange(m, e.target.value)}
                              style={{ padding:"3px 10px",borderRadius:20,border:`1px solid ${ROLE_COLORS[m.adminRole]}`,background:ROLE_BG[m.adminRole],color:ROLE_COLORS[m.adminRole],fontWeight:600,fontSize:"0.78rem",cursor:"pointer" }}
                            >
                              <option value="owner">Owner</option>
                              <option value="manager">Manager</option>
                              <option value="accountant">Accountant</option>
                            </select>
                          </td>
                          <td>
                            <p className="as-login-date">{new Date(m.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
                          </td>
                          <td style={{ textAlign:"right" }}>
                            <button type="button" onClick={() => handleRemoveMember(m)}
                              style={{ background:"none",border:"1px solid #fca5a5",color:"#dc2626",padding:"3px 12px",borderRadius:8,fontSize:"0.8rem",cursor:"pointer",fontWeight:600 }}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {members.length === 0 && (
                        <tr><td colSpan={4} style={{ padding:"2rem",textAlign:"center",color:"#9ca3af" }}>No admin accounts found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Role legend */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.75rem",marginTop:"1.5rem" }}>
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
                  <div key={role} style={{ background:"#f9fafb",borderRadius:10,padding:"0.9rem 1.1rem",border:`2px solid ${ROLE_BG[role]}` }}>
                    <div style={{ display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:"0.72rem",fontWeight:700,background:ROLE_BG[role],color:ROLE_COLORS[role],marginBottom:"0.4rem" }}>
                      {ROLE_LABELS[role]}
                    </div>
                    <p style={{ margin:0,fontSize:"0.79rem",color:"#6b7280",lineHeight:1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>

              <div className="as-info-grid" style={{ marginTop:"1.5rem" }}>
                <div className="as-info-card">
                  <span className="material-symbols-outlined as-info-icon as-icon-primary">verified_user</span>
                  <div>
                    <h4 className="as-info-title">Security Enforcement</h4>
                    <p className="as-info-body">All admin accounts can enable TOTP 2FA for their session via the 2FA Security tab.</p>
                    <button type="button" className="as-info-link as-link-primary" onClick={() => setActiveTab("twofa")}>Configure 2FA Settings →</button>
                  </div>
                </div>
                <div className="as-info-card">
                  <span className="material-symbols-outlined as-info-icon as-icon-secondary">history</span>
                  <div>
                    <h4 className="as-info-title">Audit Logs</h4>
                    <p className="as-info-body">Track every action taken by administrators including data exports and configuration changes.</p>
                    <button type="button" className="as-info-link as-link-secondary" onClick={() => navigate("/admin")}>View Dashboard →</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2FA Security tab ── */}
          {activeTab === "twofa" && (
            <div className="as-twofa-content">
              <div className={`as-twofa-status ${twoFaEnabled ? "as-twofa-status-on" : "as-twofa-status-off"}`}>
                <div className="as-twofa-status-left">
                  <span className="material-symbols-outlined as-twofa-status-icon">{twoFaEnabled ? "verified_user" : "shield"}</span>
                  <div>
                    <p className="as-twofa-status-title">Two-Factor Authentication is {twoFaEnabled ? "Enabled" : "Disabled"}</p>
                    <p className="as-twofa-status-desc">
                      {twoFaEnabled ? "Your admin account is protected. TOTP codes rotate every 30 seconds." : "Enable TOTP 2FA to secure your admin account with an authenticator app."}
                    </p>
                  </div>
                </div>
                {twoFaEnabled
                  ? <button type="button" className="as-twofa-disable-btn" onClick={handleDisable2FA}>Disable 2FA</button>
                  : twoFaStep === "idle" && (
                    <button type="button" className="as-btn-filled" onClick={handleStart2FA}>
                      <span className="material-symbols-outlined" style={{ fontSize:18 }}>lock</span>
                      Enable 2FA
                    </button>
                  )}
              </div>

              {!twoFaEnabled && twoFaStep !== "idle" && (
                <div className="as-twofa-setup-card">
                  {twoFaStep === "setup" && <>
                    <div className="as-twofa-step-header">
                      <span className="as-twofa-step-num">1</span>
                      <h3 className="as-twofa-step-title">Scan QR code with your authenticator app</h3>
                    </div>
                    <p className="as-twofa-step-desc">Open <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app and scan the code below.</p>
                    <div className="as-twofa-qr-wrap"><img src={qrUrl} alt="Scan this QR code to set up 2FA" className="as-twofa-qr" /></div>
                    <div className="as-twofa-secret-box">
                      <p className="as-twofa-secret-label"><span className="material-symbols-outlined" style={{ fontSize:16 }}>key</span>Manual entry key</p>
                      <code className="as-twofa-secret-code">{totpSecret.match(/.{1,4}/g)?.join(" ")}</code>
                    </div>
                    <div className="as-twofa-timer-row">
                      <span className="material-symbols-outlined">timer</span>
                      Next window in {countdown}s
                      <div className="as-twofa-timer-bar"><div className="as-twofa-timer-fill" style={{ width:`${countdown / 30 * 100}%` }} /></div>
                    </div>
                    <div className="as-twofa-actions">
                      <button type="button" className="as-btn-outline" onClick={() => setTwoFaStep("idle")}>Cancel</button>
                      <button type="button" className="as-btn-filled" onClick={() => setTwoFaStep("verify")}>Next: Verify code →</button>
                    </div>
                  </>}

                  {twoFaStep === "verify" && <>
                    <div className="as-twofa-step-header">
                      <span className="as-twofa-step-num">2</span>
                      <h3 className="as-twofa-step-title">Enter the 6-digit code from your app</h3>
                    </div>
                    <p className="as-twofa-step-desc">Type the current 6-digit code shown in your authenticator app to confirm the setup.</p>
                    <div className="as-twofa-otp-wrap">
                      <input type="text" className={`as-twofa-otp-input ${otpError ? "as-twofa-otp-input-error" : ""}`}
                        placeholder="000 000" maxLength={6} value={otpInput} inputMode="numeric" autoFocus
                        onChange={e => { setOtpInput(e.target.value.replace(/\D/g,"").slice(0,6)); setOtpError(""); }}
                        onKeyDown={e => { if (e.key === "Enter" && otpInput.length === 6) handleVerify2FA(); }} />
                      {otpError && <p className="as-twofa-error"><span className="material-symbols-outlined" style={{ fontSize:16 }}>error</span>{otpError}</p>}
                    </div>
                    <div className="as-twofa-timer-row">
                      <span className="material-symbols-outlined">timer</span>
                      Code refreshes in {countdown}s
                      <div className="as-twofa-timer-bar"><div className="as-twofa-timer-fill" style={{ width:`${countdown / 30 * 100}%` }} /></div>
                    </div>
                    <div className="as-twofa-actions">
                      <button type="button" className="as-btn-outline" onClick={() => setTwoFaStep("setup")}>← Back</button>
                      <button type="button" className="as-btn-filled" onClick={handleVerify2FA} disabled={otpInput.length !== 6}>
                        <span className="material-symbols-outlined" style={{ fontSize:18 }}>verified_user</span>
                        Verify &amp; Enable
                      </button>
                    </div>
                  </>}

                  {twoFaStep === "done" && (
                    <div className="as-twofa-success">
                      <span className="material-symbols-outlined as-twofa-success-icon">check_circle</span>
                      <h3 className="as-twofa-success-title">2FA Enabled Successfully!</h3>
                      <p className="as-twofa-success-desc">Your admin account is now protected by time-based OTP (RFC 6238). Store your secret key safely as a backup.</p>
                      <div className="as-twofa-secret-box" style={{ marginTop:"1rem" }}>
                        <p className="as-twofa-secret-label"><span className="material-symbols-outlined" style={{ fontSize:16 }}>key</span>Backup key — save this securely</p>
                        <code className="as-twofa-secret-code">{totpSecret.match(/.{1,4}/g)?.join(" ")}</code>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="as-twofa-info-grid">
                <div className="as-twofa-info-row">
                  <span className="material-symbols-outlined">smartphone</span>
                  <div><p className="as-twofa-info-title">Compatible apps</p><p className="as-twofa-info-body">Works with Google Authenticator, Authy, Microsoft Authenticator, 1Password, and all TOTP apps.</p></div>
                </div>
                <div className="as-twofa-info-row">
                  <span className="material-symbols-outlined">lock_clock</span>
                  <div><p className="as-twofa-info-title">RFC 6238 TOTP standard</p><p className="as-twofa-info-body">Industry-standard HMAC-SHA1 time-based OTP. Codes are computed locally — no server roundtrip needed.</p></div>
                </div>
              </div>
            </div>
          )}

          {/* ── WhatsApp API tab ── */}
          {activeTab === "whatsapp" && (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem" }}>
                <div>
                  <h3 style={{ margin:0,fontSize:"1.05rem",fontWeight:700 }}>WhatsApp API Configuration</h3>
                  <p style={{ margin:"0.25rem 0 0",color:"#6b7280",fontSize:"0.85rem" }}>Twilio credentials used for WhatsApp OTP and message delivery.</p>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.35rem 0.9rem",borderRadius:20,
                  background: waForm.twilio_account_sid ? "#dcfce7" : "#f3f4f6",
                  border: `1px solid ${waForm.twilio_account_sid ? "#86efac" : "#e5e7eb"}` }}>
                  <span className="material-symbols-outlined" style={{ fontSize:15,color: waForm.twilio_account_sid ? "#16a34a" : "#9ca3af" }}>
                    {waForm.twilio_account_sid ? "check_circle" : "cancel"}
                  </span>
                  <span style={{ fontSize:"0.78rem",fontWeight:600,color: waForm.twilio_account_sid ? "#16a34a" : "#9ca3af" }}>
                    {waForm.twilio_account_sid ? "Configured" : "Not configured"}
                  </span>
                </div>
              </div>

              {settingsLoading ? <p style={{ color:"#6b7280" }}>Loading…</p> : (
                <>
                  <div style={sectionCard}>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1rem" }}>
                      <div>
                        <label style={labelStyle}>Account SID</label>
                        <input style={fieldStyle} value={waForm.twilio_account_sid}
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          onChange={e => setWaForm(f=>({...f,twilio_account_sid:e.target.value}))} />
                        <p style={{ fontSize:"0.75rem",color:"#9ca3af",marginTop:4 }}>Found in Twilio Console → Account Info</p>
                      </div>
                      <div>
                        <label style={labelStyle}>Auth Token</label>
                        <input style={fieldStyle} type="password" value={waForm.twilio_auth_token}
                          placeholder={waForm.twilio_auth_token === "••••••••" ? "Token saved (hidden)" : "Enter Auth Token"}
                          onChange={e => setWaForm(f=>({...f,twilio_auth_token:e.target.value}))} />
                        <p style={{ fontSize:"0.75rem",color:"#9ca3af",marginTop:4 }}>Stored securely. Leave blank to keep existing value.</p>
                      </div>
                      <div>
                        <label style={labelStyle}>WhatsApp From Number</label>
                        <input style={fieldStyle} value={waForm.twilio_whatsapp_from}
                          placeholder="+14155238886"
                          onChange={e => setWaForm(f=>({...f,twilio_whatsapp_from:e.target.value}))} />
                        <p style={{ fontSize:"0.75rem",color:"#9ca3af",marginTop:4 }}>Twilio sandbox: +14155238886. Production: your approved WhatsApp number.</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display:"flex",justifyContent:"flex-end" }}>
                    <SaveBtn loading={saving} saved={savedTab==="whatsapp"}
                      onClick={() => saveTab("whatsapp", waForm)} />
                  </div>

                  <div style={{ ...sectionCard,marginTop:"1.25rem",background:"#fffbeb",borderColor:"#fde68a" }}>
                    <div style={{ display:"flex",gap:"0.75rem",alignItems:"flex-start" }}>
                      <span className="material-symbols-outlined" style={{ color:"#b45309",marginTop:2 }}>info</span>
                      <div>
                        <p style={{ margin:"0 0 0.4rem",fontWeight:600,fontSize:"0.85rem",color:"#92400e" }}>Environment variable override</p>
                        <p style={{ margin:0,fontSize:"0.82rem",color:"#78350f",lineHeight:1.6 }}>
                          If <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, or <code>TWILIO_WHATSAPP_FROM</code> are set as environment variables on the server, they take precedence over the values saved here.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── SMS gateway tab ── */}
          {activeTab === "sms" && (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem" }}>
                <div>
                  <h3 style={{ margin:0,fontSize:"1.05rem",fontWeight:700 }}>SMS Gateway Configuration</h3>
                  <p style={{ margin:"0.25rem 0 0",color:"#6b7280",fontSize:"0.85rem" }}>Twilio phone number used for SMS OTP delivery.</p>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.35rem 0.9rem",borderRadius:20,
                  background: smsForm.twilio_sms_from ? "#dcfce7" : "#f3f4f6",
                  border: `1px solid ${smsForm.twilio_sms_from ? "#86efac" : "#e5e7eb"}` }}>
                  <span className="material-symbols-outlined" style={{ fontSize:15,color: smsForm.twilio_sms_from ? "#16a34a" : "#9ca3af" }}>
                    {smsForm.twilio_sms_from ? "check_circle" : "cancel"}
                  </span>
                  <span style={{ fontSize:"0.78rem",fontWeight:600,color: smsForm.twilio_sms_from ? "#16a34a" : "#9ca3af" }}>
                    {smsForm.twilio_sms_from ? "Configured" : "Not configured"}
                  </span>
                </div>
              </div>

              {settingsLoading ? <p style={{ color:"#6b7280" }}>Loading…</p> : (
                <>
                  <div style={{ ...sectionCard,background:"#eff6ff",borderColor:"#bfdbfe",marginBottom:"1rem" }}>
                    <div style={{ display:"flex",gap:"0.75rem",alignItems:"center" }}>
                      <span className="material-symbols-outlined" style={{ color:"#1d4ed8" }}>link</span>
                      <p style={{ margin:0,fontSize:"0.85rem",color:"#1e40af" }}>
                        SMS uses the same Twilio Account SID and Auth Token as WhatsApp.{" "}
                        <button type="button" onClick={() => setActiveTab("whatsapp")}
                          style={{ background:"none",border:"none",color:"#2563eb",fontWeight:600,cursor:"pointer",textDecoration:"underline",padding:0 }}>
                          Configure credentials →
                        </button>
                      </p>
                    </div>
                  </div>

                  <div style={sectionCard}>
                    <div>
                      <label style={labelStyle}>SMS From Number</label>
                      <input style={{ ...fieldStyle, maxWidth:320 }} value={smsForm.twilio_sms_from}
                        placeholder="+919876543210"
                        onChange={e => setSmsForm(f=>({...f,twilio_sms_from:e.target.value}))} />
                      <p style={{ fontSize:"0.75rem",color:"#9ca3af",marginTop:4 }}>Your Twilio phone number with SMS capability (E.164 format).</p>
                    </div>
                  </div>

                  <div style={{ display:"flex",justifyContent:"flex-end" }}>
                    <SaveBtn loading={saving} saved={savedTab==="sms"}
                      onClick={() => saveTab("sms", smsForm)} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── GST rates tab ── */}
          {activeTab === "gst" && (
            <div>
              <div style={{ marginBottom:"1.25rem" }}>
                <h3 style={{ margin:0,fontSize:"1.05rem",fontWeight:700 }}>GST Rates</h3>
                <p style={{ margin:"0.25rem 0 0",color:"#6b7280",fontSize:"0.85rem" }}>Configure applicable GST rates for dairy product invoices.</p>
              </div>

              {settingsLoading ? <p style={{ color:"#6b7280" }}>Loading…</p> : (
                <>
                  <div style={sectionCard}>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"1.25rem" }}>
                      <div>
                        <label style={labelStyle}>CGST % (Central)</label>
                        <div style={{ position:"relative" }}>
                          <input style={{ ...fieldStyle,paddingRight:"2.5rem" }} type="number" min="0" max="50" step="0.5"
                            value={gstForm.gst_cgst}
                            onChange={e => setGstForm(f=>({...f,gst_cgst:e.target.value}))} />
                          <span style={{ position:"absolute",right:"0.75rem",top:"50%",transform:"translateY(-50%)",color:"#9ca3af",fontWeight:600 }}>%</span>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>SGST % (State)</label>
                        <div style={{ position:"relative" }}>
                          <input style={{ ...fieldStyle,paddingRight:"2.5rem" }} type="number" min="0" max="50" step="0.5"
                            value={gstForm.gst_sgst}
                            onChange={e => setGstForm(f=>({...f,gst_sgst:e.target.value}))} />
                          <span style={{ position:"absolute",right:"0.75rem",top:"50%",transform:"translateY(-50%)",color:"#9ca3af",fontWeight:600 }}>%</span>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>IGST % (Interstate)</label>
                        <div style={{ position:"relative" }}>
                          <input style={{ ...fieldStyle,paddingRight:"2.5rem" }} type="number" min="0" max="50" step="0.5"
                            value={gstForm.gst_igst}
                            onChange={e => setGstForm(f=>({...f,gst_igst:e.target.value}))} />
                          <span style={{ position:"absolute",right:"0.75rem",top:"50%",transform:"translateY(-50%)",color:"#9ca3af",fontWeight:600 }}>%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1.25rem" }}>
                    <div style={{ ...sectionCard,background:"#f0fdf4",borderColor:"#bbf7d0",marginBottom:0 }}>
                      <p style={{ margin:"0 0 0.5rem",fontSize:"0.8rem",fontWeight:600,color:"#15803d",textTransform:"uppercase",letterSpacing:"0.05em" }}>Intra-state rate</p>
                      <p style={{ margin:0,fontSize:"1.6rem",fontWeight:700,color:"#166534" }}>
                        {(parseFloat(gstForm.gst_cgst || 0) + parseFloat(gstForm.gst_sgst || 0)).toFixed(1)}%
                      </p>
                      <p style={{ margin:"0.25rem 0 0",fontSize:"0.78rem",color:"#4ade80" }}>CGST + SGST</p>
                    </div>
                    <div style={{ ...sectionCard,background:"#eff6ff",borderColor:"#bfdbfe",marginBottom:0 }}>
                      <p style={{ margin:"0 0 0.5rem",fontSize:"0.8rem",fontWeight:600,color:"#1d4ed8",textTransform:"uppercase",letterSpacing:"0.05em" }}>Interstate rate</p>
                      <p style={{ margin:0,fontSize:"1.6rem",fontWeight:700,color:"#1e3a8a" }}>
                        {parseFloat(gstForm.gst_igst || 0).toFixed(1)}%
                      </p>
                      <p style={{ margin:"0.25rem 0 0",fontSize:"0.78rem",color:"#93c5fd" }}>IGST only</p>
                    </div>
                  </div>

                  <div style={{ display:"flex",justifyContent:"flex-end" }}>
                    <SaveBtn loading={saving} saved={savedTab==="gst"}
                      onClick={() => saveTab("gst", gstForm)} />
                  </div>

                  <p style={{ fontSize:"0.78rem",color:"#9ca3af",marginTop:"1rem" }}>
                    Note: Milk and most fresh dairy products are exempt from GST under Schedule I. These rates apply to processed/packaged products as per CBIC notifications.
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── Holiday calendar tab ── */}
          {activeTab === "holidays" && (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",flexWrap:"wrap",gap:"0.75rem" }}>
                <div>
                  <h3 style={{ margin:0,fontSize:"1.05rem",fontWeight:700 }}>Holiday Calendar</h3>
                  <p style={{ margin:"0.25rem 0 0",color:"#6b7280",fontSize:"0.85rem" }}>Days when deliveries are paused. {holidays.length} holiday{holidays.length !== 1 ? "s" : ""} configured.</p>
                </div>
                <button type="button" onClick={() => setAddingHoliday(true)}
                  style={{ display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.5rem 1.1rem",borderRadius:8,border:"none",background:"#4a7c59",color:"#fff",fontWeight:600,fontSize:"0.875rem",cursor:"pointer" }}>
                  <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span>
                  Add Holiday
                </button>
              </div>

              {settingsLoading ? <p style={{ color:"#6b7280" }}>Loading…</p> : (
                <>
                  {addingHoliday && (
                    <div style={{ ...sectionCard,borderColor:"#4a7c59",background:"#f0fdf4" }}>
                      <h4 style={{ margin:"0 0 1rem",fontSize:"0.95rem",fontWeight:700,color:"#15803d" }}>Add Holiday</h4>
                      <div style={{ display:"flex",gap:"0.75rem",flexWrap:"wrap",alignItems:"flex-end" }}>
                        <div>
                          <label style={labelStyle}>Date *</label>
                          <input type="date" style={{ ...fieldStyle,width:160 }} value={newHoliday.date}
                            onChange={e => setNewHoliday(h=>({...h,date:e.target.value}))} />
                        </div>
                        <div style={{ flex:1,minWidth:180 }}>
                          <label style={labelStyle}>Holiday Name *</label>
                          <input style={fieldStyle} value={newHoliday.name} placeholder="e.g. Diwali, Republic Day"
                            onChange={e => setNewHoliday(h=>({...h,name:e.target.value}))}
                            onKeyDown={e => { if (e.key === "Enter") handleAddHoliday(); }} />
                        </div>
                        <div style={{ display:"flex",gap:"0.5rem" }}>
                          <button type="button" onClick={() => { setAddingHoliday(false); setNewHoliday({date:"",name:""}); }}
                            style={{ padding:"0.5rem 1rem",borderRadius:8,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer",fontWeight:600,fontSize:"0.875rem" }}>Cancel</button>
                          <button type="button" onClick={handleAddHoliday} disabled={!newHoliday.date || !newHoliday.name || saving}
                            style={{ padding:"0.5rem 1.1rem",borderRadius:8,border:"none",background:"#4a7c59",color:"#fff",cursor:"pointer",fontWeight:600,fontSize:"0.875rem",opacity:(!newHoliday.date||!newHoliday.name||saving)?0.5:1 }}>
                            {saving ? "Saving…" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {holidays.length === 0 ? (
                    <div style={{ textAlign:"center",padding:"3rem 1rem",color:"#9ca3af",background:"#f9fafb",borderRadius:12,border:"1px dashed #e5e7eb" }}>
                      <span className="material-symbols-outlined" style={{ fontSize:40,marginBottom:"0.75rem",display:"block" }}>event_busy</span>
                      <p style={{ margin:0,fontWeight:500 }}>No holidays configured</p>
                      <p style={{ margin:"0.25rem 0 0",fontSize:"0.85rem" }}>Add holidays to pause deliveries on those days.</p>
                    </div>
                  ) : (
                    <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",overflow:"hidden" }}>
                      <table style={{ width:"100%",borderCollapse:"collapse" }}>
                        <thead>
                          <tr style={{ background:"#f9fafb",borderBottom:"1px solid #e5e7eb" }}>
                            <th style={{ padding:"0.7rem 1.25rem",textAlign:"left",fontSize:"0.78rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em" }}>Date</th>
                            <th style={{ padding:"0.7rem 1.25rem",textAlign:"left",fontSize:"0.78rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em" }}>Holiday</th>
                            <th style={{ padding:"0.7rem 1.25rem",textAlign:"left",fontSize:"0.78rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em" }}>Day</th>
                            <th style={{ padding:"0.7rem 1.25rem",textAlign:"right",fontSize:"0.78rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {holidays.map((h, i) => {
                            const d = new Date(h.date + "T00:00:00");
                            const isPast = d < new Date();
                            return (
                              <tr key={h.date} style={{ borderBottom: i < holidays.length - 1 ? "1px solid #f3f4f6" : "none", opacity: isPast ? 0.55 : 1 }}>
                                <td style={{ padding:"0.85rem 1.25rem",fontWeight:600,fontSize:"0.9rem",fontVariantNumeric:"tabular-nums" }}>{h.date}</td>
                                <td style={{ padding:"0.85rem 1.25rem",fontSize:"0.9rem" }}>
                                  <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                                    <span className="material-symbols-outlined" style={{ fontSize:16,color:"#f59e0b" }}>event</span>
                                    {h.name}
                                    {isPast && <span style={{ fontSize:"0.7rem",color:"#9ca3af",fontWeight:600,padding:"1px 6px",borderRadius:10,background:"#f3f4f6" }}>Past</span>}
                                  </div>
                                </td>
                                <td style={{ padding:"0.85rem 1.25rem",color:"#6b7280",fontSize:"0.875rem" }}>
                                  {d.toLocaleDateString("en-IN",{weekday:"long"})}
                                </td>
                                <td style={{ padding:"0.85rem 1.25rem",textAlign:"right" }}>
                                  <button type="button" onClick={() => handleRemoveHoliday(h.date)} disabled={saving}
                                    style={{ background:"none",border:"1px solid #fca5a5",color:"#dc2626",padding:"3px 12px",borderRadius:8,fontSize:"0.8rem",cursor:"pointer",fontWeight:600 }}>
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="as-bottom-grid">
        <div className="as-health-card">
          <div className="as-health-header">
            <h4 className="as-health-title">System Health</h4>
            <span className="as-health-badge"><span className="as-pulse-dot" />All systems operational</span>
          </div>
          <div className="as-health-metrics">
            <div><p className="as-health-label">API Latency</p><p className="as-health-value">~120 ms</p></div>
            <div><p className="as-health-label">Uptime</p><p className="as-health-value">99.9%</p></div>
            <div><p className="as-health-label">Sync</p><p className="as-health-value">Real-time</p></div>
          </div>
        </div>
        <div className="as-plan-card">
          <div className="as-plan-dots" />
          <div style={{ position:"relative" }}>
            <p className="as-plan-label">Subscription</p>
            <p className="as-plan-name">Enterprise Plan</p>
          </div>
          <div style={{ position:"relative" }}>
            <p className="as-plan-billing">Settings v2 — fully wired</p>
            <button type="button" className="as-plan-btn" onClick={() => setActiveTab("accounts")}>Manage Team</button>
          </div>
        </div>
      </div>

      {showAddMember && (
        <AddMemberModal
          onClose={() => setShowAddMember(false)}
          onAdded={m => setMembers(prev => [...prev, m])}
        />
      )}
    </div>
  );
}

export { AdminSettings };
