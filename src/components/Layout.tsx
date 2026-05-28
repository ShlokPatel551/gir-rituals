import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/mockData';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import './Layout.css';

const AUTH_PATHS = ['/', '/login', '/register', '/otp', '/forgot-password'];
const NO_NAV_PATHS = ['/checkout', '/payment', '/payment/success', '/payment/failure'];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, notifications, user, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth =
    AUTH_PATHS.includes(location.pathname) || location.pathname.startsWith('/otp');
  const hideNav = NO_NAV_PATHS.some((p) => location.pathname.startsWith(p));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = searchQuery.trim().length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSelect = (id: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/products/${id}`);
  };

  if (isAuth || isAdmin || location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      {!hideNav && (
        <header className="app-header">
          {/* ── Mobile header row ── */}
          <div className="header-mobile">
            <button
              type="button"
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <Link to="/home" className="header-brand">GIR RITUALS</Link>
            <div className="header-mobile-actions">
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                🔍
              </button>
              <Link to="/cart" className="header-icon-btn" aria-label="Cart">
                🛒
                {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
              </Link>
              <Link to="/notifications" className="header-icon-btn" aria-label="Notifications">
                🔔
                {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
              </Link>
            </div>
          </div>

          {/* ── Desktop header row ── */}
          <div className="header-desktop">
            <Link to="/home" className="header-brand">GIR RITUALS</Link>
            <nav className="header-nav">
              <NavLink to="/home" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
              <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Products</NavLink>
              <NavLink to="/offers" className={({ isActive }) => isActive ? 'active' : ''}>Offers</NavLink>
              <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About Us</NavLink>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
            </nav>
            <div className="header-actions">
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                🔍
              </button>
              <Link to="/cart" className="header-icon-btn" aria-label="Cart">
                🛒
                {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
              </Link>
              <Link to="/notifications" className="header-icon-btn" aria-label="Notifications">
                🔔
                {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
              </Link>
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  type="button"
                  className="avatar-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="My account"
                >
                  {user.firstName[0]}{user.lastName[0]}
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <strong>{user.firstName} {user.lastName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <Link to="/dashboard">📊 Dashboard</Link>
                    <Link to="/schedule">📅 My Schedule</Link>
                    <Link to="/bills">🧾 My Bills</Link>
                    <Link to="/orders">📋 Orders</Link>
                    <Link to="/profile">👤 Profile</Link>
                    <button type="button" onClick={handleLogout} className="dropdown-logout">🚪 Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
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
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((p) => (
                  <button
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
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <p className="search-empty">No products found for "{searchQuery}"</p>
            )}
          </div>
        </div>
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`app-main ${hideNav ? 'no-pad' : ''}`}>
        <Outlet />
      </main>

      {!hideNav && (
        <>
          <Footer />
          <BottomNav />
        </>
      )}
    </div>
  );
}
