import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./BottomNav.css";
function BottomNav() {
  const { cartCount, user } = useApp();
  return <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => isActive ? "active" : ""}>
        <span className="nav-icon">🏠</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="/schedule" className={({ isActive }) => isActive ? "active" : ""}>
        <span className="nav-icon">📅</span>
        <span>Schedule</span>
      </NavLink>
      <NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>
        <span className="nav-icon">🛒</span>
        <span>Cart</span>
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
        <span className="nav-icon profile-icon">{user?.firstName?.[0] ?? "?"}</span>
        <span>Profile</span>
      </NavLink>
    </nav>;
}
export {
  BottomNav
};
