import { tasks, runs } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";

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
        return NextResponse.json(run.output);
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
