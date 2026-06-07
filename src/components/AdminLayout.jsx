import { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getAdminSession, logoutAdmin } from "../lib/adminAuth";
import { ADMIN_NOTIFS } from "../data/adminNotifications";
import "./AdminLayout.css";

const NAV = [
  { path: "/admin",            label: "Dashboard",  icon: "dashboard",       end: true },
  { path: "/admin/customers",  label: "Customers",  icon: "group"                     },
  { path: "/admin/deliveries", label: "Deliveries", icon: "local_shipping"            },
  { path: "/admin/orders",     label: "Orders",     icon: "shopping_cart"             },
  { path: "/admin/products",   label: "Products",   icon: "inventory_2"               },
  { path: "/admin/production", label: "Production", icon: "agriculture"               },
  { path: "/admin/finance",    label: "Finance",    icon: "payments"                  },
  { path: "/admin/analytics",  label: "Analytics",  icon: "analytics"                 },
  { path: "/admin/billing",    label: "Billing",    icon: "receipt_long"              },
  { path: "/admin/offers",     label: "Offers",     icon: "local_activity"            },
  { path: "/admin/campaigns",  label: "Campaigns",  icon: "campaign"                  },
  { path: "/admin/comms",      label: "Comms",      icon: "chat"                      },
  { path: "/admin/settings",   label: "Settings",   icon: "settings"                  },
];

function SidebarContent({ onNavClick, onLogout }) {
  return (
    <>
      <div className="admin-brand">
        <div className="admin-brand-logo-row">
          <div className="admin-brand-icon-box">
            <span className="material-symbols-outlined admin-brand-eco">eco</span>
          </div>
          <div>
            <h1 className="admin-brand-title">Gir Rituals</h1>
            <p className="admin-brand-sub">Premium Dairy Admin</p>
          </div>
        </div>
      </div>

      <nav className="admin-nav">
        {NAV.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
            onClick={onNavClick}
          >
            <span className="material-symbols-outlined admin-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-bottom">
        <button type="button" className="admin-support-btn" onClick={onLogout}>
          Support Center
        </button>
        <Link to="/login" className="admin-back-link" onClick={onNavClick}>← Customer app</Link>
      </div>
    </>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const [admin]         = useState(() => getAdminSession());
  const [searchQuery,    setSearchQuery]    = useState("");
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const notifRef   = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef  = useRef(null);

  const adminName     = admin?.name  ?? "Admin";
  const adminEmail    = admin?.email ?? "";
  const adminInitials = adminName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const [readIds, setReadIds] = useState(
    () => new Set(ADMIN_NOTIFS.filter(n => n.read).map(n => n.id))
  );
  const notifs = ADMIN_NOTIFS.map(n => ({ ...n, read: readIds.has(n.id) }));
  const unread = notifs.filter(n => !n.read).length;

  function markAllRead() {
    setReadIds(new Set(ADMIN_NOTIFS.map(n => n.id)));
  }
  function handleNotifClick(link, id) {
    setReadIds(prev => new Set([...prev, id]));
    setNotifOpen(false);
    navigate(link);
  }
  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  useEffect(() => {
    function handler(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchExpanded(false);
    }
    if (searchExpanded) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchExpanded]);

  // Close drawer on Escape
  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    if (drawerOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  return (
    <div className="admin-shell">

      {/* ── Fixed desktop sidebar ── */}
      <aside className="admin-sidebar">
        <SidebarContent onNavClick={() => {}} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <aside className="admin-drawer" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="admin-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <SidebarContent
              onNavClick={() => setDrawerOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* ── Fixed top header ── */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="admin-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <h2 className="admin-console-title">Admin Console</h2>

          {/* Search — collapses to icon on mobile */}
          <div
            className={`admin-search-wrap${searchExpanded ? " admin-search-expanded" : ""}`}
            ref={searchRef}
          >
            <span className="material-symbols-outlined admin-search-icon">search</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search data, orders, customers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchExpanded(true)}
            />
          </div>

          {/* Search icon button — mobile only, expands search */}
          <button
            type="button"
            className="admin-icon-btn admin-search-icon-btn"
            onClick={() => setSearchExpanded(s => !s)}
            aria-label="Search"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>

        <div className="admin-topbar-actions">

          {/* Notification bell */}
          <div className="admin-notif-wrap" ref={notifRef}>
            <button
              type="button"
              className="admin-icon-btn"
              aria-label="Notifications"
              onClick={() => setNotifOpen(o => !o)}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unread > 0 && <span className="admin-notif-badge">{unread}</span>}
            </button>

            {notifOpen && (
              <div className="admin-notif-dropdown">
                <div className="admin-notif-header">
                  <h4 className="admin-notif-title">Notifications</h4>
                  {unread > 0 && (
                    <button type="button" className="admin-notif-mark-all" onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="admin-notif-list">
                  {notifs.map(n => (
                    <button
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
                    </button>
                  ))}
                </div>
                <div className="admin-notif-footer">
                  <button
                    type="button"
                    className="admin-notif-view-all"
                    onClick={() => { setNotifOpen(false); navigate("/admin"); }}
                  >
                    View all activity →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button type="button" className="admin-icon-btn admin-help-btn" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>

          {/* User pill */}
          <div className="admin-user-menu-wrap" ref={userMenuRef}>
            <button
              type="button"
              className="admin-user-pill"
              onClick={() => setUserMenuOpen(o => !o)}
              aria-label="User menu"
            >
              <div className="admin-topbar-user-info">
                <p className="admin-topbar-name">{admin?.name ?? "Admin"}</p>
                <p className="admin-topbar-org">Gir Rituals HQ</p>
              </div>
              <div className="admin-topbar-avatar" style={{ background: "#7B5233" }}>
                {adminInitials}
              </div>
            </button>

            {userMenuOpen && (
              <div className="admin-user-dropdown">
                <div className="admin-user-dd-header">
                  <div className="admin-user-dd-avatar" style={{ background: "#7B5233" }}>
                    {adminInitials}
                  </div>
                  <div className="admin-user-dd-info">
                    <p className="admin-user-dd-name">{adminName}</p>
                    <p className="admin-user-dd-email">{adminEmail}</p>
                    <span className="admin-user-dd-role-badge">Admin</span>
                  </div>
                </div>
                <div className="admin-user-dd-divider" />
                <div className="admin-user-dd-links">
                  <button
                    type="button"
                    className="admin-user-dd-link"
                    onClick={() => { setUserMenuOpen(false); navigate("/admin/settings"); }}
                  >
                    <span className="material-symbols-outlined">settings</span>
                    Settings
                  </button>
                  <button
                    type="button"
                    className="admin-user-dd-link"
                    onClick={() => { setUserMenuOpen(false); navigate("/"); }}
                  >
                    <span className="material-symbols-outlined">storefront</span>
                    Customer App
                  </button>
                </div>
                <div className="admin-user-dd-divider" />
                <div className="admin-user-dd-footer">
                  <button
                    type="button"
                    className="admin-user-dd-logout"
                    onClick={() => { logoutAdmin(); navigate("/admin/login"); }}
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Scrollable main content ── */}
      <main className="admin-main">
        <div className="admin-content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export { AdminLayout };
