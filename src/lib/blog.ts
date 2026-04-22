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

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  ogImage?: string;
  author: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export async function getPublishedPostsMeta(): Promise<PostMeta[]> {
  const posts = await getStorePosts();
  return posts.map(({ slug, title, description, publishedAt, updatedAt, tags, ogImage, author }) => ({
    slug,
    title,
    description,
    publishedAt,
    updatedAt: updatedAt ?? publishedAt,
    tags: tags ?? [],
    ogImage,
    author: author ?? "Conta Dev",
  }));
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
