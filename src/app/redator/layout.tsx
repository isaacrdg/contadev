"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ThemeToggle, { useTheme } from "./ThemeToggle";
import { ThemeProvider, darkPalette, lightPalette } from "./ThemeContext";
import { useRedatorUser } from "./useRedatorUser";

export default function RedatorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/redator/login";
  const [theme, resolved, setTheme] = useTheme();
  const p = resolved === "light" ? lightPalette : darkPalette;
  const user = useRedatorUser();

  const editorCSS = `
    .tiptap p.is-editor-empty:first-child::before {
      color: ${resolved === "light" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)"};
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
    ${resolved === "light" ? `
      .ProseMirror { color: #374151; }
      .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 { color: #111827; }
      .ProseMirror a { color: #6644f2; }
      .ProseMirror code { background: rgba(0,0,0,0.06); color: #1a1a1a; }
      .ProseMirror pre { background: #f0f0f0; color: #1a1a1a; }
      .ProseMirror blockquote { border-color: rgba(0,0,0,0.15); color: rgba(0,0,0,0.6); }
      .ProseMirror th, .ProseMirror td { border-color: rgba(0,0,0,0.12); }
      .ProseMirror th { background: rgba(0,0,0,0.04); }
      .ProseMirror hr { border-color: rgba(0,0,0,0.12); }
    ` : ""}
  `;

  if (isLoginPage) {
    // Login é SEMPRE dark — tema claro só dentro do dash
    const dp = darkPalette;
    return (
      <ThemeProvider resolved="dark">
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: dp.bg, color: dp.text }}>
          {children}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider resolved={resolved}>
      <div className="min-h-screen" style={{ background: p.bg, color: p.text }}>
        <style dangerouslySetInnerHTML={{ __html: editorCSS }} />
        <header
          className="sticky top-0 z-50 backdrop-blur-md"
          style={{ background: p.headerBg, borderBottom: `1px solid ${p.border}` }}
        >
          <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/redator" className="flex items-center gap-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Conta Dev" style={{ height: "28px", width: "auto" }} className="transition-opacity group-hover:opacity-80" />
              <div style={{ borderLeft: `1px solid ${p.border}` }} className="pl-3 ml-1">
                <div className="text-[13px] font-semibold leading-none tracking-tight" style={{ color: p.text }}>Blog</div>
                <div className="text-[10px] mt-1" style={{ color: p.textMuted }}>Redator</div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} onChangeTheme={setTheme} />

              {user && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: p.input, color: p.text }}>
                    {user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: p.text }}>{user.name}</span>
                </div>
              )}

              <Link href="/blog" target="_blank" className="text-[11px] px-2.5 py-1.5 rounded-md" style={{ color: p.textMuted }}>
                Blog
              </Link>
              <button
                onClick={async () => {
                  await fetch("/api/redator/login", { method: "DELETE" });
                  window.location.href = "/redator/login";
                }}
                className="text-[11px] px-2.5 py-1.5 rounded-md"
                style={{ color: p.textMuted }}
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-6 py-8">{children}</main>
      </div>
    </ThemeProvider>
  );
}
