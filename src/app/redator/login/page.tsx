"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/redator";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/redator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(from);
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Não foi possível autenticar");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="w-full max-w-[380px] rounded-xl p-7"
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
          <h1 className="text-[14px] font-semibold leading-none tracking-tight">Blog</h1>
          <p className="text-[10px] text-white/45 mt-1">Acesso de redator</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.08em] text-white/50 font-semibold mb-2">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="••••••••"
            className="w-full px-4 py-3 text-[13px] text-[#fafafa] placeholder-white/25 outline-none rounded-lg focus:border-white/30 transition-colors"
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
          className="w-full text-[12px] font-medium py-3 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/15"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fafafa",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-[10px] text-white/35 text-center mt-5 leading-relaxed">
        Acesso restrito aos redatores do blog
      </p>
    </div>
  );
}

export default function RedatorLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
