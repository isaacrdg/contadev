# Engenharia de Vendas — Mapa de Métricas (fonte real)

Mapa de cada métrica do dashboard → **tabela(s) e colunas reais** do banco Neon.
Validado por introspecção do schema (`scripts/introspect.mjs`) e por leitura real
dos dados (`npm run snapshot`). Tudo é **somente leitura**.

> Código das queries: [`src/lib/vendas-db.ts`](../src/lib/vendas-db.ts).
> Snapshot atual: [`src/lib/vendas-snapshot.json`](../src/lib/vendas-snapshot.json) (gerado por `npm run snapshot`).

## Tabelas usadas
| Tabela | Papel |
|---|---|
| `leads` | Lead: `created_at`, `has_contract`, `has_billing`, `has_started_chatwoot_conversation`, `landing_variant`, `pricing_variant`, `source`, `utm_data`, `deleted_at` |
| `lead_form_submit` | Submissões de formulário (dedup por telefone). `lead_id`, `created_at`, `utm_data` |
| `lead_subscriptions` | Assinaturas. `cycle` (YEARLY/MONTHLY), `value`, `subscription_status`, `is_frozen`, `frozen_at`, `created_at` |
| `subscription_payments` | Pagamentos. `status` (`paid`), `paid_at`, `value` |
| `lead_losses` | Perdas declaradas (manuais). `lead_id`, `created_at`, `loss_reason_id` |
| `chatwoot_messages` | Mensagens de **ENTRADA** (do lead). `lead_id`, `created_at`. ⚠️ não tem saídas |
| `chatwoot_outgoing_message_requests` | Mensagens de **SAÍDA** (vendedor/automação). `chatwoot_conversation_id`, `employee_id`, `source`, `created_at` |
| `chatwoot_conversations` | Ponte saída↔lead: `chatwoot_conversation_id` ↔ `lead_id` |

**`source` das saídas:** `conversation_text` / `conversation_attachments` = **humano (vendedor)**; `scheduled_message` = **automação/welcome**. As métricas de tempo usam só as humanas.

## Métricas
| Métrica | Tabela(s) | Definição |
|---|---|---|
| Tempo de 1ª resposta (FRT) | `outgoing_requests` + `conversations` + `leads` | 1ª saída **humana** − `leads.created_at`. p50/p90 + distribuição |
| Tempo de 2ª resposta | idem | 2ª saída humana − `leads.created_at`. p50/p90 + distribuição |
| Tempo entre respostas | idem | Intervalo entre saídas humanas consecutivas. p50/p90 + distribuição |
| Qtd. entrada de lead | `leads` | `COUNT(*)` no período |
| **Fechamentos (pagaram)** | `leads` + `lead_subscriptions` | lead com assinatura `subscription_status='active'` |
| **Close rate** | idem | pagaram ÷ leads |
| **Acessos (billing criado)** | `leads` | `has_billing=true` (recebeu acesso à plataforma) |
| **Acesso → Pagamento (taxa)** | idem | pagaram (`active`) ÷ acessos (`has_billing`) |
| **Entrou e não pagou** | `leads` + `lead_subscriptions` | tem `pending` e **não** tem `active` (perdido no fluxo de pagamento) |
| **Clientes com faturas em atraso** | `overdue_billings` + `subscription_payments` | tem fatura vencida em aberto (`paid_at IS NULL`, não excluída, não isenta, `due_date < now()`) **e** já pagou ≥1 fatura. Estado de hoje, dinâmico |
| **Calote de 1º pagamento** | `leads` + `lead_subscriptions` | tem `pending`, **nunca** teve `active` (recebeu acesso e nunca pagou) |
| Msgs até fechamento | `chatwoot_messages` + `outgoing_requests` | Total (entrada+saída) por lead que pagou. p50 |
| Msgs até perdido | idem + `lead_losses` | Total por lead `has_billing=false` **e** em `lead_losses`. p50 |
| Perdidos que reentram | `lead_losses` + `lead_form_submit` | Perda → novo form depois |
| Leads múltiplas entradas | `lead_form_submit` | `lead_id` com 2+ submissões |
| Clientes que quicam | `subscription_history` | `ended_reason='canceled'` e `ended_at − started_at < 15d` (cancelou em <15 dias) |
| Valor adquirido | `subscription_payments` / `lead_subscriptions` | `SUM(value)` pago / `SUM` novos contratos |
| Qtd. planos anuais / valor | `lead_subscriptions` | `cycle='YEARLY'` |
| Qtd. planos mensais / valor | `lead_subscriptions` | `cycle='MONTHLY'` |
| **Upgrades → Anual** | `subscription_history` | `ended_reason='monthly_to_annual_promotion'` no período (expansão) |
| **Cancelamentos (churn)** | `subscription_history` | `ended_reason='canceled'`, por `ended_at` no período |
| Perdidos declarados | `lead_losses` | `COUNT(*)` no período |
| Perdidos (ghosting 7d) | `leads` + `chatwoot_messages` | sem billing, sem perda declarada, com msg, sem msg há 7d |

## Decisões registradas (com o Gabriel)
- **Fluxo real:** atendimento com especialista → quer ser cliente e **recebe acesso à plataforma (aqui se cria o billing → `lead_subscriptions` com status `pending`)** → dentro da plataforma efetua o pagamento (→ `active`).
- **"Pagou" = `subscription_status='active'`**, NÃO `has_billing`. `has_billing=true` só significa "recebeu acesso/billing criado" e **inflava os fechamentos em ~14%** (incluía `pending`/`past_due`/`canceled`).
- **Acesso → Pagamento é uma métrica-chave:** mede quanto se perde entre receber acesso e pagar. A perda nesse caminho são os leads `pending` ("entrou e não pagou").
- **Inadimplência = faturas em atraso (revisado):** a fonte é `overdue_billings`, a tabela que o sistema mantém para cobranças vencidas (junto de `overdue_notifications`, o ciclo de cobrança). "Cliente com fatura em atraso" = tem fatura vencida em aberto (não paga, não excluída, não isenta) **e** já pagou ≥1 fatura (já virou cliente). É um **estado momentâneo da carteira**, dinâmico: a pessoa entra ao vencer e sai ao regularizar — não é um grupo fixo de "inadimplentes permanentes". Hoje: 70 clientes / 167 faturas / R$ 47k. O `lead_subscriptions.past_due` (antigo "Em risco") é um sinal mais lento de assinatura e foi substituído por esta leitura por fatura.
- **Calote de 1º pagamento (separado):** quem recebeu acesso (`pending`) e **nunca** pagou nenhuma fatura. É a perda no fluxo de pagamento, conceito distinto de quem é cliente e atrasou. Threshold de dias a validar com o Gabriel.
- **Duas inadimplências, separadas:** `pending` (entrou e nunca pagou — perda no fluxo) vs fatura em atraso de cliente (já pagou e atrasou). Ambas importam, mas são coisas diferentes.
- **`subscription_status`:** `pending` = não pagou ainda · `active` = pagou · `past_due` = inadimplente · `canceled` = cancelado.
- **Tabela `contracts` é a ANTIGA** (não é o contrato atual da plataforma). **Não é usada** por nenhuma métrica.
- **Ghosting (perda silenciosa):** mantido — lead que já mandou ≥1 mensagem, não fechou, não foi marcado perdido, e está 7+ dias sem mandar mensagem. Quem nunca respondeu **não** entra.
- **Clientes que quicam = cancelou em <15 dias** (`subscription_history.ended_reason='canceled'`). `is_frozen` **NÃO** é churn — é uma pausa/congelamento temporário (84 assinaturas `frozen` ainda estão `active`). E **nem todo `ended_at` é churn**: `gateway_switch` (troca de gateway), `monthly_to_annual_promotion` (upgrade) e `admin_replace` são encerramentos técnicos, não saída do cliente — por isso filtra-se `ended_reason='canceled'`.
- **`% page views → leads`:** vive no **Vercel Analytics** (não há PostHog no projeto). Vercel Analytics no plano atual não é consultável por API de forma limpa; entra como métrica manual ou via PostHog/instrumentação própria no futuro.
- **Inadimplentes no 1º mês:** porta aberta — definição estrita ("até 30d após assinar") a refinar depois.
- **Migração de gateway:** as assinaturas ativas estão majoritariamente no **asaas (508)**, com stripe (76) e pagbank (22) — migração em andamento. `gateway_switch` em `subscription_history` é o registro dessa troca; é métrica **operacional** (progresso de migração), não de vendas, então fica fora do dashboard comercial por ora.

## Auditoria de correção (consolidação da base)
Cada métrica responde uma pergunta, com uma definição, sem ambiguidade.
- **MRR:** uma assinatura ativa por cliente (a mais recente). Antes somava todas as ativas e contava cliente duplicado (sobra de migração): 606 assinaturas para 597 clientes inflavam o MRR em ~R$ 2,5k. Corrigido.
- **Em Risco:** passa a ser só `past_due` (atrasados no pagamento hoje). Antes misturava `past_due` + `canceled`, que são coisas diferentes. Cancelados é métrica própria.
- **Novos contratos / anuais / mensais / valor:** contam só a PRIMEIRA assinatura de cada lead. Antes incluíam assinaturas criadas por migração de gateway e upgrade (mesmo cliente, não é venda nova).
- **Ghosting (perda silenciosa):** janela de 7 dias relativa ao FIM do período, não a "hoje". Antes o mesmo período histórico mudava com o passar dos dias.
- **Notas de leitura (não são erro, mas precisam ser entendidas):**
  - `Taxa de perda` é a união de duas formas de perda (declarada + silenciosa) sobre os leads do período. Responde "que % dos leads do período se perderam".
  - `Fechamentos` e `close rate` são por coorte: contam os leads que entraram no período e que pagaram, mesmo que tenham pago depois. O número de um período passado pode subir conforme mais leads daquela coorte pagam.
  - `MRR`, `Clientes ativos` e `Em risco` são estado de HOJE, não mudam com o período selecionado (por isso o rótulo "hoje").

## Pontos em aberto / observações
- **`% page views → leads`**: não está no banco (PostHog). Não é calculável aqui.
- **Msgs até perdido**: fica `null` quando não há **perda declarada** (`lead_losses`) no período — hoje os perdidos são quase todos por **ghosting**. Decidir se "perdido" oficial deve incluir ghosting.
- **FRT humano alto (p50 ~20h)**: esperado — a 1ª resposta instantânea é automação (`scheduled_message`); o vendedor humano responde depois. É a métrica correta segundo o doc ("tempo até o humano começar a resolver").

## Como atualizar o snapshot
```
npm run snapshot   # lê o banco UMA vez (usa DATABASE_URL do .env.local) e regrava o JSON
```
No dashboard, o botão **Atualizar** consulta o banco ao vivo (cacheado por token); a visão padrão sempre mostra o snapshot salvo, sem tocar no banco.
