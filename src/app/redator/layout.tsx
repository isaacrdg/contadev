"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function RedatorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/redator/login";

  if (isLoginPage) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "rgb(25,25,25)", color: "#fafafa" }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "rgb(25,25,25)", color: "#fafafa" }}>
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background: "rgba(25,25,25,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
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
            <div className="border-l border-white/10 pl-3 ml-1">
              <div className="text-[13px] font-semibold leading-none tracking-tight">
                Blog
              </div>
              <div className="text-[10px] text-white/45 mt-1">Redator</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              target="_blank"
              className="text-[11px] text-white/50 hover:text-white/80 px-3 py-1.5 rounded-md transition-colors"
            >
              Ver blog
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/redator/login", { method: "DELETE" });
                window.location.href = "/redator/login";
              }}
              className="text-[11px] text-white/50 hover:text-white/80 px-3 py-1.5 rounded-md transition-colors"
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
