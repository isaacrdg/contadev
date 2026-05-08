import { getPublishedPostsMeta } from "@/lib/blog";
import { getCategoryLabel, getCategoryColor } from "@/lib/blog-categories";
import Link from "next/link";

export const dynamic = "force-dynamic";

const VERCEL_PROJECT_URL = "https://vercel.com/isaacrdglosts-projects/contadev/analytics";

export default async function BlogMetricsPage() {
  const posts = await getPublishedPostsMeta();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#ffffff" }}>
            Métricas
          </h1>
          <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {posts.length} posts publicados — visão rápida do conteúdo no ar
          </p>
        </div>
        <a
          href={VERCEL_PROJECT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          style={{
            background: "rgba(117,83,255,0.12)",
            border: "1px solid rgba(117,83,255,0.4)",
            color: "#c4b1ff",
          }}
        >
          Abrir Vercel Analytics
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 17L17 7M17 7H8M17 7V16" />
          </svg>
        </a>
      </div>

      <div
        className="rounded-lg p-4 mb-6"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p className="text-[11px] mb-1.5 font-mono uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.4)" }}>
          {`// como funciona`}
        </p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          As métricas vêm do <strong>Vercel Analytics</strong> (page views, dispositivos, países, top pages)
          e <strong>Speed Insights</strong> (Core Web Vitals). Eventos custom rastreados nesse blog:
          <span className="font-mono text-[11px] ml-1" style={{ color: "#c4b1ff" }}>blog_cta_click</span> (cliques no CTA),
          <span className="font-mono text-[11px] ml-1" style={{ color: "#c4b1ff" }}>blog_share</span> (compartilhamentos por canal).
        </p>
        <p className="text-[11.5px] mt-2 italic" style={{ color: "rgba(255,255,255,0.4)" }}>
          Os dados levam alguns minutos pra aparecer no dashboard depois do deploy.
        </p>
      </div>

      {posts.length === 0 ? (
        <div
          className="rounded-lg p-10 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.12)",
          }}
        >
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.55)" }}>
            Nenhum post publicado ainda. Métricas aparecem aqui depois que tiver tráfego.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className="grid grid-cols-[1fr_120px_120px] gap-4 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.1em]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <span>Post</span>
            <span>Categoria</span>
            <span className="text-right">Publicado</span>
          </div>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              target="_blank"
              className="grid grid-cols-[1fr_120px_120px] gap-4 items-center rounded-lg p-4 transition-colors hover:bg-white/[0.04]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold truncate" style={{ color: "#fafafa" }}>
                  {post.title}
                </h3>
                <p className="text-[10px] font-mono mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                  /blog/{post.slug}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: getCategoryColor(post.category) }}
                />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {getCategoryLabel(post.category)}
                </span>
              </div>
              <time className="text-[11px] font-mono text-right" style={{ color: "rgba(255,255,255,0.5)" }}>
                {new Date(post.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })}
              </time>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
