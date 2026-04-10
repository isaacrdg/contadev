import crypto from "crypto";
import { readJson, writeJson } from "./kv";

export interface AuthorStep {
  name: string;
  at: string; // ISO timestamp
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  status: "draft" | "published";
  content: string; // HTML from tiptap editor
  writtenBy?: AuthorStep;  // quem escreveu
  reviewedBy?: AuthorStep; // quem revisou
  publishedBy?: AuthorStep; // quem publicou
  createdAt: string;
  updatedAt: string;
}

const KEY = "blog-posts";

export async function readPosts(): Promise<BlogPost[]> {
  const raw = await readJson<BlogPost[]>(KEY, []);
  return Array.isArray(raw) ? raw : [];
}

async function writePosts(posts: BlogPost[]): Promise<void> {
  await writeJson(KEY, posts);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await readPosts();
  return posts
    .filter((p) => p.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await readPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function createPost(data: {
  title: string;
  description: string;
  publishedAt: string;
  status: "draft" | "published";
  content: string;
}): Promise<BlogPost> {
  const now = new Date().toISOString();
  const slug = slugify(data.title) || crypto.randomUUID().slice(0, 8);
  const posts = await readPosts();

  // Evita slug duplicado
  let finalSlug = slug;
  let i = 2;
  while (posts.some((p) => p.slug === finalSlug)) {
    finalSlug = `${slug}-${i}`;
    i++;
  }

  const post: BlogPost = {
    slug: finalSlug,
    title: data.title.trim(),
    description: data.description.trim(),
    publishedAt: data.publishedAt,
    status: data.status,
    content: data.content,
    createdAt: now,
    updatedAt: now,
  };

  posts.unshift(post);
  await writePosts(posts);
  return post;
}

export async function updatePost(
  slug: string,
  data: Partial<
    Pick<BlogPost, "title" | "description" | "publishedAt" | "status" | "content">
  >
): Promise<BlogPost | null> {
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;

  posts[idx] = {
    ...posts[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await writePosts(posts);
  return posts[idx];
}

export async function deletePost(slug: string): Promise<boolean> {
  const posts = await readPosts();
  const filtered = posts.filter((p) => p.slug !== slug);
  if (filtered.length === posts.length) return false;
  await writePosts(filtered);
  return true;
}
