import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post não encontrado" };
  return {
    title: `${post.title} · Blog Conta Dev`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  // JSON-LD BlogPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Conta Dev",
      url: "https://conta-dev.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Conta Dev",
      url: "https://conta-dev.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://conta-dev.com/blog/${slug}`,
    },
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#17151e", color: "#fafafa" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
