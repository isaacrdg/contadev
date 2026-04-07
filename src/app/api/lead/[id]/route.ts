import { NextResponse } from "next/server";
import {
  readLeads,
  updateLeadStatus,
  updateLeadNotes,
  updateLeadTags,
  type LeadStatus,
} from "@/lib/leads-store";
import { notifyStatusChange } from "@/lib/lead-webhook";

const VALID_STATUSES: LeadStatus[] = ["novo", "em_contato", "convertido", "perdido"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes, tags } = body ?? {};

    // Suporta atualizar status, notes, tags ou combinações
    let updated = null;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "status inválido" }, { status: 400 });
      }
      // Captura o status anterior pra notificar Slack
      const before = (await readLeads()).find((l) => l.id === id);
      const fromStatus = before?.status;
      updated = await updateLeadStatus(id, status);
      if (updated && fromStatus && fromStatus !== status) {
        notifyStatusChange(updated, fromStatus, status).catch((err) =>
          console.error("[lead-webhook]", err)
        );
      }
    }

    if (notes !== undefined) {
      if (typeof notes !== "string") {
        return NextResponse.json({ error: "notes deve ser string" }, { status: 400 });
      }
      updated = await updateLeadNotes(id, notes);
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) {
        return NextResponse.json({ error: "tags deve ser string[]" }, { status: 400 });
      }
      updated = await updateLeadTags(id, tags);
    }

    if (updated === null && status === undefined && notes === undefined && tags === undefined) {
      return NextResponse.json({ error: "nenhum campo pra atualizar" }, { status: 400 });
    }

    if (!updated) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/lead/[id] PATCH]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
