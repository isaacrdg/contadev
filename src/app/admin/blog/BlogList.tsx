"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { BlogPost } from "@/lib/blog-store";

export default function BlogList({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const pathname = usePathname();
  // Detecta se tá no /redator ou /admin pra links corretos
  const basePath = pathname?.startsWith("/redator") ? "/redator" : "/admin/blog";

  async function handleDelete(slug: string) {
    if (!confirm("Tem certeza que quer deletar esse post?")) return;
    const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Blog</h1>
          <p className="text-[12px] text-white/40 mt-1">
            {posts.length} {posts.length === 1 ? "post" : "posts"} no total
          </p>
        </div>
        <Link
          href={`${basePath}/novo`}
          className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors hover:bg-white/15"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fafafa",
          }}
        >
          + Novo post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div
          className="rounded-lg p-10 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-[13px] text-white/50">
            Nenhum post ainda. Crie o primeiro clicando em &quot;+ Novo post&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex items-center gap-4 rounded-lg p-4"
              style={{
                background: "#1c1c1c",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-semibold truncate">
                    {post.title}
                  </h3>
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.05em] px-2 py-0.5 rounded flex-shrink-0"
                    style={{
                      background:
                        post.status === "published"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(234,179,8,0.15)",
                      border:
                        post.status === "published"
                          ? "1px solid rgba(34,197,94,0.4)"
                          : "1px solid rgba(234,179,8,0.4)",
                      color:
                        post.status === "published" ? "#6ee7b7" : "#fbbf24",
                    }}
                  >
                    {post.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </div>
                <p className="text-[11.5px] text-white/55 truncate">
                  {post.description}
                </p>
                <div className="text-[10px] text-white/35 mt-1.5 font-mono">
                  {post.publishedAt} · /{post.slug}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-[11px] text-white/50 hover:text-white/80 px-2 py-1.5 rounded transition-colors"
                >
                  Visualizar
                </Link>
                <Link
                  href={`${basePath}/${post.slug}`}
                  className="text-[11px] font-medium text-white/80 px-3 py-1.5 rounded-md transition-colors hover:bg-white/10"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(post.slug)}
                  className="text-[11px] text-red-400/70 hover:text-red-400 px-2 py-1.5 rounded transition-colors"
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
