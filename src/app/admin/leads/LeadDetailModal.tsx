"use client";
import { useEffect, useRef, useState } from "react";
import type { Lead, LeadStatus, Profile } from "@/lib/leads-store";
import { WA_TEMPLATES, renderTemplate, buildWaUrl } from "@/lib/wa-templates";

interface Props {
  lead: Lead;
  rgb: string;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

const PROFILE_LABELS: Record<Profile, string> = {
  open_company: "Abrir empresa",
  existing_company: "Já tem empresa",
  first_freela: "Primeiro freela",
  mei: "Sair do MEI",
  other: "Outro",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  convertido: "Convertido",
  perdido: "Perdido",
};

const STATUS_RGB: Record<LeadStatus, string> = {
  novo: "59,130,246",
  em_contato: "234,179,8",
  convertido: "34,197,94",
  perdido: "239,68,68",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

export default function LeadDetailModal({ lead, rgb, onClose, onUpdate }: Props) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [savedValue, setSavedValue] = useState(lead.notes ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [statusBusy, setStatusBusy] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const hasNotes = !!(lead.notes && lead.notes.trim());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const savedFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function performSave(value: string) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/lead/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      if (!res.ok) throw new Error("falhou");
      const updated = (await res.json()) as Lead;
      onUpdate(updated);
      setSavedValue(value);
      setSaveState("saved");
      if (savedFlashTimerRef.current) clearTimeout(savedFlashTimerRef.current);
      savedFlashTimerRef.current = setTimeout(() => {
        setSaveState((s) => (s === "saved" ? "idle" : s));
      }, 1600);
    } catch {
      setSaveState("error");
    } finally {
      inFlightRef.current = false;
      // Se o usuário continuou digitando enquanto salvava, dispara outro save
      // (compara com o valor mais recente do state via callback)
      setNotes((current) => {
        if (current !== value) {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => performSave(current), 700);
          setSaveState("pending");
        }
        return current;
      });
    }
  }

  // Debounced auto-save quando notes muda
  useEffect(() => {
    if (notes === savedValue) return;
    setSaveState("pending");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSave(notes);
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  // Flush pending save quando o modal fecha (best effort)
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (notes !== savedValue && !inFlightRef.current) {
        // fire-and-forget — não bloqueia o fechamento
        fetch(`/api/lead/${lead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeStatus(next: LeadStatus) {
    if (statusBusy || next === lead.status) return;
    setStatusBusy(true);
    try {
      const res = await fetch(`/api/lead/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("falhou");
      const updated = (await res.json()) as Lead;
      onUpdate(updated);
    } catch {
      alert("Não foi possível atualizar o status");
    } finally {
      setStatusBusy(false);
    }
  }

  const phoneDigits = lead.phone.replace(/\D/g, "");
  const wppHref = `https://wa.me/55${phoneDigits}`;
  const mailHref = `mailto:${lead.email}`;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center px-4 py-8"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] max-h-[88vh] flex flex-col rounded-2xl"
        style={{
          background: `linear-gradient(180deg, rgba(${rgb},0.06), rgba(${rgb},0.01)), #191919`,
          border: `1px solid rgba(${rgb},0.35)`,
          boxShadow: `0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px -10px rgba(${rgb},0.18)`,
          animation: "leadModalIn 0.25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top actions: Obs toggle + Close — escondido quando o painel de obs está aberto */}
        {!notesOpen && (
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            onClick={() => setNotesOpen((v) => !v)}
            aria-label={notesOpen ? "Fechar observações" : "Abrir observações"}
            title={
              notesOpen
                ? "Fechar observações"
                : hasNotes
                  ? "Editar observações"
                  : "Adicionar observação"
            }
            className="relative h-8 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-semibold transition-all"
            style={{
              background: notesOpen
                ? `linear-gradient(135deg, rgba(${rgb},0.35), rgba(${rgb},0.15))`
                : hasNotes
                  ? `linear-gradient(135deg, rgba(${rgb},0.20), rgba(${rgb},0.06))`
                  : "rgba(255,255,255,0.06)",
              border: notesOpen
                ? `1px solid rgba(${rgb},0.6)`
                : hasNotes
                  ? `1px solid rgba(${rgb},0.35)`
                  : "1px solid rgba(255,255,255,0.1)",
              color: notesOpen || hasNotes ? "#fafafa" : "rgba(255,255,255,0.65)",
              boxShadow: notesOpen ? `0 0 0 1px rgba(${rgb},0.15) inset` : "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
            Obs
            {/* Status dot — cinza vazio, vermelho preenchido */}
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
              style={
                hasNotes
                  ? {
                      background: "#ef4444",
                      boxShadow: "0 0 0 2px #191919, 0 0 8px rgba(239,68,68,0.7)",
                    }
                  : {
                      background: "rgba(255,255,255,0.25)",
                      boxShadow: "0 0 0 2px #191919",
                    }
              }
            />
          </button>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        )}

        {/* Header — name + status badge */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] text-white"
              style={{
                background: `linear-gradient(135deg, rgba(${rgb},0.6), rgba(${rgb},0.3))`,
                border: `1px solid rgba(${rgb},0.5)`,
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
            <div className="flex-1 min-w-0" style={{ paddingRight: "120px" }}>
              <h2 className="text-[18px] font-bold text-[#fafafa] leading-tight tracking-tight truncate">
                {lead.name}
              </h2>
              <p className="text-[11px] text-white/45 mt-1 font-mono">
                id: {lead.id.slice(0, 8)}…
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 pb-6 flex-1 min-h-0 space-y-5">
          {/* Quick contact actions */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={wppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #25d366, #128c7e)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              WhatsApp
            </a>
            <a
              href={mailHref}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold text-white/85 transition-all hover:bg-white/10"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-.9.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email
            </a>
          </div>

          {/* WhatsApp templates rápidos */}
          <Section title="Templates de WhatsApp">
            <div className="flex flex-wrap gap-1.5">
              {WA_TEMPLATES.map((tpl) => {
                const text = renderTemplate(tpl.template, lead);
                const url = buildWaUrl(lead.phone, text);
                return (
                  <a
                    key={tpl.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={text}
                    className="text-[10.5px] font-medium px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                    style={{
                      background: "rgba(37,211,102,0.10)",
                      border: "1px solid rgba(37,211,102,0.30)",
                      color: "#86efac",
                    }}
                  >
                    <span>{tpl.emoji}</span>
                    {tpl.label}
                  </a>
                );
              })}
            </div>
            <p className="text-[10px] text-white/35 mt-2 italic">
              Clique pra abrir o WhatsApp com a mensagem pré-preenchida
            </p>
          </Section>

          {lead.isDuplicateOf && (
            <div
              className="rounded-lg px-3 py-2.5 flex items-center gap-2.5"
              style={{
                background: "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(251,191,36,0.03))",
                border: "1px solid rgba(251,191,36,0.4)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-semibold text-[#fbbf24]">
                  Possível duplicata
                </div>
                <div className="text-[10px] text-white/55 mt-0.5 font-mono truncate">
                  Email/telefone batem com lead{" "}
                  <span className="text-white/75">{lead.isDuplicateOf.slice(0, 8)}…</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact info */}
          <Section title="Contato">
            <Field label="Telefone" value={lead.phone} mono />
            <Field label="Email" value={lead.email} mono />
            {lead.coupon && <Field label="Cupom" value={lead.coupon} mono accent="#6ee7b7" />}
          </Section>

          {/* Qualification */}
          <Section title="Qualificação">
            <Field
              label="Trabalha"
              value={lead.worksWhere === "brasil" ? "🇧🇷 Brasil" : "🌎 Exterior"}
            />
            <Field label="Perfil" value={PROFILE_LABELS[lead.profile]} />
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <TagsEditor
              leadId={lead.id}
              initialTags={lead.tags ?? []}
              onUpdate={onUpdate}
            />
          </Section>

          {/* Status — clickable */}
          <Section title="Status">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => {
                const isActive = lead.status === s;
                const sRgb = STATUS_RGB[s];
                return (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    disabled={statusBusy || isActive}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all disabled:cursor-default"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, rgba(${sRgb},0.25), rgba(${sRgb},0.1))`
                        : "rgba(255,255,255,0.04)",
                      border: isActive
                        ? `1px solid rgba(${sRgb},0.6)`
                        : "1px solid rgba(255,255,255,0.08)",
                      color: isActive ? `rgba(${sRgb},1)` : "rgba(255,255,255,0.55)",
                      boxShadow: isActive ? `0 0 0 1px rgba(${sRgb},0.15) inset` : "none",
                    }}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* UTM data */}
          {lead.utmData && (
            <Section title="UTM Data">
              <div
                className="font-mono text-[11px] px-3 py-2.5 rounded-lg space-y-0.5"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {lead.utmData.utmSource && (
                  <div>
                    <span className="text-white/35">utm_source: </span>
                    {lead.utmData.utmSource}
                  </div>
                )}
                {lead.utmData.utmMedium && (
                  <div>
                    <span className="text-white/35">utm_medium: </span>
                    {lead.utmData.utmMedium}
                  </div>
                )}
                {lead.utmData.utmCampaign && (
                  <div>
                    <span className="text-white/35">utm_campaign: </span>
                    {lead.utmData.utmCampaign}
                  </div>
                )}
                {lead.utmData.utmContent && (
                  <div>
                    <span className="text-white/35">utm_content: </span>
                    {lead.utmData.utmContent}
                  </div>
                )}
                {lead.utmData.utmTerm && (
                  <div>
                    <span className="text-white/35">utm_term: </span>
                    {lead.utmData.utmTerm}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Status timeline — populated from statusHistory */}
          {Array.isArray(lead.statusHistory) && lead.statusHistory.length > 0 && (
            <Section title="Histórico de status">
              <div className="space-y-2 mt-1">
                {lead.statusHistory.map((entry, i) => {
                  const sRgb = STATUS_RGB[entry.status];
                  const isLast = i === lead.statusHistory.length - 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex flex-col items-center" style={{ width: 16 }}>
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: `rgba(${sRgb},0.95)`,
                            boxShadow: isLast
                              ? `0 0 0 3px rgba(${sRgb},0.18)`
                              : "none",
                          }}
                        />
                        {!isLast && (
                          <div
                            className="w-px flex-1 mt-1"
                            style={{
                              background: "rgba(255,255,255,0.1)",
                              minHeight: 16,
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 flex items-baseline justify-between gap-3 py-0.5">
                        <span
                          className="text-[11.5px] font-medium"
                          style={{ color: isLast ? "#fafafa" : "rgba(255,255,255,0.65)" }}
                        >
                          {STATUS_LABELS[entry.status]}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {fmtDate(entry.at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Timestamps */}
          <Section title="Linha do tempo">
            <Field label="Criado" value={fmtDate(lead.createdAt)} mono small />
            <Field label="Atualizado" value={fmtDate(lead.updatedAt)} mono small />
          </Section>
        </div>

        {/* Notes panel — slides over the body */}
        {notesOpen && (
          <div
            className="absolute inset-0 flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(180deg, rgba(${rgb},0.10), rgba(${rgb},0.02) 30%), #191919`,
              animation: "leadNotesIn 0.22s ease",
              zIndex: 5,
            }}
          >
            {/* Notes header */}
            <div
              className="flex items-center gap-3 px-6 py-4 border-b"
              style={{ borderColor: `rgba(${rgb},0.18)` }}
            >
              <button
                onClick={() => setNotesOpen(false)}
                aria-label="Voltar"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/65 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <div className="flex-1">
                <h3 className="text-[14px] font-bold leading-tight">Obs</h3>
                <p className="text-[10px] text-white/45 mt-0.5 truncate">{lead.name}</p>
              </div>
              <SaveStatusBadge state={saveState} />
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Notes editor — fills remaining space, auto-saves */}
            <div className="flex-1 min-h-0 flex flex-col p-6 gap-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações do atendimento, próximos passos, contexto…"
                autoFocus
                className="flex-1 min-h-0 w-full text-[13px] text-[#fafafa] placeholder-white/25 outline-none rounded-lg p-4 resize-none transition-colors"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "inherit",
                  lineHeight: 1.55,
                }}
              />
              <div className="flex items-center justify-between gap-3 text-[10px] text-white/35">
                <span>
                  {notes.length} {notes.length === 1 ? "caractere" : "caracteres"}
                </span>
                <span className="italic">salva automaticamente</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes leadModalIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes leadNotesIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
  small = false,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[11px] text-white/45 flex-shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono" : ""} ${small ? "text-[11px]" : "text-[12.5px]"}`}
        style={{ color: accent || "#fafafa" }}
      >
        {value}
      </span>
    </div>
  );
}

function TagsEditor({
  leadId,
  initialTags,
  onUpdate,
}: {
  leadId: string;
  initialTags: string[];
  onUpdate: (lead: Lead) => void;
}) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Sync se o lead mudar externamente
  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  async function persist(next: string[]) {
    const previous = tags;
    setTags(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/lead/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: next }),
      });
      if (!res.ok) throw new Error("falhou");
      const updated = (await res.json()) as Lead;
      onUpdate(updated);
    } catch {
      setTags(previous);
    } finally {
      setBusy(false);
    }
  }

  function addTag() {
    const t = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t) return;
    if (tags.includes(t)) {
      setInput("");
      return;
    }
    persist([...tags, t]);
    setInput("");
  }

  function removeTag(t: string) {
    persist(tags.filter((x) => x !== t));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.length === 0 && (
          <span className="text-[11px] text-white/35 italic py-1">
            sem tags ainda
          </span>
        )}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-1 rounded-full"
            style={{
              background: "rgba(143,111,255,0.12)",
              border: "1px solid rgba(143,111,255,0.35)",
              color: "#c4b1ff",
            }}
          >
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              disabled={busy}
              className="text-[#c4b1ff] hover:text-white transition-colors disabled:opacity-30"
              aria-label={`Remover tag ${tag}`}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder="adicionar tag (Enter)..."
        disabled={busy}
        className="w-full text-[11px] text-[#fafafa] placeholder-white/30 outline-none rounded-lg px-3 py-2 transition-colors"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}

function SaveStatusBadge({ state }: { state: SaveState }) {
  const config: Record<SaveState, { label: string; color: string; bg: string; border: string; dot?: boolean; pulse?: boolean }> = {
    idle: {
      label: "Salvo",
      color: "rgba(255,255,255,0.45)",
      bg: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.08)",
    },
    pending: {
      label: "Digitando…",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.3)",
      pulse: true,
    },
    saving: {
      label: "Salvando…",
      color: "#93c5fd",
      bg: "rgba(147,197,253,0.08)",
      border: "rgba(147,197,253,0.3)",
      pulse: true,
    },
    saved: {
      label: "✓ Salvo",
      color: "#6ee7b7",
      bg: "rgba(110,231,183,0.10)",
      border: "rgba(110,231,183,0.35)",
    },
    error: {
      label: "Falha — tentando…",
      color: "#fca5a5",
      bg: "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.35)",
    },
  };
  const c = config[state];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all whitespace-nowrap"
      style={{
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      {c.pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: c.color,
            animation: "saveBlink 1s ease-in-out infinite",
          }}
        />
      )}
      {c.label}
      <style jsx>{`
        @keyframes saveBlink {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </span>
  );
}
