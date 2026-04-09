import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keystatic CMS",
  robots: { index: false, follow: false },
};

export default function KeystaticLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
