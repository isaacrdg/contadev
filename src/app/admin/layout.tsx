import type { ReactNode } from "react";
import AdminShell from "./AdminShell";
import {
  applyProgress,
  pendingCountIn,
  countByPriorityIn,
} from "@/lib/roadmap";
import { readProgress } from "@/lib/roadmap-store";

export const metadata = {
  title: "Painel Admin · Conta Dev",
  robots: { index: false, follow: false },
};

const isAuthEnabled = !!process.env.ADMIN_PASSWORD;

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Lê o progresso atual do roadmap (do Neon em prod, ou file em dev) pra
  // que o badge no menu hamburger reflita as tasks que o Gabriel marcou
  // como concluídas / em andamento.
  const progress = await readProgress();
  const tasks = applyProgress(progress);
  const roadmapPending = pendingCountIn(tasks);
  const roadmapCritical = countByPriorityIn(tasks, "critica");

  return (
    <AdminShell
      authEnabled={isAuthEnabled}
      roadmapPending={roadmapPending}
      roadmapCritical={roadmapCritical}
    >
      {children}
    </AdminShell>
  );
}
