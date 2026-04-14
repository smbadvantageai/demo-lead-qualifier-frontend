import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SuccessPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

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
          color: "var(--amber)",
          textTransform: "uppercase",
          marginBottom: "24px",
          opacity: 0.8,
        }}
      >
        SMB Advantage · Pro
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 900,
          color: "var(--text)",
          letterSpacing: "-1px",
          marginBottom: "16px",
          lineHeight: 1.1,
        }}
      >
        Welcome to Pro
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: "var(--text-muted)",
          maxWidth: "440px",
          lineHeight: 1.7,
          marginBottom: "40px",
        }}
      >
        Your subscription is active. You now have unlimited lead qualifications.
        It may take a few seconds for your plan to reflect in the app.
      </p>
      <a
        href="/"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#08080f",
          background: "var(--amber)",
          borderRadius: "8px",
          padding: "14px 32px",
          textDecoration: "none",
        }}
      >
        Start Qualifying →
      </a>
    </div>
  );
}
