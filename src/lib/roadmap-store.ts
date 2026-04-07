import type { Status } from "./roadmap";
import { readJson, writeJson } from "./kv";

/**
 * Overlay de progresso das tasks do roadmap.
 * O ROADMAP em src/lib/roadmap.ts tem o status DEFAULT — esse store guarda
 * o que o Gabriel marcou como "em andamento" / "concluída". O merge é feito
 * em getMergedRoadmap().
 */

const KEY = "roadmap-progress";

export type ProgressMap = Record<string, Status>;

export async function readProgress(): Promise<ProgressMap> {
  const raw = await readJson<ProgressMap>(KEY, {});
  return raw && typeof raw === "object" ? raw : {};
}

async function writeProgress(map: ProgressMap): Promise<void> {
  await writeJson(KEY, map);
}

export async function setTaskStatus(id: string, status: Status): Promise<ProgressMap> {
  const map = await readProgress();
  map[id] = status;
  await writeProgress(map);
  return map;
}
