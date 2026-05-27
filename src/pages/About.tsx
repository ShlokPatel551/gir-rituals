export function About() {
  return (
    <div>
      <h1 className="page-title">About Us</h1>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Our Story</h3>
        <p style={{ marginTop: '0.5rem' }}>
          Gir Rituals is a premium dairy brand delivering pure Gir cow milk and traditional ghee directly to your doorstep.
          Rooted in the Gir region of Gujarat, we honour centuries of A2 dairy heritage with farm-fresh, preservative-free products.
        </p>
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Mission & Values</h3>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li>Purity — single-source Gir cow milk</li>
          <li>Transparency — clear billing and delivery tracking</li>
          <li>Sustainability — ethical farming practices</li>
        </ul>
      </div>
      <div className="card">
        <h3>Gir Cow Heritage</h3>
        <p style={{ marginTop: '0.5rem' }}>
          The Gir cow is one of India&apos;s oldest indigenous breeds, prized for rich A2 milk used in our bilona ghee.
        </p>
        <p style={{ marginTop: '1rem', fontSize: '2rem', textAlign: 'center' }}>🐄 🌿 🥛</p>
      </div>
    </div>
  );
}
