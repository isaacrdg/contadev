"use client";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/leads-store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega leads quando abre (cold load — só na primeira vez é lento)
  useEffect(() => {
    if (!open || leads.length > 0) return;
    setLoading(true);
    fetch("/api/lead", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, leads.length]);

  if (!open) return null;

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div
      className="fixed inset-0 z-[99997] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <Command
        label="Command palette"
        className="w-full max-w-[560px] rounded-xl overflow-hidden"
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 50px -20px rgba(0,0,0,0.75)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder="Buscar leads ou navegar..."
          className="w-full px-5 py-4 text-[14px] text-[#fafafa] placeholder-white/35 outline-none bg-transparent"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        />
        <Command.List
          className="max-h-[55vh] overflow-y-auto p-2"
          style={{ background: "#1a1a1a" }}
        >
          <Command.Empty className="text-[12px] text-white/40 px-4 py-8 text-center">
            {loading ? "Carregando..." : "Nada encontrado"}
          </Command.Empty>

          <Command.Group heading="Navegação">
            <PaletteItem
              onSelect={() => go("/admin/leads")}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              label="Leads"
              shortcut="g l"
            />
            <PaletteItem
              onSelect={() => go("/admin/tickets")}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
                  <line x1="13" y1="5" x2="13" y2="7" />
                  <line x1="13" y1="11" x2="13" y2="13" />
                  <line x1="13" y1="17" x2="13" y2="19" />
                </svg>
              }
              label="Tickets"
              shortcut="g t"
            />
            <PaletteItem
              onSelect={() => go("/admin/dashboard")}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
              }
              label="Dashboard"
              shortcut="g d"
            />
            <PaletteItem
              onSelect={() => go("/admin/integracoes")}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              }
              label="Integrações"
            />
            <PaletteItem
              onSelect={() => go("/admin/roadmap")}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11H3v9h6m6-9h6v9h-6M9 11V2h6v9M9 11h6" />
                </svg>
              }
              label="Roadmap"
            />
          </Command.Group>

          {leads.length > 0 && (
            <Command.Group heading={`Leads (${leads.length})`}>
              {leads.map((lead) => (
                <Command.Item
                  key={lead.id}
                  value={`${lead.name} ${lead.email} ${lead.phone}`}
                  onSelect={() => {
                    onClose();
                    router.push(`/admin/leads?lead=${lead.id}`);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[12.5px] data-[selected=true]:bg-white/8"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {lead.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{lead.name}</div>
                    <div className="text-[10px] text-white/45 truncate">
                      {lead.email} · {lead.phone}
                    </div>
                  </div>
                  <span
                    className="text-[8.5px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{
                      background:
                        lead.status === "novo"
                          ? "rgba(59,130,246,0.18)"
                          : lead.status === "em_contato"
                            ? "rgba(234,179,8,0.18)"
                            : lead.status === "convertido"
                              ? "rgba(34,197,94,0.18)"
                              : "rgba(239,68,68,0.18)",
                      color:
                        lead.status === "novo"
                          ? "#7eb6ff"
                          : lead.status === "em_contato"
                            ? "#fbbf24"
                            : lead.status === "convertido"
                              ? "#6ee7b7"
                              : "#fca5a5",
                    }}
                  >
                    {lead.status.replace("_", " ")}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div
          className="px-4 py-2.5 flex items-center justify-between text-[10px] text-white/40"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#161616" }}
        >
          <div className="flex gap-3">
            <span><kbd className="font-mono">↑↓</kbd> navegar</span>
            <span><kbd className="font-mono">↵</kbd> selecionar</span>
            <span><kbd className="font-mono">esc</kbd> fechar</span>
          </div>
          <span>⌘K</span>
        </div>
      </Command>
    </div>
  );
}

function PaletteItem({
  onSelect,
  icon,
  label,
  shortcut,
}: {
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-[12.5px] data-[selected=true]:bg-white/8"
      style={{ color: "rgba(255,255,255,0.85)" }}
    >
      <span className="w-5 flex items-center justify-center" style={{ color: "rgba(255,255,255,0.55)" }}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd
          className="text-[9px] font-mono px-1.5 py-0.5 rounded leading-none"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
