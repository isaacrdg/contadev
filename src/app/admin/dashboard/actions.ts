"use server";

import { neon } from "@neondatabase/serverless";

const FORBIDDEN = /\b(insert|update|delete|drop|create|alter|truncate|grant|revoke|execute|exec|call|copy|vacuum|analyze|cluster|reindex|reset|set|lock|notify|listen)\b/i;

function isSelectOnly(raw: string): boolean {
  const clean = raw
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();
  if (!clean) return false;
  if (FORBIDDEN.test(clean)) return false;
  const first = clean.split(/\s+/)[0].toLowerCase();
  return first === "select" || first === "with";
}

export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  error?: string;
  rowCount?: number;
}

export async function runSelectQuery(sql: string): Promise<QueryResult> {
  if (!isSelectOnly(sql)) {
    return {
      columns: [],
      rows: [],
      error: "Apenas queries SELECT ou WITH ... SELECT são permitidas. Nenhuma operação de escrita.",
    };
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return { columns: [], rows: [], error: "DATABASE_URL não configurado" };
  }

  try {
    const db = neon(url);
    const rawResult = await db`${db.unsafe(sql)}`;
    const result = rawResult as unknown as Record<string, unknown>[];

    if (!result.length) {
      return { columns: [], rows: [], rowCount: 0 };
    }

    const columns = Object.keys(result[0]);
    const rows = result.map((r) => columns.map((c) => r[c]));

    return { columns, rows, rowCount: rows.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return { columns: [], rows: [], error: msg };
  }
}
