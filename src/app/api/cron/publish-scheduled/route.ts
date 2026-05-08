import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { publishDuePosts, getPostBySlug } from "@/lib/blog-store";

/**
 * Endpoint chamado pelo Vercel Cron a cada hora.
 * Detecta posts com status="scheduled" cujo scheduledFor já passou
 * e muda eles pra "published" + invalida o cache.
 *
 * Proteção: verifica header `Authorization: Bearer ${CRON_SECRET}`.
 * Configurar CRON_SECRET nas env vars da Vercel.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Em prod, Vercel envia Authorization automaticamente quando CRON_SECRET está setado
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { published } = await publishDuePosts();

    // Invalida páginas afetadas
    if (published.length > 0) {
      revalidatePath("/blog");
      revalidatePath("/sitemap.xml");
      revalidatePath("/feed.xml");

      // Invalida páginas individuais e suas categorias
      for (const slug of published) {
        revalidatePath(`/blog/${slug}`);
        const post = await getPostBySlug(slug);
        if (post?.category) {
          revalidatePath(`/blog/categoria/${post.category}`);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      publishedCount: published.length,
      published,
    });
  } catch (err) {
    console.error("[cron/publish-scheduled]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
