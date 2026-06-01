import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Schedule.css";

/* ── Images ─────────────────────────────────────────────────── */
const TABLE_IMGS = {
  milk: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJeQczHDdt8A2yjqJG0L7XBV_dc43hjIE8lW5NVrrJmqjeICKsQUXosRxyNT34ekw8rkecK97dQsTjOvC60QNkWKOsbs8eGmGQ5wXIwLlN1DXFw9Pcr5pVooaXfw1kP2dmFpeyIodsv1KRMHJZwxszJkEvmRxIaFzqi1NLz1NieB5-lExi9AUTvPlDCYbDLJJCHU65oMYrOI_nWAOqQF-Al3_gKBxKb_6DkyKGEv_GV1zdB4GTwRsNQZTKyIPD04msdh9uo-V-W6_O",
  ghee: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUCkJfsrQCoIGP1zBZeMuEAI5C_fVFf6XRQ67EJ2usaJ_uNmYwnpNvdypQ2SlwQhcQZiJA4YEW_B1T5l7Yoz28ZC7d9A5n3hlLyfC6t3qvPUGzxCkspncmnSwAkFIWWBSpB1SnMCTdDPlf1_hwfe1VqFnrwivNTnTdpiiqHg2UheosSZ6gw--jRBjmUBj1u7CwukJvIwbsf5AEsDlP6SNLcKDhb3VAjDHUgcBdt8A9ucr01RpCswImTzk37BIQPtLqVrF4NgU99BaX",
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/* ── Helpers ─────────────────────────────────────────────────── */
function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(month, year) {
  return new Date(year, month, 1).getDay();
}
function getMonthLabel(month, year) {
  return new Date(year, month, 1).toLocaleDateString("en-IN", {
    month: "long", year: "numeric",
  });
}
function getDayStatus(day, month, year, today) {
  const d = new Date(year, month, day);
  if (d > today) return "future";
  if (day % 7 === 0) return "paused";
  if (day % 11 === 0) return "extra";
  if (day % 13 === 0) return "cancelled";
  return "delivered";
}
function buildScheduleForDay(day, month, year, today) {
  const status = getDayStatus(day, month, year, today);
  if (status === "future") return [];
  const label =
    status === "paused"    ? "Paused"    :
    status === "extra"     ? "Extra"     :
    status === "cancelled" ? "Cancelled" : "Delivered";
  if (status === "paused" || status === "cancelled") {
    return [{ key: "milk", productName: "A2 Gir Cow Milk (Full Cream)", subtitle: "500ml Bottle", qty: 0, rate: 85, status: label }];
  }
  return [
    { key: "milk", productName: "A2 Gir Cow Milk (Full Cream)", subtitle: "500ml Bottle", qty: 2, rate: 85,  status: label },
    { key: "ghee", productName: "Traditional Cultured Ghee",    subtitle: "250g Jar",      qty: 1, rate: 650, status: label },
  ];
}

/* ── Main Schedule ───────────────────────────────────────────── */
function Schedule() {
  const today = useMemo(() => new Date(), []);
  const { showToast } = useToast();

  const [viewMonth,   setViewMonth]   = useState(today.getMonth());
  const [viewYear,    setViewYear]    = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const daysInMonth    = getDaysInMonth(viewMonth, viewYear);
  const firstDayOfWeek = getFirstDayOfWeek(viewMonth, viewYear);
  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

  /* Prev-month tail cells */
  const prevMonthTailDays = useMemo(() => {
    if (firstDayOfWeek === 0) return [];
    const pm = viewMonth === 0 ? 11 : viewMonth - 1;
    const py = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dim = getDaysInMonth(pm, py);
    return Array.from({ length: firstDayOfWeek }, (_, i) => dim - firstDayOfWeek + 1 + i);
  }, [viewMonth, viewYear, firstDayOfWeek]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(1);
  };

  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const deliveredCount = allDays.filter(d => getDayStatus(d, viewMonth, viewYear, today) === "delivered").length;
  const extraCount     = allDays.filter(d => getDayStatus(d, viewMonth, viewYear, today) === "extra").length;
  const pausedCount    = allDays.filter(d => getDayStatus(d, viewMonth, viewYear, today) === "paused").length;
  const totalDelivered = deliveredCount + extraCount;
  const dailyRate      = 85 * 2 + 650;
  const spent          = totalDelivered * dailyRate;
  const projected      = daysInMonth * dailyRate;
  const totalWithGst   = Math.round(spent * 1.05);

  const entries    = buildScheduleForDay(selectedDay, viewMonth, viewYear, today);
  const selStatus  = getDayStatus(selectedDay, viewMonth, viewYear, today);
  const selDateStr = new Date(viewYear, viewMonth, selectedDay)
    .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="sc-page">

      {/* ══ HEADER ══ */}
      <div className="sc-header">
        <div className="sc-header-text">
          <h2 className="sc-title">My Delivery Ritual</h2>
          <p className="sc-subtitle">
            Track your monthly dairy subscription and manage your delivery schedule with sacred precision.
          </p>
        </div>
        <div className="sc-header-actions">
          <button type="button" className="sc-btn-outline" onClick={() => showToast("Pause applied for today.", "info")}>
            Pause Delivery
          </button>
          <Link to={`/payment?amount=${totalWithGst}`} className="sc-btn-primary">
            Pay Now
          </Link>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="sc-body">

        {/* ── LEFT 8/12 ── */}
        <div className="sc-left">

          {/* Calendar card */}
          <div className="sc-card sc-calendar-card">
            <div className="sc-cal-topbar">
              <div className="sc-cal-topbar-left">
                <h3 className="sc-month-label">{getMonthLabel(viewMonth, viewYear)}</h3>
                <div className="sc-nav-btns">
                  <button type="button" className="sc-nav-btn" onClick={prevMonth} aria-label="Previous month">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button type="button" className="sc-nav-btn" onClick={nextMonth} aria-label="Next month">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="sc-legend">
                <span className="sc-legend-item sc-legend-delivered">Delivered</span>
                <span className="sc-legend-item sc-legend-paused">Paused</span>
                <span className="sc-legend-item sc-legend-cancelled">Cancelled</span>
              </div>
            </div>

            <div className="sc-cal-grid">
              {/* Weekday headers */}
              {WEEKDAYS.map(w => (
                <div key={w} className="sc-weekday">{w}</div>
              ))}

              {/* Prev-month tail cells */}
              {prevMonthTailDays.map(d => (
                <div key={`prev-${d}`} className="sc-day sc-day-prev">
                  <span className="sc-day-num">{d}</span>
                </div>
              ))}

              {/* Current-month day buttons */}
              {allDays.map(day => {
                const status  = getDayStatus(day, viewMonth, viewYear, today);
                const isToday = isCurrentMonth && day === today.getDate();
                const isSel   = day === selectedDay;
                return (
                  <button
                    key={day}
                    type="button"
                    className={[
                      "sc-day sc-day-btn",
                      isSel   ? "sc-day-selected" : "",
                      isToday ? "sc-day-today"    : "",
                    ].join(" ")}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className={`sc-day-num${isSel ? " sc-day-num-sel" : ""}`}>{day}</span>
                    {status !== "future" && <span className={`sc-dot sc-dot-${status}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily schedule table */}
          <div className="sc-table-card">
            <div className="sc-table-hdr">
              <h4 className="sc-table-title">Schedule for {selDateStr}</h4>
              {selStatus === "delivered" || selStatus === "extra" ? (
                <span className="sc-tbl-badge sc-tbl-badge-active">Active Today</span>
              ) : selStatus === "paused" ? (
                <span className="sc-tbl-badge sc-tbl-badge-paused">Paused</span>
              ) : selStatus === "cancelled" ? (
                <span className="sc-tbl-badge sc-tbl-badge-cancelled">Cancelled</span>
              ) : (
                <span className="sc-tbl-badge sc-tbl-badge-future">Upcoming</span>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="sc-empty">
                <span className="material-symbols-outlined sc-empty-icon">event_busy</span>
                <p>No delivery scheduled for this day.</p>
              </div>
            ) : (
              <div className="sc-table-wrap">
                <table className="sc-table">
                  <thead className="sc-thead">
                    <tr>
                      <th className="sc-th sc-th-left">Product</th>
                      <th className="sc-th sc-th-center">Qty</th>
                      <th className="sc-th sc-th-right">Rate</th>
                      <th className="sc-th sc-th-right">Amount</th>
                      <th className="sc-th sc-th-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={i} className="sc-tr">
                        <td className="sc-td">
                          <div className="sc-product-cell">
                            <img
                              src={TABLE_IMGS[e.key]}
                              alt={e.productName}
                              className="sc-product-thumb"
                              onError={ev => { ev.target.style.display = "none"; }}
                            />
                            <div>
                              <p className="sc-product-name">{e.productName}</p>
                              <p className="sc-product-sub">{e.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="sc-td sc-td-center">{e.qty}</td>
                        <td className="sc-td sc-td-right">₹{e.rate.toFixed(2)}</td>
                        <td className="sc-td sc-td-right sc-td-amount">₹{(e.qty * e.rate).toFixed(2)}</td>
                        <td className="sc-td sc-td-right">
                          <span className={`sc-badge sc-badge-${e.status.toLowerCase()}`}>{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR 4/12 ── */}
        <div className="sc-sidebar">

          {/* Monthly stats */}
          <div className="sc-card sc-stats-card">
            <h5 className="sc-stats-title">
              {getMonthLabel(viewMonth, viewYear).split(" ")[0]} Summary
            </h5>
            <div className="sc-stats-row">
              <span className="sc-stats-row-lbl">Total Deliveries</span>
              <span className="sc-stats-row-val">{totalDelivered} / {daysInMonth}</span>
            </div>
            <div className="sc-progress-track">
              <div
                className="sc-progress-fill"
                style={{ width: daysInMonth ? `${(totalDelivered / daysInMonth) * 100}%` : "0%" }}
              />
            </div>
            <div className="sc-stats-grid">
              <div>
                <p className="sc-stat-lbl">Spent</p>
                <p className="sc-stat-val">₹{spent.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="sc-stat-lbl">Projected</p>
                <p className="sc-stat-val">₹{projected.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="sc-card sc-tip-card">
            <span className="material-symbols-outlined sc-tip-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
              lightbulb
            </span>
            <div>
              <h6 className="sc-tip-title">Pro Tip</h6>
              <p className="sc-tip-desc">
                Planning a vacation? You can pause your deliveries up to 24 hours in advance to avoid wastage.
              </p>
              <Link to="/contact" className="sc-tip-link">Learn More</Link>
            </div>
          </div>

          {/* Modified Slots */}
          <div className="sc-card sc-modified-card">
            <div className="sc-modified-top">
              <span className="material-symbols-outlined sc-modified-icon">edit_calendar</span>
              <h5 className="sc-modified-title">Modified Slots</h5>
            </div>
            <p className="sc-modified-desc">
              {pausedCount > 0
                ? `${pausedCount} pause${pausedCount > 1 ? "s" : ""} scheduled this month.`
                : "No modifications pending for this week. Your ritual follows the standard schedule."}
            </p>
          </div>
        </div>
      </div>

      {/* ══ FAB ══ */}
      <div className="sc-fab-wrap">
        <button
          type="button"
          className="sc-fab"
          onClick={() => showToast("Custom ritual booking coming soon.", "info")}
          aria-label="Add New Ritual"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>add</span>
          <span className="sc-fab-tip">Add New Ritual</span>
        </button>
      </div>
    </div>
  );
}

/* ── DayDetail (light reskin) ────────────────────────────────── */
function DayDetail() {
  const { day } = useParams();
  const today = new Date();
  const d     = Number(day ?? today.getDate());
  const month = today.getMonth();
  const year  = today.getFullYear();
  const entries = buildScheduleForDay(d, month, year, today);

  return (
    <div className="sc-page">
      <Link to="/schedule" className="sc-back-link">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Schedule
      </Link>
      <h1 className="sc-title" style={{ marginTop: "1rem" }}>
        {new Date(year, month, d).toLocaleDateString("en-IN", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        })}
      </h1>

      {entries.length === 0 ? (
        <div className="sc-card sc-empty" style={{ marginTop: "1.5rem" }}>
          <span className="material-symbols-outlined sc-empty-icon">event_busy</span>
          <p>No deliveries scheduled for this day.</p>
        </div>
      ) : entries.map((e, i) => (
        <div key={i} className="sc-card" style={{ marginTop: "1rem" }}>
          <strong>{e.productName}</strong>
          <p style={{ margin: "0.5rem 0", color: "#414846" }}>
            Qty: {e.qty}&nbsp;·&nbsp;Rate: ₹{e.rate}&nbsp;·&nbsp;Total: ₹{e.qty * e.rate}
          </p>
          <span className={`sc-badge sc-badge-${e.status.toLowerCase()}`}>{e.status}</span>
        </div>
      ))}

      {entries.length > 0 && (
        <Link
          to={`/payment?amount=${entries.reduce((s, e) => s + e.qty * e.rate, 0)}&from=schedule`}
          className="sc-btn-primary"
          style={{ marginTop: "1.5rem", display: "inline-flex" }}
        >
          Pay for this day
        </Link>
      )}
    </div>
  );
}

export { DayDetail, Schedule };
