// Read-only schema introspection do Neon. NÃO escreve nada no banco.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const m = env.match(/DATABASE_URL\s*=\s*(.+)/);
if (!m) { console.error("DATABASE_URL não encontrada em .env.local"); process.exit(1); }
const url = m[1].trim().replace(/^["']|["']$/g, "");
const sql = neon(url);

const cols = await sql`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position
`;

const byTable = {};
for (const r of cols) (byTable[r.table_name] ??= []).push(`${r.column_name} (${r.data_type})`);

const tables = Object.keys(byTable).sort();
console.log("=== TABELAS NO BANCO (public) ===");
console.log(tables.join(", ") || "(nenhuma)");

const EXPECTED = ["leads", "lead_subscriptions", "chatwoot_messages", "lead_form_submit", "lead_losses", "subscription_payments"];
console.log("\n=== CHECK das tabelas que o código espera ===");
for (const t of EXPECTED) console.log(`${tables.includes(t) ? "OK  " : "FALTA"}  ${t}`);

console.log("\n=== COLUNAS de cada tabela esperada ===");
for (const t of EXPECTED) {
  console.log(`\n## ${t}`);
  console.log(byTable[t] ? "  " + byTable[t].join(", ") : "  (tabela não existe)");
}
