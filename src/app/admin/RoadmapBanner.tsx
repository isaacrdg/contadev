"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DISMISS_KEY = "cd_admin_roadmap_banner_dismissed";

interface Props {
  pending: number;
  critical: number;
}

export default function RoadmapBanner({ pending, critical }: Props) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(true); // start true pra evitar flash

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY);
    setDismissed(stored === "1");
  }, []);

  if (dismissed) return null;
  if (pending === 0) return null;
  // Não mostrar dentro do próprio roadmap nem na página de login
  if (pathname?.startsWith("/admin/roadmap")) return null;
  if (pathname?.startsWith("/admin/login")) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div
      className="mb-6 rounded-xl px-5 py-4 flex items-center gap-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(102,68,242,0.12), rgba(102,68,242,0.03))",
        border: "1px solid rgba(143,111,255,0.4)",
        boxShadow: "0 12px 32px -16px rgba(102,68,242,0.4)",
      }}
    >
      <div
        className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center relative"
        style={{
          background: "rgba(143,111,255,0.18)",
          border: "1px solid rgba(143,111,255,0.45)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c4b1ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 11H3v9h6m6-9h6v9h-6M9 11V2h6v9M9 11h6" />
        </svg>
        {critical > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
            style={{
              background: "#ef4444",
              boxShadow:
                "0 0 0 2px rgb(25,25,25), 0 0 8px rgba(239,68,68,0.7)",
              animation: "rmPulse 1.8s ease-in-out infinite",
            }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#fafafa] mb-0.5">
          Tem coisa pra implementar antes do painel ir pra produção
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed">
          {pending} {pending === 1 ? "tarefa pendente" : "tarefas pendentes"}
          {critical > 0 && (
            <>
              {" "}— <span className="text-[#fca5a5] font-semibold">{critical} crítica{critical > 1 ? "s" : ""}</span>
            </>
          )}{" "}
          · segurança, banco de dados, integração com a API/DB existente.
        </p>
      </div>

      <Link
        href="/admin/roadmap"
        className="flex-shrink-0 text-[12px] font-semibold px-4 py-2.5 rounded-lg transition-all hover:brightness-110 whitespace-nowrap"
        style={{
          background: "linear-gradient(135deg, #6644f2, #5129f0)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff",
          boxShadow: "0 6px 18px -6px rgba(102,68,242,0.5)",
        }}
      >
        Ver roadmap →
      </Link>

      <button
        onClick={handleDismiss}
        aria-label="Dispensar"
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        title="Dispensar (volta a aparecer ao limpar localStorage)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <style jsx global>{`
        @keyframes rmPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
