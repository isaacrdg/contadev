import type { MetadataRoute } from "next";
import { getPublishedPostsMeta } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog-categories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://conta-dev.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPostsMeta();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0] ? new Date(posts[0].updatedAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog/categoria`,
      lastModified: posts[0] ? new Date(posts[0].updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  // Páginas de categoria — só inclui categorias que têm pelo menos 1 post
  const categoryRoutes: MetadataRoute.Sitemap = BLOG_CATEGORIES.flatMap((c) => {
    const catPosts = posts.filter((p) => p.category === c.slug);
    if (catPosts.length === 0) return [];
    return [
      {
        url: `${SITE_URL}/blog/categoria/${c.slug}`,
        lastModified: new Date(catPosts[0].updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
    ];
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
