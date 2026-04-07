import { readLeads } from "@/lib/leads-store";
import LeadsKanban from "./LeadsKanban";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await readLeads();
  return <LeadsKanban initialLeads={leads} />;
}
