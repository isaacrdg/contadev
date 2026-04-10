"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ThemeToggle from "./ThemeToggle";

export default function RedatorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/redator/login";

  if (isLoginPage) {
    return (
      <div className="redator-theme min-h-screen flex items-center justify-center p-6">
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        {children}
      </div>
    );
  }

  return (
    <div className="redator-theme min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: "var(--header-bg)",
          borderBottom: "1px solid var(--border)",
        }}
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
            <div style={{ borderLeft: "1px solid var(--border)" }} className="pl-3 ml-1">
              <div className="text-[13px] font-semibold leading-none tracking-tight" style={{ color: "var(--text)" }}>
                Blog
              </div>
              <div className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>Redator</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/blog"
              target="_blank"
              className="text-[11px] px-3 py-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Ver blog
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/redator/login", { method: "DELETE" });
                window.location.href = "/redator/login";
              }}
              className="text-[11px] px-3 py-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-muted)" }}
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

const themeCSS = `
  /* ── Dark (default) ── */
  .redator-theme,
  [data-theme="dark"] .redator-theme {
    --bg: rgb(25, 25, 25);
    --bg-card: #1c1c1c;
    --bg-input: rgba(0, 0, 0, 0.3);
    --bg-editor: rgba(0, 0, 0, 0.3);
    --header-bg: rgba(25, 25, 25, 0.85);
    --text: #fafafa;
    --text-muted: rgba(255, 255, 255, 0.55);
    --text-dimmed: rgba(255, 255, 255, 0.35);
    --border: rgba(255, 255, 255, 0.08);
    --border-strong: rgba(255, 255, 255, 0.18);
    --toggle-bg: rgba(255, 255, 255, 0.04);
    --toggle-border: rgba(255, 255, 255, 0.10);
    --toggle-active-bg: rgba(255, 255, 255, 0.12);
    --toggle-active-color: #fafafa;
    --toggle-inactive-color: rgba(255, 255, 255, 0.45);
    --status-draft-bg: rgba(234, 179, 8, 0.15);
    --status-draft-border: rgba(234, 179, 8, 0.45);
    --status-draft-color: #fbbf24;
    --status-pub-bg: rgba(34, 197, 94, 0.15);
    --status-pub-border: rgba(34, 197, 94, 0.45);
    --status-pub-color: #6ee7b7;
    background: var(--bg);
    color: var(--text);
  }

  /* ── Light ── */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] {
    --bg: #f8f8f8;
    --bg-card: #ffffff;
    --bg-input: #f0f0f0;
    --bg-editor: #ffffff;
    --header-bg: rgba(248, 248, 248, 0.92);
    --text: #1a1a1a;
    --text-muted: rgba(0, 0, 0, 0.55);
    --text-dimmed: rgba(0, 0, 0, 0.35);
    --border: rgba(0, 0, 0, 0.10);
    --border-strong: rgba(0, 0, 0, 0.20);
    --toggle-bg: rgba(0, 0, 0, 0.05);
    --toggle-border: rgba(0, 0, 0, 0.12);
    --toggle-active-bg: rgba(0, 0, 0, 0.10);
    --toggle-active-color: #1a1a1a;
    --toggle-inactive-color: rgba(0, 0, 0, 0.45);
    --status-draft-bg: rgba(234, 179, 8, 0.12);
    --status-draft-border: rgba(234, 179, 8, 0.40);
    --status-draft-color: #b45309;
    --status-pub-bg: rgba(34, 197, 94, 0.12);
    --status-pub-border: rgba(34, 197, 94, 0.40);
    --status-pub-color: #16a34a;
    background: var(--bg) !important;
    color: var(--text) !important;
  }

  /* ── Light: forçar override nos elementos com inline styles ── */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] input,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] textarea,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] select {
    background: #f0f0f0 !important;
    border-color: rgba(0, 0, 0, 0.15) !important;
    color: #1a1a1a !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] input::placeholder,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] textarea::placeholder {
    color: rgba(0, 0, 0, 0.35) !important;
  }
  /* Cards da sidebar */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background: #1c1c1c"],
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background:#1c1c1c"] {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.10) !important;
  }
  /* Toolbar do editor */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background: rgba(0, 0, 0, 0.4)"],
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background: rgba(0,0,0,0.4)"] {
    background: #f0f0f0 !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
  }
  /* Corpo do editor */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background: rgba(0, 0, 0, 0.3)"],
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background: rgba(0,0,0,0.3)"] {
    background: #ffffff !important;
    border-color: rgba(0, 0, 0, 0.12) !important;
  }
  /* Toolbar buttons */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="color: rgba(255, 255, 255"] {
    color: rgba(0, 0, 0, 0.6) !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="color: #fafafa"] {
    color: #1a1a1a !important;
  }
  /* Text muted overrides */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/40,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/45,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/50,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/55 {
    color: rgba(0, 0, 0, 0.55) !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/25,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/30,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/35 {
    color: rgba(0, 0, 0, 0.35) !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/70,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/75,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/80,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-white\\/85 {
    color: rgba(0, 0, 0, 0.75) !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .text-\\[\\#fafafa\\] {
    color: #1a1a1a !important;
  }
  /* Header do redator */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] header {
    background: rgba(248, 248, 248, 0.92) !important;
    border-bottom-color: rgba(0, 0, 0, 0.08) !important;
  }
  /* Blog list cards */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background: rgb(25, 25, 25)"],
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] [style*="background: rgb(25,25,25)"] {
    background: #f8f8f8 !important;
  }
  /* Separators */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .border-white\\/5,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .border-white\\/10 {
    border-color: rgba(0, 0, 0, 0.08) !important;
  }

  /* Editor tiptap prose override pra light */
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .ProseMirror {
    color: #374151 !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose h1,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose h2,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose h3 {
    color: #111827 !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose p,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose li,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose ul,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose ol {
    color: #374151 !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose a {
    color: #6644f2 !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose code {
    background: rgba(0, 0, 0, 0.06) !important;
    color: #1a1a1a !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose pre {
    background: #f5f5f5 !important;
    color: #1a1a1a !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose blockquote {
    border-color: rgba(0,0,0,0.15) !important;
    color: rgba(0,0,0,0.6) !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose th,
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose td {
    border-color: rgba(0,0,0,0.12) !important;
    color: #374151 !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose th {
    background: rgba(0,0,0,0.04) !important;
  }
  [data-theme="light"] .redator-theme,
  .redator-theme[data-theme="light"] .prose hr {
    border-color: rgba(0,0,0,0.12) !important;
  }

  /* Placeholder do tiptap */
  .redator-theme .tiptap p.is-editor-empty:first-child::before {
    color: var(--text-dimmed);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

