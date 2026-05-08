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
import { DEFAULT_CATEGORY } from "./blog-categories";
import type { PostCategory } from "./blog-schema";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: PostCategory;
  tags: string[];
  ogImage?: string;
  author: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export async function getPublishedPostsMeta(): Promise<PostMeta[]> {
  const posts = await getStorePosts();
  return posts.map(({ slug, title, description, publishedAt, updatedAt, category, tags, ogImage, author }) => ({
    slug,
    title,
    description,
    publishedAt,
    updatedAt: updatedAt ?? publishedAt,
    category: category ?? DEFAULT_CATEGORY,
    tags: tags ?? [],
    ogImage,
    author: author ?? "Conta Dev",
  }));
}

/** Lista posts publicados de uma categoria específica. */
export async function getPostsByCategory(category: PostCategory): Promise<PostMeta[]> {
  const all = await getPublishedPostsMeta();
  return all.filter((p) => p.category === category);
}

export async function getPostForRendering(slug: string): Promise<Post | null> {
  const post = await getStorePost(slug);
  if (!post || post.status !== "published") return null;
  // Tiptap salva HTML direto — sem necessidade de conversão markdown→HTML
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt ?? post.publishedAt,
    category: post.category ?? DEFAULT_CATEGORY,
    tags: post.tags ?? [],
    ogImage: post.ogImage,
    author: post.author ?? "Conta Dev",
    contentHtml: post.content,
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getStorePosts();
  return posts.map((p) => p.slug);
}

export type { BlogPost } from "./blog-store";
