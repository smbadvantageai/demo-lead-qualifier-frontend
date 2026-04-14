import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscriptionStatus } from "@/lib/actions/subscription";
import UpgradeButton from "./UpgradeButton";

export default async function UpgradePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const status = await getSubscriptionStatus();

  const freeFeatures = ["2 lead qualifications / day", "Full AI reasoning", "Analysis history"];
  const proFeatures = ["Unlimited qualifications", "Full AI reasoning", "Analysis history", "Priority support"];

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        padding: "80px 24px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "64px" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "3px",
            color: "var(--amber)",
            textTransform: "uppercase",
            marginBottom: "16px",
            opacity: 0.8,
          }}
        >
          SMB Advantage · Upgrade
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(36px, 6vw, 52px)",
            fontWeight: 900,
            color: "var(--text)",
            letterSpacing: "-1px",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Choose Your Plan
        </h1>
        <p
          style={{
            marginTop: "16px",
            fontSize: "16px",
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}
        >
          Qualify more leads. Close more deals.
        </p>
      </div>

      {/* Pricing grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          maxWidth: "680px",
          margin: "0 auto",
        }}
      >
        {/* Free tier */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "16px",
            }}
          >
            Free
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "40px",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1,
              marginBottom: "6px",
            }}
          >
            $0
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "28px",
            }}
          >
            per month
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "32px",
            }}
          >
            {freeFeatures.map((f) => (
              <li
                key={f}
                style={{
                  fontSize: "14px",
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>·</span>
                {f}
              </li>
            ))}
          </ul>
          {!status.isPro && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "1px",
                color: "var(--text-muted)",
                textAlign: "center",
              }}
            >
              Current plan
            </div>
          )}
        </div>

        {/* Pro tier */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(251,191,36,0.35)",
            borderRadius: "16px",
            padding: "32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top amber accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "var(--amber)",
            }}
          />
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--amber)",
              marginBottom: "16px",
            }}
          >
            Pro
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "40px",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1,
              marginBottom: "6px",
            }}
          >
            $29
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "28px",
            }}
          >
            per month
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "32px",
            }}
          >
            {proFeatures.map((f) => (
              <li
                key={f}
                style={{
                  fontSize: "14px",
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "var(--amber)" }}>·</span>
                {f}
              </li>
            ))}
          </ul>
          {status.isPro ? (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "1px",
                color: "var(--amber)",
                textAlign: "center",
              }}
            >
              Current plan ✓
            </div>
          ) : (
            <UpgradeButton />
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "48px" }}>
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
      </div>

      <style>{`
        @media (max-width: 560px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
