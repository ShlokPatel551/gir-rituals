import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllCustomers } from "../../lib/customerStore";
import "./AdminCustomers.css";
const AVATAR_COLORS = [
  "var(--admin-primary-fixed)",
  "#ffdcbd",
  "#ffdcc4",
  "var(--admin-surface-container-high)",
  "#c8e6c9",
  "#ffe0b2"
];
const MOCK_CUSTOMERS = [
  { clientId: "GR00124", name: "Priya Shah", initials: "PS", email: "priya.shah@gmail.com", phone: "9876501001", city: "Ahmedabad", joined: "12 Jan 2026", status: "active", avatarBg: AVATAR_COLORS[0] },
  { clientId: "GR00089", name: "Rahul Mehta", initials: "RM", email: "rahul.mehta@yahoo.com", phone: "9876502002", city: "Ahmedabad", joined: "05 Feb 2026", status: "active", avatarBg: AVATAR_COLORS[1] },
  { clientId: "GR00201", name: "Anjali Kapoor", initials: "AK", email: "anjali.k@hotmail.com", phone: "9876503003", city: "Surat", joined: "20 Feb 2026", status: "active", avatarBg: AVATAR_COLORS[2] },
  { clientId: "GR00057", name: "Meena Patel", initials: "MP", email: "meena.patel@gmail.com", phone: "9876504004", city: "Ahmedabad", joined: "08 Nov 2025", status: "paused", avatarBg: AVATAR_COLORS[3] },
  { clientId: "GR00312", name: "Suresh Joshi", initials: "SJ", email: "suresh.j@gmail.com", phone: "9876505005", city: "Vadodara", joined: "15 Mar 2026", status: "active", avatarBg: AVATAR_COLORS[4] },
  { clientId: "GR00098", name: "Kavita Rao", initials: "KR", email: "kavita.rao@rediffmail.com", phone: "9876506006", city: "Ahmedabad", joined: "03 Dec 2025", status: "active", avatarBg: AVATAR_COLORS[5] },
  { clientId: "GR00143", name: "Deepak Nair", initials: "DN", email: "deepak.nair@gmail.com", phone: "9876507007", city: "Rajkot", joined: "28 Mar 2026", status: "new", avatarBg: AVATAR_COLORS[0] },
  { clientId: "GR00178", name: "Sunita Verma", initials: "SV", email: "sunita.v@gmail.com", phone: "9876508008", city: "Ahmedabad", joined: "14 Apr 2026", status: "active", avatarBg: AVATAR_COLORS[1] },
  { clientId: "GR00234", name: "Arjun Desai", initials: "AD", email: "arjun.desai@outlook.com", phone: "9876509009", city: "Surat", joined: "01 May 2026", status: "new", avatarBg: AVATAR_COLORS[2] },
  { clientId: "GR00267", name: "Pooja Sharma", initials: "PS", email: "pooja.s@gmail.com", phone: "9876510010", city: "Gandhinagar", joined: "10 May 2026", status: "paused", avatarBg: AVATAR_COLORS[3] }
];
function storedToDisplay(c, i) {
  const name = `${c.firstName} ${c.lastName}`;
  const initials = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
  return {
    clientId: c.clientId,
    name,
    initials,
    email: c.email,
    phone: c.phone,
    city: c.deliveryAddress.city,
    joined: new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    status: "active",
    avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length]
  };
}
const STATUS_LABEL = {
  active: "Active",
  paused: "Paused",
  new: "New"
};
const STATUS_CLASS = {
  active: "admin-badge-active",
  paused: "admin-badge-pending",
  new: "cust-badge-new"
};
function AdminCustomers() {
  const navigate = useNavigate();
  const realCustomers = getAllCustomers();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const allCustomers = useMemo(() => {
    const real = realCustomers.map((c, i) => storedToDisplay(c, i));
    const realIds = new Set(real.map((c) => c.clientId));
    const mocks = MOCK_CUSTOMERS.filter((m) => !realIds.has(m.clientId));
    return [...real, ...mocks];
  }, [realCustomers]);
  const filtered = useMemo(() => {
    let list = allCustomers;
    if (filter !== "all") list = list.filter((c) => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.clientId.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCustomers, filter, search]);
  const counts = {
    all: allCustomers.length,
    active: allCustomers.filter((c) => c.status === "active").length,
    paused: allCustomers.filter((c) => c.status === "paused").length,
    new: allCustomers.filter((c) => c.status === "new").length
  };
  return <div className="cust-page">

      {
    /* ── Header ── */
  }
      <div className="cust-header-row">
        <div>
          <h2 className="cust-page-title">Customers</h2>
          <p className="cust-page-sub">All registered and OTP-verified subscribers</p>
        </div>
        <button type="button" className="cust-btn-filled">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Add customer
        </button>
      </div>

      {
    /* ── Metric cards ── */
  }
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

      {
    /* ── Search + filters ── */
  }
      <div className="cust-toolbar">
        <div className="cust-search-wrap">
          <span className="material-symbols-outlined cust-search-icon">search</span>
          <input
    type="text"
    className="cust-search-input"
    placeholder="Search by name, email, phone or city…"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
          {search && <button type="button" className="cust-search-clear" onClick={() => setSearch("")}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>}
        </div>
        <div className="cust-filter-tabs">
          {["all", "active", "paused", "new"].map((tab) => <button
    key={tab}
    type="button"
    className={`cust-tab ${filter === tab ? "cust-tab-active" : ""}`}
    onClick={() => setFilter(tab)}
  >
              {tab === "all" ? "All" : STATUS_LABEL[tab]}
              <span className="cust-tab-count">{counts[tab]}</span>
            </button>)}
        </div>
      </div>

      {
    /* ── Table ── */
  }
      <div className="bento-card cust-table-card">
        {filtered.length === 0 ? <div className="cust-empty">
            <span className="material-symbols-outlined cust-empty-icon">search_off</span>
            <p className="cust-empty-title">No customers found</p>
            <p className="cust-empty-sub">Try adjusting your search or filter.</p>
          </div> : <>
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
                  {filtered.map((c) => <tr key={c.clientId}>
                      <td>
                        <div className="adm-customer-cell">
                          <div className="adm-avatar" style={{ background: c.avatarBg }}>
                            {c.initials}
                          </div>
                          <span className="adm-customer-name">{c.name}</span>
                        </div>
                      </td>
                      <td>
                        <code className="cust-client-id">{c.clientId}</code>
                      </td>
                      <td className="adm-cell-muted">{c.email}</td>
                      <td className="adm-cell-muted">{c.phone}</td>
                      <td className="adm-cell-muted">{c.city}</td>
                      <td className="adm-cell-muted">{c.joined}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`admin-badge ${STATUS_CLASS[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="cust-action-row">
                          <Link to={`/admin/customers/${c.clientId}`} className="adm-view-btn" style={{ textDecoration: "none" }}>View</Link>
                          <button type="button" className="adm-view-btn" onClick={() => navigate("/admin/comms")}>Message</button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <div className="cust-table-footer">
              <span>Showing {filtered.length} of {allCustomers.length} customers</span>
            </div>
          </>}
      </div>

    </div>;
}
export {
  AdminCustomers
};
