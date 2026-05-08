import { NextResponse } from "next/server";
import { addNote, deleteNote, getPostBySlug } from "@/lib/blog-store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    const { author, text } = body ?? {};

    if (typeof author !== "string" || author.trim().length < 2)
      return NextResponse.json({ error: "Autor inválido" }, { status: 400 });
    if (typeof text !== "string" || text.trim().length === 0)
      return NextResponse.json({ error: "Texto vazio" }, { status: 400 });

    const note = await addNote(slug, author.trim(), text);
    if (!note) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

    return NextResponse.json(note);
  } catch (err) {
    console.error("[api/blog/[slug]/notes POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
  return NextResponse.json({ notes: post.notes ?? [] });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("id");
  if (!noteId) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
  const ok = await deleteNote(slug, noteId);
  if (!ok) return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
