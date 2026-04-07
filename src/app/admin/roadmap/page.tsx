import { ROADMAP, applyProgress } from "@/lib/roadmap";
import { readProgress } from "@/lib/roadmap-store";
import RoadmapClient from "./RoadmapClient";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const progress = await readProgress();
  const tasks = applyProgress(progress);
  return <RoadmapClient initialTasks={tasks} totalCount={ROADMAP.length} />;
}
