import { getPostForRendering, getPublishedPostsMeta, getAllSlugs } from "@/lib/blog";
import { readingTime } from "@/lib/reading-time";
import ShareButtons from "@/components/blog/ShareButtons";
import BlogCTA from "@/components/blog/BlogCTA";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ISR — pré-gera no build, revalida a cada 60s; api/blog faz revalidatePath após mutações
export const revalidate = 60;
// Permite páginas novas (slugs criados depois do build) — ainda funciona on-demand
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://conta-dev.com";

function buildOgUrl(post: {
  title: string;
  author: string;
  publishedAt: string;
  tags: string[];
}): string {
  const params = new URLSearchParams({
    title: post.title,
    author: post.author,
    date: post.publishedAt,
    tag: post.tags[0] ?? "BLOG · CONTA DEV",
  });
  return `${SITE_URL}/og?${params.toString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForRendering(slug);
  if (!post) return { title: "Post não encontrado" };

  const ogImage = post.ogImage ?? buildOgUrl(post);
  const url = `${SITE_URL}/blog/${slug}`;

  return {
    title: `${post.title} · Blog Conta Dev`,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      siteName: "Conta Dev",
      locale: "pt_BR",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      section: post.tags[0] ?? "Blog",
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostForRendering(slug);

  if (!post) notFound();

  const url = `${SITE_URL}/blog/${slug}`;
  const ogImage = post.ogImage ?? buildOgUrl(post);

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: [ogImage],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    keywords: post.tags.join(", "),
    articleSection: post.tags[0] ?? "Blog",
    inLanguage: "pt-BR",
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Conta Dev",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const minutes = readingTime(post.contentHtml);
  const dateLabel = new Date(post.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Posts relacionados — mesma tag preferencial, fallback pros mais recentes
  const allMeta = await getPublishedPostsMeta();
  const related = allMeta
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const ai = a.tags.some((t) => post.tags.includes(t)) ? 1 : 0;
      const bi = b.tags.some((t) => post.tags.includes(t)) ? 1 : 0;
      if (ai !== bi) return bi - ai;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 3);

  const primaryTag = post.tags[0] ?? "blog";

  return (
    <div className="min-h-screen relative" style={{ background: "#17151e", color: "#fafafa" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Glow ambiente atrás do header — sutil, dá profundidade */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(117,83,255,0.18) 0%, transparent 60%)",
        }}
      />

      {/* HERO / HEADER do post */}
      <header className="relative max-w-3xl mx-auto px-6 pt-14 pb-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-mono text-[11px] mb-8" style={{ color: "rgba(250,250,250,0.4)" }}>
          <Link href="/" className="hover:text-white/80 transition-colors">~/</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-white/80 transition-colors">blog</Link>
          <span>›</span>
          <span style={{ color: "rgba(250,250,250,0.65)" }} className="truncate">{slug}</span>
        </nav>

        {/* Tag pill */}
        <div className="mb-6">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] px-2.5 py-1 rounded"
            style={{
              background: "rgba(117,83,255,0.12)",
              border: "1px solid rgba(117,83,255,0.4)",
              color: "#c4b1ff",
            }}
          >
            <span className="opacity-60">{`//`}</span>
            {primaryTag}
          </span>
        </div>

        {/* Título grandão */}
        <h1
          className="text-[36px] sm:text-[44px] md:text-[52px] font-bold leading-[1.05] tracking-[-0.02em]"
          style={{ color: "#fafafa" }}
        >
          {post.title}
        </h1>

        {/* Lead / descrição */}
        <p
          className="text-[16px] md:text-[18px] mt-6 leading-relaxed max-w-2xl"
          style={{ color: "rgba(250,250,250,0.65)" }}
        >
          {post.description}
        </p>

        {/* Meta bar — autor / data / reading time + share */}
        <div
          className="mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar placeholder com gradient + iniciais */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6644f2, #5129f0)",
                color: "white",
              }}
            >
              {post.author
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-semibold" style={{ color: "#fafafa" }}>
                {post.author}
              </span>
              <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: "rgba(250,250,250,0.45)" }}>
                <time dateTime={post.publishedAt}>{dateLabel}</time>
                <span>·</span>
                <span>{minutes} min de leitura</span>
              </div>
            </div>
          </div>

          <ShareButtons url={url} title={post.title} />
        </div>
      </header>

      {/* IMAGEM HERO — usa OG image como fallback, dá ar editorial */}
      <div className="relative max-w-4xl mx-auto px-6 mb-12">
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            aspectRatio: "1200 / 630",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#0d0a18",
          }}
        >
          <Image
            src={ogImage}
            alt={post.title}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* CORPO DO POST — estilos no globals.css em .blog-content */}
      <article className="max-w-3xl mx-auto px-6 pb-16">
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* CTA de conversão */}
        <BlogCTA />

        {/* Compartilhar de novo no fim — chance extra de share */}
        <div className="mt-10 pt-6 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/blog"
            className="text-[12px] font-mono transition-colors hover:text-white/80"
            style={{ color: "rgba(250,250,250,0.5)" }}
          >
            ← voltar pro blog
          </Link>
          <ShareButtons url={url} title={post.title} />
        </div>
      </article>

      {/* POSTS RELACIONADOS */}
      {related.length > 0 && (
        <section
          className="relative"
          style={{
            background: "rgba(255,255,255,0.015)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="text-[12px] font-mono uppercase tracking-[0.14em] mb-8" style={{ color: "rgba(250,250,250,0.45)" }}>
              {`// continue lendo`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-xl p-5 transition-all hover:bg-white/[0.04]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: "#c4b1ff" }}>
                    {`// ${p.tags[0] ?? "blog"}`}
                  </span>
                  <h3 className="text-[15px] font-semibold mt-2.5 leading-snug tracking-tight transition-colors group-hover:text-white" style={{ color: "rgba(250,250,250,0.92)" }}>
                    {p.title}
                  </h3>
                  <p className="text-[12.5px] mt-2 leading-relaxed line-clamp-2" style={{ color: "rgba(250,250,250,0.55)" }}>
                    {p.description}
                  </p>
                  <div className="mt-3 text-[10px] font-mono" style={{ color: "rgba(250,250,250,0.35)" }}>
                    {new Date(p.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
