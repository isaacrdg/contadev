# Dashboard de Vendas — Infra Interna vs Metabase

Documento de decisão para apresentar ao Gabriel. **As duas soluções serão construídas**; ele escolhe qual seguir como oficial. Cada uma tem seu valor.

## Contexto
- Precisamos de um dashboard de engenharia de vendas.
- **Duas fontes de dados:** Neon (vendas/CRM: leads, assinaturas, mensagens, churn) e PostHog (comportamento web: page view, canal/origem, device, geo).
- **Duas opções de visualização:** a infra interna (nosso app) e o Metabase.

## Metabase — "base sólida e madura"
**Entrega:**
- Base **validada** e testada por anos de mercado.
- **Suporte a erros** e comunidade/documentação enormes.
- **Estrutura pronta** (permissões, agendamento, alertas, embedding) sem desenvolver.
- **Segurança** e governança consolidadas.
- Rápido de montar via SQL nativo (queries já entregues em `docs/metabase-queries.sql`).

**Limitações:**
- **Só lê banco SQL** → **não integra o PostHog** (PostHog não é um banco SQL). A visão fica restrita ao Neon.
- Menos controle sobre UX/design e sobre como cruzar fontes.
- Dado de comportamento (canal/device/geo) fica **fora** ou em ferramenta separada.

## Infra Interna (app nativo) — "controle e centralização"
**Entrega:**
- **Controle completo** de design, UX e lógica.
- **Centralização real:** por ser código, puxa **Neon (SQL) + PostHog (API)** na **mesma tela** — a única estrutura que unifica as duas fontes.
- Cruzamentos sob medida (ex.: conversão para pagamento **por canal** = PostHog × Neon).
- Custo controlado: dados servidos por snapshot/cache, banco só é consultado sob comando.

**Limitações:**
- Nós **mantemos o código** (build, design, evolução).
- Recursos prontos do Metabase (permissões, alertas) teriam que ser construídos se necessários.

## Resumo da escolha
| | Metabase | Infra Interna |
|---|---|---|
| Maturidade / suporte | ✅ forte | construímos |
| Segurança / governança | ✅ pronta | construímos |
| Integra PostHog + Neon | ❌ só Neon | ✅ ambos, centralizado |
| Controle de UX / cruzamentos | limitado | ✅ total |
| Esforço de manutenção | baixo | nosso |

**Decisão:** apresentar as duas ao Gabriel. Metabase se o valor for maturidade/segurança/menor manutenção; infra interna se o valor for centralização (Neon+PostHog) e controle total.
