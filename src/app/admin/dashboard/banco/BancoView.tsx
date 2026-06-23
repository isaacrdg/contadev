"use client";

import { useState } from "react";
import Link from "next/link";
import type { TabelaInfo } from "@/lib/vendas-db";

// Explorador do banco: navegar pelas tabelas e campos do Neon (read-only).
// Transparência tipo Metabase: você vê de onde o dado pode vir.

const C = {
  page: "#ffffff", bar: "#f6f7f9", card: "#ffffff", border: "#e7e9ec", title: "#374151", big: "#111827",
  answer: "#6b7280", muted: "#9aa1ab", accent: "#475569", track: "#eef0f3",
};

// Tabelas que o dashboard de vendas consome hoje
const USADAS = new Set([
  "leads", "lead_subscriptions", "subscription_payments", "subscription_history",
  "lead_form_submit", "lead_losses", "chatwoot_messages", "chatwoot_conversations",
  "chatwoot_outgoing_message_requests",
]);

export default function BancoView({ schema }: { schema: TabelaInfo[] }) {
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<string | null>(null);

  const q = busca.trim().toLowerCase();
  const tabelas = schema.filter((t) =>
    !q || t.tabela.toLowerCase().includes(q) || t.colunas.some((c) => c.nome.toLowerCase().includes(q))
  );

  return (
    <div style={{ background: C.page, minHeight: "calc(100vh - 80px)", color: C.big, margin: "-32px -24px", padding: "26px 26px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, background: C.bar, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 18px" }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: C.big }}>Explorador do banco</h1>
          <p style={{ fontSize: 12, color: C.answer, marginTop: 2 }}>{schema.length} tabelas no Neon. Clique para ver os campos. Somente leitura.</p>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: 12.5, fontWeight: 600, padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.title, textDecoration: "none" }}>← Voltar ao dashboard</Link>
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar tabela ou campo..."
        style={{ width: "100%", marginTop: 14, fontSize: 13, padding: "10px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.big, outline: "none", boxSizing: "border-box" }}
      />

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, alignItems: "start" }}>
        {tabelas.map((t) => {
          const open = aberta === t.tabela;
          const usada = USADAS.has(t.tabela);
          return (
            <div key={t.tabela} style={{ background: C.card, border: `1px solid ${usada ? "#c7d2da" : C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setAberta(open ? null : t.tabela)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "11px 14px", border: "none", background: open ? "#f6f7f9" : "#fff", cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <span style={{ color: C.muted, fontSize: 11 }}>{open ? "▾" : "▸"}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.big, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tabela}</span>
                  {usada && <span style={{ fontSize: 9, fontWeight: 600, color: "#1e6f50", background: "#dcfce7", borderRadius: 4, padding: "2px 5px", whiteSpace: "nowrap" }}>no dashboard</span>}
                </span>
                <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>{t.colunas.length} campos</span>
              </button>
              {open && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "6px 0", maxHeight: 320, overflow: "auto" }}>
                  {t.colunas.map((c) => (
                    <div key={c.nome} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 14px", fontSize: 12 }}>
                      <span style={{ color: C.title, fontFamily: "monospace" }}>{c.nome}</span>
                      <span style={{ color: C.muted, fontSize: 11 }}>{c.tipo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {tabelas.length === 0 && <div style={{ color: C.muted, fontSize: 13, padding: 16 }}>Nenhuma tabela ou campo encontrado para &quot;{busca}&quot;.</div>}
      </div>
    </div>
  );
}
