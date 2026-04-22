import { getPublishedPostsMeta } from "@/lib/blog";
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

  return (
    <div
      className="min-h-screen"
      style={{ background: "#17151e", color: "#fafafa" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
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
