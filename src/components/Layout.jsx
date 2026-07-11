import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { Sidebar, DesktopSidebar } from "./Sidebar";
import { PROMO_NOTIFICATIONS } from "../lib/promoData";
import "./Layout.css";

const NOTIF_TYPE_CFG = {
  delivery: { icon: "local_shipping", bg: "#c5eadf", color: "#01261f" },
  payment:  { icon: "receipt_long",   bg: "#ebdec6", color: "#6a624f" },
  offer:    { icon: "celebration",    bg: "#ffdea5", color: "#261900" },
  info:     { icon: "info",           bg: "#F2E9DC", color: "#7B5233" },
};

const MOCK_HEADER_NOTIFS = [
  // Live offer/banner notifications from admin (always at top, unread)
  { id: PROMO_NOTIFICATIONS[0].id, type: "offer", read: false, title: PROMO_NOTIFICATIONS[0].title, message: PROMO_NOTIFICATIONS[0].message, time: "Today" },
  { id: PROMO_NOTIFICATIONS[1].id, type: "offer", read: false, title: PROMO_NOTIFICATIONS[1].title, message: PROMO_NOTIFICATIONS[1].message, time: "Today" },
  { id: "h1", type: "delivery", read: false, title: "Fresh A2 Milk Out for Delivery", message: "Your 2L daily subscription is with our delivery partner.", time: "06:45 AM" },
  { id: "h2", type: "payment",  read: true,  title: "Wallet Recharged Successfully",  message: "₹5,000 added. Bonus ₹250 as Loyalty Ritual reward.",    time: "Yesterday" },
  { id: "h3", type: "offer",    read: false, title: "Vedic Ghee Early Access",         message: "20% off Hand-Churned Bilona Ghee for members.",         time: "Oct 24"    },
];

const AUTH_PATHS = ["/", "/login", "/register", "/otp", "/forgot-password"];
const NO_NAV_PATHS = ["/checkout", "/payment", "/payment/success", "/payment/failure"];
function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, notifications, markAllNotificationsRead, user, logout, products } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);
  const isAdmin = location.pathname.startsWith("/admin");
  const isAuth = AUTH_PATHS.includes(location.pathname) || location.pathname.startsWith("/otp");
  const hideNav = NO_NAV_PATHS.some((p) => location.pathname.startsWith(p));
  const unreadCount = notifications.length > 0
    ? notifications.filter((n) => !n.read).length
    : MOCK_HEADER_NOTIFS.filter((n) => !n.read).length;
  const searchResults = searchQuery.trim().length > 0 ? products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    setUserMenuOpen(false);
    setSearchOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleSearchSelect = (id) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/products/${id}`);
  };
  if (isAuth || isAdmin || location.pathname === "/") {
    return <Outlet />;
  }
  return <div className="app-shell">
      {!hideNav && <DesktopSidebar />}
      {!hideNav && <header className="app-header">
          {/* ── Mobile header row ── */}
          <div className="header-mobile">
            <button type="button" className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link to="/home" className="header-brand">Gir Rituals</Link>
            <div className="header-mobile-actions">
              <button type="button" className="header-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                <span className="material-symbols-outlined">search</span>
              </button>
              <Link to="/cart" className="header-icon-btn" aria-label="Cart">
                <span className="material-symbols-outlined">shopping_cart</span>
                {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
              </Link>
              <Link to="/notifications" className="header-icon-btn" aria-label="Notifications">
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
              </Link>
            </div>
          </div>

          {/* ── Desktop header row ── */}
          <div className="header-desktop">
            {/* Search bar */}
            <button type="button" className="hd-search-bar" onClick={() => setSearchOpen(true)} aria-label="Search">
              <span className="material-symbols-outlined hd-search-icon">search</span>
              <span className="hd-search-text">Search rituals...</span>
            </button>

            {/* Nav links */}
            <nav className="header-nav">
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
              <NavLink to="/orders"    className={({ isActive }) => isActive ? "active" : ""}>Orders</NavLink>
              <NavLink to="/schedule"  className={({ isActive }) => isActive ? "active" : ""}>Schedule</NavLink>
            </nav>

            {/* Right actions */}
            <div className="header-actions">
<div className="notif-wrapper" ref={notifRef}>
                <button type="button" className="header-icon-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
                </button>
                {notifOpen && (() => {
                  const items = notifications.length > 0 ? notifications : MOCK_HEADER_NOTIFS;
                  return (
                    <div className="notif-dropdown">
                      <div className="notif-dropdown-hdr">
                        <span className="notif-dropdown-title">Notifications</span>
                        {unreadCount > 0 && (
                          <button type="button" className="notif-mark-all" onClick={() => markAllNotificationsRead()}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="notif-list">
                        {items.slice(0, 5).map(n => {
                          const cfg = NOTIF_TYPE_CFG[n.type] ?? NOTIF_TYPE_CFG.info;
                          return (
                            <div key={n.id} className={`notif-item ${!n.read ? "notif-item--unread" : ""}`}>
                              <div className="notif-item-icon" style={{ background: cfg.bg }}>
                                <span className="material-symbols-outlined" style={{ color: cfg.color, fontSize: 18 }}>{cfg.icon}</span>
                              </div>
                              <div className="notif-item-body">
                                <p className="notif-item-title">{n.title}</p>
                                <p className="notif-item-msg">{n.message}</p>
                                <span className="notif-item-time">{n.time}</span>
                              </div>
                              {!n.read && <div className="notif-unread-dot" />}
                            </div>
                          );
                        })}
                      </div>
                      <Link to="/notifications" className="notif-view-all" onClick={() => setNotifOpen(false)}>
                        View all notifications
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                      </Link>
                    </div>
                  );
                })()}
              </div>
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button type="button" className="avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="My account">
                  {user?.firstName?.[0] ?? "?"}{user?.lastName?.[0] ?? ""}
                </button>
                {userMenuOpen && <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>{user.firstName} {user.lastName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/schedule">My Schedule</Link>
                    <Link to="/bills">My Bills</Link>
                    <Link to="/orders">Orders</Link>
                    <Link to="/profile">Profile</Link>
                    <button type="button" onClick={handleLogout} className="dropdown-logout">Logout</button>
                  </div>}
              </div>
            </div>
          </div>
        </header>}

      {
    /* ── Search overlay ── */
  }
      {searchOpen && <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-wrapper">
              <span className="search-icon-inline">🔍</span>
              <input
    ref={searchInputRef}
    type="text"
    placeholder="Search products..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="search-input"
  />
              <button
    type="button"
    className="search-close"
    onClick={() => setSearchOpen(false)}
  >
                ✕
              </button>
            </div>
            {searchResults.length > 0 && <div className="search-results">
                {searchResults.map((p) => <button
    key={p.id}
    type="button"
    className="search-result-item"
    onClick={() => handleSearchSelect(p.id)}
  >
                    <span className="search-result-img">{p.image}</span>
                    <div>
                      <strong>{p.name}</strong>
                      <span>₹{p.price}/{p.unit}</span>
                    </div>
                  </button>)}
              </div>}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && <p className="search-empty">No products found for "{searchQuery}"</p>}
          </div>
        </div>}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`app-main ${hideNav ? "no-pad" : ""}`}>
        <Outlet />
      </main>

      {!hideNav && <>
          <Footer />
          <BottomNav />
        </>}
    </div>;
}
export {
  Layout
};
