import { NextResponse } from "next/server";
import { addTicket, readTickets, type TicketPriority } from "@/lib/tickets-store";

const VALID_PRIORITIES: TicketPriority[] = ["baixa", "media", "alta", "urgente"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, customer, contact, description, priority } = body ?? {};

    if (typeof title !== "string" || title.trim().length < 2) {
      return NextResponse.json({ error: "title inválido" }, { status: 400 });
    }
    if (typeof customer !== "string" || customer.trim().length < 1) {
      return NextResponse.json({ error: "customer inválido" }, { status: 400 });
    }
    if (typeof contact !== "string" || contact.trim().length < 1) {
      return NextResponse.json({ error: "contact inválido" }, { status: 400 });
    }
    if (typeof description !== "string") {
      return NextResponse.json({ error: "description inválida" }, { status: 400 });
    }
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: "priority inválida" }, { status: 400 });
    }

    const ticket = await addTicket({
      title,
      customer,
      contact,
      description,
      priority: priority as TicketPriority | undefined,
    });

    return NextResponse.json({ ok: true, id: ticket.id });
  } catch (err) {
    console.error("[api/ticket POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tickets = await readTickets();
    return NextResponse.json(tickets);
  } catch (err) {
    console.error("[api/ticket GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
