import { tasks, runs } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 120;

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

export async function POST(req: NextRequest) {
  try {
    const payload: LeadPayload = await req.json();

    // Trigger the task
    const handle = await tasks.trigger("lead-qualifier", payload);

    // Poll until complete (max ~90s)
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      const run = await runs.retrieve(handle.id);

      if (run.status === "COMPLETED") {
        const output = run.output as { score: number; tier: string; reasoning: string };

        // Save result to Supabase for the authenticated user
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error: dbError } = await supabase.from("lead_analyses").insert({
            user_id: session.user.id,
            company_name: payload.companyName,
            industry: payload.industry,
            company_size: payload.companySize,
            budget: payload.budget,
            pain_points: payload.painPoints,
            timeline: payload.timeline,
            current_solutions: payload.currentSolutions,
            decision_maker_info: payload.decisionMakerInfo,
            score: output.score,
            tier: output.tier,
            reasoning: output.reasoning,
          });
          if (dbError) {
            console.error("Failed to save lead analysis:", dbError);
          }
        }

        return NextResponse.json(output);
      }

      if (
        run.status === "FAILED" ||
        run.status === "CANCELED" ||
        run.status === "TIMED_OUT" ||
        run.status === "CRASHED" ||
        run.status === "SYSTEM_FAILURE"
      ) {
        return NextResponse.json(
          { error: `Task ended with status: ${run.status}` },
          { status: 500 }
        );
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    return NextResponse.json({ error: "Analysis timed out" }, { status: 504 });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Failed to analyze lead" },
      { status: 500 }
    );
  }
}
