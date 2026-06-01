import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import "./Offers.css";

/* ── Lifestyle images per offer id ──────────────────────────────────────── */
const OFFER_IMGS = {
  o1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqErAYFuUer-KLDf8WHyuHS5Fxg7Luv4FII3b74oqwmx4HRZs157ynoQNZKF-H0T5wIZNQQqlgCmVHaG_WNWRl06itLHXQaGp2gYxfWRJ5thiMwvjBKirHE1c1iGSokLvhs0Is8YV0wGgLS_tZ-oRLdypkX4-B0EGfL9rZnYSeGXFODxhpUHvlhaiQOLp5CPc03mzdw_VWxR672r-pLM9KZEirznmAQlhrdoq7ehbdxj0Yv1ORa3GKGyDVUDiVDtcrEY8G_gv0ohuO",
  o2: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdesjsCZ_xW8SrKH3G8CCCZr1-6Mnbj-0k1xbls93aUAcs2DsWJsTQC3vjHRpPxGPCJwCB_vWqvVzUHEtHco0xj545lS02Rwta_1eA8uV8nCqv6QEOTlFRFacttuQxGm7KZL2HNt_8ejTZW9m1vnR5e_nDvTOGWSZ5IWbmhvTFqE3ducq04BUQiMzrHl31TRZ8IYiMLLDgNQMjW-ZgOTr0EjaV29X7oD6ETalK7Yqy78D5JLMelBr5wfxcjpK6ueIyC2xaZJ6Npzvu",
  o3: "https://lh3.googleusercontent.com/aida-public/AB6AXuBL5QJPv8DEmcOSPmiQlYlkYIxtx23Ydv3mS4er9dsdhFpT46dAvth-iMab7i_P7Koh5choZyFW-j-nSJPYzgEA8X4V1UXBZimoSn1vLfPLi8_mI-QoYGragpHAvAlC7LLSZnesXPMo_3X-WG57eHDazH4VwXWUdX2E8aN5oHPcX-zeKhFts7o475hfDdWuKalG91GFncE0M9Cu28c9NHCvq7yURa-IQsDqaxdlAUEcw5Csr7P35rbjQq1Ab8bSYthzKk3im7WatSvL",
};

const OFFER_BADGES = {
  o1: "10% OFF",
  o2: "FREE DELIVERY",
  o3: "₹150 OFF",
};

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDoMHjRUt9q4-tU1bn0kh_r0gf7hhrtmAb21jk_TM86rjSE0ttm8HuzyrF-XqwCxgsYsusCmR7tiLpC29V1DzpICJ9M-zUrV4J8HIR3_Mkvl2LFGPTsrvbFEr8sTlK1OzEbzMyyUrujF49hHYaRuqA6EmZtPM-YxtKwTkQce2Q2M6_rlT5aIcci_fPUkRV09XB9ywM7KVmIc200Qu89CObip1pLcoynADODnyoEsuIua22pkc-K4hn-5spdtqpuGeihvP3ZNgiheszH";

const REFERRAL_CODE = "RITUAL500";

/* ── Countdown helpers ───────────────────────────────────────────────────── */
function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(targetMs - Date.now());
  useEffect(() => {
    const t = setInterval(() => setRemaining(targetMs - Date.now()), 60_000);
    return () => clearInterval(t);
  }, [targetMs]);
  const total = Math.max(0, remaining);
  const d = Math.floor(total / 86_400_000);
  const h = Math.floor((total % 86_400_000) / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  return `${String(d).padStart(2, "0")}D : ${String(h).padStart(2, "0")}H : ${String(m).padStart(2, "0")}M`;
}

function cardTimeLeft(validUntil, upcoming) {
  if (upcoming) return "Coming Soon";
  const diff = new Date(validUntil) - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `Ends in ${days}d`;
  return `Ends in ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00`;
}

/* ══════════════════════════════════════════════════════════════════════════
   OFFERS LIST
══════════════════════════════════════════════════════════════════════════ */
function Offers() {
  const { offers } = useApp();
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [copiedRef, setCopiedRef] = useState(false);

  const heroTarget = useRef(Date.now() + 4 * 86_400_000 + 12 * 3_600_000).current;
  const heroCountdown = useCountdown(heroTarget);

  const handleCopy = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code).catch(() => {});
    showToast(`Code "${code}" copied!`);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(REFERRAL_CODE).catch(() => {});
    setCopiedRef(true);
    showToast("Referral code copied!");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const filtered =
    filter === "subscriptions" ? offers.filter(o => !o.upcoming)
    : filter === "upcoming"    ? offers.filter(o => o.upcoming)
    : offers;

  return (
    <div className="of-page">

      {/* ══ SEASONAL HERO BANNER ══ */}
      <section className="of-hero-section">
        <div className="of-hero">
          <div
            className="of-hero-bg"
            style={{ backgroundImage: `url('${HERO_IMG}')` }}
          />
          <div className="of-hero-grad" />
          <div className="of-hero-content">
            <span className="of-eyebrow">SEASONAL RITUAL</span>
            <h2 className="of-hero-title">The Festival of Purity</h2>
            <p className="of-hero-desc">
              Elevate your daily offerings with 25% off on our limited batch Shravan Special Ghee.
              Sourced from grass-fed Gir cows during the monsoon dawn.
            </p>
            <div className="of-hero-actions">
              <button type="button" className="of-claim-btn">Claim Offer</button>
              <div className="of-hero-timer">
                <span className="material-symbols-outlined">timer</span>
                <span className="of-timer-text">{heroCountdown}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SACRED SAVINGS GRID ══ */}
      <section className="of-grid-section">
        <div className="of-grid-hdr">
          <div>
            <h3 className="of-grid-title">Sacred Savings</h3>
            <p className="of-grid-sub">Carefully curated benefits for your wellness journey.</p>
          </div>
          <div className="of-filters">
            {[
              { key: "all",           label: "All Offers" },
              { key: "subscriptions", label: "Subscriptions" },
              { key: "upcoming",      label: "New Arrivals" },
            ].map(f => (
              <button
                key={f.key}
                type="button"
                className={`of-filter-btn${filter === f.key ? " of-filter-active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="of-cards-grid">
          {filtered.map(o => {
            const expired = !o.upcoming && new Date(o.validUntil) < new Date();
            const img    = OFFER_IMGS[o.id];
            const badge  = OFFER_BADGES[o.id];
            const tLeft  = cardTimeLeft(o.validUntil, o.upcoming);

            return (
              <Link
                key={o.id}
                to={`/offers/${o.id}`}
                className={`of-card${expired ? " of-card-expired" : ""}`}
              >
                {/* Image + overlays */}
                <div className="of-card-img-wrap">
                  {img && (
                    <img
                      src={img}
                      alt=""
                      className="of-card-img"
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  )}
                  {badge && (
                    <span className={`of-badge${o.upcoming ? " of-badge-green" : ""}`}>
                      {badge}
                    </span>
                  )}
                  <div className="of-countdown-pill">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                    >timer</span>
                    <span>{tLeft}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="of-card-body">
                  <h4 className="of-card-title">{o.title}</h4>
                  <p className="of-card-desc">{o.description}</p>

                  <div className="of-card-footer">
                    <div className="of-card-meta">
                      {expired && <span className="of-meta-expired">Expired</span>}
                      {o.upcoming && !expired && (
                        <span className="of-meta-upcoming">Coming Soon</span>
                      )}
                      {o.promoCode && !expired && !o.upcoming && (
                        <span className="of-promo-code">{o.promoCode}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="of-arrow-btn"
                      onClick={o.promoCode && !expired && !o.upcoming
                        ? e => handleCopy(o.promoCode, e)
                        : undefined}
                      aria-label={o.promoCode && !expired && !o.upcoming ? "Copy code" : "View offer"}
                    >
                      <span className="material-symbols-outlined">
                        {o.promoCode && !expired && !o.upcoming ? "content_copy" : "arrow_forward"}
                      </span>
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══ REFERRAL + REWARDS ══ */}
      <section className="of-bottom-grid">

        {/* Share the Ritual */}
        <div className="of-share-card">
          <div className="of-share-glow" />
          <h3 className="of-share-title">Share the Ritual</h3>
          <p className="of-share-desc">
            Invite a friend to experience the purity of Gir Rituals. When they complete
            their first month, you both receive ₹500 in your wellness wallet.
          </p>
          <div className="of-share-row">
            <div className="of-share-code-box">
              <span className="of-share-code">{REFERRAL_CODE}</span>
            </div>
            <button type="button" className="of-share-copy-btn" onClick={handleCopyReferral}>
              {copiedRef ? "Copied!" : "Copy Code"}
            </button>
          </div>
        </div>

        {/* Ritual Rewards */}
        <div className="of-rewards-card">
          <div className="of-rewards-hdr">
            <span className="material-symbols-outlined of-rewards-icon">workspace_premium</span>
            <h3 className="of-rewards-title">Ritual Rewards</h3>
          </div>
          <p className="of-rewards-desc">
            Unlock exclusive tiers as you maintain your subscription. Gold members enjoy
            early access to seasonal batches and free shipping on all orders.
          </p>
          <div className="of-progress-track">
            <div className="of-progress-fill" style={{ width: "65%" }} />
          </div>
          <div className="of-rewards-footer">
            <span className="of-rewards-pts">350 points to GOLD</span>
            <Link to="/bills" className="of-rewards-link">
              View Benefits
              <span className="material-symbols-outlined">arrow_right_alt</span>
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   OFFER DETAIL (unchanged logic, light reskin)
══════════════════════════════════════════════════════════════════════════ */
function OfferDetail() {
  const { id } = useParams();
  const { offers } = useApp();
  const { showToast } = useToast();
  const offer = offers.find(o => o.id === id);

  if (!offer) return <p style={{ padding: "1.5rem" }}>Offer not found.</p>;

  const expired  = !offer.upcoming && new Date(offer.validUntil) < new Date();
  const days     = Math.ceil((new Date(offer.validUntil) - Date.now()) / 86_400_000);
  const img      = OFFER_IMGS[offer.id];

  const handleCopy = () => {
    if (!offer.promoCode) return;
    navigator.clipboard.writeText(offer.promoCode).catch(() => {});
    showToast(`Code "${offer.promoCode}" copied!`);
  };

  return (
    <div className="of-detail">
      <Link to="/offers" className="of-detail-back">
        <span className="material-symbols-outlined">arrow_back</span>
        All Offers
      </Link>

      {img && (
        <div className="of-detail-hero">
          <img src={img} alt="" className="of-detail-img" onError={e => { e.target.style.display = "none"; }} />
          <div className="of-detail-grad" />
          {OFFER_BADGES[offer.id] && (
            <span className="of-badge of-detail-badge">{OFFER_BADGES[offer.id]}</span>
          )}
        </div>
      )}

      <div className="of-detail-body">
        <div className="of-detail-row1">
          <h1 className="of-detail-title">{offer.title}</h1>
          <span className={`of-detail-status ${expired ? "of-status-expired" : offer.upcoming ? "of-status-soon" : "of-status-active"}`}>
            {expired ? "Expired" : offer.upcoming ? "Coming Soon" : "Active"}
          </span>
        </div>

        <p className="of-detail-desc">{offer.description}</p>

        <div className={`of-detail-info ${expired ? "of-info-muted" : offer.upcoming ? "of-info-soon" : days <= 7 ? "of-info-urgent" : "of-info-ok"}`}>
          {expired
            ? "This offer has expired."
            : offer.upcoming
            ? `⏰ Starts in ${days} days — Save the date!`
            : days <= 7
            ? `⚠️ Ends in ${days} days — Hurry!`
            : `✅ Valid until ${offer.validUntil}`}
        </div>

        {offer.promoCode && !expired && !offer.upcoming && (
          <div className="of-detail-promo">
            <p className="of-detail-promo-lbl">Apply this code at checkout:</p>
            <div className="of-detail-code-row">
              <span className="of-detail-code">{offer.promoCode}</span>
              <button type="button" className="btn btn-secondary of-copy-btn" onClick={handleCopy}>
                Copy Code
              </button>
            </div>
          </div>
        )}

        {!offer.upcoming && !expired && (
          <Link to="/products" className="btn btn-primary of-shop-btn">Shop Now</Link>
        )}
      </div>
    </div>
  );
}

export { OfferDetail, Offers };
