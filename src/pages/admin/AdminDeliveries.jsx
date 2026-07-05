import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import "./AdminDeliveries.css";

function getDateWithOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function formatShort(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatLong(d) {
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTableDate(d) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_CONFIG = {
  delivered: { label: "Delivered", cls: "del-badge-delivered" },
  pending:   { label: "Pending",   cls: "del-badge-pending" },
  paused:    { label: "Paused",    cls: "del-badge-paused" },
};

const TYPE_CONFIG = {
  subscription: { label: "Subscription", cls: "del-type-subscription" },
  extra:        { label: "Extra",        cls: "del-type-extra" },
  individual:   { label: "Individual",   cls: "del-type-individual" },
};

const AMOUNT_STATUS_CONFIG = {
  monthly_bill:  { label: "Monthly bill",  cls: "del-amt-monthly" },
  paid:          { label: "Paid",          cls: "del-amt-paid" },
  added_to_bill: { label: "Added to bill", cls: "del-amt-added" },
  not_charged:   { label: "Not charged",   cls: "del-amt-none" },
};

function AdminDeliveries() {
  const navigate = useNavigate();
  const [groups, setGroups]   = useState([]);
  const [counts, setCounts]   = useState({ total: 0, delivered: 0, pending: 0, paused: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [dateMode, setDateMode]   = useState("today");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState("table");

  const offset    = dateMode === "yesterday" ? -1 : dateMode === "tomorrow" ? 1 : 0;
  const dateObj   = getDateWithOffset(offset);
  const dateISO   = toISODate(dateObj);
  const dateShort = formatShort(dateObj);
  const dateLong  = formatLong(dateObj);
  const dateTable = formatTableDate(dateObj);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminDeliveries(dateISO);
      setGroups(data.groups || []);
      setCounts(data.counts || { total: 0, delivered: 0, pending: 0, paused: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [dateISO]);

  useEffect(() => {
    fetchDeliveries();
    setSelectedRows(new Set());
  }, [fetchDeliveries]);

  async function cycleStatus(subscriptionId, currentStatus) {
    const next = currentStatus === "pending"
      ? "delivered"
      : currentStatus === "delivered"
        ? "paused"
        : "pending";

    // Optimistic update
    setGroups(prev => prev.map(g => ({
      ...g,
      items: g.items.map(i =>
        i.subscriptionId === subscriptionId ? { ...i, status: next } : i
      ),
    })));
    setCounts(prev => ({ ...prev, [currentStatus]: prev[currentStatus] - 1, [next]: prev[next] + 1 }));

    try {
      const result = await api.adminDeliveryStatus({ subscriptionId, date: dateISO, status: next });
      // Patch in the real deliveryId + orderId if a record was just created
      if (result.deliveryId) {
        setGroups(prev => prev.map(g => ({
          ...g,
          items: g.items.map(i =>
            i.subscriptionId === subscriptionId
              ? { ...i, deliveryId: result.deliveryId, orderId: result.orderId }
              : i
          ),
        })));
      }
    } catch {
      // Revert by refetching
      fetchDeliveries();
    }
  }

  function toggleRow(id) {
    setSelectedRows(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleGroup(clientId) {
    const group = groups.find(g => g.clientId === clientId);
    const ids = group.items.map(i => i.subscriptionId);
    const allChecked = ids.every(id => selectedRows.has(id));
    setSelectedRows(prev => {
      const n = new Set(prev);
      if (allChecked) ids.forEach(id => n.delete(id));
      else ids.forEach(id => n.add(id));
      return n;
    });
  }

  function toggleAll() {
    const all = groups.flatMap(g => g.items.map(i => i.subscriptionId));
    const allChecked = all.every(id => selectedRows.has(id));
    setSelectedRows(allChecked ? new Set() : new Set(all));
  }

  function exportCSV() {
    const header = ["Client ID","Order ID","Customer","Phone","Address","Delivery Date","Product","Qty","Type","Amount","Amount Status","Payment Method","Status"];
    const rows = groups.flatMap(g =>
      g.items.map(i => [g.clientId, i.orderId, g.displayName, g.phone, g.address, dateTable, i.product, i.qty, i.type, i.amount, i.amountStatus, i.paymentMethod, i.status])
    );
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deliveries-${dateShort.replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const allItems   = groups.flatMap(g => g.items);
  const allChecked = allItems.length > 0 && allItems.every(i => selectedRows.has(i.subscriptionId));

  return (
    <div className="del-page">

      {/* ── Page header ── */}
      <section className="del-header-row">
        <h2 className="del-page-title">Delivery Management</h2>
        <div className="del-header-actions">
          <div className="del-view-toggle">
            <button
              type="button"
              className={`del-view-btn${viewMode === "table" ? " del-view-btn-active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table view"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>table_rows</span>
              Table
            </button>
            <button
              type="button"
              className={`del-view-btn${viewMode === "card" ? " del-view-btn-active" : ""}`}
              onClick={() => setViewMode("card")}
              title="Card view"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>grid_view</span>
              Cards
            </button>
          </div>
          <button type="button" className="del-export-btn" onClick={exportCSV}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export CSV
          </button>
        </div>
      </section>

      {/* ── Date filter bar ── */}
      <section className="del-date-bar">
        <div className="del-date-controls">
          <span className="del-date-select-label">Select date:</span>
          <div className="del-date-btn-group">
            {["yesterday", "today", "tomorrow"].map(mode => (
              <button
                key={mode}
                type="button"
                className={`del-date-btn${dateMode === mode ? " del-date-btn-active" : ""}`}
                onClick={() => setDateMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
            <div className="del-date-input-wrap">
              <input className="del-date-input" type="text" readOnly value={dateShort} />
              <span className="material-symbols-outlined del-date-cal-icon">calendar_today</span>
            </div>
          </div>
        </div>
        <div className="del-date-chip">
          <span className="del-date-chip-dot" />
          {dateLong}
        </div>
      </section>

      {/* ── Metric cards ── */}
      <section className="del-metrics-grid">
        <div className="del-metric-card del-metric-dark">
          <p className="del-metric-label">Total Deliveries Today</p>
          <p className="del-metric-value">{counts.total}</p>
          <p className="del-metric-sub">Across all customers</p>
        </div>
        <div className="del-metric-card del-metric-green">
          <p className="del-metric-label">Delivered</p>
          <p className="del-metric-value del-val-green">{counts.delivered}</p>
          <p className="del-metric-sub">Completed this morning</p>
        </div>
        <div className="del-metric-card del-metric-yellow">
          <p className="del-metric-label">Pending</p>
          <p className="del-metric-value del-val-yellow">{counts.pending}</p>
          <p className="del-metric-sub">Yet to be delivered</p>
        </div>
        <div className="del-metric-card del-metric-gray">
          <p className="del-metric-label">Paused</p>
          <p className="del-metric-value del-val-gray">{counts.paused}</p>
          <p className="del-metric-sub">Customer requested pause</p>
        </div>
      </section>

      {/* ── Delivery table / cards ── */}
      <section className="del-table-section">
        <div className="del-table-control-header">
          <div className="del-table-header-left">
            {viewMode === "table" && (
              <input type="checkbox" className="del-checkbox" checked={allChecked} onChange={toggleAll} />
            )}
            <span className="del-table-header-title">All deliveries — {dateTable}</span>
            <span className="del-count-badge">{counts.total} entries</span>
          </div>
          <button type="button" className="del-export-btn-sm" onClick={exportCSV}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>download</span>
            Export
          </button>
        </div>

        {loading ? (
          <div className="del-state-box">
            <span className="material-symbols-outlined del-state-icon del-spinning">progress_activity</span>
            <p>Loading deliveries…</p>
          </div>
        ) : error ? (
          <div className="del-state-box del-state-error">
            <span className="material-symbols-outlined del-state-icon">error_outline</span>
            <p>{error}</p>
            <button type="button" className="del-retry-btn" onClick={fetchDeliveries}>Retry</button>
          </div>
        ) : allItems.length === 0 ? (
          <div className="del-state-box">
            <span className="material-symbols-outlined del-state-icon">local_shipping</span>
            <p>No deliveries scheduled for this date.</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="del-cards-grid">
            {groups.flatMap(group =>
              group.items.map(item => (
                <DeliveryCard
                  key={item.subscriptionId}
                  group={group}
                  item={item}
                  dateTable={dateTable}
                  onCycleStatus={cycleStatus}
                  onNavigate={clientId => navigate(`/admin/customers/${clientId}`)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="del-table-scroll">
            <table className="del-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Contact</th>
                  <th>Delivery Address</th>
                  <th className="del-th-nowrap">Delivery Date</th>
                  <th>Product Name</th>
                  <th>Qty</th>
                  <th>Type</th>
                  <th className="del-th-right">Amount</th>
                  <th>Amount Status</th>
                  <th>Payment Method</th>
                  <th className="del-th-center">Delivery Status</th>
                  <th className="del-th-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(group => {
                  const groupIds     = group.items.map(i => i.subscriptionId);
                  const groupChecked = groupIds.every(id => selectedRows.has(id));
                  return (
                    <GroupRows
                      key={group.clientId}
                      group={group}
                      groupChecked={groupChecked}
                      selectedRows={selectedRows}
                      dateTable={dateTable}
                      onToggleGroup={() => toggleGroup(group.clientId)}
                      onToggleRow={toggleRow}
                      onCycleStatus={cycleStatus}
                      onNavigate={clientId => navigate(`/admin/customers/${clientId}`)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

function GroupRows({ group, groupChecked, selectedRows, dateTable, onToggleGroup, onToggleRow, onCycleStatus, onNavigate }) {
  return (
    <>
      <tr className="del-group-row">
        <td colSpan={14}>
          <div className="del-group-cell">
            <input type="checkbox" className="del-checkbox" checked={groupChecked} onChange={onToggleGroup} />
            <span>
              {group.clientId} — {group.displayName.toUpperCase()} — {group.items.length} ITEM{group.items.length !== 1 ? "S" : ""} TODAY
            </span>
          </div>
        </td>
      </tr>
      {group.items.map(item => {
        const isPaused  = item.status === "paused";
        const statusCfg = STATUS_CONFIG[item.status]      ?? STATUS_CONFIG.pending;
        const typeCfg   = TYPE_CONFIG[item.type]           ?? TYPE_CONFIG.subscription;
        const amtCfg    = AMOUNT_STATUS_CONFIG[item.amountStatus] ?? AMOUNT_STATUS_CONFIG.not_charged;
        return (
          <tr
            key={item.subscriptionId}
            className={`del-row${isPaused ? " del-row-paused" : ""}${selectedRows.has(item.subscriptionId) ? " del-row-selected" : ""}`}
          >
            <td className="del-cell-muted del-cell-clientid">{group.clientId}</td>
            <td className="del-cell-muted">{item.orderId}</td>
            <td>
              <button type="button" className="del-customer-link" onClick={() => onNavigate(group.clientId)}>
                {group.displayName}
              </button>
            </td>
            <td className="del-cell-muted">{group.phone}</td>
            <td className="del-cell-addr">{group.address || "—"}</td>
            <td>{dateTable}</td>
            <td className="del-cell-product">{item.product}</td>
            <td>{item.qty}</td>
            <td><span className={`del-badge ${typeCfg.cls}`}>{typeCfg.label}</span></td>
            <td className="del-cell-right del-cell-amount">₹{item.amount}</td>
            <td><span className={`del-badge ${amtCfg.cls}`}>{amtCfg.label}</span></td>
            <td className="del-cell-muted">{item.paymentMethod}</td>
            <td className="del-cell-center">
              <span className={`del-badge ${statusCfg.cls}`}>{statusCfg.label}</span>
            </td>
            <td className="del-cell-center">
              <div className="del-actions">
                <button
                  type="button"
                  className={`del-action-primary${isPaused ? " del-action-paused" : ""}`}
                  onClick={() => onCycleStatus(item.subscriptionId, item.status)}
                >
                  Edit status
                </button>
                <button type="button" className="del-action-secondary" onClick={() => onNavigate(group.clientId)}>
                  View
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}

const CARD_STATUS = {
  delivered: { label: "Delivered", cls: "dc-status-delivered" },
  pending:   { label: "Pending",   cls: "dc-status-pending" },
  paused:    { label: "Paused",    cls: "dc-status-paused" },
};

const CARD_AMT_HINT = {
  monthly_bill:  "Monthly bill — collect at month end",
  paid:          "Paid — nothing due",
  added_to_bill: "Added to bill",
  not_charged:   "Not charged",
};

const NEXT_STATUS_LABEL = {
  pending:   "Mark Delivered",
  delivered: "Mark Paused",
  paused:    "Mark Pending",
};

function DeliveryCard({ group, item, dateTable, onCycleStatus, onNavigate }) {
  const statusCfg = CARD_STATUS[item.status] ?? CARD_STATUS.pending;
  const typeCfg   = TYPE_CONFIG[item.type]   ?? TYPE_CONFIG.subscription;
  const amtHint   = CARD_AMT_HINT[item.amountStatus] ?? item.amountStatus;

  return (
    <article className="dc-card">

      {/* ── Header ── */}
      <header className="dc-header">
        <div className="dc-header-top">
          <span className="dc-order-badge">{item.orderId}</span>
          <span className={`dc-type-pill ${typeCfg.cls}`}>{typeCfg.label}</span>
        </div>
        <div className="dc-header-body">
          <h3 className="dc-product-name">{item.product}</h3>
          <p className="dc-qty-text">{item.qty}</p>
        </div>
      </header>

      {/* ── Status strip ── */}
      <div className="dc-status-strip">
        <span className="dc-status-label">Delivery Status</span>
        <span className={`dc-status-badge ${statusCfg.cls}`}>
          <span className="dc-status-dot" />
          {statusCfg.label}
        </span>
      </div>

      {/* ── Details ── */}
      <div className="dc-details">

        {/* Customer */}
        <div className="dc-detail-row">
          <div className="dc-icon-wrap dc-icon-customer">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
          </div>
          <div className="dc-detail-content">
            <p className="dc-detail-key">Customer</p>
            <p className="dc-detail-val">{group.displayName}</p>
            <p className="dc-detail-sub">{group.clientId}</p>
          </div>
          <div className="dc-contact">
            <p className="dc-detail-key">Contact</p>
            <p className="dc-contact-val">{group.phone || "—"}</p>
          </div>
        </div>

        {/* Address */}
        <div className="dc-detail-row">
          <div className="dc-icon-wrap dc-icon-address">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span>
          </div>
          <div className="dc-detail-content">
            <p className="dc-detail-key">Delivery Address</p>
            <p className="dc-detail-val">{group.address || "—"}</p>
          </div>
        </div>

        {/* Date */}
        <div className="dc-detail-row">
          <div className="dc-icon-wrap dc-icon-date">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
          </div>
          <div className="dc-detail-content">
            <p className="dc-detail-key">Delivery Date</p>
            <p className="dc-detail-val">{dateTable}</p>
            <p className="dc-detail-sub">Daily subscription — every morning</p>
          </div>
        </div>

        {/* Amount */}
        <div className="dc-detail-row dc-detail-last">
          <div className="dc-icon-wrap dc-icon-amount">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>payments</span>
          </div>
          <div className="dc-detail-content">
            <p className="dc-detail-key">Amount</p>
            <p className="dc-detail-val dc-amount-val">₹{item.amount}</p>
            <span className="dc-amt-hint">
              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>check_circle</span>
              {amtHint}
            </span>
          </div>
        </div>

      </div>

      {/* ── Footer actions ── */}
      <div className="dc-footer">
        <button
          type="button"
          className={`dc-footer-primary${item.status === "paused" ? " dc-footer-paused" : ""}`}
          onClick={() => onCycleStatus(item.subscriptionId, item.status)}
        >
          {NEXT_STATUS_LABEL[item.status] ?? "Edit Status"}
        </button>
        <button
          type="button"
          className="dc-footer-secondary"
          onClick={() => onNavigate(group.clientId)}
        >
          View Customer
        </button>
      </div>

    </article>
  );
}

export { AdminDeliveries };
