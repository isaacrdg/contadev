import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getPostBySlug, updatePost, deletePost } from "@/lib/blog-store";
import { BlogPostUpdateSchema } from "@/lib/blog-schema";
import { ZodError } from "zod";

function bustBlogCache(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return !!c.get("cd_admin_auth");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    BlogPostUpdateSchema.parse(body);

    // Redator não pode publicar — força admin pra mudar status pra published
    if (body.status === "published" && !(await isAdmin())) {
      return NextResponse.json(
        { error: "Redator não pode publicar direto. Envie para revisão." },
        { status: 403 },
      );
    }

    const updated = await updatePost(slug, body);
    if (!updated)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    bustBlogCache(slug);

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      const msgs = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json({ error: "Validação falhou", details: msgs }, { status: 400 });
    }
    console.error("[api/blog/[slug] PATCH]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ok = await deletePost(slug);
  if (!ok) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  bustBlogCache(slug);

  return NextResponse.json({ ok: true });
}
