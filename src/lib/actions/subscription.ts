"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubscriptionStatus {
  plan: "free" | "pro";
  status: string;
  isPro: boolean;
  todayCount: number;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { plan: "free", status: "inactive", isPro: false, todayCount: 0 };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", session.user.id)
    .maybeSingle();

  const isPro = sub?.plan === "pro" && sub?.status === "active";

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("lead_analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id)
    .gte("created_at", todayStart.toISOString());

  return {
    plan: (sub?.plan as "free" | "pro") ?? "free",
    status: sub?.status ?? "inactive",
    isPro,
    todayCount: count ?? 0,
  };
}
