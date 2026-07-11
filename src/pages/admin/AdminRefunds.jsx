import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminRefunds.css";
import { ProcessRefundModal } from "./ProcessRefundModal";
import { RefundSuccessModal } from "./RefundSuccessModal";

const SEED_REFUNDS = [
  {
    id: "r1",
    customerId: "GR00124",
    name: "Priya Shah",
    orderId: "ORD-1002",
    windowStatus: "within",
    status: "pending",
    product: "Fresh Paneer",
    qty: "500g",
    orderDate: "9 Jun 2026",
    deliveryDate: "9 Jun 2026",
    orderType: "Individual",
    phone: "9876543210",
    amount: 220,
    reasonTag: "Quality Issue",
    requestedAt: "10 Jun, 09:20 AM",
    paymentMethod: "UPI — GPay",
    customerNote: "Paneer was sour, had to throw it away",
    hasPhoto: true,
  },
  {
    id: "r2",
    customerId: "GR00089",
    name: "Rahul Mehta",
    orderId: "ORD-1005",
    windowStatus: "within",
    status: "approved",
    product: "Organic Curd",
    qty: "400g",
    orderDate: "8 Jun 2026",
    deliveryDate: "9 Jun 2026",
    orderType: "Extra",
    phone: "9765432100",
    amount: 90,
    reasonTag: "Not received",
    requestedAt: "10 Jun, 07:50 AM",
    approvedAt: "10 Jun, 08:30 AM",
    paymentMethod: "Cash — Driver",
    customerNote: "Delivery boy marked delivered but I never got it",
    overdueHours: null,
  },
  {
    id: "r3",
    customerId: "GR00178",
    name: "Neha Joshi",
    orderId: "ORD-1009",
    windowStatus: "was_within",
    status: "rejected",
    product: "Table Butter",
    qty: "200g",
    orderDate: "9 Jun 2026",
    deliveryDate: "9 Jun 2026",
    orderType: "Extra",
    phone: "9543210000",
    amount: 180,
    reasonTag: "Wrong product",
    requestedAt: "10 Jun, 08:00 AM",
    rejectedAt: "10 Jun, 10:00 AM",
    paymentMethod: "UPI — PhonePe",
    customerNote: "Got salted butter instead of table butter",
    rejectionReason: "Delivery photo confirms correct product was delivered",
  },
  {
    id: "r4",
    customerId: "GR00201",
    name: "Amit Shah",
    orderId: "ORD-0950",
    windowStatus: "expired",
    status: "expired",
    product: "Buffalo Milk 1L",
    qty: "2 units",
    orderDate: "5 Jun 2026",
    deliveryDate: "5 Jun 2026",
    orderType: "Individual",
    phone: "9812345678",
    amount: 140,
    reasonTag: "Late request",
    requestedAt: "10 Jun, 06:00 AM",
    paymentMethod: "UPI — GPay",
    customerNote: "",
  },
  {
    id: "r5",
    customerId: "GR00261",
    name: "Sneha Patel",
    orderId: "ORD-0998",
    windowStatus: "outside",
    status: "approved",
    product: "A2 Cow Milk",
    qty: "1.5L",
    orderDate: "4 Jun 2026",
    deliveryDate: "5 Jun 2026",
    orderType: "Subscription",
    phone: "9654321000",
    amount: 102,
    reasonTag: "Quality Issue",
    requestedAt: "10 Jun, 06:30 AM",
    approvedAt: "9 Jun, 14:00 PM",
    paymentMethod: "Monthly bill",
    customerNote: "Wrong quantity delivered — only got 500ml instead of 1.5L",
    overdueHours: 18,
  },
  {
    id: "r6",
    customerId: "GR00312",
    name: "Amit Sharma",
    orderId: "ORD-1007",
    windowStatus: "was_within",
    status: "refunded",
    product: "Cow Ghee A2",
    qty: "500g",
    orderDate: "9 Jun 2026",
    deliveryDate: "9 Jun 2026",
    orderType: "Individual",
    phone: "9432100000",
    amount: 620,
    reasonTag: "Not received",
    requestedAt: "10 Jun, 07:45 AM",
    approvedAt: "10 Jun, 09:30 AM",
    refundedAt: "10 Jun, 11:00 AM",
    paymentMethod: "UPI — GPay",
    refundPaymentMethod: "UPI",
    paymentRef: "402812345678",
    customerNote: "Item was not delivered but marked as delivered",
    notificationSent: true,
  },
  {
    id: "r7",
    customerId: "GR00155",
    name: "Sunita Verma",
    orderId: "ORD-0942",
    windowStatus: "within",
    status: "refunded",
    product: "A2 Cow Milk",
    qty: "1L × 2",
    orderDate: "8 Jun 2026",
    deliveryDate: "9 Jun 2026",
    orderType: "Subscription",
    phone: "9988776655",
    amount: 136,
    reasonTag: "Quality issue",
    requestedAt: "9 Jun, 06:30 AM",
    approvedAt: "9 Jun, 09:00 AM",
    refundedAt: "9 Jun, 11:00 AM",
    paymentMethod: "UPI — GPay",
    refundPaymentMethod: "UPI",
    paymentRef: "402899887766",
    customerNote: "Milk smelled off",
    notificationSent: true,
  },
];

const TABS = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "refunded", label: "Refunded" },
];

const EYE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CHECK_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const PROCESS_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WARN_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

function WindowBadge({ status }) {
  if (status === "outside") {
    return (
      <span className="rf-win-badge rf-win-outside">
        <span className="rf-win-dot" />
        Outside 2-day window
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="rf-win-badge rf-win-expired">Window expired</span>
    );
  }
  if (status === "was_within") {
    return (
      <span className="rf-win-badge rf-win-within">
        {CHECK_ICON} Was within window
      </span>
    );
  }
  return (
    <span className="rf-win-badge rf-win-within">
      {CHECK_ICON} Within 2-day window
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === "approved") {
    return (
      <span className="rf-status-badge rf-status-approved">
        {CHECK_ICON} Approved — payment pending
      </span>
    );
  }
  if (status === "refunded") {
    return (
      <span className="rf-status-badge rf-status-refunded">
        {CHECK_ICON} Refunded
      </span>
    );
  }
  const map = {
    pending:  { cls: "rf-status-pending",  dot: true,  label: "Pending" },
    rejected: { cls: "rf-status-rejected", dot: true,  label: "Rejected" },
    expired:  { cls: "rf-status-expired",  dot: false, label: "Expired" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`rf-status-badge ${s.cls}`}>
      {s.dot && <span className="rf-status-dot" />}
      {s.label}
    </span>
  );
}

/* ── Refunded card — special layout ── */
function RefundedCard({ refund, navigate }) {
  return (
    <div className="rf-card rf-card-refunded">

      {/* Header */}
      <div className="rf-card-hdr">
        <div className="rf-card-hdr-left">
          <div className="rf-name-row">
            <span className="rf-cid">{refund.customerId}</span>
            <h3 className="rf-cname">{refund.name}</h3>
          </div>
          <span className="rf-oid">Order {refund.orderId}</span>
          <WindowBadge status={refund.windowStatus} />
        </div>
        <StatusBadge status="refunded" />
      </div>

      {/* Body */}
      <div className="rf-refunded-body">
        <div className="rf-refunded-grid">

          {/* Left: grouped sections */}
          <div className="rf-refunded-left">

            {/* Order Information */}
            <div className="rf-refunded-section">
              <h4 className="rf-group-hdr">Order Information</h4>
              <div className="rf-info-grid">
                <div>
                  <p className="rf-lbl">Product</p>
                  <p className="rf-val">{refund.product}</p>
                </div>
                <div>
                  <p className="rf-lbl">Quantity</p>
                  <p className="rf-val">{refund.qty}</p>
                </div>
                <div>
                  <p className="rf-lbl">Order Type</p>
                  <p className="rf-val">{refund.orderType}</p>
                </div>
                <div>
                  <p className="rf-lbl">Order Date</p>
                  <p className="rf-val">{refund.orderDate}</p>
                </div>
                <div>
                  <p className="rf-lbl">Delivery Date</p>
                  <p className="rf-val">{refund.deliveryDate}</p>
                </div>
                <div>
                  <p className="rf-lbl">Customer Phone</p>
                  <p className="rf-val">{refund.phone}</p>
                </div>
              </div>
            </div>

            {/* Refund Timeline */}
            <div className="rf-refunded-section">
              <h4 className="rf-group-hdr">Refund Timeline</h4>
              <div className="rf-timeline-grid">
                <div>
                  <p className="rf-lbl">Requested</p>
                  <p className="rf-val">{refund.requestedAt}</p>
                </div>
                <div>
                  <p className="rf-lbl">Approved</p>
                  <p className="rf-val">{refund.approvedAt}</p>
                </div>
                <div>
                  <p className="rf-lbl">Refunded</p>
                  <p className="rf-val">{refund.refundedAt}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right: financials panel */}
          <div className="rf-refunded-right">
            <div className="rf-refunded-amount-block">
              <p className="rf-lbl">Refund Amount</p>
              <p className="rf-amount-xl">₹{refund.amount}</p>
            </div>

            <div className="rf-refunded-meta-block">
              <div>
                <p className="rf-lbl">Reason:</p>
                <span className="rf-reason-badge-gray">{refund.reasonTag}</span>
              </div>

              <div>
                <p className="rf-lbl" style={{ marginBottom: "0.5rem" }}>Payment Method:</p>
                <div className="rf-payment-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>account_balance_wallet</span>
                  {refund.refundPaymentMethod} · Ref {refund.paymentRef}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="rf-refunded-footer">
        <div className="rf-footer-notif">
          <span>Customer notified via WhatsApp + SMS</span>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="#16a34a">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <button
          type="button"
          className="rf-btn-ghost"
          onClick={() => navigate("/admin/orders")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
          View details
        </button>
      </div>

    </div>
  );
}

/* ── Standard card (pending / approved / rejected / expired) ── */
function RefundCard({ refund, onAccept, onReject, onProcess, navigate }) {
  const isPending  = refund.status === "pending";
  const isRejected = refund.status === "rejected";
  const isExpired  = refund.status === "expired";
  const isApproved = refund.status === "approved";

  const secondRowLabel = isRejected ? "Rejected On"
    : isApproved ? "Approved On"
    : "Payment Method";

  const secondRowValue = isRejected ? refund.rejectedAt
    : isApproved ? refund.approvedAt
    : refund.paymentMethod;

  return (
    <div className={`rf-card rf-card-${refund.status}`}>

      {/* Header */}
      <div className="rf-card-hdr">
        <div className="rf-card-hdr-left">
          <div className="rf-name-row">
            <span className="rf-cid">{refund.customerId}</span>
            <h3 className="rf-cname">{refund.name}</h3>
          </div>
          <span className="rf-oid">Order {refund.orderId}</span>
          {isExpired
            ? <span className="rf-win-badge rf-win-expired">Window expired — 5 days old</span>
            : <WindowBadge status={refund.windowStatus} />
          }
        </div>
        <StatusBadge status={refund.status} />
      </div>

      {/* Body grid */}
      <div className="rf-card-body">
        <div className="rf-body-grid">
          {/* 4×2 data grid */}
          <div className="rf-data-grid">
            <div><p className="rf-lbl">Product</p><p className="rf-val">{refund.product}</p></div>
            <div><p className="rf-lbl">Qty</p><p className="rf-val">{refund.qty}</p></div>
            <div><p className="rf-lbl">Order Date</p><p className="rf-val">{refund.orderDate ?? "—"}</p></div>
            <div><p className="rf-lbl">Delivery Date</p><p className="rf-val">{refund.deliveryDate ?? "—"}</p></div>
            <div><p className="rf-lbl">Refund Requested</p><p className="rf-val">{refund.requestedAt}</p></div>
            <div><p className="rf-lbl">{secondRowLabel}</p><p className="rf-val">{secondRowValue ?? "—"}</p></div>
            <div><p className="rf-lbl">Order Type</p><p className="rf-val">{refund.orderType}</p></div>
            <div><p className="rf-lbl">Customer Phone</p><p className="rf-val">{refund.phone}</p></div>
          </div>

          {/* Amount panel */}
          <div className="rf-amount-panel">
            <p className="rf-lbl">Amount{isRejected ? " requested" : ""}</p>
            <p className={`rf-amount${isRejected || isExpired ? " rf-amount-muted" : ""}`}>
              ₹{refund.amount}
            </p>
            <span className={`rf-reason-tag${isRejected || isExpired ? " rf-reason-tag-muted" : ""}`}>
              {refund.reasonTag}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="rf-card-footer">
        <div className="rf-footer-left">
          {isPending && refund.customerNote && (
            <p className="rf-footer-note">"{refund.customerNote}"</p>
          )}
          {isApproved && (
            <>
              {refund.customerNote && <p className="rf-footer-note">"{refund.customerNote}"</p>}
              {refund.overdueHours && (
                <p className="rf-overdue-warn">{WARN_ICON} Pending payment for over {refund.overdueHours} hours</p>
              )}
            </>
          )}
          {isRejected && (
            <p className="rf-footer-rejection">Rejection reason: "{refund.rejectionReason}"</p>
          )}
          {isExpired && (
            <p className="rf-footer-warn">{WARN_ICON} Filed past the 48-hour window — manual approval required</p>
          )}
        </div>

        <div className="rf-footer-actions">
          {isPending && (
            <>
              <button type="button" className="rf-btn-ghost" onClick={() => navigate("/admin/orders")}>{EYE_ICON} View order</button>
              <button type="button" className="rf-btn-danger" onClick={() => onReject(refund.id)}>Reject</button>
              <button type="button" className="rf-btn-primary" onClick={() => onAccept(refund.id)}>Accept</button>
            </>
          )}
          {isApproved && (
            <>
              <button type="button" className="rf-btn-ghost" onClick={() => navigate("/admin/orders")}>{EYE_ICON} View order</button>
              <button type="button" className="rf-btn-blue" onClick={() => onProcess(refund.id)}>{PROCESS_ICON} Process refund</button>
            </>
          )}
          {isRejected && (
            <button type="button" className="rf-btn-ghost">{EYE_ICON} View details</button>
          )}
          {isExpired && (
            <>
              <button type="button" className="rf-btn-danger" onClick={() => onReject(refund.id)}>Decline</button>
              <button type="button" className="rf-btn-primary" onClick={() => onAccept(refund.id)}>Approve manually</button>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

function AdminRefunds() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState(SEED_REFUNDS);
  const [tab, setTab] = useState("all");
  const [modalRefund, setModalRefund] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const counts = {
    all:      refunds.length,
    pending:  refunds.filter(r => r.status === "pending").length,
    approved: refunds.filter(r => r.status === "approved").length,
    rejected: refunds.filter(r => r.status === "rejected").length,
    refunded: refunds.filter(r => r.status === "refunded").length,
  };

  const refundedAmount = refunds
    .filter(r => r.status === "refunded")
    .reduce((sum, r) => sum + r.amount, 0);

  const visible = tab === "all" ? refunds : refunds.filter(r => r.status === tab);

  const handleAccept = (id) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: "approved", approvedAt: "Now" } : r));
  };

  const handleReject = (id) => {
    setRefunds(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: "rejected", rejectedAt: "Now", rejectionReason: r.rejectionReason ?? "Declined by admin" }
        : r
    ));
  };

  const handleProcess = (id) => {
    setModalRefund(refunds.find(r => r.id === id));
  };

  const handleConfirmProcess = (data) => {
    const refund = modalRefund;
    setRefunds(prev => prev.map(x =>
      x.id === refund.id
        ? {
            ...x,
            status: "refunded",
            refundedAt: data.refundedAt,
            refundPaymentMethod: data.refundPaymentMethod,
            paymentRef: data.paymentRef,
            notificationSent: data.notificationSent,
            overdueHours: null,
          }
        : x
    ));
    setModalRefund(null);
    setSuccessData({ refund, confirmedData: data });
  };

  return (
    <div className="rf-page">

      {/* ── Title ── */}
      <h2 className="rf-page-title">Refund Management</h2>

      {/* ── Filter bar ── */}
      <div className="rf-filter-bar">
        <div className="rf-filter-left">
          <div className="rf-date-label-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Date:</span>
          </div>
          <div className="rf-toggle-group">
            <button type="button" className="rf-toggle-btn rf-toggle-active">Today</button>
            <button type="button" className="rf-toggle-btn">This month</button>
          </div>
          <div className="rf-date-input-wrap">
            <input type="text" readOnly className="rf-date-input" defaultValue="10 / 06 / 2026" />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>
        <div className="rf-showing-chip">Showing: 10 June 2026</div>
      </div>

      {/* ── KPI strip ── */}
      <div className="rf-kpi-row">
        <div className="rf-kpi">
          <p className="rf-kpi-lbl">Total Requests</p>
          <p className="rf-kpi-val">{counts.all}</p>
          <p className="rf-kpi-sub">Today</p>
        </div>
        <div className="rf-kpi rf-kpi-pending">
          <p className="rf-kpi-lbl">Pending</p>
          <p className="rf-kpi-val rf-kpi-val-pending">{counts.pending}</p>
          <p className="rf-kpi-sub">Needs decision</p>
        </div>
        <div className="rf-kpi rf-kpi-approved">
          <p className="rf-kpi-lbl">Approved</p>
          <p className="rf-kpi-val rf-kpi-val-blue">{counts.approved}</p>
          <p className="rf-kpi-sub">Awaiting payment</p>
        </div>
        <div className="rf-kpi rf-kpi-rejected">
          <p className="rf-kpi-lbl">Rejected</p>
          <p className="rf-kpi-val rf-kpi-val-gray">{counts.rejected}</p>
          <p className="rf-kpi-sub">Today</p>
        </div>
        <div className={`rf-kpi rf-kpi-refunded${tab === "refunded" ? " rf-kpi-active" : ""}`}>
          <p className="rf-kpi-lbl">Refunded</p>
          <p className="rf-kpi-val rf-kpi-val-green">₹{refundedAmount || 620}</p>
          <p className="rf-kpi-sub">Paid today</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <nav className="rf-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            className={`rf-tab${tab === t.key ? " rf-tab-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key !== "all" && counts[t.key] > 0 && (
              <span className="rf-tab-count">{counts[t.key]}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Cards ── */}
      <div className="rf-cards-list">
        {visible.length === 0 ? (
          <div className="rf-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 44 }}>task_alt</span>
            <p>No {tab === "all" ? "" : tab} refund requests.</p>
          </div>
        ) : (
          visible.map(r =>
            r.status === "refunded" ? (
              <RefundedCard key={r.id} refund={r} navigate={navigate} />
            ) : (
              <RefundCard
                key={r.id}
                refund={r}
                onAccept={handleAccept}
                onReject={handleReject}
                onProcess={handleProcess}
                navigate={navigate}
              />
            )
          )
        )}
      </div>

      {modalRefund && (
        <ProcessRefundModal
          refund={modalRefund}
          onClose={() => setModalRefund(null)}
          onConfirm={handleConfirmProcess}
        />
      )}
      {successData && (
        <RefundSuccessModal
          refund={successData.refund}
          confirmedData={successData.confirmedData}
          onClose={() => setSuccessData(null)}
        />
      )}
    </div>
  );
}

export { AdminRefunds };
