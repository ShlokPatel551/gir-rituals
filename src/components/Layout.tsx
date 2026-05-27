import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import './Layout.css';

const AUTH_PATHS = ['/', '/login', '/register', '/otp', '/forgot-password'];
const NO_NAV_PATHS = ['/checkout', '/payment', '/payment/success', '/payment/failure'];

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth =
    AUTH_PATHS.includes(location.pathname) || location.pathname.startsWith('/otp');
  const hideNav = NO_NAV_PATHS.some((p) => location.pathname.startsWith(p));

  if (isAuth || isAdmin || location.pathname === '/') {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      {!hideNav && (
        <header className="app-header">
          <button type="button" className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <span className="header-brand">GIR RITUALS</span>
          <a href="/notifications" className="notif-btn" aria-label="Notifications">
            🔔
          </a>
        </header>
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={`app-main ${hideNav ? 'no-pad' : ''}`}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
