"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BlogPost } from "@/lib/blog-store";
import { usePalette } from "@/app/redator/ThemeContext";
import BlogList from "./BlogList";
import Kanban from "./Kanban";

type View = "list" | "kanban";

export default function BlogShell({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [view, setView] = useState<View>("list");
  const p = usePalette();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/redator") ? "/redator" : "/admin/blog";

  return (
    <div>
      {/* Header: título + toggle + novo */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: p.textStrong }}>Blog</h1>
          <p className="text-[12px] mt-1" style={{ color: p.textMuted }}>
            {initialPosts.length} {initialPosts.length === 1 ? "post" : "posts"} no total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md p-1" style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}>
            {(["list", "kanban"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="text-[11px] font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
                style={{
                  background: view === v ? p.input : "transparent",
                  color: view === v ? p.text : p.textMuted,
                }}
              >
                {v === "list" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="6" height="18" rx="1"/><rect x="11" y="3" width="6" height="12" rx="1"/><rect x="19" y="3" width="2" height="6" rx="1"/></svg>
                )}
                {v === "list" ? "Lista" : "Kanban"}
              </button>
            ))}
          </div>
          <Link
            href={`${basePath}/novo`}
            className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors"
            style={{ background: p.card, border: `1px solid ${p.cardBorder}`, color: p.text }}
          >
            + Novo post
          </Link>
        </div>
      </div>

      {view === "list" ? <BlogList initialPosts={initialPosts} hideHeader /> : <Kanban initialPosts={initialPosts} />}
    </div>
  );
}
