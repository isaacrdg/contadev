import type { Lead, LeadStatus, StatusHistoryEntry } from "./leads-store";

const DAY_MS = 86_400_000;

export interface KpiSummary {
  total: number;
  novos: number;
  emContato: number;
  convertidos: number;
  perdidos: number;
  conversionRate: number; // 0..1
  avgFunnelHours: number; // tempo médio entre criação e conversão (só convertidos)
}

export function summarize(leads: Lead[]): KpiSummary {
  const total = leads.length;
  let novos = 0;
  let emContato = 0;
  let convertidos = 0;
  let perdidos = 0;
  let funnelHoursSum = 0;
  let funnelHoursCount = 0;

  for (const l of leads) {
    if (l.status === "novo") novos++;
    else if (l.status === "em_contato") emContato++;
    else if (l.status === "convertido") {
      convertidos++;
      // tempo entre criação e última transição pra "convertido"
      const conv = lastEntryFor(l.statusHistory, "convertido");
      if (conv) {
        const created = new Date(l.createdAt).getTime();
        const at = new Date(conv.at).getTime();
        if (at > created) {
          funnelHoursSum += (at - created) / 3_600_000;
          funnelHoursCount++;
        }
      }
    } else if (l.status === "perdido") perdidos++;
  }

  const closedTotal = convertidos + perdidos;
  const conversionRate = closedTotal > 0 ? convertidos / closedTotal : 0;

  return {
    total,
    novos,
    emContato,
    convertidos,
    perdidos,
    conversionRate,
    avgFunnelHours: funnelHoursCount > 0 ? funnelHoursSum / funnelHoursCount : 0,
  };
}

function lastEntryFor(
  history: StatusHistoryEntry[] | undefined,
  status: LeadStatus
): StatusHistoryEntry | null {
  if (!Array.isArray(history)) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].status === status) return history[i];
  }
  return null;
}

/**
 * Série de leads/dia nos últimos N dias.
 */
export interface DailyPoint {
  date: string; // YYYY-MM-DD
  label: string; // dd/MM
  total: number;
  convertidos: number;
}

export function leadsPerDay(leads: Lead[], days = 30): DailyPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getTime() - (days - 1) * DAY_MS);

  const points: Record<string, DailyPoint> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    points[key] = { date: key, label, total: 0, convertidos: 0 };
  }

  for (const l of leads) {
    const key = l.createdAt.slice(0, 10);
    if (!points[key]) continue;
    points[key].total++;
    if (l.status === "convertido") points[key].convertidos++;
  }

  return Object.values(points);
}

/**
 * Funil — quantos leads passaram (algum dia) por cada estágio.
 */
export interface FunnelStage {
  status: LeadStatus;
  label: string;
  count: number;
}

const STAGE_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  convertido: "Convertido",
  perdido: "Perdido",
};

export function funnelData(leads: Lead[]): FunnelStage[] {
  const counts: Record<LeadStatus, number> = {
    novo: 0,
    em_contato: 0,
    convertido: 0,
    perdido: 0,
  };

  for (const l of leads) {
    const visited = new Set<LeadStatus>();
    if (Array.isArray(l.statusHistory)) {
      for (const entry of l.statusHistory) visited.add(entry.status);
    } else {
      visited.add(l.status);
    }
    visited.forEach((s) => {
      counts[s]++;
    });
  }

  return [
    { status: "novo", label: STAGE_LABELS.novo, count: counts.novo },
    { status: "em_contato", label: STAGE_LABELS.em_contato, count: counts.em_contato },
    { status: "convertido", label: STAGE_LABELS.convertido, count: counts.convertido },
    { status: "perdido", label: STAGE_LABELS.perdido, count: counts.perdido },
  ];
}

/**
 * Agrupa leads por origem (utm_source ou "(direct)" quando ausente)
 * e calcula taxa de conversão.
 */
export interface SourceRow {
  source: string;
  total: number;
  convertidos: number;
  perdidos: number;
  conversionRate: number;
}

export function sourceROI(leads: Lead[]): SourceRow[] {
  const byKey: Record<string, { total: number; conv: number; lost: number }> = {};
  for (const l of leads) {
    const key = l.utmData?.utmSource?.toLowerCase().trim() || "(direto)";
    if (!byKey[key]) byKey[key] = { total: 0, conv: 0, lost: 0 };
    byKey[key].total++;
    if (l.status === "convertido") byKey[key].conv++;
    else if (l.status === "perdido") byKey[key].lost++;
  }
  return Object.entries(byKey)
    .map(([source, { total, conv, lost }]) => {
      const closed = conv + lost;
      return {
        source,
        total,
        convertidos: conv,
        perdidos: lost,
        conversionRate: closed > 0 ? conv / closed : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}
