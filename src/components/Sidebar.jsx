import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Sidebar.css";
const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: "\u{1F3E0}" },
  { path: "/dashboard", label: "Dashboard", icon: "\u{1F4CA}" },
  { path: "/offers", label: "Offers", icon: "\u{1F381}" },
  { path: "/products", label: "Products", icon: "\u{1F4E6}" },
  { path: "/schedule", label: "My Schedule", icon: "\u{1F4C5}" },
  { path: "/bills", label: "My Bills", icon: "\u{1F9FE}" },
  { path: "/orders", label: "Orders & History", icon: "\u{1F4CB}" },
  { path: "/favourites", label: "Favourites", icon: "\u2764\uFE0F" },
  { path: "/notifications", label: "Notifications", icon: "\u{1F514}" },
  { path: "/about", label: "About Us", icon: "\u{1F404}" },
  { path: "/contact", label: "Contact Us", icon: "\u{1F4AC}" },
  { path: "/flow", label: "App Flow", icon: "\u{1F5FA}\uFE0F" }
];
function Sidebar({ open, onClose }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      onClose();
      navigate("/login");
    }
  };
  return <>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} aria-hidden={!open} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-profile">
          <div className="avatar">{user.firstName[0]}{user.lastName[0]}</div>
          <div>
            <strong>{user.firstName} {user.lastName}</strong>
            <span className="client-id">ID: {user.clientId}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => <Link key={item.path} to={item.path} onClick={onClose} className="sidebar-link">
              <span>{item.icon}</span> {item.label}
            </Link>)}
          <button type="button" className="sidebar-link logout" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>
    </>;
}
export {
  Sidebar
};
