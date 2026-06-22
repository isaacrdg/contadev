"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ResponsiveGridLayout } from "react-grid-layout";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import {
  Area, AreaChart, Bar, BarChart, Line, LineChart,
  CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { runSelectQuery, refreshVendas } from "./actions";
import type {
  VendasFilters, ReceitaData, ConversaoData,
  VelocidadeData, PerdaData, LeadDia, FilterOptions,
} from "@/lib/vendas-db";


// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  receita: ReceitaData;
  conversao: ConversaoData;
  velocidade: VelocidadeData;
  perda: PerdaData;
  leadsPorDia: LeadDia[];
  filterOptions: FilterOptions;
}

interface PrevData {
  receita: ReceitaData;
  conversao: ConversaoData;
  velocidade: VelocidadeData;
  perda: PerdaData;
}

interface Props extends DashboardData {
  filters: VendasFilters;
  prev?: PrevData;
  dataStamp: string;
}

export interface CustomQuery {
  id: string;
  title: string;
  sql: string;
  vizType: "table" | "number" | "bar" | "line" | "area";
}

// ── Widget catalog ─────────────────────────────────────────────────────────────

const CATEGORY_DOT: Record<string, string> = {
  receita:    "#7553ff",
  conversao:  "#22c55e",
  velocidade: "#3b82f6",
  perda:      "#ef4444",
};

interface WidgetDef {
  id: string;
  title: string;
  category: "receita" | "conversao" | "velocidade" | "perda";
  w: number;
  h: number;
}

const WIDGET_CATALOG: WidgetDef[] = [
  { id: "clientes_ativos",   title: "Clientes Ativos",          category: "receita",    w: 3, h: 2 },
  { id: "mrr",               title: "MRR Atual",                category: "receita",    w: 3, h: 2 },
  { id: "total_cobrado",     title: "Total Cobrado",            category: "receita",    w: 3, h: 2 },
  { id: "valor_novos",       title: "Valor Novos Contratos",    category: "receita",    w: 3, h: 2 },
  { id: "em_risco",          title: "Em Risco / Inadimplentes", category: "receita",    w: 3, h: 2 },
  { id: "pagou_pct",         title: "% Assinou → Pagou",        category: "receita",    w: 3, h: 2 },
  { id: "qtd_anuais",        title: "Novos Planos Anuais",      category: "receita",    w: 3, h: 2 },
  { id: "val_anuais",        title: "Valor Anuais",             category: "receita",    w: 3, h: 2 },
  { id: "qtd_mensais",       title: "Novos Planos Mensais",     category: "receita",    w: 3, h: 2 },
  { id: "val_mensais",       title: "Valor Mensais",            category: "receita",    w: 3, h: 2 },
  { id: "planos_mix",        title: "Mix Anual / Mensal",       category: "receita",    w: 6, h: 2 },
  { id: "upgrades",          title: "Upgrades → Anual",         category: "receita",    w: 3, h: 2 },
  { id: "leads",             title: "Leads Entrados",           category: "conversao",  w: 3, h: 2 },
  { id: "fechamentos",       title: "Novos Fechamentos",        category: "conversao",  w: 3, h: 2 },
  { id: "close_rate",        title: "Close Rate (pagos)",       category: "conversao",  w: 3, h: 2 },
  { id: "acessos",           title: "Acessos (billing)",        category: "conversao",  w: 3, h: 2 },
  { id: "taxa_pagamento",    title: "Acesso → Pagamento",       category: "conversao",  w: 3, h: 2 },
  { id: "perda_pagamento",   title: "Entrou e não Pagou",       category: "conversao",  w: 3, h: 2 },
  { id: "multiplos",         title: "Múltiplas Entradas",       category: "conversao",  w: 3, h: 2 },
  { id: "reentradas_c",      title: "Reentradas no Funil",      category: "conversao",  w: 3, h: 2 },
  { id: "quicam",            title: "Quicaram (<15d)",          category: "conversao",  w: 3, h: 2 },
  { id: "inadimplentes_c",   title: "Inadimplentes (past_due)", category: "conversao",  w: 3, h: 2 },
  { id: "leads_dia",         title: "Leads por Dia",            category: "conversao",  w: 8, h: 4 },
  { id: "funil",             title: "Funil de Conversão",       category: "conversao",  w: 4, h: 4 },
  { id: "frt",               title: "FRT — 1ª Resposta",        category: "velocidade", w: 4, h: 3 },
  { id: "second_resp",       title: "2ª Resposta Humana",       category: "velocidade", w: 4, h: 3 },
  { id: "time_between",      title: "Entre Respostas",          category: "velocidade", w: 4, h: 3 },
  { id: "msgs_fechar",       title: "Msgs até Fechamento",      category: "velocidade", w: 3, h: 2 },
  { id: "msgs_perdido",      title: "Msgs até Perdido",         category: "velocidade", w: 3, h: 2 },
  { id: "perdidos_d",        title: "Perdidos Declarados",      category: "perda",      w: 3, h: 2 },
  { id: "perdidos_g",        title: "Perdidos (Ghosting 7d)",   category: "perda",      w: 3, h: 2 },
  { id: "taxa_perda",        title: "Taxa de Perda",            category: "perda",      w: 3, h: 2 },
  { id: "reentradas_p",      title: "Reentradas pós-Perda",     category: "perda",      w: 3, h: 2 },
  { id: "cancelamentos",     title: "Cancelamentos (churn)",    category: "perda",      w: 3, h: 2 },
];

const DEFAULT_LAYOUT: LayoutItem[] = [
  // Receita
  { i: "clientes_ativos",  x: 0,  y: 0,  w: 3, h: 2 } as LayoutItem,
  { i: "mrr",              x: 3,  y: 0,  w: 3, h: 2 } as LayoutItem,
  { i: "total_cobrado",    x: 6,  y: 0,  w: 3, h: 2 } as LayoutItem,
  { i: "valor_novos",      x: 9,  y: 0,  w: 3, h: 2 } as LayoutItem,
  { i: "planos_mix",       x: 0,  y: 2,  w: 3, h: 2 } as LayoutItem,
  { i: "qtd_anuais",       x: 3,  y: 2,  w: 2, h: 2 } as LayoutItem,
  { i: "qtd_mensais",      x: 5,  y: 2,  w: 2, h: 2 } as LayoutItem,
  { i: "upgrades",         x: 7,  y: 2,  w: 2, h: 2 } as LayoutItem,
  { i: "pagou_pct",        x: 9,  y: 2,  w: 2, h: 2 } as LayoutItem,
  { i: "em_risco",         x: 11, y: 2,  w: 1, h: 2 } as LayoutItem,
  // Conversão
  { i: "leads",            x: 0,  y: 4,  w: 3, h: 2 } as LayoutItem,
  { i: "fechamentos",      x: 3,  y: 4,  w: 3, h: 2 } as LayoutItem,
  { i: "close_rate",       x: 6,  y: 4,  w: 3, h: 2 } as LayoutItem,
  { i: "acessos",          x: 9,  y: 4,  w: 3, h: 2 } as LayoutItem,
  { i: "taxa_pagamento",   x: 0,  y: 6,  w: 3, h: 2 } as LayoutItem,
  { i: "perda_pagamento",  x: 3,  y: 6,  w: 3, h: 2 } as LayoutItem,
  { i: "inadimplentes_c",  x: 6,  y: 6,  w: 3, h: 2 } as LayoutItem,
  { i: "quicam",           x: 9,  y: 6,  w: 3, h: 2 } as LayoutItem,
  { i: "leads_dia",        x: 0,  y: 8,  w: 8, h: 4 } as LayoutItem,
  { i: "funil",            x: 8,  y: 8,  w: 4, h: 4 } as LayoutItem,
  // Velocidade
  { i: "frt",              x: 0,  y: 12, w: 4, h: 3 } as LayoutItem,
  { i: "second_resp",      x: 4,  y: 12, w: 4, h: 3 } as LayoutItem,
  { i: "time_between",     x: 8,  y: 12, w: 4, h: 3 } as LayoutItem,
  { i: "msgs_fechar",      x: 0,  y: 15, w: 3, h: 2 } as LayoutItem,
  { i: "msgs_perdido",     x: 3,  y: 15, w: 3, h: 2 } as LayoutItem,
  // Perda
  { i: "perdidos_d",       x: 0,  y: 17, w: 3, h: 2 } as LayoutItem,
  { i: "perdidos_g",       x: 3,  y: 17, w: 3, h: 2 } as LayoutItem,
  { i: "taxa_perda",       x: 6,  y: 17, w: 3, h: 2 } as LayoutItem,
  { i: "cancelamentos",    x: 9,  y: 17, w: 3, h: 2 } as LayoutItem,
  { i: "reentradas_p",     x: 0,  y: 19, w: 3, h: 2 } as LayoutItem,
];

// ── Formatters ─────────────────────────────────────────────────────────────────

const fmtBRL = (v: number) =>
  v >= 1_000_000 ? `R$ ${(v / 1_000_000).toFixed(2)}M`
  : v >= 1_000   ? `R$ ${(v / 1_000).toFixed(1)}k`
  : `R$ ${Math.round(v)}`;

const fmtNum = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `${(v / 1_000).toFixed(1)}k`
  : String(Math.round(v));

const fmtPct = (r: number) => `${(r * 100).toFixed(1)}%`;

const fmtMin = (min: number | null): string => {
  if (min === null) return "—";
  const m = Math.round(min);
  if (m < 60)   return `${m}min`;
  if (m < 1440) return `${(m / 60).toFixed(1)}h`;
  return `${(m / 1440).toFixed(1)}d`;
};

const fmtMsgs = (v: number | null) => v === null ? "—" : `${Math.round(v)} msgs`;

const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

// ── KPI data resolver ─────────────────────────────────────────────────────────

interface KpiData {
  value: string;
  label: string;
  sub?: string;
  accent: "purple" | "green" | "red" | "blue" | "neutral" | "disabled";
  p50?: string;
  p90?: string;
}

function resolveKpi(id: string, d: DashboardData): KpiData | null {
  const { receita: r, conversao: c, velocidade: v, perda: p } = d;
  const map: Record<string, () => KpiData> = {
    clientes_ativos: () => ({ value: fmtNum(r.clientesAtivos),          label: "Clientes Ativos",          sub: "assinaturas ativas hoje",        accent: "purple" }),
    mrr:             () => ({ value: fmtBRL(r.mrr),                     label: "MRR Atual",                sub: "recorrência mensal equiv.",       accent: "purple" }),
    total_cobrado:   () => ({ value: fmtBRL(r.totalCobrado),            label: "Total Cobrado",            sub: "pagamentos confirmados período",  accent: "green" }),
    valor_novos:     () => ({ value: fmtBRL(r.valorNovosContratos),     label: "Valor Novos Contratos",    sub: "novas assinaturas no período",   accent: "green" }),
    em_risco:        () => ({ value: fmtNum(r.emRisco),                 label: "Em Risco",                 sub: "past_due + canceladas",          accent: r.emRisco > 10 ? "red" : "neutral" }),
    pagou_pct:       () => ({ value: r.assinou > 0 ? fmtPct(r.pagou / r.assinou) : "—", label: "% Acesso → Pagou", sub: `${r.pagou} pagaram / ${r.assinou} acessos`, accent: r.assinou > 0 && r.pagou / r.assinou > 0.85 ? "green" : "red" }),
    qtd_anuais:      () => ({ value: fmtNum(r.qtdNovosAnuais),          label: "Novos Anuais",             sub: fmtBRL(r.valorNovosAnuais),       accent: "purple" }),
    val_anuais:      () => ({ value: fmtBRL(r.valorNovosAnuais),        label: "Valor Anuais",             sub: `${r.qtdNovosAnuais} contratos`,  accent: "neutral" }),
    qtd_mensais:     () => ({ value: fmtNum(r.qtdNovosMensais),         label: "Novos Mensais",            sub: fmtBRL(r.valorNovosMensais),      accent: "neutral" }),
    val_mensais:     () => ({ value: fmtBRL(r.valorNovosMensais),       label: "Valor Mensais",            sub: `${r.qtdNovosMensais} contratos`, accent: "neutral" }),
    upgrades:        () => ({ value: fmtNum(r.upgrades),                label: "Upgrades → Anual",         sub: "mensal virou anual (expansão)",  accent: r.upgrades > 0 ? "green" : "neutral" }),
    leads:           () => ({ value: fmtNum(c.leadsEntrados),           label: "Leads Entrados",           sub: "entradas no período",            accent: "purple" }),
    fechamentos:     () => ({ value: fmtNum(c.fechamentos),             label: "Novos Fechamentos",        sub: "pagamento confirmado",           accent: "green" }),
    close_rate:      () => ({ value: fmtPct(c.closeRate),               label: "Close Rate",               sub: `${c.fechamentos} / ${c.leadsEntrados}`, accent: c.closeRate > 0.15 ? "green" : "red" }),
    multiplos:       () => ({ value: fmtNum(c.multiplosEntradas),       label: "Múltiplas Entradas",       sub: "leads com 2+ formulários",       accent: "neutral" }),
    reentradas_c:    () => ({ value: fmtNum(c.reentradas),              label: "Reentradas no Funil",      sub: "perdido → novo formulário",      accent: c.reentradas > 0 ? "green" : "neutral" }),
    quicam:          () => ({ value: fmtNum(c.quicam),                  label: "Quicaram (<15d)",          sub: "congelados em <15 dias",         accent: c.quicam > 0 ? "red" : "neutral" }),
    acessos:         () => ({ value: fmtNum(c.acessos),                 label: "Acessos (billing criado)", sub: "receberam acesso à plataforma",   accent: "purple" }),
    taxa_pagamento:  () => ({ value: c.acessos > 0 ? fmtPct(c.taxaPagamento) : "—", label: "Acesso → Pagamento", sub: `${c.fechamentos} pagaram / ${c.acessos} acessos`, accent: c.taxaPagamento > 0.85 ? "green" : c.taxaPagamento > 0.7 ? "neutral" : "red" }),
    perda_pagamento: () => ({ value: fmtNum(c.perdaPagamento),          label: "Entrou e não Pagou",       sub: "acesso sem pagamento (pending)", accent: c.perdaPagamento > 0 ? "red" : "neutral" }),
    inadimplentes_c: () => ({ value: fmtNum(c.inadimplentes),           label: "Inadimplentes (past_due)", sub: "eram ativos e pararam de pagar", accent: c.inadimplentes > 0 ? "red" : "neutral" }),
    frt:             () => ({ value: fmtMin(v.frtP50),                  label: "FRT — 1ª Resposta",        sub: "tempo até 1ª msg humana",        accent: "blue", p50: fmtMin(v.frtP50), p90: fmtMin(v.frtP90) }),
    second_resp:     () => ({ value: fmtMin(v.secondRespP50),           label: "2ª Resposta Humana",       sub: "tempo até 2ª msg humana",        accent: "blue", p50: fmtMin(v.secondRespP50), p90: fmtMin(v.secondRespP90) }),
    time_between:    () => ({ value: fmtMin(v.timeBetweenP50),          label: "Entre Respostas",          sub: "intervalo entre msgs humanas",   accent: "blue", p50: fmtMin(v.timeBetweenP50), p90: fmtMin(v.timeBetweenP90) }),
    msgs_fechar:     () => ({ value: fmtMsgs(v.msgsAteFecharP50),      label: "Msgs até Fechamento",      sub: "p50 — leads que pagaram",        accent: "green" }),
    msgs_perdido:    () => ({ value: fmtMsgs(v.msgsAtePerdidoP50),     label: "Msgs até Perdido",         sub: "p50 — leads perdidos",           accent: "red" }),
    perdidos_d:      () => ({ value: fmtNum(p.perdidosDeclarados),      label: "Perdidos Declarados",      sub: "registros em lead_losses",       accent: p.perdidosDeclarados > 0 ? "red" : "neutral" }),
    perdidos_g:      () => ({ value: fmtNum(p.perdidosGhosting),        label: "Ghosting (7d s/ msg)",     sub: "sem billing, sem resposta 7d",   accent: p.perdidosGhosting > 5 ? "red" : "neutral" }),
    taxa_perda:      () => ({ value: fmtPct(p.taxaPerda),               label: "Taxa de Perda",            sub: "(declarados + ghosting) / leads", accent: p.taxaPerda > 0.4 ? "red" : p.taxaPerda > 0.2 ? "neutral" : "green" }),
    reentradas_p:    () => ({ value: fmtNum(p.reentradas),              label: "Reentradas pós-Perda",     sub: "perdido → voltou ao funil",      accent: p.reentradas > 0 ? "green" : "neutral" }),
    cancelamentos:   () => ({ value: fmtNum(p.cancelamentos),          label: "Cancelamentos (churn)",    sub: "assinaturas canceladas no período", accent: p.cancelamentos > 0 ? "red" : "neutral" }),
  };
  return map[id]?.() ?? null;
}

// ── Accent colors (for data only, not decoration) ─────────────────────────────

const ACCENT_HEX: Record<string, string> = {
  purple:   "#9b7dff",
  green:    "#22c55e",
  red:      "#ef4444",
  blue:     "#60a5fa",
  neutral:  "rgba(255,255,255,0.75)",
  disabled: "rgba(255,255,255,0.2)",
};

// ── Period-over-period comparison ───────────────────────────────────────────────

type Delta = { text: string; tone: "good" | "bad" | "flat" };

// kind: como formatar a variação · dir: qual direção é "boa" · compare:false = sem comparação
// (KPIs de estado atual, não atrelados ao período). raw: valor numérico comparável.
type KpiMeta = {
  kind: "count" | "money" | "rate" | "time" | "msgs";
  dir: "up" | "down" | "none";
  compare?: boolean;
  raw: (d: DashboardData) => number | null;
};

const KPI_META: Record<string, KpiMeta> = {
  clientes_ativos: { kind: "count", dir: "up",   compare: false, raw: (d) => d.receita.clientesAtivos },
  mrr:             { kind: "money", dir: "up",   compare: false, raw: (d) => d.receita.mrr },
  em_risco:        { kind: "count", dir: "down", compare: false, raw: (d) => d.receita.emRisco },
  total_cobrado:   { kind: "money", dir: "up",   raw: (d) => d.receita.totalCobrado },
  valor_novos:     { kind: "money", dir: "up",   raw: (d) => d.receita.valorNovosContratos },
  pagou_pct:       { kind: "rate",  dir: "up",   raw: (d) => d.receita.assinou > 0 ? d.receita.pagou / d.receita.assinou : null },
  qtd_anuais:      { kind: "count", dir: "up",   raw: (d) => d.receita.qtdNovosAnuais },
  val_anuais:      { kind: "money", dir: "up",   raw: (d) => d.receita.valorNovosAnuais },
  qtd_mensais:     { kind: "count", dir: "up",   raw: (d) => d.receita.qtdNovosMensais },
  val_mensais:     { kind: "money", dir: "up",   raw: (d) => d.receita.valorNovosMensais },
  upgrades:        { kind: "count", dir: "up",   raw: (d) => d.receita.upgrades },
  leads:           { kind: "count", dir: "up",   raw: (d) => d.conversao.leadsEntrados },
  fechamentos:     { kind: "count", dir: "up",   raw: (d) => d.conversao.fechamentos },
  close_rate:      { kind: "rate",  dir: "up",   raw: (d) => d.conversao.closeRate },
  acessos:         { kind: "count", dir: "up",   raw: (d) => d.conversao.acessos },
  taxa_pagamento:  { kind: "rate",  dir: "up",   raw: (d) => d.conversao.taxaPagamento },
  perda_pagamento: { kind: "count", dir: "down", raw: (d) => d.conversao.perdaPagamento },
  multiplos:       { kind: "count", dir: "none", raw: (d) => d.conversao.multiplosEntradas },
  reentradas_c:    { kind: "count", dir: "none", raw: (d) => d.conversao.reentradas },
  quicam:          { kind: "count", dir: "down", raw: (d) => d.conversao.quicam },
  inadimplentes_c: { kind: "count", dir: "down", raw: (d) => d.conversao.inadimplentes },
  frt:             { kind: "time",  dir: "down", raw: (d) => d.velocidade.frtP50 },
  second_resp:     { kind: "time",  dir: "down", raw: (d) => d.velocidade.secondRespP50 },
  time_between:    { kind: "time",  dir: "down", raw: (d) => d.velocidade.timeBetweenP50 },
  msgs_fechar:     { kind: "msgs",  dir: "down", raw: (d) => d.velocidade.msgsAteFecharP50 },
  msgs_perdido:    { kind: "msgs",  dir: "none", raw: (d) => d.velocidade.msgsAtePerdidoP50 },
  perdidos_d:      { kind: "count", dir: "down", raw: (d) => d.perda.perdidosDeclarados },
  perdidos_g:      { kind: "count", dir: "down", raw: (d) => d.perda.perdidosGhosting },
  taxa_perda:      { kind: "rate",  dir: "down", raw: (d) => d.perda.taxaPerda },
  reentradas_p:    { kind: "count", dir: "none", raw: (d) => d.perda.reentradas },
  cancelamentos:   { kind: "count", dir: "down", raw: (d) => d.perda.cancelamentos },
};

function toneFor(dir: KpiMeta["dir"], positive: boolean): Delta["tone"] {
  if (dir === "none") return "flat";
  return positive === (dir === "up") ? "good" : "bad";
}

function computeDelta(meta: KpiMeta, cur: number | null, prev: number | null): Delta | null {
  if (meta.compare === false) return null;
  if (cur === null || prev === null) return null;

  if (meta.kind === "rate") {
    const pp = (cur - prev) * 100;
    if (Math.abs(pp) < 0.05) return { text: "0,0pp", tone: "flat" };
    return { text: `${pp > 0 ? "+" : "−"}${Math.abs(pp).toFixed(1).replace(".", ",")}pp`, tone: toneFor(meta.dir, pp > 0) };
  }

  if (prev === 0) {
    if (cur === 0) return { text: "0%", tone: "flat" };
    return { text: "novo", tone: meta.dir === "up" ? "good" : meta.dir === "down" ? "bad" : "flat" };
  }

  const r = (cur - prev) / Math.abs(prev);
  if (Math.abs(r) < 0.005) return { text: "0%", tone: "flat" };
  return { text: `${r > 0 ? "+" : "−"}${Math.abs(r * 100).toFixed(0)}%`, tone: toneFor(meta.dir, r > 0) };
}

const DELTA_HEX: Record<Delta["tone"], string> = {
  good: "#22c55e",
  bad:  "#ef4444",
  flat: "rgba(255,255,255,0.35)",
};

function DeltaBadge({ delta }: { delta: Delta }) {
  const hex = DELTA_HEX[delta.tone];
  const arrow = delta.text.startsWith("+") ? "↑" : delta.text.startsWith("−") ? "↓" : "";
  const body = delta.text.replace(/^[+−]/, "");
  return (
    <span
      className="text-[9.5px] font-semibold tabular-nums px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ color: hex, background: delta.tone === "flat" ? "rgba(255,255,255,0.04)" : `${DELTA_HEX[delta.tone]}1a` }}
      title="vs. período anterior"
    >
      {arrow}{body}
    </span>
  );
}

// ── Time distribution histogram ─────────────────────────────────────────────────

const DIST_LABELS = ["<5m", "5–15m", "15–30m", "30–60m", "1–4h", "4–24h", ">1d"];

function DistBars({ dist, hex }: { dist: number[]; hex: string }) {
  const max = Math.max(...dist, 1);
  return (
    <div className="mt-2">
      <div className="flex items-end gap-[3px]" style={{ height: 24 }}>
        {dist.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            title={`${DIST_LABELS[i]}: ${v}`}
            style={{ height: `${Math.max(6, (v / max) * 100)}%`, background: hex, opacity: v > 0 ? 0.55 : 0.1 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1" style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>
        <span>{DIST_LABELS[0]}</span>
        <span>{DIST_LABELS[DIST_LABELS.length - 1]}</span>
      </div>
    </div>
  );
}

// ── KPI widget ─────────────────────────────────────────────────────────────────

function KpiWidget({ kpi, delta, dist }: { kpi: KpiData; delta?: Delta | null; dist?: number[] }) {
  const hex = ACCENT_HEX[kpi.accent] ?? "rgba(255,255,255,0.75)";
  const hasDual = kpi.p50 !== undefined;
  const showDist = !!dist && dist.some((x) => x > 0);

  return (
    <div className="flex flex-col h-full px-4 py-3.5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="text-[10px] font-medium tracking-wide leading-tight" style={{ color: "rgba(255,255,255,0.42)" }}>
          {kpi.label}
        </div>
        {delta && <DeltaBadge delta={delta} />}
      </div>

      {hasDual ? (
        <div className="flex gap-4 items-end pb-1">
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>p50</div>
            <div className="text-[22px] font-bold tabular-nums" style={{ color: hex }}>{kpi.p50}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>p90</div>
            <div className="text-[18px] font-semibold tabular-nums" style={{ color: `${hex}99` }}>{kpi.p90}</div>
          </div>
        </div>
      ) : (
        <div className="text-[28px] font-bold tabular-nums leading-none flex-1 flex items-center" style={{ color: hex }}>
          {kpi.value}
        </div>
      )}

      {showDist && <DistBars dist={dist!} hex={hex} />}

      {kpi.sub && (
        <div className="text-[10px] mt-auto pt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
          {kpi.sub}
        </div>
      )}
    </div>
  );
}

// ── Planos Mix widget ──────────────────────────────────────────────────────────

function PlanosMixWidget({ r }: { r: ReceitaData }) {
  const total = r.qtdNovosAnuais + r.qtdNovosMensais;
  const annualPct = total > 0 ? r.qtdNovosAnuais / total : 0;
  const monthPct  = total > 0 ? r.qtdNovosMensais / total : 0;
  return (
    <div className="flex flex-col h-full px-4 py-3.5">
      <div className="text-[10px] font-medium tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.42)" }}>
        Mix Anual / Mensal — novos no período
      </div>
      {total === 0 ? (
        <div className="flex-1 flex items-center" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
          Sem novos planos no período
        </div>
      ) : (
        <>
          <div className="flex gap-px h-6 rounded overflow-hidden">
            <div className="h-full transition-all" style={{ width: `${annualPct * 100}%`, background: "#7553ff" }} />
            <div className="h-full transition-all" style={{ width: `${monthPct * 100}%`, background: "#22c55e" }} />
          </div>
          <div className="flex gap-5 mt-3 text-[11px]">
            <div className="flex items-baseline gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#7553ff" }} />
              <span style={{ color: "rgba(255,255,255,0.55)" }}>Anual</span>
              <span className="font-semibold tabular-nums" style={{ color: "#9b7dff" }}>{fmtPct(annualPct)}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>({r.qtdNovosAnuais})</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#22c55e" }} />
              <span style={{ color: "rgba(255,255,255,0.55)" }}>Mensal</span>
              <span className="font-semibold tabular-nums" style={{ color: "#22c55e" }}>{fmtPct(monthPct)}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>({r.qtdNovosMensais})</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Leads por Dia widget ───────────────────────────────────────────────────────

type LeadsViz = "area" | "bar" | "line";

function LeadsDiaWidget({ data, viz }: { data: LeadDia[]; viz: LeadsViz }) {
  const chartData = data.map((d) => ({ ...d, label: fmtDate(d.date) }));
  const tick = { fill: "rgba(255,255,255,0.3)", fontSize: 10 };

  return (
    <div className="flex flex-col h-full px-4 py-3.5">
      <div className="text-[10px] font-medium tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.42)" }}>
        Leads por Dia
      </div>
      <div className="flex-1 min-h-0">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>Sem dados</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {viz === "bar" ? (
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} itemStyle={{ color: "#fafafa" }} labelStyle={{ color: "rgba(255,255,255,0.45)" }} />
                <Bar dataKey="count" fill="#7553ff" radius={[2, 2, 0, 0]} name="Leads" />
              </BarChart>
            ) : viz === "line" ? (
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} itemStyle={{ color: "#fafafa" }} labelStyle={{ color: "rgba(255,255,255,0.45)" }} />
                <Line type="monotone" dataKey="count" stroke="#7553ff" strokeWidth={2} dot={false} name="Leads" />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7553ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7553ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} itemStyle={{ color: "#fafafa" }} labelStyle={{ color: "rgba(255,255,255,0.45)" }} />
                <Area type="monotone" dataKey="count" stroke="#7553ff" strokeWidth={2} fill="url(#gLeads)" name="Leads" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Funil widget ───────────────────────────────────────────────────────────────

function FunilWidget({ c }: { c: ConversaoData }) {
  const stages = [
    { label: "Entrados",    value: c.funnelEntrados,    color: "#7553ff" },
    { label: "Tem conversa",value: c.funnelTemConversa, color: "#3b82f6" },
    { label: "Acesso (billing)", value: c.funnelAcesso, color: "#eab308" },
    { label: "Pagou (active)",   value: c.funnelPagou,  color: "#22c55e" },
  ];
  const max = stages[0].value || 1;
  return (
    <div className="flex flex-col h-full px-4 py-3.5">
      <div className="text-[10px] font-medium tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.42)" }}>
        Funil de Conversão
      </div>
      <div className="space-y-2 flex-1 flex flex-col justify-center">
        {stages.map((s, i) => {
          const pct     = s.value / max;
          const dropPct = i > 0 && stages[i - 1].value > 0 ? 1 - s.value / stages[i - 1].value : 0;
          return (
            <div key={s.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</span>
                <div className="flex items-center gap-2">
                  {i > 0 && dropPct > 0 && <span className="text-[10px]" style={{ color: "#ef444488" }}>−{fmtPct(dropPct)}</span>}
                  <span className="font-semibold tabular-nums" style={{ color: "rgba(255,255,255,0.8)" }}>{fmtNum(s.value)}</span>
                </div>
              </div>
              <div className="h-4 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="h-full rounded transition-all" style={{ width: `${pct * 100}%`, background: s.color, opacity: 0.7 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Custom query result widget ─────────────────────────────────────────────────

function QueryResultWidget({ query, onEdit, vizOverride }: { query: CustomQuery; onEdit?: () => void; vizOverride?: CustomQuery["vizType"] }) {
  const [result, setResult] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const viz = vizOverride ?? query.vizType;

  useEffect(() => {
    setLoading(true);
    setError(null);
    runSelectQuery(query.sql).then((r) => {
      if (r.error) setError(r.error);
      else setResult({ columns: r.columns, rows: r.rows });
      setLoading(false);
    });
  }, [query.sql]);

  const label = (
    <div className="text-[10px] font-medium tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.42)" }}>
      {query.title}
    </div>
  );

  if (loading) return <div className="h-full flex flex-col px-4 py-3.5">{label}<div className="flex-1 flex items-center"><span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>Executando...</span></div></div>;

  if (error) return (
    <div className="h-full flex flex-col px-4 py-3.5">
      {label}
      <div className="rounded p-2.5 text-[11px] font-mono" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>{error}</div>
      {onEdit && <button onClick={onEdit} className="mt-2 text-[11px]" style={{ color: "#9b7dff" }}>Editar query →</button>}
    </div>
  );

  if (!result || result.rows.length === 0) return (
    <div className="h-full flex flex-col px-4 py-3.5">{label}<div className="flex-1 flex items-center text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>Sem resultados</div></div>
  );

  if (viz === "number" && result.rows.length >= 1) {
    return (
      <div className="h-full flex flex-col px-4 py-3.5">
        {label}
        <div className="flex-1 flex items-center">
          <div className="text-[32px] font-bold tabular-nums" style={{ color: "#9b7dff" }}>{String(result.rows[0][0])}</div>
        </div>
        {result.columns[0] && <div className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{result.columns[0]}</div>}
      </div>
    );
  }

  if ((viz === "bar" || viz === "line" || viz === "area") && result.columns.length >= 2) {
    const chartData = result.rows.map((r) => ({ name: String(r[0]), value: Number(r[1]) }));
    const tick = { fill: "rgba(255,255,255,0.3)", fontSize: 10 };
    return (
      <div className="flex flex-col h-full px-4 py-3.5">
        {label}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {viz === "bar" ? (
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} />
                <Bar dataKey="value" fill="#7553ff" radius={[2, 2, 0, 0]} name={result.columns[1]} />
              </BarChart>
            ) : viz === "line" ? (
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} />
                <Line type="monotone" dataKey="value" stroke="#7553ff" strokeWidth={2} dot={false} name={result.columns[1]} />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCustom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7553ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7553ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={tick} axisLine={false} tickLine={false} />
                <YAxis tick={tick} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#7553ff" strokeWidth={2} fill="url(#gCustom)" name={result.columns[1]} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Table
  return (
    <div className="flex flex-col h-full px-4 py-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.42)" }}>{query.title}</div>
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{result.rows.length} linhas</span>
      </div>
      <div className="flex-1 overflow-auto min-h-0" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0" style={{ background: "#151519" }}>
            <tr>{result.columns.map((col) => <th key={col} className="text-left px-2 py-1.5 font-medium" style={{ color: "rgba(255,255,255,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{col}</th>)}</tr>
          </thead>
          <tbody>
            {result.rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {cell === null ? <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span> : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Widget shell ───────────────────────────────────────────────────────────────

function WidgetShell({
  id, editMode, category, onRemove, onEditQuery, children,
  vizOptions, currentViz, onVizChange,
}: {
  id: string;
  editMode: boolean;
  category?: string;
  onRemove: () => void;
  onEditQuery?: () => void;
  children: React.ReactNode;
  vizOptions?: string[];
  currentViz?: string;
  onVizChange?: (v: string) => void;
}) {
  const dot = category ? CATEGORY_DOT[category] : "rgba(255,255,255,0.15)";

  return (
    <div
      className="h-full flex flex-col rounded-xl overflow-hidden relative group"
      style={{
        background: "#151519",
        border: editMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      {/* Category indicator — small dot top-left */}
      <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full opacity-60" style={{ background: dot }} />

      {/* Drag handle (edit mode) */}
      {editMode && (
        <div
          className="drag-handle absolute top-0 left-0 right-0 h-5 flex items-center justify-center gap-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ zIndex: 10, background: "rgba(255,255,255,0.03)" }}
        >
          <svg width="24" height="6" viewBox="0 0 24 6" fill="none">
            {[0, 8, 16].map(x => [0, 4].map(y => <circle key={`${x}-${y}`} cx={x + 4} cy={y + 1} r="1" fill="rgba(255,255,255,0.25)" />))}
          </svg>
        </div>
      )}

      {/* Action buttons (edit mode) */}
      {editMode && (
        <div className="absolute top-1.5 right-5 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEditQuery && (
            <button onClick={(e) => { e.stopPropagation(); onEditQuery(); }} className="w-5 h-5 rounded flex items-center justify-center text-[11px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }} title="Editar SQL">✏</button>
          )}
          {vizOptions && onVizChange && (
            <div className="flex gap-0.5">
              {vizOptions.map(v => (
                <button key={v} onClick={(e) => { e.stopPropagation(); onVizChange(v); }}
                  className="w-5 h-5 rounded text-[9px] font-medium transition-all"
                  style={{ background: currentViz === v ? "rgba(117,83,255,0.3)" : "rgba(255,255,255,0.06)", color: currentViz === v ? "#c4b1ff" : "rgba(255,255,255,0.4)" }}
                  title={v}
                >{v === "area" ? "∿" : v === "bar" ? "▐" : v === "line" ? "—" : "⊞"}</button>
              ))}
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="w-5 h-5 rounded flex items-center justify-center text-[12px]" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }} title="Remover">×</button>
        </div>
      )}

      {children}
    </div>
  );
}

// ── Query modal ────────────────────────────────────────────────────────────────

function QueryModal({ initial, onSave, onClose }: { initial?: CustomQuery; onSave: (q: CustomQuery) => void; onClose: () => void }) {
  const [title, setTitle]     = useState(initial?.title   ?? "Nova consulta");
  const [sql, setSql]         = useState(initial?.sql     ?? "SELECT\n  \nFROM leads\nLIMIT 100");
  const [vizType, setVizType] = useState<CustomQuery["vizType"]>(initial?.vizType ?? "table");
  const [result, setResult]   = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  async function execute() {
    setRunning(true); setRunError(null);
    const r = await runSelectQuery(sql);
    if (r.error) { setRunError(r.error); setResult(null); }
    else setResult({ columns: r.columns, rows: r.rows });
    setRunning(false);
  }

  const VIZ_OPTIONS: { t: CustomQuery["vizType"]; label: string }[] = [
    { t: "table",  label: "⊞ Tabela" },
    { t: "number", label: "# Número" },
    { t: "bar",    label: "▐ Barras" },
    { t: "line",   label: "— Linha" },
    { t: "area",   label: "∿ Área" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rounded-xl overflow-hidden flex flex-col" style={{ width: "min(92vw, 920px)", maxHeight: "88vh", background: "#151519", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="text-[14px] font-semibold bg-transparent outline-none flex-1 mr-4" style={{ color: "#fafafa" }} placeholder="Título da consulta" />
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded" style={{ color: "rgba(255,255,255,0.35)", fontSize: 18, background: "rgba(255,255,255,0.04)" }}>×</button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* SQL Editor */}
          <div className="flex flex-col flex-1 min-w-0" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 pt-3 pb-2 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>SQL — apenas SELECT</span>
            </div>
            <textarea
              value={sql} onChange={(e) => setSql(e.target.value)}
              className="flex-1 resize-none outline-none font-mono text-[12px] px-4 py-3"
              style={{ background: "transparent", color: "#c4b1ff", lineHeight: 1.75 }}
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Tab") { e.preventDefault(); const s = e.currentTarget.selectionStart; const end = e.currentTarget.selectionEnd; setSql(sql.substring(0, s) + "  " + sql.substring(end)); setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; }); }
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") execute();
              }}
            />
            <div className="px-4 py-2.5 flex gap-2 items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={execute} disabled={running} className="px-4 py-1.5 rounded-lg text-[12px] font-semibold"
                style={{ background: running ? "rgba(117,83,255,0.3)" : "#7553ff", color: "#fff", opacity: running ? 0.7 : 1 }}>
                {running ? "Executando..." : "▶ Executar  ⌘↵"}
              </button>
              {result && <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{result.rows.length} linhas · {result.columns.length} colunas</span>}
            </div>
          </div>

          {/* Preview */}
          <div className="w-[340px] flex flex-col">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-[9px] uppercase tracking-widest font-semibold mr-auto" style={{ color: "rgba(255,255,255,0.25)" }}>Visualização</span>
              <div className="flex gap-1">
                {VIZ_OPTIONS.map(({ t, label }) => (
                  <button key={t} onClick={() => setVizType(t)}
                    className="px-2 py-0.5 rounded text-[9.5px] font-medium"
                    style={{ background: vizType === t ? "rgba(117,83,255,0.2)" : "rgba(255,255,255,0.04)", color: vizType === t ? "#c4b1ff" : "rgba(255,255,255,0.4)", border: vizType === t ? "1px solid rgba(117,83,255,0.35)" : "1px solid transparent" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-auto min-h-0 p-3">
              {runError && <div className="rounded p-3 text-[11px] font-mono" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>{runError}</div>}
              {result && !runError && (
                vizType === "table" ? (
                  <table className="w-full text-[11px]">
                    <thead><tr>{result.columns.map((c) => <th key={c} className="text-left px-2 py-1 font-medium" style={{ color: "rgba(255,255,255,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{c}</th>)}</tr></thead>
                    <tbody>{result.rows.slice(0, 20).map((row, ri) => <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.map((cell, ci) => <td key={ci} className="px-2 py-1 font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>{cell === null ? "—" : String(cell)}</td>)}</tr>)}</tbody>
                  </table>
                ) : vizType === "number" ? (
                  <div className="h-24 flex items-center justify-center"><div className="text-[32px] font-bold tabular-nums" style={{ color: "#9b7dff" }}>{String(result.rows[0]?.[0] ?? "—")}</div></div>
                ) : (
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer>
                      <BarChart data={result.rows.slice(0, 30).map((r) => ({ name: String(r[0]), value: Number(r[1]) }))} margin={{ left: -12, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 11 }} />
                        <Bar dataKey="value" fill="#7553ff" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
              {!result && !runError && <div className="h-28 flex items-center justify-center text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>Execute a query para ver um preview</div>}
            </div>
            <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={() => { onSave({ id: initial?.id ?? `query_${Date.now()}`, title, sql, vizType }); }}
                className="w-full py-2 rounded-lg text-[12px] font-semibold"
                style={{ background: "rgba(117,83,255,0.15)", border: "1px solid rgba(117,83,255,0.35)", color: "#c4b1ff" }}>
                Adicionar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add widget panel ───────────────────────────────────────────────────────────

function AddWidgetPanel({ activeIds, onAdd, onNewQuery, onClose }: { activeIds: string[]; onAdd: (id: string) => void; onNewQuery: () => void; onClose: () => void; }) {
  const cats = ["receita", "conversao", "velocidade", "perda"] as const;
  const catLabel = { receita: "Receita", conversao: "Conversão", velocidade: "Velocidade", perda: "Perda" } as const;
  const inactive = WIDGET_CATALOG.filter((w) => !activeIds.includes(w.id));

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-xl overflow-hidden w-full max-w-[500px] max-h-[80vh] flex flex-col mx-4"
        style={{ background: "#151519", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[14px] font-semibold" style={{ color: "#fafafa" }}>Adicionar Widget</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded text-[18px]" style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)" }}>×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          <button onClick={() => { onClose(); onNewQuery(); }}
            className="w-full rounded-lg p-4 flex items-center gap-3 text-left"
            style={{ background: "rgba(117,83,255,0.08)", border: "1px solid rgba(117,83,255,0.25)" }}>
            <span className="text-[20px]">⌥</span>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#c4b1ff" }}>SQL Personalizado</div>
              <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Escreva uma query SELECT e visualize como tabela, número ou gráfico</div>
            </div>
          </button>
          {cats.map((cat) => {
            const items = inactive.filter((w) => w.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_DOT[cat] }} />
                  <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>{catLabel[cat]}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((w) => (
                    <button key={w.id} onClick={() => { onAdd(w.id); onClose(); }}
                      className="rounded-lg px-3 py-2.5 text-left text-[12px] font-medium"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}>
                      {w.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {inactive.length === 0 && <div className="py-8 text-center text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>Todos os widgets estão no dashboard</div>}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DashboardClient({
  filters, receita, conversao, velocidade, perda, leadsPorDia, filterOptions, prev, dataStamp,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshVendas();   // invalida o cache (única ida ao banco)
      router.refresh();        // re-renderiza com os dados frescos
    } finally {
      setRefreshing(false);
    }
  }

  const fmtStamp = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      });
    } catch { return "—"; }
  };

  const data: DashboardData = { receita, conversao, velocidade, perda, leadsPorDia, filterOptions };
  const prevData: DashboardData | null = prev
    ? { ...prev, leadsPorDia: [], filterOptions }
    : null;

  const [layout, setLayout]               = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [customQueries, setCustomQueries] = useState<CustomQuery[]>([]);
  const [widgetViz, setWidgetViz]         = useState<Record<string, string>>({});
  const [editMode, setEditMode]           = useState(false);
  const [showAdd, setShowAdd]             = useState(false);
  const [showQuery, setShowQuery]         = useState<CustomQuery | null | "new">(null);
  const [mounted, setMounted]             = useState(false);
  const [gridWidth, setGridWidth]         = useState(1200);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStart, setCustomStart]     = useState(filters.start);
  const [customEnd, setCustomEnd]         = useState(filters.end);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setGridWidth(e.contentRect.width));
    ro.observe(el);
    setGridWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    try {
      const sl = localStorage.getItem("vendas-layout-v6");
      if (sl) setLayout(JSON.parse(sl));
      const sq = localStorage.getItem("vendas-queries-v1");
      if (sq) setCustomQueries(JSON.parse(sq));
      const sv = localStorage.getItem("vendas-viz-v1");
      if (sv) setWidgetViz(JSON.parse(sv));
    } catch {}
  }, []);

  const persistLayout = useCallback((l: LayoutItem[]) => {
    try { localStorage.setItem("vendas-layout-v6", JSON.stringify(l)); } catch {}
    setLayout(l);
  }, []);

  const persistQueries = useCallback((q: CustomQuery[]) => {
    try { localStorage.setItem("vendas-queries-v1", JSON.stringify(q)); } catch {}
    setCustomQueries(q);
  }, []);

  const persistViz = useCallback((v: Record<string, string>) => {
    try { localStorage.setItem("vendas-viz-v1", JSON.stringify(v)); } catch {}
    setWidgetViz(v);
  }, []);

  function navigate(next: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => { if (!v) params.delete(k); else params.set(k, v); });
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPreset(days: number) {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    setShowCustomDate(false);
    navigate({ start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] });
  }

  const activeIds = layout.map((l) => l.i);

  const detectPreset = () => {
    const diff = Math.round((new Date(filters.end).getTime() - new Date(filters.start).getTime()) / 86400000);
    return [1, 7, 30, 90].includes(diff) ? diff : null;
  };

  const activePreset = detectPreset();

  function removeWidget(id: string) {
    persistLayout(layout.filter((l) => l.i !== id));
    if (id.startsWith("query_")) persistQueries(customQueries.filter((q) => q.id !== id));
  }

  function addWidget(id: string) {
    const def = WIDGET_CATALOG.find((w) => w.id === id);
    if (!def) return;
    const maxY = Math.max(0, ...layout.map((l) => l.y + l.h));
    persistLayout([...layout, { i: id, x: 0, y: maxY, w: def.w, h: def.h } as LayoutItem]);
  }

  function saveQuery(q: CustomQuery) {
    const next = customQueries.filter((c) => c.id !== q.id).concat(q);
    persistQueries(next);
    if (!activeIds.includes(q.id)) {
      const maxY = Math.max(0, ...layout.map((l) => l.y + l.h));
      persistLayout([...layout, { i: q.id, x: 0, y: maxY, w: 8, h: 4 } as LayoutItem]);
    }
    setShowQuery(null);
  }

  function renderContent(id: string) {
    const viz = widgetViz[id];

    if (id === "leads_dia")  return <LeadsDiaWidget data={leadsPorDia} viz={(viz as LeadsViz) ?? "area"} />;
    if (id === "funil")      return <FunilWidget c={conversao} />;
    if (id === "planos_mix") return <PlanosMixWidget r={receita} />;

    if (id.startsWith("query_")) {
      const q = customQueries.find((c) => c.id === id);
      if (!q) return <div className="h-full flex items-center justify-center text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>Query não encontrada</div>;
      return <QueryResultWidget query={q} onEdit={editMode ? () => setShowQuery(q) : undefined} vizOverride={viz as CustomQuery["vizType"]} />;
    }

    const kpi = resolveKpi(id, data);
    if (kpi) {
      const meta = KPI_META[id];
      const delta = meta && prevData ? computeDelta(meta, meta.raw(data), meta.raw(prevData)) : null;
      const dist =
        id === "frt"          ? velocidade.frtDist
        : id === "second_resp" ? velocidade.secondDist
        : id === "time_between" ? velocidade.betweenDist
        : undefined;
      return <KpiWidget kpi={kpi} delta={delta} dist={dist} />;
    }
    return null;
  }

  function getVizOptions(id: string): string[] | undefined {
    if (id === "leads_dia") return ["area", "bar", "line"];
    if (id.startsWith("query_")) return ["table", "number", "bar", "line", "area"];
    return undefined;
  }

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-[12px]" style={{ color: "rgba(255,255,255,0.2)" }}>Carregando dashboard...</div>;
  }

  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight" style={{ color: "#fafafa" }}>Engenharia de Vendas</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>{filters.start} → {filters.end} · variação vs. período anterior · atualizado {fmtStamp(dataStamp)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={handleRefresh} disabled={refreshing} className="px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5"
            style={{ background: refreshing ? "rgba(117,83,255,0.1)" : "rgba(117,83,255,0.15)", border: "1px solid rgba(117,83,255,0.4)", color: "#c4b1ff", opacity: refreshing ? 0.7 : 1, cursor: refreshing ? "default" : "pointer" }}
            title="Consulta o banco e atualiza os dados (única ação que usa o banco)">
            <span style={{ display: "inline-block", animation: refreshing ? "spin 0.8s linear infinite" : "none" }}>↻</span>
            {refreshing ? "Atualizando..." : "Atualizar dados"}
          </button>
          {editMode && (
            <>
              <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}>+ Widget</button>
              <button onClick={() => persistLayout(DEFAULT_LAYOUT)} className="px-3 py-1.5 rounded-lg text-[11px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>Resetar</button>
            </>
          )}
          <button onClick={() => setEditMode(!editMode)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{ background: editMode ? "rgba(117,83,255,0.15)" : "rgba(255,255,255,0.04)", border: editMode ? "1px solid rgba(117,83,255,0.4)" : "1px solid rgba(255,255,255,0.08)", color: editMode ? "#c4b1ff" : "rgba(255,255,255,0.45)" }}>
            {editMode ? "✓ Concluído" : "✏ Editar"}
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="rounded-lg mb-5 px-4 py-3 space-y-2.5" style={{ background: "#111115", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[9px] uppercase tracking-widest font-semibold mr-1" style={{ color: "rgba(255,255,255,0.22)" }}>Período</span>
          {([{ l: "Hoje", d: 1 }, { l: "7d", d: 7 }, { l: "30d", d: 30 }, { l: "90d", d: 90 }] as const).map(({ l, d }) => (
            <button key={d} onClick={() => setPreset(d)} className="px-2.5 py-1 rounded text-[11px] font-medium"
              style={{ background: activePreset === d ? "rgba(117,83,255,0.15)" : "transparent", border: activePreset === d ? "1px solid rgba(117,83,255,0.4)" : "1px solid rgba(255,255,255,0.07)", color: activePreset === d ? "#c4b1ff" : "rgba(255,255,255,0.45)" }}>
              {l}
            </button>
          ))}
          <button onClick={() => setShowCustomDate(!showCustomDate)} className="px-2.5 py-1 rounded text-[11px] font-medium"
            style={{ background: !activePreset ? "rgba(117,83,255,0.15)" : "transparent", border: !activePreset ? "1px solid rgba(117,83,255,0.4)" : "1px solid rgba(255,255,255,0.07)", color: !activePreset ? "#c4b1ff" : "rgba(255,255,255,0.45)" }}>
            Personalizado
          </button>

          {filterOptions.sources.length > 0 && (
            <>
              <div className="w-px h-3.5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.22)" }}>Origem</span>
              <select value={filters.source ?? ""} onChange={(e) => navigate({ source: e.target.value || null })}
                className="rounded px-2 py-1 text-[11px] outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}>
                <option value="">Todas</option>
                {filterOptions.sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}

          {filterOptions.landingVariants.length > 0 && (
            <select value={filters.landingVariant ?? ""} onChange={(e) => navigate({ lv: e.target.value || null })}
              className="rounded px-2 py-1 text-[11px] outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}>
              <option value="">Landing: todas</option>
              {filterOptions.landingVariants.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          )}

          {filterOptions.pricingVariants.length > 0 && (
            <select value={filters.pricingVariant ?? ""} onChange={(e) => navigate({ pv: e.target.value || null })}
              className="rounded px-2 py-1 text-[11px] outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}>
              <option value="">Preço: todos</option>
              {filterOptions.pricingVariants.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          )}
        </div>

        {showCustomDate && (
          <div className="flex flex-wrap gap-2 items-center pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded px-3 py-1.5 text-[11px] outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#fafafa", colorScheme: "dark" }} />
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>→</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded px-3 py-1.5 text-[11px] outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#fafafa", colorScheme: "dark" }} />
            <button onClick={() => { setShowCustomDate(false); navigate({ start: customStart, end: customEnd }); }} className="px-3 py-1.5 rounded text-[11px] font-semibold" style={{ background: "#7553ff", color: "#fff" }}>Aplicar</button>
          </div>
        )}
      </div>

      {/* ── Edit mode hint ── */}
      {editMode && (
        <div className="rounded-lg px-4 py-2 mb-4 text-[11px]" style={{ background: "rgba(117,83,255,0.06)", border: "1px solid rgba(117,83,255,0.15)", color: "rgba(255,255,255,0.45)" }}>
          Arraste para mover · Redimensione pelo canto inferior direito · Passe o cursor sobre o card para ações
        </div>
      )}

      {/* ── Grid ── */}
      <div ref={containerRef}>
        <ResponsiveGridLayout
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={80}
          width={gridWidth}
          margin={[8, 8]}
          dragConfig={{ enabled: editMode, handle: ".drag-handle" }}
          resizeConfig={{ enabled: editMode, handles: ["se"] }}
          onLayoutChange={(_: Layout, all: ResponsiveLayouts) => {
            const lg = all.lg;
            if (lg) persistLayout([...lg] as LayoutItem[]);
          }}
        >
          {layout.map((item) => {
            const content = renderContent(item.i);
            if (!content) return null;
            const def = WIDGET_CATALOG.find((w) => w.id === item.i);
            const category = def?.category ?? (item.i.startsWith("query_") ? "conversao" : undefined);
            const vizOptions = getVizOptions(item.i);

            return (
              <div key={item.i} style={{ height: "100%" }}>
                <WidgetShell
                  id={item.i}
                  editMode={editMode}
                  category={category}
                  onRemove={() => removeWidget(item.i)}
                  onEditQuery={item.i.startsWith("query_") ? () => { const q = customQueries.find((c) => c.id === item.i); if (q) setShowQuery(q); } : undefined}
                  vizOptions={vizOptions}
                  currentViz={widgetViz[item.i]}
                  onVizChange={(v) => persistViz({ ...widgetViz, [item.i]: v })}
                >
                  {content}
                </WidgetShell>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {/* ── Modals ── */}
      {showAdd && <AddWidgetPanel activeIds={activeIds} onAdd={addWidget} onNewQuery={() => setShowQuery("new")} onClose={() => setShowAdd(false)} />}
      {showQuery !== null && <QueryModal initial={showQuery === "new" ? undefined : showQuery} onSave={saveQuery} onClose={() => setShowQuery(null)} />}
    </div>
  );
}
