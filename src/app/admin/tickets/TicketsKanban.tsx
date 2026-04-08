"use client";
import { useMemo, useState } from "react";
import type {
  Ticket,
  TicketStatus,
  TicketPriority,
} from "@/lib/tickets-store";

const COLUMNS: { id: TicketStatus; label: string; rgb: string }[] = [
  { id: "aberto", label: "Aberto", rgb: "59,130,246" },
  { id: "em_atendimento", label: "Em atendimento", rgb: "234,179,8" },
  { id: "aguardando_cliente", label: "Aguardando cliente", rgb: "143,111,255" },
  { id: "resolvido", label: "Resolvido", rgb: "34,197,94" },
];

const STATUS_ORDER: TicketStatus[] = [
  "aberto",
  "em_atendimento",
  "aguardando_cliente",
  "resolvido",
];

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

const PRIORITY_RGB: Record<TicketPriority, string> = {
  baixa: "147,197,253",
  media: "234,179,8",
  alta: "249,115,22",
  urgente: "239,68,68",
};

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function TicketsKanban({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = {
      aberto: [],
      em_atendimento: [],
      aguardando_cliente: [],
      resolvido: [],
    };
    for (const t of tickets) map[t.status].push(t);
    return map;
  }, [tickets]);

  async function moveTicket(id: string, direction: "left" | "right") {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;
    const idx = STATUS_ORDER.indexOf(ticket.status);
    const next =
      direction === "right"
        ? STATUS_ORDER[Math.min(STATUS_ORDER.length - 1, idx + 1)]
        : STATUS_ORDER[Math.max(0, idx - 1)];
    if (next === ticket.status) return;

    const previous = tickets;
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: next, updatedAt: new Date().toISOString() } : t))
    );
    setPendingId(id);
    try {
      const res = await fetch(`/api/ticket/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("falhou");
    } catch {
      setTickets(previous);
    } finally {
      setPendingId(null);
    }
  }

  async function refresh() {
    const res = await fetch("/api/ticket", { cache: "no-store" });
    if (res.ok) setTickets((await res.json()) as Ticket[]);
  }

  async function createTicket(data: {
    title: string;
    customer: string;
    contact: string;
    description: string;
    priority: TicketPriority;
  }) {
    const res = await fetch("/api/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setShowNewModal(false);
      await refresh();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Tickets</h1>
          <p className="text-[12px] text-white/40 mt-1">
            {tickets.length} {tickets.length === 1 ? "ticket total" : "tickets totais"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="text-[12px] font-medium px-4 py-2 rounded-lg transition-colors hover:bg-white/10"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa",
            }}
          >
            ↻ Atualizar
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors hover:bg-white/15"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fafafa",
            }}
          >
            + Novo ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = grouped[col.id];
          return (
            <div
              key={col.id}
              className="rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
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
                    nenhum ticket
                  </div>
                )}
                {items.map((ticket) => {
                  const idx = STATUS_ORDER.indexOf(ticket.status);
                  const canLeft = idx > 0;
                  const canRight = idx < STATUS_ORDER.length - 1;
                  const isPending = pendingId === ticket.id;
                  const pRgb = PRIORITY_RGB[ticket.priority];
                  return (
                    <article
                      key={ticket.id}
                      className="rounded-lg p-3 transition-all"
                      style={{
                        background: `linear-gradient(135deg, rgba(${col.rgb},0.08), rgba(${col.rgb},0.02)), #1a1a1a`,
                        border: `1px solid rgba(${col.rgb},0.25)`,
                        opacity: isPending ? 0.5 : ticket.status === "resolvido" ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="font-semibold text-[12.5px] text-[#fafafa] leading-tight flex-1">
                          {ticket.title}
                        </div>
                        <span
                          className="text-[8.5px] font-bold uppercase tracking-[0.05em] px-1.5 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            background: `rgba(${pRgb},0.18)`,
                            border: `1px solid rgba(${pRgb},0.45)`,
                            color: `rgba(${pRgb},1)`,
                          }}
                        >
                          {PRIORITY_LABELS[ticket.priority]}
                        </span>
                      </div>

                      <div className="text-[11px] text-white/65 mb-1">{ticket.customer}</div>
                      <div className="text-[10px] text-white/45 font-mono mb-2 truncate">
                        {ticket.contact}
                      </div>

                      {ticket.description && (
                        <p className="text-[10.5px] text-white/55 leading-relaxed mb-2.5 line-clamp-2">
                          {ticket.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => moveTicket(ticket.id, "left")}
                          disabled={!canLeft || isPending}
                          className="text-[14px] w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.7)",
                          }}
                          aria-label="Mover esquerda"
                        >
                          ‹
                        </button>
                        <span className="text-[9px] text-white/35 font-mono">
                          {timeAgo(ticket.createdAt)}
                        </span>
                        <button
                          onClick={() => moveTicket(ticket.id, "right")}
                          disabled={!canRight || isPending}
                          className="text-[14px] w-7 h-7 rounded flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.7)",
                          }}
                          aria-label="Mover direita"
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

      {showNewModal && (
        <NewTicketModal onClose={() => setShowNewModal(false)} onCreate={createTicket} />
      )}
    </div>
  );
}

function NewTicketModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    customer: string;
    contact: string;
    description: string;
    priority: TicketPriority;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("media");
  const [busy, setBusy] = useState(false);

  const valid = title.trim().length >= 2 && customer.trim() && contact.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    await onCreate({ title, customer, contact, description, priority });
    setBusy(false);
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-6 w-full max-w-[480px]"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 50px -20px rgba(0,0,0,0.75)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[16px] font-bold mb-1">Novo ticket</h2>
        <p className="text-[11px] text-white/45 mb-5">
          Cria um ticket de suporte associado a um cliente
        </p>

        <div className="space-y-3">
          <Input label="Título" value={title} onChange={setTitle} placeholder="Ex: Erro ao emitir nota fiscal" autoFocus />
          <Input label="Cliente" value={customer} onChange={setCustomer} placeholder="Nome do cliente" />
          <Input label="Contato" value={contact} onChange={setContact} placeholder="Email ou telefone" />
          <div>
            <label className="block text-[10px] uppercase tracking-[0.08em] text-white/50 font-semibold mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalhes do problema, contexto, etc."
              className="w-full text-[12px] text-[#fafafa] placeholder-white/30 outline-none rounded-lg p-3 resize-none"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.08em] text-white/50 font-semibold mb-2">
              Prioridade
            </label>
            <div className="flex gap-1.5">
              {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((p) => {
                const isActive = priority === p;
                const rgb = PRIORITY_RGB[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className="flex-1 text-[11px] font-semibold py-2 rounded-lg transition-all"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, rgba(${rgb},0.25), rgba(${rgb},0.10))`
                        : "rgba(255,255,255,0.04)",
                      border: isActive
                        ? `1px solid rgba(${rgb},0.6)`
                        : "1px solid rgba(255,255,255,0.08)",
                      color: isActive ? `rgba(${rgb},1)` : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-[12px] font-medium py-2.5 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!valid || busy}
            className="flex-1 text-[12px] font-medium py-2.5 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-white/15"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fafafa",
            }}
          >
            {busy ? "Criando..." : "Criar ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.08em] text-white/50 font-semibold mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-3 py-2.5 text-[12px] text-[#fafafa] placeholder-white/30 outline-none rounded-lg"
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
    </div>
  );
}
