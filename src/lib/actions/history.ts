"use server";

import { createClient } from "@/lib/supabase/server";

export interface LeadAnalysis {
  id: string;
  created_at: string;
  company_name: string;
  industry: string;
  company_size: string;
  budget: string;
  pain_points: string;
  timeline: string;
  current_solutions: string;
  decision_maker_info: string;
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  reasoning: string;
}

export async function getLeadHistory(): Promise<LeadAnalysis[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lead_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch lead history:", error);
    return [];
  }

  return data ?? [];
}
