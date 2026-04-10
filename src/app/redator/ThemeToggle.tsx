"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "cd-redator-theme";

function getSystemDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemDark() ? "dark" : "light";
  return theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute("data-theme", resolved);
  }, [theme]);

  // Listener pra quando o system theme muda (e o toggle tá em "system")
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      document.documentElement.setAttribute(
        "data-theme",
        mq.matches ? "dark" : "light"
      );
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const options: { value: Theme; icon: React.ReactNode; title: string }[] = [
    {
      value: "light",
      title: "Claro",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      value: "dark",
      title: "Escuro",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      value: "system",
      title: "Sistema",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="flex items-center rounded-md p-0.5"
      style={{
        background: "var(--toggle-bg)",
        border: "1px solid var(--toggle-border)",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.title}
          aria-label={opt.title}
          className="w-8 h-7 rounded flex items-center justify-center transition-colors"
          style={{
            background:
              theme === opt.value ? "var(--toggle-active-bg)" : "transparent",
            color:
              theme === opt.value
                ? "var(--toggle-active-color)"
                : "var(--toggle-inactive-color)",
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
