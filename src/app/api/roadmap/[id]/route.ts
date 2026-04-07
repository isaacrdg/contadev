import { NextResponse } from "next/server";
import { setTaskStatus } from "@/lib/roadmap-store";
import { ROADMAP, type Status } from "@/lib/roadmap";

const VALID_STATUSES: Status[] = ["pendente", "em_andamento", "concluida"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body ?? {};

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "status inválido" }, { status: 400 });
    }

    if (!ROADMAP.some((t) => t.id === id)) {
      return NextResponse.json({ error: "task não encontrada" }, { status: 404 });
    }

    const map = await setTaskStatus(id, status);
    return NextResponse.json({ ok: true, id, status, progress: map });
  } catch (err) {
    console.error("[api/roadmap PATCH]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
