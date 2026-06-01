import { Link } from "react-router-dom";
import "./About.css";

const IMG = {
  hero:   "https://lh3.googleusercontent.com/aida-public/AB6AXuCtKCXmgE_dq-ntLrpWh5zusEEEZrCJu6BZSHfqTO1UL1DSDLsaDf4gP7a25_Q_QzW5skbqrRNMiZqj74Pg-Rsu5zRbzSXs-bfJGFGIpREJ-e1mOuNUf11unSZkLiwbY9Qi5eD3Hxkuu9W1LA2TCKEkRDGTd-rTpCPjgpr4P4XfWb_EDtlNPUreE6k2F2NyYIFkIzFrubh3lJdGfRABiYf9BiWOCvLCWeE_PlmPimg8O53_KUynQNgqeoWw04xkhnV3h-M09kNhPRK3",
  story:  "https://lh3.googleusercontent.com/aida-public/AB6AXuA2ItAKMu6ihxygW6SBGxhDl-eV6Bu1oLFi4kHL-6hUmhDSK6CRDqAqjy_fBx6gYRlcfMXdvkhKMdMXYm57V5hOsbKUw68MmvvThXE4f07Djp2bvIgTLlwYn9AlpljYzLznahcse1-zKHa_uOl3E9HcUL3Oushy92OVUsZ8KGYU5iL7fcDM9n8PGWqa63MSvHZAhYH2xSvgUAiSQxkRRbIBP2QjWcnYEEUnCy8MHW9eIYs5G4y0frCZfTe94ulhpRPhBL2kkoTSyZ47",
  cow:    "https://lh3.googleusercontent.com/aida-public/AB6AXuBlEdIYMZyMlzx_0Ny0bym56u2nbRSJBHR3mlXRFtZXw0jq8p62cL7ddOChC42HF6ylyirpdvZ-KsztGr4Ky0TB-KPPLbHveJxAy9LkKCzkLHlYcSemZlkgY5OA7u94agG7oo_ygu4XGUOCpup12fK_A_LeS_7qBCHVox4sXnM4otIKY-uE89yO_Zc2X7egwI14PXKJFHpGEA34xhJQ9x0biKJDudRpBzuIb0KP254kHSQwaxQq7h4f8tIuZ4IiJU3Cbm5K7vC6LNWR",
  farm1:  "https://lh3.googleusercontent.com/aida-public/AB6AXuDiibef1lQ66s58OG5LJlg0ErIPeVnjr3aqtRI68JQXS94rLF05yWhPmJdQYwuznRMZFjQr6dXZn3JEXqBLMR-P9ynHdEk0sqU6snok8sb9i1CRG6-W-AHV2Vr0nF8FwES_L1dCC1btlPBBXgjCFxHo5YPhbUtUW_k9zmdhDbgMQKZiUL7Vs4kIQ0ZLFN7IwpobJZ95Qp2p6vqlQeBkb4LJsiyWvMg2xUDb8Xtewhdl9fXlw2P0IpyTE-oUOo9cy9VXLl94ocoMnyAP",
  farm2:  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlJOXw0ZAhHvMX5TT0UdGAaQsQgu6sB0PVOcdkcY_1amoN2p_pZ1Ntk84nYngC-ax3vaUKHolNbfiImDg2w2dhC-0Dkl6hrZUwUWpBQm5VP5jcX4XHJcBekn49Y8HtyBnlJ4CNdkMNqPhC6o_jq5ln7ZKyt4fSXG1VgnuftHTaE4hOPFGP6T3pcRM79dTtSJNWlafI7Q67mw2pSsu-0vJww2Gd_uSFzesN5k1tZ2JSOG-vviQweOhhL_RofDrnWmj6_gbOjQW519ey",
  farm3:  "https://lh3.googleusercontent.com/aida-public/AB6AXuCBA3lpBanT3OXSwxd_xGmCfYnEIkbJwBuXekEUPKEKpQjQvS03oyh-XosfC4pHK0gryhon0D2Ymy04o-PbT1no6dMySd81q7ntN6kdFR7wnDTCIXLB1qhe83NVINTsbsAEkIMPP2xLKEZ6QlzVf1Y9xQYrKbjiDcL3NyjeFeeYwWisKIsvBDxNiEDMXWaa-C3K-LG5h5Uvk_Jq7cQdlvnf2pDVrBJDv0OJM8a-By99vC4B6irxau3hX8vNl0q-TBu2qbrtxFvJk2qp",
  farm4:  "https://lh3.googleusercontent.com/aida-public/AB6AXuDaiFiYldPttPNytFfo1veD83dq832dMfBhJeF__2fAWVTbqb08d-eTgl5hlE7VyosvrMUxVXCLJXwqKu4Xb60vA-XMEmjnWCAkcoS1qsEtQzHejXBV-UOfJA6UrUIIOFvvt0QVlkaq_2WEWxcurt1X_OvFHLu99az3xBL9ZS-Ql66gnhdDZlQ0f04rMeyM1lU8iBA0upyS8m5sU8KfvDwAg7CY07yyTQQcAtW1HyjFwyU3f2LsC8_giB6shr4IlNU-L6sXjzo74l8Y",
};

function About() {
  return (
    <div className="ab-page">

      {/* ══ HERO ══ */}
      <section className="ab-hero">
        <img
          src={IMG.hero}
          alt=""
          className="ab-hero-img"
          onError={e => { e.target.style.display = "none"; }}
        />
        <div className="ab-hero-fade" />
        <div className="ab-hero-content">
          <span className="ab-heritage-pill">Our Heritage</span>
          <h1 className="ab-hero-title">The Ritual of Purity</h1>
          <p className="ab-hero-desc">
            At Gir Rituals, we believe that nutrition is more than sustenance — it is a sacred
            connection between the earth, the animal, and your well-being.
          </p>
        </div>
      </section>

      {/* ══ STORY ══ */}
      <section className="ab-section ab-story-grid">
        <div className="ab-story-text">
          <h2 className="ab-section-title">
            Born from Tradition,<br />Perfected by Science
          </h2>
          <p className="ab-body-text">
            Our journey began in the sun-drenched plains of Saurashtra, where the Gir cow has
            been revered for millennia. We didn't just want to build a dairy company; we wanted
            to restore the ritual of consuming pure, unadulterated A2 milk.
          </p>
          <p className="ab-body-text">
            Every bottle of Gir Rituals milk is a testament to our 'Sacred Purity' mandate.
            We combine ancient Vedic wisdom with state-of-the-art cold-chain technology to ensure
            that the vital nutrients and biotics remain intact from our farm to your doorstep.
          </p>
          <div className="ab-stats">
            <div className="ab-stat">
              <span className="ab-stat-num">100%</span>
              <span className="ab-stat-lbl">Ethically Sourced</span>
            </div>
            <div className="ab-stat">
              <span className="ab-stat-num">A2</span>
              <span className="ab-stat-lbl">Certified Pure</span>
            </div>
          </div>
        </div>

        <div className="ab-story-img-col">
          <div className="ab-story-img-box">
            <img
              src={IMG.story}
              alt="Glass of A2 milk with brass vessel"
              className="ab-story-img"
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="ab-organic-blob" />
        </div>
      </section>

      {/* ══ GIR COW HERITAGE BENTO ══ */}
      <section className="ab-heritage-section">
        <div className="ab-heritage-hdr">
          <h2 className="ab-section-title">The Sacred Gir Cow</h2>
          <p className="ab-heritage-sub">Guardian of the A2 legacy and the soul of our rituals.</p>
        </div>

        <div className="ab-cow-bento">
          {/* Large image card */}
          <div className="ab-cow-main-card">
            <img
              src={IMG.cow}
              alt="Majestic Gir cow at golden hour"
              className="ab-cow-main-img"
              onError={e => { e.target.style.display = "none"; }}
            />
            <div className="ab-cow-main-grad" />
            <div className="ab-cow-caption">
              <h3 className="ab-cow-caption-title">The Surya Ketu Nadi</h3>
              <p className="ab-cow-caption-desc">
                Traditional wisdom speaks of a solar vein in the Gir cow's hump that absorbs
                solar energy, enriching the milk with golden vitality.
              </p>
            </div>
          </div>

          {/* Two info cards */}
          <div className="ab-cow-side">
            <div className="ab-info-card">
              <span className="material-symbols-outlined ab-info-icon">grass</span>
              <h4 className="ab-info-title">Natural Foraging</h4>
              <p className="ab-info-desc">
                Our cows roam free, feeding on pesticide-free green fodder and indigenous
                medicinal herbs.
              </p>
            </div>
            <div className="ab-info-card ab-info-card-dark">
              <span className="material-symbols-outlined ab-info-icon">favorite</span>
              <h4 className="ab-info-title">Ahimsa Ethics</h4>
              <p className="ab-info-desc">
                Calves are fed first. Only the surplus is collected for our community.
                No hormones, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMMITMENTS ══ */}
      <section className="ab-section ab-commit-grid">
        {/* Photo mosaic */}
        <div className="ab-photo-mosaic">
          <div className="ab-mosaic-col">
            <img
              src={IMG.farm1}
              alt="Farmer's hands holding grain"
              className="ab-mosaic-img ab-mosaic-sq"
              onError={e => { e.target.style.display = "none"; }}
            />
            <img
              src={IMG.farm2}
              alt="Eco-friendly dairy farm at dawn"
              className="ab-mosaic-img ab-mosaic-tall"
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="ab-mosaic-col ab-mosaic-col-offset">
            <img
              src={IMG.farm3}
              alt="Technician quality testing milk"
              className="ab-mosaic-img ab-mosaic-tall"
              onError={e => { e.target.style.display = "none"; }}
            />
            <img
              src={IMG.farm4}
              alt="Premium glass milk bottles on doorstep"
              className="ab-mosaic-img ab-mosaic-sq"
              onError={e => { e.target.style.display = "none"; }}
            />
          </div>
        </div>

        {/* Commitments list */}
        <div className="ab-commitments">
          <h2 className="ab-section-title">Our Commitments</h2>

          <div className="ab-commitment-list">
            <div className="ab-commitment">
              <div className="ab-commit-icon ab-commit-icon-green">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h5 className="ab-commit-title">Absolute Transparency</h5>
                <p className="ab-commit-desc">
                  Scan the QR code on any bottle to see the exact farm, lab reports, and journey
                  of your milk.
                </p>
              </div>
            </div>

            <div className="ab-commitment">
              <div className="ab-commit-icon ab-commit-icon-sand">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <div>
                <h5 className="ab-commit-title">Plastic-Free Life</h5>
                <p className="ab-commit-desc">
                  We only use glass bottles and recycled paper packaging. Our circular model
                  ensures zero waste.
                </p>
              </div>
            </div>

            <div className="ab-commitment">
              <div className="ab-commit-icon ab-commit-icon-gold">
                <span className="material-symbols-outlined">psychiatry</span>
              </div>
              <div>
                <h5 className="ab-commit-title">Ritualistic Wellness</h5>
                <p className="ab-commit-desc">
                  We don't just sell milk; we promote a lifestyle of mindfulness, heritage,
                  and pure health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="ab-section ab-cta-section">
        <div className="ab-cta-card">
          <div className="ab-cta-glow ab-cta-glow-tr" />
          <div className="ab-cta-glow ab-cta-glow-bl" />
          <div className="ab-cta-body">
            <h2 className="ab-cta-title">Start Your Ritual Today</h2>
            <p className="ab-cta-desc">
              Join thousands of families who have rediscovered the taste and benefits of true
              A2 heritage dairy.
            </p>
            <div className="ab-cta-btns">
              <Link to="/products" className="ab-cta-btn-primary">Browse Products</Link>
              <Link to="/contact" className="ab-cta-btn-outline">Support Desk</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export { About };
