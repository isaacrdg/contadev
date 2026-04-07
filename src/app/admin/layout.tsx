import type { ReactNode } from "react";
import AdminShell from "./AdminShell";
import { pendingCount, countByPriority } from "@/lib/roadmap";

export const metadata = {
  title: "Painel Admin · Conta Dev",
  robots: { index: false, follow: false },
};

const isAuthEnabled = !!process.env.ADMIN_PASSWORD;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const roadmapPending = pendingCount();
  const roadmapCritical = countByPriority("critica");

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
