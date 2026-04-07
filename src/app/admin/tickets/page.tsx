import { readTickets } from "@/lib/tickets-store";
import TicketsKanban from "./TicketsKanban";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const tickets = await readTickets();
  return <TicketsKanban initialTickets={tickets} />;
}
