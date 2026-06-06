import { useNavigate, useParams } from "react-router-dom";
import "./AdminProductionEntry.css";

const PRODUCT_DATA = {
  "cow-milk": {
    name: "Cow milk",
    unit: "Litre",
    unitShort: "L",
    date: "Friday, 5 June 2026",
    openingQty: 50,
    openingFrom: "4 June",
    freshQty: 20,
    soldQty: 65,
    pricePerUnit: 30,
    expiryDate: "5 June 2026",
    expiryStatus: "expired today",
    actionKey: "dumped",
    actionLabel: "Dumped",
    actionIcon: "delete",
    notes: "5L was slightly sour — discarded safely before evening.",
    carryToNext: false,
    savedBy: "Admin (owner)",
    savedDate: "5 June 2026",
    savedTime: "09:14 AM",
    lastEditedDate: "5 June 2026",
    lastEditedTime: "11:30 AM",
  },
  "buffalo-milk": {
    name: "Buffalo milk",
    unit: "Litre",
    unitShort: "L",
    date: "Friday, 5 June 2026",
    openingQty: 80,
    openingFrom: "4 June",
    freshQty: 0,
    soldQty: 75,
    pricePerUnit: 25,
    expiryDate: "5 June 2026",
    expiryStatus: "expired today",
    actionKey: "dumped",
    actionLabel: "Dumped",
    actionIcon: "delete",
    notes: null,
    carryToNext: false,
    savedBy: "Admin (owner)",
    savedDate: "5 June 2026",
    savedTime: "09:18 AM",
    lastEditedDate: "5 June 2026",
    lastEditedTime: "09:18 AM",
  },
  paneer: {
    name: "Paneer",
    unit: "Kilogram",
    unitShort: "kg",
    date: "Friday, 5 June 2026",
    openingQty: 40,
    openingFrom: "4 June",
    freshQty: 60,
    soldQty: 55,
    pricePerUnit: 50,
    expiryDate: "7 June 2026",
    expiryStatus: "expires in 2 days",
    actionKey: "staff",
    actionLabel: "Reserved for staff",
    actionIcon: "group",
    notes: "Batch quality excellent — extra firm texture noted.",
    carryToNext: true,
    savedBy: "Admin (owner)",
    savedDate: "5 June 2026",
    savedTime: "09:22 AM",
    lastEditedDate: "5 June 2026",
    lastEditedTime: "10:45 AM",
  },
  "cow-ghee": {
    name: "Cow ghee",
    unit: "Kilogram",
    unitShort: "kg",
    date: "Friday, 5 June 2026",
    openingQty: 10,
    openingFrom: "4 June",
    freshQty: 5,
    soldQty: 3,
    pricePerUnit: 250,
    expiryDate: "Safe (30 days)",
    expiryStatus: "safe to keep",
    actionKey: "stored",
    actionLabel: "Stored",
    actionIcon: "inventory_2",
    notes: "Bilona method batch. Premium grade.",
    carryToNext: true,
    savedBy: "Admin (owner)",
    savedDate: "5 June 2026",
    savedTime: "09:30 AM",
    lastEditedDate: "5 June 2026",
    lastEditedTime: "09:30 AM",
  },
};

const FALLBACK = PRODUCT_DATA["cow-milk"];

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function AdminProductionEntry() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const p = PRODUCT_DATA[productId] ?? FALLBACK;

  const totalAvail = p.openingQty + p.freshQty;
  const income     = p.soldQty * p.pricePerUnit;
  const leftover   = Math.max(0, totalAvail - p.soldQty);
  const sellRate   = totalAvail > 0
    ? ((p.soldQty / totalAvail) * 100).toFixed(1)
    : "0.0";

  const shortDate = p.date.replace(/^[A-Za-z]+,\s*/, "");

  return (
    <div className="pe-page">

      {/* ── Back button ── */}
      <button
        type="button"
        className="pe-back-btn"
        onClick={() => navigate("/admin/production-log")}
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to production
      </button>

      {/* ── Title ── */}
      <h1 className="pe-title">{p.name} — {shortDate}</h1>

      {/* ── Edit button (right-aligned) ── */}
      <div className="pe-edit-row">
        <button
          type="button"
          className="pe-edit-btn"
          onClick={() => navigate(`/admin/production/${productId}/edit`)}
        >
          <span className="material-symbols-outlined">edit</span>
          Edit this entry
        </button>
      </div>

      {/* ── 5 KPI cards ── */}
      <div className="pe-kpi-grid">

        <div className="pe-kpi-card pe-kpi-total">
          <p className="pe-kpi-label">Total available</p>
          <h3 className="pe-kpi-val pe-val-primary">{totalAvail} {p.unitShort}</h3>
          <p className="pe-kpi-sub">opening {p.openingQty}{p.unitShort} + fresh {p.freshQty}{p.unitShort}</p>
        </div>

        <div className="pe-kpi-card pe-kpi-sold">
          <p className="pe-kpi-label">Sold today</p>
          <h3 className="pe-kpi-val pe-val-secondary">{p.soldQty} {p.unitShort}</h3>
          <p className="pe-kpi-sub">from total {totalAvail}{p.unitShort} available</p>
        </div>

        <div className="pe-kpi-card pe-kpi-income">
          <p className="pe-kpi-label">Income today</p>
          <h3 className="pe-kpi-val pe-val-primary">{fmt(income)}</h3>
          <p className="pe-kpi-sub">{p.soldQty}{p.unitShort} × ₹{p.pricePerUnit}</p>
        </div>

        <div className="pe-kpi-card pe-kpi-leftover">
          <p className="pe-kpi-label pe-label-error">Leftover</p>
          <h3 className="pe-kpi-val pe-val-error">{leftover} {p.unitShort}</h3>
          <p className="pe-kpi-sub pe-sub-error">
            {p.actionLabel.toLowerCase()} — {p.expiryStatus}
          </p>
        </div>

        <div className="pe-kpi-card pe-kpi-rate">
          <p className="pe-kpi-label">Sell rate</p>
          <h3 className="pe-kpi-val pe-val-rate">{sellRate}%</h3>
          <p className="pe-kpi-sub">of total available</p>
        </div>

      </div>

      {/* ── Details 2/3 + 1/3 grid ── */}
      <div className="pe-details-grid">

        {/* Left: Production details table */}
        <div className="pe-card">
          <div className="pe-card-head">
            <span className="material-symbols-outlined pe-head-icon">inventory</span>
            <h4 className="pe-head-title">Production details</h4>
          </div>
          <div className="pe-table-scroll">
            <table className="pe-table">
              <tbody>
                <tr className="pe-tr">
                  <th className="pe-th">Product</th>
                  <td className="pe-td pe-td-bold">{p.name}</td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Date</th>
                  <td className="pe-td">{p.date}</td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Unit</th>
                  <td className="pe-td">{p.unit} ({p.unitShort})</td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Opening stock</th>
                  <td className="pe-td">
                    <p className="pe-td-bold pe-td-primary">{p.openingQty} {p.unitShort}</p>
                    <p className="pe-td-note">carried from {p.openingFrom}</p>
                  </td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Fresh produced today</th>
                  <td className="pe-td pe-td-bold">{p.freshQty} {p.unitShort}</td>
                </tr>
                <tr className="pe-tr pe-tr-tinted">
                  <th className="pe-th">Total available</th>
                  <td className="pe-td">
                    <p className="pe-td-bold pe-td-primary">{totalAvail} {p.unitShort}</p>
                    <p className="pe-td-note">
                      {p.openingQty}{p.unitShort} opening + {p.freshQty}{p.unitShort} fresh
                    </p>
                  </td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Qty sold today</th>
                  <td className="pe-td pe-td-bold pe-td-secondary">
                    {p.soldQty} {p.unitShort}
                  </td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Price per {p.unitShort}</th>
                  <td className="pe-td">₹ {p.pricePerUnit} / {p.unitShort}</td>
                </tr>
                <tr className="pe-tr pe-tr-income">
                  <th className="pe-th pe-th-income">Total income today</th>
                  <td className="pe-td pe-td-income">{fmt(income)}</td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Leftover qty</th>
                  <td className="pe-td">
                    <p className="pe-td-bold pe-td-error">{leftover} {p.unitShort}</p>
                    <p className="pe-td-note">
                      {totalAvail}{p.unitShort} total — {p.soldQty}{p.unitShort} sold
                    </p>
                  </td>
                </tr>
                <tr className="pe-tr">
                  <th className="pe-th">Sell-through rate</th>
                  <td className="pe-td">
                    <p className="pe-td-bold pe-td-rate">{sellRate}%</p>
                    <p className="pe-td-note">
                      {p.soldQty} sold ÷ {totalAvail} available × 100
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="pe-side-col">

          {/* Leftover Stock Details */}
          <div className="pe-card">
            <div className="pe-card-head">
              <span className="material-symbols-outlined pe-head-icon">delete_sweep</span>
              <h4 className="pe-head-title">Leftover stock details</h4>
            </div>
            <div className="pe-side-body">

              <div className="pe-side-item">
                <p className="pe-side-key">Leftover qty</p>
                <p className="pe-side-val pe-side-error">{leftover} {p.unitShort}</p>
              </div>

              <div className="pe-side-item">
                <p className="pe-side-key">Expiry date</p>
                <p className="pe-side-val pe-side-error">{p.expiryDate}</p>
                <p className="pe-side-note">{p.expiryStatus}</p>
              </div>

              <div className="pe-side-item">
                <p className="pe-side-key">Action taken</p>
                <span className={`pe-action-badge${p.actionKey === "dumped" ? " pe-action-error" : " pe-action-neutral"}`}>
                  <span className="material-symbols-outlined pe-action-icon">{p.actionIcon}</span>
                  {p.actionLabel}
                </span>
              </div>

              <div className="pe-side-item">
                <p className="pe-side-key">Notes</p>
                <p className="pe-side-notes">
                  {p.notes ? `"${p.notes}"` : "— (No notes added)"}
                </p>
              </div>

              <div className="pe-side-item">
                <p className="pe-side-key">Carries to next day</p>
                <span className="pe-carry-badge">
                  <span className="material-symbols-outlined pe-action-icon">
                    {p.carryToNext ? "check_circle" : "block"}
                  </span>
                  {p.carryToNext ? "Yes — transferred" : "No — fully cleared"}
                </span>
              </div>

            </div>
          </div>

          {/* Entry Record */}
          <div className="pe-card">
            <div className="pe-card-head">
              <span className="material-symbols-outlined pe-head-icon">history</span>
              <h4 className="pe-head-title">Entry record</h4>
            </div>
            <div className="pe-side-body">

              <div className="pe-record-row">
                <p className="pe-side-key">Saved by</p>
                <p className="pe-record-val">{p.savedBy}</p>
              </div>

              <div className="pe-record-row pe-record-border">
                <p className="pe-side-key">Saved on</p>
                <div className="pe-record-right">
                  <p className="pe-record-val">{p.savedDate}</p>
                  <p className="pe-record-time">{p.savedTime}</p>
                </div>
              </div>

              <div className="pe-record-row pe-record-border">
                <p className="pe-side-key">Last edited</p>
                <div className="pe-record-right">
                  <p className="pe-record-val">{p.lastEditedDate}</p>
                  <p className="pe-record-time">{p.lastEditedTime}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Decorative atmospheric block */}
          <div className="pe-deco-block">
            <div className="pe-deco-overlay">
              <p className="pe-deco-name">Heritage Hearth</p>
              <p className="pe-deco-tagline">Committed to Quality since 1928</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

export { AdminProductionEntry };
