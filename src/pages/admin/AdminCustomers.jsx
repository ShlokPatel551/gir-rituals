import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomers.css";

const AVATAR_COLORS = [
  "var(--admin-primary-fixed)",
  "#ffdcbd",
  "#ffdcc4",
  "var(--admin-surface-container-high)",
  "#c8e6c9",
  "#ffe0b2"
];

const STATUS_LABEL = { active: "Active", paused: "Paused", new: "New" };
const STATUS_CLASS  = { active: "admin-badge-active", paused: "admin-badge-pending", new: "cust-badge-new" };

function toDisplay(c, i) {
  const name = `${c.firstName} ${c.lastName}`;
  const initials = `${(c.firstName[0] || "?")}${(c.lastName[0] || "?")}`.toUpperCase();
  return {
    clientId: c.clientId,
    name,
    initials,
    email: c.email,
    phone: c.phone || "",
    city: c.deliveryAddress?.city || c.city || "—",
    joined: c.createdAt
      ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    status: c.status || "active",
    avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
  };
}

function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.adminCustomers().then(data => setCustomers(data)).catch(() => {});
  }, []);

  const allCustomers = useMemo(() => customers.map(toDisplay), [customers]);

  const filtered = useMemo(() => {
    let list = allCustomers;
    if (filter !== "all") list = list.filter(c => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.clientId.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCustomers, filter, search]);

  const counts = {
    all:    allCustomers.length,
    active: allCustomers.filter(c => c.status === "active").length,
    paused: allCustomers.filter(c => c.status === "paused").length,
    new:    allCustomers.filter(c => c.status === "new").length,
  };

  return (
    <div className="cust-page">
      <div className="cust-header-row">
        <div>
          <h2 className="cust-page-title">Customers</h2>
          <p className="cust-page-sub">All registered subscribers</p>
        </div>
        <button type="button" className="cust-btn-filled">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Add customer
        </button>
      </div>

      <div className="cust-metrics-grid">
        <div className="bento-card cust-metric-card">
          <p className="cust-metric-label">Total customers</p>
          <div className="cust-metric-row">
            <span className="cust-metric-value">{counts.all}</span>
            <span className="adm-metric-badge adm-badge-green">+12 this month</span>
          </div>
        </div>
        <div className="bento-card cust-metric-card">
          <p className="cust-metric-label">Active subscriptions</p>
          <div className="cust-metric-row">
            <span className="cust-metric-value cust-val-tint">{counts.active}</span>
            <span className="adm-metric-badge adm-badge-green">+5 this week</span>
          </div>
        </div>
        <div className="bento-card cust-metric-card">
          <p className="cust-metric-label">New this month</p>
          <div className="cust-metric-row">
            <span className="cust-metric-value">{counts.new}</span>
            <span className="adm-metric-badge adm-badge-green">Onboarding</span>
          </div>
        </div>
        <div className="bento-card cust-metric-card">
          <p className="cust-metric-label">Paused</p>
          <div className="cust-metric-row">
            <span className="cust-metric-value cust-val-error">{counts.paused}</span>
            <span className="adm-metric-badge adm-badge-tan">Needs follow-up</span>
          </div>
        </div>
      </div>

      <div className="cust-toolbar">
        <div className="cust-search-wrap">
          <span className="material-symbols-outlined cust-search-icon">search</span>
          <input
            type="text"
            className="cust-search-input"
            placeholder="Search by name, email, phone or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="cust-search-clear" onClick={() => setSearch("")}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
        <div className="cust-filter-tabs">
          {["all", "active", "paused", "new"].map(tab => (
            <button
              key={tab}
              type="button"
              className={`cust-tab ${filter === tab ? "cust-tab-active" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab === "all" ? "All" : STATUS_LABEL[tab]}
              <span className="cust-tab-count">{counts[tab]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bento-card cust-table-card">
        {filtered.length === 0 ? (
          <div className="cust-empty">
            <span className="material-symbols-outlined cust-empty-icon">search_off</span>
            <p className="cust-empty-title">No customers found</p>
            <p className="cust-empty-sub">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap" style={{ borderRadius: 0, border: "none" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Client ID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.clientId}>
                      <td>
                        <div className="adm-customer-cell">
                          <div className="adm-avatar" style={{ background: c.avatarBg }}>{c.initials}</div>
                          <span className="adm-customer-name">{c.name}</span>
                        </div>
                      </td>
                      <td><code className="cust-client-id">{c.clientId}</code></td>
                      <td className="adm-cell-muted">{c.email}</td>
                      <td className="adm-cell-muted">{c.phone}</td>
                      <td className="adm-cell-muted">{c.city}</td>
                      <td className="adm-cell-muted">{c.joined}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`admin-badge ${STATUS_CLASS[c.status] || "admin-badge-active"}`}>
                          {STATUS_LABEL[c.status] || "Active"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="cust-action-row">
                          <Link to={`/admin/customers/${c.clientId}`} className="adm-view-btn" style={{ textDecoration: "none" }}>View</Link>
                          <button type="button" className="adm-view-btn" onClick={() => navigate("/admin/comms")}>Message</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cust-table-footer">
              <span>Showing {filtered.length} of {allCustomers.length} customers</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { AdminCustomers };
