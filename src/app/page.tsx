import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeadHistory } from "@/lib/actions/history";
import LeadQualifierForm from "./LeadQualifierForm";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const history = await getLeadHistory();

  return (
    <LeadQualifierForm
      history={history}
      userEmail={session.user.email!}
    />
  );
}
