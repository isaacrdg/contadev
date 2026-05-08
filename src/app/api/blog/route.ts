import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { readPosts, createPost } from "@/lib/blog-store";
import { BlogPostCreateSchema } from "@/lib/blog-schema";
import { ZodError } from "zod";

/**
 * Detecta se quem chamou está logado como admin (pode publicar) ou só redator.
 * Redator pode criar/editar como draft|review, mas não published direto.
 */
async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return !!c.get("cd_admin_auth");
}

export async function GET() {
  try {
    const posts = await readPosts();
    return NextResponse.json(posts);
  } catch (err) {
    console.error("[api/blog GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = BlogPostCreateSchema.parse(body);

    // Redator não pode publicar direto — força draft ou review
    if (data.status === "published" && !(await isAdmin())) {
      return NextResponse.json(
        { error: "Redator não pode publicar direto. Envie para revisão." },
        { status: 403 },
      );
    }

    const post = await createPost(data);

    // Invalida ISR — listagem, categoria, sitemap e feed precisam refletir o novo post
    if (post.status === "published") {
      revalidatePath("/blog");
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath(`/blog/categoria/${post.category}`);
      revalidatePath("/sitemap.xml");
      revalidatePath("/feed.xml");
    }

    return NextResponse.json(post);
  } catch (err) {
    if (err instanceof ZodError) {
      const msgs = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      return NextResponse.json({ error: "Validação falhou", details: msgs }, { status: 400 });
    }
    console.error("[api/blog POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
