"use client";
import { useState, useMemo, type DragEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-store";
import type { PostStatus } from "@/lib/blog-schema";
import { getCategoryLabel, getCategoryColor } from "@/lib/blog-categories";
import { usePalette } from "@/app/redator/ThemeContext";

const COLUMNS: { status: PostStatus; label: string; hint: string }[] = [
  { status: "draft", label: "Rascunho", hint: "em produção" },
  { status: "review", label: "Revisão", hint: "aguardando aprovação" },
  { status: "scheduled", label: "Agendado", hint: "publica sozinho na hora" },
  { status: "published", label: "Publicado", hint: "no ar" },
];

function statusStyle(p: ReturnType<typeof usePalette>, s: PostStatus) {
  if (s === "published") return { bg: p.pubBg, border: p.pubBorder, text: p.pubText };
  if (s === "review") return { bg: p.reviewBg, border: p.reviewBorder, text: p.reviewText };
  if (s === "scheduled") return { bg: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.45)", text: "#93c5fd" };
  return { bg: p.draftBg, border: p.draftBorder, text: p.draftText };
}

export default function Kanban({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<PostStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const p = usePalette();
  const isAdmin = !pathname?.startsWith("/redator");
  const basePath = pathname?.startsWith("/redator") ? "/redator" : "/admin/blog";

  const grouped = useMemo(() => {
    const map: Record<PostStatus, BlogPost[]> = {
      draft: [],
      review: [],
      scheduled: [],
      published: [],
    };
    for (const post of posts) {
      map[post.status]?.push(post);
    }
    return map;
  }, [posts]);

  function handleDragStart(slug: string) {
    setDraggingSlug(slug);
    setError(null);
  }

  async function handleDrop(targetStatus: PostStatus) {
    setDragOver(null);
    if (!draggingSlug) return;
    const post = posts.find((x) => x.slug === draggingSlug);
    if (!post || post.status === targetStatus) {
      setDraggingSlug(null);
      return;
    }

    // Redator não pode mover pra published nem scheduled
    if (!isAdmin && (targetStatus === "published" || targetStatus === "scheduled")) {
      setError("Só admin pode publicar ou agendar.");
      setDraggingSlug(null);
      return;
    }

    // Agendado precisa de scheduledFor — abre editor
    if (targetStatus === "scheduled" && !post.scheduledFor) {
      router.push(`${basePath}/${post.slug}`);
      setDraggingSlug(null);
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((x) => (x.slug === draggingSlug ? { ...x, status: targetStatus } : x)),
    );

    try {
      const res = await fetch(`/api/blog/${draggingSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) throw new Error("Falhou");
    } catch {
      // Reverte
      setPosts((prev) =>
        prev.map((x) => (x.slug === draggingSlug ? { ...x, status: post.status } : x)),
      );
      setError("Erro ao mover. Tente de novo.");
    } finally {
      setDraggingSlug(null);
    }
  }

  function handleDragOver(e: DragEvent, status: PostStatus) {
    e.preventDefault();
    setDragOver(status);
  }

  return (
    <div>
      {error && (
        <div
          className="mb-4 rounded-md p-3 text-[12px]"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const sStyle = statusStyle(p, col.status);
          const cards = grouped[col.status] ?? [];
          const isOver = dragOver === col.status;
          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.status)}
              className="rounded-lg p-3 transition-colors flex flex-col"
              style={{
                background: isOver ? `${sStyle.bg}` : p.card,
                border: `1px solid ${isOver ? sStyle.border : p.cardBorder}`,
                minHeight: 400,
              }}
            >
              {/* Header da coluna */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded"
                    style={{
                      background: sStyle.bg,
                      border: `1px solid ${sStyle.border}`,
                      color: sStyle.text,
                    }}
                  >
                    {col.label}
                  </span>
                  <span className="text-[10px] font-mono tabular-nums" style={{ color: p.textDimmed }}>
                    {cards.length}
                  </span>
                </div>
              </div>
              <p className="text-[10px] mb-3 px-1" style={{ color: p.textDimmed }}>
                {col.hint}
              </p>

              {/* Cards */}
              <div className="space-y-2 flex-1">
                {cards.length === 0 ? (
                  <div
                    className="rounded-md p-4 text-center text-[11px]"
                    style={{ color: p.textDimmed, border: `1px dashed ${p.cardBorder}` }}
                  >
                    vazio
                  </div>
                ) : (
                  cards.map((post) => (
                    <Link
                      key={post.slug}
                      href={`${basePath}/${post.slug}`}
                      draggable
                      onDragStart={() => handleDragStart(post.slug)}
                      onDragEnd={() => setDraggingSlug(null)}
                      className="block rounded-md p-3 cursor-grab active:cursor-grabbing transition-all"
                      style={{
                        background: p.input,
                        border: `1px solid ${p.inputBorder}`,
                        opacity: draggingSlug === post.slug ? 0.4 : 1,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: getCategoryColor(post.category) }}
                        />
                        <span className="text-[9px] font-mono uppercase tracking-[0.08em]" style={{ color: p.textDimmed }}>
                          {getCategoryLabel(post.category)}
                        </span>
                      </div>
                      <h3 className="text-[12.5px] font-semibold leading-snug line-clamp-2" style={{ color: p.text }}>
                        {post.title}
                      </h3>
                      {post.scheduledFor && col.status === "scheduled" && (
                        <p className="text-[10px] mt-2 font-mono" style={{ color: "#93c5fd" }}>
                          → {new Date(post.scheduledFor).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {post.author && (
                        <p className="text-[9.5px] mt-2" style={{ color: p.textDimmed }}>
                          {post.author}
                        </p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
