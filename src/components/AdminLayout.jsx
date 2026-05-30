import { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getAdminSession, logoutAdmin, ADMIN_ACCOUNTS, switchAdminAccount } from "../lib/adminAuth";
import { ADMIN_NOTIFS } from "../data/adminNotifications";
import "./AdminLayout.css";
const NAV = [
  { path: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { path: "/admin/customers", label: "Customers", icon: "group" },
  { path: "/admin/deliveries", label: "Deliveries", icon: "local_shipping" },
  { path: "/admin/orders", label: "Orders", icon: "shopping_cart" },
  { path: "/admin/products", label: "Products", icon: "inventory_2" },
  { path: "/admin/production", label: "Production", icon: "agriculture" },
  { path: "/admin/finance", label: "Finance", icon: "payments" },
  { path: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { path: "/admin/billing", label: "Billing", icon: "receipt_long" },
  { path: "/admin/offers", label: "Offers", icon: "local_activity" },
  { path: "/admin/campaigns", label: "Campaigns", icon: "campaign" },
  { path: "/admin/comms", label: "Comms", icon: "chat" },
  { path: "/admin/settings", label: "Settings", icon: "settings" }
];
function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => getAdminSession());
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [readIds, setReadIds] = useState(
    () => new Set(ADMIN_NOTIFS.filter((n) => n.read).map((n) => n.id))
  );
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const currentAccount = ADMIN_ACCOUNTS.find((a) => a.email === admin?.email) ?? ADMIN_ACCOUNTS[0];
  const otherAccounts = ADMIN_ACCOUNTS.filter((a) => a.email !== admin?.email);
  const notifs = ADMIN_NOTIFS.map((n) => ({ ...n, read: readIds.has(n.id) }));
  const unread = notifs.filter((n) => !n.read).length;
  function markAllRead() {
    setReadIds(new Set(ADMIN_NOTIFS.map((n) => n.id)));
  }
  function handleNotifClick(link, id) {
    setReadIds((prev) => /* @__PURE__ */ new Set([...prev, id]));
    setNotifOpen(false);
    navigate(link);
  }
  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);
  return <div className="admin-shell">
      {
    /* ── Fixed sidebar ── */
  }
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h1 className="admin-brand-title">Gir Rituals</h1>
          <p className="admin-brand-sub">Premium Admin</p>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => <NavLink
    key={item.path}
    to={item.path}
    end={item.end}
    className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
  >
              <span className="material-symbols-outlined admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>)}
        </nav>

        <div className="admin-sidebar-bottom">
          <button type="button" className="admin-support-btn" onClick={handleLogout}>
            Support Center
          </button>
          <Link to="/login" className="admin-back-link">← Customer app</Link>
        </div>
      </aside>

      {
    /* ── Fixed top header ── */
  }
      <header className="admin-topbar">
        <div className="admin-search-wrap">
          <span className="material-symbols-outlined admin-search-icon">search</span>
          <input
    type="text"
    className="admin-search-input"
    placeholder="Search data, orders, customers..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
        </div>
        <div className="admin-topbar-actions">

          {
    /* Notification bell + dropdown */
  }
          <div className="admin-notif-wrap" ref={notifRef}>
            <button
    type="button"
    className="admin-icon-btn"
    aria-label="Notifications"
    onClick={() => setNotifOpen((o) => !o)}
  >
              <span className="material-symbols-outlined">notifications</span>
              {unread > 0 && <span className="admin-notif-badge">{unread}</span>}
            </button>

            {notifOpen && <div className="admin-notif-dropdown">
                <div className="admin-notif-header">
                  <h4 className="admin-notif-title">Notifications</h4>
                  {unread > 0 && <button type="button" className="admin-notif-mark-all" onClick={markAllRead}>
                      Mark all read
                    </button>}
                </div>

                <div className="admin-notif-list">
                  {notifs.map((n) => <button
    key={n.id}
    type="button"
    className={`admin-notif-item ${!n.read ? "admin-notif-item-unread" : ""}`}
    onClick={() => handleNotifClick(n.link, n.id)}
  >
                      <div className="admin-notif-icon-wrap" style={{ background: n.bg }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: n.color }}>
                          {n.icon}
                        </span>
                      </div>
                      <div className="admin-notif-content">
                        <p className="admin-notif-item-title">{n.title}</p>
                        <p className="admin-notif-item-desc">{n.desc}</p>
                        <span className="admin-notif-item-time">{n.time}</span>
                      </div>
                      {!n.read && <span className="admin-notif-unread-dot" />}
                    </button>)}
                </div>

                <div className="admin-notif-footer">
                  <button
    type="button"
    className="admin-notif-view-all"
    onClick={() => {
      setNotifOpen(false);
      navigate("/admin");
    }}
  >
                    View all activity →
                  </button>
                </div>
              </div>}
          </div>

          <button type="button" className="admin-icon-btn" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>

          {
    /* User pill + dropdown */
  }
          <div className="admin-user-menu-wrap" ref={userMenuRef}>
            <button
    type="button"
    className="admin-user-pill"
    onClick={() => setUserMenuOpen((o) => !o)}
    aria-label="User menu"
  >
              <div className="admin-topbar-user-info">
                <p className="admin-topbar-name">{admin?.name ?? "Admin"}</p>
                <p className="admin-topbar-org">Gir Rituals HQ</p>
              </div>
              <div className="admin-topbar-avatar" style={{ background: currentAccount.avatarBg }}>
                {currentAccount.initials}
              </div>
            </button>

            {userMenuOpen && <div className="admin-user-dropdown">
                {
    /* Profile header */
  }
                <div className="admin-user-dd-header">
                  <div className="admin-user-dd-avatar" style={{ background: currentAccount.avatarBg }}>
                    {currentAccount.initials}
                  </div>
                  <div className="admin-user-dd-info">
                    <p className="admin-user-dd-name">{currentAccount.name}</p>
                    <p className="admin-user-dd-email">{currentAccount.email}</p>
                    <span className="admin-user-dd-role-badge">{currentAccount.role}</span>
                  </div>
                </div>

                {
    /* Switch account */
  }
                <div className="admin-user-dd-section">
                  <p className="admin-user-dd-section-label">Switch account</p>
                  {otherAccounts.map((acc) => <button
    key={acc.email}
    type="button"
    className="admin-user-dd-account-btn"
    onClick={() => {
      switchAdminAccount(acc.email);
      setAdmin(getAdminSession());
      setUserMenuOpen(false);
    }}
  >
                      <div className="admin-user-dd-acc-avatar" style={{ background: acc.avatarBg }}>
                        {acc.initials}
                      </div>
                      <div>
                        <p className="admin-user-dd-acc-name">{acc.name}</p>
                        <p className="admin-user-dd-acc-role">{acc.role}</p>
                      </div>
                    </button>)}
                </div>

                <div className="admin-user-dd-divider" />

                {
    /* Quick links */
  }
                <div className="admin-user-dd-links">
                  <button
    type="button"
    className="admin-user-dd-link"
    onClick={() => {
      setUserMenuOpen(false);
      navigate("/admin/settings");
    }}
  >
                    <span className="material-symbols-outlined">settings</span>
                    Settings
                  </button>
                  <button
    type="button"
    className="admin-user-dd-link"
    onClick={() => {
      setUserMenuOpen(false);
      navigate("/");
    }}
  >
                    <span className="material-symbols-outlined">storefront</span>
                    Customer App
                  </button>
                </div>

                <div className="admin-user-dd-divider" />

                {
    /* Logout */
  }
                <div className="admin-user-dd-footer">
                  <button
    type="button"
    className="admin-user-dd-logout"
    onClick={() => {
      logoutAdmin();
      navigate("/admin/login");
    }}
  >
                    <span className="material-symbols-outlined">logout</span>
                    Sign out
                  </button>
                </div>
              </div>}
          </div>
        </div>
      </header>

      {
    /* ── Scrollable main content ── */
  }
      <main className="admin-main">
        <div className="admin-content-inner">
          <Outlet />
        </div>
      </main>
    </div>;
}
export {
  AdminLayout
};
