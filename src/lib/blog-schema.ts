import { z } from "zod";
import { CATEGORY_SLUGS } from "./blog-categories";

/* ── Status do post ── */
export const PostStatus = z.enum(["draft", "review", "published"]);
export type PostStatus = z.infer<typeof PostStatus>;

/* ── Categoria (controlada, fechada — vem de blog-categories.ts) ── */
export const PostCategory = z.enum(CATEGORY_SLUGS);
export type PostCategory = z.infer<typeof PostCategory>;

/* ── Schema do frontmatter / campos obrigatórios ── */
export const BlogPostSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug precisa ter pelo menos 3 caracteres")
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug deve ser kebab-case"),

  title: z
    .string()
    .min(10, "Título muito curto (mín. 10 caracteres)")
    .max(120, "Título muito longo (máx. 120 caracteres)"),

  description: z
    .string()
    .min(50, "Description muito curta (mín. 50 chars) — importante pro SEO")
    .max(320, "Description muito longa (máx. 320 chars)"),

  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, "Data deve ser ISO (YYYY-MM-DD…)"),

  status: PostStatus,

  content: z
    .string()
    .min(1, "Post sem conteúdo"),

  category: PostCategory,

  tags: z
    .array(z.string().min(2).max(40))
    .min(1, "Pelo menos 1 tag")
    .max(8, "Máximo 8 tags")
    .default([]),

  ogImage: z
    .string()
    .optional(),

  author: z
    .string()
    .min(2, "Nome do autor obrigatório")
    .default("Conta Dev"),
});

/* ── Schema parcial — pra updates (só campos que vieram) ── */
export const BlogPostUpdateSchema = BlogPostSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Update vazio — nenhum campo enviado" },
);

/* ── Schema de criação — slug é gerado, não obrigatório no input ── */
export const BlogPostCreateSchema = BlogPostSchema.omit({ slug: true });

/* ── Tipos derivados ── */
export type BlogPostInput = z.infer<typeof BlogPostCreateSchema>;
export type BlogPostUpdate = z.infer<typeof BlogPostUpdateSchema>;
