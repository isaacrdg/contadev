# Dashboard Interno — Backlog de Melhorias (design + features)

Feedback do Isaac consolidado. Objetivo: **profissional, sóbrio, didático** — "bater o olho e ver que é coisa séria". Referência: Metabase (qualidade/variedade de gráficos, explorador de tabelas) + Meta Ads (personalização e salvar layout). **Sem firula** (nada de glass/fade/moderno por agora) — sobriedade e clareza primeiro.

## ⚖️ PRINCÍPIO QUE REGE TUDO: determinismo e correção
O dashboard é base de **decisão** — cada número carrega peso enorme. Logo:
- **Determinístico:** a mesma consulta, no mesmo período, dá sempre o mesmo resultado. Nada pode depender de "hoje" de forma escondida.
- **Correto e validado:** cada métrica conferida contra o banco real, com definição travada (ver `engenharia-vendas-metricas.md`).
- **Sem ambiguidade:** nenhum número/legenda que uma pessoa de fora possa interpretar errado.

### Riscos de determinismo já identificados (corrigir)
- [ ] **Ghosting usa `NOW()`** em vez do fim do período → o mesmo período histórico muda de valor conforme os dias passam. Trocar `NOW()` pelo fim do período.
- [ ] **MRR / Clientes ativos / Em risco são "estado atual"** (ignoram o período) → num período histórico mostram o valor de hoje. Precisam ser **rotulados como "agora/hoje"** pra ninguém ler como valor do período.

## A. Clareza & profissionalismo (cada número precisa gerar conclusão)
- [ ] **Títulos das métricas estão apagados demais** — aumentar contraste/peso.
- [ ] **Tirar todo jargão** das sublegendas. Ex.: "past_due + canceladas" → "pararam de pagar ou cancelaram"; "pp" → linguagem clara. Padrão bom: o "quicam" (explica "cancelou em <15 dias").
- [ ] **Insights vs período anterior:** deixar claro o que significam (tooltip com o valor anterior + legenda "comparado ao período anterior de mesma duração"). Confirmar que a comparação é **dinâmica** (7d compara com os 7d anteriores). ✅ é dinâmica.
- [ ] **Cores roxo/verde/vermelho + fundo cinza** não estão boas — revisar fonte/contraste/valor.
- [ ] Conferir se os insights estão corretos. ✅ +104% nos novos contratos (90d) confere: mesmo nº de contratos, valor dobrou.

## B. Conteúdo responsivo ao tamanho do widget
- [ ] Ao redimensionar, **o conteúdo tem que escalar junto** (hoje o card cresce e o conteúdo fica pequeno no canto).
- [ ] **Limite mínimo e máximo** por tipo de conteúdo, pra sempre caber e fazer sentido.

## C. Mais gráficos, menos "só número"
- [ ] **Troca de tipo de visualização** (área/barra/linha) hoje só no "Leads por dia" — estender pra outros widgets.
- [ ] Onde for número solto, oferecer um gráfico que ajude a concluir algo.
- [ ] Ex.: "Leads por dia" mostrar também o **total** (número + gráfico).

## D. UX de montar o dashboard (vibe Meta Ads)
- [ ] Painel "Adicionar widget": com poucos itens fica enorme/vazio — repensar (select/dropdown, busca). Estudar UX/UI.
- [ ] **Selects nativos aparecem brancos** (não seguem o design system, sem contraste) — corrigir.
- [ ] **Salvar layouts** (várias visualizações salvas, estilo Meta Ads).
- [ ] **Criar tabelas/cards** facilmente (estilo Metabase) — tela principal curada, não precisa ter tudo.

## E. "Metabase 2.0" dentro da nossa infra — Explorador de Banco
- [ ] Aba/cartão do banco que **lista TODAS as tabelas** do Neon (como o Metabase em Data → Databases).
- [ ] Objetivo: autonomia — ao adicionar um widget, já saber de onde puxar (sem mexer em código).
- [ ] (Futuro/opcional) algo tipo "X-ray": gráficos automáticos por tabela. Difícil, fica pra depois.

## Ordem sugerida (batches)
1. **Batch 1 — Clareza profissional** (A): títulos, jargão→português, tooltips de comparação, contraste dos selects. *Maior impacto no "parece sério", baixo risco.*
2. **Batch 2 — Gráficos** (C): troca de viz em mais widgets, total no leads/dia, gráficos onde só tem número.
3. **Batch 3 — Responsividade** (B): conteúdo escala + min/max por widget.
4. **Batch 4 — Explorador de Banco** (E): lista de tabelas do Neon.
5. **Batch 5 — UX de montagem + salvar layouts** (D): dropdown de add-widget, múltiplos layouts.

> Trabalhar em homologação (local), testar antes de commitar.
