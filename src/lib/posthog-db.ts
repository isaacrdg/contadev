// READ-ONLY analytics do PostHog via API HogQL. NÃO escreve nada.
// Mesma ideia do vendas-db.ts, mas a fonte é o PostHog (comportamento web).

type Bucket = { nome: string; valor: number };

export interface AquisicaoData {
  pageviews: number;
  visitantes: number;
  leadsCriados: number;     // evento lead_created
  pvToLead: number;         // leadsCriados / visitantes
  porCanal: Bucket[];       // $referring_domain
  porDevice: Bucket[];      // $device_type
  porPais: Bucket[];        // $geoip_country_name
  // Funil web: pageview → form etapa 1 → form completo → lead → cliente
  funilPageview: number;
  funilFormStep1: number;
  funilFormCompleto: number;
  funilLead: number;
  funilCliente: number;
}

export const AQUISICAO_ZERO: AquisicaoData = {
  pageviews: 0, visitantes: 0, leadsCriados: 0, pvToLead: 0,
  porCanal: [], porDevice: [], porPais: [],
  funilPageview: 0, funilFormStep1: 0, funilFormCompleto: 0, funilLead: 0, funilCliente: 0,
};

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

async function hogql(query: string): Promise<unknown[][]> {
  const host = (process.env.POSTHOG_HOST || "https://us.posthog.com").replace(/\/$/, "");
  const proj = process.env.POSTHOG_PROJECT_ID;
  const key = process.env.POSTHOG_API_KEY;
  if (!proj || !key) throw new Error("POSTHOG_PROJECT_ID / POSTHOG_API_KEY não configurados");

  const r = await fetch(`${host}/api/projects/${proj}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`PostHog ${r.status}: ${JSON.stringify(j).slice(0, 200)}`);
  return (j.results ?? []) as unknown[][];
}

const num = (v: unknown) => Number(v ?? 0);
const buckets = (rows: unknown[][]): Bucket[] =>
  rows.map((r) => ({ nome: String(r[0] ?? "(desconhecido)"), valor: num(r[1]) }));

export async function getAquisicaoMetrics(start: string, end: string): Promise<AquisicaoData> {
  if (!isDate(start) || !isDate(end)) throw new Error("datas inválidas");
  // Janela por dia (timezone do projeto), inclusiva nas duas pontas.
  const W = `toDate(timestamp) >= toDate('${start}') AND toDate(timestamp) <= toDate('${end}')`;

  const [vol, funil, canal, device, pais] = await Promise.all([
    hogql(`SELECT count() AS pv, count(DISTINCT person_id) AS vis
           FROM events WHERE event = '$pageview' AND ${W}`),
    hogql(`SELECT
             countIf(event='$pageview')                  AS pageview,
             countIf(event='lead_form_step1_submitted')  AS step1,
             countIf(event='lead_form_completed')        AS completo,
             countIf(event='lead_created')               AS lead,
             countIf(event='lead_became_customer')       AS cliente
           FROM events WHERE ${W}`),
    hogql(`SELECT properties.$referring_domain AS k, count() AS c
           FROM events WHERE event='$pageview' AND ${W} GROUP BY k ORDER BY c DESC LIMIT 8`),
    hogql(`SELECT properties.$device_type AS k, count() AS c
           FROM events WHERE event='$pageview' AND ${W} GROUP BY k ORDER BY c DESC`),
    hogql(`SELECT properties.$geoip_country_name AS k, count() AS c
           FROM events WHERE event='$pageview' AND ${W} GROUP BY k ORDER BY c DESC LIMIT 8`),
  ]);

  const pageviews   = num(vol[0]?.[0]);
  const visitantes  = num(vol[0]?.[1]);
  const leadsCriados = num(funil[0]?.[3]);

  return {
    pageviews,
    visitantes,
    leadsCriados,
    pvToLead: visitantes > 0 ? leadsCriados / visitantes : 0,
    porCanal: buckets(canal),
    porDevice: buckets(device),
    porPais: buckets(pais),
    funilPageview:     num(funil[0]?.[0]),
    funilFormStep1:    num(funil[0]?.[1]),
    funilFormCompleto: num(funil[0]?.[2]),
    funilLead:         num(funil[0]?.[3]),
    funilCliente:      num(funil[0]?.[4]),
  };
}
