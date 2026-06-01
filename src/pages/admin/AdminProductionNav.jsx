import { useNavigate, useLocation } from "react-router-dom";
import "./AdminProductionNav.css";

const NAV_ITEMS = [
  {
    path:      "/admin/production-log",
    icon:      "receipt_long",
    iconClass: "pn-icon-log",
    title:     "Finalized Production Log",
    desc:      "Today's consolidated output & income",
  },
  {
    path:      "/admin/leftover-stock",
    icon:      "inventory",
    iconClass: "pn-icon-leftover",
    title:     "Manage Leftover Stock",
    desc:      "Reconcile carry-forward & expired units",
  },
  {
    path:      "/admin/stock-history",
    icon:      "history",
    iconClass: "pn-icon-history",
    title:     "Stock History Ledger",
    desc:      "Full inventory flow & expiry records",
  },
];

function AdminProductionNav() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="pn-strip">
      {NAV_ITEMS.map(item => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.path}
            type="button"
            className={`pn-tile${isActive ? " pn-tile-active" : ""}`}
            onClick={() => { if (!isActive) navigate(item.path); }}
            disabled={isActive}
          >
            <div className={`pn-tile-icon ${item.iconClass}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div className="pn-tile-body">
              <p className="pn-tile-title">{item.title}</p>
              <p className="pn-tile-desc">{item.desc}</p>
            </div>
            <span className="material-symbols-outlined pn-tile-arrow">
              {isActive ? "check_circle" : "chevron_right"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { AdminProductionNav };
