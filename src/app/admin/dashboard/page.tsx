import { readLeads } from "@/lib/leads-store";
import { summarize, leadsPerDay, funnelData, sourceROI } from "@/lib/leads-stats";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const leads = await readLeads();
  const summary = summarize(leads);
  const daily = leadsPerDay(leads, 30);
  const funnel = funnelData(leads);
  const sources = sourceROI(leads);

  return (
    <DashboardClient
      summary={summary}
      daily={daily}
      funnel={funnel}
      sources={sources}
    />
  );
}
