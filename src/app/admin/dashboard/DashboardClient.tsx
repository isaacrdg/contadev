"use client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  KpiSummary,
  DailyPoint,
  FunnelStage,
  SourceRow,
} from "@/lib/leads-stats";

interface Props {
  summary: KpiSummary;
  daily: DailyPoint[];
  funnel: FunnelStage[];
  sources: SourceRow[];
}

const STAGE_RGB: Record<string, string> = {
  novo: "59,130,246",
  em_contato: "234,179,8",
  convertido: "34,197,94",
  perdido: "239,68,68",
};

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function fmtHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}min`;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export default function DashboardClient({ summary, daily, funnel, sources }: Props) {
  const totalDaily = daily.reduce((sum, d) => sum + d.total, 0);
  const last7 = daily.slice(-7).reduce((sum, d) => sum + d.total, 0);

  return (
    <div>
      {/* Hero */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight">Dashboard</h1>
        <p className="text-[12px] text-white/45 mt-1.5">
          Visão geral do funil de leads — últimos 30 dias
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total" value={summary.total} sub={`${last7} nos últimos 7 dias`} />
        <KpiCard
          label="Conversão"
          value={fmtPct(summary.conversionRate)}
          sub={`${summary.convertidos} convertidos / ${summary.convertidos + summary.perdidos} fechados`}
          rgb="34,197,94"
        />
        <KpiCard
          label="Em pipeline"
          value={summary.novos + summary.emContato}
          sub={`${summary.novos} novos · ${summary.emContato} em contato`}
          rgb="59,130,246"
        />
        <KpiCard
          label="Tempo médio"
          value={summary.avgFunnelHours > 0 ? fmtHours(summary.avgFunnelHours) : "—"}
          sub="Da entrada à conversão"
          rgb="143,111,255"
        />
      </div>

      {/* Daily chart + Funnel — 2 col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[13px] font-semibold text-[#fafafa]">Leads por dia</h2>
              <p className="text-[10px] text-white/45 mt-0.5">{totalDaily} no período</p>
            </div>
          </div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={daily} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8f6fff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8f6fff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0e0d14",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}
                  itemStyle={{ color: "#fafafa" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8f6fff"
                  strokeWidth={2}
                  fill="url(#gradTotal)"
                  name="Total"
                />
                <Area
                  type="monotone"
                  dataKey="convertidos"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#gradConv)"
                  name="Convertidos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-[13px] font-semibold text-[#fafafa] mb-4">Funil</h2>
          <div className="space-y-3">
            {funnel.map((stage, i) => {
              const max = funnel[0]?.count || 1;
              const pct = max > 0 ? (stage.count / max) * 100 : 0;
              const rgb = STAGE_RGB[stage.status];
              const lossFromPrev =
                i > 0 && funnel[i - 1].count > 0
                  ? 1 - stage.count / funnel[i - 1].count
                  : 0;
              return (
                <div key={stage.status}>
                  <div className="flex items-center justify-between text-[10.5px] mb-1">
                    <span style={{ color: `rgba(${rgb},1)` }} className="font-medium">
                      {stage.label}
                    </span>
                    <span className="text-white/55 tabular-nums">{stage.count}</span>
                  </div>
                  <div
                    className="h-7 rounded-md overflow-hidden relative"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, rgba(${rgb},0.4), rgba(${rgb},0.15))`,
                        borderRight: `2px solid rgba(${rgb},0.8)`,
                      }}
                    />
                  </div>
                  {i > 0 && lossFromPrev > 0 && (
                    <div className="text-[9px] text-white/35 mt-1 text-right">
                      −{fmtPct(lossFromPrev)} vs etapa anterior
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* UTM Source ROI */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[13px] font-semibold text-[#fafafa]">ROI por fonte</h2>
            <p className="text-[10px] text-white/45 mt-0.5">
              Onde os leads que mais convertem estão vindo
            </p>
          </div>
        </div>

        {sources.length === 0 ? (
          <div className="text-[11px] text-white/35 py-6 text-center italic">
            Sem dados de UTM ainda
          </div>
        ) : (
          <>
            {/* Bar chart */}
            <div style={{ width: "100%", height: Math.max(180, sources.length * 36) }}>
              <ResponsiveContainer>
                <BarChart
                  data={sources}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="source"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0e0d14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    formatter={(value, name) => [value, name === "total" ? "Total" : name]}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {sources.map((row, i) => (
                      <Cell
                        key={i}
                        fill={
                          row.conversionRate > 0.5
                            ? "rgba(34,197,94,0.7)"
                            : row.conversionRate > 0.2
                              ? "rgba(143,111,255,0.7)"
                              : "rgba(255,255,255,0.2)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabela detalhada */}
            <div
              className="mt-3 rounded-lg overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    <th className="text-left px-3 py-2 font-semibold text-white/45 uppercase text-[9px] tracking-[0.06em]">
                      Fonte
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-white/45 uppercase text-[9px] tracking-[0.06em]">
                      Total
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-white/45 uppercase text-[9px] tracking-[0.06em]">
                      Convertidos
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-white/45 uppercase text-[9px] tracking-[0.06em]">
                      Perdidos
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-white/45 uppercase text-[9px] tracking-[0.06em]">
                      Conversão
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((row) => (
                    <tr
                      key={row.source}
                      className="border-t"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      <td className="px-3 py-2 text-white/85 font-mono text-[10.5px]">
                        {row.source}
                      </td>
                      <td className="px-3 py-2 text-right text-white/75 tabular-nums">
                        {row.total}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-400 tabular-nums">
                        {row.convertidos}
                      </td>
                      <td className="px-3 py-2 text-right text-red-400 tabular-nums">
                        {row.perdidos}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold">
                        <span
                          style={{
                            color:
                              row.conversionRate > 0.5
                                ? "#6ee7b7"
                                : row.conversionRate > 0.2
                                  ? "#c4b1ff"
                                  : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {row.convertidos + row.perdidos > 0 ? fmtPct(row.conversionRate) : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  rgb = "255,255,255",
}: {
  label: string;
  value: string | number;
  sub?: string;
  rgb?: string;
}) {
  const isNeutral = rgb === "255,255,255";
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: isNeutral
          ? "#1a1a1a"
          : `linear-gradient(135deg, rgba(${rgb},0.10), rgba(${rgb},0.02)), #1a1a1a`,
        border: isNeutral
          ? "1px solid rgba(255,255,255,0.08)"
          : `1px solid rgba(${rgb},0.30)`,
      }}
    >
      <div className="text-[9.5px] uppercase tracking-[0.06em] text-white/45 font-semibold">
        {label}
      </div>
      <div
        className="text-[24px] font-bold leading-tight mt-2"
        style={{ color: isNeutral ? "#fafafa" : `rgba(${rgb},1)` }}
      >
        {value}
      </div>
      {sub && <div className="text-[10px] text-white/40 mt-1.5">{sub}</div>}
    </div>
  );
}
