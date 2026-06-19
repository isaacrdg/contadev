"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ResponsiveGridLayout } from "react-grid-layout";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { runSelectQuery } from "./actions";
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

interface Props extends DashboardData {
  filters: VendasFilters;
}

export interface CustomQuery {
  id: string;
  title: string;
  sql: string;
  vizType: "table" | "number" | "bar" | "line";
}

// ── Widget catalog ─────────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
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
  { id: "mrr",          title: "MRR Atual",              category: "receita",    w: 3, h: 2 },
  { id: "valor_adq",    title: "Valor Adquirido",         category: "receita",    w: 3, h: 2 },
  { id: "pagou_pct",    title: "% Assinou → Pagou",       category: "receita",    w: 3, h: 2 },
  { id: "inadimplentes",title: "Inadimplentes",           category: "receita",    w: 3, h: 2 },
  { id: "qtd_anuais",   title: "Planos Anuais",           category: "receita",    w: 3, h: 2 },
  { id: "val_anuais",   title: "Valor Anual (total)",     category: "receita",    w: 3, h: 2 },
  { id: "qtd_mensais",  title: "Planos Mensais",          category: "receita",    w: 3, h: 2 },
  { id: "val_mensais",  title: "Valor Mensal (total)",    category: "receita",    w: 3, h: 2 },
  { id: "planos_mix",   title: "Mix Anual / Mensal",      category: "receita",    w: 6, h: 2 },
  { id: "leads",        title: "Leads Entrados",          category: "conversao",  w: 3, h: 2 },
  { id: "fechamentos",  title: "Fechamentos",             category: "conversao",  w: 3, h: 2 },
  { id: "close_rate",   title: "Close Rate",              category: "conversao",  w: 3, h: 2 },
  { id: "multiplos",    title: "Múltiplas Entradas",      category: "conversao",  w: 3, h: 2 },
  { id: "reentradas_c", title: "Reentradas no Funil",     category: "conversao",  w: 3, h: 2 },
  { id: "quicam",       title: "Clientes que Quicam",     category: "conversao",  w: 3, h: 2 },
  { id: "pageviews_nd", title: "% Page Views → Leads",    category: "conversao",  w: 3, h: 2 },
  { id: "leads_dia",    title: "Leads por Dia",           category: "conversao",  w: 8, h: 4 },
  { id: "funil",        title: "Funil de Conversão",      category: "conversao",  w: 4, h: 4 },
  { id: "frt",          title: "FRT — 1ª Resposta",       category: "velocidade", w: 4, h: 2 },
  { id: "second_resp",  title: "2ª Resposta Humana",      category: "velocidade", w: 4, h: 2 },
  { id: "time_between", title: "Entre Respostas",         category: "velocidade", w: 4, h: 2 },
  { id: "msgs_fechar",  title: "Msgs até Fechamento",     category: "velocidade", w: 3, h: 2 },
  { id: "msgs_perdido", title: "Msgs até Perdido",        category: "velocidade", w: 3, h: 2 },
  { id: "perdidos_d",   title: "Perdidos Declarados",     category: "perda",      w: 3, h: 2 },
  { id: "perdidos_g",   title: "Perdidos (Ghosting 7d)",  category: "perda",      w: 3, h: 2 },
  { id: "taxa_perda",   title: "Taxa de Perda",           category: "perda",      w: 3, h: 2 },
  { id: "reentradas_p", title: "Reentradas pós-Perda",    category: "perda",      w: 3, h: 2 },
];

const DEFAULT_LAYOUT = [
  // Row 0 — Receita KPIs
  { i: "mrr",           x: 0,  y: 0,  w: 3, h: 2 },
  { i: "valor_adq",     x: 3,  y: 0,  w: 3, h: 2 },
  { i: "pagou_pct",     x: 6,  y: 0,  w: 3, h: 2 },
  { i: "inadimplentes", x: 9,  y: 0,  w: 3, h: 2 },
  // Row 2 — Plan breakdown
  { i: "planos_mix",    x: 0,  y: 2,  w: 6, h: 2 },
  { i: "qtd_anuais",    x: 6,  y: 2,  w: 2, h: 2 },
  { i: "val_anuais",    x: 8,  y: 2,  w: 2, h: 2 },
  { i: "qtd_mensais",   x: 10, y: 2,  w: 1, h: 2 },
  { i: "val_mensais",   x: 11, y: 2,  w: 1, h: 2 },
  // Row 4 — Conversão KPIs
  { i: "leads",         x: 0,  y: 4,  w: 3, h: 2 },
  { i: "fechamentos",   x: 3,  y: 4,  w: 3, h: 2 },
  { i: "close_rate",    x: 6,  y: 4,  w: 3, h: 2 },
  { i: "multiplos",     x: 9,  y: 4,  w: 3, h: 2 },
  // Row 6 — Conversão KPIs 2
  { i: "reentradas_c",  x: 0,  y: 6,  w: 3, h: 2 },
  { i: "quicam",        x: 3,  y: 6,  w: 3, h: 2 },
  { i: "pageviews_nd",  x: 6,  y: 6,  w: 3, h: 2 },
  // Row 8 — Charts
  { i: "leads_dia",     x: 0,  y: 8,  w: 8, h: 4 },
  { i: "funil",         x: 8,  y: 8,  w: 4, h: 4 },
  // Row 12 — Velocidade
  { i: "frt",           x: 0,  y: 12, w: 4, h: 2 },
  { i: "second_resp",   x: 4,  y: 12, w: 4, h: 2 },
  { i: "time_between",  x: 8,  y: 12, w: 4, h: 2 },
  { i: "msgs_fechar",   x: 0,  y: 14, w: 3, h: 2 },
  { i: "msgs_perdido",  x: 3,  y: 14, w: 3, h: 2 },
  // Row 16 — Perda
  { i: "perdidos_d",    x: 0,  y: 16, w: 3, h: 2 },
  { i: "perdidos_g",    x: 3,  y: 16, w: 3, h: 2 },
  { i: "taxa_perda",    x: 6,  y: 16, w: 3, h: 2 },
  { i: "reentradas_p",  x: 9,  y: 16, w: 3, h: 2 },
];

// ── Formatters ─────────────────────────────────────────────────────────────────

const fmtBRL = (v: number) =>
  v === 0
    ? "R$ 0"
    : v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `R$ ${(v / 1_000).toFixed(1)}k`
    : `R$ ${Math.round(v)}`;

const fmtNum = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(1)}k`
    : String(Math.round(v));

const fmtPct = (r: number) => `${(r * 100).toFixed(1)}%`;

const fmtMin = (min: number | null): string => {
  if (min === null) return "—";
  const m = Math.round(min);
  if (m < 60) return `${m}min`;
  if (m < 1440) return `${(m / 60).toFixed(1)}h`;
  return `${(m / 1440).toFixed(1)}d`;
};

const fmtMsgs = (v: number | null) => (v === null ? "—" : `${Math.round(v)} msgs`);

const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

// ── Widget data resolver ───────────────────────────────────────────────────────

interface KpiData {
  value: string;
  label: string;
  sub?: string;
  accent: "purple" | "green" | "red" | "blue" | "muted" | "disabled";
  p50?: string;
  p90?: string;
}

function resolveKpi(id: string, d: DashboardData): KpiData | null {
  const { receita: r, conversao: c, velocidade: v, perda: p } = d;
  const map: Record<string, () => KpiData> = {
    mrr:          () => ({ value: fmtBRL(r.mrr),                  label: "MRR Atual",              sub: "assinaturas ativas",       accent: "purple" }),
    valor_adq:    () => ({ value: fmtBRL(r.valorAdquirido),        label: "Valor Adquirido",         sub: "pagamentos no período",    accent: "green" }),
    pagou_pct:    () => ({ value: r.assinou > 0 ? fmtPct(r.pagou / r.assinou) : "—", label: "% Assinou → Pagou", sub: `${fmtNum(r.assinou)} assinaram`, accent: r.assinou > 0 && r.pagou / r.assinou > 0.7 ? "green" : "red" }),
    inadimplentes:() => ({ value: fmtNum(c.inadimplentes),         label: "Inadimplentes",           sub: "assinou, não pagou",       accent: c.inadimplentes > 0 ? "red" : "muted" }),
    qtd_anuais:   () => ({ value: fmtNum(r.qtdAnuais),             label: "Planos Anuais",           sub: fmtBRL(r.valorAnuais),      accent: "purple" }),
    val_anuais:   () => ({ value: fmtBRL(r.valorAnuais),           label: "Valor Anual",             sub: `${r.qtdAnuais} contratos`, accent: "muted" }),
    qtd_mensais:  () => ({ value: fmtNum(r.qtdMensais),            label: "Planos Mensais",          sub: fmtBRL(r.valorMensais),     accent: "muted" }),
    val_mensais:  () => ({ value: fmtBRL(r.valorMensais),          label: "Valor Mensal",            sub: `${r.qtdMensais} contratos`,accent: "muted" }),
    leads:        () => ({ value: fmtNum(c.leadsEntrados),         label: "Leads Entrados",          sub: "no período",               accent: "purple" }),
    fechamentos:  () => ({ value: fmtNum(c.fechamentos),           label: "Fechamentos",             sub: "has_billing = true",       accent: "green" }),
    close_rate:   () => ({ value: fmtPct(c.closeRate),             label: "Close Rate",              sub: `${c.fechamentos}/${c.leadsEntrados}`, accent: c.closeRate > 0.2 ? "green" : "red" }),
    multiplos:    () => ({ value: fmtNum(c.multiplosEntradas),     label: "Múltiplas Entradas",      sub: "leads com 2+ forms",       accent: "muted" }),
    reentradas_c: () => ({ value: fmtNum(c.reentradas),            label: "Reentradas no Funil",     sub: "perdido → novo form",      accent: c.reentradas > 0 ? "green" : "muted" }),
    quicam:       () => ({ value: fmtNum(c.quicam),                label: "Clientes que Quicam",     sub: "<15 dias de assinatura",   accent: c.quicam > 0 ? "red" : "muted" }),
    pageviews_nd: () => ({ value: "—",                             label: "% Page Views → Leads",    sub: "Fonte: PostHog (não aqui)", accent: "disabled" }),
    frt:          () => ({ value: fmtMin(v.frtP50),                label: "FRT — 1ª Resposta",       sub: "p50 (mediana)",            accent: "blue", p50: fmtMin(v.frtP50), p90: fmtMin(v.frtP90) }),
    second_resp:  () => ({ value: fmtMin(v.secondRespP50),         label: "2ª Resposta Humana",      sub: "p50 (mediana)",            accent: "blue", p50: fmtMin(v.secondRespP50), p90: fmtMin(v.secondRespP90) }),
    time_between: () => ({ value: fmtMin(v.timeBetweenP50),        label: "Entre Respostas",         sub: "p50 (mediana)",            accent: "blue", p50: fmtMin(v.timeBetweenP50), p90: fmtMin(v.timeBetweenP90) }),
    msgs_fechar:  () => ({ value: fmtMsgs(v.msgsAteFecharP50),    label: "Msgs até Fechamento",     sub: "p50 — leads que pagaram",  accent: "green" }),
    msgs_perdido: () => ({ value: fmtMsgs(v.msgsAtePerdidoP50),   label: "Msgs até Perdido",        sub: "p50 — leads perdidos",     accent: "red" }),
    perdidos_d:   () => ({ value: fmtNum(p.perdidosDeclarados),    label: "Perdidos Declarados",     sub: "lead_losses no período",   accent: p.perdidosDeclarados > 0 ? "red" : "muted" }),
    perdidos_g:   () => ({ value: fmtNum(p.perdidosGhosting),      label: "Perdidos (Ghosting)",     sub: "sem msg há 7d, sem billing",accent: p.perdidosGhosting > 0 ? "red" : "muted" }),
    taxa_perda:   () => ({ value: fmtPct(p.taxaPerda),             label: "Taxa de Perda",           sub: "(decl + ghosting) / leads",accent: p.taxaPerda > 0.4 ? "red" : p.taxaPerda > 0.2 ? "muted" : "green" }),
    reentradas_p: () => ({ value: fmtNum(p.reentradas),            label: "Reentradas pós-Perda",    sub: "perdido → voltou",         accent: p.reentradas > 0 ? "green" : "muted" }),
  };
  return map[id]?.() ?? null;
}

// ── Individual widget renders ──────────────────────────────────────────────────

const ACCENT_HEX: Record<string, string> = {
  purple: "#8f6fff",
  green:  "#22c55e",
  red:    "#ef4444",
  blue:   "#3b82f6",
  muted:  "rgba(255,255,255,0.55)",
  disabled: "rgba(255,255,255,0.2)",
};

const ACCENT_RGB: Record<string, string> = {
  purple: "143,111,255",
  green:  "34,197,94",
  red:    "239,68,68",
  blue:   "59,130,246",
  muted:  "255,255,255",
  disabled: "255,255,255",
};

function KpiWidget({ kpi, big }: { kpi: KpiData; big?: boolean }) {
  const rgb = ACCENT_RGB[kpi.accent] ?? "255,255,255";
  const hex = ACCENT_HEX[kpi.accent] ?? "#fafafa";
  const isDisabled = kpi.accent === "disabled";
  const hasDual = kpi.p50 !== undefined;

  return (
    <div className="flex flex-col h-full p-4">
      <div
        className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-2"
        style={{ color: "rgba(255,255,255,0.38)" }}
      >
        {kpi.label}
      </div>

      {hasDual ? (
        <div className="flex gap-3 flex-1 items-end">
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>p50</div>
            <div className={`font-bold ${big ? "text-[28px]" : "text-[22px]"}`} style={{ color: hex }}>
              {kpi.p50}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>p90</div>
            <div className={`font-bold ${big ? "text-[22px]" : "text-[18px]"}`} style={{ color: `rgba(${rgb},0.65)` }}>
              {kpi.p90}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`font-bold leading-none flex-1 flex items-center ${big ? "text-[38px]" : "text-[26px]"}`}
          style={{ color: isDisabled ? "rgba(255,255,255,0.15)" : hex }}
        >
          {kpi.value}
        </div>
      )}

      {kpi.sub && (
        <div className="text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
          {kpi.sub}
        </div>
      )}
    </div>
  );
}

function PlanosMixWidget({ r }: { r: ReceitaData }) {
  const total = r.qtdAnuais + r.qtdMensais;
  const annualPct = total > 0 ? r.qtdAnuais / total : 0;
  const monthPct  = total > 0 ? r.qtdMensais / total : 0;
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
        Mix Anual / Mensal
      </div>
      {total === 0 ? (
        <div className="flex-1 flex items-center" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Sem planos no período</div>
      ) : (
        <>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden flex-1 max-h-8">
            <div className="h-full transition-all" style={{ width: `${annualPct * 100}%`, background: "linear-gradient(90deg,#7553ff,#8f6fff)" }} />
            <div className="h-full transition-all" style={{ width: `${monthPct * 100}%`, background: "linear-gradient(90deg,#22c55e80,#22c55e40)" }} />
          </div>
          <div className="flex gap-4 mt-3 text-[11px]">
            <div>
              <span style={{ color: "#8f6fff" }}>■ </span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Anual</span>
              <span className="ml-1 font-bold" style={{ color: "#8f6fff" }}>{fmtPct(annualPct)}</span>
              <span className="ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>({r.qtdAnuais})</span>
            </div>
            <div>
              <span style={{ color: "#22c55e" }}>■ </span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>Mensal</span>
              <span className="ml-1 font-bold" style={{ color: "#22c55e" }}>{fmtPct(monthPct)}</span>
              <span className="ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>({r.qtdMensais})</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LeadsDiaWidget({ data }: { data: LeadDia[] }) {
  const chartData = data.map((d) => ({ ...d, label: fmtDate(d.date) }));
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
        Leads por Dia
      </div>
      <div className="flex-1 min-h-0">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Sem dados</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7553ff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7553ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0e0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: "#fafafa" }}
                labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <Area type="monotone" dataKey="count" stroke="#7553ff" strokeWidth={2} fill="url(#gLeads)" name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function FunilWidget({ c }: { c: ConversaoData }) {
  const stages = [
    { label: "Leads entrados", value: c.funnelEntrados,    color: "#7553ff" },
    { label: "Tem conversa",   value: c.funnelTemConversa, color: "#3b82f6" },
    { label: "Tem contrato",   value: c.funnelTemContrato, color: "#eab308" },
    { label: "Billing",        value: c.funnelTemBilling,  color: "#22c55e" },
  ];
  const max = stages[0].value || 1;
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
        Funil de Conversão
      </div>
      <div className="space-y-2.5 flex-1">
        {stages.map((s, i) => {
          const pct = s.value / max;
          const dropPct = i > 0 && stages[i - 1].value > 0 ? 1 - s.value / stages[i - 1].value : 0;
          return (
            <div key={s.label}>
              <div className="flex justify-between text-[10.5px] mb-1">
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{fmtNum(s.value)}</span>
              </div>
              <div className="h-5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="h-full rounded transition-all" style={{ width: `${pct * 100}%`, background: s.color + "99" }} />
              </div>
              {i > 0 && dropPct > 0 && (
                <div className="text-[9px] text-right mt-0.5" style={{ color: "#ef444488" }}>−{fmtPct(dropPct)}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueryResultWidget({ query, onEdit }: { query: CustomQuery; onEdit?: () => void }) {
  const [result, setResult] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    runSelectQuery(query.sql).then((r) => {
      if (r.error) setError(r.error);
      else setResult({ columns: r.columns, rows: r.rows });
      setLoading(false);
    });
  }, [query.sql]);

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>{query.title}</div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>Executando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>{query.title}</div>
        <div className="flex-1 overflow-auto">
          <div className="rounded-lg p-3 text-[11px] font-mono" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
            {error}
          </div>
          {onEdit && (
            <button onClick={onEdit} className="mt-2 text-[11px] underline" style={{ color: "#8f6fff" }}>Editar query</button>
          )}
        </div>
      </div>
    );
  }

  if (!result || result.rows.length === 0) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>{query.title}</div>
        <div className="flex-1 flex items-center justify-center" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Sem resultados</div>
      </div>
    );
  }

  // Número único
  if (query.vizType === "number" && result.columns.length === 1 && result.rows.length === 1) {
    const val = String(result.rows[0][0]);
    return (
      <div className="h-full flex flex-col p-4">
        <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-2" style={{ color: "rgba(255,255,255,0.38)" }}>{query.title}</div>
        <div className="flex-1 flex items-center">
          <div className="text-[36px] font-bold" style={{ color: "#8f6fff" }}>{val}</div>
        </div>
        <div className="text-[10px] font-mono truncate" style={{ color: "rgba(255,255,255,0.2)" }}>{result.columns[0]}</div>
      </div>
    );
  }

  // Gráfico de barras
  if (query.vizType === "bar" && result.columns.length >= 2) {
    const barData = result.rows.map((r) => ({ name: String(r[0]), value: Number(r[1]) }));
    return (
      <div className="flex flex-col h-full p-4">
        <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-2" style={{ color: "rgba(255,255,255,0.38)" }}>{query.title}</div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0e0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="value" fill="#7553ff99" radius={[4, 4, 0, 0]} name={result.columns[1]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Tabela (default)
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-[9.5px] uppercase tracking-[0.08em] font-semibold mb-3 flex items-center justify-between" style={{ color: "rgba(255,255,255,0.38)" }}>
        <span>{query.title}</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>{result.rows.length} linhas</span>
      </div>
      <div className="flex-1 overflow-auto min-h-0" style={{ scrollbarWidth: "thin" }}>
        <table className="w-full text-[11px] border-collapse">
          <thead className="sticky top-0" style={{ background: "#141418" }}>
            <tr>
              {result.columns.map((col) => (
                <th key={col} className="text-left px-2 py-1.5 font-semibold" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, ri) => (
              <tr key={ri} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-1.5 font-mono" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {cell === null ? <span style={{ color: "rgba(255,255,255,0.2)" }}>NULL</span> : String(cell)}
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

// ── Widget shell (card wrapper for grid) ──────────────────────────────────────

function WidgetShell({
  id,
  editMode,
  category,
  onRemove,
  onEditQuery,
  children,
}: {
  id: string;
  editMode: boolean;
  category?: string;
  onRemove: () => void;
  onEditQuery?: () => void;
  children: React.ReactNode;
}) {
  const accentColor = category ? CATEGORY_COLOR[category] : "rgba(255,255,255,0.2)";

  return (
    <div
      className="h-full flex flex-col rounded-xl overflow-hidden relative group transition-all"
      style={{
        background: "linear-gradient(145deg,#17171f,#121218)",
        border: editMode ? "1px solid rgba(117,83,255,0.25)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {/* Drag handle (edit mode) */}
      {editMode && (
        <div
          className="drag-handle absolute top-0 left-0 right-0 h-6 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ cursor: "grab", zIndex: 10, background: "rgba(117,83,255,0.08)" }}
        >
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>⠿⠿⠿</span>
        </div>
      )}

      {/* Actions (edit mode) */}
      {editMode && (
        <div className="absolute top-1 right-1 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEditQuery && (
            <button
              onClick={(e) => { e.stopPropagation(); onEditQuery(); }}
              className="w-5 h-5 rounded flex items-center justify-center text-[11px] transition-colors"
              style={{ background: "rgba(117,83,255,0.2)", color: "#8f6fff" }}
              title="Editar SQL"
            >
              ✏
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-5 h-5 rounded flex items-center justify-center text-[11px] transition-colors"
            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
            title="Remover"
          >
            ×
          </button>
        </div>
      )}

      {children}
    </div>
  );
}

// ── SQL Query Modal ────────────────────────────────────────────────────────────

function QueryModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: CustomQuery;
  onSave: (q: CustomQuery) => void;
  onClose: () => void;
}) {
  const [title, setTitle]     = useState(initial?.title   ?? "Nova consulta");
  const [sql, setSql]         = useState(initial?.sql     ?? "SELECT\n  \nFROM leads\nLIMIT 100");
  const [vizType, setVizType] = useState<CustomQuery["vizType"]>(initial?.vizType ?? "table");
  const [result, setResult]   = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  async function execute() {
    setRunning(true);
    setRunError(null);
    const r = await runSelectQuery(sql);
    if (r.error) { setRunError(r.error); setResult(null); }
    else setResult({ columns: r.columns, rows: r.rows });
    setRunning(false);
  }

  function save() {
    onSave({
      id: initial?.id ?? `query_${Date.now()}`,
      title,
      sql,
      vizType,
    });
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          width: "min(92vw, 900px)",
          maxHeight: "85vh",
          background: "#141418",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-[15px] font-semibold bg-transparent outline-none flex-1 mr-4"
            style={{ color: "#fafafa" }}
            placeholder="Título da consulta"
          />
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.35)", fontSize: 20 }}>×</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* SQL Editor */}
          <div className="flex flex-col flex-1 min-w-0" style={{ borderRight: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-3 pt-3 pb-2 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>SQL</span>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>— apenas SELECT</span>
            </div>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="flex-1 resize-none outline-none font-mono text-[12px] px-4 py-3"
              style={{
                background: "transparent",
                color: "#c4b1ff",
                lineHeight: 1.7,
                tabSize: 2,
              }}
              spellCheck={false}
              placeholder="SELECT * FROM leads LIMIT 10"
              onKeyDown={(e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  const s = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  setSql(sql.substring(0, s) + "  " + sql.substring(end));
                  setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; });
                }
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") execute();
              }}
            />
            <div className="px-4 py-2 flex gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={execute}
                disabled={running}
                className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{ background: running ? "rgba(117,83,255,0.3)" : "#7553ff", color: "#fff" }}
              >
                {running ? "Executando..." : "▶ Executar  ⌘↵"}
              </button>
              {result && (
                <span className="text-[11px] flex items-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {result.rows.length} linhas · {result.columns.length} colunas
                </span>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="w-[340px] flex flex-col">
            <div className="px-3 pt-3 pb-2 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>Visualização</span>
              <div className="flex gap-1 ml-auto">
                {(["table","number","bar","line"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setVizType(t)}
                    className="px-2 py-0.5 rounded text-[10px] font-medium transition-all"
                    style={{
                      background: vizType === t ? "rgba(117,83,255,0.3)" : "rgba(255,255,255,0.05)",
                      color: vizType === t ? "#c4b1ff" : "rgba(255,255,255,0.45)",
                      border: vizType === t ? "1px solid rgba(117,83,255,0.4)" : "1px solid transparent",
                    }}
                  >
                    {{ table: "⊞ Tabela", number: "# Número", bar: "▐ Barras", line: "∿ Linha" }[t]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto min-h-0 p-3">
              {runError && (
                <div className="rounded-lg p-3 text-[11px] font-mono" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
                  {runError}
                </div>
              )}
              {result && !runError && (
                vizType === "table" ? (
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr>
                        {result.columns.map((c) => (
                          <th key={c} className="text-left px-2 py-1 font-semibold" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, 20).map((row, ri) => (
                        <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-2 py-1 font-mono" style={{ color: "rgba(255,255,255,0.7)" }}>
                              {cell === null ? <span style={{ color: "rgba(255,255,255,0.2)" }}>NULL</span> : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : vizType === "number" ? (
                  <div className="flex items-center justify-center h-24">
                    <div className="text-[36px] font-bold" style={{ color: "#8f6fff" }}>
                      {result.rows[0]?.[0] !== undefined ? String(result.rows[0][0]) : "—"}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer>
                      <BarChart data={result.rows.slice(0, 30).map((r) => ({ name: String(r[0]), value: Number(r[1]) }))} margin={{ left: -10, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#0e0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="value" fill="#7553ff99" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
              {!result && !runError && (
                <div className="h-32 flex items-center justify-center" style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                  Execute a query para ver um preview
                </div>
              )}
            </div>

            {/* Save */}
            <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={save}
                className="w-full py-2 rounded-xl text-[13px] font-semibold transition-all"
                style={{ background: "rgba(117,83,255,0.2)", border: "1px solid rgba(117,83,255,0.4)", color: "#c4b1ff" }}
              >
                Adicionar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Widget Panel ───────────────────────────────────────────────────────────

function AddWidgetPanel({
  activeIds,
  onAdd,
  onNewQuery,
  onClose,
}: {
  activeIds: string[];
  onAdd: (id: string) => void;
  onNewQuery: () => void;
  onClose: () => void;
}) {
  const byCategory = ["receita", "conversao", "velocidade", "perda"] as const;
  const inactiveWidgets = WIDGET_CATALOG.filter((w) => !activeIds.includes(w.id));

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center md:items-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl overflow-hidden w-full md:w-[520px] max-h-[80vh] flex flex-col"
        style={{ background: "#141418", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span className="text-[14px] font-semibold" style={{ color: "#fafafa" }}>Adicionar Widget</span>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.35)", fontSize: 20 }}>×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Custom SQL */}
          <button
            onClick={() => { onClose(); onNewQuery(); }}
            className="w-full rounded-xl p-4 flex items-center gap-3 transition-all text-left"
            style={{ background: "rgba(117,83,255,0.1)", border: "1px solid rgba(117,83,255,0.3)" }}
          >
            <span className="text-[22px]">🗃️</span>
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#c4b1ff" }}>SQL Personalizado</div>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Escreva uma query SELECT e adicione como tabela, número ou gráfico</div>
            </div>
          </button>

          {/* Built-in widgets */}
          {byCategory.map((cat) => {
            const items = inactiveWidgets.filter((w) => w.category === cat);
            if (!items.length) return null;
            const catLabel = { receita: "Receita", conversao: "Conversão", velocidade: "Velocidade", perda: "Perda" }[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLOR[cat] }} />
                  <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{catLabel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => { onAdd(w.id); onClose(); }}
                      className="rounded-lg px-3 py-2.5 text-left transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}
                    >
                      <div className="text-[12px] font-medium">{w.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {inactiveWidgets.length === 0 && (
            <div className="py-8 text-center text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Todos os widgets já estão no dashboard
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DashboardClient({
  filters,
  receita,
  conversao,
  velocidade,
  perda,
  leadsPorDia,
  filterOptions,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const sp       = useSearchParams();

  const data: DashboardData = { receita, conversao, velocidade, perda, leadsPorDia, filterOptions };

  // Grid state
  const [layout, setLayout]               = useState<LayoutItem[]>(DEFAULT_LAYOUT as unknown as LayoutItem[]);
  const [customQueries, setCustomQueries] = useState<CustomQuery[]>([]);
  const [editMode, setEditMode]           = useState(false);
  const [showAdd, setShowAdd]             = useState(false);
  const [showQuery, setShowQuery]         = useState<CustomQuery | null | "new">(null);
  const [mounted, setMounted]             = useState(false);
  const [gridWidth, setGridWidth]         = useState(1200);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Filters
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStart, setCustomStart]       = useState(filters.start);
  const [customEnd, setCustomEnd]           = useState(filters.end);

  // Track container width
  useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setGridWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted]);

  // Load from localStorage (client only)
  useEffect(() => {
    setMounted(true);
    try {
      const savedLayout = localStorage.getItem("vendas-layout-v2");
      if (savedLayout) setLayout(JSON.parse(savedLayout));
      const savedQueries = localStorage.getItem("vendas-queries-v1");
      if (savedQueries) setCustomQueries(JSON.parse(savedQueries));
    } catch {}
  }, []);

  // Persist layout
  const persistLayout = useCallback((l: LayoutItem[]) => {
    try { localStorage.setItem("vendas-layout-v2", JSON.stringify(l)); } catch {}
    setLayout(l);
  }, []);

  // Persist queries
  const persistQueries = useCallback((q: CustomQuery[]) => {
    try { localStorage.setItem("vendas-queries-v1", JSON.stringify(q)); } catch {}
    setCustomQueries(q);
  }, []);

  function navigate(next: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => { if (!v) params.delete(k); else params.set(k, v); });
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPreset(days: number) {
    const end   = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    setShowCustomDate(false);
    navigate({ start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] });
  }

  function detectPreset(): number | null {
    const diff = Math.round((new Date(filters.end).getTime() - new Date(filters.start).getTime()) / 86400000);
    return [1, 7, 30, 90].includes(diff) ? diff : null;
  }

  const activePreset = detectPreset();
  const activeIds = layout.map((l) => l.i);

  function removeWidget(id: string) {
    const next = layout.filter((l) => l.i !== id);
    persistLayout(next);
    if (id.startsWith("query_")) {
      persistQueries(customQueries.filter((q) => q.id !== id));
    }
  }

  function addBuiltinWidget(id: string) {
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
      persistLayout([...layout, { i: q.id, x: 0, y: maxY, w: 8, h: 5 } as LayoutItem]);
    }
    setShowQuery(null);
  }

  function resetLayout() {
    persistLayout(DEFAULT_LAYOUT);
  }

  // ── Render widget by ID ──────────────────────────────────────────────────────

  function renderWidgetContent(id: string) {
    if (id === "leads_dia") return <LeadsDiaWidget data={leadsPorDia} />;
    if (id === "funil")     return <FunilWidget c={conversao} />;
    if (id === "planos_mix") return <PlanosMixWidget r={receita} />;

    if (id.startsWith("query_")) {
      const q = customQueries.find((c) => c.id === id);
      if (!q) return <div className="h-full flex items-center justify-center text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>Query não encontrada</div>;
      return <QueryResultWidget query={q} onEdit={editMode ? () => setShowQuery(q) : undefined} />;
    }

    const kpi = resolveKpi(id, data);
    if (kpi) return <KpiWidget kpi={kpi} />;

    return null;
  }

  function getCategoryForId(id: string): string {
    if (id.startsWith("query_")) return "conversao";
    return WIDGET_CATALOG.find((w) => w.id === id)?.category ?? "muted";
  }

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#fafafa" }}>
            Engenharia de Vendas
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {filters.start} → {filters.end} · somente leitura
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {editMode && (
            <>
              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
                style={{ background: "rgba(117,83,255,0.15)", border: "1px solid rgba(117,83,255,0.35)", color: "#c4b1ff" }}
              >
                + Adicionar
              </button>
              <button
                onClick={resetLayout}
                className="px-3 py-1.5 rounded-lg text-[11px]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
              >
                Resetar layout
              </button>
            </>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={{
              background:   editMode ? "#7553ff" : "rgba(255,255,255,0.05)",
              border:       editMode ? "1px solid #7553ff" : "1px solid rgba(255,255,255,0.1)",
              color:        editMode ? "#fff" : "rgba(255,255,255,0.55)",
            }}
          >
            {editMode ? "✓ Concluído" : "✏ Editar layout"}
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="rounded-xl mb-6 p-3.5 space-y-2.5" style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[9.5px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>Período</span>
          {[{ l: "Hoje", d: 1 }, { l: "7 dias", d: 7 }, { l: "30 dias", d: 30 }, { l: "90 dias", d: 90 }].map(({ l, d }) => (
            <button
              key={d}
              onClick={() => setPreset(d)}
              className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: activePreset === d ? "rgba(117,83,255,0.2)" : "rgba(255,255,255,0.04)",
                border: activePreset === d ? "1px solid rgba(117,83,255,0.5)" : "1px solid rgba(255,255,255,0.06)",
                color: activePreset === d ? "#c4b1ff" : "rgba(255,255,255,0.5)",
              }}
            >{l}</button>
          ))}
          <button
            onClick={() => setShowCustomDate(!showCustomDate)}
            className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: !activePreset ? "rgba(117,83,255,0.2)" : "rgba(255,255,255,0.04)",
              border: !activePreset ? "1px solid rgba(117,83,255,0.5)" : "1px solid rgba(255,255,255,0.06)",
              color: !activePreset ? "#c4b1ff" : "rgba(255,255,255,0.5)",
            }}
          >Personalizado</button>

          {filterOptions.sources.length > 0 && (
            <>
              <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.1)" }} />
              <span className="text-[9.5px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>Origem</span>
              <select
                value={filters.source ?? ""}
                onChange={(e) => navigate({ source: e.target.value || null })}
                className="rounded-lg px-2 py-1 text-[11px]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#fafafa" }}
              >
                <option value="">Todas</option>
                {filterOptions.sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}
          {filterOptions.landingVariants.length > 0 && (
            <select
              value={filters.landingVariant ?? ""}
              onChange={(e) => navigate({ lv: e.target.value || null })}
              className="rounded-lg px-2 py-1 text-[11px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#fafafa" }}
            >
              <option value="">Landing: todas</option>
              {filterOptions.landingVariants.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          )}
        </div>

        {showCustomDate && (
          <div className="flex flex-wrap gap-2 items-center pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-[11px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fafafa", colorScheme: "dark" }}
            />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>até</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-[11px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fafafa", colorScheme: "dark" }}
            />
            <button
              onClick={() => { setShowCustomDate(false); navigate({ start: customStart, end: customEnd }); }}
              className="px-4 py-1.5 rounded-lg text-[12px] font-semibold"
              style={{ background: "#7553ff", color: "#fff" }}
            >Aplicar</button>
          </div>
        )}
      </div>

      {/* ── Edit mode hint ── */}
      {editMode && (
        <div className="rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2 text-[11px]" style={{ background: "rgba(117,83,255,0.08)", border: "1px solid rgba(117,83,255,0.2)", color: "#c4b1ff" }}>
          <span>✦</span>
          <span>Arraste os cards para reorganizar · Redimensione pelo canto inferior direito · Clique em + para adicionar</span>
        </div>
      )}

      {/* ── Grid ── */}
      <div ref={gridContainerRef}>
      <ResponsiveGridLayout
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={80}
        width={gridWidth}
        margin={[10, 10]}
        dragConfig={{ enabled: editMode, handle: ".drag-handle" }}
        resizeConfig={{ enabled: editMode, handles: ["se"] }}
        onLayoutChange={(_: Layout, allLayouts: ResponsiveLayouts) => {
          const lg = allLayouts.lg;
          if (lg) persistLayout([...lg] as LayoutItem[]);
        }}
        style={{ minHeight: 200 }}
      >
        {layout.map((item) => {
          const content = renderWidgetContent(item.i);
          if (!content) return null;
          const category = getCategoryForId(item.i);
          const isCustomQuery = item.i.startsWith("query_");
          const query = isCustomQuery ? customQueries.find((q) => q.id === item.i) : undefined;

          return (
            <div key={item.i}>
              <WidgetShell
                id={item.i}
                editMode={editMode}
                category={category}
                onRemove={() => removeWidget(item.i)}
                onEditQuery={isCustomQuery && query ? () => setShowQuery(query) : undefined}
              >
                {content}
              </WidgetShell>
            </div>
          );
        })}
      </ResponsiveGridLayout>
      </div>

      {/* ── Modals ── */}
      {showAdd && (
        <AddWidgetPanel
          activeIds={activeIds}
          onAdd={addBuiltinWidget}
          onNewQuery={() => setShowQuery("new")}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showQuery !== null && (
        <QueryModal
          initial={showQuery === "new" ? undefined : showQuery}
          onSave={saveQuery}
          onClose={() => setShowQuery(null)}
        />
      )}
    </div>
  );
}
