import { NextResponse } from "next/server";
import { readPosts, createPost } from "@/lib/blog-store";

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
    const { title, description, publishedAt, status, content } = body ?? {};

    if (typeof title !== "string" || title.trim().length < 2)
      return NextResponse.json({ error: "title inválido" }, { status: 400 });
    if (typeof description !== "string")
      return NextResponse.json({ error: "description inválida" }, { status: 400 });
    if (typeof publishedAt !== "string")
      return NextResponse.json({ error: "publishedAt inválido" }, { status: 400 });
    if (!["draft", "published"].includes(status))
      return NextResponse.json({ error: "status inválido" }, { status: 400 });
    if (typeof content !== "string")
      return NextResponse.json({ error: "content inválido" }, { status: 400 });

    const post = await createPost({ title, description, publishedAt, status, content });
    return NextResponse.json(post);
  } catch (err) {
    console.error("[api/blog POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
