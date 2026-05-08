import { getPublishedPostsMeta } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://conta-dev.com";
const BLOG_URL = `${SITE_URL}/blog`;
const BLOG_DESCRIPTION =
  "Artigos sobre contabilidade pra devs, impostos PJ, planejamento tributário e muito mais.";

export const metadata: Metadata = {
  title: "Blog · Conta Dev",
  description: BLOG_DESCRIPTION,
  alternates: { canonical: BLOG_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Blog · Conta Dev",
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    siteName: "Conta Dev",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og?title=Blog+Conta+Dev&tag=ARTIGOS+%C2%B7+CONTA+DEV`,
        width: 1200,
        height: 630,
        alt: "Blog Conta Dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog · Conta Dev",
    description: BLOG_DESCRIPTION,
  },
};

// ISR — regenera no máximo a cada 60s; api/blog faz revalidatePath após mutações
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPostsMeta();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog Conta Dev",
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    inLanguage: "pt-BR",
    publisher: {
      "@type": "Organization",
      name: "Conta Dev",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `${BLOG_URL}/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      author: { "@type": "Person", name: p.author },
    })),
  };

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen relative" style={{ background: "#17151e", color: "#fafafa" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />

      {/* glow ambiente */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(117,83,255,0.16) 0%, transparent 65%)",
        }}
      />

      {/* HEADER do blog */}
      <header className="relative max-w-6xl mx-auto px-6 pt-14 pb-12">
        <Link
          href="/"
          className="text-[11px] font-mono transition-colors hover:text-white/80 inline-block"
          style={{ color: "rgba(250,250,250,0.45)" }}
        >
          ← voltar pro site
        </Link>

        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span
              className="inline-block text-[10px] font-mono uppercase tracking-[0.14em] px-2.5 py-1 rounded mb-5"
              style={{
                background: "rgba(117,83,255,0.12)",
                border: "1px solid rgba(117,83,255,0.4)",
                color: "#c4b1ff",
              }}
            >
              {`// blog · conta dev`}
            </span>
            <h1 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-[-0.02em]">
              Conteúdo pra dev<span style={{ color: "#7553ff" }}>.</span>
              <br />Sem o jargão de contador<span style={{ color: "#7553ff" }}>.</span>
            </h1>
          </div>
          <p className="text-[14px] md:text-[15px] leading-relaxed max-w-md md:text-right" style={{ color: "rgba(250,250,250,0.6)" }}>
            Guias práticos sobre PJ, impostos, planejamento tributário e tudo
            que você precisa pra manter o financeiro tão limpo quanto seu código.
          </p>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 pb-20">
        {/* CHIPS de categoria — filtro rápido */}
        {posts.length > 0 && (
          <div className="mb-10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] mr-2" style={{ color: "rgba(250,250,250,0.4)" }}>
              {`// categorias`}
            </span>
            {BLOG_CATEGORIES.map((c) => {
              const count = posts.filter((p) => p.category === c.slug).length;
              if (count === 0) return null;
              return (
                <Link
                  key={c.slug}
                  href={`/blog/categoria/${c.slug}`}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md transition-all hover:bg-white/[0.05] flex items-center gap-1.5"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: `1px solid rgba(255,255,255,0.08)`,
                    color: "rgba(250,250,250,0.78)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.label}
                  <span className="text-[10px] tabular-nums" style={{ color: "rgba(250,250,250,0.4)" }}>
                    {count}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/blog/categoria"
              className="text-[11px] font-mono ml-1 transition-colors hover:text-white/80"
              style={{ color: "rgba(250,250,250,0.45)" }}
            >
              ver todas →
            </Link>
          </div>
        )}

        {posts.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.12)",
            }}
          >
            <p className="text-[12px] font-mono mb-2" style={{ color: "rgba(250,250,250,0.35)" }}>
              {`// status: empty`}
            </p>
            <p className="text-[14px]" style={{ color: "rgba(250,250,250,0.6)" }}>
              Nenhum post publicado ainda. Em breve!
            </p>
          </div>
        ) : (
          <>
            {/* FEATURED — post mais recente em destaque */}
            <Link
              href={`/blog/${featured.slug}`}
              className="group block mb-12 rounded-2xl overflow-hidden transition-all hover:bg-white/[0.02]"
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-0">
                {/* imagem */}
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "1200 / 630", background: "#0d0a18" }}
                >
                  <Image
                    src={featured.ogImage ?? `${SITE_URL}/og?title=${encodeURIComponent(featured.title)}&author=${encodeURIComponent(featured.author)}&date=${featured.publishedAt}&tag=${encodeURIComponent(featured.tags[0] ?? "BLOG")}`}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 660px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {/* texto */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: "#c4b1ff" }}>
                    {`// destaque · ${featured.tags[0] ?? "blog"}`}
                  </span>
                  <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight leading-[1.15] mt-3 transition-colors group-hover:text-white" style={{ color: "rgba(250,250,250,0.95)" }}>
                    {featured.title}
                  </h2>
                  <p className="text-[14px] md:text-[15px] mt-4 leading-relaxed line-clamp-3" style={{ color: "rgba(250,250,250,0.65)" }}>
                    {featured.description}
                  </p>
                  <div className="mt-6 flex items-center gap-3 text-[11px] font-mono" style={{ color: "rgba(250,250,250,0.45)" }}>
                    <span>{featured.author}</span>
                    <span>·</span>
                    <time>
                      {new Date(featured.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </time>
                  </div>
                </div>
              </div>
            </Link>

            {/* GRID dos demais */}
            {rest.length > 0 && (
              <>
                <h2 className="text-[12px] font-mono uppercase tracking-[0.14em] mb-6" style={{ color: "rgba(250,250,250,0.45)" }}>
                  {`// todos os posts`}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-xl overflow-hidden transition-all hover:bg-white/[0.03]"
                      style={{
                        background: "rgba(255,255,255,0.015)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="relative" style={{ aspectRatio: "1200 / 630", background: "#0d0a18" }}>
                        <Image
                          src={post.ogImage ?? `${SITE_URL}/og?title=${encodeURIComponent(post.title)}&author=${encodeURIComponent(post.author)}&date=${post.publishedAt}&tag=${encodeURIComponent(post.tags[0] ?? "BLOG")}`}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: "#c4b1ff" }}>
                          {`// ${post.tags[0] ?? "blog"}`}
                        </span>
                        <h3 className="text-[16px] font-semibold leading-snug tracking-tight mt-2.5 transition-colors group-hover:text-white" style={{ color: "rgba(250,250,250,0.92)" }}>
                          {post.title}
                        </h3>
                        <p className="text-[13px] mt-2 leading-relaxed line-clamp-2 flex-1" style={{ color: "rgba(250,250,250,0.55)" }}>
                          {post.description}
                        </p>
                        <div className="mt-4 pt-4 flex items-center gap-2 text-[10.5px] font-mono" style={{ color: "rgba(250,250,250,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <span>{post.author}</span>
                          <span>·</span>
                          <time>
                            {new Date(post.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </time>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
