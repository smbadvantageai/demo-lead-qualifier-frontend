export default function CancelPage() {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "11px",
          letterSpacing: "3px",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          marginBottom: "24px",
        }}
      >
        Checkout Cancelled
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: "16px",
          lineHeight: 1.1,
        }}
      >
        No changes made
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: "var(--text-muted)",
          marginBottom: "40px",
          lineHeight: 1.6,
        }}
      >
        Your free plan is still active.
      </p>
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <a
          href="/"
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          ← Back to app
        </a>
        <a
          href="/upgrade"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--amber)",
            textDecoration: "none",
          }}
        >
          View pricing
        </a>
      </div>
    </div>
  );
}
