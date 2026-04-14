"use client";

import { useState } from "react";

interface LeadPayload {
  companyName: string;
  industry: string;
  companySize: string;
  budget: string;
  painPoints: string;
  timeline: string;
  currentSolutions: string;
  decisionMakerInfo: string;
}

interface LeadResult {
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  reasoning: string;
}

const TIER_CONFIG = {
  Hot: {
    color: "var(--hot)",
    bg: "var(--hot-dim)",
    label: "HOT LEAD",
    dot: "#ef4444",
  },
  Warm: {
    color: "var(--warm)",
    bg: "var(--warm-dim)",
    label: "WARM LEAD",
    dot: "#f59e0b",
  },
  Cold: {
    color: "var(--cold)",
    bg: "var(--cold-dim)",
    label: "COLD LEAD",
    dot: "#3b82f6",
  },
};

function ScoreArc({ score }: { score: number }) {
  const radius = 50;
  const circumference = Math.PI * radius; // half circle = πr
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Track */}
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke="var(--amber)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1) 0.3s",
          }}
        />
      </svg>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "56px",
          fontWeight: 700,
          color: "var(--amber)",
          lineHeight: 1,
          marginTop: "-48px",
          letterSpacing: "-2px",
        }}
      >
        {score}
        <span style={{ fontSize: "20px", color: "var(--text-muted)", fontWeight: 400 }}>
          /10
        </span>
      </div>
    </div>
  );
}

const FIELDS: {
  key: keyof LeadPayload;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  { key: "companyName", label: "Company Name", placeholder: "e.g. Acme Corp" },
  { key: "industry", label: "Industry / Vertical", placeholder: "e.g. SaaS, Healthcare, Manufacturing" },
  { key: "companySize", label: "Company Size", placeholder: "e.g. 200–500 employees" },
  { key: "budget", label: "Budget / Deal Size", placeholder: "e.g. $50,000/year" },
  { key: "painPoints", label: "Pain Points", placeholder: "What problems are they trying to solve?", multiline: true },
  { key: "timeline", label: "Purchase Timeline", placeholder: "e.g. Looking to decide within 3 months" },
  { key: "currentSolutions", label: "Current Solutions", placeholder: "e.g. Using Excel and HubSpot" },
  { key: "decisionMakerInfo", label: "Decision-Maker Info", placeholder: "e.g. VP of Sales is directly involved", multiline: true },
];

const EMPTY: LeadPayload = {
  companyName: "",
  industry: "",
  companySize: "",
  budget: "",
  painPoints: "",
  timeline: "",
  currentSolutions: "",
  decisionMakerInfo: "",
};

export default function Home() {
  const [form, setForm] = useState<LeadPayload>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: keyof LeadPayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data: LeadResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const tier = result ? TIER_CONFIG[result.tier] : null;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        padding: "48px 24px 80px",
        maxWidth: "780px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "3px",
            color: "var(--amber)",
            textTransform: "uppercase",
            marginBottom: "12px",
            opacity: 0.8,
          }}
        >
          SMB Advantage · AI Intelligence
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.05,
            color: "var(--text)",
            letterSpacing: "-1px",
          }}
        >
          Lead Qualifier
        </h1>
        <p
          style={{
            marginTop: "12px",
            fontSize: "15px",
            color: "var(--text-muted)",
            lineHeight: 1.6,
            maxWidth: "480px",
          }}
        >
          Enter company intelligence below. Our AI will score the lead and surface the reasoning behind the signal.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {FIELDS.map(({ key, label, placeholder, multiline }) => (
            <div
              key={key}
              style={{
                gridColumn: multiline ? "1 / -1" : "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {label}
              </label>
              {multiline ? (
                <textarea
                  className="field-input"
                  rows={3}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              ) : (
                <input
                  className="field-input"
                  type="text"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ marginTop: "32px" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: loading ? "rgba(251,191,36,0.1)" : "var(--amber)",
              color: loading ? "var(--amber)" : "#08080f",
              border: loading ? "1px solid rgba(251,191,36,0.3)" : "none",
              borderRadius: "8px",
              padding: "14px 32px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "1px",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              minWidth: "180px",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(251,191,36,0.3)",
                    borderTopColor: "var(--amber)",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Analyzing...
              </>
            ) : (
              "Analyze Lead →"
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "32px",
            padding: "16px 20px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {result && tier && (
        <div
          className="animate-fade-up"
          style={{
            marginTop: "48px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Result header bar */}
          <div
            style={{
              background: `linear-gradient(135deg, ${tier.bg}, transparent)`,
              borderBottom: "1px solid var(--border)",
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div className="animate-fade-up-1">
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "3px",
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                Qualification Result
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: tier.dot,
                    boxShadow: `0 0 8px ${tier.dot}`,
                    display: "inline-block",
                  }}
                  className="pulse-glow"
                />
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: tier.color,
                  }}
                >
                  {tier.label}
                </span>
              </div>
            </div>

            <div className="animate-fade-up-2">
              <ScoreArc score={result.score} />
            </div>
          </div>

          {/* Reasoning */}
          <div
            className="animate-fade-up-3"
            style={{ padding: "28px 32px" }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "3px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              AI Reasoning
            </div>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.75,
                color: "var(--text)",
                borderLeft: `3px solid ${tier.color}`,
                paddingLeft: "20px",
              }}
            >
              {result.reasoning}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 560px) {
          form > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
