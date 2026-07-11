import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomers.css";

const PAGE_SIZE = 10;

const AVATAR_PALETTE = [
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#f3e8ff", color: "#6b21a8" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#e0f2fe", color: "#0c4a6e" },
];

const STATUS_META = {
  active:     { label: "Active",     cls: "cust-badge-active"   },
  new:        { label: "Onboarding", cls: "cust-badge-active"   },
  paused:     { label: "Paused",     cls: "cust-badge-paused"   },
  inactive:   { label: "Inactive",   cls: "cust-badge-inactive" },
  terminated: { label: "Terminated", cls: "cust-badge-inactive" },
  churned:    { label: "Churned",    cls: "cust-badge-inactive" },
};

const DELIVERY_META = {
  active:     { icon: "check_circle",  label: "Active",      cls: "cust-del-active"   },
  new:        { icon: "verified",      label: "Active",      cls: "cust-del-active"   },
  paused:     { icon: "pause_circle",  label: "Paused",      cls: "cust-del-paused"   },
  inactive:   { icon: "cancel",        label: "Terminated",  cls: "cust-del-inactive" },
  terminated: { icon: "cancel",        label: "Terminated",  cls: "cust-del-inactive" },
  churned:    { icon: "heart_broken",  label: "Churned",     cls: "cust-del-muted"    },
};

const TABS = [
  { key: "all",          label: "All customers"          },
  { key: "active",       label: "Active"                 },
  { key: "subscription", label: "Subscriptions"          },
  { key: "inactive",     label: "Inactive"               },
];

function toDisplay(c, i) {
  const firstName = c.firstName || "";
  const lastName  = c.lastName  || "";
  const name      = `${firstName} ${lastName}`.trim() || c.email;
  const initials  = `${firstName[0] || "?"}${lastName[0] || ""}`.toUpperCase();
  const status    = c.status || "active";
  const palette   = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
  return {
    clientId: c.clientId,
    name, initials, email: c.email,
    phone:  c.phone  || "—",
    state:  c.state  || "—",
    city:   c.city   || "—",
    joined: c.createdAt
      ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    type:           c.hasSubscription ? "Subscription" : "One-time",
    isSubscription: !!c.hasSubscription,
    status,
    avatarBg:    palette.bg,
    avatarColor: palette.color,
  };
}

function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search,    setSearch]    = useState("");
  const [tab,       setTab]       = useState("all");
  const [page,      setPage]      = useState(1);

  useEffect(() => {
    api.adminCustomers().then(d => setCustomers(d.rows ?? [])).catch(() => {});
  }, []);

  const all = useMemo(() => customers.map(toDisplay), [customers]);

  const filtered = useMemo(() => {
    let list = all;
    if (tab === "active")       list = list.filter(c => c.status === "active" || c.status === "new");
    if (tab === "subscription") list = list.filter(c => c.isSubscription);
    if (tab === "inactive")     list = list.filter(c => c.status === "inactive" || c.status === "terminated" || c.status === "churned");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q)  ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)               ||
        c.clientId.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [all, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeTab(key) { setTab(key); setPage(1); }
  function changePage(p)  { setPage(Math.max(1, Math.min(p, totalPages))); }

  const counts = {
    all:          all.length,
    active:       all.filter(c => c.status === "active" || c.status === "new").length,
    subscription: all.filter(c => c.isSubscription).length,
    inactive:     all.filter(c => ["inactive","terminated","churned"].includes(c.status)).length,
  };

  const kpis = [
    { label: "Total customers",    value: all.length || "—",             sub: "Registered on app or website", top: "green", trend: "up",   badge: "+12% from last month" },
    { label: "Active subscribers", value: counts.subscription || "—",    sub: "Daily delivery customers",     top: "teal",  trend: "up",   badge: "+2 this week"         },
    { label: "New this month",     value: all.filter(c => c.status === "new").length || "3", sub: "Joined in July 2026",  top: "blue",  trend: "up",   badge: "+22 this month"       },
    { label: "Inactive / churned", value: counts.inactive || "—",        sub: "No active delivery",           top: "red",   trend: "warn", badge: "Needs follow-up"       },
  ];

  const TREND_ICON = { up: "trending_up", warn: "warning" };

  function renderPagination() {
    if (totalPages <= 1) return null;
    const pages = [];
    const show  = new Set([1, 2, totalPages]);
    if (page > 1) show.add(page - 1);
    show.add(page);
    if (page < totalPages) show.add(page + 1);
    const sorted = [...show].sort((a, b) => a - b);
    let prev = 0;
    sorted.forEach(p => {
      if (p - prev > 1) pages.push("...");
      pages.push(p);
      prev = p;
    });
    return (
      <div className="cust-pagination">
        <p className="cust-pag-info">
          Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of {filtered.length} customers
        </p>
        <div className="cust-pag-controls">
          <button className="cust-pag-arrow" onClick={() => changePage(page - 1)} disabled={page === 1}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e-${i}`} className="cust-pag-ellipsis">…</span>
            ) : (
              <button key={p} className={`cust-pag-btn${p === page ? " active" : ""}`} onClick={() => changePage(p)}>{p}</button>
            )
          )}
          <button className="cust-pag-arrow" onClick={() => changePage(page + 1)} disabled={page === totalPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cust-page">

      {/* ── Header ── */}
      <div className="cust-header-row">
        <div>
          <h2 className="cust-page-title">Customers</h2>
          <p className="cust-page-sub">Manage your artisanal community and subscriptions</p>
        </div>
        <div className="cust-header-actions">
          <button type="button" className="cust-btn-outline">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
          <button type="button" className="cust-btn-filled" onClick={() => navigate("/admin/customers/new")}>
            <span className="material-symbols-outlined">person_add</span>
            New Customer
          </button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="cust-kpi-strip">
        {kpis.map(k => (
          <div key={k.label} className={`cust-kpi-card cust-top-${k.top}`}>
            <div className="cust-kpi-label">{k.label}</div>
            <div className="cust-kpi-value">{k.value}</div>
            <div className="cust-kpi-sub">{k.sub}</div>
            <span className={`cust-trend-badge cust-trend-${k.trend}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{TREND_ICON[k.trend]}</span>
              {k.badge}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tabs + search ── */}
      <div className="cust-tabs-row">
        <div className="cust-tabs">
          {TABS.map(t => (
            <button key={t.key} type="button"
              className={`cust-tab${tab === t.key ? " cust-tab-active" : ""}`}
              onClick={() => changeTab(t.key)}
            >
              {t.label}
              <span className={`cust-tab-count${tab === t.key ? " active" : ""}`}>{counts[t.key]}</span>
            </button>
          ))}
        </div>
        <div className="cust-search-wrap">
          <span className="material-symbols-outlined cust-search-icon">search</span>
          <input
            type="text"
            className="cust-search-input"
            placeholder="Search by name, phone, city…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button type="button" className="cust-search-clear" onClick={() => setSearch("")}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="cust-table-card">
        {paginated.length === 0 ? (
          <div className="cust-empty">
            <span className="material-symbols-outlined cust-empty-icon">search_off</span>
            <p className="cust-empty-title">No customers found</p>
            <p className="cust-empty-sub">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            <div className="cust-table-scroll">
              <table className="cust-table">
                <thead>
                  <tr>
                    <th>Client ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Registered</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Delivery</th>
                    <th className="cust-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(c => {
                    const sm = STATUS_META[c.status]   || STATUS_META.active;
                    const dm = DELIVERY_META[c.status] || DELIVERY_META.active;
                    return (
                      <tr key={c.clientId} className="cust-tr" onClick={() => navigate(`/admin/customers/${c.clientId}`)}>
                        <td className="cust-td-id">{c.clientId}</td>
                        <td>
                          <div className="cust-customer-cell">
                            <div className="cust-avatar" style={{ background: c.avatarBg, color: c.avatarColor }}>
                              {c.initials}
                            </div>
                            <div>
                              <div className="cust-name">{c.name}</div>
                              <div className="cust-email">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="cust-td-muted">{c.phone}</td>
                        <td className="cust-td-muted">
                          {c.city !== "—" && c.state !== "—" ? `${c.city}, ${c.state}` : c.city !== "—" ? c.city : c.state}
                        </td>
                        <td className="cust-td-muted">{c.joined}</td>
                        <td>
                          <span className={`cust-type-badge${c.isSubscription ? " sub" : " one"}`}>{c.type}</span>
                        </td>
                        <td>
                          <span className={`cust-status-badge ${sm.cls}`}>{sm.label}</span>
                        </td>
                        <td>
                          <div className={`cust-del-status ${dm.cls}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>{dm.icon}</span>
                            {dm.label}
                          </div>
                        </td>
                        <td className="cust-td-actions" onClick={e => e.stopPropagation()}>
                          <button type="button" className="cust-view-btn" onClick={() => navigate(`/admin/customers/${c.clientId}`)}>
                            View profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        )}
      </div>

    </div>
  );
}

export { AdminCustomers };
