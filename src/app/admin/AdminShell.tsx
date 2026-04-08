"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import RoadmapBanner from "./RoadmapBanner";
import CommandPalette from "./CommandPalette";

interface Props {
  children: ReactNode;
  authEnabled: boolean;
  roadmapPending: number;
  roadmapCritical: number;
}

export default function AdminShell({
  children,
  authEnabled,
  roadmapPending,
  roadmapCritical,
}: Props) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cmd+K / Ctrl+K abre command palette globalmente
  useEffect(() => {
    if (isLoginPage) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLoginPage]);

  // Fecha menu ao clicar fora
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onClick);
        document.removeEventListener("keydown", onKey);
      };
    }
  }, [menuOpen]);

  // Fecha o menu ao mudar de rota
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Página de login: chrome zero — só o card centralizado, fundo limpo
  if (isLoginPage) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "rgb(25,25,25)", color: "#fafafa" }}
      >
        {children}
      </div>
    );
  }

  // Layout normal do admin com header sticky + tabs + banner
  return (
    <div className="min-h-screen" style={{ background: "rgb(25,25,25)", color: "#fafafa" }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: "rgba(25,25,25,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center gap-5">
          {/* Logo + título compacto */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Conta Dev"
              style={{ height: "32px", width: "auto" }}
            />
            <div className="border-l border-white/10 pl-3 ml-1 hidden lg:block">
              <div className="text-[13px] font-semibold leading-none tracking-tight">
                Painel Admin
              </div>
              <div className="text-[10px] text-white/45 mt-1">Leads do site</div>
            </div>
          </div>

          {/* Search bar — ocupa o meio inteiro */}
          <button
            onClick={() => setPaletteOpen(true)}
            title="Buscar (⌘K)"
            className="hidden md:flex items-center gap-3 flex-1 max-w-[520px] h-10 px-4 rounded-lg text-[12.5px] text-white/45 hover:text-white/75 hover:border-white/15 transition-colors group"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="flex-1 text-left">Buscar leads, navegar...</span>
            <kbd
              className="text-[10px] font-mono px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              ⌘K
            </kbd>
          </button>

          <nav className="flex gap-1 items-center flex-shrink-0">
            <NavLink href="/admin/leads" active={pathname?.startsWith("/admin/leads")}>
              Leads
            </NavLink>
            <NavLink href="/admin/tickets" active={pathname?.startsWith("/admin/tickets")}>
              Tickets
            </NavLink>

            {/* Hamburger menu — Integrações + Roadmap + (futuras seções internas) + Sair */}
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Mais opções"
                aria-expanded={menuOpen}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                style={{
                  background: menuOpen ? "rgba(255,255,255,0.06)" : "transparent",
                  border: menuOpen
                    ? "1px solid rgba(255,255,255,0.12)"
                    : "1px solid transparent",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                {/* Dot indicador no botão hamburger se tem coisa pendente no roadmap */}
                {roadmapCritical > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{
                      background: "#ef4444",
                      boxShadow: "0 0 0 2px rgb(25,25,25), 0 0 6px rgba(239,68,68,0.7)",
                      animation: "roadmapPulse 1.8s ease-in-out infinite",
                    }}
                  />
                )}
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] min-w-[220px] rounded-xl p-1.5 z-50"
                  style={{
                    background: "#1c1c1c",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow:
                      "0 24px 60px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
                    animation: "menuIn 0.18s ease",
                  }}
                >
                  <div className="px-3 py-1.5 text-[9px] uppercase tracking-[0.08em] font-semibold text-white/35">
                    Visão geral
                  </div>
                  <MenuItem
                    href="/admin/dashboard"
                    active={pathname?.startsWith("/admin/dashboard")}
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="9" />
                        <rect x="14" y="3" width="7" height="5" />
                        <rect x="14" y="12" width="7" height="9" />
                        <rect x="3" y="16" width="7" height="5" />
                      </svg>
                    }
                    label="Dashboard"
                  />

                  <div className="my-1.5 mx-2 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

                  <div className="px-3 py-1.5 text-[9px] uppercase tracking-[0.08em] font-semibold text-white/35">
                    Interno
                  </div>
                  <MenuItem
                    href="/admin/roadmap"
                    active={pathname?.startsWith("/admin/roadmap")}
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11H3v9h6m6-9h6v9h-6M9 11V2h6v9M9 11h6" />
                      </svg>
                    }
                    label="Roadmap"
                    badge={
                      roadmapPending > 0 ? (
                        <span
                          className="text-[9px] font-bold leading-none px-1.5 py-1 rounded-full tabular-nums"
                          style={{
                            background:
                              roadmapCritical > 0
                                ? "rgba(239,68,68,0.18)"
                                : "rgba(143,111,255,0.18)",
                            border:
                              roadmapCritical > 0
                                ? "1px solid rgba(239,68,68,0.5)"
                                : "1px solid rgba(143,111,255,0.5)",
                            color: roadmapCritical > 0 ? "#fca5a5" : "#c4b1ff",
                          }}
                        >
                          {roadmapPending}
                        </span>
                      ) : null
                    }
                  />
                  <MenuItem
                    href="/admin/integracoes"
                    active={pathname?.startsWith("/admin/integracoes")}
                    icon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    }
                    label="Integrações"
                  />
                  {authEnabled && (
                    <>
                      <div className="my-1.5 mx-2 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                      <LogoutMenuItem />
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <RoadmapBanner pending={roadmapPending} critical={roadmapCritical} />
        {children}
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      <style jsx global>{`
        @keyframes roadmapPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
      style={{
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
        color: active ? "#fafafa" : "rgba(255,255,255,0.7)",
      }}
    >
      {children}
    </Link>
  );
}

function MenuItem({
  href,
  active,
  icon,
  label,
  badge,
}: {
  href: string;
  active?: boolean;
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-medium transition-colors"
      style={{
        background: active ? "rgba(143,111,255,0.12)" : "transparent",
        color: active ? "#fafafa" : "rgba(255,255,255,0.75)",
      }}
    >
      <span style={{ color: active ? "#c4b1ff" : "rgba(255,255,255,0.5)" }}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge}
    </Link>
  );
}

function LogoutMenuItem() {
  return (
    <form action="/api/admin/login" method="POST" className="block">
      <button
        type="button"
        onClick={async (e) => {
          e.preventDefault();
          await fetch("/api/admin/login", { method: "DELETE" });
          window.location.href = "/admin/login";
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-medium text-white/65 hover:text-white hover:bg-white/5 transition-colors text-left"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(255,255,255,0.5)" }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sair
      </button>
    </form>
  );
}
