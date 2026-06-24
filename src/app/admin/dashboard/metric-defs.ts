// Definições auditáveis de cada métrica: de onde vem o dado, qual a regra e o
// SQL que a calcula. Usado no "lápis" de cada card pra revisão com o time.
// O período aparece como {{início}} / {{fim}}. Texto, não roda no banco.

export interface MetricDef {
  fonte: string;     // Neon (Postgres) ou PostHog
  tabelas: string;   // tabelas envolvidas
  campos: string;    // colunas usadas
  regra: string;     // a definição em linguagem de negócio
  sql: string;       // o SQL (ou consulta HogQL) que calcula
}

const NEON = "Neon (Postgres)";
const POSTHOG = "PostHog (HogQL)";

export const METRIC_DEF: Record<string, MetricDef> = {
  // ── Estado atual ──────────────────────────────────────────────────────────
  mrr: {
    fonte: NEON,
    tabelas: "lead_subscriptions",
    campos: "value, cycle, subscription_status, lead_id, created_at",
    regra: "Receita recorrente mensal. Soma o valor mensal equivalente de UMA assinatura ativa por cliente (a mais recente, pra não contar duplicata de migração). Plano anual entra dividido por 12. Não inclui past_due, pending nem canceled.",
    sql: `SELECT SUM(CASE WHEN cycle='MONTHLY' THEN value
                          WHEN cycle='YEARLY'  THEN value/12 END)
FROM (
  SELECT DISTINCT ON (lead_id) lead_id, cycle, value
  FROM lead_subscriptions
  WHERE subscription_status = 'active'
  ORDER BY lead_id, created_at DESC
) assinatura_ativa_por_cliente`,
  },
  clientes_ativos: {
    fonte: NEON,
    tabelas: "lead_subscriptions",
    campos: "lead_id, subscription_status",
    regra: "Quantos clientes têm assinatura ativa agora (distintos, sem duplicar quem tem mais de uma assinatura).",
    sql: `SELECT COUNT(DISTINCT lead_id)
FROM lead_subscriptions
WHERE subscription_status = 'active'`,
  },
  faturas_atraso: {
    fonte: NEON,
    tabelas: "overdue_billings, subscription_payments",
    campos: "lead_id, due_date, paid_at, deleted_at, exempted_at, value",
    regra: "Clientes com fatura vencida em aberto AGORA, que JÁ pagaram ao menos uma fatura (já viraram clientes). Fatura em aberto = não paga, não excluída, não isenta e já vencida. Métrica dinâmica: entra ao vencer, sai ao regularizar.",
    sql: `SELECT COUNT(DISTINCT ob.lead_id)
FROM overdue_billings ob
WHERE ob.paid_at IS NULL AND ob.deleted_at IS NULL
  AND ob.exempted_at IS NULL AND ob.due_date < now()
  AND EXISTS (SELECT 1 FROM subscription_payments sp
              WHERE sp.lead_id = ob.lead_id AND sp.status = 'paid')`,
  },
  // ── Receita no período ────────────────────────────────────────────────────
  receita_nova: {
    fonte: NEON,
    tabelas: "lead_subscriptions, leads",
    campos: "value, created_at, lead_id",
    regra: "Valor contratual das assinaturas NOVAS criadas no período. Conta só a PRIMEIRA assinatura de cada lead (exclui migração de gateway e upgrade, que são do mesmo cliente).",
    sql: `SELECT SUM(ls.value)
FROM lead_subscriptions ls JOIN leads l ON l.id = ls.lead_id
WHERE ls.created_at >= {{início}} AND ls.created_at < {{fim}}+1
  AND l.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM lead_subscriptions x
                  WHERE x.lead_id = ls.lead_id AND x.created_at < ls.created_at)`,
  },
  total_cobrado: {
    fonte: NEON,
    tabelas: "subscription_payments",
    campos: "value, status, paid_at",
    regra: "Tudo que foi efetivamente pago no período, incluindo recorrência (não só contratos novos).",
    sql: `SELECT SUM(value) FROM subscription_payments
WHERE status = 'paid'
  AND paid_at >= {{início}} AND paid_at < {{fim}}+1`,
  },
  ticket: {
    fonte: NEON,
    tabelas: "lead_subscriptions",
    campos: "value, cycle",
    regra: "Valor médio por contrato novo no período = Receita nova ÷ número de contratos novos (anuais + mensais).",
    sql: `-- receita_nova / (qtd_novos_anuais + qtd_novos_mensais)`,
  },
  novos_anuais: {
    fonte: NEON, tabelas: "lead_subscriptions, leads", campos: "cycle, value, created_at",
    regra: "Contratos novos no período com ciclo anual (primeira assinatura do lead).",
    sql: `SELECT COUNT(*), SUM(value) FROM lead_subscriptions ls JOIN leads l ON l.id=ls.lead_id
WHERE ls.cycle='YEARLY' AND ls.created_at >= {{início}} AND ls.created_at < {{fim}}+1
  AND NOT EXISTS (SELECT 1 FROM lead_subscriptions x WHERE x.lead_id=ls.lead_id AND x.created_at<ls.created_at)`,
  },
  novos_mensais: {
    fonte: NEON, tabelas: "lead_subscriptions, leads", campos: "cycle, value, created_at",
    regra: "Contratos novos no período com ciclo mensal (primeira assinatura do lead).",
    sql: `SELECT COUNT(*), SUM(value) FROM lead_subscriptions ls JOIN leads l ON l.id=ls.lead_id
WHERE ls.cycle='MONTHLY' AND ls.created_at >= {{início}} AND ls.created_at < {{fim}}+1
  AND NOT EXISTS (SELECT 1 FROM lead_subscriptions x WHERE x.lead_id=ls.lead_id AND x.created_at<ls.created_at)`,
  },
  // ── Conversão / funil ─────────────────────────────────────────────────────
  leads: {
    fonte: NEON, tabelas: "leads", campos: "created_at, deleted_at",
    regra: "Pessoas que entraram no funil no período (1 lead = 1 pessoa que preencheu o formulário).",
    sql: `SELECT COUNT(*) FROM leads
WHERE created_at >= {{início}} AND created_at < {{fim}}+1 AND deleted_at IS NULL`,
  },
  pagaram: {
    fonte: NEON, tabelas: "leads, lead_subscriptions", campos: "created_at, subscription_status",
    regra: "Leads que ENTRARAM no período e viraram pagantes (têm assinatura ativa). É por coorte: olha quem entrou no período, não quando pagou.",
    sql: `SELECT COUNT(*) FROM leads l
WHERE l.created_at >= {{início}} AND l.created_at < {{fim}}+1 AND l.deleted_at IS NULL
  AND EXISTS (SELECT 1 FROM lead_subscriptions s WHERE s.lead_id=l.id AND s.subscription_status='active')`,
  },
  close_rate: {
    fonte: NEON, tabelas: "leads, lead_subscriptions", campos: "—",
    regra: "Taxa de fechamento = leads do período que pagaram ÷ total de leads do período.",
    sql: `-- pagaram / leads`,
  },
  acessos: {
    fonte: NEON, tabelas: "leads", campos: "has_billing, created_at",
    regra: "Leads do período que receberam acesso à plataforma (billing criado = entraram no fluxo de pagamento).",
    sql: `SELECT COUNT(*) FROM leads
WHERE created_at >= {{início}} AND created_at < {{fim}}+1 AND deleted_at IS NULL
  AND has_billing = true`,
  },
  taxa_pagamento: {
    fonte: NEON, tabelas: "leads, lead_subscriptions", campos: "has_billing, subscription_status",
    regra: "De quem recebeu acesso, quantos pagaram = pagaram ÷ acessos. Mede a perda entre receber acesso e pagar.",
    sql: `-- pagaram(active) / acessos(has_billing)`,
  },
  inad_primeiro: {
    fonte: NEON, tabelas: "leads, lead_subscriptions", campos: "subscription_status",
    regra: "Calote de 1º pagamento: recebeu acesso (status pending) e NUNCA pagou nenhuma fatura. Diferente de cliente que pagou e atrasou.",
    sql: `SELECT COUNT(*) FROM leads l
WHERE l.created_at >= {{início}} AND l.created_at < {{fim}}+1 AND l.deleted_at IS NULL
  AND EXISTS     (SELECT 1 FROM lead_subscriptions s WHERE s.lead_id=l.id AND s.subscription_status='pending')
  AND NOT EXISTS (SELECT 1 FROM lead_subscriptions s WHERE s.lead_id=l.id AND s.subscription_status='active')`,
  },
  // ── Velocidade de atendimento ─────────────────────────────────────────────
  frt: {
    fonte: NEON, tabelas: "chatwoot_outgoing_message_requests, chatwoot_conversations", campos: "created_at, source",
    regra: "Tempo até a 1ª resposta humana do vendedor (mediana p50; p90 = 90% respondem até esse tempo). Conta só mensagem humana de saída (source de conversa), não bot.",
    sql: `-- p50/p90 de (1ª saída humana - entrada do lead), por lead do período`,
  },
  segunda: { fonte: NEON, tabelas: "chatwoot_outgoing_message_requests", campos: "created_at", regra: "Tempo típico (p50) até a 2ª resposta humana.", sql: `-- p50 do intervalo até a 2ª saída humana` },
  entre: { fonte: NEON, tabelas: "chatwoot_outgoing_message_requests", campos: "created_at", regra: "Intervalo típico (p50) entre respostas consecutivas do vendedor.", sql: `-- p50 do intervalo entre saídas humanas consecutivas` },
  msgs_fechar: { fonte: NEON, tabelas: "chatwoot_messages, chatwoot_outgoing_message_requests", campos: "lead_id", regra: "Quantas mensagens (entrada+saída), típico (p50), até o lead pagar.", sql: `-- p50 do total de mensagens por lead que virou active` },
  // ── Retenção e perda ──────────────────────────────────────────────────────
  cancelamentos: {
    fonte: NEON, tabelas: "subscription_history", campos: "ended_reason, ended_at",
    regra: "Clientes que cancelaram a assinatura no período (churn real). Só ended_reason='canceled'; troca de gateway e upgrade NÃO contam.",
    sql: `SELECT COUNT(*) FROM subscription_history
WHERE ended_reason='canceled' AND ended_at >= {{início}} AND ended_at < {{fim}}+1`,
  },
  quicam: {
    fonte: NEON, tabelas: "subscription_history", campos: "started_at, ended_at, ended_reason",
    regra: "Clientes que quicaram: assinaram e cancelaram em menos de 15 dias.",
    sql: `SELECT COUNT(*) FROM subscription_history
WHERE ended_reason='canceled' AND (ended_at - started_at) < interval '15 days'`,
  },
  perda_silenciosa: {
    fonte: NEON, tabelas: "leads, chatwoot_messages, lead_losses", campos: "has_billing, created_at",
    regra: "Leads que tinham conversa (≥1 mensagem), não fecharam, não foram marcados como perdidos e sumiram há 7+ dias. Quem nunca respondeu não entra.",
    sql: `SELECT COUNT(*) FROM leads l
WHERE l.has_billing = false
  AND NOT EXISTS (SELECT 1 FROM lead_losses ll WHERE ll.lead_id=l.id)
  AND EXISTS     (SELECT 1 FROM chatwoot_messages cm WHERE cm.lead_id=l.id)
  AND NOT EXISTS (SELECT 1 FROM chatwoot_messages cm WHERE cm.lead_id=l.id AND cm.created_at > {{fim}} - 7)`,
  },
  // ── Aquisição (PostHog) ───────────────────────────────────────────────────
  visitantes: {
    fonte: POSTHOG, tabelas: "events ($pageview)", campos: "person_id, timestamp",
    regra: "Visitantes únicos do site no período (pessoas distintas com pageview).",
    sql: `SELECT count(DISTINCT person_id) FROM events
WHERE event='$pageview' AND toDate(timestamp) BETWEEN {{início}} AND {{fim}}`,
  },
  visita_lead: {
    fonte: POSTHOG, tabelas: "events (lead_created, $pageview)", campos: "person_id",
    regra: "Taxa de visitante que vira lead = leads criados ÷ visitantes únicos.",
    sql: `-- count(lead_created) / count(DISTINCT person_id no pageview)`,
  },
  // ── Gráficos ──────────────────────────────────────────────────────────────
  leads_dia: { fonte: NEON, tabelas: "leads", campos: "created_at", regra: "Leads por dia no período (contagem agrupada por dia da entrada).", sql: `SELECT date(created_at) dia, COUNT(*) FROM leads
WHERE created_at >= {{início}} AND created_at < {{fim}}+1 AND deleted_at IS NULL GROUP BY dia ORDER BY dia` },
  receita_dia: { fonte: NEON, tabelas: "lead_subscriptions", campos: "value, created_at", regra: "Valor de contratos novos por dia (primeira assinatura de cada lead).", sql: `SELECT date(ls.created_at) dia, SUM(ls.value) FROM lead_subscriptions ls
WHERE ls.created_at >= {{início}} AND ls.created_at < {{fim}}+1 GROUP BY dia ORDER BY dia` },
  pv_leads: { fonte: "PostHog + Neon", tabelas: "events ($pageview) + leads", campos: "timestamp / created_at", regra: "Page views por dia (PostHog) e leads por dia (Neon) no mesmo gráfico, eixos separados.", sql: `-- série de pageviews/dia (PostHog) + leads/dia (Neon)` },
  funil: { fonte: NEON, tabelas: "leads, lead_subscriptions, chatwoot_messages", campos: "has_billing, subscription_status", regra: "Funil: entraram → tiveram conversa → receberam acesso → pagaram.", sql: `-- contagem por etapa: leads, com mensagem, has_billing, active` },
  canais: { fonte: POSTHOG, tabelas: "events ($pageview)", campos: "$referring_domain", regra: "De onde vêm os visitantes (domínio de origem), top canais.", sql: `SELECT properties.$referring_domain, count() FROM events
WHERE event='$pageview' GROUP BY 1 ORDER BY 2 DESC` },
  comparativo: { fonte: "PostHog + Neon", tabelas: "leads, lead_subscriptions, events", campos: "—", regra: "Sobrepõe séries diárias escolhidas (leads, page views, receita nova) num gráfico só, eixo por unidade.", sql: `-- junta as séries diárias selecionadas por data` },
  // ── Complementares ────────────────────────────────────────────────────────
  faturas_atraso_dist: { fonte: NEON, tabelas: "overdue_billings", campos: "due_date", regra: "Clientes com fatura em atraso agrupados pela idade da fatura em aberto mais antiga (≤7d, 8-30d, 31-90d, +90d).", sql: `-- faixas de (now() - menor due_date em aberto) por cliente` },
  funil_estagio: { fonte: NEON, tabelas: "leads, crm_stages, lead_stage_history", campos: "crm_stage_id", regra: "Leads por estágio do CRM + tempo médio parado e quantos estão parados há +7 dias.", sql: `-- COUNT por estágio + aging via lead_stage_history` },
  produtividade: { fonte: NEON, tabelas: "leads, sales_people", campos: "owner/vendedor", regra: "Por vendedor: leads atribuídos e quantos viraram pagantes.", sql: `-- por vendedor: leads e pagantes` },
  motivos_perda: { fonte: NEON, tabelas: "lead_losses, lead_loss_reasons", campos: "name", regra: "Motivos de perda declarados, contagem por motivo.", sql: `SELECT lr.name, COUNT(*) FROM lead_losses ll JOIN lead_loss_reasons lr ON lr.id=ll.reason_id GROUP BY 1 ORDER BY 2 DESC` },
  conversao_canal_real: { fonte: "PostHog + Neon", tabelas: "events (lead_created) + lead_subscriptions", campos: "$initial_referring_domain", regra: "Por canal de origem (PostHog, por lead_id): quantos leads e quantos pagaram (Neon). Cruza canal real com pagamento.", sql: `-- canal por lead (PostHog) ⨝ pagamento (Neon) por lead_id` },
  coorte: { fonte: NEON, tabelas: "leads, lead_subscriptions", campos: "created_at", regra: "Por semana de entrada: % que pagou em 7, 14 e 30 dias.", sql: `-- coorte semanal: pagou em 7/14/30 dias após entrar` },
  frt_conversao: { fonte: NEON, tabelas: "chatwoot_outgoing_message_requests, lead_subscriptions", campos: "—", regra: "Close rate por faixa de tempo da 1ª resposta humana (até 1h, 1-4h, 4-24h, +1d, sem resposta).", sql: `-- close rate por faixa de FRT (width_bucket em minutos)` },
  sla_1h: { fonte: NEON, tabelas: "chatwoot_outgoing_message_requests", campos: "—", regra: "% dos leads cuja 1ª resposta humana veio em até 1 hora.", sql: `-- share da distribuição de FRT abaixo de 60 min` },
  sla_24h: { fonte: NEON, tabelas: "chatwoot_outgoing_message_requests", campos: "—", regra: "% dos leads cuja 1ª resposta humana veio em até 24 horas.", sql: `-- share da distribuição de FRT abaixo de 1440 min` },
  velocidade_fechamento: { fonte: NEON, tabelas: "leads, lead_subscriptions", campos: "created_at", regra: "Tempo típico entre o lead entrar e o primeiro pagamento.", sql: `-- p50 de (primeiro pagamento - created_at do lead)` },
};
