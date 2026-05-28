import { useState } from "react";
import { useToast } from "../context/ToastContext";
const CONTACTS = [
  { label: "WhatsApp", icon: "\u{1F4AC}", href: "https://wa.me/919876543210?text=Hello%20Gir%20Rituals" },
  { label: "Instagram", icon: "\u{1F4F7}", href: "https://instagram.com" },
  { label: "Email", icon: "\u2709\uFE0F", href: "mailto:hello@girrituals.com" },
  { label: "Phone", icon: "\u{1F4DE}", href: "tel:+919876543210" }
];
const SUBJECTS = [
  "General Inquiry",
  "Delivery Issue",
  "Billing / Payment",
  "Refund Request",
  "Subscription Change",
  "Product Quality",
  "Other"
];
function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showToast("Message sent! We'll get back to you within 24 hours.");
    }, 1200);
  };
  return <div>
      <h1 className="page-title">Contact Us</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        We're here for orders, delivery issues, billing queries, and refunds.
      </p>

      {
    /* Quick contact channels */
  }
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {CONTACTS.map((c) => <a
    key={c.label}
    href={c.href}
    target="_blank"
    rel="noreferrer"
    className="card"
    style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
  >
            <span style={{ fontSize: "1.375rem" }}>{c.icon}</span>
            <strong style={{ fontSize: "0.9rem" }}>{c.label}</strong>
          </a>)}
      </div>

      {
    /* Full contact form */
  }
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Send a Message</h3>

        {submitted ? <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
            <strong>Message Sent!</strong>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              Our team will respond within 24 hours. Thank you!
            </p>
            <button
    type="button"
    className="btn btn-secondary"
    style={{ marginTop: "1rem" }}
    onClick={() => {
      setSubmitted(false);
      setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
    }}
  >
              Send Another
            </button>
          </div> : <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="name">Name *</label>
                <input
    id="name"
    name="name"
    type="text"
    placeholder="Your name"
    value={form.name}
    onChange={handleChange}
    required
  />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="email">Email *</label>
                <input
    id="email"
    name="email"
    type="email"
    placeholder="you@email.com"
    value={form.email}
    onChange={handleChange}
    required
  />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "0.75rem" }}>
              <label htmlFor="subject">Subject</label>
              <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
    id="message"
    name="message"
    rows={5}
    placeholder="Describe your issue or question in detail..."
    value={form.message}
    onChange={handleChange}
    required
    style={{ resize: "vertical" }}
  />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Sending\u2026" : "Send Message"}
            </button>
          </form>}
      </div>

      {
    /* Business hours */
  }
      <div className="card">
        <h3>Business Hours</h3>
        <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <p>📅 Monday – Saturday: 6:00 AM – 8:00 PM</p>
          <p>📅 Sunday: 7:00 AM – 12:00 PM</p>
          <p style={{ marginTop: "0.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            📍 Gir Somnath, Gujarat — 362135
          </p>
        </div>
      </div>
    </div>;
}
export {
  Contact
};
