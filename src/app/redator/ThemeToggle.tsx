"use client";
import { useEffect, useRef, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type Resolved = "light" | "dark";

const STORAGE_KEY = "cd-redator-theme";

function getSystemPref(): Resolved {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolve(theme: Theme): Resolved {
  return theme === "system" ? getSystemPref() : theme;
}

export function useTheme(): [Theme, Resolved, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<Resolved>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setThemeState(stored);
      setResolved(resolve(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    setResolved(resolve(theme));
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return [theme, resolved, setThemeState];
}

export default function ThemeToggle({
  theme,
  onChangeTheme,
}: {
  theme: Theme;
  onChangeTheme: (t: Theme) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: "light",
      label: "Claro",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ),
    },
    {
      value: "dark",
      label: "Escuro",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      value: "system",
      label: "Sistema",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        </svg>
      ),
    },
  ];

  const current = options.find((o) => o.value === theme) ?? options[1];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Tema: ${current.label}`}
        className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
        style={{ color: "inherit", opacity: 0.6 }}
      >
        {current.icon}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] flex items-center gap-0.5 p-1 rounded-lg z-50"
          style={{
            background: theme === "light" || (theme === "system" && typeof window !== "undefined" && !window.matchMedia("(prefers-color-scheme: dark)").matches)
              ? "#ffffff" : "#2a2a2a",
            border: "1px solid",
            borderColor: theme === "light" || (theme === "system" && typeof window !== "undefined" && !window.matchMedia("(prefers-color-scheme: dark)").matches)
              ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.18)",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
            animation: "themePopIn 0.15s ease",
          }}
        >
          {options.map((opt) => {
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChangeTheme(opt.value);
                  setOpen(false);
                }}
                title={opt.label}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                style={{
                  background: isSelected ? "rgba(128,128,128,0.2)" : "transparent",
                  color: isSelected ? "inherit" : "inherit",
                  opacity: isSelected ? 1 : 0.5,
                }}
              >
                {opt.icon}
              </button>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes themePopIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  );
}
