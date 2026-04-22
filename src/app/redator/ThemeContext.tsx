"use client";
import { createContext, useContext } from "react";

export interface ThemePalette {
  bg: string;
  card: string;
  cardBorder: string;
  input: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  text: string;
  textStrong: string;
  textMuted: string;
  textDimmed: string;
  border: string;
  headerBg: string;
  toolbarBg: string;
  editorBg: string;
  // Status
  draftBg: string;
  draftBorder: string;
  draftText: string;
  reviewBg: string;
  reviewBorder: string;
  reviewText: string;
  pubBg: string;
  pubBorder: string;
  pubText: string;
}

export const darkPalette: ThemePalette = {
  bg: "rgb(25, 25, 25)",
  card: "#1c1c1c",
  cardBorder: "rgba(255, 255, 255, 0.06)",
  input: "rgba(0, 0, 0, 0.3)",
  inputBorder: "rgba(255, 255, 255, 0.08)",
  inputText: "#fafafa",
  inputPlaceholder: "rgba(255, 255, 255, 0.30)",
  text: "#fafafa",
  textStrong: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.55)",
  textDimmed: "rgba(255, 255, 255, 0.35)",
  border: "rgba(255, 255, 255, 0.08)",
  headerBg: "rgba(25, 25, 25, 0.92)",
  toolbarBg: "rgba(0, 0, 0, 0.4)",
  editorBg: "rgba(0, 0, 0, 0.3)",
  draftBg: "rgba(234, 179, 8, 0.15)",
  draftBorder: "rgba(234, 179, 8, 0.45)",
  draftText: "#fbbf24",
  reviewBg: "rgba(117, 83, 255, 0.15)",
  reviewBorder: "rgba(117, 83, 255, 0.45)",
  reviewText: "#c4b1ff",
  pubBg: "rgba(34, 197, 94, 0.15)",
  pubBorder: "rgba(34, 197, 94, 0.45)",
  pubText: "#6ee7b7",
};

export const lightPalette: ThemePalette = {
  bg: "#f5f5f5",
  card: "#ffffff",
  cardBorder: "rgba(0, 0, 0, 0.08)",
  input: "#ebebeb",
  inputBorder: "rgba(0, 0, 0, 0.12)",
  inputText: "#1a1a1a",
  inputPlaceholder: "rgba(0, 0, 0, 0.40)",
  text: "#1a1a1a",
  textStrong: "#000000",
  textMuted: "rgba(0, 0, 0, 0.55)",
  textDimmed: "rgba(0, 0, 0, 0.35)",
  border: "rgba(0, 0, 0, 0.08)",
  headerBg: "rgba(245, 245, 245, 0.92)",
  toolbarBg: "#e4e4e4",
  editorBg: "#ffffff",
  draftBg: "rgba(234, 179, 8, 0.12)",
  draftBorder: "rgba(234, 179, 8, 0.40)",
  draftText: "#b45309",
  reviewBg: "rgba(117, 83, 255, 0.12)",
  reviewBorder: "rgba(117, 83, 255, 0.40)",
  reviewText: "#5b3ed6",
  pubBg: "rgba(34, 197, 94, 0.12)",
  pubBorder: "rgba(34, 197, 94, 0.40)",
  pubText: "#16a34a",
};

const ThemeCtx = createContext<ThemePalette>(darkPalette);

export function ThemeProvider({
  resolved,
  children,
}: {
  resolved: "light" | "dark";
  children: React.ReactNode;
}) {
  const palette = resolved === "light" ? lightPalette : darkPalette;
  return <ThemeCtx.Provider value={palette}>{children}</ThemeCtx.Provider>;
}

export function usePalette(): ThemePalette {
  return useContext(ThemeCtx);
}
