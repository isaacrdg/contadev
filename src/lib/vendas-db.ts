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
  // Conversão acesso → pagamento
  assinou: number;
  pagou: number;
  // Upgrades mensal → anual no período (expansão)
  upgrades: number;
}

export interface ConversaoData {
  leadsEntrados: number;
  fechamentos: number;       // pagaram (subscription_status='active')
  closeRate: number;         // pagaram / leads
  acessos: number;           // recebeu acesso (has_billing = billing criado)
  taxaPagamento: number;     // pagaram / acessos (conversão acesso→pagamento)
  perdaPagamento: number;    // entrou e NÃO pagou (pending, sem active)
  inadimplentes: number;     // cliente que parou de pagar (past_due, sem active)
  multiplosEntradas: number;
  reentradas: number;
  quicam: number;
  funnelEntrados: number;
  funnelTemConversa: number;
  funnelAcesso: number;      // has_billing
  funnelPagou: number;       // active
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
  // Distribuição em 7 faixas: <5m, 5–15m, 15–30m, 30–60m, 1–4h, 4–24h, >1d
  frtDist: number[];
  secondDist: number[];
  betweenDist: number[];
}

// Limiares (em minutos) das faixas de distribuição de tempo
export const DIST_THRESHOLDS = [5, 15, 30, 60, 240, 1440];

export interface PerdaData {
  perdidosDeclarados: number;
  perdidosGhosting: number;
  taxaPerda: number;
  reentradas: number;
  // Cancelamentos de assinatura no período (churn real, ended_reason='canceled')
  cancelamentos: number;
}

export interface LeadDia {
  date: string;
  count: number;
}

export interface ReceitaDia {
  date: string;
  valor: number;
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
// json_object_agg({bucket: count}) → array fixo de 7 faixas
const toDist = (j: unknown): number[] => {
  const o = (j ?? {}) as Record<string, number>;
  return Array.from({ length: DIST_THRESHOLDS.length + 1 }, (_, i) => Number(o[i] ?? 0));
};

// ── RECEITA ───────────────────────────────────────────────────────────────────

export async function getReceitaMetrics(f: VendasFilters): Promise<ReceitaData> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  const [pagamentos, ciclos, contratos, upgradesQ] = await Promise.all([
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
          -- MRR: uma assinatura ativa por cliente (a mais recente), pra não contar
          -- assinatura duplicada (sobra de migração) do mesmo lead.
          SELECT SUM(CASE WHEN cycle = 'MONTHLY' THEN value
                          WHEN cycle = 'YEARLY'  THEN value / 12
                          ELSE 0 END)::float8
          FROM (
            SELECT DISTINCT ON (lead_id) lead_id, cycle, value
            FROM lead_subscriptions
            WHERE subscription_status = 'active'
            ORDER BY lead_id, created_at DESC
          ) ativa_por_cliente
        ), 0) as mrr,
        COALESCE((
          SELECT COUNT(DISTINCT lead_id)::int
          FROM lead_subscriptions
          WHERE subscription_status = 'active'
        ), 0) as clientes_ativos,
        COALESCE((
          -- Em risco = atrasados no pagamento hoje (past_due). Cancelados é outra métrica.
          SELECT COUNT(DISTINCT lead_id)::int
          FROM lead_subscriptions
          WHERE subscription_status = 'past_due'
        ), 0) as em_risco
      FROM lead_subscriptions ls
      JOIN leads l ON l.id = ls.lead_id
      WHERE ls.created_at >= ${f.start}::date
        AND ls.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        -- Só a PRIMEIRA assinatura de cada lead conta como contrato novo
        -- (exclui migração de gateway e upgrade, que criam nova assinatura do mesmo cliente).
        AND NOT EXISTS (
          SELECT 1 FROM lead_subscriptions x
          WHERE x.lead_id = ls.lead_id AND x.created_at < ls.created_at
        )
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        AND (${src}::text IS NULL OR EXISTS (
          SELECT 1 FROM lead_form_submit lfs
          WHERE lfs.lead_id = l.id
          AND lfs.utm_data->>'utm_source' = ${src}
        ))
    `,
    // Conversão acesso (billing criado) → pagamento (assinatura active) no período
    sql`
      SELECT
        COUNT(*) FILTER (WHERE has_billing = true)::int as assinou,
        COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM lead_subscriptions ls
          WHERE ls.lead_id = l.id AND ls.subscription_status = 'active'
        ))::int as pagou
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
    // Upgrades mensal → anual no período (subscription_history)
    sql`
      SELECT COUNT(DISTINCT sh.lead_id)::int as upgrades
      FROM subscription_history sh
      JOIN leads l ON l.id = sh.lead_id
      WHERE sh.ended_reason = 'monthly_to_annual_promotion'
        AND sh.ended_at >= ${f.start}::date
        AND sh.ended_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
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
    upgrades:            n(upgradesQ[0]?.upgrades),
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
        SELECT
          l.id,
          l.has_billing,
          l.has_started_chatwoot_conversation,
          EXISTS (SELECT 1 FROM lead_subscriptions ls WHERE ls.lead_id = l.id AND ls.subscription_status = 'active')   as is_active,
          EXISTS (SELECT 1 FROM lead_subscriptions ls WHERE ls.lead_id = l.id AND ls.subscription_status = 'pending')  as is_pending,
          EXISTS (SELECT 1 FROM lead_subscriptions ls WHERE ls.lead_id = l.id AND ls.subscription_status = 'past_due') as is_past_due
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
        COUNT(*)::int                                                            as total,
        COUNT(*) FILTER (WHERE is_active)::int                                   as pagaram,
        COUNT(*) FILTER (WHERE has_billing = true)::int                          as acessos,
        COUNT(*) FILTER (WHERE is_pending  AND NOT is_active)::int               as perda_pagamento,
        COUNT(*) FILTER (WHERE is_past_due AND NOT is_active)::int               as inadimplentes,
        COUNT(*) FILTER (WHERE has_started_chatwoot_conversation = true)::int    as tem_conversa
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
    // Clientes que quicam: assinou e CANCELOU em menos de 15 dias.
    // Fonte: subscription_history (started_at/ended_at/ended_reason).
    // IMPORTANTE: filtrar ended_reason='canceled' — os demais encerramentos
    // (gateway_switch, monthly_to_annual_promotion, admin_replace) NÃO são churn.
    sql`
      SELECT COUNT(DISTINCT sh.lead_id)::int as quicam
      FROM subscription_history sh
      JOIN leads l ON l.id = sh.lead_id
      WHERE l.created_at >= ${f.start}::date
        AND l.created_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND sh.ended_at IS NOT NULL
        AND sh.ended_reason = 'canceled'
        AND sh.ended_at - sh.started_at < INTERVAL '15 days'
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
    `,
  ]);

  const leadsEntrados = n(principal[0]?.total);
  const fechamentos   = n(principal[0]?.pagaram);   // pagaram (active)
  const acessos       = n(principal[0]?.acessos);   // has_billing

  return {
    leadsEntrados,
    fechamentos,
    closeRate:         leadsEntrados > 0 ? fechamentos / leadsEntrados : 0,
    acessos,
    taxaPagamento:     acessos > 0 ? fechamentos / acessos : 0,
    perdaPagamento:    n(principal[0]?.perda_pagamento),
    inadimplentes:     n(principal[0]?.inadimplentes),
    multiplosEntradas: n(multiplos[0]?.multiplos),
    reentradas:        n(reentradas[0]?.reentradas),
    quicam:            n(quicam[0]?.quicam),
    funnelEntrados:    leadsEntrados,
    funnelTemConversa: n(principal[0]?.tem_conversa),
    funnelAcesso:      acessos,
    funnelPagou:       fechamentos,
  };
}

// ── VELOCIDADE ────────────────────────────────────────────────────────────────

export async function getVelocidadeMetrics(f: VendasFilters): Promise<VelocidadeData> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  // Respostas HUMANAS do vendedor ficam em chatwoot_outgoing_message_requests
  // (ligadas ao lead via chatwoot_conversations). source distingue humano
  // (conversation_text/attachments) de automação (scheduled_message/welcome).
  // chatwoot_messages guarda só as mensagens de ENTRADA (do lead).
  const HUMAN_SOURCES = ["conversation_text", "conversation_attachments"];

  const [frt, timeBetween, msgsFechar, msgsPerdido] = await Promise.all([
    // FRT p50/p90 + 2ª resposta p50/p90 + distribuições
    sql`
      WITH human_msgs AS (
        SELECT
          c.lead_id,
          r.created_at,
          ROW_NUMBER() OVER (PARTITION BY c.lead_id ORDER BY r.created_at) as rn
        FROM chatwoot_outgoing_message_requests r
        JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
        JOIN leads l ON l.id = c.lead_id
        WHERE r.source = ANY(${HUMAN_SOURCES})
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
        (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) FROM frt_times)    as frt_p50,
        (SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes) FROM frt_times)    as frt_p90,
        (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) FROM second_times) as second_p50,
        (SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes) FROM second_times) as second_p90,
        (SELECT json_object_agg(b, c) FROM (
          SELECT width_bucket(minutes, ARRAY[5,15,30,60,240,1440]) as b, COUNT(*) as c
          FROM frt_times GROUP BY 1
        ) fb) as frt_dist,
        (SELECT json_object_agg(b, c) FROM (
          SELECT width_bucket(minutes, ARRAY[5,15,30,60,240,1440]) as b, COUNT(*) as c
          FROM second_times GROUP BY 1
        ) sb) as second_dist
    `,
    // Tempo entre respostas humanas consecutivas
    sql`
      WITH human_msgs AS (
        SELECT
          c.lead_id,
          r.created_at,
          LAG(r.created_at) OVER (PARTITION BY c.lead_id ORDER BY r.created_at) as prev_at
        FROM chatwoot_outgoing_message_requests r
        JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
        JOIN leads l ON l.id = c.lead_id
        WHERE r.source = ANY(${HUMAN_SOURCES})
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
        (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes) FROM intervals) as p50,
        (SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes) FROM intervals) as p90,
        (SELECT json_object_agg(b, c) FROM (
          SELECT width_bucket(minutes, ARRAY[5,15,30,60,240,1440]) as b, COUNT(*) as c
          FROM intervals GROUP BY 1
        ) ib) as dist
    `,
    // Qtd mensagens até fechamento — total da conversa (entrada + saída)
    sql`
      WITH msg_counts AS (
        SELECT
          (SELECT COUNT(*) FROM chatwoot_messages cm WHERE cm.lead_id = l.id)
          + (SELECT COUNT(*) FROM chatwoot_outgoing_message_requests r
             JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
             WHERE c.lead_id = l.id) as cnt
        FROM leads l
        WHERE l.has_billing = true
          AND l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
      )
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY cnt) as p50 FROM msg_counts
    `,
    // Qtd mensagens até perdido — total da conversa, leads perdidos (declarados)
    sql`
      WITH msg_counts AS (
        SELECT
          (SELECT COUNT(*) FROM chatwoot_messages cm WHERE cm.lead_id = l.id)
          + (SELECT COUNT(*) FROM chatwoot_outgoing_message_requests r
             JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
             WHERE c.lead_id = l.id) as cnt
        FROM leads l
        WHERE l.has_billing = false
          AND EXISTS (SELECT 1 FROM lead_losses ll WHERE ll.lead_id = l.id)
          AND l.created_at >= ${f.start}::date
          AND l.created_at < (${f.end}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
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
    frtDist:           toDist(frt[0]?.frt_dist),
    secondDist:        toDist(frt[0]?.second_dist),
    betweenDist:       toDist(timeBetween[0]?.dist),
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

  const [declarados, ghosting, reentradas, canceladasQ] = await Promise.all([
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
          -- Determinístico: 7 dias relativos ao FIM do período, não a "hoje".
          SELECT 1 FROM chatwoot_messages cm
          WHERE cm.lead_id = l.id
            AND cm.created_at > (${f.end}::date + interval '1 day') - INTERVAL '7 days'
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
    // Cancelamentos de assinatura no período (churn real) — quando ocorreu (ended_at)
    sql`
      SELECT COUNT(DISTINCT sh.lead_id)::int as cancelamentos
      FROM subscription_history sh
      JOIN leads l ON l.id = sh.lead_id
      WHERE sh.ended_reason = 'canceled'
        AND sh.ended_at >= ${f.start}::date
        AND sh.ended_at < (${f.end}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
    `,
  ]);

  const pdecl  = n(declarados[0]?.total);
  const pghost = n(ghosting[0]?.total);

  return {
    perdidosDeclarados: pdecl,
    perdidosGhosting:   pghost,
    taxaPerda: leadsEntrados > 0 ? (pdecl + pghost) / leadsEntrados : 0,
    reentradas: n(reentradas[0]?.reentradas),
    cancelamentos: n(canceladasQ[0]?.cancelamentos),
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

// ── MÉTRICAS COMPLEMENTARES ───────────────────────────────────────────────────

export interface ComplementarData {
  velocidadeFechamentoHoras: number | null;
  funilEstagio: { estagio: string; n: number }[];
  produtividade: { vendedor: string; leads: number; pagantes: number }[];
  motivosPerda: { motivo: string; n: number }[];
}

export async function getComplementares(f: VendasFilters): Promise<ComplementarData> {
  const sql = getSql();
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;
  const ini = f.start, fim = f.end;

  const [vel, estagio, prod, motivos] = await Promise.all([
    // Velocidade de fechamento: lead criado → primeiro pagamento (mediana, horas)
    sql`
      WITH pagos AS (
        SELECT l.id, l.created_at, MIN(sp.paid_at) as first_paid
        FROM leads l JOIN subscription_payments sp ON sp.lead_id = l.id
        WHERE sp.status = 'paid'
          AND l.created_at >= ${ini}::date AND l.created_at < (${fim}::date + interval '1 day')
          AND l.deleted_at IS NULL
          AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
          AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
        GROUP BY l.id, l.created_at
      )
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (first_paid - created_at)) / 3600) as horas
      FROM pagos WHERE first_paid > created_at
    `,
    // Funil por estágio do CRM: onde estão os leads do período
    sql`
      SELECT cs.name as estagio, cs.position, COUNT(l.id)::int as n
      FROM crm_stages cs
      LEFT JOIN leads l ON l.crm_stage_id = cs.id AND l.deleted_at IS NULL
        AND l.created_at >= ${ini}::date AND l.created_at < (${fim}::date + interval '1 day')
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
      GROUP BY cs.id, cs.name, cs.position
      HAVING COUNT(l.id) > 0
      ORDER BY cs.position
    `,
    // Produtividade por vendedor (atribuição atual de leads.assigned_employee_id)
    sql`
      SELECT e.name as vendedor,
        COUNT(l.id)::int as leads,
        COUNT(l.id) FILTER (WHERE EXISTS (SELECT 1 FROM lead_subscriptions s WHERE s.lead_id = l.id AND s.subscription_status = 'active'))::int as pagantes
      FROM leads l JOIN employees e ON e.id = l.assigned_employee_id
      WHERE l.created_at >= ${ini}::date AND l.created_at < (${fim}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
      GROUP BY e.id, e.name
      ORDER BY pagantes DESC, leads DESC
      LIMIT 10
    `,
    // Motivos de perda (lead_losses + lead_loss_reasons)
    sql`
      SELECT COALESCE(lr.name, '(sem motivo)') as motivo, COUNT(*)::int as n
      FROM lead_losses ll
      LEFT JOIN lead_loss_reasons lr ON lr.id = ll.loss_reason_id
      JOIN leads l ON l.id = ll.lead_id
      WHERE l.created_at >= ${ini}::date AND l.created_at < (${fim}::date + interval '1 day')
        AND l.deleted_at IS NULL
        AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
        AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
      GROUP BY lr.name ORDER BY n DESC LIMIT 8
    `,
  ]);

  return {
    velocidadeFechamentoHoras: toFloat(vel[0]?.horas),
    funilEstagio: estagio.map((r) => ({ estagio: String(r.estagio), n: n(r.n) })),
    produtividade: prod.map((r) => ({ vendedor: String(r.vendedor), leads: n(r.leads), pagantes: n(r.pagantes) })),
    motivosPerda: motivos.map((r) => ({ motivo: String(r.motivo), n: n(r.n) })),
  };
}

// ── EXPLORADOR DE BANCO (schema, read-only) ──────────────────────────────────

export interface TabelaInfo {
  tabela: string;
  colunas: { nome: string; tipo: string }[];
}

export async function getSchema(): Promise<TabelaInfo[]> {
  const sql = getSql();
  // information_schema é metadado (barato, não varre dados).
  const rows = await sql`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;
  const map = new Map<string, { nome: string; tipo: string }[]>();
  for (const r of rows) {
    const t = String(r.table_name);
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push({ nome: String(r.column_name), tipo: String(r.data_type) });
  }
  return Array.from(map.entries()).map(([tabela, colunas]) => ({ tabela, colunas }));
}

// ── RECEITA NOVA POR DIA ──────────────────────────────────────────────────────

export async function getReceitaPorDia(f: VendasFilters): Promise<ReceitaDia[]> {
  const sql = getSql();
  const src = f.source || null;
  const lv = f.landingVariant || null;
  const pv = f.pricingVariant || null;

  const rows = await sql`
    SELECT
      TO_CHAR(DATE_TRUNC('day', ls.created_at AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM-DD') as date,
      COALESCE(SUM(ls.value)::float8, 0) as valor
    FROM lead_subscriptions ls
    JOIN leads l ON l.id = ls.lead_id
    WHERE ls.created_at >= ${f.start}::date
      AND ls.created_at < (${f.end}::date + interval '1 day')
      AND l.deleted_at IS NULL
      -- só primeira assinatura de cada lead (igual aos novos contratos)
      AND NOT EXISTS (SELECT 1 FROM lead_subscriptions x WHERE x.lead_id = ls.lead_id AND x.created_at < ls.created_at)
      AND (${lv}::text IS NULL OR l.landing_variant = ${lv})
      AND (${pv}::text IS NULL OR l.pricing_variant = ${pv})
      AND (${src}::text IS NULL OR EXISTS (
        SELECT 1 FROM lead_form_submit lfs
        WHERE lfs.lead_id = l.id AND lfs.utm_data->>'utm_source' = ${src}
      ))
    GROUP BY DATE_TRUNC('day', ls.created_at AT TIME ZONE 'America/Sao_Paulo')
    ORDER BY 1
  `;
  return rows.map((r) => ({ date: String(r.date), valor: n(r.valor) }));
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
