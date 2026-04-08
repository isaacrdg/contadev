"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import type { Lead, LeadStatus, Profile } from "@/lib/leads-store";
import LeadDetailModal from "./LeadDetailModal";

const COLUMNS: { id: LeadStatus; label: string; rgb: string }[] = [
  { id: "novo", label: "Novo", rgb: "59,130,246" },        // azul
  { id: "em_contato", label: "Em contato", rgb: "234,179,8" }, // amarelo
  { id: "convertido", label: "Convertido", rgb: "34,197,94" }, // verde
  { id: "perdido", label: "Perdido", rgb: "239,68,68" },    // vermelho
];

const STATUS_ORDER: LeadStatus[] = ["novo", "em_contato", "convertido", "perdido"];

const PROFILE_LABELS: Record<Profile, string> = {
  open_company: "Abrir empresa",
  existing_company: "Já tem empresa",
  first_freela: "Primeiro freela",
  mei: "Sair do MEI",
  other: "Outro",
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

/**
 * Retorna a hora em que o lead entrou no status atual (último item do statusHistory),
 * ou createdAt como fallback pra leads antigos.
 */
function lastStatusChangeAt(lead: Lead): string {
  const hist = lead.statusHistory;
  if (Array.isArray(hist) && hist.length > 0) {
    return hist[hist.length - 1].at;
  }
  return lead.createdAt;
}

/**
 * Retorna o nível de "frieza" do lead baseado no tempo no status atual.
 * Quanto mais tempo parado, mais "frio" — usado pra destacar visualmente.
 */
function ageHeat(iso: string): "fresh" | "warm" | "cold" | "frozen" {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (days < 1) return "fresh";
  if (days < 3) return "warm";
  if (days < 7) return "cold";
  return "frozen";
}

export default function LeadsKanban({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
  const wasDragRef = useRef(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [activeWorks, setActiveWorks] = useState<Set<"brasil" | "exterior">>(new Set());
  const [showStuckOnly, setShowStuckOnly] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation
  const [focusedLeadId, setFocusedLeadId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Todas as tags presentes nos leads (pra mostrar no filtro)
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) (l.tags ?? []).forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [leads]);

  // Aplica filtros
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${lead.name} ${lead.email} ${lead.phone} ${(lead.notes ?? "")} ${(lead.tags ?? []).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeTags.size > 0) {
        const leadTags = new Set(lead.tags ?? []);
        let hasAll = true;
        for (const t of activeTags) {
          if (!leadTags.has(t)) {
            hasAll = false;
            break;
          }
        }
        if (!hasAll) return false;
      }
      if (activeWorks.size > 0 && !activeWorks.has(lead.worksWhere)) return false;
      if (showStuckOnly) {
        if (lead.status === "convertido" || lead.status === "perdido") return false;
        if (ageHeat(lastStatusChangeAt(lead)) !== "frozen") return false;
      }
      return true;
    });
  }, [leads, searchQuery, activeTags, activeWorks, showStuckOnly]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    activeTags.size > 0 ||
    activeWorks.size > 0 ||
    showStuckOnly;

  function clearFilters() {
    setSearchQuery("");
    setActiveTags(new Set());
    setActiveWorks(new Set());
    setShowStuckOnly(false);
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function toggleWorks(w: "brasil" | "exterior") {
    setActiveWorks((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  }

  const openLead = useMemo(
    () => leads.find((l) => l.id === openLeadId) ?? null,
    [leads, openLeadId]
  );
  const openLeadCol = openLead
    ? COLUMNS.find((c) => c.id === openLead.status) ?? COLUMNS[0]
    : null;

  function applyLeadUpdate(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  // Move pra um status específico (usado pelo drop) — versão direta de moveLead
  async function moveLeadToStatus(id: string, nextStatus: LeadStatus) {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === nextStatus) return;

    const previous = leads;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: nextStatus, updatedAt: new Date().toISOString() } : l
      )
    );
    setPendingId(id);

    try {
      const res = await fetch(`/api/lead/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
    } catch {
      setLeads(previous);
    } finally {
      setPendingId(null);
    }
  }

  // ─── Drag handlers ───
  function onCardDragStart(e: React.DragEvent<HTMLElement>, leadId: string) {
    wasDragRef.current = true;
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leadId);
  }

  function onCardDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
    // pequeno delay pra que o click handler veja a flag e ignore
    setTimeout(() => {
      wasDragRef.current = false;
    }, 80);
  }

  function onColumnDragOver(e: React.DragEvent<HTMLElement>, colId: LeadStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) setDragOverCol(colId);
  }

  function onColumnDragLeave(e: React.DragEvent<HTMLElement>, colId: LeadStatus) {
    // só limpa se tá saindo pra fora da coluna (não pra um filho)
    const related = e.relatedTarget as Node | null;
    if (!related || !(e.currentTarget as Node).contains(related)) {
      if (dragOverCol === colId) setDragOverCol(null);
    }
  }

  function onColumnDrop(e: React.DragEvent<HTMLElement>, colId: LeadStatus) {
    e.preventDefault();
    setDragOverCol(null);
    // IMPORTANTE: limpar draggingId aqui também porque quando o card muda de
    // coluna, o React desmonta o <article> original e o evento `dragend` pode
    // não chegar no componente novo, deixando o card "preso" em opacity 0.35.
    setDraggingId(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveLeadToStatus(id, colId);
    // Reseta a flag de "veio de drag" também aqui — garantia caso onDragEnd
    // não dispare por causa do remount.
    setTimeout(() => {
      wasDragRef.current = false;
    }, 80);
  }

  function onCardClick(leadId: string) {
    if (wasDragRef.current) return;
    setOpenLeadId(leadId);
  }

  const grouped = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      novo: [],
      em_contato: [],
      convertido: [],
      perdido: [],
    };
    for (const lead of filteredLeads) map[lead.status].push(lead);
    return map;
  }, [filteredLeads]);

  // Lista plana ordenada por coluna pra navegação j/k
  const flatLeads = useMemo(() => {
    const out: Lead[] = [];
    for (const col of COLUMNS) {
      out.push(...(grouped[col.id] ?? []));
    }
    return out;
  }, [grouped]);

  // Keyboard shortcuts global
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (openLeadId) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape") (e.target as HTMLInputElement).blur();
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setShowHelp(false);
        setFocusedLeadId(null);
        return;
      }
      if (flatLeads.length === 0) return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const idx = focusedLeadId ? flatLeads.findIndex((l) => l.id === focusedLeadId) : -1;
        const next = flatLeads[Math.min(flatLeads.length - 1, idx + 1)];
        if (next) setFocusedLeadId(next.id);
        return;
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = focusedLeadId ? flatLeads.findIndex((l) => l.id === focusedLeadId) : 0;
        const prev = flatLeads[Math.max(0, idx - 1)];
        if (prev) setFocusedLeadId(prev.id);
        return;
      }
      if (e.key === "Enter" && focusedLeadId) {
        e.preventDefault();
        setOpenLeadId(focusedLeadId);
        return;
      }
      if (focusedLeadId && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const targetStatus = STATUS_ORDER[parseInt(e.key, 10) - 1];
        moveLeadToStatus(focusedLeadId, targetStatus);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openLeadId, focusedLeadId, flatLeads]);

  async function moveLead(id: string, direction: "left" | "right") {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const currentIdx = STATUS_ORDER.indexOf(lead.status);
    const nextIdx =
      direction === "right"
        ? Math.min(STATUS_ORDER.length - 1, currentIdx + 1)
        : Math.max(0, currentIdx - 1);
    if (nextIdx === currentIdx) return;
    const nextStatus = STATUS_ORDER[nextIdx];

    // Optimistic update
    const previous = leads;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: nextStatus, updatedAt: new Date().toISOString() } : l
      )
    );
    setPendingId(id);

    try {
      const res = await fetch(`/api/lead/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
    } catch {
      // Revert on error
      setLeads(previous);
    } finally {
      setPendingId(null);
    }
  }

  async function refresh() {
    try {
      const res = await fetch("/api/lead", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Lead[];
      setLeads(data);
    } catch {
      // ignore
    }
  }

  // Leads parados há mais de 7 dias no status atual (excluindo Convertido e Perdido)
  const stuckLeads = useMemo(() => {
    return leads.filter((l) => {
      if (l.status === "convertido" || l.status === "perdido") return false;
      return ageHeat(lastStatusChangeAt(l)) === "frozen";
    });
  }, [leads]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Leads</h1>
          <p className="text-[12px] text-white/40 mt-1">
            {leads.length} {leads.length === 1 ? "lead total" : "leads totais"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            title="Atalhos do teclado (?)"
            className="text-[12px] font-medium w-9 h-9 rounded-md transition-colors hover:bg-white/10 flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
            }}
            aria-label="Atalhos"
          >
            ?
          </button>
          <button
            onClick={refresh}
            className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa",
            }}
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-[99998] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="rounded-xl p-6 max-w-[420px] w-full"
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 50px -20px rgba(0,0,0,0.75)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[14px] font-semibold mb-4">Atalhos do teclado</h2>
            <div className="space-y-2 text-[12px]">
              <Shortcut keys={["/"]} desc="Focar busca" />
              <Shortcut keys={["j", "↓"]} desc="Próximo card" />
              <Shortcut keys={["k", "↑"]} desc="Card anterior" />
              <Shortcut keys={["Enter"]} desc="Abrir card focado" />
              <Shortcut keys={["1"]} desc="Mover pra Novo" />
              <Shortcut keys={["2"]} desc="Mover pra Em contato" />
              <Shortcut keys={["3"]} desc="Mover pra Convertido" />
              <Shortcut keys={["4"]} desc="Mover pra Perdido" />
              <Shortcut keys={["?"]} desc="Mostrar/esconder ajuda" />
              <Shortcut keys={["Esc"]} desc="Limpar foco / fechar" />
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full text-[11px] font-medium py-2 rounded-md transition-colors hover:bg-white/10"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {stuckLeads.length > 0 && (
        <div
          className="mb-5 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.03))",
            border: "1px solid rgba(239,68,68,0.35)",
            boxShadow: "0 8px 24px -12px rgba(239,68,68,0.3)",
          }}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(239,68,68,0.18)",
              border: "1px solid rgba(239,68,68,0.4)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-[#fca5a5]">
              {stuckLeads.length} {stuckLeads.length === 1 ? "lead parado" : "leads parados"} há mais de 7 dias
            </div>
            <div className="text-[10.5px] text-white/55 mt-0.5">
              Lead esquecido esfria — clique pra abrir e mover
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end max-w-[40%]">
            {stuckLeads.slice(0, 4).map((l) => (
              <button
                key={l.id}
                onClick={() => setOpenLeadId(l.id)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors hover:bg-white/10 truncate max-w-[120px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fafafa",
                }}
                title={`${l.name} · ${timeAgo(lastStatusChangeAt(l))}`}
              >
                {l.name.split(" ")[0]}
              </button>
            ))}
            {stuckLeads.length > 4 && (
              <span className="text-[10px] text-white/40 self-center">
                +{stuckLeads.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toolbar de filtros — compacta */}
      <div
        className="mb-5 rounded-lg p-2 flex flex-wrap items-center gap-2"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1 min-w-[220px]"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nome, telefone, email..."
            className="flex-1 bg-transparent text-[12px] text-[#fafafa] placeholder-white/30 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-white/40 hover:text-white"
              aria-label="Limpar busca"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Brasil/Exterior */}
        <FilterPill
          active={activeWorks.has("brasil")}
          onClick={() => toggleWorks("brasil")}
          label="Brasil"
        />
        <FilterPill
          active={activeWorks.has("exterior")}
          onClick={() => toggleWorks("exterior")}
          label="Exterior"
        />

        {/* Stuck only */}
        <FilterPill
          active={showStuckOnly}
          onClick={() => setShowStuckOnly((v) => !v)}
          label="Parados >7d"
          activeRgb="239,68,68"
        />

        {/* Toggle de tags (só aparece se tem tags) */}
        {allTags.length > 0 && (
          <button
            onClick={() => setTagsExpanded((v) => !v)}
            className="text-[10.5px] font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap"
            style={{
              background:
                tagsExpanded || activeTags.size > 0
                  ? "rgba(143,111,255,0.12)"
                  : "rgba(255,255,255,0.04)",
              border:
                tagsExpanded || activeTags.size > 0
                  ? "1px solid rgba(143,111,255,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
              color:
                tagsExpanded || activeTags.size > 0
                  ? "#c4b1ff"
                  : "rgba(255,255,255,0.6)",
            }}
          >
            Tags
            {activeTags.size > 0 && (
              <span className="text-[9px] tabular-nums opacity-80">
                ({activeTags.size})
              </span>
            )}
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: tagsExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[10.5px] font-medium px-3 py-1.5 rounded-full text-white/55 hover:text-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Limpar
          </button>
        )}

        {/* Tags row — só aparece quando expandido */}
        {tagsExpanded && allTags.length > 0 && (
          <div className="w-full flex flex-wrap gap-1.5 mt-1 pt-2 border-t border-white/5">
            {allTags.map((tag) => {
              const isActive = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="text-[10px] font-medium px-2 py-1 rounded-full transition-colors"
                  style={{
                    background: isActive
                      ? "rgba(143,111,255,0.20)"
                      : "rgba(255,255,255,0.04)",
                    border: isActive
                      ? "1px solid rgba(143,111,255,0.55)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: isActive ? "#c4b1ff" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {hasActiveFilters && (
          <div className="w-full text-[10px] text-white/40 mt-1 px-1">
            Mostrando {filteredLeads.length} de {leads.length}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = grouped[col.id];
          const isDropTarget = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => onColumnDragOver(e, col.id)}
              onDragLeave={(e) => onColumnDragLeave(e, col.id)}
              onDrop={(e) => onColumnDrop(e, col.id)}
              className="rounded-lg p-3 transition-colors"
              style={{
                background: isDropTarget
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.02)",
                border: isDropTarget
                  ? `1px solid rgba(${col.rgb},0.55)`
                  : "1px solid rgba(255,255,255,0.06)",
                minHeight: "200px",
              }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: `rgba(${col.rgb},0.9)` }}
                  />
                  <h2 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70">
                    {col.label}
                  </h2>
                </div>
                <span className="text-[10px] text-white/40 font-mono">{items.length}</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {items.length === 0 && (
                  <div className="text-[11px] text-white/25 text-center py-6 italic">
                    nenhum lead
                  </div>
                )}
                {items.map((lead) => {
                  const idx = STATUS_ORDER.indexOf(lead.status);
                  const canLeft = idx > 0;
                  const canRight = idx < STATUS_ORDER.length - 1;
                  const isPending = pendingId === lead.id;
                  return (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={(e) => onCardDragStart(e, lead.id)}
                      onDragEnd={onCardDragEnd}
                      onClick={() => onCardClick(lead.id)}
                      className="rounded-md p-3 transition-all cursor-grab active:cursor-grabbing hover:bg-white/[0.04] select-none"
                      style={{
                        background: "#1c1c1c",
                        borderLeft: `2px solid rgba(${col.rgb},0.8)`,
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderLeftWidth: "2px",
                        borderLeftColor: `rgba(${col.rgb},0.7)`,
                        boxShadow:
                          focusedLeadId === lead.id
                            ? `0 0 0 1px rgba(255,255,255,0.18)`
                            : "none",
                        opacity:
                          draggingId === lead.id
                            ? 0.35
                            : isPending
                              ? 0.5
                              : lead.status === "perdido"
                                ? 0.55
                                : 1,
                        transform: draggingId === lead.id ? "scale(0.97)" : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[13px] text-[#fafafa] leading-tight truncate">
                            {lead.name}
                          </div>
                          {lead.isDuplicateOf && (
                            <span
                              className="inline-block mt-1 text-[8.5px] font-bold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(251,191,36,0.12)",
                                border: "1px solid rgba(251,191,36,0.4)",
                                color: "#fbbf24",
                              }}
                              title="Já existe outro lead com mesmo email ou telefone"
                            >
                              ⚠ Duplicado
                            </span>
                          )}
                        </div>
                        {(() => {
                          const lastChange = lastStatusChangeAt(lead);
                          const heat = ageHeat(lastChange);
                          const heatColor =
                            heat === "fresh"
                              ? "rgba(255,255,255,0.4)"
                              : heat === "warm"
                                ? "rgba(251,191,36,0.85)"
                                : heat === "cold"
                                  ? "rgba(249,115,22,0.95)"
                                  : "rgba(239,68,68,1)";
                          return (
                            <span
                              className="text-[9px] font-mono whitespace-nowrap mt-0.5 flex items-center gap-1"
                              style={{ color: heatColor }}
                              title={`Há ${timeAgo(lastChange).replace("há ", "")} no status atual`}
                            >
                              {heat !== "fresh" && (
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: heatColor }}
                                />
                              )}
                              {timeAgo(lastChange)}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="space-y-0.5 mb-2.5">
                        <div className="text-[11px] text-white/65 font-mono">{lead.phone}</div>
                        <div className="text-[11px] text-white/55 truncate">{lead.email}</div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2.5">
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {lead.worksWhere === "brasil" ? "Brasil" : "Exterior"}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: "rgba(143,111,255,0.1)",
                            border: "1px solid rgba(143,111,255,0.25)",
                            color: "#c4b1ff",
                          }}
                        >
                          {PROFILE_LABELS[lead.profile]}
                        </span>
                        {lead.coupon && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium font-mono"
                            style={{
                              background: "rgba(110,231,183,0.1)",
                              border: "1px solid rgba(110,231,183,0.25)",
                              color: "#6ee7b7",
                            }}
                          >
                            {lead.coupon}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLead(lead.id, "left");
                          }}
                          disabled={!canLeft || isPending}
                          className="text-[14px] w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.7)",
                          }}
                          aria-label="Mover para coluna anterior"
                        >
                          ‹
                        </button>
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-white/40 hover:text-white/80 transition-colors"
                        >
                          WhatsApp →
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLead(lead.id, "right");
                          }}
                          disabled={!canRight || isPending}
                          className="text-[14px] w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.7)",
                          }}
                          aria-label="Mover para próxima coluna"
                        >
                          ›
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {openLead && openLeadCol && (
        <LeadDetailModal
          lead={openLead}
          rgb={openLeadCol.rgb}
          onClose={() => setOpenLeadId(null)}
          onUpdate={applyLeadUpdate}
        />
      )}
    </div>
  );
}

function Shortcut({ keys, desc }: { keys: string[]; desc: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-white/65">{desc}</span>
      <div className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="text-[10px] font-mono px-2 py-1 rounded leading-none"
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.85)",
              minWidth: "22px",
              textAlign: "center",
            }}
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  activeRgb = "143,111,255",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  activeRgb?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-[10.5px] font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
      style={{
        background: active
          ? `linear-gradient(135deg, rgba(${activeRgb},0.20), rgba(${activeRgb},0.08))`
          : "rgba(255,255,255,0.04)",
        border: active
          ? `1px solid rgba(${activeRgb},0.55)`
          : "1px solid rgba(255,255,255,0.08)",
        color: active ? `rgba(${activeRgb},1)` : "rgba(255,255,255,0.6)",
      }}
    >
      {label}
    </button>
  );
}
