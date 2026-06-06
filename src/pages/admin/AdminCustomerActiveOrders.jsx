import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminCustomerActiveOrders.css";

/* ── Mock customer names ── */
const MOCK_NAMES = {
  GR00124: "Priya Shah",    GR00089: "Rahul Mehta",
  GR00201: "Anjali Kapoor", GR00057: "Meena Patel",
  GR00312: "Suresh Joshi",  GR00098: "Kavita Rao",
  GR00143: "Deepak Nair",   GR00178: "Sunita Verma",
  GR00234: "Arjun Desai",   GR00267: "Pooja Sharma",
};

/* ── Task data ── */
const TASKS_INIT = [
  /* Today */
  { id: "T001", orderId: "#GR-2041", product: "A2 Desi Cow Milk", qty: "2 L",   area: "Navrangpura",    time: "6:30 AM", status: "pending",          group: "today"     },
  { id: "T002", orderId: "#GR-2042", product: "Organic Gir Cow Ghee", qty: "250g", area: "Navrangpura", time: "6:30 AM", status: "out_for_delivery",  group: "today"     },
  { id: "T003", orderId: "#GR-2043", product: "A2 Desi Cow Milk", qty: "1 L",   area: "Navrangpura",    time: "7:00 AM", status: "pending",          group: "today"     },
  { id: "T004", orderId: "#GR-2040", product: "Bilona Ghee",       qty: "500g",  area: "Navrangpura",    time: "8:00 AM", status: "delivered",        group: "done"      },
  /* Upcoming */
  { id: "T005", orderId: "#GR-2051", product: "A2 Desi Cow Milk", qty: "2 L",   area: "Navrangpura",    time: "Tomorrow · 6:30 AM", status: "scheduled", group: "upcoming" },
  { id: "T006", orderId: "#GR-2052", product: "Organic Paneer",   qty: "200g",  area: "Navrangpura",    time: "2 Jun · 7:00 AM",    status: "scheduled", group: "upcoming" },
  { id: "T007", orderId: "#GR-2053", product: "A2 Desi Cow Milk", qty: "2 L",   area: "Navrangpura",    time: "3 Jun · 6:30 AM",    status: "scheduled", group: "upcoming" },
];

const STATUS_CFG = {
  pending:          { label: "Pending",          cls: "ao-s-pending",   dot: "#ea9147" },
  out_for_delivery: { label: "Out for Delivery", cls: "ao-s-otd",       dot: "#7d562d" },
  delivered:        { label: "Delivered",        cls: "ao-s-delivered", dot: "#7B5233" },
  scheduled:        { label: "Scheduled",        cls: "ao-s-scheduled", dot: "#717973" },
};

const NEXT_STATUS = {
  pending:          "out_for_delivery",
  out_for_delivery: "delivered",
};

const NEXT_BTN_LABEL = {
  pending:          "Mark Out for Delivery",
  out_for_delivery: "Mark Delivered",
};

const FILTERS = [
  { key: "all",      label: "All Active"         },
  { key: "today",    label: "Today"              },
  { key: "upcoming", label: "Upcoming"           },
  { key: "done",     label: "Completed Today"    },
];

const GROUP_LABELS = {
  today:    "Today's Deliveries",
  upcoming: "Upcoming",
  done:     "Completed Today",
};

function AdminCustomerActiveOrders() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [tasks,    setTasks]    = useState(TASKS_INIT);
  const [filter,   setFilter]   = useState("all");
  const [checked,  setChecked]  = useState(new Set());

  const customerName = MOCK_NAMES[id] || id || "Customer";

  /* counts */
  const todayActive    = tasks.filter(t => t.group === "today" && t.status !== "delivered").length;
  const deliveredToday = tasks.filter(t => t.status === "delivered").length;
  const otdCount       = tasks.filter(t => t.status === "out_for_delivery").length;
  const upcomingCount  = tasks.filter(t => t.group === "upcoming").length;

  function advanceStatus(taskId) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const next = NEXT_STATUS[t.status];
      if (!next) return t;
      const movedGroup = next === "delivered" ? "done" : t.group;
      return { ...t, status: next, group: movedGroup };
    }));
  }

  function toggleCheck(taskId) {
    setChecked(prev => {
      const s = new Set(prev);
      s.has(taskId) ? s.delete(taskId) : s.add(taskId);
      return s;
    });
  }

  /* filter logic */
  const visible = tasks.filter(t => {
    if (filter === "all")      return t.group !== "done" || t.status === "delivered";
    if (filter === "today")    return t.group === "today" && t.status !== "delivered";
    if (filter === "upcoming") return t.group === "upcoming";
    if (filter === "done")     return t.status === "delivered";
    return true;
  });

  /* group for rendering */
  const groupOrder = ["today", "upcoming", "done"];
  const grouped = groupOrder.reduce((acc, g) => {
    const rows = visible.filter(t => t.group === g);
    if (rows.length) acc[g] = rows;
    return acc;
  }, {});

  return (
    <div className="ao-page">

      {/* ── Breadcrumb ── */}
      <div className="ao-topbar">
        <nav className="ao-breadcrumb">
          <Link to="/admin/customers" className="ao-crumb-link">Customers</Link>
          <span className="material-symbols-outlined ao-crumb-sep">chevron_right</span>
          <Link to={`/admin/customers/${id}`} className="ao-crumb-link">{customerName}</Link>
          <span className="material-symbols-outlined ao-crumb-sep">chevron_right</span>
          <span className="ao-crumb-current">Active Orders</span>
        </nav>
        <div className="ao-topbar-actions">
          <button type="button" className="ao-btn-outline" onClick={() => navigate(`/admin/customers/${id}`)}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Detail
          </button>
          <button type="button" className="ao-btn-solid">
            <span className="material-symbols-outlined">add_shopping_cart</span>
            New Order
          </button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="ao-kpi-strip">
        <div className="ao-kpi">
          <span className="material-symbols-outlined ao-kpi-icon ao-icon-primary">pending_actions</span>
          <div>
            <p className="ao-kpi-val">{todayActive}</p>
            <p className="ao-kpi-lbl">Active Today</p>
          </div>
        </div>
        <div className="ao-kpi-divider" />
        <div className="ao-kpi">
          <span className="material-symbols-outlined ao-kpi-icon ao-icon-otd">local_shipping</span>
          <div>
            <p className="ao-kpi-val">{otdCount}</p>
            <p className="ao-kpi-lbl">Out for Delivery</p>
          </div>
        </div>
        <div className="ao-kpi-divider" />
        <div className="ao-kpi">
          <span className="material-symbols-outlined ao-kpi-icon ao-icon-done">check_circle</span>
          <div>
            <p className="ao-kpi-val">{deliveredToday}</p>
            <p className="ao-kpi-lbl">Delivered Today</p>
          </div>
        </div>
        <div className="ao-kpi-divider" />
        <div className="ao-kpi">
          <span className="material-symbols-outlined ao-kpi-icon ao-icon-sched">event_note</span>
          <div>
            <p className="ao-kpi-val">{upcomingCount}</p>
            <p className="ao-kpi-lbl">Upcoming</p>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="ao-filter-row">
        <div className="ao-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={`ao-tab${filter === f.key ? " ao-tab-active" : ""}`}
              onClick={() => setFilter(f.key)}
            >{f.label}</button>
          ))}
        </div>
        <p className="ao-result-count">{visible.length} task{visible.length !== 1 ? "s" : ""}</p>
      </div>

      {/* ── Tasklist ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="ao-empty">
          <span className="material-symbols-outlined ao-empty-icon">task_alt</span>
          <p className="ao-empty-title">No tasks here</p>
          <p className="ao-empty-sub">Try a different filter.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, rows]) => (
          <div key={group} className="ao-group">
            <div className="ao-group-header">
              <span className="ao-group-label">{GROUP_LABELS[group]}</span>
              <span className="ao-group-count">{rows.length}</span>
            </div>

            <div className="ao-task-card">
              {rows.map((task, idx) => {
                const sc      = STATUS_CFG[task.status];
                const isDone  = task.status === "delivered";
                const isCheck = checked.has(task.id);
                const nextBtn = NEXT_BTN_LABEL[task.status];

                return (
                  <div
                    key={task.id}
                    className={`ao-row${isDone ? " ao-row-done" : ""}${idx < rows.length - 1 ? " ao-row-border" : ""}`}
                  >
                    {/* Check circle */}
                    <button
                      type="button"
                      className={`ao-check${isDone || isCheck ? " ao-check-filled" : ""}`}
                      onClick={() => toggleCheck(task.id)}
                      title={isDone ? "Delivered" : "Toggle"}
                    >
                      {(isDone || isCheck) && (
                        <span className="material-symbols-outlined ao-check-icon">check</span>
                      )}
                    </button>

                    {/* Order ID */}
                    <span className="ao-order-id">{task.orderId}</span>

                    {/* Product */}
                    <div className="ao-product-cell">
                      <span className="ao-product-name">{task.product}</span>
                      <span className="ao-product-qty">{task.qty}</span>
                    </div>

                    {/* Area */}
                    <div className="ao-area-cell">
                      <span className="material-symbols-outlined ao-area-icon">location_on</span>
                      <span>{task.area}</span>
                    </div>

                    {/* Time */}
                    <div className="ao-time-cell">
                      <span className="material-symbols-outlined ao-time-icon">schedule</span>
                      <span>{task.time}</span>
                    </div>

                    {/* Status badge */}
                    <span className={`ao-status ${sc.cls}`}>
                      <span className="ao-status-dot" style={{ background: sc.dot }} />
                      {sc.label}
                    </span>

                    {/* Actions */}
                    <div className="ao-row-actions">
                      {nextBtn && (
                        <button
                          type="button"
                          className="ao-act-advance"
                          onClick={() => advanceStatus(task.id)}
                        >{nextBtn}</button>
                      )}
                      {isDone && (
                        <span className="ao-delivered-tick material-symbols-outlined">task_alt</span>
                      )}
                      <button
                        type="button"
                        className="ao-act-more"
                        title="More options"
                      >
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

    </div>
  );
}

export { AdminCustomerActiveOrders };
