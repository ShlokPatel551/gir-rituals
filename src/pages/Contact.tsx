const CONTACTS = [
  { label: 'WhatsApp', icon: '💬', href: 'https://wa.me/919876543210?text=Hello%20Gir%20Rituals' },
  { label: 'Instagram', icon: '📷', href: 'https://instagram.com' },
  { label: 'Email', icon: '✉️', href: 'mailto:hello@girrituals.com' },
  { label: 'Phone', icon: '📞', href: 'tel:+919876543210' },
];

export function Contact() {
  return (
    <div>
      <h1 className="page-title">Contact Us</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>We&apos;re here for orders, delivery, and refunds.</p>
      {CONTACTS.map((c) => (
        <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
          <strong>{c.label}</strong>
        </a>
      ))}
      <div className="card">
        <h3>Business Hours</h3>
        <p style={{ marginTop: '0.5rem' }}>Mon – Sat: 6:00 AM – 8:00 PM</p>
        <p>Sunday: 7:00 AM – 12:00 PM</p>
      </div>
    </div>
  );
}
