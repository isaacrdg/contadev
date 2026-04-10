"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ThemeToggle, { useTheme } from "./ThemeToggle";

// Paletas definidas explicitamente — zero CSS variables, zero ambiguidade
const palettes = {
  dark: {
    bg: "rgb(25, 25, 25)",
    headerBg: "rgba(25, 25, 25, 0.92)",
    card: "#1c1c1c",
    input: "rgba(0, 0, 0, 0.3)",
    inputBorder: "rgba(255, 255, 255, 0.08)",
    text: "#fafafa",
    textMuted: "rgba(255, 255, 255, 0.55)",
    textDimmed: "rgba(255, 255, 255, 0.35)",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.18)",
  },
  light: {
    bg: "#f5f5f5",
    headerBg: "rgba(245, 245, 245, 0.92)",
    card: "#ffffff",
    input: "#ebebeb",
    inputBorder: "rgba(0, 0, 0, 0.12)",
    text: "#1a1a1a",
    textMuted: "rgba(0, 0, 0, 0.55)",
    textDimmed: "rgba(0, 0, 0, 0.35)",
    border: "rgba(0, 0, 0, 0.08)",
    borderStrong: "rgba(0, 0, 0, 0.20)",
  },
} as const;

export type Palette = (typeof palettes)["dark"];

// Exporta pra componentes filhos que precisarem
export { palettes };

export default function RedatorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/redator/login";
  const [theme, resolved, setTheme] = useTheme();
  const p = palettes[resolved];

  // Injeta CSS pro tiptap/prose no tema claro
  // CSS que muda TUDO quando resolved = light — override agressivo com !important
  const lightOverrides = resolved === "light" ? `
    /* Inputs, textareas, selects */
    main input, main textarea, main select {
      background: #ebebeb !important;
      border-color: rgba(0,0,0,0.12) !important;
      color: #1a1a1a !important;
    }
    main input::placeholder, main textarea::placeholder {
      color: rgba(0,0,0,0.40) !important;
    }
    /* Cards com bg #1c1c1c */
    main div[style*="#1c1c1c"] {
      background: #ffffff !important;
      border-color: rgba(0,0,0,0.08) !important;
    }
    /* Toolbar do editor (rgba(0,0,0,0.4)) */
    main div[style*="rgba(0, 0, 0, 0.4)"],
    main div[style*="rgba(0,0,0,0.4)"] {
      background: #e8e8e8 !important;
      border-color: rgba(0,0,0,0.10) !important;
    }
    /* Editor body (rgba(0,0,0,0.3)) */
    main div[style*="rgba(0, 0, 0, 0.3)"],
    main div[style*="rgba(0,0,0,0.3)"] {
      background: #ffffff !important;
      border-color: rgba(0,0,0,0.10) !important;
    }
    /* Texto #fafafa → escuro */
    main [style*="color: #fafafa"],
    main [style*="color:#fafafa"] {
      color: #1a1a1a !important;
    }
    /* Texto com opacidades de branco → escuro */
    main [style*="color: rgba(255, 255, 255"],
    main [style*="color: rgba(255,255,255"] {
      color: rgba(0, 0, 0, 0.65) !important;
    }
    /* Toolbar buttons */
    main button[style*="rgba(255, 255, 255, 0.55)"],
    main button[style*="rgba(255,255,255,0.55)"] {
      color: rgba(0, 0, 0, 0.55) !important;
    }
    /* Links com text-white classes */
    main a[class*="text-white"] {
      color: rgba(0, 0, 0, 0.55) !important;
    }
    /* Blog list cards */
    main div[style*="rgb(25, 25, 25)"],
    main div[style*="rgb(25,25,25)"] {
      background: #f5f5f5 !important;
    }
    /* Status badges — keep colors but darker text */
    main span[style*="color: #6ee7b7"] {
      color: #16a34a !important;
    }
    main span[style*="color: #fbbf24"] {
      color: #b45309 !important;
    }
    /* Tiptap editor */
    .ProseMirror { color: #374151 !important; }
    .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 { color: #111827 !important; }
    .ProseMirror p, .ProseMirror li { color: #374151 !important; }
    .ProseMirror a { color: #6644f2 !important; }
    .ProseMirror code { background: rgba(0,0,0,0.06) !important; color: #1a1a1a !important; }
    .ProseMirror pre { background: #f0f0f0 !important; color: #1a1a1a !important; }
    .ProseMirror blockquote { border-color: rgba(0,0,0,0.15) !important; color: rgba(0,0,0,0.6) !important; }
    .ProseMirror th, .ProseMirror td { border-color: rgba(0,0,0,0.12) !important; }
    .ProseMirror th { background: rgba(0,0,0,0.04) !important; }
    .ProseMirror hr { border-color: rgba(0,0,0,0.12) !important; }
    .tiptap p.is-editor-empty:first-child::before { color: rgba(0,0,0,0.35) !important; }
  ` : "";

  const placeholderCSS = `
    .tiptap p.is-editor-empty:first-child::before {
      color: ${resolved === "light" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"};
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  `;

  if (isLoginPage) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: p.bg, color: p.text }}
      >
        <style dangerouslySetInnerHTML={{ __html: placeholderCSS + lightOverrides }} />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: p.bg, color: p.text }}>
      <style dangerouslySetInnerHTML={{ __html: placeholderCSS + lightOverrides }} />
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{ background: p.headerBg, borderBottom: `1px solid ${p.border}` }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/redator" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Conta Dev"
              style={{ height: "28px", width: "auto" }}
              className="transition-opacity group-hover:opacity-80"
            />
            <div style={{ borderLeft: `1px solid ${p.border}` }} className="pl-3 ml-1">
              <div className="text-[13px] font-semibold leading-none tracking-tight" style={{ color: p.text }}>Blog</div>
              <div className="text-[10px] mt-1" style={{ color: p.textMuted }}>Redator</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} onChangeTheme={setTheme} />
            <Link
              href="/blog"
              target="_blank"
              className="text-[11px] px-3 py-1.5 rounded-md transition-colors"
              style={{ color: p.textMuted }}
            >
              Ver blog
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/redator/login", { method: "DELETE" });
                window.location.href = "/redator/login";
              }}
              className="text-[11px] px-3 py-1.5 rounded-md transition-colors"
              style={{ color: p.textMuted }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
