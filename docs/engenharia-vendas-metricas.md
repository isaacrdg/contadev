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
| **Inadimplentes** | `leads` + `lead_subscriptions` | tem `past_due` e **não** tem `active` (era ativo e parou) |
| Msgs até fechamento | `chatwoot_messages` + `outgoing_requests` | Total (entrada+saída) por lead que pagou. p50 |
| Msgs até perdido | idem + `lead_losses` | Total por lead `has_billing=false` **e** em `lead_losses`. p50 |
| Perdidos que reentram | `lead_losses` + `lead_form_submit` | Perda → novo form depois |
| Leads múltiplas entradas | `lead_form_submit` | `lead_id` com 2+ submissões |
| Clientes que quicam | `lead_subscriptions` | `is_frozen=true` e `frozen_at − created_at < 15d` |
| Valor adquirido | `subscription_payments` / `lead_subscriptions` | `SUM(value)` pago / `SUM` novos contratos |
| Qtd. planos anuais / valor | `lead_subscriptions` | `cycle='YEARLY'` |
| Qtd. planos mensais / valor | `lead_subscriptions` | `cycle='MONTHLY'` |
| Perdidos declarados | `lead_losses` | `COUNT(*)` no período |
| Perdidos (ghosting 7d) | `leads` + `chatwoot_messages` | sem billing, sem perda declarada, com msg, sem msg há 7d |

## Decisões registradas (com o Gabriel)
- **Fluxo real:** atendimento com especialista → quer ser cliente e **recebe acesso à plataforma (aqui se cria o billing → `lead_subscriptions` com status `pending`)** → dentro da plataforma efetua o pagamento (→ `active`).
- **"Pagou" = `subscription_status='active'`**, NÃO `has_billing`. `has_billing=true` só significa "recebeu acesso/billing criado" e **inflava os fechamentos em ~14%** (incluía `pending`/`past_due`/`canceled`).
- **Acesso → Pagamento é uma métrica-chave:** mede quanto se perde entre receber acesso e pagar. A perda nesse caminho são os leads `pending` ("entrou e não pagou").
- **Duas inadimplências, separadas:** `pending` (entrou e nunca pagou — perda no fluxo) vs `past_due` (era ativo e parou de pagar). Ambas importam.
- **`subscription_status`:** `pending` = não pagou ainda · `active` = pagou · `past_due` = inadimplente · `canceled` = cancelado.
- **Tabela `contracts` é a ANTIGA** (não é o contrato atual da plataforma). **Não é usada** por nenhuma métrica.
- **Ghosting (perda silenciosa):** mantido — lead que já mandou ≥1 mensagem, não fechou, não foi marcado perdido, e está 7+ dias sem mandar mensagem. Quem nunca respondeu **não** entra.

## Pontos em aberto / observações
- **`% page views → leads`**: não está no banco (PostHog). Não é calculável aqui.
- **Msgs até perdido**: fica `null` quando não há **perda declarada** (`lead_losses`) no período — hoje os perdidos são quase todos por **ghosting**. Decidir se "perdido" oficial deve incluir ghosting.
- **FRT humano alto (p50 ~20h)**: esperado — a 1ª resposta instantânea é automação (`scheduled_message`); o vendedor humano responde depois. É a métrica correta segundo o doc ("tempo até o humano começar a resolver").

## Como atualizar o snapshot
```
npm run snapshot   # lê o banco UMA vez (usa DATABASE_URL do .env.local) e regrava o JSON
```
No dashboard, o botão **Atualizar** consulta o banco ao vivo (cacheado por token); a visão padrão sempre mostra o snapshot salvo, sem tocar no banco.
