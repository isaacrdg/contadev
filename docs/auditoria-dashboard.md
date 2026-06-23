# Auditoria da Solução de Dashboard (perspectiva: analista de dados sênior)

Pergunta-guia: um analista de dados sênior conseguiria, amanhã, olhar para esta ferramenta e **diagnosticar gargalos, gerar hipóteses e apoiar decisões de forma autônoma**?

## Veredito executivo
Como **relatório confiável das métricas já definidas**, sim. A base foi auditada e corrigida, as definições estão claras e os números são determinísticos.

Como **ferramenta de diagnóstico autônomo no nível Metabase**, ainda não. Hoje o analista consegue **ler** os indicadores principais, mas não consegue **fatiar, cruzar, analisar por coorte nem montar análises novas sem código**. A camada de leitura está boa; a camada de investigação e autonomia está incompleta.

---

## 1. Estrutura dos dados

**Métricas definidas presentes?** Sim. Toda a lista canônica está implementada, mais um conjunto de complementares.

**Definições corretas?** Sim, depois das correções (MRR sem duplicação, Em Risco só past_due, Novos contratos só primeira assinatura, ghosting determinístico). Riscos remanescentes:
- **"Fechamentos" e "Close rate" são por coorte e variam no tempo.** O número de um período passado sobe conforme leads daquela coorte pagam depois. Está rotulado, mas é fonte clássica de leitura errada.
- **"Perdido" tem duas definições convivendo:** ghosting (silêncio de 7 dias) e perda declarada (lead_losses). "Perda silenciosa" usa ghosting; "Mensagens até perdido" usa a declarada (que é quase vazia). Inconsistência a resolver.
- **"Inadimplentes de 1º pagamento" sem regra travada** (quantos dias). Hoje conta `pending`, mas sem o limiar definido não é confiável. Já marcado como pendente.

**Duplicadas?** A duplicação Em Risco vs Inadimplentes foi eliminada. Não há duplicação grosseira hoje.

**Ambíguas / risco de interpretação?**
- "Receita nova" é valor **contratado**, não pago. "Total cobrado" é tudo que entrou (inclui recorrência). Um analista pode confundir as duas como "receita do período".
- Métricas "(hoje)" (MRR, Clientes ativos, Em risco) não respondem ao filtro de período. Rotulado, mas ainda é uma pegadinha.

## 2. Capacidade analítica (o ponto mais fraco)

Um analista diagnostica **fatiando e cruzando**. Hoje faltam justamente as ferramentas de investigação:

- **Segmentação por resultado pago é fraca.** Dá pra filtrar por origem e por A/B, mas: (a) `utm_source` é quase todo nulo, então segmentar por origem no Neon não funciona; (b) o canal limpo está no PostHog, mas **não cruzado com quem pagou no Neon**. Resultado: a pergunta central de marketing, "qual canal traz lead que vira PAGAMENTO", não é respondível de forma confiável. Gargalo de origem de tráfego = ponto cego.
- **Funil sem análise de vazamento e de tempo parado.** O funil mostra contagem por etapa, mas não a **conversão entre etapas ao longo do tempo** nem o **tempo parado em cada estágio (aging)**. "Onde os leads morrem" e "leads esquecidos há X dias" não são visíveis. É exatamente o tipo de gargalo que o analista precisa achar.
- **Sem análise de coorte.** "Dos leads que entraram na semana X, quantos % pagaram em 7/14/30 dias?" não existe. Sem isso, não dá pra saber se a conversão está caindo ao longo do tempo nem separar efeito de marketing de efeito de operação.
- **Sem cruzamento de métricas / teste de hipótese.** A tese "responder rápido aumenta conversão" não pode ser testada: não há visão de close rate por faixa de tempo de 1ª resposta, nem correlação FRT × conversão.
- **Sem WIP / capacidade por vendedor.** Produtividade mostra totais, não conversas abertas simultâneas. "O gargalo é capacidade?" fica sem resposta.
- **Sem sinal de qualidade/hidratação do lead** (completude do formulário por origem), que a própria tese 1.1 do negócio pede.
- **Granularidade só diária.** O requisito era dia/hora/semana/mês; só existe série diária.

## 3. Visualização

- **Muitos números ainda sem tendência ao lado.** Falta sparkline/mini-tendência por KPI para bater o olho e ver se subiu ou caiu.
- **Faltam gráficos analíticos:** funil em taxa de passagem ao longo do tempo, curva de coorte, dispersão (FRT × conversão), histograma de distribuição de tempo (o dado existe em `frtDist`, mas não está exposto no grid).
- **Comparação temporal só em alguns KPIs.** Poderia estar em mais, e como linha de evolução, não só selo.
- **Sem insight automático.** Nada calcula "isto caiu X% e merece atenção". O analista tem que garimpar.
- **Sem drill-down.** Não dá pra clicar num número e ver os leads por trás. Investigação real exige isso.

## 4. Autonomia (o objetivo central, e a maior lacuna)

A inspiração é o Metabase: banco conectado, o usuário navega tabelas e **monta análises e visualizações sem código**.

- **Explorador de banco entregue, mas é só leitura.** O analista **vê** tabelas e campos, porém **não consegue construir uma consulta nem um gráfico** a partir deles. Falta o fluxo banco → tabela → campos → filtro → visualização.
- **Regressão: o widget de SQL personalizado foi removido.** A versão antiga do dashboard tinha um campo onde dava pra escrever um SELECT e virar tabela/gráfico. Ao trocar pelo grid novo, isso se perdeu. Era a coisa mais próxima da autonomia Metabase, e hoje não existe.
- **Criar uma métrica nova ainda exige código.** O catálogo é fixo; adicionar uma análise nova passa por desenvolvimento.
- **Layouts salvos são por navegador (localStorage), não por usuário/servidor.** Não sincroniza entre dispositivos nem entre pessoas do time.

Conclusão da autonomia: hoje é **explorar e ler**, não **construir**. Para o objetivo declarado, falta a camada de construção de análises.

## 5. Métricas principais vs. complementares
- **Principais estáveis:** sim, fixas e não alteradas. Correto.
- **Complementares disponíveis para expansão:** sim (SLA, velocidade de fechamento, funil por estágio, produtividade, motivos de perda), via "Adicionar métrica". Mas **adicionar uma complementar nova ainda é via código**, não pelo usuário.

---

## Lacunas, riscos e inconsistências (consolidado)
1. Canal × pagamento não é cruzável de forma confiável (atribuição suja, sem UTM). Pergunta de marketing principal sem resposta.
2. Funil sem conversão entre etapas no tempo e sem aging (tempo parado). Gargalos de funil invisíveis.
3. Sem coorte. Não dá pra ver conversão ao longo do tempo nem separar marketing de operação.
4. Sem cruzamento de métricas. Teses do negócio (velocidade → conversão) não testáveis.
5. Autonomia incompleta: explorador só lê; sem construtor de consultas; SQL personalizado foi removido (regressão).
6. Sem drill-down para o registro.
7. Granularidade só diária (falta semana/mês/hora).
8. Sem tendência por KPI nem insight automático.
9. Definições em aberto: inadimplente 1º pagamento (limiar), "perdido" (ghosting vs declarado), page views→leads (vive no PostHog).
10. Layouts só por navegador, não por usuário/servidor.
11. Produtividade por vendedor usa atribuição atual (sem histórico de reatribuição).

## Roadmap priorizado para maturidade de diagnóstico

**Prioridade alta (destrava o diagnóstico):**
1. **Restaurar o construtor de análises** (mínimo: widget de SQL personalizado de volta; ideal: construtor no-code tabela → campos → filtro → agrupar → gráfico). Sem isso, não há autonomia.
2. **Cruzar canal (PostHog) × pagamento (Neon)** por identidade do lead (telefone/email). Antes disso, recomendar taggear links de influenciador com UTM.
3. **Funil por estágio com conversão entre etapas e tempo parado (aging).** Mostrar onde vaza e onde empaca.
4. **Coorte de conversão** (entrou no período X → pagou em 7/14/30 dias).

**Prioridade média (contexto e leitura):**
5. Tendência (sparkline) por KPI e comparação temporal em mais métricas.
6. Granularidade dia/semana/mês nos gráficos.
7. Cruzamento FRT × conversão (testar a tese de velocidade).
8. Drill-down: clicar no número e ver os leads.

**Prioridade de definição (com o Gabriel):**
9. Travar "inadimplente 1º pagamento", unificar "perdido", confirmar page views só no interno.

**Prioridade de robustez:**
10. Layouts e análises salvos no servidor por usuário.
11. Histórico de atribuição de vendedor para produtividade correta.

## Resposta direta à pergunta
O analista sênior, hoje, **lê bem o estado do negócio** (receita, conversão geral, atendimento, retenção) e confia nos números. Mas para **diagnosticar de forma autônoma** (achar o gargalo do funil, o canal que não converte, a coorte que piorou, testar uma hipótese) ele ainda **dependeria de desenvolvimento**. A base está sólida; falta a camada de investigação e construção. As prioridades 1 a 4 acima são o que tira a ferramenta de "relatório" e a leva para "plataforma de diagnóstico".
