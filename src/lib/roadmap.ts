/**
 * Roadmap de implementação do painel CRM interno da Conta Dev.
 *
 * Este painel hoje roda como protótipo: storage em JSON file, sem auth real,
 * sem multi-user, sem integração com o sistema existente (API → DB → Slack).
 * Cada item abaixo descreve um passo necessário, o porquê e a sugestão técnica.
 *
 * A página /admin/roadmap consome esta lista. Adicione/remova tarefas livremente.
 */

export type Priority = "critica" | "alta" | "media" | "baixa";
export type Category =
  | "seguranca"
  | "database"
  | "integracao"
  | "produto"
  | "infra";
export type Status = "pendente" | "em_andamento" | "concluida";

export interface RoadmapTask {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  status: Status;
  /** Resumo de 1 linha do problema/objetivo */
  summary: string;
  /** Por que isso importa pro contexto Conta Dev */
  why: string;
  /** Sugestão técnica de como atacar (pode citar arquivos/libs) */
  approach: string;
  /** Arquivos/áreas do projeto envolvidas */
  touches?: string[];
  /** Estimativa de esforço relativo */
  effort: "S" | "M" | "L" | "XL";
}

export const CATEGORY_LABELS: Record<Category, string> = {
  seguranca: "Segurança",
  database: "Database",
  integracao: "Integração com sistema atual",
  produto: "Produto",
  infra: "Infra & Deploy",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const PRIORITY_RGB: Record<Priority, string> = {
  critica: "239,68,68",
  alta: "249,115,22",
  media: "234,179,8",
  baixa: "147,197,253",
};

export const STATUS_LABELS: Record<Status, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export const ROADMAP: RoadmapTask[] = [
  // ───────────────────────── SEGURANÇA ─────────────────────────
  {
    id: "auth-real",
    title: "Substituir auth de senha única por auth multi-user real",
    category: "seguranca",
    priority: "critica",
    status: "pendente",
    summary:
      "Hoje o painel tem login simples via env var (ADMIN_PASSWORD). Pra equipe usar de verdade, precisa de usuários nomeados, cada um com login próprio.",
    why: "Saber quem fez o quê é base de qualquer CRM. Atribuição de leads, audit log, comments com @menção, todos dependem de identidade real. Senha única compartilhada vaza fácil.",
    approach:
      "Usar Supabase Auth (MCP já configurado no projeto), NextAuth, ou Clerk. Magic link por email é o caminho menos atrito. O middleware atual em src/middleware.ts já está pronto pra ser substituído — só trocar a verificação de cookie pelo provider escolhido.",
    touches: [
      "src/middleware.ts",
      "src/app/admin/login/",
      "src/app/api/admin/login/",
    ],
    effort: "M",
  },
  {
    id: "roles-permissoes",
    title: "Roles & permissões (admin, vendedor, suporte)",
    category: "seguranca",
    priority: "alta",
    status: "pendente",
    summary:
      "Após auth multi-user, precisa diferenciar permissões: admin vê tudo, vendedor vê só seus leads, suporte só os tickets.",
    why: "Ninguém quer um vendedor mexendo em leads de outro vendedor sem permissão, e o financeiro não precisa ver pipeline de vendas.",
    approach:
      "Tabela users com campo role + middleware que checa permissão por rota. Se for Supabase, dá pra fazer via Row Level Security (RLS) nas próprias tabelas — mais robusto.",
    touches: ["src/middleware.ts", "src/lib/auth.ts (novo)"],
    effort: "M",
  },
  {
    id: "audit-log",
    title: "Audit log completo",
    category: "seguranca",
    priority: "media",
    status: "pendente",
    summary:
      "Registrar quem fez o quê, quando, com diff. Toda mutação importante (mover lead, editar dado, deletar) entra no log.",
    why: "Compliance + accountability. Se um lead sumir ou for movido errado, dá pra ver quem fez.",
    approach:
      "Tabela audit_log no DB. Wrapper nas funções de mutação (updateLeadStatus, addLead, etc) que insere uma entrada. Pode reusar o padrão do statusHistory que já existe em src/lib/leads-store.ts.",
    touches: ["src/lib/leads-store.ts", "src/lib/audit.ts (novo)"],
    effort: "M",
  },

  // ───────────────────────── DATABASE ─────────────────────────
  {
    id: "migrar-db",
    title: "Migrar storage de JSON file pra database real",
    category: "database",
    priority: "critica",
    status: "pendente",
    summary:
      "Hoje os leads vivem em data/leads.json (FS local). Não persiste em deploy Vercel (FS readonly), não suporta concorrência, não escala.",
    why: "Sem DB não dá pra ter multi-user, real-time, queries complexas, indexes. É bloqueador de praticamente todas as features avançadas do CRM.",
    approach:
      "Sugestão forte: Supabase (Postgres + Auth + RLS + Realtime + MCP já configurado). Schema mínimo: leads, tickets, users, audit_log, tags, status_history. A função readLeads/writeLeads de src/lib/leads-store.ts vira readLeads = supabase.from('leads').select().",
    touches: [
      "src/lib/leads-store.ts (refator completo)",
      "src/lib/supabase.ts (novo)",
      "data/ (deletar)",
    ],
    effort: "L",
  },
  {
    id: "schema-leads",
    title: "Modelar schema completo do CRM",
    category: "database",
    priority: "alta",
    status: "pendente",
    summary:
      "Definir tabelas: leads, tickets, users, tags, status_history, audit_log, notifications, custom_fields. Indexes em email/telefone pra busca rápida.",
    why: "O schema atual em src/lib/leads-store.ts (Lead interface) é só o começo. Faltam relações (lead → vendedor, lead → empresa, ticket → cliente), índices, constraints.",
    approach:
      "Migration SQL inicial via Supabase. Considerar tipo enum nativo do Postgres pros status. Foreign keys explícitas. Trigger pra atualizar updated_at automaticamente.",
    touches: ["supabase/migrations/ (novo)"],
    effort: "M",
  },
  {
    id: "backup-restore",
    title: "Backup automático + plano de restore",
    category: "database",
    priority: "media",
    status: "pendente",
    summary: "Backup diário do banco + procedimento documentado de restore.",
    why: "Lead perdido = dinheiro perdido. Backup é seguro mínimo.",
    approach:
      "Supabase já faz backup automático no plano pago. Documentar como restaurar. Considerar export semanal pra GCS/S3 como segunda camada.",
    effort: "S",
  },

  // ───────────────────────── INTEGRAÇÃO ─────────────────────────
  {
    id: "integrar-api-existente",
    title: "Conectar com a API/DB de leads atual da Conta Dev",
    category: "integracao",
    priority: "critica",
    status: "pendente",
    summary:
      "Hoje os leads do site da Conta Dev caem no DB existente da empresa via API. Este painel só recebe leads do form deste projeto novo. Precisa unificar.",
    why: "O time de vendas hoje atende tudo via Slack (canal exclusivo dos vendedores). Se o painel novo só mostra leads do site novo, o time tem que olhar 2 lugares — pior do que tinha antes.",
    approach:
      "Duas opções: (1) Adapter que lê o DB existente e popula este painel via cron/webhook. (2) Refazer o endpoint POST /api/lead pra também escrever no DB existente (via API ou direto). Discutir com Gabriel qual faz mais sentido — adapter mantém compatibilidade total com o que ele já tem.",
    touches: [
      "src/app/api/lead/route.ts",
      "src/lib/leads-store.ts",
      "src/lib/external-api.ts (novo)",
    ],
    effort: "L",
  },
  {
    id: "slack-canal-vendedores",
    title: "Webhook Slack pro canal exclusivo dos vendedores",
    category: "integracao",
    priority: "alta",
    status: "pendente",
    summary:
      "Já temos LEAD_WEBHOOK_URL configurável (src/lib/lead-webhook.ts) que manda pro Slack. Falta apontar pro canal certo — o exclusivo dos vendedores que o Gabriel já mantém — e estender pra mais eventos.",
    why: "Vendedores recebem hoje no Slack, é o ritmo deles. Manter esse fluxo enquanto o painel é adotado evita atrito.",
    approach:
      "Já existe a infra. Gabriel só precisa: (1) configurar LEAD_WEBHOOK_URL no .env de produção apontando pro canal certo. (2) Estender forwardLead em src/lib/lead-webhook.ts pra disparar em status change e atribuição (não só na criação).",
    touches: ["src/lib/lead-webhook.ts", "src/app/api/lead/[id]/route.ts"],
    effort: "S",
  },
  {
    id: "atribuicao-vendedor",
    title: "Atribuição automática/manual de lead a vendedor",
    category: "integracao",
    priority: "alta",
    status: "pendente",
    summary:
      "Cada lead que chegar deve ser atribuído (auto via round-robin ou manual). Vendedor vê só seus leads no kanban.",
    why: "Sem atribuição, ou todos veem tudo (caos), ou ninguém é responsável. Ambos viram excesso de leads sem dono.",
    approach:
      "Adicionar campo assigned_to: user_id no Lead. Default round-robin entre vendedores ativos. Filtro 'meus leads' no kanban. Notificação Slack pessoal quando lead novo é atribuído.",
    touches: [
      "src/lib/leads-store.ts (Lead interface + função assignLead)",
      "src/app/admin/leads/LeadsKanban.tsx (filtro)",
    ],
    effort: "M",
  },
  {
    id: "import-historico",
    title: "Importar leads históricos do CRM antigo",
    category: "integracao",
    priority: "media",
    status: "pendente",
    summary:
      "Migrar leads existentes do sistema atual pra cá quando virar o painel oficial.",
    why: "Vendedor não vai recomeçar do zero. Histórico de cada lead (notas, status, conversas) vai junto.",
    approach:
      "Script de importação que lê do DB/API atual e popula o novo schema. Pode ser one-shot. Manter mapeamento de IDs pra rastreabilidade.",
    touches: ["scripts/import-legacy.ts (novo)"],
    effort: "M",
  },

  // ───────────────────────── PRODUTO ─────────────────────────
  {
    id: "tickets-real",
    title: "Tickets de suporte (substituir placeholder)",
    category: "produto",
    priority: "alta",
    status: "pendente",
    summary:
      "A aba Tickets hoje é placeholder. Implementar sistema completo: kanban, prioridade, SLA, atribuição.",
    why: "Pós-venda é tão importante quanto venda. Conta Dev cuida de cliente todo dia, sem ferramenta unificada o suporte vira email solto.",
    approach:
      "Espelhar a estrutura de leads. Criar src/lib/tickets-store.ts (mesmo padrão de leads-store.ts). Reusar LeadsKanban.tsx como template. Status: aberto, em_atendimento, aguardando_cliente, resolvido.",
    touches: [
      "src/app/admin/tickets/page.tsx (refatorar)",
      "src/lib/tickets-store.ts (novo)",
      "src/app/api/ticket/ (novo)",
    ],
    effort: "L",
  },
  {
    id: "dashboard-kpis",
    title: "Dashboard com KPIs reais (conversão, funnel, UTM ROI)",
    category: "produto",
    priority: "alta",
    status: "pendente",
    summary:
      "Página /admin/dashboard com cards: leads/dia, taxa de conversão, tempo médio no funil, breakdown por fonte UTM.",
    why: "Gabriel precisa de visibilidade do funil pra decidir onde investir grana de tráfego pago. Hoje só dá pra contar manualmente.",
    approach:
      "Nova rota src/app/admin/dashboard/page.tsx. Lib recharts pros gráficos. Funções de agregação em src/lib/leads-stats.ts (novo). Filtro de período via URL.",
    touches: [
      "src/app/admin/dashboard/ (novo)",
      "src/lib/leads-stats.ts (novo)",
      "package.json (recharts)",
    ],
    effort: "M",
  },
  {
    id: "tags-segmentacao",
    title: "Tags/labels com auto-tag por UTM",
    category: "produto",
    priority: "media",
    status: "pendente",
    summary:
      "Tags livres no lead (hot, exterior, MEI urgente) + regras automáticas baseadas em UTM (utm_source=ig → tag instagram).",
    why: "Sem tags, único filtro é status. Vendedor não consegue ver 'todos meus leads quentes do Instagram'.",
    approach:
      "Campo tags: string[] no Lead. UI de chips no card e modal. Função inferAutoTags(utmData) em src/lib/leads-store.ts aplicada no addLead.",
    touches: [
      "src/lib/leads-store.ts",
      "src/app/admin/leads/LeadsKanban.tsx",
      "src/app/admin/leads/LeadDetailModal.tsx",
    ],
    effort: "S",
  },
  {
    id: "busca-cmdk",
    title: "Busca global Cmd+K + atalhos de teclado",
    category: "produto",
    priority: "media",
    status: "pendente",
    summary:
      "Cmd+K abre command palette com fuzzy search por nome/email/telefone/obs. Atalhos j/k pra navegar cards, Enter pra abrir, 1-4 pra mover status.",
    why: "Power users (vendedores que mexem todo dia) merecem teclado-first. Acelera muito o dia a dia.",
    approach: "Lib `cmdk` (~10kb, mantida pelo Vercel). Listener global no admin/layout.tsx.",
    touches: ["src/components/CommandPalette.tsx (novo)", "src/app/admin/layout.tsx"],
    effort: "M",
  },
  {
    id: "tasks-followups",
    title: "Tasks/follow-ups com data e lembrete",
    category: "produto",
    priority: "media",
    status: "pendente",
    summary:
      "No detalhe do lead, criar tasks: 'Ligar amanhã 14h', 'Enviar proposta sexta'. Aparecem em vista de TODOs do vendedor.",
    why: "Sem follow-up estruturado, lead esfria. CRM bom força a próxima ação.",
    approach:
      "Tabela tasks (ou campo no Lead). UI de criar/marcar feito. Notificação no dia (email ou Slack).",
    touches: ["src/lib/tasks-store.ts (novo)", "src/app/admin/tasks/ (novo)"],
    effort: "M",
  },
  {
    id: "real-time",
    title: "Atualizações em tempo real (multi-user)",
    category: "produto",
    priority: "baixa",
    status: "pendente",
    summary:
      "Quando 2 vendedores estão no painel ao mesmo tempo, mudanças de um aparecem instantaneamente pro outro.",
    why: "Evita conflito de edição e dá sensação de ferramenta viva.",
    approach:
      "Supabase Realtime (subscription nas tabelas leads/tickets) ou Pusher. Reconciliação otimista de updates.",
    effort: "M",
  },

  // ───────────────────────── INFRA ─────────────────────────
  {
    id: "deploy-staging",
    title: "Ambiente de staging separado",
    category: "infra",
    priority: "alta",
    status: "pendente",
    summary:
      "Deploy do painel em staging.contadev (ou similar) antes de virar produção. Time testa, valida, depois libera.",
    why: "Sem staging, qualquer mudança em produção é risco. CRM em produção quebrado = vendedor parado.",
    approach:
      "Vercel preview deploys já dão isso por branch. Configurar branch staging que recebe merges antes do main. Variáveis de ambiente separadas.",
    effort: "S",
  },
  {
    id: "monitoring",
    title: "Monitoramento + alertas (Sentry, Vercel Analytics)",
    category: "infra",
    priority: "media",
    status: "pendente",
    summary:
      "Capturar erros JS no painel + alertas quando algo quebra em produção.",
    why: "Se um vendedor abre o painel e dá erro silencioso, ninguém fica sabendo até alguém reclamar. Sentry resolve isso em 10 min.",
    approach: "@sentry/nextjs. Configurar DSN no env. Alertas no Slack.",
    effort: "S",
  },
  {
    id: "rate-limit",
    title: "Rate limiting nos endpoints públicos",
    category: "infra",
    priority: "alta",
    status: "pendente",
    summary:
      "POST /api/lead hoje aceita qualquer chamada. Sem rate limit, fica vulnerável a spam de leads falsos.",
    why: "Lead falso polui o pipeline e atrapalha métricas. Rate limit por IP é primeira barreira.",
    approach:
      "@upstash/ratelimit + Vercel KV (ou Redis). 5 leads por IP por minuto é razoável. Aplicar no route handler.",
    touches: ["src/app/api/lead/route.ts", "src/lib/rate-limit.ts (novo)"],
    effort: "S",
  },
  {
    id: "captcha",
    title: "Captcha invisível no form de leads",
    category: "infra",
    priority: "media",
    status: "pendente",
    summary:
      "hCaptcha ou Cloudflare Turnstile no formulário pra reduzir bots ainda mais.",
    why: "Rate limit pega volume, captcha pega bot inteligente que finge ser humano.",
    approach: "Cloudflare Turnstile é gratuito e invisível. Adicionar no FormModal.tsx.",
    touches: ["src/components/FormModal.tsx", "src/app/api/lead/route.ts"],
    effort: "S",
  },
  {
    id: "logs-estruturados",
    title: "Logs estruturados",
    category: "infra",
    priority: "baixa",
    status: "pendente",
    summary: "Trocar console.log por logger estruturado (pino, winston).",
    why: "Logs grepáveis e queries no Vercel/Datadog ficam mil vezes mais fáceis.",
    approach: "pino + pino-pretty pra dev. Wrapper em src/lib/logger.ts.",
    effort: "S",
  },
];

/**
 * Aplica overrides de status (vindos do roadmap-store) sobre o ROADMAP base.
 */
export function applyProgress(progress: Record<string, Status>): RoadmapTask[] {
  return ROADMAP.map((task) => {
    const override = progress[task.id];
    return override ? { ...task, status: override } : task;
  });
}

export function countByPriorityIn(tasks: RoadmapTask[], priority: Priority): number {
  return tasks.filter((t) => t.priority === priority && t.status !== "concluida").length;
}

export function pendingCountIn(tasks: RoadmapTask[]): number {
  return tasks.filter((t) => t.status !== "concluida").length;
}

export function tasksByCategoryIn(tasks: RoadmapTask[]): Record<Category, RoadmapTask[]> {
  const map: Record<Category, RoadmapTask[]> = {
    seguranca: [],
    database: [],
    integracao: [],
    produto: [],
    infra: [],
  };
  for (const task of tasks) map[task.category].push(task);
  return map;
}

// ─── Versões "puras" sobre ROADMAP base (mantidas pra compatibilidade) ───

export function countByPriority(priority: Priority): number {
  return countByPriorityIn(ROADMAP, priority);
}

export function pendingCount(): number {
  return pendingCountIn(ROADMAP);
}

export function tasksByCategory(): Record<Category, RoadmapTask[]> {
  return tasksByCategoryIn(ROADMAP);
}
