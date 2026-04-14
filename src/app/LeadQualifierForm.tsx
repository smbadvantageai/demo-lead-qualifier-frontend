"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { LeadAnalysis } from "@/lib/actions/history";
import type { SubscriptionStatus } from "@/lib/actions/subscription";

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
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path
          d="M 10 75 A 60 60 0 0 1 130 75"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
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

// HistoryPanel — collapsible list of past analyses
function HistoryPanel({ history }: { history: LeadAnalysis[] }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "48px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 28px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "3px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Past Analyses
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "var(--amber)",
              background: "rgba(251,191,36,0.1)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {history.length}
          </span>
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* List */}
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            maxHeight: "480px",
            overflowY: "auto",
          }}
        >
          {history.map((item, i) => {
            const tc = TIER_CONFIG[item.tier];
            const isExpanded = expandedId === item.id;
            const date = new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={item.id}
                style={{
                  borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 28px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {/* Colored dot */}
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: tc.dot,
                      flexShrink: 0,
                    }}
                  />

                  {/* Tier + score */}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      letterSpacing: "1px",
                      color: tc.color,
                      textTransform: "uppercase",
                      flexShrink: 0,
                      minWidth: "80px",
                    }}
                  >
                    {item.tier} · {item.score}/10
                  </span>

                  {/* Company name */}
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text)",
                      fontWeight: 500,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.company_name}
                  </span>

                  {/* Date + chevron */}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {date}
                    <span style={{ fontSize: "10px" }}>{isExpanded ? "▲" : "▶"}</span>
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div
                    style={{
                      padding: "0 28px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {/* Reasoning */}
                    <div>
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "10px",
                          letterSpacing: "2px",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          marginBottom: "8px",
                        }}
                      >
                        AI Reasoning
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.7,
                          color: "var(--text)",
                          borderLeft: `2px solid ${tc.color}`,
                          paddingLeft: "14px",
                          margin: 0,
                        }}
                      >
                        {item.reasoning}
                      </p>
                    </div>

                    {/* Input fields summary */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      {[
                        ["Industry", item.industry],
                        ["Company Size", item.company_size],
                        ["Budget", item.budget],
                        ["Timeline", item.timeline],
                        ["Current Solutions", item.current_solutions],
                        ["Decision Maker", item.decision_maker_info],
                        ["Pain Points", item.pain_points],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            gridColumn: label === "Pain Points" || label === "Decision Maker" ? "1 / -1" : "auto",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "9px",
                              letterSpacing: "1.5px",
                              color: "var(--text-muted)",
                              textTransform: "uppercase",
                              marginBottom: "3px",
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "var(--text)",
                              lineHeight: 1.5,
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface Props {
  history: LeadAnalysis[];
  userEmail: string;
  subscriptionStatus: SubscriptionStatus;
}

export default function LeadQualifierForm({ history, userEmail, subscriptionStatus }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<LeadPayload>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LeadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  function handleChange(key: keyof LeadPayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
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

      if (res.status === 429) {
        const data = await res.json();
        if (data.upgradeRequired) {
          setShowUpgradeBanner(true);
          setLoading(false);
          return;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data: LeadResult = await res.json();
      setResult(data);
      router.refresh(); // Re-fetch history from the server
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
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
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

          {/* User info + sign out */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
              paddingTop: "4px",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.5px",
                }}
              >
                {userEmail}
              </span>
              {subscriptionStatus.isPro && (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    background: "rgba(251,191,36,0.1)",
                    border: "1px solid rgba(251,191,36,0.3)",
                    borderRadius: "4px",
                    padding: "2px 7px",
                  }}
                >
                  PRO
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {!subscriptionStatus.isPro && (
                <a
                  href="/upgrade"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "var(--amber)",
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.25)",
                    borderRadius: "4px",
                    padding: "4px 10px",
                    textDecoration: "none",
                  }}
                >
                  Upgrade
                </a>
              )}
            <button
              onClick={handleSignOut}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "4px 10px",
                cursor: "pointer",
                transition: "color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.color = "var(--text)";
                (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.color = "var(--text-muted)";
                (e.target as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              Sign Out
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage counter — free users only */}
      {!subscriptionStatus.isPro && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--surface)",
            border: `1px solid ${subscriptionStatus.todayCount >= 2 ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
            borderRadius: "8px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              color: subscriptionStatus.todayCount >= 2 ? "#ef4444" : "var(--text-muted)",
            }}
          >
            {subscriptionStatus.todayCount} of 2 free analyses used today
          </span>
          {subscriptionStatus.todayCount >= 1 && (
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
              Upgrade →
            </a>
          )}
        </div>
      )}

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
            disabled={loading || (!subscriptionStatus.isPro && subscriptionStatus.todayCount >= 2)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: loading ? "rgba(251,191,36,0.1)" : (!subscriptionStatus.isPro && subscriptionStatus.todayCount >= 2) ? "rgba(255,255,255,0.05)" : "var(--amber)",
              color: loading ? "var(--amber)" : (!subscriptionStatus.isPro && subscriptionStatus.todayCount >= 2) ? "var(--text-muted)" : "#08080f",
              border: (loading || (!subscriptionStatus.isPro && subscriptionStatus.todayCount >= 2)) ? "1px solid rgba(255,255,255,0.08)" : "none",
              borderRadius: "8px",
              padding: "14px 32px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "1px",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              cursor: (loading || (!subscriptionStatus.isPro && subscriptionStatus.todayCount >= 2)) ? "not-allowed" : "pointer",
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

      {/* Upgrade banner — shown when daily limit is hit */}
      {showUpgradeBanner && (
        <div
          style={{
            marginTop: "32px",
            padding: "20px 24px",
            background: "rgba(251,191,36,0.05)",
            border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--amber)",
                marginBottom: "4px",
              }}
            >
              Daily limit reached
            </div>
            <p style={{ fontSize: "14px", color: "var(--text)", margin: 0, lineHeight: 1.5 }}>
              You have used your 2 free analyses for today. Upgrade to Pro for unlimited qualifications.
            </p>
          </div>
          <a
            href="/upgrade"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#08080f",
              background: "var(--amber)",
              borderRadius: "6px",
              padding: "10px 20px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Upgrade to Pro →
          </a>
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

      {/* History */}
      <HistoryPanel history={history} />

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
