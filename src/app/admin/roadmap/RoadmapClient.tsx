"use client";
import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  PRIORITY_RGB,
  type Category,
  type Priority,
  type RoadmapTask,
  type Status,
} from "@/lib/roadmap";

const CATEGORY_ORDER: Category[] = [
  "seguranca",
  "database",
  "integracao",
  "produto",
  "infra",
];

const PRIORITY_ORDER: Priority[] = ["critica", "alta", "media", "baixa"];

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  seguranca: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  database: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  integracao: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  produto: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  infra: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
};

interface Props {
  initialTasks: RoadmapTask[];
  totalCount: number;
}

export default function RoadmapClient({ initialTasks, totalCount }: Props) {
  const [tasks, setTasks] = useState<RoadmapTask[]>(initialTasks);
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());
  const [activePriorities, setActivePriorities] = useState<Set<Priority>>(new Set());
  const [hideDone, setHideDone] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // ─── Counters (sempre sobre o total, não filtrado) ───
  const counts = useMemo(() => {
    const byCat: Record<Category, number> = {
      seguranca: 0,
      database: 0,
      integracao: 0,
      produto: 0,
      infra: 0,
    };
    const byPri: Record<Priority, number> = {
      critica: 0,
      alta: 0,
      media: 0,
      baixa: 0,
    };
    let pending = 0;
    let done = 0;
    for (const t of tasks) {
      if (t.status !== "concluida") {
        byCat[t.category]++;
        byPri[t.priority]++;
        pending++;
      } else {
        done++;
      }
    }
    return { byCat, byPri, pending, done };
  }, [tasks]);

  // ─── Tasks filtradas ───
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (hideDone && t.status === "concluida") return false;
      if (activeCategories.size > 0 && !activeCategories.has(t.category)) return false;
      if (activePriorities.size > 0 && !activePriorities.has(t.priority)) return false;
      return true;
    });
  }, [tasks, activeCategories, activePriorities, hideDone]);

  // ─── Ações ───
  function toggleCategory(cat: Category) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function togglePriority(pri: Priority) {
    setActivePriorities((prev) => {
      const next = new Set(prev);
      if (next.has(pri)) next.delete(pri);
      else next.add(pri);
      return next;
    });
  }

  function clearFilters() {
    setActiveCategories(new Set());
    setActivePriorities(new Set());
  }

  async function cycleTaskStatus(task: RoadmapTask) {
    // pendente → em_andamento → concluida → pendente
    const next: Status =
      task.status === "pendente"
        ? "em_andamento"
        : task.status === "em_andamento"
          ? "concluida"
          : "pendente";

    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    setPendingId(task.id);

    try {
      const res = await fetch(`/api/roadmap/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("falhou");
    } catch {
      setTasks(previous);
    } finally {
      setPendingId(null);
    }
  }

  const hasFilters = activeCategories.size > 0 || activePriorities.size > 0;

  return (
    <div>
      {/* Hero — enxuto */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold tracking-tight">Roadmap</h1>
        <p className="text-[12px] text-white/50 mt-1.5 max-w-[640px] leading-relaxed">
          Tudo que precisa ser feito pra transformar este painel num CRM interno
          da Conta Dev. Marque cada task conforme avança.
        </p>
      </div>

      {/* Priority pills — interativos */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-white/40 mr-1">
          Prioridade
        </span>
        {PRIORITY_ORDER.map((p) => {
          const isActive = activePriorities.has(p);
          const count = counts.byPri[p];
          const rgb = PRIORITY_RGB[p];
          return (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-2"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, rgba(${rgb},0.25), rgba(${rgb},0.10))`
                  : "rgba(255,255,255,0.04)",
                border: isActive
                  ? `1px solid rgba(${rgb},0.6)`
                  : "1px solid rgba(255,255,255,0.08)",
                color: isActive ? `rgba(${rgb},1)` : "rgba(255,255,255,0.6)",
                boxShadow: isActive ? `0 0 0 1px rgba(${rgb},0.15) inset` : "none",
              }}
            >
              {PRIORITY_LABELS[p]}
              <span
                className="text-[9px] tabular-nums px-1.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? `rgba(${rgb},0.20)` : "rgba(255,255,255,0.06)",
                  color: isActive ? `rgba(${rgb},1)` : "rgba(255,255,255,0.45)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => setHideDone((v) => !v)}
          className="text-[10.5px] font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
          style={{
            background: hideDone ? "rgba(255,255,255,0.04)" : "rgba(110,231,183,0.10)",
            border: hideDone
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(110,231,183,0.35)",
            color: hideDone ? "rgba(255,255,255,0.55)" : "#6ee7b7",
          }}
        >
          {hideDone ? "Ocultar concluídas" : "Mostrando concluídas"}
          {counts.done > 0 && (
            <span className="text-[9px] tabular-nums opacity-70">({counts.done})</span>
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[10.5px] font-medium px-3 py-1.5 rounded-full transition-colors text-white/55 hover:text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        {/* Sidebar — filtros de categoria */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-white/40 mb-3">
              Categorias
            </div>
            <div className="flex flex-col gap-1">
              {CATEGORY_ORDER.map((cat) => {
                const isActive = activeCategories.has(cat);
                const count = counts.byCat[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="text-[12px] font-medium px-3 py-2 rounded-lg transition-all flex items-center gap-2.5 text-left"
                    style={{
                      background: isActive
                        ? "rgba(143,111,255,0.14)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(143,111,255,0.5)"
                        : "1px solid transparent",
                      color: isActive ? "#fafafa" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive
                          ? "rgba(143,111,255,0.3)"
                          : "rgba(255,255,255,0.06)",
                        border: isActive
                          ? "1px solid rgba(143,111,255,0.7)"
                          : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {isActive && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#c4b1ff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="opacity-70">{CATEGORY_ICONS[cat]}</span>
                    <span className="flex-1 truncate">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-[9.5px] tabular-nums text-white/35 font-mono">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer da sidebar com totais */}
          <div className="mt-3 px-1 text-[10px] text-white/35 leading-relaxed">
            <div>{counts.pending} pendentes · {counts.done} concluídas</div>
            <div className="text-white/25 mt-0.5">{totalCount} no total</div>
          </div>
        </aside>

        {/* Main — tasks */}
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-[13px] text-white/55 mb-1">Nenhuma task</div>
              <div className="text-[11px] text-white/35">
                {hasFilters
                  ? "Ajusta os filtros pra ver mais tarefas"
                  : "Tudo concluído por aqui!"}
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered
                .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority))
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isPending={pendingId === task.id}
                    onToggle={() => cycleTaskStatus(task)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function priorityWeight(p: Priority): number {
  return p === "critica" ? 0 : p === "alta" ? 1 : p === "media" ? 2 : 3;
}

function TaskCard({
  task,
  isPending,
  onToggle,
}: {
  task: RoadmapTask;
  isPending: boolean;
  onToggle: () => void;
}) {
  const rgb = PRIORITY_RGB[task.priority];
  const isDone = task.status === "concluida";
  const isInProgress = task.status === "em_andamento";

  return (
    <article
      className="rounded-lg p-4 transition-all"
      style={{
        background: isDone
          ? "rgba(255,255,255,0.015)"
          : `linear-gradient(135deg, rgba(${rgb},0.06), rgba(${rgb},0.01)), #1a1a1a`,
        border: isDone
          ? "1px solid rgba(255,255,255,0.05)"
          : `1px solid rgba(${rgb},0.25)`,
        boxShadow: isDone ? "none" : `0 1px 0 rgba(${rgb},0.06) inset`,
        opacity: isPending ? 0.6 : isDone ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Status checkbox — clique cicla pendente → em_andamento → concluida */}
        <button
          onClick={onToggle}
          disabled={isPending}
          className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all mt-0.5 disabled:cursor-wait"
          style={{
            background: isDone
              ? "rgba(110,231,183,0.18)"
              : isInProgress
                ? `rgba(${rgb},0.20)`
                : "rgba(255,255,255,0.04)",
            border: isDone
              ? "1px solid rgba(110,231,183,0.6)"
              : isInProgress
                ? `1px solid rgba(${rgb},0.6)`
                : "1px solid rgba(255,255,255,0.18)",
          }}
          title={
            isDone
              ? "Concluída — clique pra reabrir"
              : isInProgress
                ? "Em andamento — clique pra marcar concluída"
                : "Pendente — clique pra iniciar"
          }
          aria-label="Alternar status"
        >
          {isDone && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {isInProgress && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: `rgba(${rgb},0.95)` }}
            />
          )}
        </button>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className="text-[14px] font-semibold leading-tight flex-1"
              style={{
                color: isDone ? "rgba(255,255,255,0.5)" : "#fafafa",
                textDecoration: isDone ? "line-through" : "none",
                textDecorationColor: "rgba(255,255,255,0.3)",
              }}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isInProgress && (
                <span
                  className="text-[8.5px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full"
                  style={{
                    background: `rgba(${rgb},0.18)`,
                    border: `1px solid rgba(${rgb},0.45)`,
                    color: `rgba(${rgb},1)`,
                  }}
                >
                  Em andamento
                </span>
              )}
              <span
                className="text-[8.5px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full"
                style={{
                  background: isDone ? "rgba(255,255,255,0.04)" : `rgba(${rgb},0.18)`,
                  border: isDone
                    ? "1px solid rgba(255,255,255,0.08)"
                    : `1px solid rgba(${rgb},0.45)`,
                  color: isDone ? "rgba(255,255,255,0.4)" : `rgba(${rgb},1)`,
                }}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span
                className="text-[8.5px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.55)",
                }}
                title="Esforço estimado"
              >
                {task.effort}
              </span>
            </div>
          </div>

          <p
            className="text-[11.5px] leading-relaxed mb-3"
            style={{ color: isDone ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.65)" }}
          >
            {task.summary}
          </p>

          {!isDone && (
            <div className="space-y-2 text-[11px] leading-relaxed">
              <div>
                <span className="text-white/35 uppercase text-[9px] font-semibold tracking-[0.06em] mr-2">
                  Por quê
                </span>
                <span className="text-white/65">{task.why}</span>
              </div>
              <div>
                <span className="text-white/35 uppercase text-[9px] font-semibold tracking-[0.06em] mr-2">
                  Como atacar
                </span>
                <span className="text-white/65">{task.approach}</span>
              </div>
              {task.touches && task.touches.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {task.touches.map((file) => (
                    <code
                      key={file}
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      {file}
                    </code>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
