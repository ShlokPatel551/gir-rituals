import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminCustomers.css";

const PAGE_SIZE = 10;

const AVATAR_COLORS = [
  "var(--admin-primary-fixed)",
  "#ffdcbd",
  "#ffdcc4",
  "var(--admin-surface-container-high)",
  "#c8e6c9",
  "#ffe0b2",
];

const DELIVERY_STATUS = {
  active:     { icon: "check_circle",  label: "Active",      cls: "cust-ds-active"    },
  paused:     { icon: "pause_circle",  label: "Paused",      cls: "cust-ds-paused"    },
  new:        { icon: "verified",      label: "Onboarding",  cls: "cust-ds-active"    },
  inactive:   { icon: "cancel",        label: "Terminated",  cls: "cust-ds-error"     },
  terminated: { icon: "cancel",        label: "Terminated",  cls: "cust-ds-error"     },
  churned:    { icon: "heart_broken",  label: "Churned",     cls: "cust-ds-muted"     },
};

function toDisplay(c, i) {
  const firstName = c.firstName || "";
  const lastName  = c.lastName  || "";
  const name      = `${firstName} ${lastName}`.trim() || c.email;
  const initials  = `${firstName[0] || "?"}${lastName[0] || ""}`.toUpperCase();
  const status    = c.status || "active";
  return {
    clientId:  c.clientId,
    name,
    initials,
    email:   c.email,
    phone:   c.phone  || "—",
    state:   c.state || "—",
    city:    c.city  || "—",
    joined:  c.createdAt
      ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    type:    c.hasSubscription ? "Subscription" : "Non-subscription",
    status,
    isSubscription: !!c.hasSubscription,
    avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
  };
}

const TABS = [
  { key: "all",          label: "All customers"          },
  { key: "new",          label: "New customers"          },
  { key: "subscription", label: "Subscription customers" },
];

function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState("all");
  const [page,      setPage]      = useState(1);

  useEffect(() => {
    api.adminCustomers().then(data => setCustomers(data.rows ?? [])).catch(() => {});
  }, []);

  const allCustomers = useMemo(() => customers.map(toDisplay), [customers]);

  const filtered = useMemo(() => {
    let list = allCustomers;
    if (filter === "new")          list = list.filter(c => c.status === "new");
    if (filter === "subscription") list = list.filter(c => c.isSubscription);
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
  }, [allCustomers, filter, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changePage(p) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function handleFilterChange(key) {
    setFilter(key);
    setPage(1);
  }

  const counts = {
    all:          allCustomers.length,
    new:          allCustomers.filter(c => c.status === "new").length,
    subscription: allCustomers.filter(c => c.isSubscription).length,
  };

  function renderPagination() {
    if (totalPages <= 1) return null;
    const pages = [];
    const showPages = new Set([1, 2, 3, totalPages]);
    if (page > 1) showPages.add(page - 1);
    showPages.add(page);
    if (page < totalPages) showPages.add(page + 1);

    const sorted = [...showPages].sort((a, b) => a - b);
    let prev = 0;
    sorted.forEach(p => {
      if (p - prev > 1) pages.push("...");
      pages.push(p);
      prev = p;
    });

    return (
      <div className="cust-pagination">
        <p className="cust-pagination-info">
          Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of {filtered.length} customers
        </p>
        <div className="cust-pagination-controls">
          <button className="cust-page-arrow" onClick={() => changePage(page - 1)} disabled={page === 1}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e-${i}`} className="cust-page-ellipsis">...</span>
            ) : (
              <button
                key={p}
                className={`cust-page-btn ${p === page ? "cust-page-active" : ""}`}
                onClick={() => changePage(p)}
              >{p}</button>
            )
          )}
          <button className="cust-page-arrow" onClick={() => changePage(page + 1)} disabled={page === totalPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cust-page">

      {/* Page header */}
      <div className="cust-header-row">
        <div>
          <h2 className="cust-page-title">Customers</h2>
          <p className="cust-page-sub">Manage your artisanal community and orders</p>
        </div>
        <button type="button" className="cust-btn-filled" onClick={() => navigate("/admin/orders/new")}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person_add</span>
          New Customer
        </button>
      </div>

      {/* Metric cards */}
      <div className="cust-metrics-grid">
        <div className="cust-metric-card">
          <p className="cust-metric-label">Total customers</p>
          <h3 className="cust-metric-value">{allCustomers.length || "—"}</h3>
          <div className="cust-metric-trend cust-trend-up">
            <span className="material-symbols-outlined cust-trend-icon">trending_up</span>
            <span>+12% from last month</span>
          </div>
        </div>
        <div className="cust-metric-card">
          <p className="cust-metric-label">New customers</p>
          <h3 className="cust-metric-value">{counts.new || "—"}</h3>
          <div className="cust-metric-trend cust-trend-up">
            <span className="material-symbols-outlined cust-trend-icon">person_add</span>
            <span>+22 this week</span>
          </div>
        </div>
        <div className="cust-metric-card">
          <p className="cust-metric-label">New subscription customers</p>
          <h3 className="cust-metric-value">{counts.subscription || "—"}</h3>
          <div className="cust-metric-trend cust-trend-neutral">
            <span className="material-symbols-outlined cust-trend-icon">loyalty</span>
            <span>4.3% conversion rate</span>
          </div>
        </div>
      </div>

      {/* Tab bar + search */}
      <div className="cust-tabs-row">
        <div className="cust-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`cust-tab ${filter === tab.key ? "cust-tab-active" : ""}`}
              onClick={() => handleFilterChange(tab.key)}
            >
              {tab.label}
              <span className="cust-tab-count">{counts[tab.key] ?? allCustomers.length}</span>
            </button>
          ))}
        </div>
        <div className="cust-search-wrap">
          <span className="material-symbols-outlined cust-search-icon">search</span>
          <input
            type="text"
            className="cust-search-input"
            placeholder="Search customers…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button type="button" className="cust-search-clear" onClick={() => setSearch("")}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
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
                    <th>Customer Name</th>
                    <th>Phone No</th>
                    <th>State</th>
                    <th>City</th>
                    <th>Registered Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Account &amp; Delivery Status</th>
                    <th className="cust-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(c => {
                    const ds = DELIVERY_STATUS[c.status] || DELIVERY_STATUS.active;
                    const isActive = c.status === "active" || c.status === "new";
                    return (
                      <tr key={c.clientId} onClick={() => navigate(`/admin/customers/${c.clientId}`)} className="cust-tr">
                        <td className="cust-client-id">{c.clientId}</td>
                        <td><span className="cust-name">{c.name}</span></td>
                        <td className="cust-muted">{c.phone}</td>
                        <td className="cust-muted">{c.state}</td>
                        <td className="cust-muted">{c.city}</td>
                        <td className="cust-muted">{c.joined}</td>
                        <td>
                          <span className="cust-type-label">{c.type}</span>
                        </td>
                        <td>
                          <span className={`cust-status-badge ${isActive ? "cust-status-active" : "cust-status-inactive"}`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className={`cust-ds ${ds.cls}`}>
                            <span className="material-symbols-outlined cust-ds-icon">{ds.icon}</span>
                            <span>{ds.label}</span>
                          </div>
                        </td>
                        <td className="cust-actions-cell" onClick={e => e.stopPropagation()}>
                          <div className="cust-action-row">
                            <Link
                              to={`/admin/customers/${c.clientId}`}
                              className="cust-edit-link"
                              onClick={e => e.stopPropagation()}
                            >Edit</Link>
                            <button
                              type="button"
                              className="cust-view-btn"
                              onClick={() => navigate(`/admin/customers/${c.clientId}`)}
                            >View</button>
                          </div>
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
