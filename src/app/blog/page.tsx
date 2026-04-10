import { getPublishedPosts } from "@/lib/blog";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog · Conta Dev",
  description:
    "Artigos sobre contabilidade pra devs, impostos PJ, planejamento tributário e muito mais.",
};

export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#17151e", color: "#fafafa" }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-12">
          <Link
            href="/"
            className="text-[12px] text-white/50 hover:text-white/80 transition-colors mb-6 inline-block"
          >
            &larr; Voltar pro site
          </Link>
          <h1 className="text-[32px] font-bold tracking-tight">Blog</h1>
          <p className="text-[14px] text-white/55 mt-3 leading-relaxed max-w-lg">
            Artigos sobre contabilidade pra devs, impostos PJ, planejamento
            tributário e tudo que você precisa saber pra manter sua empresa
            rodando sem dor de cabeça.
          </p>
        </header>

        {posts.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-[14px] text-white/55">
              Nenhum post publicado ainda. Em breve!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-xl p-6 transition-colors hover:bg-white/[0.04]"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <time className="text-[11px] text-white/40 font-mono">
                  {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <h2 className="text-[18px] font-semibold tracking-tight mt-2 mb-2">
                  {post.title}
                </h2>
                <p className="text-[13px] text-white/60 leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
