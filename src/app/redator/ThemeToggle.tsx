"use client";
import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "cd-redator-theme";

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolve(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemPreference() : theme;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", resolve(theme));
}

// Ícones SVG — sol, lua, monitor
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

// Ordem fixa: claro, escuro, sistema — NUNCA muda
const OPTIONS: { value: Theme; label: string; Icon: () => React.ReactNode }[] = [
  { value: "light", label: "Claro", Icon: SunIcon },
  { value: "dark", label: "Escuro", Icon: MoonIcon },
  { value: "system", label: "Sistema", Icon: MonitorIcon },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load persisted
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  // Apply on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  // System preference change listener
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // Click outside closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Ícone do tema atual (pro botão fechado)
  const currentOption = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[1];

  return (
    <div className="relative" ref={ref}>
      {/* Botão — mostra só o ícone do selecionado */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Tema: ${currentOption.label}`}
        className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
        style={{
          color: "var(--text-muted)",
          background: open ? "var(--toggle-active-bg)" : "transparent",
        }}
      >
        <currentOption.Icon />
      </button>

      {/* Popover — ordem fixa: claro, escuro, sistema */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] rounded-lg p-1 z-50 flex items-center gap-0.5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6)",
            animation: "themePopIn 0.15s ease",
          }}
        >
          {OPTIONS.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                title={opt.label}
                aria-label={opt.label}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                style={{
                  background: isSelected ? "var(--toggle-active-bg)" : "transparent",
                  color: isSelected ? "var(--toggle-active-color)" : "var(--toggle-inactive-color)",
                }}
              >
                <opt.Icon />
              </button>
            );
          })}
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
