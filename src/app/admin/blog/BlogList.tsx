"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { BlogPost } from "@/lib/blog-store";
import type { PostStatus } from "@/lib/blog-schema";
import { usePalette } from "@/app/redator/ThemeContext";

type Filter = "all" | PostStatus;

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Rascunho",
  review: "Revisão",
  published: "Publicado",
};

function statusStyle(p: ReturnType<typeof usePalette>, s: PostStatus) {
  if (s === "published") return { bg: p.pubBg, border: p.pubBorder, text: p.pubText };
  if (s === "review") return { bg: p.reviewBg, border: p.reviewBorder, text: p.reviewText };
  return { bg: p.draftBg, border: p.draftBorder, text: p.draftText };
}

export default function BlogList({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<Filter>("all");
  const pathname = usePathname();
  const p = usePalette();
  const basePath = pathname?.startsWith("/redator") ? "/redator" : "/admin/blog";
  const isAdmin = !pathname?.startsWith("/redator");

  const counts = useMemo(() => {
    return {
      all: posts.length,
      draft: posts.filter((p) => p.status === "draft").length,
      review: posts.filter((p) => p.status === "review").length,
      published: posts.filter((p) => p.status === "published").length,
    };
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((post) => post.status === filter);
  }, [posts, filter]);

  async function handleDelete(slug: string) {
    if (!confirm("Tem certeza que quer deletar esse post?")) return;
    const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
    if (res.ok) setPosts((prev) => prev.filter((x) => x.slug !== slug));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: p.textStrong }}>Blog</h1>
          <p className="text-[12px] mt-1" style={{ color: p.textMuted }}>
            {posts.length} {posts.length === 1 ? "post" : "posts"} no total
          </p>
        </div>
        <Link
          href={`${basePath}/novo`}
          className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors"
          style={{ background: p.card, border: `1px solid ${p.cardBorder}`, color: p.text }}
        >
          + Novo post
        </Link>
      </div>

      {/* Filtro por status */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(["all", "draft", "review", "published"] as const).map((f) => {
          const active = filter === f;
          const count = counts[f];
          const isReviewQueue = f === "review" && isAdmin && count > 0;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
              style={{
                background: active ? p.input : "transparent",
                border: `1px solid ${active ? p.inputBorder : p.cardBorder}`,
                color: active ? p.text : p.textMuted,
              }}
            >
              {f === "all" ? "Todos" : STATUS_LABEL[f]}
              <span
                className="text-[10px] tabular-nums px-1.5 py-0.5 rounded"
                style={{
                  background: isReviewQueue ? p.reviewBg : "rgba(255,255,255,0.05)",
                  color: isReviewQueue ? p.reviewText : p.textDimmed,
                  fontWeight: isReviewQueue ? 700 : 400,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visiblePosts.length === 0 ? (
        <div
          className="rounded-lg p-10 text-center"
          style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}
        >
          <p className="text-[13px]" style={{ color: p.textMuted }}>
            {filter === "all"
              ? "Nenhum post ainda. Crie o primeiro clicando em \"+ Novo post\"."
              : `Nenhum post com status \"${STATUS_LABEL[filter as PostStatus]}\".`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visiblePosts.map((post) => {
            const sStyle = statusStyle(p, post.status);
            return (
            <div
              key={post.slug}
              className="flex items-center gap-4 rounded-lg p-4"
              style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-semibold truncate" style={{ color: p.text }}>
                    {post.title}
                  </h3>
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: sStyle.bg,
                      border: `1px solid ${sStyle.border}`,
                      color: sStyle.text,
                    }}
                  >
                    {STATUS_LABEL[post.status]}
                  </span>
                </div>
                <p className="text-[11.5px] truncate" style={{ color: p.textMuted }}>
                  {post.description}
                </p>
                <div className="text-[10px] mt-1.5 font-mono" style={{ color: p.textDimmed }}>
                  {post.publishedAt} · /{post.slug}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-[11px] px-2 py-1.5 rounded transition-colors"
                  style={{ color: p.textMuted }}
                >
                  Visualizar
                </Link>
                <Link
                  href={`${basePath}/${post.slug}`}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors"
                  style={{ background: p.input, border: `1px solid ${p.inputBorder}`, color: p.text }}
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="text-[11px] px-2 py-1.5 rounded transition-colors"
                  style={{ color: "#ef4444" }}
                >
                  Deletar
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
