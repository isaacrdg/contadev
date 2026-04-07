import { NextResponse } from "next/server";
import {
  updateTicketStatus,
  updateTicketPriority,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/tickets-store";

const VALID_STATUSES: TicketStatus[] = [
  "aberto",
  "em_atendimento",
  "aguardando_cliente",
  "resolvido",
];
const VALID_PRIORITIES: TicketPriority[] = ["baixa", "media", "alta", "urgente"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, priority } = body ?? {};

    let updated = null;

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "status inválido" }, { status: 400 });
      }
      updated = await updateTicketStatus(id, status);
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return NextResponse.json({ error: "priority inválida" }, { status: 400 });
      }
      updated = await updateTicketPriority(id, priority);
    }

    if (updated === null) {
      return NextResponse.json({ error: "Ticket não encontrado ou nada pra atualizar" }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/ticket/[id] PATCH]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
