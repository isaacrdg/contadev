import { getPostsByCategory } from "@/lib/blog";
import { BLOG_CATEGORIES, getCategory } from "@/lib/blog-categories";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://conta-dev.com";

export const revalidate = 60;
export const dynamicParams = false;

export async function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return { title: "Categoria não encontrada" };

  const url = `${SITE_URL}/blog/categoria/${cat.slug}`;
  const title = `${cat.label} · Blog Conta Dev`;

  return {
    title,
    description: cat.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: cat.description,
      url,
      siteName: "Conta Dev",
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og?title=${encodeURIComponent(cat.label)}&tag=${encodeURIComponent("CATEGORIA · CONTA DEV")}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const posts = await getPostsByCategory(cat.slug);

  return (
    <div className="min-h-screen relative" style={{ background: "#17151e", color: "#fafafa" }}>
      {/* glow ambiente colorido pela categoria */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${cat.color}26 0%, transparent 65%)`,
        }}
      />

      <header className="relative max-w-6xl mx-auto px-6 pt-14 pb-12">
        <nav className="flex items-center gap-2 font-mono text-[11px] mb-8" style={{ color: "rgba(250,250,250,0.4)" }}>
          <Link href="/" className="hover:text-white/80 transition-colors">~/</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-white/80 transition-colors">blog</Link>
          <span>›</span>
          <Link href="/blog/categoria" className="hover:text-white/80 transition-colors">categoria</Link>
          <span>›</span>
          <span style={{ color: "rgba(250,250,250,0.65)" }}>{cat.slug}</span>
        </nav>

        <div className="mb-2">
          <span
            className="inline-block text-[10px] font-mono uppercase tracking-[0.14em] px-2.5 py-1 rounded"
            style={{
              background: `${cat.color}1f`,
              border: `1px solid ${cat.color}66`,
              color: cat.color,
            }}
          >
            {`// categoria`}
          </span>
        </div>

        <h1 className="text-[40px] md:text-[52px] font-bold leading-[1.05] tracking-[-0.02em]">
          {cat.label}
        </h1>
        <p className="text-[14px] md:text-[15px] leading-relaxed mt-4 max-w-xl" style={{ color: "rgba(250,250,250,0.6)" }}>
          {cat.description}
        </p>

        <div className="mt-6 text-[12px] font-mono" style={{ color: "rgba(250,250,250,0.45)" }}>
          {posts.length} {posts.length === 1 ? "post" : "posts"} nessa categoria
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 pb-20">
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
            <p className="text-[14px] mb-6" style={{ color: "rgba(250,250,250,0.6)" }}>
              Nenhum post nessa categoria ainda.
            </p>
            <Link
              href="/blog"
              className="text-[12px] font-mono transition-colors hover:text-white/80"
              style={{ color: "#c4b1ff" }}
            >
              ← ver todos os posts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
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
                    src={
                      post.ogImage ??
                      `${SITE_URL}/og?title=${encodeURIComponent(post.title)}&author=${encodeURIComponent(post.author)}&date=${post.publishedAt}&tag=${encodeURIComponent(cat.label)}`
                    }
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 350px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: cat.color }}>
                    {`// ${cat.label}`}
                  </span>
                  <h3 className="text-[16px] font-semibold leading-snug tracking-tight mt-2.5 transition-colors group-hover:text-white" style={{ color: "rgba(250,250,250,0.92)" }}>
                    {post.title}
                  </h3>
                  <p className="text-[13px] mt-2 leading-relaxed line-clamp-2 flex-1" style={{ color: "rgba(250,250,250,0.55)" }}>
                    {post.description}
                  </p>
                  <div
                    className="mt-4 pt-4 flex items-center gap-2 text-[10.5px] font-mono"
                    style={{ color: "rgba(250,250,250,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
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
        )}
      </main>
    </div>
  );
}
