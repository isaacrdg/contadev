"use client";
import { useState } from "react";

export default function IntegracoesClient({ isConfigured }: { isConfigured: boolean }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleTest() {
    if (testing || !isConfigured) return;
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch("/api/lead/test-webhook", { method: "POST" });
      const data = await res.json();
      setResult({ ok: data.ok, message: data.message });
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleTest}
        disabled={!isConfigured || testing}
        className="text-[12px] font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: isConfigured
            ? "linear-gradient(135deg, #6644f2, #5129f0)"
            : "rgba(255,255,255,0.05)",
          border: isConfigured
            ? "1px solid rgba(255,255,255,0.18)"
            : "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          boxShadow: isConfigured ? "0 4px 14px -4px rgba(102,68,242,0.4)" : "none",
        }}
      >
        {testing ? "Enviando..." : "Enviar mensagem de teste"}
      </button>

      {result && (
        <div
          className="mt-4 px-4 py-3 rounded-lg text-[12px]"
          style={{
            background: result.ok ? "rgba(110,231,183,0.08)" : "rgba(239,68,68,0.08)",
            border: result.ok
              ? "1px solid rgba(110,231,183,0.3)"
              : "1px solid rgba(239,68,68,0.3)",
            color: result.ok ? "#6ee7b7" : "#fca5a5",
          }}
        >
          {result.ok ? "✓ " : "✕ "}
          {result.message}
        </div>
      )}
    </div>
  );
}
