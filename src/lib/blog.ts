/**
 * Blog nativo — lê posts .md de src/content/posts/ com frontmatter YAML.
 *
 * Formato esperado de cada arquivo:
 *
 * ```md
 * ---
 * title: "Título do post"
 * description: "Resumo curto"
 * publishedAt: "2026-04-09"
 * status: "published"         # draft | published
 * ---
 *
 * Conteúdo em **Markdown** aqui.
 * ```
 *
 * Pra criar um post, basta adicionar um .md em src/content/posts/ e dar push.
 * O slug vem do nome do arquivo (sem extensão).
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export interface PostFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  status: "draft" | "published";
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

/**
 * Lista todos os posts com frontmatter (sem renderizar conteúdo).
 * Filtra draft/published se necessário do lado de quem chama.
 */
export function getAllPostsMeta(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? "",
      publishedAt: data.publishedAt ?? "",
      status: data.status ?? "draft",
    };
  });
}

/**
 * Lista posts publicados, ordenados por data (mais recente primeiro).
 */
export function getPublishedPosts(): PostMeta[] {
  return getAllPostsMeta()
    .filter((p) => p.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Lê e renderiza um post completo por slug.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);

  const result = await remark().use(html).process(content);
  const contentHtml = result.toString();

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    publishedAt: data.publishedAt ?? "",
    status: data.status ?? "draft",
    contentHtml,
  };
}

/**
 * Lista todos os slugs disponíveis (pra generateStaticParams).
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
