function Flow() {
  return <div>
      <h1 className="page-title">App Flow</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
        Complete navigation map from the Gir Rituals product specification.
      </p>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <img src="/flow-chart.png" alt="GIR RITUALS App Flow Diagram" style={{ width: "100%", display: "block" }} />
      </div>
      <div className="card" style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
        <p><strong>Flow:</strong> Splash → Login/Register → OTP → Home → (Sidebar & Bottom Nav) → Schedule · Bills · Cart · Profile → Checkout → Payment → Success / Failure.</p>
      </div>
    </div>;
}
export {
  Flow
};
