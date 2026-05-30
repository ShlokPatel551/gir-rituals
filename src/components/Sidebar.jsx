import { NavLink, Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { path: "/dashboard",     icon: "dashboard",           label: "Dashboard"     },
  { path: "/offers",        icon: "local_offer",         label: "Offers"        },
  { path: "/products",      icon: "inventory_2",         label: "Products"      },
  { path: "/schedule",      icon: "calendar_today",      label: "My Schedule"   },
  { path: "/bills",         icon: "receipt_long",        label: "My Bills"      },
  { path: "/orders",        icon: "shopping_bag",        label: "Orders"        },
  { path: "/cart",          icon: "shopping_cart",       label: "Cart"          },
  { path: "/favourites",    icon: "favorite",            label: "Favourites"    },
  { path: "/notifications", icon: "notifications",       label: "Notifications" },
  { path: "/profile",       icon: "person",              label: "Profile"       },
  { path: "/about",         icon: "info",                label: "About Us"      },
  { path: "/contact",       icon: "chat",                label: "Contact Us"    },
];

/* ── Desktop Sidebar (fixed, always visible ≥768px) ─────────── */
function DesktopSidebar() {
  const { user, logout, cartCount, notifications } = useApp();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="dsk-sidebar">
      {/* Brand */}
      <div className="dsk-brand">
        <Link to="/home" className="dsk-brand-link">
          <h1 className="dsk-brand-title">Gir Rituals</h1>
          <p className="dsk-brand-sub">Premium A2 Dairy</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="dsk-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `dsk-nav-item${isActive ? " dsk-nav-item-active" : ""}`
            }
          >
            <span className="material-symbols-outlined dsk-nav-icon">{item.icon}</span>
            <span className="dsk-nav-label">{item.label}</span>
            {item.path === "/cart" && cartCount > 0 && (
              <span className="dsk-badge">{cartCount}</span>
            )}
            {item.path === "/notifications" && unreadCount > 0 && (
              <span className="dsk-badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="dsk-footer">
        <div className="dsk-user">
          <div className="dsk-avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div className="dsk-user-info">
            <span className="dsk-user-name">{user.firstName} {user.lastName}</span>
            <span className="dsk-user-id">ID: {user.clientId}</span>
          </div>
        </div>
        <button type="button" className="dsk-logout" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* ── Mobile Sidebar (overlay drawer) ────────────────────────── */
function Sidebar({ open, onClose }) {
  const { user, logout, cartCount, notifications } = useApp();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      onClose();
      navigate("/login");
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside className={`sidebar ${open ? "open" : ""}`} aria-modal={open}>
        {/* Profile */}
        <div className="sidebar-profile">
          <div className="avatar">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <strong>{user.firstName} {user.lastName}</strong>
            <span className="client-id">ID: {user.clientId}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="sidebar-link"
            >
              <span className="material-symbols-outlined sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.path === "/cart" && cartCount > 0 && (
                <span className="sidebar-badge">{cartCount}</span>
              )}
              {item.path === "/notifications" && unreadCount > 0 && (
                <span className="sidebar-badge">{unreadCount}</span>
              )}
            </Link>
          ))}
          <button type="button" className="sidebar-link logout" onClick={handleLogout}>
            <span className="material-symbols-outlined sidebar-link-icon">logout</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}

export { Sidebar, DesktopSidebar };
