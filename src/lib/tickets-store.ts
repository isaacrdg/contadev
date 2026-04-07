import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

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

const DATA_DIR = path.join(process.cwd(), "data");
const TICKETS_FILE = path.join(DATA_DIR, "tickets.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.access(TICKETS_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TICKETS_FILE, "[]", "utf-8");
  }
}

export async function readTickets(): Promise<Ticket[]> {
  await ensureFile();
  const raw = await fs.readFile(TICKETS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Ticket[]) : [];
  } catch {
    return [];
  }
}

async function writeTickets(tickets: Ticket[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(TICKETS_FILE, JSON.stringify(tickets, null, 2), "utf-8");
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
