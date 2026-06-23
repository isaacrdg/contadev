-- ─────────────────────────────────────────────────────────────────────────────
-- Métricas de Engenharia de Vendas — prontas para o Metabase (SQL nativo)
--
-- Como usar:
--   1. No Metabase: + Novo → Pergunta SQL (Native query), banco = Neon.
--   2. Cole UMA query abaixo.
--   3. As variáveis {{start}} e {{end}} viram filtros de data automaticamente
--      (defina o tipo como "Data" no painel de variáveis à direita).
--   4. Salve. Para um card de número, use a query de um KPI só; para tabela,
--      as queries "agrupadas" devolvem vários KPIs numa linha.
--
-- Mesmas definições do dashboard nativo (ver docs/engenharia-vendas-metricas.md).
-- Tudo é somente leitura.
-- ─────────────────────────────────────────────────────────────────────────────


-- ══ RECEITA (linha única com todos os KPIs) ══════════════════════════════════
WITH novos AS (
  SELECT
    COALESCE(SUM(ls.value),0)::float8                                  AS valor_novos_contratos,
    COUNT(*) FILTER (WHERE ls.cycle='YEARLY')                          AS qtd_anuais,
    COALESCE(SUM(ls.value) FILTER (WHERE ls.cycle='YEARLY'),0)::float8 AS valor_anuais,
    COUNT(*) FILTER (WHERE ls.cycle='MONTHLY')                         AS qtd_mensais,
    COALESCE(SUM(ls.value) FILTER (WHERE ls.cycle='MONTHLY'),0)::float8 AS valor_mensais
  FROM lead_subscriptions ls
  JOIN leads l ON l.id = ls.lead_id
  WHERE ls.created_at >= {{start}} AND ls.created_at < ({{end}}::date + interval '1 day')
    AND l.deleted_at IS NULL
    -- Só a PRIMEIRA assinatura de cada lead conta como contrato novo
    -- (exclui migração de gateway e upgrade, que criam nova assinatura do mesmo cliente)
    AND NOT EXISTS (SELECT 1 FROM lead_subscriptions x WHERE x.lead_id = ls.lead_id AND x.created_at < ls.created_at)
)
SELECT
  (SELECT COALESCE(SUM(value),0)::float8 FROM subscription_payments
     WHERE status='paid' AND paid_at >= {{start}} AND paid_at < ({{end}}::date + interval '1 day')) AS total_cobrado,
  n.valor_novos_contratos, n.qtd_anuais, n.valor_anuais, n.qtd_mensais, n.valor_mensais,
  -- MRR: uma assinatura ativa por cliente (a mais recente), pra não contar assinatura duplicada
  (SELECT SUM(CASE WHEN cycle='MONTHLY' THEN value WHEN cycle='YEARLY' THEN value/12 ELSE 0 END)::float8
     FROM (SELECT DISTINCT ON (lead_id) lead_id, cycle, value FROM lead_subscriptions
           WHERE subscription_status='active' ORDER BY lead_id, created_at DESC) ativa_por_cliente) AS mrr,
  (SELECT COUNT(DISTINCT lead_id) FROM lead_subscriptions WHERE subscription_status='active')               AS clientes_ativos,
  -- Em risco = atrasados no pagamento hoje (past_due). Cancelados é outra métrica
  (SELECT COUNT(DISTINCT lead_id) FROM lead_subscriptions WHERE subscription_status='past_due')             AS em_risco,
  (SELECT COUNT(DISTINCT sh.lead_id) FROM subscription_history sh
     WHERE sh.ended_reason='monthly_to_annual_promotion'
       AND sh.ended_at >= {{start}} AND sh.ended_at < ({{end}}::date + interval '1 day')) AS upgrades_anual
FROM novos n;


-- ══ CONVERSÃO (linha única) ══════════════════════════════════════════════════
WITH period_leads AS (
  SELECT l.id, l.has_billing, l.has_started_chatwoot_conversation,
    EXISTS(SELECT 1 FROM lead_subscriptions s WHERE s.lead_id=l.id AND s.subscription_status='active')   AS is_active,
    EXISTS(SELECT 1 FROM lead_subscriptions s WHERE s.lead_id=l.id AND s.subscription_status='pending')  AS is_pending,
    EXISTS(SELECT 1 FROM lead_subscriptions s WHERE s.lead_id=l.id AND s.subscription_status='past_due') AS is_past_due
  FROM leads l
  WHERE l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
)
SELECT
  COUNT(*)                                                                                  AS leads_entrados,
  COUNT(*) FILTER (WHERE is_active)                                                          AS fechamentos_pagaram,
  ROUND(100.0*COUNT(*) FILTER (WHERE is_active)/NULLIF(COUNT(*),0),1)                        AS close_rate_pct,
  COUNT(*) FILTER (WHERE has_billing)                                                        AS acessos_billing,
  ROUND(100.0*COUNT(*) FILTER (WHERE is_active)/NULLIF(COUNT(*) FILTER (WHERE has_billing),0),1) AS taxa_pagamento_pct,
  COUNT(*) FILTER (WHERE is_pending  AND NOT is_active)                                      AS entrou_nao_pagou,
  COUNT(*) FILTER (WHERE is_past_due AND NOT is_active)                                      AS inadimplentes_past_due,
  COUNT(*) FILTER (WHERE has_started_chatwoot_conversation)                                  AS tem_conversa
FROM period_leads;


-- ══ VELOCIDADE — tempos de resposta HUMANA (p50/p90 em minutos) ══════════════
WITH human_msgs AS (
  SELECT c.lead_id, r.created_at,
    ROW_NUMBER() OVER (PARTITION BY c.lead_id ORDER BY r.created_at)        AS rn,
    LAG(r.created_at) OVER (PARTITION BY c.lead_id ORDER BY r.created_at)   AS prev_at
  FROM chatwoot_outgoing_message_requests r
  JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
  JOIN leads l ON l.id = c.lead_id
  WHERE r.source IN ('conversation_text','conversation_attachments')
    AND l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
),
frt AS (SELECT EXTRACT(EPOCH FROM (h.created_at-l.created_at))/60 m FROM human_msgs h JOIN leads l ON l.id=h.lead_id
        WHERE h.rn=1 AND h.created_at>l.created_at AND h.created_at-l.created_at<interval '30 days'),
seg AS (SELECT EXTRACT(EPOCH FROM (h.created_at-l.created_at))/60 m FROM human_msgs h JOIN leads l ON l.id=h.lead_id
        WHERE h.rn=2 AND h.created_at-l.created_at<interval '30 days'),
ent AS (SELECT EXTRACT(EPOCH FROM (created_at-prev_at))/60 m FROM human_msgs
        WHERE prev_at IS NOT NULL AND created_at-prev_at<interval '7 days' AND created_at-prev_at>interval '30 seconds')
SELECT
  ROUND((SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY m) FROM frt)::numeric,1) AS frt_p50_min,
  ROUND((SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY m) FROM frt)::numeric,1) AS frt_p90_min,
  ROUND((SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY m) FROM seg)::numeric,1) AS segunda_p50_min,
  ROUND((SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY m) FROM ent)::numeric,1) AS entre_resp_p50_min;


-- ══ VELOCIDADE — distribuição do FRT (gráfico de barras) ═════════════════════
WITH human_msgs AS (
  SELECT c.lead_id, r.created_at,
    ROW_NUMBER() OVER (PARTITION BY c.lead_id ORDER BY r.created_at) AS rn
  FROM chatwoot_outgoing_message_requests r
  JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
  JOIN leads l ON l.id = c.lead_id
  WHERE r.source IN ('conversation_text','conversation_attachments')
    AND l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
),
frt AS (SELECT EXTRACT(EPOCH FROM (h.created_at-l.created_at))/60 m FROM human_msgs h JOIN leads l ON l.id=h.lead_id
        WHERE h.rn=1 AND h.created_at>l.created_at AND h.created_at-l.created_at<interval '30 days')
SELECT CASE width_bucket(m, ARRAY[5,15,30,60,240,1440])
         WHEN 0 THEN '<5m' WHEN 1 THEN '5-15m' WHEN 2 THEN '15-30m' WHEN 3 THEN '30-60m'
         WHEN 4 THEN '1-4h' WHEN 5 THEN '4-24h' ELSE '>1d' END AS faixa,
       COUNT(*) AS leads
FROM frt GROUP BY 1 ORDER BY MIN(m);


-- ══ PERDA (linha única) ══════════════════════════════════════════════════════
SELECT
  (SELECT COUNT(*) FROM lead_losses ll JOIN leads l ON l.id=ll.lead_id
     WHERE l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL) AS perdidos_declarados,
  (SELECT COUNT(*) FROM leads l
     WHERE l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
       AND l.has_billing=false
       AND NOT EXISTS(SELECT 1 FROM lead_losses ll WHERE ll.lead_id=l.id)
       AND EXISTS(SELECT 1 FROM chatwoot_messages cm WHERE cm.lead_id=l.id)
       AND NOT EXISTS(SELECT 1 FROM chatwoot_messages cm WHERE cm.lead_id=l.id AND cm.created_at > now()-interval '7 days')) AS ghosting_7d,
  (SELECT COUNT(DISTINCT sh.lead_id) FROM subscription_history sh JOIN leads l ON l.id=sh.lead_id
     WHERE sh.ended_reason='canceled' AND sh.ended_at >= {{start}} AND sh.ended_at < ({{end}}::date + interval '1 day')
       AND l.deleted_at IS NULL) AS cancelamentos_churn;


-- ══ CLIENTES QUE QUICAM (cancelou em <15 dias) ═══════════════════════════════
SELECT COUNT(DISTINCT sh.lead_id) AS quicaram_15d
FROM subscription_history sh JOIN leads l ON l.id=sh.lead_id
WHERE sh.ended_reason='canceled'
  AND sh.ended_at - sh.started_at < interval '15 days'
  AND l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day')
  AND l.deleted_at IS NULL;


-- ══ LEADS POR DIA (série temporal — gráfico de linha/barra) ══════════════════
SELECT date_trunc('day', l.created_at AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
       COUNT(*) AS leads
FROM leads l
WHERE l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
GROUP BY 1 ORDER BY 1;


-- ══ FUNIL (Entrados → Conversa → Acesso → Pagou) ═════════════════════════════
WITH pl AS (
  SELECT l.id, l.has_billing, l.has_started_chatwoot_conversation,
    EXISTS(SELECT 1 FROM lead_subscriptions s WHERE s.lead_id=l.id AND s.subscription_status='active') AS is_active
  FROM leads l
  WHERE l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
)
SELECT etapa, valor FROM (
  VALUES
    ('1. Entrados',          (SELECT COUNT(*) FROM pl)),
    ('2. Tem conversa',      (SELECT COUNT(*) FROM pl WHERE has_started_chatwoot_conversation)),
    ('3. Acesso (billing)',  (SELECT COUNT(*) FROM pl WHERE has_billing)),
    ('4. Pagou (active)',    (SELECT COUNT(*) FROM pl WHERE is_active))
) t(etapa, valor) ORDER BY etapa;


-- ══ MENSAGENS ATÉ FECHAMENTO (mediana, conversa inteira: entrada + saída) ═════
WITH msgs AS (
  SELECT (SELECT COUNT(*) FROM chatwoot_messages cm WHERE cm.lead_id = l.id)
       + (SELECT COUNT(*) FROM chatwoot_outgoing_message_requests r
          JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
          WHERE c.lead_id = l.id) AS total
  FROM leads l
  WHERE l.has_billing = true
    AND l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
)
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total) AS mediana_msgs FROM msgs;


-- ══ MENSAGENS ATÉ PERDIDO (mediana) ══════════════════════════════════════════
-- Espelha o vendas-db: aqui "perdido" usa lead_losses (perda declarada).
-- ATENÇÃO: a definição de "perdido" está em aberto (ver doc). Mantido igual ao /admin.
-- Hoje quase não há perda declarada, então pode vir vazio. Não inventar.
WITH msgs AS (
  SELECT (SELECT COUNT(*) FROM chatwoot_messages cm WHERE cm.lead_id = l.id)
       + (SELECT COUNT(*) FROM chatwoot_outgoing_message_requests r
          JOIN chatwoot_conversations c ON c.chatwoot_conversation_id = r.chatwoot_conversation_id
          WHERE c.lead_id = l.id) AS total
  FROM leads l
  WHERE l.has_billing = false
    AND EXISTS (SELECT 1 FROM lead_losses ll WHERE ll.lead_id = l.id)
    AND l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
)
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total) AS mediana_msgs FROM msgs;


-- ══ LEADS QUE ENTRAM MÚLTIPLAS VEZES ═════════════════════════════════════════
SELECT COUNT(*) AS leads_multiplas_entradas FROM (
  SELECT lfs.lead_id
  FROM lead_form_submit lfs JOIN leads l ON l.id = lfs.lead_id
  WHERE l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
  GROUP BY lfs.lead_id HAVING COUNT(*) > 1
) s;


-- ══ PERDIDOS QUE REENTRAM NO FUNIL ═══════════════════════════════════════════
SELECT COUNT(DISTINCT ll.lead_id) AS perdidos_que_reentram
FROM lead_losses ll JOIN leads l ON l.id = ll.lead_id
WHERE l.created_at >= {{start}} AND l.created_at < ({{end}}::date + interval '1 day') AND l.deleted_at IS NULL
  AND EXISTS (SELECT 1 FROM lead_form_submit lfs WHERE lfs.lead_id = ll.lead_id AND lfs.created_at::timestamp > ll.created_at);


-- ═════════════════════════════════════════════════════════════════════════════
-- FILTROS DE ORIGEM E TESTE A/B (o doc exige; aplique em qualquer query acima)
-- No Metabase, configure como Field Filters / variáveis e adicione ao WHERE.
-- Use a sintaxe opcional [[ AND ... {{var}} ]] pra valer só quando preenchido.
--
--   Origem (utm_source):
--     [[ AND EXISTS (SELECT 1 FROM lead_form_submit lfs
--           WHERE lfs.lead_id = l.id AND lfs.utm_data->>'utm_source' = {{origem}}) ]]
--
--   Teste A/B (variantes da landing e do preço):
--     [[ AND l.landing_variant = {{landing_variant}} ]]
--     [[ AND l.pricing_variant = {{pricing_variant}} ]]
--
-- Mantém o alias `l` (leads) que as queries já usam.
-- ═════════════════════════════════════════════════════════════════════════════
