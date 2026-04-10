"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { BlogPost } from "@/lib/blog-store";
import { usePalette } from "@/app/redator/ThemeContext";

export default function BlogList({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const pathname = usePathname();
  const p = usePalette();
  const basePath = pathname?.startsWith("/redator") ? "/redator" : "/admin/blog";

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

      {posts.length === 0 ? (
        <div
          className="rounded-lg p-10 text-center"
          style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}
        >
          <p className="text-[13px]" style={{ color: p.textMuted }}>
            Nenhum post ainda. Crie o primeiro clicando em &quot;+ Novo post&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
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
                      background: post.status === "published" ? p.pubBg : p.draftBg,
                      border: `1px solid ${post.status === "published" ? p.pubBorder : p.draftBorder}`,
                      color: post.status === "published" ? p.pubText : p.draftText,
                    }}
                  >
                    {post.status === "published" ? "Publicado" : "Rascunho"}
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
          ))}
        </div>
      )}
    </div>
  );
}
