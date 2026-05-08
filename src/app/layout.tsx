import type { Metadata, Viewport } from "next";
import { Inter, Outfit, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FormProvider } from "@/components/FormContext";
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

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-ibm",
});

export const metadata: Metadata = {
  title: "Conta Dev",
  description:
    "Centralize sua operação PJ em uma plataforma, fale com especialistas que entendem seu cenário e descubra quanto você pode economizar.",
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#191919",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable} ${ibmPlexMono.variable}`} style={{ fontWeight: 300 }}>
      <body>
        <FormProvider>{children}</FormProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
