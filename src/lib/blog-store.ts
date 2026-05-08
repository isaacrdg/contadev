import crypto from "crypto";
import { readJson, writeJson } from "./kv";
import { BlogPostCreateSchema, BlogPostUpdateSchema, type PostStatus, type PostCategory } from "./blog-schema";
import { DEFAULT_CATEGORY } from "./blog-categories";

export interface AuthorStep {
  name: string;
  at: string; // ISO timestamp
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  status: PostStatus;
  /** ISO datetime — quando status=scheduled, o cron publica nessa hora. Null/undefined caso contrário. */
  scheduledFor?: string | null;
  content: string; // HTML from tiptap editor
  category: PostCategory;
  tags: string[];
  ogImage?: string;
  author: string;
  writtenBy?: AuthorStep;  // quem escreveu
  reviewedBy?: AuthorStep; // quem revisou
  publishedBy?: AuthorStep; // quem publicou
  /** Notas internas (admin/redator conversam) — não vai pro post público. */
  notes?: BlogNote[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogNote {
  id: string;
  author: string;
  text: string;
  at: string; // ISO timestamp
}

const KEY = "blog-posts";

export async function readPosts(): Promise<BlogPost[]> {
  const raw = await readJson<BlogPost[]>(KEY, []);
  if (!Array.isArray(raw)) return [];
  // Backfill de campos novos em posts antigos — não persiste, só preenche em leitura
  return raw.map((p) => ({
    ...p,
    tags: p.tags ?? [],
    author: p.author ?? "Conta Dev",
    category: p.category ?? DEFAULT_CATEGORY,
  }));
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
  status: PostStatus;
  scheduledFor?: string | null;
  content: string;
  category: PostCategory;
  tags?: string[];
  ogImage?: string;
  author?: string;
}): Promise<BlogPost> {
  // Valida campos obrigatórios via Zod
  const validated = BlogPostCreateSchema.parse(data);

  const now = new Date().toISOString();
  const slug = slugify(validated.title) || crypto.randomUUID().slice(0, 8);
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
    title: validated.title.trim(),
    description: validated.description.trim(),
    publishedAt: validated.publishedAt,
    status: validated.status,
    scheduledFor: validated.scheduledFor ?? null,
    content: validated.content,
    category: validated.category,
    tags: validated.tags,
    ogImage: validated.ogImage,
    author: validated.author,
    notes: [],
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
    Pick<BlogPost, "title" | "description" | "publishedAt" | "status" | "scheduledFor" | "content" | "category" | "tags" | "ogImage" | "author">
  >
): Promise<BlogPost | null> {
  // Valida só os campos que vieram
  BlogPostUpdateSchema.parse(data);

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

/* ── Notas internas ── */

export async function addNote(slug: string, author: string, text: string): Promise<BlogNote | null> {
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  const note: BlogNote = {
    id: crypto.randomUUID(),
    author,
    text: text.trim().slice(0, 2000),
    at: new Date().toISOString(),
  };
  posts[idx] = {
    ...posts[idx],
    notes: [...(posts[idx].notes ?? []), note],
    updatedAt: new Date().toISOString(),
  };
  await writePosts(posts);
  return note;
}

export async function deleteNote(slug: string, noteId: string): Promise<boolean> {
  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return false;
  const before = posts[idx].notes?.length ?? 0;
  posts[idx] = {
    ...posts[idx],
    notes: (posts[idx].notes ?? []).filter((n) => n.id !== noteId),
    updatedAt: new Date().toISOString(),
  };
  if ((posts[idx].notes?.length ?? 0) === before) return false;
  await writePosts(posts);
  return true;
}

/* ── Cron: publica posts agendados que já chegaram na hora ── */

export async function publishDuePosts(): Promise<{ published: string[] }> {
  const posts = await readPosts();
  const now = new Date();
  const published: string[] = [];

  const updated = posts.map((p) => {
    if (
      p.status === "scheduled" &&
      p.scheduledFor &&
      new Date(p.scheduledFor) <= now
    ) {
      published.push(p.slug);
      return {
        ...p,
        status: "published" as const,
        scheduledFor: null,
        publishedAt: p.publishedAt ?? new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  if (published.length > 0) await writePosts(updated);
  return { published };
}
