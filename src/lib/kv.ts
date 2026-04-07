/**
 * Storage abstraction — auto-detecta:
 * - Vercel KV (produção)  → quando KV_REST_API_URL está setada
 * - Filesystem JSON (dev) → quando não está
 *
 * Cada chave (`leads`, `tickets`, `roadmap-progress`) é armazenada como um
 * único valor JSON. Esse modelo é simples e funciona pra dezenas/centenas
 * de leads. Quando virar produção real com volume alto, refator pra
 * chaves individuais (`lead:${id}`) ou direto pra Postgres/Supabase.
 */
import { promises as fs } from "fs";
import path from "path";

const USE_KV = !!process.env.KV_REST_API_URL;

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

function fileFor(key: string): string {
  return path.join(DATA_DIR, `${key}.json`);
}

/**
 * Lê o valor JSON associado à chave. Se não existir, retorna o fallback.
 */
export async function readJson<T>(key: string, fallback: T): Promise<T> {
  if (USE_KV) {
    // Import dinâmico pra evitar carregar @vercel/kv em build/dev quando não usa
    const { kv } = await import("@vercel/kv");
    const value = await kv.get<T>(key);
    return value ?? fallback;
  }

  await ensureDir();
  try {
    const raw = await fs.readFile(fileFor(key), "utf-8");
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Sobrescreve completamente o valor associado à chave.
 */
export async function writeJson<T>(key: string, value: T): Promise<void> {
  if (USE_KV) {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value);
    return;
  }

  await ensureDir();
  await fs.writeFile(fileFor(key), JSON.stringify(value, null, 2), "utf-8");
}

/**
 * True quando rodando contra Vercel KV (produção).
 * Usado pra logs informativos e telas de status.
 */
export function isUsingKv(): boolean {
  return USE_KV;
}
