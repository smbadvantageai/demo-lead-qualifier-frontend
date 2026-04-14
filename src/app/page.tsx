import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadHistory } from "@/lib/actions/history";
import { getSubscriptionStatus } from "@/lib/actions/subscription";
import LeadQualifierForm from "./LeadQualifierForm";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const [history, subscriptionStatus] = await Promise.all([
    getLeadHistory(),
    getSubscriptionStatus(),
  ]);

  return (
    <LeadQualifierForm
      history={history}
      userEmail={session.user.email!}
      subscriptionStatus={subscriptionStatus}
    />
  );
}
