import { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubscribed(true);
      setEmail("");
    }
  };
  return <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {
    /* Brand */
  }
          <div className="footer-col footer-brand-col">
            <span className="footer-logo">GIR RITUALS</span>
            <p className="footer-tagline">
              Pure A2 dairy from Gir cows, delivered to your door every morning. Farm to family, with love.
            </p>
            <div className="footer-social">
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" aria-label="WhatsApp">💬</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
              <a href="mailto:hello@girrituals.com" aria-label="Email">✉️</a>
              <a href="tel:+919876543210" aria-label="Phone">📞</a>
            </div>
          </div>

          {
    /* Quick Links */
  }
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/offers">Offers</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {
    /* Account */
  }
          <div className="footer-col">
            <h4 className="footer-heading">My Account</h4>
            <ul className="footer-links">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/schedule">My Schedule</Link></li>
              <li><Link to="/bills">My Bills</Link></li>
              <li><Link to="/orders">Orders</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>

          {
    /* Legal */
  }
          <div className="footer-col">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Privacy Policy</Link></li>
              <li><Link to="/contact">Terms of Service</Link></li>
              <li><Link to="/contact">Refund Policy</Link></li>
              <li><Link to="/contact">Delivery Policy</Link></li>
            </ul>
          </div>

          {
    /* Contact Info */
  }
          <div className="footer-col">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-contact-list">
              <li>📍 Gir Somnath, Gujarat — 362135</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ hello@girrituals.com</li>
              <li>🕐 Mon–Sat: 6 AM – 8 PM</li>
            </ul>
          </div>
        </div>

        {
    /* Newsletter */
  }
        <div className="footer-newsletter">
          <div>
            <h4>Stay in the loop</h4>
            <p>Get seasonal offers and farm updates straight to your inbox.</p>
          </div>
          {subscribed ? <p className="newsletter-success">✓ You're subscribed! Check your inbox.</p> : <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input
    type="email"
    placeholder="your@email.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
              <button type="submit">Subscribe</button>
            </form>}
        </div>

        <div className="footer-bottom">
          <p>© {(/* @__PURE__ */ new Date()).getFullYear()} Gir Rituals. All rights reserved.</p>
          <p>Made with ♥ for Gir cow heritage</p>
        </div>
      </div>
    </footer>;
}
export {
  Footer
};
