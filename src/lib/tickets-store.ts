import crypto from "crypto";
import { readJson, writeJson } from "./kv";

export type TicketStatus = "aberto" | "em_atendimento" | "aguardando_cliente" | "resolvido";
export type TicketPriority = "baixa" | "media" | "alta" | "urgente";

export interface TicketStatusEntry {
  status: TicketStatus;
  at: string;
}

export interface Ticket {
  id: string;
  title: string;
  /** Nome do cliente / quem abriu o ticket */
  customer: string;
  /** Email ou telefone de contato */
  contact: string;
  description: string;
  status: TicketStatus;
  statusHistory: TicketStatusEntry[];
  priority: TicketPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewTicketPayload {
  title: string;
  customer: string;
  contact: string;
  description: string;
  priority?: TicketPriority;
}

const KEY = "tickets";

export async function readTickets(): Promise<Ticket[]> {
  const raw = await readJson<Ticket[]>(KEY, []);
  return Array.isArray(raw) ? raw : [];
}

async function writeTickets(tickets: Ticket[]): Promise<void> {
  await writeJson(KEY, tickets);
}

export async function addTicket(payload: NewTicketPayload): Promise<Ticket> {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    customer: payload.customer.trim(),
    contact: payload.contact.trim(),
    description: payload.description.trim(),
    status: "aberto",
    statusHistory: [{ status: "aberto", at: now }],
    priority: payload.priority ?? "media",
    createdAt: now,
    updatedAt: now,
  };
  const tickets = await readTickets();
  tickets.unshift(ticket);
  await writeTickets(tickets);
  return ticket;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus
): Promise<Ticket | null> {
  const tickets = await readTickets();
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const current = tickets[idx];
  if (current.status === status) return current;
  const now = new Date().toISOString();
  tickets[idx] = {
    ...current,
    status,
    statusHistory: [...current.statusHistory, { status, at: now }],
    updatedAt: now,
  };
  await writeTickets(tickets);
  return tickets[idx];
}

export async function updateTicketPriority(
  id: string,
  priority: TicketPriority
): Promise<Ticket | null> {
  const tickets = await readTickets();
  const idx = tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tickets[idx] = {
    ...tickets[idx],
    priority,
    updatedAt: new Date().toISOString(),
  };
  await writeTickets(tickets);
  return tickets[idx];
}
