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
      className="mb-5 rounded-lg pl-4 pr-3 py-2.5 flex items-center gap-3 relative overflow-hidden"
      style={{
        background: "rgba(143,111,255,0.08)",
        border: "1px solid rgba(143,111,255,0.30)",
        borderLeftWidth: "3px",
        borderLeftColor: "rgba(143,111,255,0.85)",
      }}
    >
      <div className="relative flex-shrink-0">
        <svg
          width="14"
          height="14"
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
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{
              background: "#ef4444",
              boxShadow: "0 0 0 1.5px rgb(25,25,25)",
              animation: "rmPulse 1.8s ease-in-out infinite",
            }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 text-[11.5px] leading-tight">
        <span className="text-[#fafafa] font-semibold">
          {pending} {pending === 1 ? "tarefa pendente" : "tarefas pendentes"}
        </span>
        {critical > 0 && (
          <>
            {" "}
            <span className="text-[#fca5a5] font-medium">
              · {critical} crítica{critical > 1 ? "s" : ""}
            </span>
          </>
        )}
        <span className="text-white/55"> antes do painel ir pra produção</span>
      </div>

      <Link
        href="/admin/roadmap"
        className="flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors hover:brightness-110 whitespace-nowrap"
        style={{
          background: "rgba(143,111,255,0.18)",
          border: "1px solid rgba(143,111,255,0.55)",
          color: "#e7dcff",
        }}
      >
        Ver roadmap
      </Link>

      <button
        onClick={handleDismiss}
        aria-label="Dispensar"
        className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-white/35 hover:text-white/75 hover:bg-white/5 transition-colors"
        title="Dispensar"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <style jsx>{`
        @keyframes rmPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
