import { promises as fs } from "fs";
import path from "path";
import type { Status } from "./roadmap";

/**
 * Overlay de progresso das tasks do roadmap.
 * O ROADMAP em src/lib/roadmap.ts tem o status DEFAULT — esse store guarda
 * o que o Gabriel marcou como "em andamento" / "concluída". O merge é feito
 * em getMergedRoadmap().
 */

const DATA_DIR = path.join(process.cwd(), "data");
const PROGRESS_FILE = path.join(DATA_DIR, "roadmap-progress.json");

export type ProgressMap = Record<string, Status>;

async function ensureFile(): Promise<void> {
  try {
    await fs.access(PROGRESS_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PROGRESS_FILE, "{}", "utf-8");
  }
}

export async function readProgress(): Promise<ProgressMap> {
  await ensureFile();
  const raw = await fs.readFile(PROGRESS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as ProgressMap) : {};
  } catch {
    return {};
  }
}

async function writeProgress(map: ProgressMap): Promise<void> {
  await ensureFile();
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(map, null, 2), "utf-8");
}

export async function setTaskStatus(id: string, status: Status): Promise<ProgressMap> {
  const map = await readProgress();
  map[id] = status;
  await writeProgress(map);
  return map;
}
