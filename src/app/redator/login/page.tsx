"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTeamMembers } from "@/lib/team";

const team = getTeamMembers();

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/redator";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = team.find((m) => m.id === selectedId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !password.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/redator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, userId: selectedId }),
      });
      if (res.ok) {
        router.replace(from);
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Senha incorreta");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-[420px] rounded-xl p-7"
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 20px 50px -20px rgba(0,0,0,0.75)",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Conta Dev" style={{ height: "36px", width: "auto" }} />
        <div className="border-l border-white/10 pl-3 ml-1">
          <h1 className="text-[14px] font-semibold leading-none tracking-tight text-[#fafafa]">Blog</h1>
          <p className="text-[10px] text-white/45 mt-1">Acesso de redator</p>
        </div>
      </div>

      {/* Step 1: Escolher perfil */}
      <p className="text-[11px] text-white/55 mb-3">Quem é você?</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {team.map((member) => {
          const isSelected = selectedId === member.id;
          const initials = member.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <button
              key={member.id}
              onClick={() => {
                setSelectedId(member.id);
                setError(null);
              }}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-lg transition-all"
              style={{
                background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                border: isSelected
                  ? "1px solid rgba(255,255,255,0.25)"
                  : "1px solid rgba(255,255,255,0.06)",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold"
                style={{
                  background: isSelected
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: isSelected
                    ? "2px solid rgba(255,255,255,0.30)"
                    : "2px solid transparent",
                  color: isSelected ? "#fafafa" : "rgba(255,255,255,0.65)",
                }}
              >
                {initials}
              </div>
              <span
                className="text-[12px] font-medium"
                style={{ color: isSelected ? "#fafafa" : "rgba(255,255,255,0.65)" }}
              >
                {member.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step 2: Senha (só aparece quando perfil selecionado) */}
      {selectedId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.08em] text-white/50 font-semibold mb-2">
              Senha · {selected?.name}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              placeholder="••••••••"
              className="w-full px-4 py-3 text-[13px] text-[#fafafa] placeholder-white/25 outline-none rounded-lg"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          </div>

          {error && (
            <div
              className="text-[11px] px-3 py-2 rounded-lg"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password.trim() || loading}
            className="w-full text-[12px] font-medium py-3 rounded-md transition-colors disabled:opacity-40 hover:bg-white/15"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fafafa",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RedatorLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
