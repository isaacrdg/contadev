import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ContaDev — Contabilidade para Devs",
  description:
    "Centralize sua operação PJ em uma plataforma, fale com especialistas que entendem seu cenário e descubra quanto você pode economizar.",
};

export const viewport: Viewport = {
  themeColor: "#08080E",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}