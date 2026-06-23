/**
 * Storage abstraction — auto-detecta o backend:
 * - Neon Postgres (produção) → quando DATABASE_URL está setada
 * - Filesystem JSON (dev local) → quando não está
 *
 * Em produção usa uma única tabela `kv_store(key, value, updated_at)`
 * onde cada chave (`leads`, `tickets`, `roadmap-progress`) guarda o JSON
 * completo. Modelo simples e suficiente pro estágio atual; quando virar
 * produção real com volume alto, refator pra schema próprio (task
 * `schema-leads` no /admin/roadmap).
 */
import { promises as fs } from "fs";
import path from "path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
const USE_NEON = !!DATABASE_URL;

// SQL client lazy — só criado se DATABASE_URL existir
let sqlClient: NeonQueryFunction<false, false> | null = null;
function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL não configurado");
    }
    sqlClient = neon(DATABASE_URL);
  }
  return sqlClient;
}

const DATA_DIR = path.join(process.cwd(), "data");

// A tabela kv_store não existe neste banco. Ao detectar isso uma vez, paramos de
// consultar o Neon (cada tentativa custa compute e falha igual) e servimos o
// fallback direto. Evita spam no overlay do Next e requisições inúteis.
let kvStoreMissing = false;
function isMissingTable(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  return e?.code === "42P01" || /relation .* does not exist/i.test(e?.message ?? "");
}

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
  if (USE_NEON) {
    if (kvStoreMissing) return fallback;
    try {
      const sql = getSql();
      const rows = (await sql`SELECT value FROM kv_store WHERE key = ${key}`) as Array<{
        value: T;
      }>;
      if (rows.length === 0) return fallback;
      return rows[0].value as T;
    } catch (err) {
      if (isMissingTable(err)) {
        if (!kvStoreMissing) console.warn("[kv] tabela kv_store não existe neste banco; usando fallback (storage kv desativado)");
        kvStoreMissing = true;
        return fallback;
      }
      console.error(`[kv] Erro lendo ${key}:`, err);
      return fallback;
    }
  }

  // Modo dev — file system
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
  if (USE_NEON) {
    if (kvStoreMissing) return; // tabela inexistente: não há onde gravar, evita erro e custo
    try {
      const sql = getSql();
      // UPSERT — INSERT ON CONFLICT, atualiza updated_at
      await sql`
        INSERT INTO kv_store (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
        ON CONFLICT (key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;
      return;
    } catch (err) {
      if (isMissingTable(err)) {
        if (!kvStoreMissing) console.warn("[kv] tabela kv_store não existe neste banco; gravação ignorada");
        kvStoreMissing = true;
        return;
      }
      console.error(`[kv] Erro gravando ${key}:`, err);
      throw err;
    }
  }

  // Modo dev — file system
  await ensureDir();
  await fs.writeFile(fileFor(key), JSON.stringify(value, null, 2), "utf-8");
}

/**
 * True quando rodando contra Neon (produção).
 */
export function isUsingNeon(): boolean {
  return USE_NEON;
}
