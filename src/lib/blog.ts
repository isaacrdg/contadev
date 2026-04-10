/**
 * Blog público — lê posts do Neon (produção) ou filesystem (dev local).
 *
 * Em produção: lê de blog-store.ts (Neon via kv abstraction)
 * Em dev local: também lê de blog-store.ts (file system via kv abstraction)
 *
 * Se existirem posts .md no filesystem E no store, prioriza o store.
 * Posts .md são mantidos como fallback/legacy (o post de exemplo commitado).
 */
import { getPublishedPosts as getStorePosts, getPostBySlug as getStorePost } from "./blog-store";
import type { BlogPost } from "./blog-store";
import { remark } from "remark";
import html from "remark-html";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

async function renderMarkdown(md: string): Promise<string> {
  const result = await remark().use(html).process(md);
  return result.toString();
}

export async function getPublishedPostsMeta(): Promise<PostMeta[]> {
  const posts = await getStorePosts();
  return posts.map(({ slug, title, description, publishedAt }) => ({
    slug,
    title,
    description,
    publishedAt,
  }));
}

export async function getPostForRendering(
  slug: string
): Promise<Post | null> {
  const post = await getStorePost(slug);
  if (!post || post.status !== "published") return null;
  const contentHtml = await renderMarkdown(post.content);
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    contentHtml,
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getStorePosts();
  return posts.map((p) => p.slug);
}

// Re-export pra type compatibility
export type { BlogPost } from "./blog-store";
