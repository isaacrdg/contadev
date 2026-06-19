// READ-ONLY analytics queries against the client's production Neon database.
// NEVER add INSERT, UPDATE, DELETE, DROP, or CREATE operations to this file.

import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

function getSql(): TypedSql {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não configurado");
    _sql = neon(url);
  }
  return _sql as unknown as TypedSql;
}

type Row = Record<string, unknown>;
type TypedSql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

export interface VendasFilters {
  start: string;
  end: string;
  source?: string | null;
  landingVariant?: string | null;
  pricingVariant?: string | null;
}

export interface ReceitaData {
  // Total de pagamentos recebidos no período (recorrentes + novos)
  totalCobrado: number;
  // Valor contratual de NOVAS assinaturas criadas no período
  valorNovosContratos: number;
  // MRR atual (equivalente mensal de todas as assinaturas ativas)
  mrr: number;
  // Clientes com assinatura ativa agora (global, sem filtro de período)
  clientesAtivos: number;
  // Assinaturas past_due + canceled (em risco ou canceladas)
  emRisco: number;
  // Novos anuais no período
  qtdNovosAnuais: number;
  valorNovosAnuais: number;
  // Novos mensais no período
  qtdNovosMensais: number;
  valorNovosMensais: number;
  // Conversão contrato → billing
  assinou: number;
  pagou: number;
}

export interface ConversaoData {
  leadsEntrados: number;
  fechamentos: number;
  closeRate: number;
  multiplosEntradas: number;
  reentradas: number;
  quicam: number;
  inadimplentes: number;
  funnelEntrados: number;
  funnelTemConversa: number;
  funnelTemContrato: number;
  funnelTemBilling: number;
}

export interface VelocidadeData {
  frtP50: number | null;
  frtP90: number | null;
  secondRespP50: number | null;
  secondRespP90: number | null;
  timeBetweenP50: number | null;
  timeBetweenP90: number | null;
  msgsAteFecharP50: number | null;
  msgsAtePerdidoP50: number | null;
}

export interface PerdaData {
  perdidosDeclarados: number;
  perdidosGhosting: number;
  taxaPerda: number;
  reentradas: number;
}

export interface LeadDia {
  date: string;
  count: number;
}

export interface FilterOptions {
  sources: string[];
  landingVariants: string[];
  pricingVariants: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const n = (v: unknown) => Number(v ?? 0);
const toFloat = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v);

// ── RECEITA ───────────────────────────────────────────────────────────────────

export async function getReceitaMetrics(f: VendasFilters): Promise<ReceitaData> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  const [pagamentos, ciclos, contratos] = await Promise.all([
    // Total cobrado no período (todos os pagamentos confirmados, incluindo recorrência)
    sql`
      SELECT COALESCE(SUM(value)::float8, 0) as total_cobrado
      FROM subscription_payments
      WHERE status = 'paid'
        AND paid_at >= ${f.start}::date
        AND paid_at < (${f.end}::date + interval '1 day')
    `,
    // Novas assinaturas criadas no período + MRR atual
    sql`
      SELECT
        COALESCE(SUM(ls.value)::float8, 0)                                              as valor_novos_contratos,
        COALESCE(SUM(CASE WHEN ls.cycle = 'YEARLY'  THEN 1     ELSE 0 END), 0)::int     as qtd_anuais,
        COALESCE(SUM(CASE WHEN ls.cycle = 'YEARLY'  THEN ls.value ELSE 0 END)::float8, 0) as valor_anuais,
        COALESCE(SUM(CASE WHEN ls.cycle = 'MONTHLY' THEN 1     ELSE 0 END), 0)::int     as qtd_mensais,
        COALESCE(SUM(CASE WHEN ls.cycle = 'MONTHLY' THEN ls.value ELSE 0 END)::float8, 0) as valor_mensais,
        COALESCE((
          SELECT
            SUM(CASE WHEN cycle = 'MONTHLY' THEN value
                     WHEN cycle = 'YEARLY'  THEN value / 12
                     ELSE 0 END)::float8
          FROM lead_subscriptions
          WHERE subscription_status = 'active'
        ), 0) as mrr,
        COALESCE((
          SELECT COUNT(DISTINCT lead_id)::int
          FROM lead_subscriptions
          WHERE subscription_status = 'active'
        ), 0) as clientes_ativos,
        COALESCE((
          SELECT COUNT(DISTINCT lead_id)::int
          FROM lead_subscriptions
          WHERE subscription_status IN ('past_due', 'canceled')
        ), 0) as em_risco
      FROM lead_subscriptions ls
      JOIN leads l ON l.id = ls.lead_id
      WHERE ls.created_at >= ${f.start}::date
        AND ls.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        AND (${src}::text IS NULL OR EXISTS (
          SELECT 1 FROM lead_form_submit lfs
          WHERE lfs.lead_id = l.id
          AND lfs.utm_data->>'utm_source' = ${src}
        ))
    `,
    // Conversão contrato → billing no período
    sql`
      SELECT
        COUNT(CASE WHEN has_contract = true THEN 1 END)::int as assinou,
        COUNT(CASE WHEN has_billing  = true THEN 1 END)::int as pagou
      FROM leads l
      WHERE l.created_at >= ${f.start}::date
        AND l.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        AND (${src}::text IS NULL OR EXISTS (
          SELECT 1 FROM lead_form_submit lfs
          WHERE lfs.lead_id = l.id
          AND lfs.utm_data->>'utm_source' = ${src}
        ))
    `,
  ]);

  return {
    totalCobrado:        n(pagamentos[0]?.total_cobrado),
    valorNovosContratos: n(ciclos[0]?.valor_novos_contratos),
    mrr:                 n(ciclos[0]?.mrr),
    clientesAtivos:      n(ciclos[0]?.clientes_ativos),
    emRisco:             n(ciclos[0]?.em_risco),
    qtdNovosAnuais:      n(ciclos[0]?.qtd_anuais),
    valorNovosAnuais:    n(ciclos[0]?.valor_anuais),
    qtdNovosMensais:     n(ciclos[0]?.qtd_mensais),
    valorNovosMensais:   n(ciclos[0]?.valor_mensais),
    assinou:             n(contratos[0]?.assinou),
    pagou:               n(contratos[0]?.pagou),
  };
}

// ── CONVERSÃO ─────────────────────────────────────────────────────────────────

export async function getConversaoMetrics(f: VendasFilters): Promise<ConversaoData> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  const [principal, multiplos, reentradas, quicam] = await Promise.all([
    sql`
      WITH period_leads AS (
        SELECT l.id, l.has_contract, l.has_billing, l.has_started_chatwoot_conversation
        FROM leads l
        WHERE l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
          AND (${src}::text IS NULL OR EXISTS (
            SELECT 1 FROM lead_form_submit lfs
            WHERE lfs.lead_id = l.id
            AND lfs.utm_data->>'utm_source' = ${src}
          ))
      )
      SELECT
        COUNT(*)::int                                                                  as total,
        COUNT(CASE WHEN has_billing  = true               THEN 1 END)::int            as fechamentos,
        COUNT(CASE WHEN has_contract = true               THEN 1 END)::int            as tem_contrato,
        COUNT(CASE WHEN has_contract = true AND has_billing = false THEN 1 END)::int  as inadimplentes,
        COUNT(CASE WHEN has_started_chatwoot_conversation = true THEN 1 END)::int     as tem_conversa
      FROM period_leads
    `,
    // Leads com múltiplas submissões de formulário
    sql`
      SELECT COUNT(*)::int as multiplos
      FROM (
        SELECT lfs.lead_id
        FROM lead_form_submit lfs
        JOIN leads l ON l.id = lfs.lead_id
        WHERE l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        GROUP BY lfs.lead_id
        HAVING COUNT(*) > 1
      ) sub
    `,
    // Perdidos que reentram no funil
    sql`
      SELECT COUNT(DISTINCT ll.lead_id)::int as reentradas
      FROM lead_losses ll
      JOIN leads l ON l.id = ll.lead_id
      WHERE l.created_at >= ${f.start}::date
        AND l.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        AND EXISTS (
          SELECT 1 FROM lead_form_submit lfs
          WHERE lfs.lead_id = ll.lead_id
            AND lfs.created_at::timestamp > ll.created_at
        )
    `,
    // Clientes que quicam: assinaturas congeladas em menos de 15 dias após criação
    sql`
      SELECT COUNT(*)::int as quicam
      FROM lead_subscriptions ls
      JOIN leads l ON l.id = ls.lead_id
      WHERE l.created_at >= ${f.start}::date
        AND l.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND ls.is_frozen = true
        AND ls.frozen_at IS NOT NULL
        AND ls.frozen_at - ls.created_at < INTERVAL '15 days'
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
    `,
  ]);

  const leadsEntrados = n(principal[0]?.total);
  const fechamentos   = n(principal[0]?.fechamentos);

  return {
    leadsEntrados,
    fechamentos,
    closeRate:         leadsEntrados > 0 ? fechamentos / leadsEntrados : 0,
    multiplosEntradas: n(multiplos[0]?.multiplos),
    reentradas:        n(reentradas[0]?.reentradas),
    quicam:            n(quicam[0]?.quicam),
    inadimplentes:     n(principal[0]?.inadimplentes),
    funnelEntrados:    leadsEntrados,
    funnelTemConversa: n(principal[0]?.tem_conversa),
    funnelTemContrato: n(principal[0]?.tem_contrato),
    funnelTemBilling:  fechamentos,
  };
}

// ── VELOCIDADE ────────────────────────────────────────────────────────────────

export async function getVelocidadeMetrics(f: VendasFilters): Promise<VelocidadeData> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  const [frt, timeBetween, msgsFechar, msgsPerdido] = await Promise.all([
    // FRT p50/p90 + 2ª resposta p50/p90
    sql`
      WITH human_msgs AS (
        SELECT
          cm.lead_id,
          cm.created_at,
          ROW_NUMBER() OVER (PARTITION BY cm.lead_id ORDER BY cm.created_at) as rn
        FROM chatwoot_messages cm
        JOIN leads l ON l.id = cm.lead_id
        WHERE cm.lead_id IS NOT NULL
          AND cm.employee_id IS NOT NULL
          AND cm.ai_processed_at IS NULL
          AND l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
          AND (${src}::text IS NULL OR EXISTS (
            SELECT 1 FROM lead_form_submit lfs
            WHERE lfs.lead_id = l.id
            AND lfs.utm_data->>'utm_source' = ${src}
          ))
      ),
      frt_times AS (
        SELECT EXTRACT(EPOCH FROM (hm.created_at - l.created_at)) / 60 as minutes
        FROM human_msgs hm
        JOIN leads l ON l.id = hm.lead_id
        WHERE hm.rn = 1
          AND hm.created_at > l.created_at
          AND hm.created_at - l.created_at < INTERVAL '30 days'
      ),
      second_times AS (
        SELECT EXTRACT(EPOCH FROM (hm.created_at - l.created_at)) / 60 as minutes
        FROM human_msgs hm
        JOIN leads l ON l.id = hm.lead_id
        WHERE hm.rn = 2
          AND hm.created_at - l.created_at < INTERVAL '30 days'
      )
      SELECT
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY frt.minutes) as frt_p50,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY frt.minutes) as frt_p90,
        (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) FROM second_times) as second_p50,
        (SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes) FROM second_times) as second_p90
      FROM frt_times frt
    `,
    // Tempo entre respostas humanas consecutivas
    sql`
      WITH human_msgs AS (
        SELECT
          cm.lead_id,
          cm.created_at,
          LAG(cm.created_at) OVER (PARTITION BY cm.lead_id ORDER BY cm.created_at) as prev_at
        FROM chatwoot_messages cm
        JOIN leads l ON l.id = cm.lead_id
        WHERE cm.lead_id IS NOT NULL
          AND cm.employee_id IS NOT NULL
          AND cm.ai_processed_at IS NULL
          AND l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
      ),
      intervals AS (
        SELECT EXTRACT(EPOCH FROM (created_at - prev_at)) / 60 as minutes
        FROM human_msgs
        WHERE prev_at IS NOT NULL
          AND created_at - prev_at < INTERVAL '7 days'
          AND created_at - prev_at > INTERVAL '30 seconds'
      )
      SELECT
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) as p50,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes) as p90
      FROM intervals
    `,
    // Qtd mensagens até fechamento
    sql`
      WITH msg_counts AS (
        SELECT cm.lead_id, COUNT(*)::int as cnt
        FROM chatwoot_messages cm
        JOIN leads l ON l.id = cm.lead_id
        WHERE cm.lead_id IS NOT NULL
          AND l.has_billing = true
          AND l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        GROUP BY cm.lead_id
      )
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cnt) as p50 FROM msg_counts
    `,
    // Qtd mensagens até perdido
    sql`
      WITH msg_counts AS (
        SELECT cm.lead_id, COUNT(*)::int as cnt
        FROM chatwoot_messages cm
        JOIN leads l ON l.id = cm.lead_id
        WHERE cm.lead_id IS NOT NULL
          AND l.has_billing = false
          AND EXISTS (SELECT 1 FROM lead_losses ll WHERE ll.lead_id = l.id)
          AND l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        GROUP BY cm.lead_id
      )
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cnt) as p50 FROM msg_counts
    `,
  ]);

  return {
    frtP50:            toFloat(frt[0]?.frt_p50),
    frtP90:            toFloat(frt[0]?.frt_p90),
    secondRespP50:     toFloat(frt[0]?.second_p50),
    secondRespP90:     toFloat(frt[0]?.second_p90),
    timeBetweenP50:    toFloat(timeBetween[0]?.p50),
    timeBetweenP90:    toFloat(timeBetween[0]?.p90),
    msgsAteFecharP50:  toFloat(msgsFechar[0]?.p50),
    msgsAtePerdidoP50: toFloat(msgsPerdido[0]?.p50),
  };
}

// ── PERDA ─────────────────────────────────────────────────────────────────────

export async function getPerdaMetrics(
  f: VendasFilters,
  leadsEntrados = 0
): Promise<PerdaData> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  const [declarados, ghosting, reentradas] = await Promise.all([
    sql`
      SELECT COUNT(*)::int as total
      FROM lead_losses ll
      JOIN leads l ON l.id = ll.lead_id
      WHERE l.created_at >= ${f.start}::date
        AND l.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        AND (${src}::text IS NULL OR EXISTS (
          SELECT 1 FROM lead_form_submit lfs
          WHERE lfs.lead_id = l.id
          AND lfs.utm_data->>'utm_source' = ${src}
        ))
    `,
    // Ghosting: sem billing, sem perda declarada, com ao menos 1 mensagem, sem msg nos últimos 7 dias
    sql`
      SELECT COUNT(*)::int as total
      FROM leads l
      WHERE l.created_at >= ${f.start}::date
        AND l.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND l.has_billing = false
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        AND (${src}::text IS NULL OR EXISTS (
          SELECT 1 FROM lead_form_submit lfs
          WHERE lfs.lead_id = l.id
          AND lfs.utm_data->>'utm_source' = ${src}
        ))
        AND NOT EXISTS (SELECT 1 FROM lead_losses ll WHERE ll.lead_id = l.id)
        AND EXISTS     (SELECT 1 FROM chatwoot_messages cm WHERE cm.lead_id = l.id)
        AND NOT EXISTS (
          SELECT 1 FROM chatwoot_messages cm
          WHERE cm.lead_id = l.id
            AND cm.created_at > NOW() - INTERVAL '7 days'
        )
    `,
    sql`
      SELECT COUNT(DISTINCT ll.lead_id)::int as reentradas
      FROM lead_losses ll
      JOIN leads l ON l.id = ll.lead_id
      WHERE l.created_at >= ${f.start}::date
        AND l.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        AND EXISTS (
          SELECT 1 FROM lead_form_submit lfs
          WHERE lfs.lead_id = ll.lead_id
            AND lfs.created_at::timestamp > ll.created_at
        )
    `,
  ]);

  const pdecl  = n(declarados[0]?.total);
  const pghost = n(ghosting[0]?.total);

  return {
    perdidosDeclarados: pdecl,
    perdidosGhosting:   pghost,
    taxaPerda: leadsEntrados > 0 ? (pdecl + pghost) / leadsEntrados : 0,
    reentradas: n(reentradas[0]?.reentradas),
  };
}

// ── LEADS POR DIA ─────────────────────────────────────────────────────────────

export async function getLeadsPorDia(f: VendasFilters): Promise<LeadDia[]> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  const rows = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('day', l.created_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') as date,
      COUNT(*)::int as count
    FROM leads l
    WHERE l.created_at >= ${f.start}::date
      AND l.created_at < (${f.end}::date + interval '1 day')
      AND l.deleted_at IS NULL
      AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
      AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
      AND (${src}::text IS NULL OR EXISTS (
        SELECT 1 FROM lead_form_submit lfs
        WHERE lfs.lead_id = l.id
        AND lfs.utm_data->>'utm_source' = ${src}
      ))
    GROUP BY DATE_TRUNC('day', l.created_at AT TIME ZONE 'America/Sao_Paulo')
    ORDER BY 1
  `;

  return rows.map((r) => ({ date: String(r.date), count: n(r.count) }));
}

// ── FILTER OPTIONS ────────────────────────────────────────────────────────────

export async function getFilterOptions(): Promise<FilterOptions> {
  const sql = getSql();

  const [sources, variants] = await Promise.all([
    sql`
      SELECT DISTINCT utm_data->>'utm_source' as source
      FROM lead_form_submit
      WHERE utm_data->>'utm_source' IS NOT NULL
        AND utm_data->>'utm_source' != ''
      ORDER BY 1
    `,
    sql`
      SELECT DISTINCT landing_variant, pricing_variant
      FROM leads
      WHERE (landing_variant IS NOT NULL OR pricing_variant IS NOT NULL)
        AND deleted_at IS NULL
    `,
  ]);

  return {
    sources: sources.map((r) => String(r.source)).filter(Boolean),
    landingVariants: [
      ...new Set(variants.map((r) => r.landing_variant).filter(Boolean)),
    ] as string[],
    pricingVariants: [
      ...new Set(variants.map((r) => r.pricing_variant).filter(Boolean)),
    ] as string[],
  };
}
