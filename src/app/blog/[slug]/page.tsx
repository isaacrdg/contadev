import { getPostForRendering, getAllSlugs } from "@/lib/blog";
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

  return (
    <div
      className="min-h-screen"
      style={{ background: "#17151e", color: "#fafafa" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/blog"
          className="text-[12px] text-white/50 hover:text-white/80 transition-colors mb-8 inline-block"
        >
          &larr; Voltar pro blog
        </Link>

        <article>
          <header className="mb-10">
            <time className="text-[11px] text-white/40 font-mono">
              {new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
            <h1 className="text-[32px] font-bold tracking-tight mt-3 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-[15px] text-white/60 leading-relaxed">
              {post.description}
            </p>
          </header>

          <div
            className="prose prose-invert prose-sm max-w-none [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:text-[14px] [&_p]:text-white/75 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-[14px] [&_ul]:text-white/75 [&_ol]:text-[14px] [&_ol]:text-white/75 [&_li]:mb-1 [&_a]:text-[#c4b1ff] [&_a]:underline [&_a]:underline-offset-2 [&_code]:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:text-white/80 [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-white/60 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>

        <footer className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/blog"
            className="text-[13px] text-white/55 hover:text-white/80 transition-colors"
          >
            &larr; Mais artigos
          </Link>
        </footer>
      </div>
    </div>
  );
}
