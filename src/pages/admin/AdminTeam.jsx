import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const ROLE_LABELS = { owner: "Owner", manager: "Manager", accountant: "Accountant" };
const ROLE_COLORS = { owner: "#b45309", manager: "#0369a1", accountant: "#6d28d9" };
const ROLE_BG     = { owner: "#fef3c7", manager: "#e0f2fe", accountant: "#ede9fe" };

const ROLE_DESCRIPTIONS = {
  owner:      "Full access — all pages, team management, settings.",
  manager:    "Operations — customers, deliveries, orders, products, production, offers, campaigns, comms.",
  accountant: "Finance — billing, finance, analytics, refunds.",
};

function RoleBadge({ role, size = "sm" }) {
  const style = {
    display: "inline-block",
    padding: size === "sm" ? "2px 10px" : "4px 14px",
    borderRadius: 20,
    fontSize: size === "sm" ? "0.72rem" : "0.85rem",
    fontWeight: 600,
    background: ROLE_BG[role] || "#f3f4f6",
    color: ROLE_COLORS[role] || "#374151",
    letterSpacing: "0.02em",
  };
  return <span style={style}>{ROLE_LABELS[role] || role}</span>;
}

function AddMemberModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", adminRole: "manager" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const member = await api.adminTeamCreate(form);
      onAdded(member);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Add Team Member</h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "#6b7280" }}>✕</button>
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginBottom: "1rem", padding: "0.5rem 0.75rem", background: "#fef2f2", borderRadius: 8 }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>First Name *</label>
              <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.9rem", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Last Name</label>
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.9rem", boxSizing: "border-box" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.9rem", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Password *</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.9rem", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Role *</label>
            <select value={form.adminRole} onChange={e => setForm(f => ({ ...f, adminRole: e.target.value }))}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.9rem", boxSizing: "border-box", background: "#fff" }}>
              <option value="manager">Manager — Operations</option>
              <option value="accountant">Accountant — Finance</option>
              <option value="owner">Owner — Full access</option>
            </select>
            <p style={{ fontSize: "0.77rem", color: "#6b7280", marginTop: 4 }}>{ROLE_DESCRIPTIONS[form.adminRole]}</p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "none", background: "#4a7c59", color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.9rem", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Adding…" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [changingRole, setChangingRole] = useState(null); // member id being changed

  useEffect(() => {
    api.adminTeam()
      .then(setMembers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (member, newRole) => {
    if (newRole === member.adminRole) return;
    setChangingRole(member.id);
    try {
      await api.adminTeamSetRole(member.id, newRole);
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, adminRole: newRole } : m));
    } catch (err) {
      alert(err.message);
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemove = async (member) => {
    if (!window.confirm(`Remove admin access for ${member.firstName} ${member.lastName}? They will become a regular customer.`)) return;
    try {
      await api.adminTeamRemove(member.id);
      setMembers(prev => prev.filter(m => m.id !== member.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>Team</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>Manage admin access and role permissions.</p>
        </div>
        <button type="button" onClick={() => setShowAdd(true)}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", borderRadius: 10, border: "none", background: "#4a7c59", color: "#fff", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Add Member
        </button>
      </div>

      {/* Role legend */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
          <div key={role} style={{ background: "#fff", borderRadius: 12, padding: "1rem 1.25rem", border: `2px solid ${ROLE_BG[role]}` }}>
            <div style={{ marginBottom: "0.4rem" }}><RoleBadge role={role} size="md" /></div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.5 }}>{desc}</p>
          </div>
        ))}
      </div>

      {loading && <p style={{ color: "#6b7280" }}>Loading team…</p>}
      {error   && <p style={{ color: "#dc2626" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Member", "Email", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%", background: ROLE_COLORS[m.adminRole] || "#6b7280",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
                      }}>
                        {m.firstName[0]}{m.lastName?.[0] || ""}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{m.firstName} {m.lastName}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#6b7280", fontSize: "0.875rem" }}>{m.email}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <select
                      value={m.adminRole}
                      disabled={changingRole === m.id}
                      onChange={e => handleRoleChange(m, e.target.value)}
                      style={{
                        padding: "4px 10px", borderRadius: 20, border: `1px solid ${ROLE_COLORS[m.adminRole]}`,
                        background: ROLE_BG[m.adminRole], color: ROLE_COLORS[m.adminRole],
                        fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
                      }}
                    >
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="accountant">Accountant</option>
                    </select>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "#6b7280", fontSize: "0.875rem" }}>
                    {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <button type="button" onClick={() => handleRemove(m)}
                      style={{ background: "none", border: "1px solid #fca5a5", color: "#dc2626", padding: "4px 12px", borderRadius: 8, fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onAdded={member => setMembers(prev => [...prev, member])}
        />
      )}
    </div>
  );
}

export { AdminTeam };
