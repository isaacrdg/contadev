"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  VendasFilters,
  ReceitaData,
  ConversaoData,
  VelocidadeData,
  PerdaData,
  LeadDia,
  FilterOptions,
} from "@/lib/vendas-db";

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtBRL(v: number) {
  if (v === 0) return "R$ 0";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function fmtMin(min: number | null): string {
  if (min === null || min === undefined) return "—";
  const m = Math.round(min);
  if (m < 60)   return `${m}min`;
  if (m < 1440) return `${(m / 60).toFixed(1)}h`;
  return `${(m / 1440).toFixed(1)}d`;
}

function fmtPct(ratio: number) {
  return `${(ratio * 100).toFixed(1)}%`;
}

function fmtNum(v: number) {
  return v.toLocaleString("pt-BR");
}

function fmtMsgs(v: number | null) {
  if (v === null) return "—";
  return `${Math.round(v)} msgs`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  filters: VendasFilters;
  receita: ReceitaData;
  conversao: ConversaoData;
  velocidade: VelocidadeData;
  perda: PerdaData;
  leadsPorDia: LeadDia[];
  filterOptions: FilterOptions;
}

// ── Component ─────────────────────────────────────────────────────────────────

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

  const [showCustom, setShowCustom]       = useState(false);
  const [customStart, setCustomStart]     = useState(filters.start);
  const [customEnd,   setCustomEnd]       = useState(filters.end);

  function navigate(next: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function setPreset(days: number) {
    const end   = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    setShowCustom(false);
    navigate({
      start: start.toISOString().split("T")[0],
      end:   end.toISOString().split("T")[0],
    });
  }

  function applyCustom() {
    if (customStart && customEnd) {
      setShowCustom(false);
      navigate({ start: customStart, end: customEnd });
    }
  }

  function detectPreset(): number | null {
    const diff = Math.round(
      (new Date(filters.end).getTime() - new Date(filters.start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return [1, 7, 30, 90].includes(diff) ? diff : null;
  }

  const activePreset = detectPreset();

  // ── Funnel data for chart
  const funnelData = [
    { label: "Leads entrados",  value: conversao.funnelEntrados,    pct: 1 },
    { label: "Tem conversa",    value: conversao.funnelTemConversa,  pct: conversao.funnelEntrados > 0 ? conversao.funnelTemConversa / conversao.funnelEntrados : 0 },
    { label: "Tem contrato",    value: conversao.funnelTemContrato,  pct: conversao.funnelEntrados > 0 ? conversao.funnelTemContrato / conversao.funnelEntrados : 0 },
    { label: "Pagou (billing)", value: conversao.funnelTemBilling,   pct: conversao.funnelEntrados > 0 ? conversao.funnelTemBilling / conversao.funnelEntrados : 0 },
  ];

  // ── Chart date labels
  const chartData = leadsPorDia.map((d) => ({
    ...d,
    label: new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
  }));

  // ── Pie anual vs mensal (manual bars)
  const totalSubs = receita.qtdAnuais + receita.qtdMensais;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">Engenharia de Vendas</h1>
        <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Métricas de performance do funil — somente leitura
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Period presets */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
            Período
          </span>
          {[
            { label: "Hoje",    days: 1  },
            { label: "7 dias",  days: 7  },
            { label: "30 dias", days: 30 },
            { label: "90 dias", days: 90 },
          ].map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setPreset(days)}
              className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: activePreset === days ? "rgba(117,83,255,0.25)" : "rgba(255,255,255,0.05)",
                border:     activePreset === days ? "1px solid rgba(117,83,255,0.6)" : "1px solid rgba(255,255,255,0.08)",
                color:      activePreset === days ? "#c4b1ff" : "rgba(255,255,255,0.6)",
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: !activePreset && !showCustom ? "rgba(117,83,255,0.25)" : "rgba(255,255,255,0.05)",
              border:     !activePreset && !showCustom ? "1px solid rgba(117,83,255,0.6)" : "1px solid rgba(255,255,255,0.08)",
              color:      !activePreset && !showCustom ? "#c4b1ff" : "rgba(255,255,255,0.6)",
            }}
          >
            Personalizado
          </button>
          <span className="text-[10px] ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            {filters.start} → {filters.end}
          </span>
        </div>

        {/* Custom date picker */}
        {showCustom && (
          <div className="flex flex-wrap gap-2 items-center pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-[11px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fafafa", colorScheme: "dark" }}
            />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>até</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-[11px]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fafafa", colorScheme: "dark" }}
            />
            <button
              onClick={applyCustom}
              className="px-4 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: "#7553ff", color: "#fff" }}
            >
              Aplicar
            </button>
          </div>
        )}

        {/* Source + variant filters */}
        {(filterOptions.sources.length > 0 || filterOptions.landingVariants.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {filterOptions.sources.length > 0 && (
              <>
                <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Origem
                </span>
                <select
                  value={filters.source ?? ""}
                  onChange={(e) => navigate({ source: e.target.value || null })}
                  className="rounded-lg px-2 py-1 text-[11px]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fafafa" }}
                >
                  <option value="">Todas</option>
                  {filterOptions.sources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </>
            )}
            {filterOptions.landingVariants.length > 0 && (
              <>
                <span className="text-[10px] uppercase tracking-widest font-semibold ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Landing
                </span>
                <select
                  value={filters.landingVariant ?? ""}
                  onChange={(e) => navigate({ lv: e.target.value || null })}
                  className="rounded-lg px-2 py-1 text-[11px]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fafafa" }}
                >
                  <option value="">Todas</option>
                  {filterOptions.landingVariants.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </>
            )}
            {filterOptions.pricingVariants.length > 0 && (
              <>
                <span className="text-[10px] uppercase tracking-widest font-semibold ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Pricing
                </span>
                <select
                  value={filters.pricingVariant ?? ""}
                  onChange={(e) => navigate({ pv: e.target.value || null })}
                  className="rounded-lg px-2 py-1 text-[11px]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fafafa" }}
                >
                  <option value="">Todas</option>
                  {filterOptions.pricingVariants.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </>
            )}
          </div>
        )}
      </div>

      {/* ═══ BLOCO 1 — RECEITA ═══════════════════════════════════════════════ */}
      <Section title="Receita" accent="117,83,255">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Valor adquirido"    value={fmtBRL(receita.valorAdquirido)} sub="pagamentos no período" accent="green" />
          <KpiCard label="MRR atual"          value={fmtBRL(receita.mrr)}            sub="assinaturas ativas hoje" accent="purple" />
          <KpiCard label="Assinou contrato"   value={fmtNum(receita.assinou)}        sub="has_contract = true" />
          <KpiCard label="% Assinou → Pagou"
            value={receita.assinou > 0 ? fmtPct(receita.pagou / receita.assinou) : "—"}
            sub={`${fmtNum(receita.pagou)} pagamentos confirmados`}
            accent={receita.assinou > 0 && receita.pagou / receita.assinou > 0.7 ? "green" : "red"}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Planos anuais"     value={fmtNum(receita.qtdAnuais)}     sub={fmtBRL(receita.valorAnuais) + " total"} accent="purple" />
          <KpiCard label="Valor anual (soma)" value={fmtBRL(receita.valorAnuais)}  sub={`${receita.qtdAnuais} contratos`} />
          <KpiCard label="Planos mensais"    value={fmtNum(receita.qtdMensais)}    sub={fmtBRL(receita.valorMensais) + " total"} />
          <KpiCard label="Valor mensal (soma)" value={fmtBRL(receita.valorMensais)} sub={`${receita.qtdMensais} contratos`} />
        </div>

        {/* Anual vs Mensal visual */}
        {totalSubs > 0 && (
          <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              Mix de ciclos
            </p>
            <div className="flex gap-2 items-center h-6">
              <div
                className="h-full rounded-l-md"
                style={{ width: `${(receita.qtdAnuais / totalSubs) * 100}%`, background: "rgba(117,83,255,0.6)" }}
              />
              <div
                className="h-full rounded-r-md"
                style={{ width: `${(receita.qtdMensais / totalSubs) * 100}%`, background: "rgba(34,197,94,0.4)" }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              <span><span style={{ color: "#8f6fff" }}>■</span> Anual {totalSubs > 0 ? fmtPct(receita.qtdAnuais / totalSubs) : "—"}</span>
              <span><span style={{ color: "#22c55e" }}>■</span> Mensal {totalSubs > 0 ? fmtPct(receita.qtdMensais / totalSubs) : "—"}</span>
            </div>
          </div>
        )}
      </Section>

      {/* ═══ BLOCO 2 — CONVERSÃO ════════════════════════════════════════════ */}
      <Section title="Conversão" accent="34,197,94">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Leads entrados"      value={fmtNum(conversao.leadsEntrados)}  sub="criados no período" accent="purple" />
          <KpiCard label="Fechamentos"          value={fmtNum(conversao.fechamentos)}    sub="has_billing = true" accent="green" />
          <KpiCard label="Close Rate"           value={fmtPct(conversao.closeRate)}      sub="fechamentos / leads" accent={conversao.closeRate > 0.2 ? "green" : "red"} />
          <KpiCard label="Inadimplentes"        value={fmtNum(conversao.inadimplentes)}  sub="assinou, não pagou" accent={conversao.inadimplentes > 0 ? "red" : "default"} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Múltiplas entradas"   value={fmtNum(conversao.multiplosEntradas)} sub="leads com 2+ forms" />
          <KpiCard label="Reentradas pós-perda" value={fmtNum(conversao.reentradas)}        sub="perdido → novo form" accent={conversao.reentradas > 0 ? "green" : "default"} />
          <KpiCard label="Clientes que quicam"  value={fmtNum(conversao.quicam)}            sub="<15 dias de assinatura" accent={conversao.quicam > 0 ? "red" : "default"} />
          <KpiCard
            label="% Page views → leads"
            value="—"
            sub="Fonte: PostHog (não disponível aqui)"
            disabled
          />
        </div>

        {/* Charts: funil + leads por dia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Funil horizontal */}
          <ChartCard title="Funil de conversão" sub="Leads → Conversa → Contrato → Billing">
            <div className="space-y-3 mt-2">
              {funnelData.map((stage, i) => {
                const colors = ["rgba(117,83,255,0.8)", "rgba(59,130,246,0.8)", "rgba(234,179,8,0.8)", "rgba(34,197,94,0.8)"];
                const prevPct = i > 0 ? funnelData[i - 1].pct : 1;
                const dropPct = prevPct > 0 ? 1 - stage.pct / prevPct : 0;
                return (
                  <div key={stage.label}>
                    <div className="flex items-center justify-between text-[10.5px] mb-1">
                      <span style={{ color: "rgba(255,255,255,0.75)" }}>{stage.label}</span>
                      <span className="tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {fmtNum(stage.value)} <span style={{ color: "rgba(255,255,255,0.3)" }}>({fmtPct(stage.pct)})</span>
                      </span>
                    </div>
                    <div className="h-6 rounded-md overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${stage.pct * 100}%`,
                          background: `linear-gradient(90deg, ${colors[i]}, ${colors[i].replace("0.8", "0.35")})`,
                        }}
                      />
                    </div>
                    {i > 0 && dropPct > 0 && (
                      <div className="text-[9px] text-right mt-0.5" style={{ color: "rgba(239,68,68,0.7)" }}>
                        −{fmtPct(dropPct)} nessa etapa
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Leads por dia */}
          <ChartCard title="Leads por dia" sub={`${fmtNum(conversao.leadsEntrados)} no período`}>
            <div style={{ width: "100%", height: 160, marginTop: 8 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ background: "#0e0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}
                      itemStyle={{ color: "#fafafa" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8f6fff"
                      strokeWidth={2}
                      dot={false}
                      name="Leads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <NoData />
              )}
            </div>
          </ChartCard>
        </div>
      </Section>

      {/* ═══ BLOCO 3 — VELOCIDADE ═══════════════════════════════════════════ */}
      <Section title="Velocidade" accent="59,130,246">
        <p className="text-[10px] mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
          Todos os tempos em p50 (mediana) e p90 — nunca média
        </p>

        {/* Response times */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <VelocidadeCard
            label="1ª Resposta humana (FRT)"
            p50={velocidade.frtP50}
            p90={velocidade.frtP90}
            fmt={fmtMin}
            sub="do lead criado até 1ª msg do time"
          />
          <VelocidadeCard
            label="2ª Resposta humana"
            p50={velocidade.secondRespP50}
            p90={velocidade.secondRespP90}
            fmt={fmtMin}
            sub="tempo até a 2ª mensagem enviada"
          />
          <VelocidadeCard
            label="Entre respostas consecutivas"
            p50={velocidade.timeBetweenP50}
            p90={velocidade.timeBetweenP90}
            fmt={fmtMin}
            sub="intervalo entre msgs do time"
          />
        </div>

        {/* Message counts */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            label="Msgs até fechamento (p50)"
            value={fmtMsgs(velocidade.msgsAteFecharP50)}
            sub="leads que pagaram"
            accent="green"
          />
          <KpiCard
            label="Msgs até perdido (p50)"
            value={fmtMsgs(velocidade.msgsAtePerdidoP50)}
            sub="leads que foram perdidos"
            accent="red"
          />
        </div>
      </Section>

      {/* ═══ BLOCO 4 — PERDA ════════════════════════════════════════════════ */}
      <Section title="Perda" accent="239,68,68">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Perdidos declarados"
            value={fmtNum(perda.perdidosDeclarados)}
            sub="lead_losses no período"
            accent={perda.perdidosDeclarados > 0 ? "red" : "default"}
          />
          <KpiCard
            label="Perdidos por ghosting"
            value={fmtNum(perda.perdidosGhosting)}
            sub="sem msg há 7d, sem billing"
            accent={perda.perdidosGhosting > 0 ? "red" : "default"}
          />
          <KpiCard
            label="Taxa de perda"
            value={fmtPct(perda.taxaPerda)}
            sub={`(decl. + ghosting) / leads`}
            accent={perda.taxaPerda > 0.5 ? "red" : perda.taxaPerda > 0.3 ? "default" : "green"}
          />
          <KpiCard
            label="Reentradas pós-perda"
            value={fmtNum(perda.reentradas)}
            sub="perdido → voltou para o funil"
            accent={perda.reentradas > 0 ? "green" : "default"}
          />
        </div>

        {/* Perda breakdown */}
        {(perda.perdidosDeclarados + perda.perdidosGhosting) > 0 && (
          <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
              Tipo de perda
            </p>
            <div className="space-y-2">
              {[
                { label: "Declarado (lead_losses)",  value: perda.perdidosDeclarados, color: "rgba(239,68,68,0.7)" },
                { label: "Ghosting (7d sem msg)",     value: perda.perdidosGhosting,   color: "rgba(234,179,8,0.7)" },
              ].map((row) => {
                const total = perda.perdidosDeclarados + perda.perdidosGhosting;
                const pct = total > 0 ? row.value / total : 0;
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-[10.5px] mb-1">
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>{row.label}</span>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{fmtNum(row.value)} ({fmtPct(pct)})</span>
                    </div>
                    <div className="h-4 rounded" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="h-full rounded" style={{ width: `${pct * 100}%`, background: row.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Section>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children, accent = "255,255,255" }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: `rgba(${accent},0.8)` }} />
        <h2 className="text-[14px] font-bold tracking-tight" style={{ color: "#fafafa" }}>{title}</h2>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent = "default",
  disabled = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "red" | "purple" | "default";
  disabled?: boolean;
}) {
  const accentMap = {
    green:   { rgb: "34,197,94",   hex: "#22c55e" },
    red:     { rgb: "239,68,68",   hex: "#ef4444" },
    purple:  { rgb: "117,83,255",  hex: "#8f6fff" },
    default: { rgb: "255,255,255", hex: "#fafafa" },
  };
  const { rgb, hex } = accentMap[accent];
  const isNeutral = accent === "default";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.02)"
          : isNeutral
          ? "#1a1a1a"
          : `linear-gradient(135deg, rgba(${rgb},0.08), rgba(${rgb},0.02)), #1a1a1a`,
        border: disabled
          ? "1px solid rgba(255,255,255,0.04)"
          : isNeutral
          ? "1px solid rgba(255,255,255,0.08)"
          : `1px solid rgba(${rgb},0.25)`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div className="text-[9.5px] uppercase tracking-[0.06em] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
      <div className="text-[22px] font-bold leading-tight mt-2" style={{ color: disabled ? "rgba(255,255,255,0.25)" : hex }}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function VelocidadeCard({
  label,
  p50,
  p90,
  fmt,
  sub,
}: {
  label: string;
  p50: number | null;
  p90: number | null;
  fmt: (v: number | null) => string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="text-[9.5px] uppercase tracking-[0.06em] font-semibold mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>p50</div>
          <div className="text-[18px] font-bold" style={{ color: p50 !== null ? "#8f6fff" : "rgba(255,255,255,0.2)" }}>
            {fmt(p50)}
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>p90</div>
          <div className="text-[18px] font-bold" style={{ color: p90 !== null ? "#c4b1ff" : "rgba(255,255,255,0.2)" }}>
            {fmt(p90)}
          </div>
        </div>
      </div>
      {sub && (
        <div className="text-[9.5px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</div>
      )}
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-[12px] font-semibold" style={{ color: "#fafafa" }}>{title}</div>
      {sub && <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</div>}
      {children}
    </div>
  );
}

function NoData() {
  return (
    <div className="h-full flex items-center justify-center">
      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>Sem dados no período</span>
    </div>
  );
}
