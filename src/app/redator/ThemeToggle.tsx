"use client";
import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "cd-redator-theme";

function getSystemDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemDark() ? "dark" : "light";
  return theme;
}

const icons: Record<Theme, React.ReactNode> = {
  light: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  dark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setTheme(stored);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute("data-theme", resolveTheme(theme));
  }, [theme]);

  // System theme change listener
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => document.documentElement.setAttribute("data-theme", mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // Click outside closes
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function select(t: Theme) {
    setTheme(t);
    setOpen(false);
  }

  const others = (["light", "dark", "system"] as Theme[]).filter((t) => t !== theme);

  return (
    <div className="relative" ref={ref}>
      {/* Botão principal — mostra só o ícone selecionado */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Mudar tema"
        className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
        style={{
          color: "var(--text-muted)",
          background: open ? "var(--toggle-active-bg)" : "transparent",
        }}
      >
        {icons[theme]}
      </button>

      {/* Popover — aparece com as 2 outras opções */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] flex items-center gap-0.5 p-1 rounded-lg z-50"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
            boxShadow: "0 12px 30px -10px rgba(0,0,0,0.5)",
            animation: "themePopIn 0.15s ease",
          }}
        >
          {/* Selecionado — sempre primeiro, com destaque */}
          <button
            onClick={() => setOpen(false)}
            title={theme === "light" ? "Claro" : theme === "dark" ? "Escuro" : "Sistema"}
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{
              background: "var(--toggle-active-bg)",
              color: "var(--toggle-active-color)",
            }}
          >
            {icons[theme]}
          </button>

          {/* Separador */}
          <div className="w-px h-5" style={{ background: "var(--border)" }} />

          {/* Outras 2 opções */}
          {others.map((t) => (
            <button
              key={t}
              onClick={() => select(t)}
              title={t === "light" ? "Claro" : t === "dark" ? "Escuro" : "Sistema"}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:opacity-80"
              style={{ color: "var(--toggle-inactive-color)" }}
            >
              {icons[t]}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes themePopIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
