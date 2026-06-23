// Puxa as métricas UMA vez do Neon (read-only) e grava um snapshot JSON.
// NÃO escreve nada no banco.
import { readFileSync, writeFileSync } from "node:fs";

async function main() {
  const envTxt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of envTxt.split("\n")) {
    if (line.trim().startsWith("#")) continue;
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }

  const db = await import("../src/lib/vendas-db.ts");
  const ph = await import("../src/lib/posthog-db.ts");

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  const iso = (d: Date) => d.toISOString().split("T")[0];
  const filters = {
    start: iso(start), end: iso(end),
    source: null, landingVariant: null, pricingVariant: null,
  };

  const [receita, conversao, velocidade, leadsPorDia, filterOptions] = await Promise.all([
    db.getReceitaMetrics(filters),
    db.getConversaoMetrics(filters),
    db.getVelocidadeMetrics(filters),
    db.getLeadsPorDia(filters),
    db.getFilterOptions(),
  ]);
  const perda = await db.getPerdaMetrics(filters, conversao.leadsEntrados);
  const aquisicao = await ph.getAquisicaoMetrics(filters.start, filters.end)
    .catch((e) => { console.error("[posthog]", e.message); return ph.AQUISICAO_ZERO; });

  // Período anterior (mesma duração, imediatamente antes) — pra comparação.
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (days - 1));
  const prevFilters = { ...filters, start: iso(prevStart), end: iso(prevEnd) };

  const [pReceita, pConversao, pVelocidade] = await Promise.all([
    db.getReceitaMetrics(prevFilters),
    db.getConversaoMetrics(prevFilters),
    db.getVelocidadeMetrics(prevFilters),
  ]);
  const pPerda = await db.getPerdaMetrics(prevFilters, pConversao.leadsEntrados);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    filters, receita, conversao, velocidade, perda, leadsPorDia, filterOptions, aquisicao,
    prev: { receita: pReceita, conversao: pConversao, velocidade: pVelocidade, perda: pPerda },
  };

  writeFileSync(
    new URL("../src/lib/vendas-snapshot.json", import.meta.url),
    JSON.stringify(snapshot, null, 2),
  );

  console.log("RECEITA:",    JSON.stringify(receita));
  console.log("CONVERSAO:",  JSON.stringify(conversao));
  console.log("VELOCIDADE:", JSON.stringify({ ...velocidade, frtDist: velocidade.frtDist, secondDist: velocidade.secondDist, betweenDist: velocidade.betweenDist }));
  console.log("PERDA:",      JSON.stringify(perda));
  console.log("AQUISICAO:",  JSON.stringify({ pv: aquisicao.pageviews, vis: aquisicao.visitantes, leads: aquisicao.leadsCriados, pvToLead: aquisicao.pvToLead, canais: aquisicao.porCanal.length }));
  console.log("LEADS/DIA:",  leadsPorDia.length, "dias com dados");
  console.log("FILTROS:",    JSON.stringify(filterOptions));
  console.log("\nSnapshot salvo em src/lib/vendas-snapshot.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
