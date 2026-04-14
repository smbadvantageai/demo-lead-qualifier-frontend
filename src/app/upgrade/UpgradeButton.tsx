"use client";

import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      style={{
        width: "100%",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "12px",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        color: loading ? "var(--amber)" : "#08080f",
        background: loading ? "rgba(251,191,36,0.1)" : "var(--amber)",
        border: loading ? "1px solid rgba(251,191,36,0.3)" : "none",
        borderRadius: "8px",
        padding: "14px 24px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {loading ? "Redirecting..." : "Upgrade to Pro →"}
    </button>
  );
}
