"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ResponsiveGridLayout } from "react-grid-layout";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { refreshVendas, runSelectQuery, drillLeads } from "./actions";
import { FATURAS_ATRASO_FAIXAS } from "@/lib/vendas-db";
import type { VendasFilters, ReceitaData, ConversaoData, VelocidadeData, PerdaData, LeadDia, ReceitaDia, FilterOptions, ComplementarData } from "@/lib/vendas-db";
import type { AquisicaoData } from "@/lib/posthog-db";

interface Data {
  receita: ReceitaData; conversao: ConversaoData; velocidade: VelocidadeData; perda: PerdaData;
  leadsPorDia: LeadDia[]; receitaPorDia: ReceitaDia[]; aquisicao: AquisicaoData; complementar: ComplementarData;
  prev?: { receita: ReceitaData; conversao: ConversaoData; velocidade: VelocidadeData; perda: PerdaData };
}
interface Props extends Data { filters: VendasFilters; dataStamp: string; filterOptions: FilterOptions; }

const C = {
  page: "#ffffff", card: "#ffffff", border: "#e7e9ec", title: "#374151", big: "#111827",
  answer: "#6b7280", muted: "#9aa1ab", accent: "#475569", accentSoft: "#cbd2db", up: "#15803d", down: "#b91c1c",
  grid: "#eef0f3", axis: "#9aa1ab", track: "#eef0f3",
  // Sombra suave para destacar a faixa de estado atual (sem bordas coloridas)
  shadow: "0 1px 2px rgba(16,24,40,0.05), 0 6px 16px rgba(16,24,40,0.06)",
};

// Métricas de estado atual (não dependem do período) — vivem numa faixa fixa no topo
const STATE_IDS = ["mrr", "clientes_ativos", "faturas_atraso"];
const STATE_TITLES: Record<string, string> = { mrr: "Receita recorrente", clientes_ativos: "Clientes ativos", faturas_atraso: "Clientes com faturas em atraso" };
// Formatadores à prova de undefined/null (dado parcial ou cache antigo não quebra a tela)
const brl = (v: number | null | undefined) => { const n = Number(v ?? 0); return n >= 1_000_000 ? `R$ ${(n / 1_000_000).toFixed(1).replace(".", ",")}M` : n >= 1_000 ? `R$ ${Math.round(n / 1_000)}k` : `R$ ${Math.round(n)}`; };
const brlFull = (v: number | null | undefined) => Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const num = (v: number | null | undefined) => Number(v ?? 0).toLocaleString("pt-BR");
const pct = (r: number | null | undefined) => `${Math.round(Number(r ?? 0) * 100)}%`;
const fmtMin = (m: number | null) => m == null ? "sem dados" : m < 60 ? `${Math.round(m)} min` : m < 1440 ? `${(m / 60).toFixed(1).replace(".", ",")} h` : `${(m / 1440).toFixed(1).replace(".", ",")} dias`;
const fmtDia = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

// id de instância → id base do catálogo (suporta cards duplicados: "mrr#2" → "mrr")
const baseId = (i: string) => { const h = i.indexOf("#"); return h === -1 ? i : i.slice(0, h); };

// Agrega uma série diária por dia, semana ou mês
function aggregar(raw: { date: string; v: number }[], gran: string): { label: string; v: number }[] {
  if (gran !== "semana" && gran !== "mes") return raw.map((d) => ({ label: fmtDia(d.date), v: d.v }));
  const map = new Map<string, number>();
  for (const d of raw) {
    const dt = new Date(d.date + "T12:00:00");
    let key: string;
    if (gran === "semana") { const wd = (dt.getDay() + 6) % 7; const ws = new Date(dt); ws.setDate(dt.getDate() - wd); key = ws.toISOString().slice(0, 10); }
    else key = d.date.slice(0, 7) + "-01";
    map.set(key, (map.get(key) ?? 0) + d.v);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({
    label: gran === "mes" ? new Date(k + "T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }) : fmtDia(k),
    v,
  }));
}

type Delta = { dir: "up" | "down"; txt: string };
function compara(cur: number, prev: number | undefined): Delta | null {
  if (prev == null || prev <= 0) return null;
  const r = cur / prev;
  if (r >= 1.05) return r >= 1.8 ? { dir: "up", txt: `${r.toFixed(1).replace(".", ",")}x o período anterior` } : { dir: "up", txt: `${Math.round((r - 1) * 100)}% acima do período anterior` };
  if (r <= 0.95) return { dir: "down", txt: `${Math.round((1 - r) * 100)}% abaixo do período anterior` };
  return null;
}

// ── Catálogo de widgets ─────────────────────────────────────────────────────────
type Kind = "kpi" | "chart";
interface WDef { id: string; titulo: string; kind: Kind; w: number; h: number; minW: number; minH: number; maxW: number; maxH: number; viz?: string[]; grupo?: "principal" | "complementar"; }
const KPI_BOX = { kind: "kpi" as const, w: 3, h: 2, minW: 2, minH: 2, maxW: 6, maxH: 3 };
const CHART_BOX = { kind: "chart" as const, w: 6, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 8 };

const CATALOG: WDef[] = [
  // Movimentação no período (estado atual fica na faixa fixa do topo)
  { id: "receita_nova", titulo: "Receita nova no período", ...KPI_BOX },
  { id: "ticket", titulo: "Ticket médio", ...KPI_BOX },
  { id: "total_cobrado", titulo: "Total cobrado", ...KPI_BOX },
  { id: "novos_anuais", titulo: "Novos anuais", ...KPI_BOX },
  { id: "novos_mensais", titulo: "Novos mensais", ...KPI_BOX },
  { id: "leads", titulo: "Leads no período", ...KPI_BOX },
  { id: "pagaram", titulo: "Clientes que pagaram", ...KPI_BOX },
  { id: "close_rate", titulo: "Taxa de fechamento", ...KPI_BOX },
  { id: "acessos", titulo: "Acessos à plataforma", ...KPI_BOX },
  { id: "taxa_pagamento", titulo: "Acesso para pagamento", ...KPI_BOX },
  { id: "inad_primeiro", titulo: "Calote de primeiro pagamento", ...KPI_BOX },
  { id: "frt", titulo: "1ª resposta do vendedor", ...KPI_BOX },
  { id: "segunda", titulo: "2ª resposta", ...KPI_BOX },
  { id: "entre", titulo: "Entre respostas", ...KPI_BOX },
  { id: "msgs_fechar", titulo: "Mensagens até fechar", ...KPI_BOX },
  { id: "cancelamentos", titulo: "Cancelamentos no período", ...KPI_BOX },
  { id: "quicam", titulo: "Clientes que quicaram", ...KPI_BOX },
  { id: "perda_silenciosa", titulo: "Perda silenciosa", ...KPI_BOX },
  { id: "visitantes", titulo: "Visitantes do site", ...KPI_BOX },
  { id: "visita_lead", titulo: "Visitante vira lead", ...KPI_BOX },
  // Complementares (não entram na visão principal, ficam disponíveis para adicionar)
  { id: "sla_1h", titulo: "SLA: respondidos em 1h", ...KPI_BOX, grupo: "complementar" },
  { id: "sla_24h", titulo: "SLA: respondidos em 24h", ...KPI_BOX, grupo: "complementar" },
  { id: "velocidade_fechamento", titulo: "Velocidade de fechamento", ...KPI_BOX, grupo: "complementar" },
  { id: "faturas_atraso_dist", titulo: "Faturas em atraso por idade", ...CHART_BOX, w: 5, h: 4, grupo: "complementar" },
  { id: "funil_estagio", titulo: "Funil por estágio (CRM) + tempo parado", ...CHART_BOX, w: 5, h: 5, grupo: "complementar" },
  { id: "produtividade", titulo: "Produtividade por vendedor", ...CHART_BOX, w: 5, h: 5, grupo: "complementar" },
  { id: "motivos_perda", titulo: "Motivos de perda", ...CHART_BOX, w: 4, h: 4, grupo: "complementar" },
  { id: "conversao_canal_real", titulo: "Conversão por canal (canal × pagamento)", ...CHART_BOX, w: 5, h: 5, grupo: "complementar" },
  { id: "coorte", titulo: "Coorte: pagamento por semana de entrada", ...CHART_BOX, w: 6, h: 5, grupo: "complementar" },
  { id: "frt_conversao", titulo: "Velocidade × conversão (tese)", ...CHART_BOX, w: 5, h: 4, grupo: "complementar" },
  { id: "leads_dia", titulo: "Leads por dia", ...CHART_BOX, viz: ["area", "bar", "line", "table"] },
  { id: "receita_dia", titulo: "Receita nova por dia", ...CHART_BOX, viz: ["area", "bar", "line", "table"] },
  { id: "pv_leads", titulo: "Page views e leads por dia", ...CHART_BOX, viz: ["line", "table"] },
  { id: "funil", titulo: "Funil de conversão", ...CHART_BOX, w: 4, h: 4 },
  { id: "canais", titulo: "De onde vêm os visitantes", ...CHART_BOX, w: 4, h: 4 },
];

const DEFAULT_LAYOUT: LayoutItem[] = ([
  ["receita_nova", 0, 0, 3, 2], ["total_cobrado", 3, 0, 3, 2], ["leads", 6, 0, 3, 2], ["pagaram", 9, 0, 3, 2],
  ["close_rate", 0, 2, 3, 2], ["taxa_pagamento", 3, 2, 3, 2], ["frt", 6, 2, 3, 2], ["quicam", 9, 2, 3, 2],
  ["leads_dia", 0, 4, 6, 4], ["receita_dia", 6, 4, 6, 4],
  ["pv_leads", 0, 8, 8, 4], ["funil", 8, 8, 4, 4],
  ["cancelamentos", 0, 12, 3, 2], ["perda_silenciosa", 3, 12, 3, 2], ["inad_primeiro", 6, 12, 3, 2], ["novos_anuais", 9, 12, 3, 2],
] as const).map(([i, x, y, w, h]) => {
  const def = CATALOG.find((d) => d.id === i)!;
  return { i, x, y, w, h, minW: def.minW, minH: def.minH, maxW: def.maxW, maxH: def.maxH } as LayoutItem;
});

// ── KPI ──────────────────────────────────────────────────────────────────────
function resolveKpi(id: string, d: Data): { valor: string; resposta: string; comp?: Delta | null; pendente?: string } | null {
  const r = d.receita, c = d.conversao, v = d.velocidade, p = d.perda, a = d.aquisicao;
  const novosTotal = r.qtdNovosAnuais + r.qtdNovosMensais;
  const map: Record<string, () => { valor: string; resposta: string; comp?: Delta | null; pendente?: string }> = {
    mrr: () => ({ valor: brl(r.mrr), resposta: `o que entra todo mês, dos ${num(r.clientesAtivos)} clientes ativos` }),
    clientes_ativos: () => ({ valor: num(r.clientesAtivos), resposta: "assinaturas pagando agora" }),
    faturas_atraso: () => ({ valor: num(r.faturasAtrasoClientes), resposta: `clientes que já pagaram e estão com fatura vencida agora · ${brlFull(r.faturasAtrasoValor)} em ${num(r.faturasAtrasoFaturas)} faturas` }),
    receita_nova: () => ({ valor: brl(r.valorNovosContratos), resposta: "valor dos contratos novos no período", comp: compara(r.valorNovosContratos, d.prev?.receita.valorNovosContratos) }),
    ticket: () => ({ valor: novosTotal > 0 ? brl(r.valorNovosContratos / novosTotal) : "sem dados", resposta: `valor médio por contrato novo (${num(novosTotal)})` }),
    total_cobrado: () => ({ valor: brl(r.totalCobrado), resposta: "pagamentos confirmados no período" }),
    novos_anuais: () => ({ valor: num(r.qtdNovosAnuais), resposta: `${brl(r.valorNovosAnuais)} em contratos anuais`, comp: compara(r.qtdNovosAnuais, d.prev?.receita.qtdNovosAnuais) }),
    novos_mensais: () => ({ valor: num(r.qtdNovosMensais), resposta: `${brl(r.valorNovosMensais)} em contratos mensais`, comp: compara(r.qtdNovosMensais, d.prev?.receita.qtdNovosMensais) }),
    leads: () => ({ valor: num(c.leadsEntrados), resposta: "pessoas que entraram no funil", comp: compara(c.leadsEntrados, d.prev?.conversao.leadsEntrados) }),
    pagaram: () => ({ valor: num(c.fechamentos), resposta: `de ${num(c.leadsEntrados)} leads (por coorte)`, comp: compara(c.fechamentos, d.prev?.conversao.fechamentos) }),
    close_rate: () => ({ valor: pct(c.closeRate), resposta: "leads do período que viraram pagantes", comp: compara(c.closeRate, d.prev?.conversao.closeRate) }),
    acessos: () => ({ valor: num(c.acessos), resposta: "receberam acesso e entraram no fluxo de pagamento" }),
    taxa_pagamento: () => ({ valor: c.acessos > 0 ? pct(c.taxaPagamento) : "sem dados", resposta: `de cada 10 com acesso, ${Math.round(c.taxaPagamento * 10)} pagam`, comp: compara(c.taxaPagamento, d.prev?.conversao.taxaPagamento) }),
    inad_primeiro: () => ({ valor: num(c.perdaPagamento), resposta: "receberam acesso e nunca pagaram", pendente: "Definição pendente: depois de quantos dias sem o primeiro pagamento a pessoa vira calote? A validar com o Gabriel." }),
    frt: () => ({ valor: fmtMin(v.frtP50), resposta: `metade responde até aqui; 90% até ${fmtMin(v.frtP90)}` }),
    segunda: () => ({ valor: fmtMin(v.secondRespP50), resposta: "tempo típico até a 2ª resposta humana" }),
    entre: () => ({ valor: fmtMin(v.timeBetweenP50), resposta: "intervalo típico entre respostas do vendedor" }),
    msgs_fechar: () => ({ valor: v.msgsAteFecharP50 == null ? "sem dados" : `${Math.round(v.msgsAteFecharP50)}`, resposta: "mensagens trocadas, típico, até o lead pagar" }),
    cancelamentos: () => ({ valor: num(p.cancelamentos), resposta: "clientes que cancelaram a assinatura" }),
    quicam: () => ({ valor: num(c.quicam), resposta: "assinaram e cancelaram em menos de 15 dias" }),
    perda_silenciosa: () => ({ valor: num(p.perdidosGhosting), resposta: "tinham conversa e sumiram há 7 dias ou mais" }),
    visitantes: () => ({ valor: num(a.visitantes), resposta: `${num(a.pageviews)} visualizações de página no total` }),
    visita_lead: () => ({ valor: pct(a.pvToLead), resposta: `${num(a.leadsCriados)} viraram lead dos ${num(a.visitantes)} visitantes` }),
    sla_1h: () => { const t = v.frtDist.reduce((s, x) => s + x, 0); const ok = (v.frtDist[0] ?? 0) + (v.frtDist[1] ?? 0) + (v.frtDist[2] ?? 0) + (v.frtDist[3] ?? 0); return { valor: t > 0 ? pct(ok / t) : "sem dados", resposta: "leads cuja 1ª resposta humana veio em até 1 hora" }; },
    sla_24h: () => { const t = v.frtDist.reduce((s, x) => s + x, 0); const ok = t - (v.frtDist[6] ?? 0); return { valor: t > 0 ? pct(ok / t) : "sem dados", resposta: "leads cuja 1ª resposta humana veio em até 24 horas" }; },
    velocidade_fechamento: () => ({ valor: fmtMin(d.complementar.velocidadeFechamentoHoras == null ? null : d.complementar.velocidadeFechamentoHoras * 60), resposta: "tempo típico entre o lead entrar e o primeiro pagamento" }),
  };
  return map[id]?.() ?? null;
}

function KpiView({ k, onDrill }: { k: { valor: string; resposta: string; comp?: Delta | null; pendente?: string }; onDrill?: () => void }) {
  const [open, setOpen] = useState(false);
  const click = k.pendente ? (e: React.MouseEvent) => { e.stopPropagation(); setOpen((o) => !o); } : onDrill ? (e: React.MouseEvent) => { e.stopPropagation(); onDrill(); } : undefined;
  return (
    <div onClick={click} style={{ height: "100%", display: "flex", flexDirection: "column", padding: "6cqh 7cqw", cursor: click ? "pointer" : "default" }}>
      {k.pendente && <span style={{ position: "absolute", top: 12, right: 14, fontSize: 9.5, fontWeight: 600, color: "#b45309", background: "#fef3c7", borderRadius: 5, padding: "2px 6px" }}>pendente</span>}
      {onDrill && !k.pendente && <span style={{ position: "absolute", top: 13, right: 14, fontSize: 10, color: C.muted }}>ver clientes ↗</span>}
      {/* valor acompanha o tamanho do card (container queries) */}
      <div style={{ fontSize: "clamp(20px, min(11cqw, 30cqh), 40px)", fontWeight: 700, color: C.big, fontVariantNumeric: "tabular-nums", lineHeight: 1, marginTop: 4 }}>{k.valor}</div>
      {open && k.pendente
        ? <div style={{ fontSize: 11, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "7px 9px", marginTop: 8, lineHeight: 1.35 }}>{k.pendente}</div>
        : <>
            <div style={{ fontSize: "clamp(10px, 3.4cqw, 12px)", color: C.answer, marginTop: "auto", paddingTop: 8, lineHeight: 1.3 }}>{k.resposta}</div>
            {k.comp && <div style={{ fontSize: 11, marginTop: 4, color: k.comp.dir === "up" ? C.up : C.down, fontWeight: 600 }}>{k.comp.dir === "up" ? "▲ " : "▼ "}{k.comp.txt}</div>}
          </>}
    </div>
  );
}

// ── Charts (preenchem o container, respondem ao tamanho) ───────────────────────
function MiniTable({ data, name, fmt }: { data: { label: string; v: number }[]; name: string; fmt?: (x: number) => string }) {
  const cell: React.CSSProperties = { padding: "4px 10px", fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead><tr style={{ color: C.muted }}><th style={{ ...cell, textAlign: "left", position: "sticky", top: 0, background: "#fff" }}>Período</th><th style={{ ...cell, textAlign: "right", position: "sticky", top: 0, background: "#fff" }}>{name}</th></tr></thead>
        <tbody>{[...data].reverse().map((r, i) => (
          <tr key={i} style={{ borderTop: `1px solid ${C.track}` }}>
            <td style={{ ...cell, textAlign: "left", color: "#475569" }}>{r.label}</td>
            <td style={{ ...cell, textAlign: "right", color: C.big, fontWeight: 600 }}>{fmt ? fmt(r.v) : num(r.v)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function SerieChart({ data, dataKey, name, viz, fmt }: { data: { label: string; v: number }[]; dataKey: string; name: string; viz: string; fmt?: (x: number) => string }) {
  const tick = { fill: C.axis, fontSize: 10 };
  const tip = { contentStyle: { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }, labelStyle: { color: C.answer } };
  if (viz === "table") return <MiniTable data={data} name={name} fmt={fmt} />;
  if (viz === "bar") return (
    <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 4, right: 6, left: -10, bottom: 0 }}>
      <CartesianGrid stroke={C.grid} vertical={false} /><XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} /><YAxis tick={tick} axisLine={false} tickLine={false} />
      <Tooltip {...tip} formatter={(x) => [fmt ? fmt(Number(x)) : num(Number(x)), name]} /><Bar dataKey="v" name={name} fill={C.accent} radius={[2, 2, 0, 0]} />
    </BarChart></ResponsiveContainer>);
  if (viz === "line") return (
    <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 4, right: 6, left: -10, bottom: 0 }}>
      <CartesianGrid stroke={C.grid} vertical={false} /><XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} /><YAxis tick={tick} axisLine={false} tickLine={false} />
      <Tooltip {...tip} formatter={(x) => [fmt ? fmt(Number(x)) : num(Number(x)), name]} /><Line type="monotone" dataKey="v" name={name} stroke={C.accent} strokeWidth={2} dot={false} />
    </LineChart></ResponsiveContainer>);
  return (
    <ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 4, right: 6, left: -10, bottom: 0 }}>
      <defs><linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.22} /><stop offset="100%" stopColor={C.accent} stopOpacity={0} /></linearGradient></defs>
      <CartesianGrid stroke={C.grid} vertical={false} /><XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} /><YAxis tick={tick} axisLine={false} tickLine={false} />
      <Tooltip {...tip} formatter={(x) => [fmt ? fmt(Number(x)) : num(Number(x)), name]} /><Area type="monotone" dataKey="v" name={name} stroke={C.accent} strokeWidth={2} fill={`url(#g-${dataKey})`} />
    </AreaChart></ResponsiveContainer>);
}

function renderChart(id: string, d: Data, viz: string, gran: string) {
  if (id === "leads_dia") return <SerieChart data={aggregar(d.leadsPorDia.map((x) => ({ date: x.date, v: x.count })), gran)} dataKey="leads" name="Leads" viz={viz} />;
  if (id === "receita_dia") return <SerieChart data={aggregar(d.receitaPorDia.map((x) => ({ date: x.date, v: x.valor })), gran)} dataKey="rec" name="Receita nova" viz={viz} fmt={brl} />;
  if (id === "pv_leads") {
    const pvDia = d.aquisicao.pageviewsPorDia ?? [];
    const pv = Object.fromEntries(pvDia.map((x) => [x.date, x.count]));
    const ld = Object.fromEntries(d.leadsPorDia.map((x) => [x.date, x.count]));
    const datas = Array.from(new Set([...pvDia.map((x) => x.date), ...d.leadsPorDia.map((x) => x.date)])).sort();
    const data = datas.map((date) => ({ label: fmtDia(date), pageviews: pv[date] ?? 0, leads: ld[date] ?? 0 }));
    if (viz === "table") {
      const cell: React.CSSProperties = { padding: "4px 10px", fontVariantNumeric: "tabular-nums" };
      return <div style={{ height: "100%", overflow: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead><tr style={{ color: C.muted }}><th style={{ ...cell, textAlign: "left", position: "sticky", top: 0, background: "#fff" }}>Dia</th><th style={{ ...cell, textAlign: "right", position: "sticky", top: 0, background: "#fff" }}>Page views</th><th style={{ ...cell, textAlign: "right", position: "sticky", top: 0, background: "#fff" }}>Leads</th></tr></thead>
        <tbody>{[...data].reverse().map((r, i) => <tr key={i} style={{ borderTop: `1px solid ${C.track}` }}><td style={{ ...cell, textAlign: "left", color: "#475569" }}>{r.label}</td><td style={{ ...cell, textAlign: "right", color: C.title }}>{num(r.pageviews)}</td><td style={{ ...cell, textAlign: "right", color: C.big, fontWeight: 600 }}>{num(r.leads)}</td></tr>)}</tbody>
      </table></div>;
    }
    return (
      <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke={C.grid} vertical={false} /><XAxis dataKey="label" tick={{ fill: C.axis, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
        <YAxis yAxisId="pv" tick={{ fill: C.axis, fontSize: 10 }} axisLine={false} tickLine={false} width={34} /><YAxis yAxisId="l" orientation="right" tick={{ fill: C.axis, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11 }} />
        <Line yAxisId="pv" type="monotone" dataKey="pageviews" name="Page views" stroke={C.accentSoft} strokeWidth={2} dot={false} /><Line yAxisId="l" type="monotone" dataKey="leads" name="Leads" stroke={C.accent} strokeWidth={2} dot={false} />
      </LineChart></ResponsiveContainer>);
  }
  if (id === "faturas_atraso_dist") {
    const dist = d.receita.faturasAtrasoDist ?? [0, 0, 0, 0];
    const rows = FATURAS_ATRASO_FAIXAS.map((f, i) => ({ faixa: f, n: dist[i] ?? 0 }));
    const max = Math.max(...rows.map((r) => r.n), 1);
    const tons = ["#cbd2db", "#b9a06a", "#c08a4a", C.down];
    return <div style={{ display: "flex", flexDirection: "column", gap: 11, justifyContent: "center", height: "100%" }}>{rows.map((s, i) => (
      <div key={s.faixa}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#475569" }}>{s.faixa}</span><span style={{ color: C.big, fontWeight: 600 }}>{num(s.n)} clientes</span></div><div style={{ height: 8, borderRadius: 3, background: C.track, overflow: "hidden" }}><div style={{ width: `${(s.n / max) * 100}%`, height: "100%", background: tons[i], opacity: 0.85 }} /></div></div>
    ))}<div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>tempo desde a fatura vencida em aberto mais antiga</div></div>;
  }
  if (id === "funil") {
    const f = [{ label: "Entrados", v: d.conversao.funnelEntrados }, { label: "Tem conversa", v: d.conversao.funnelTemConversa }, { label: "Acesso", v: d.conversao.funnelAcesso }, { label: "Pagou", v: d.conversao.funnelPagou }];
    const max = f[0].v || 1;
    return <div style={{ display: "flex", flexDirection: "column", gap: 9, justifyContent: "center", height: "100%" }}>{f.map((s, i) => {
      const passa = i > 0 && f[i - 1].v > 0 ? s.v / f[i - 1].v : null;
      return <div key={s.label}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#475569" }}>{s.label}</span><span>{passa != null && <span style={{ color: C.answer, marginRight: 6, fontSize: 11 }}>{pct(passa)} segue</span>}<span style={{ color: C.big, fontWeight: 600 }}>{num(s.v)}</span></span></div><div style={{ height: 9, borderRadius: 3, background: C.track, overflow: "hidden" }}><div style={{ width: `${(s.v / max) * 100}%`, height: "100%", background: C.accent, opacity: 0.8 }} /></div></div>;
    })}</div>;
  }
  if (id === "canais") {
    const cs = d.aquisicao.porCanal.slice(0, 6); const max = Math.max(...cs.map((x) => x.valor), 1);
    return <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center", height: "100%" }}>{cs.map((ch) => (
      <div key={ch.nome}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#475569" }}>{ch.nome.replace("www.", "").replace(".com", "")}</span><span style={{ color: C.big, fontWeight: 600 }}>{num(ch.valor)}</span></div><div style={{ height: 6, borderRadius: 3, background: C.track, overflow: "hidden" }}><div style={{ width: `${(ch.valor / max) * 100}%`, height: "100%", background: C.accent, opacity: 0.85 }} /></div></div>
    ))}</div>;
  }
  if (id === "funil_estagio") {
    const es = d.complementar.funilEstagio; const max = Math.max(...es.map((x) => x.n), 1);
    if (es.length === 0) return <div style={{ fontSize: 12, color: C.muted }}>sem leads no período</div>;
    return <div style={{ display: "flex", flexDirection: "column", gap: 7, overflow: "auto", height: "100%" }}>{es.map((s) => (
      <div key={s.estagio}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
          <span style={{ color: "#475569" }}>{s.estagio}</span>
          <span style={{ color: C.answer }}>{s.parados7d > 0 && <span style={{ color: C.down, marginRight: 6 }}>{num(s.parados7d)} parados +7d</span>}<span style={{ color: C.muted, marginRight: 6 }}>~{s.diasParado}d</span><span style={{ color: C.big, fontWeight: 600 }}>{num(s.n)}</span></span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: C.track, overflow: "hidden" }}><div style={{ width: `${(s.n / max) * 100}%`, height: "100%", background: C.accent, opacity: 0.8 }} /></div>
      </div>
    ))}</div>;
  }
  if (id === "conversao_canal_real") {
    const cs = d.complementar.conversaoCanalReal; const max = Math.max(...cs.map((x) => x.leads), 1);
    if (cs.length === 0) return <div style={{ fontSize: 12, color: C.muted }}>sem dados de canal no período</div>;
    return <div style={{ display: "flex", flexDirection: "column", gap: 9, overflow: "auto", height: "100%" }}>{cs.map((ch) => {
      const taxa = ch.leads > 0 ? ch.pagantes / ch.leads : 0;
      return <div key={ch.canal}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ color: "#475569" }}>{ch.canal}</span><span style={{ color: C.answer }}><span style={{ color: C.big, fontWeight: 600 }}>{num(ch.leads)}</span> leads · <span style={{ color: taxa >= 0.05 ? C.up : C.title, fontWeight: 600 }}>{num(ch.pagantes)} pagaram ({pct(taxa)})</span></span></div><div style={{ height: 7, borderRadius: 3, background: C.track, overflow: "hidden", position: "relative" }}><div style={{ width: `${(ch.leads / max) * 100}%`, height: "100%", background: C.accentSoft }} /><div style={{ position: "absolute", top: 0, left: 0, width: `${(ch.pagantes / max) * 100}%`, height: "100%", background: C.accent }} /></div></div>;
    })}</div>;
  }
  if (id === "frt_conversao") {
    const fc = d.complementar.frtConversao;
    if (fc.length === 0) return <div style={{ fontSize: 12, color: C.muted }}>sem dados no período</div>;
    const maxTaxa = Math.max(...fc.map((x) => x.leads > 0 ? x.pagantes / x.leads : 0), 0.01);
    return <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center", height: "100%" }}>{fc.map((s) => {
      const taxa = s.leads > 0 ? s.pagantes / s.leads : 0;
      return <div key={s.faixa}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ color: "#475569" }}>{s.faixa}</span><span style={{ color: C.answer }}><span style={{ color: C.big, fontWeight: 600 }}>{pct(taxa)}</span> ({num(s.pagantes)}/{num(s.leads)})</span></div><div style={{ height: 8, borderRadius: 3, background: C.track, overflow: "hidden" }}><div style={{ width: `${(taxa / maxTaxa) * 100}%`, height: "100%", background: C.accent, opacity: 0.85 }} /></div></div>;
    })}<div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>close rate por faixa de tempo da 1ª resposta humana</div></div>;
  }
  if (id === "coorte") {
    const co = d.complementar.coorte;
    if (co.length === 0) return <div style={{ fontSize: 12, color: C.muted }}>sem coorte no período</div>;
    const cell: React.CSSProperties = { padding: "5px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" };
    return <div style={{ height: "100%", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead><tr style={{ color: C.muted }}><th style={{ ...cell, textAlign: "left" }}>Semana</th><th style={cell}>Leads</th><th style={cell}>Pagou 7d</th><th style={cell}>14d</th><th style={cell}>30d</th></tr></thead>
        <tbody>{co.map((r) => (
          <tr key={r.semana} style={{ borderTop: `1px solid ${C.track}` }}>
            <td style={{ ...cell, textAlign: "left", color: "#475569" }}>{fmtDia(r.semana)}</td>
            <td style={{ ...cell, color: C.big, fontWeight: 600 }}>{num(r.leads)}</td>
            <td style={{ ...cell, color: C.answer }}>{r.leads > 0 ? pct(r.pagou7d / r.leads) : "sem dados"}</td>
            <td style={{ ...cell, color: C.answer }}>{r.leads > 0 ? pct(r.pagou14d / r.leads) : "sem dados"}</td>
            <td style={{ ...cell, color: C.up, fontWeight: 600 }}>{r.leads > 0 ? pct(r.pagou30d / r.leads) : "sem dados"}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>;
  }
  if (id === "produtividade") {
    const ps = d.complementar.produtividade; const max = Math.max(...ps.map((x) => x.leads), 1);
    if (ps.length === 0) return <div style={{ fontSize: 12, color: C.muted }}>sem vendedor atribuído no período</div>;
    return <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto", height: "100%" }}>{ps.map((s) => (
      <div key={s.vendedor}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ color: "#475569" }}>{s.vendedor}</span><span style={{ color: C.answer }}><span style={{ color: C.big, fontWeight: 600 }}>{num(s.leads)}</span> leads · <span style={{ color: C.up, fontWeight: 600 }}>{num(s.pagantes)} pagaram</span></span></div><div style={{ height: 7, borderRadius: 3, background: C.track, overflow: "hidden", position: "relative" }}><div style={{ width: `${(s.leads / max) * 100}%`, height: "100%", background: C.accentSoft }} /><div style={{ position: "absolute", top: 0, left: 0, width: `${(s.pagantes / max) * 100}%`, height: "100%", background: C.accent }} /></div></div>
    ))}</div>;
  }
  if (id === "motivos_perda") {
    const ms = d.complementar.motivosPerda; const max = Math.max(...ms.map((x) => x.n), 1);
    if (ms.length === 0) return <div style={{ fontSize: 12, color: C.muted }}>sem perdas declaradas no período</div>;
    return <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto", height: "100%" }}>{ms.map((s) => (
      <div key={s.motivo}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ color: "#475569" }}>{s.motivo}</span><span style={{ color: C.big, fontWeight: 600 }}>{num(s.n)}</span></div><div style={{ height: 6, borderRadius: 3, background: C.track, overflow: "hidden" }}><div style={{ width: `${(s.n / max) * 100}%`, height: "100%", background: C.down, opacity: 0.7 }} /></div></div>
    ))}</div>;
  }
  return null;
}

const LS_LAYOUT = "grid-layout-v3", LS_VIEWS = "grid-views-v3", LS_VIZ = "grid-viz-v1", LS_SQL = "grid-sql-v1";

type SqlQuery = { id: string; title: string; sql: string };

// Widget de métrica personalizada (consulta SELECT, somente leitura, validada no servidor).
function SqlWidget({ sql }: { sql: string }) {
  const [res, setRes] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true); setErr(null);
    runSelectQuery(sql).then((r) => { if (r.error) setErr(r.error); else setRes({ columns: r.columns, rows: r.rows }); setLoading(false); });
  }, [sql]);
  if (loading) return <div style={{ fontSize: 12, color: C.muted, padding: 12 }}>Executando...</div>;
  if (err) return <div style={{ fontSize: 11.5, color: C.down, fontFamily: "monospace", padding: 12, whiteSpace: "pre-wrap" }}>{err}</div>;
  if (!res || res.rows.length === 0) return <div style={{ fontSize: 12, color: C.muted, padding: 12 }}>Sem resultados.</div>;
  // Resultado de 1 linha × 1 coluna → exibe como número grande (KPI personalizado)
  if (res.rows.length === 1 && res.columns.length === 1) {
    const val = res.rows[0][0];
    return <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "6cqh 7cqw" }}>
      <div style={{ fontSize: "clamp(20px, min(11cqw, 30cqh), 40px)", fontWeight: 700, color: C.big, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{val === null ? "sem dados" : String(val)}</div>
      <div style={{ fontSize: 11.5, color: C.answer, marginTop: 8 }}>{res.columns[0]}</div>
    </div>;
  }
  return (
    <div style={{ height: "100%", overflow: "auto", padding: "0 8px 8px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead><tr>{res.columns.map((c) => <th key={c} style={{ textAlign: "left", padding: "5px 8px", color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: "#fff" }}>{c}</th>)}</tr></thead>
        <tbody>{res.rows.slice(0, 200).map((row, ri) => (
          <tr key={ri} style={{ borderBottom: `1px solid ${C.track}` }}>{row.map((cell, ci) => <td key={ci} style={{ padding: "5px 8px", color: C.title, fontFamily: "monospace" }}>{cell === null ? "—" : String(cell)}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function SqlModal({ inicial, tabelas, onSalvar, onFechar }: { inicial?: SqlQuery; tabelas: string[]; onSalvar: (q: SqlQuery) => void; onFechar: () => void }) {
  const [title, setTitle] = useState(inicial?.title ?? "Nova métrica personalizada");
  const [sql, setSql] = useState(inicial?.sql ?? "SELECT count(*) AS leads\nFROM leads\nWHERE deleted_at IS NULL");
  const [res, setRes] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  async function exec() { setRunning(true); setErr(null); const r = await runSelectQuery(sql); if (r.error) { setErr(r.error); setRes(null); } else setRes({ columns: r.columns, rows: r.rows }); setRunning(false); }
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ width: "min(92vw, 860px)", maxHeight: "88vh", background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ flex: 1 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ fontSize: 14, fontWeight: 600, border: "none", outline: "none", color: C.big, width: "100%" }} placeholder="Nome da métrica" />
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>Construa uma análise consultando o banco. Resultado de 1 número vira um cartão; várias linhas viram tabela.</div>
          </div>
          <button onClick={onFechar} style={{ border: "none", background: "transparent", fontSize: 18, color: C.muted, cursor: "pointer" }}>×</button>
        </div>
        <textarea value={sql} onChange={(e) => setSql(e.target.value)} spellCheck={false}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") exec(); }}
          style={{ fontFamily: "monospace", fontSize: 12.5, padding: "12px 18px", border: "none", borderBottom: `1px solid ${C.border}`, outline: "none", resize: "none", height: 150, color: "#334155", lineHeight: 1.6 }} />
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 18px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <button onClick={exec} disabled={running} style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 14px", borderRadius: 7, border: "none", background: C.accent, color: "#fff", cursor: "pointer" }}>{running ? "Executando..." : "Testar (Ctrl+Enter)"}</button>
          <span style={{ fontSize: 11.5, color: C.muted }}>Apenas leitura (SELECT).</span>
          <Link href="/admin/dashboard/banco" target="_blank" style={{ fontSize: 11.5, color: C.accent, textDecoration: "none" }}>⛁ Explorar tabelas e campos ↗</Link>
          {res && <span style={{ fontSize: 11.5, color: C.muted, marginLeft: "auto" }}>{res.rows.length} linhas</span>}
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 8, minHeight: 120 }}>
          {err && <div style={{ fontSize: 11.5, color: C.down, fontFamily: "monospace", padding: 10, whiteSpace: "pre-wrap" }}>{err}</div>}
          {res && !err && res.rows.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead><tr>{res.columns.map((c) => <th key={c} style={{ textAlign: "left", padding: "5px 8px", color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{c}</th>)}</tr></thead>
              <tbody>{res.rows.slice(0, 50).map((row, ri) => <tr key={ri} style={{ borderBottom: `1px solid ${C.track}` }}>{row.map((cell, ci) => <td key={ci} style={{ padding: "5px 8px", fontFamily: "monospace", color: C.title }}>{cell === null ? "—" : String(cell)}</td>)}</tr>)}</tbody>
            </table>
          )}
          {!res && !err && <div style={{ fontSize: 12, color: C.muted, padding: 10 }}>{tabelas.length > 0 ? `Algumas tabelas: ${tabelas.slice(0, 8).join(", ")}...` : "Teste a consulta para ver um preview."}</div>}
        </div>
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => onSalvar({ id: inicial?.id ?? `sql_${Date.now()}`, title, sql })} style={{ width: "100%", fontSize: 13, fontWeight: 600, padding: "9px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", cursor: "pointer" }}>Adicionar ao dashboard</button>
        </div>
      </div>
    </div>
  );
}

// Confirmação antes de recarregar o banco (evita atualização acidental e custo)
function ConfirmRefresh({ onConfirm, onCancel, loading }: { onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 110 }}>
      <div style={{ width: "min(92vw, 420px)", background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, padding: "22px 22px 18px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.big }}>Atualizar os dados do dashboard?</div>
        <p style={{ fontSize: 12.5, color: C.answer, marginTop: 10, lineHeight: 1.5 }}>Esta ação faz novas consultas ao banco de dados (Neon cobra por consulta). Use quando precisar dos números mais recentes.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={onCancel} disabled={loading} style={{ fontSize: 12.5, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.title, cursor: "pointer" }}>Cancelar</button>
          <button onClick={onConfirm} disabled={loading} style={{ fontSize: 12.5, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "none", background: C.accent, color: "#fff", cursor: "pointer" }}>{loading ? "Atualizando..." : "Atualizar"}</button>
        </div>
      </div>
    </div>
  );
}

// KPIs que suportam drill-down (clicar e ver quem está por trás) -> tipo da consulta
const DRILL: Record<string, string> = {
  leads: "leads", pagaram: "pagaram", acessos: "acessos",
  inad_primeiro: "entrou_nao_pagou", faturas_atraso: "faturas_atraso", perda_silenciosa: "perda_silenciosa",
};

function DrillModal({ tipo, titulo, filters, onClose }: { tipo: string; titulo: string; filters: VendasFilters; onClose: () => void }) {
  const [res, setRes] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); drillLeads(tipo, filters).then((r) => { setRes(r); setLoading(false); }); }, [tipo, filters]);
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ width: "min(92vw, 760px)", maxHeight: "86vh", background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: C.big }}>{titulo}</div><div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>quem está por trás do número{res ? ` · ${res.rows.length}${res.rows.length >= 300 ? "+" : ""}` : ""}</div></div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: 18, color: C.muted, cursor: "pointer" }}>×</button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
          {loading ? <div style={{ fontSize: 12, color: C.muted, padding: 12 }}>Carregando...</div>
            : !res || res.rows.length === 0 ? <div style={{ fontSize: 12, color: C.muted, padding: 12 }}>Ninguém aqui.</div>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr>{res.columns.map((c) => <th key={c} style={{ textAlign: "left", padding: "6px 10px", color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: "#fff" }}>{c}</th>)}</tr></thead>
                <tbody>{res.rows.map((row, ri) => <tr key={ri} style={{ borderBottom: `1px solid ${C.track}` }}>{row.map((cell, ci) => <td key={ci} style={{ padding: "6px 10px", color: C.title }}>{cell === null ? "—" : String(cell)}</td>)}</tr>)}</tbody>
              </table>}
        </div>
      </div>
    </div>
  );
}

// Dropdown de seleção de métrica (usado para Adicionar e Substituir)
function MetricMenu({ activeIds, titulo, onPick }: { activeIds: string[]; titulo: string; onPick: (id: string) => void }) {
  return (
    <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 40, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(16,24,40,0.12)", padding: 8, width: 300, maxHeight: 360, overflow: "auto" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.title, padding: "2px 9px 8px" }}>{titulo}</div>
      {(["principal", "complementar"] as const).map((grupo) => {
        const itens = CATALOG.filter((d) => (d.grupo ?? "principal") === grupo);
        if (itens.length === 0) return null;
        const rotulo = grupo === "principal" ? "No período" : "Complementares";
        return (
          <div key={grupo} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, padding: "6px 9px 3px" }}>{rotulo}</div>
            {itens.map((d) => {
              const ja = activeIds.includes(d.id);
              return (
                <button key={d.id} onClick={() => onPick(d.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", textAlign: "left", fontSize: 12.5, padding: "7px 9px", borderRadius: 6, border: "none", background: "transparent", color: C.title, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <span>{d.titulo} {d.kind === "chart" && <span style={{ color: C.muted, fontSize: 10 }}>gráfico</span>}</span>
                  {ja && <span style={{ color: C.muted, fontSize: 9.5 }}>no painel</span>}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Faixa reservada de estado atual: cartões elevados (sombra), sem bordas coloridas.
function StateBand({ data, onDrill }: { data: Data; onDrill: (tipo: string, titulo: string) => void }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 11 }}>
        Estado atual da operação <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>· não depende do período</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        {STATE_IDS.map((id) => {
          const k = resolveKpi(id, data); if (!k) return null;
          const titulo = STATE_TITLES[id] ?? id;
          const drill = DRILL[id];
          const click = drill ? () => onDrill(drill, titulo) : undefined;
          return (
            <div key={id} onClick={click}
              onMouseEnter={(e) => { if (click) e.currentTarget.style.boxShadow = "0 2px 4px rgba(16,24,40,0.06), 0 10px 24px rgba(16,24,40,0.10)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = C.shadow; }}
              style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: C.shadow, position: "relative", cursor: click ? "pointer" : "default", transition: "box-shadow 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.title, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titulo}</span>
                {drill && <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>ver clientes ↗</span>}
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, color: C.big, fontVariantNumeric: "tabular-nums", lineHeight: 1.05, marginTop: 12 }}>{k.valor}</div>
              <div style={{ fontSize: 12, color: C.answer, marginTop: 10, lineHeight: 1.35 }}>{k.resposta}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardGrid({ filters, dataStamp, filterOptions, ...data }: Props) {
  const router = useRouter(); const pathname = usePathname(); const sp = useSearchParams();
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [viz, setViz] = useState<Record<string, string>>({});
  const [gran, setGran] = useState<Record<string, string>>({});
  const [views, setViews] = useState<{ name: string; layout: LayoutItem[]; viz: Record<string, string> }[]>([]);
  const [sqlQueries, setSqlQueries] = useState<SqlQuery[]>([]);
  const [sqlModal, setSqlModal] = useState<SqlQuery | "new" | null>(null);
  const [edit, setEdit] = useState(false);
  const [drill, setDrill] = useState<{ tipo: string; titulo: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [replaceFor, setReplaceFor] = useState<string | null>(null); // card sendo substituído
  const [nome, setNome] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [gridW, setGridW] = useState(1200);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const l = localStorage.getItem(LS_LAYOUT); if (l) setLayout(JSON.parse(l));
      const v = localStorage.getItem(LS_VIEWS); if (v) setViews(JSON.parse(v));
      const z = localStorage.getItem(LS_VIZ); if (z) setViz(JSON.parse(z));
      const s = localStorage.getItem(LS_SQL); if (s) setSqlQueries(JSON.parse(s));
      const g = localStorage.getItem("grid-gran-v1"); if (g) setGran(JSON.parse(g));
    } catch {}
  }, []);
  const persistGran = (g: Record<string, string>) => { try { localStorage.setItem("grid-gran-v1", JSON.stringify(g)); } catch {} setGran(g); };
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setGridW(e.contentRect.width)); ro.observe(el); setGridW(el.getBoundingClientRect().width); return () => ro.disconnect(); }, [mounted]);

  const persistLayout = useCallback((l: LayoutItem[]) => { try { localStorage.setItem(LS_LAYOUT, JSON.stringify(l)); } catch {} setLayout(l); }, []);
  const persistViz = useCallback((z: Record<string, string>) => { try { localStorage.setItem(LS_VIZ, JSON.stringify(z)); } catch {} setViz(z); }, []);
  const persistViews = (vs: typeof views) => { try { localStorage.setItem(LS_VIEWS, JSON.stringify(vs)); } catch {} setViews(vs); };

  function navigate(next: Record<string, string | null>) { const params = new URLSearchParams(sp.toString()); Object.entries(next).forEach(([k, val]) => { if (!val) params.delete(k); else params.set(k, val); }); router.push(`${pathname}?${params.toString()}`); }
  function setPreset(days: number) { const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - days); navigate({ start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] }); }
  const diff = Math.round((new Date(filters.end).getTime() - new Date(filters.start).getTime()) / 86400000);
  const activePreset = [1, 7, 30, 90].includes(diff) ? diff : null;
  async function doRefresh() { setRefreshing(true); try { await refreshVendas(); router.refresh(); } finally { setRefreshing(false); setConfirmRefresh(false); } }
  const stamp = (() => { try { return new Date(dataStamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); } catch { return "sem data"; } })();

  const activeBaseIds = layout.map((l) => baseId(l.i));
  // novo id de instância para uma base; se já houver, sufixa com #n
  function novoId(base: string) { if (!layout.some((l) => l.i === base)) return base; let n = 2; while (layout.some((l) => l.i === `${base}#${n}`)) n++; return `${base}#${n}`; }
  function addWidget(id: string) { const def = CATALOG.find((d) => d.id === id); if (!def) return; const i = novoId(id); const maxY = Math.max(0, ...layout.map((l) => l.y + l.h)); persistLayout([...layout, { i, x: 0, y: maxY, w: def.w, h: def.h, minW: def.minW, minH: def.minH, maxW: def.maxW, maxH: def.maxH } as LayoutItem]); setShowAdd(false); }
  function duplicateWidget(itemI: string) {
    const base = baseId(itemI); const def = CATALOG.find((d) => d.id === base); const src = layout.find((l) => l.i === itemI); if (!def || !src) return;
    const i = novoId(base); const maxY = Math.max(0, ...layout.map((l) => l.y + l.h));
    persistLayout([...layout, { i, x: src.x, y: maxY, w: src.w, h: src.h, minW: def.minW, minH: def.minH, maxW: def.maxW, maxH: def.maxH } as LayoutItem]);
    if (viz[itemI]) persistViz({ ...viz, [i]: viz[itemI] });
    if (gran[itemI]) persistGran({ ...gran, [i]: gran[itemI] });
  }
  function replaceWidget(itemI: string, newBase: string) {
    const def = CATALOG.find((d) => d.id === newBase); const src = layout.find((l) => l.i === itemI); if (!def || !src) { setReplaceFor(null); return; }
    const i = novoId(newBase);
    const w = Math.min(Math.max(src.w, def.minW), def.maxW); const h = Math.min(Math.max(src.h, def.minH), def.maxH);
    persistLayout(layout.map((l) => l.i === itemI ? { i, x: src.x, y: src.y, w, h, minW: def.minW, minH: def.minH, maxW: def.maxW, maxH: def.maxH } as LayoutItem : l));
    setReplaceFor(null);
  }
  function removeWidget(id: string) { persistLayout(layout.filter((l) => l.i !== id)); if (id.startsWith("sql_")) persistSql(sqlQueries.filter((q) => q.id !== id)); }
  const persistSql = (qs: SqlQuery[]) => { try { localStorage.setItem(LS_SQL, JSON.stringify(qs)); } catch {} setSqlQueries(qs); };
  function saveSql(q: SqlQuery) {
    persistSql([...sqlQueries.filter((x) => x.id !== q.id), q]);
    if (!layout.some((l) => l.i === q.id)) { const maxY = Math.max(0, ...layout.map((l) => l.y + l.h)); persistLayout([...layout, { i: q.id, x: 0, y: maxY, w: 4, h: 3, minW: 2, minH: 2, maxW: 12, maxH: 10 } as LayoutItem]); }
    setSqlModal(null);
  }
  function salvarView() { const n = nome.trim(); if (!n) return; persistViews([...views.filter((v) => v.name !== n), { name: n, layout, viz }]); setNome(""); }
  function carregarView(name: string) { const view = views.find((v) => v.name === name); if (view) { persistLayout(view.layout); persistViz(view.viz); } }

  const selStyle: React.CSSProperties = { fontSize: 12.5, padding: "6px 9px", borderRadius: 7, border: `1px solid ${C.border}`, background: "#fff", color: C.title, outline: "none" };
  const groupStyle: React.CSSProperties = { display: "flex", gap: 6, alignItems: "center", padding: "5px 9px", background: "#fafbfc", border: `1px solid ${C.border}`, borderRadius: 9 };
  const data2: Data = data as Data;

  if (!mounted) return <div style={{ padding: 24, color: C.muted }}>Carregando...</div>;

  return (
    <div style={{ background: C.page, minHeight: "calc(100vh - 80px)", color: C.big, margin: "-32px -24px", padding: "0 28px 30px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}
        .react-grid-item.react-grid-placeholder{background:${C.accentSoft};opacity:.5;border-radius:10px}
        .react-grid-item>.react-resizable-handle{opacity:${edit ? 0.6 : 0}}
        .react-grid-item>.react-resizable-handle::after{border-color:${C.accent}}`}</style>

      {/* Barra superior plana (sobre o branco, sem caixa) */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "22px 0 16px", borderBottom: `1px solid ${C.border}` }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.big }}>Engenharia de Vendas</h1>
          <p style={{ fontSize: 12, color: C.answer, marginTop: 3 }}>{filters.start} a {filters.end} · atualizado {stamp}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {[{ l: "Hoje", d: 1 }, { l: "7d", d: 7 }, { l: "30d", d: 30 }, { l: "90d", d: 90 }].map(({ l, d }) => (
            <button key={d} onClick={() => setPreset(d)} style={{ fontSize: 12.5, padding: "6px 10px", borderRadius: 7, cursor: "pointer", border: `1px solid ${activePreset === d ? C.accent : C.border}`, background: activePreset === d ? "#eef1f5" : "#fff", color: C.title, fontWeight: activePreset === d ? 600 : 400 }}>{l}</button>
          ))}
          {filterOptions.sources.length > 0 && (
            <select value={filters.source ?? ""} onChange={(e) => navigate({ source: e.target.value || null })} style={selStyle}><option value="">Origem: todas</option>{filterOptions.sources.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          )}
          {filterOptions.landingVariants.length > 0 && (
            <select value={filters.landingVariant ?? ""} onChange={(e) => navigate({ lv: e.target.value || null })} style={selStyle}><option value="">Landing: todas</option>{filterOptions.landingVariants.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          )}
          <span style={{ width: 1, height: 20, background: C.border, margin: "0 2px" }} />
          <button onClick={() => setConfirmRefresh(true)} disabled={refreshing} style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.accent}`, background: C.accent, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>↻</span>{refreshing ? "..." : "Atualizar"}</button>
          <button onClick={() => setEdit(!edit)} style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 7, cursor: "pointer", border: `1px solid ${edit ? C.accent : C.border}`, background: edit ? "#eef1f5" : "#fff", color: C.title }}>{edit ? "✓ Concluir edição" : "✎ Personalizar"}</button>
        </div>
      </div>

      {/* Faixa reservada: estado atual da operação (fixa, sempre no topo) */}
      <StateBand data={data2} onDrill={(tipo, titulo) => setDrill({ tipo, titulo })} />

      {/* Barra de edição: grupos com hierarquia (Adicionar · Visões · Banco) */}
      {edit && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginTop: 14 }}>
          <div style={groupStyle}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 2 }}>Adicionar</span>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowAdd(!showAdd); setReplaceFor(null); }} style={{ fontSize: 12.5, fontWeight: 600, padding: "5px 11px", borderRadius: 7, border: `1px solid ${C.accent}`, background: "#fff", color: C.accent, cursor: "pointer" }}>＋ Métrica</button>
              {showAdd && !replaceFor && <MetricMenu activeIds={activeBaseIds} titulo="Adicionar métrica ao painel" onPick={addWidget} />}
            </div>
            <button onClick={() => setSqlModal("new")} style={{ fontSize: 12.5, fontWeight: 600, padding: "5px 11px", borderRadius: 7, border: `1px solid ${C.border}`, background: "#fff", color: C.title, cursor: "pointer" }}>＋ Métrica personalizada</button>
          </div>

          <div style={groupStyle}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 2 }}>Visões</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da visão" onKeyDown={(e) => e.key === "Enter" && salvarView()} style={{ ...selStyle, width: 130, padding: "5px 9px" }} />
            <button onClick={salvarView} style={{ fontSize: 12.5, fontWeight: 600, padding: "5px 11px", borderRadius: 7, border: "none", background: C.accent, color: "#fff", cursor: "pointer" }}>Salvar</button>
            {views.length > 0 && (
              <select onChange={(e) => { if (e.target.value) carregarView(e.target.value); }} defaultValue="" style={{ ...selStyle, padding: "5px 9px" }}><option value="" disabled>Carregar</option>{views.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}</select>
            )}
            <button onClick={() => persistLayout(DEFAULT_LAYOUT)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "#fff", color: C.muted, cursor: "pointer" }}>Resetar</button>
          </div>

          <Link href="/admin/dashboard/banco" style={{ fontSize: 12.5, fontWeight: 600, padding: "9px 13px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fafbfc", color: C.title, textDecoration: "none" }}>⛁ Explorar banco</Link>
          <span style={{ fontSize: 11.5, color: C.muted }}>arraste pelo título · redimensione pelo canto inferior direito</span>
        </div>
      )}

      {/* Movimentação no período (grid personalizável) */}
      <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.7, marginTop: 26, marginBottom: 2 }}>
        Movimentação no período <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>· {filters.start} a {filters.end}</span>
      </div>

      {/* Grid */}
      <div ref={ref} style={{ marginTop: 10 }}>
        <ResponsiveGridLayout
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1100, md: 900, sm: 640 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={62} width={gridW} margin={[14, 14]}
          dragConfig={{ enabled: edit, handle: ".drag-handle" }}
          resizeConfig={{ enabled: edit, handles: ["se"] }}
          onLayoutChange={(_: Layout, all: ResponsiveLayouts) => { if (all.lg) persistLayout([...all.lg] as LayoutItem[]); }}
        >
          {layout.map((item) => {
            const isSql = item.i.startsWith("sql_");
            const sq = isSql ? sqlQueries.find((q) => q.id === item.i) : null;
            const bid = baseId(item.i);
            const def = isSql ? null : CATALOG.find((d) => d.id === bid);
            if (isSql ? !sq : !def) return null;
            const titulo = isSql ? sq!.title : def!.titulo;
            const curViz = viz[item.i] ?? (def?.viz?.[0] ?? "area");
            return (
              <div key={item.i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", containerType: "size" }}>
                <div className={edit ? "drag-handle" : ""} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 13px 4px", cursor: edit ? "grab" : "default", flexShrink: 0 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: C.title, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titulo}</span>
                    {isSql && <span style={{ fontSize: 9, color: C.muted, flexShrink: 0 }}>personalizada</span>}
                  </span>
                  {edit && (
                    <span style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                      {isSql && <button onClick={(e) => { e.stopPropagation(); setSqlModal(sq!); }} title="Editar consulta" style={{ fontSize: 12, width: 22, height: 20, borderRadius: 5, cursor: "pointer", border: "none", background: "#eef1f5", color: C.muted }}>✎</button>}
                      {def?.viz && def.viz.map((z) => (
                        <button key={z} onClick={(e) => { e.stopPropagation(); persistViz({ ...viz, [item.i]: z }); }} title={z} style={{ fontSize: 12, width: 22, height: 20, borderRadius: 5, cursor: "pointer", border: "none", background: curViz === z ? C.accent : "#eef1f5", color: curViz === z ? "#fff" : C.muted }}>{z === "area" ? "∿" : z === "bar" ? "▮" : z === "line" ? "╱" : "▦"}</button>
                      ))}
                      {(bid === "leads_dia" || bid === "receita_dia") && (["dia", "semana", "mes"] as const).map((g) => (
                        <button key={g} onClick={(e) => { e.stopPropagation(); persistGran({ ...gran, [item.i]: g }); }} title={g} style={{ fontSize: 11, fontWeight: 600, width: 20, height: 20, borderRadius: 5, cursor: "pointer", border: "none", background: (gran[item.i] ?? "dia") === g ? C.accent : "#eef1f5", color: (gran[item.i] ?? "dia") === g ? "#fff" : C.muted }}>{g === "dia" ? "D" : g === "semana" ? "S" : "M"}</button>
                      ))}
                      {!isSql && <button onClick={(e) => { e.stopPropagation(); duplicateWidget(item.i); }} title="Duplicar" style={{ fontSize: 12, width: 22, height: 20, borderRadius: 5, cursor: "pointer", border: "none", background: "#eef1f5", color: C.muted }}>⧉</button>}
                      {!isSql && <div style={{ position: "relative" }}>
                        <button onClick={(e) => { e.stopPropagation(); setReplaceFor(replaceFor === item.i ? null : item.i); setShowAdd(false); }} title="Substituir" style={{ fontSize: 12, width: 22, height: 20, borderRadius: 5, cursor: "pointer", border: "none", background: replaceFor === item.i ? C.accent : "#eef1f5", color: replaceFor === item.i ? "#fff" : C.muted }}>⇄</button>
                        {replaceFor === item.i && <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 4px)", right: 0 }}><MetricMenu activeIds={activeBaseIds} titulo="Substituir por" onPick={(nb) => replaceWidget(item.i, nb)} /></div>}
                      </div>}
                      <button onClick={(e) => { e.stopPropagation(); removeWidget(item.i); }} title="Remover" style={{ fontSize: 14, width: 22, height: 20, borderRadius: 5, cursor: "pointer", border: "none", background: "#fde8e8", color: C.down }}>×</button>
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minHeight: 0, padding: isSql ? 0 : (def!.kind === "chart" ? "4px 12px 12px" : 0) }}>
                  {isSql ? <SqlWidget sql={sq!.sql} /> : def!.kind === "kpi" ? (() => { const k = resolveKpi(bid, data2); return k ? <KpiView k={k} onDrill={!edit && DRILL[bid] ? () => setDrill({ tipo: DRILL[bid], titulo: def!.titulo }) : undefined} /> : null; })() : renderChart(bid, data2, curViz, gran[item.i] ?? "dia")}
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {sqlModal && <SqlModal inicial={sqlModal === "new" ? undefined : sqlModal} tabelas={[]} onSalvar={saveSql} onFechar={() => setSqlModal(null)} />}
      {drill && <DrillModal tipo={drill.tipo} titulo={drill.titulo} filters={filters} onClose={() => setDrill(null)} />}
      {confirmRefresh && <ConfirmRefresh loading={refreshing} onConfirm={doRefresh} onCancel={() => setConfirmRefresh(false)} />}
    </div>
  );
}
