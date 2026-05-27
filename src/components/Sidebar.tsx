import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/offers', label: 'Offers', icon: '🎁' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/schedule', label: 'My Schedule', icon: '📅' },
  { path: '/bills', label: 'My Bills', icon: '🧾' },
  { path: '/orders', label: 'Orders & History', icon: '📋' },
  { path: '/favourites', label: 'Favourites', icon: '❤️' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/about', label: 'About Us', icon: '🐄' },
  { path: '/contact', label: 'Contact Us', icon: '💬' },
  { path: '/flow', label: 'App Flow', icon: '🗺️' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      onClose();
      navigate('/login');
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} aria-hidden={!open} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-profile">
          <div className="avatar">{user.firstName[0]}{user.lastName[0]}</div>
          <div>
            <strong>{user.firstName} {user.lastName}</strong>
            <span className="client-id">ID: {user.clientId}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} onClick={onClose} className="sidebar-link">
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
          <button type="button" className="sidebar-link logout" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>
    </>
  );
}
