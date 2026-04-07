"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={busy}
      className="ml-1 px-3 py-2 rounded-lg text-[12px] font-medium text-white/55 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
      title="Sair"
      aria-label="Sair"
    >
      Sair
    </button>
  );
}
