import { getPublishedPostsMeta } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import Breadcrumbs from "@/components/blog/Breadcrumbs";
import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://conta-dev.com";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Categorias · Blog Conta Dev",
  description: "Navegue pelos artigos do blog Conta Dev por categoria — CNPJ, Impostos, Carreira PJ, Plataforma, Cases e Guias.",
  alternates: { canonical: `${SITE_URL}/blog/categoria` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Categorias · Blog Conta Dev",
    description: "Navegue pelos artigos por categoria.",
    url: `${SITE_URL}/blog/categoria`,
    siteName: "Conta Dev",
    locale: "pt_BR",
    type: "website",
  },
};

export default async function CategoriesIndexPage() {
  const posts = await getPublishedPostsMeta();

  // Conta posts por categoria
  const stats = BLOG_CATEGORIES.map((c) => ({
    ...c,
    count: posts.filter((p) => p.category === c.slug).length,
    latest: posts.find((p) => p.category === c.slug),
  }));

  return (
    <div className="min-h-screen relative" style={{ background: "#17151e", color: "#fafafa" }}>
      {/* glow ambiente */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(117,83,255,0.16) 0%, transparent 65%)",
        }}
      />

      <header className="relative max-w-6xl mx-auto px-6 pt-14 pb-12">
        <Breadcrumbs
          items={[
            { label: "~/", href: "/" },
            { label: "blog", href: "/blog" },
            { label: "categoria" },
          ]}
        />

        <div className="mt-8">
          <span
            className="inline-block text-[10px] font-mono uppercase tracking-[0.14em] px-2.5 py-1 rounded mb-5"
            style={{
              background: "rgba(117,83,255,0.12)",
              border: "1px solid rgba(117,83,255,0.4)",
              color: "#c4b1ff",
            }}
          >
            {`// índice`}
          </span>
          <h1 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-[-0.02em]">
            Categorias do blog
          </h1>
          <p className="text-[14px] md:text-[15px] leading-relaxed mt-4 max-w-xl" style={{ color: "rgba(250,250,250,0.6)" }}>
            Cada categoria reúne artigos sobre um tema específico. Use como mapa
            pra navegar quando souber exatamente o que tá procurando.
          </p>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((c) => {
            const empty = c.count === 0;
            return (
              <Link
                key={c.slug}
                href={`/blog/categoria/${c.slug}`}
                className="group block rounded-xl p-6 transition-all hover:bg-white/[0.04] relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Linha decorativa colorida no topo do card */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }}
                />

                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: c.color }}>
                    {`// ${c.slug}`}
                  </span>
                  <span className="ml-auto text-[10px] font-mono tabular-nums" style={{ color: "rgba(250,250,250,0.4)" }}>
                    {c.count} {c.count === 1 ? "post" : "posts"}
                  </span>
                </div>

                <h2 className="text-[20px] font-bold tracking-tight transition-colors group-hover:text-white" style={{ color: "rgba(250,250,250,0.95)" }}>
                  {c.label}
                </h2>
                <p className="text-[13px] mt-2 leading-relaxed" style={{ color: "rgba(250,250,250,0.6)" }}>
                  {c.description}
                </p>

                {c.latest && (
                  <div className="mt-5 pt-4 text-[11px] leading-snug" style={{ color: "rgba(250,250,250,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] mr-1.5" style={{ color: "rgba(250,250,250,0.35)" }}>
                      último:
                    </span>
                    {c.latest.title}
                  </div>
                )}

                {empty && (
                  <div className="mt-5 pt-4 text-[11px] italic" style={{ color: "rgba(250,250,250,0.35)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    Nenhum post ainda.
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
