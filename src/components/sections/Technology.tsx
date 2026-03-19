"use client";
import { useEffect, useRef, useState } from "react";
import SectionDivider from "@/components/SectionDivider";

const tabs = [
  { key: "notas", label: "Notas Fiscais" },
  { key: "invoices", label: "Invoices" },
  { key: "declaracoes", label: "Declarações" },
  { key: "pagamentos", label: "Pagamentos" },
  { key: "suporte", label: "Suporte" },
];

const row1 = [
  { icon: "building", label: "CNPJ", rest: "em até 24h" },
  { icon: "file", label: "NF", rest: "com um clique" },
  { icon: "globe", label: "Invoices", rest: "em inglês" },
  { icon: "chat", label: "WhatsApp", rest: "com especialista" },
];
const row2 = [
  { icon: "chart", label: "IR", rest: "automatizado" },
  { icon: "wallet", label: "Pró-labore", rest: "otimizado" },
  { icon: "screen", label: "Dashboard", rest: "em tempo real" },
  { icon: "shield", label: "Dados", rest: "100% seguros" },
];
const row3 = [
  { icon: "zap", label: "Abertura", rest: "gratuita" },
  { icon: "clock", label: "Resposta", rest: "em minutos" },
  { icon: "code", label: "Feito", rest: "para devs" },
  { icon: "check", label: "Guias", rest: "todo mês" },
];

const iconPaths: Record<string, string> = {
  building: "M3 21V3h8v4h7v14H3zm2-2h4v-3H5v3zm0-5h4v-3H5v3zm0-5h4V6H5v3zm6 10h4v-3h-4v3zm0-5h4v-3h-4v3z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 0 1 5.3 2H6.7A8 8 0 0 1 12 4zM4 12a8 8 0 0 1 .5-2.8h15A8 8 0 0 1 20 12a8 8 0 0 1-.5 2.8h-15A8 8 0 0 1 4 12zm8 8a8 8 0 0 1-5.3-2h10.6A8 8 0 0 1 12 20z",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
  screen: "M2 3h20v14H2V3zm4 18h12M8 17v4m8-4v4",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v5l3 3",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  check: "M20 6L9 17l-5-5",
};


export default function Technology() {
  const ref = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("notas");

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="tecnologia"
      ref={ref}
      className="relative px-5 md:px-6"
    >
      <SectionDivider cross="left" />
      <div className="relative z-10 max-w-[1020px] mx-auto my-8 md:my-12 flex flex-col md:flex-row-reverse items-center gap-5 md:gap-10">

        {/* LEFT — copy */}
        <div className="w-full md:w-[420px] flex-shrink-0 fade-up">
          <h2
            className="font-display font-bold text-4xl md:text-[38px] leading-[1.12] tracking-tight text-[#fafafa] mb-4"
            style={{ letterSpacing: "-.3px" }}
          >
            Tudo que você precisa,{" "}
            <em className="not-italic gradient-text">em uma tela.</em>
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#e0e0e0] mb-5">
            De notas fiscais a declarações, nossa plataforma centraliza toda a sua operação.
            Simples, rápida e feita para desenvolvedores.
          </p>

          {/* Feature cards — 3 rows carousel */}
          <div className="flex flex-col gap-2.5 mb-6 fade-up" style={{ transitionDelay: "100ms" }}>
            {[
              { items: row1, speed: "55s", dir: "normal" },
              { items: row2, speed: "60s", dir: "reverse" },
              { items: row3, speed: "58s", dir: "normal" },
            ].map((row, ri) => (
              <div key={ri} className="relative overflow-hidden">
                {/* Fade edges */}
                <div className="absolute top-0 left-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #191919, transparent)" }} />
                <div className="absolute top-0 right-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #191919, transparent)" }} />
                <div
                  className="flex gap-2.5"
                  style={{
                    width: "max-content",
                    animation: `scrollCarousel ${row.speed} linear infinite ${row.dir}`,
                  }}
                >
                  {[...row.items, ...row.items, ...row.items].map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-4 py-4 rounded-xl flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 0 25px rgba(255,255,255,0.04), 0 0 8px rgba(255,255,255,0.02)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8f6fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <path d={iconPaths[f.icon]} />
                      </svg>
                      <span className="text-[12px] whitespace-nowrap">
                        <span className="font-semibold" style={{ background: "linear-gradient(135deg, #7553ff, #a78bff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{f.label}</span>
                        <span className="text-[#e0e0e0]/60 ml-1">{f.rest}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT — platform mockup with tabs */}
        <div
          className="hidden md:flex flex-col flex-1 relative fade-up gap-3"
          style={{ transitionDelay: "200ms" }}
        >
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="text-[11px] px-3.5 py-2 rounded-lg whitespace-nowrap transition-all duration-300 cursor-pointer"
                style={{
                  background: activeTab === t.key ? "rgba(117,83,255,0.15)" : "rgba(255,255,255,0.03)",
                  border: activeTab === t.key ? "1px solid rgba(117,83,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  color: activeTab === t.key ? "#a78bff" : "rgba(255,255,255,0.4)",
                  fontWeight: activeTab === t.key ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Mockup */}
          <div
            className="relative rounded-[20px] overflow-hidden flex-1"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(117,83,255,0.22)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.3)",
              minHeight: 400,
            }}
          >
            {/* Bottom fade */}
            <div className="absolute left-0 right-0 bottom-0 h-28 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to top, #1c1c1c, transparent)" }} />

            {/* App header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#7553ff] flex items-center justify-center font-display font-bold text-[10px] text-white">C</div>
                <span className="font-display font-bold text-[13px] text-[#fafafa]">ContaDev</span>
              </div>
              <span className="text-[10px] text-white/35">Março 2026</span>
            </div>

            {/* Tab content */}
            <div className="p-4" key={activeTab} style={{ animation: "fadeIn 0.3s ease" }}>
              {activeTab === "notas" && (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Total Emitido", val: "R$ 93.000", accent: true },
                      { label: "NFs Emitidas",  val: "3",         accent: true },
                      { label: "Pendentes",     val: "1",         accent: false },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#1c1c1c] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[7px] text-white/35 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="font-display font-bold text-[13px]" style={{ color: s.accent ? "#8f6fff" : "#9CA3AF" }}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { num: "#0042", client: "Chatigo Pixa",    val: "R$ 42.000", status: "Paga",        ok: true },
                      { num: "#0041", client: "Remote Tech LLC", val: "R$ 33.000", status: "Paga",        ok: true },
                      { num: "#0040", client: "Startup XYZ",     val: "R$ 18.000", status: "Processando", ok: false },
                    ].map((nf) => (
                      <div key={nf.num} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/5" style={{ background: "#1c1c1c" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold" style={{ background: nf.ok ? "rgba(16,185,129,0.12)" : "rgba(117,83,255,0.12)", color: nf.ok ? "#34d399" : "#8f6fff" }}>NF</div>
                          <div>
                            <p className="text-[10px] text-[#fafafa] font-medium">{nf.client}</p>
                            <p className="text-[8px] text-white/35">{nf.num}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold text-[#8f6fff]">{nf.val}</p>
                          <p className={`text-[8px] ${nf.ok ? "text-emerald-400" : "text-white/35"}`}>● {nf.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "invoices" && (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Total USD", val: "$12,400", accent: true },
                      { label: "Invoices Sent", val: "5", accent: true },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#1c1c1c] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[7px] text-white/35 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="font-display font-bold text-[13px]" style={{ color: s.accent ? "#8f6fff" : "#9CA3AF" }}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { num: "INV-018", client: "Acme Corp (US)", val: "$4,200", status: "Paid", ok: true },
                      { num: "INV-017", client: "TechFlow (UK)",  val: "$5,800", status: "Paid", ok: true },
                      { num: "INV-016", client: "DevStack (DE)",  val: "$2,400", status: "Pending", ok: false },
                    ].map((inv) => (
                      <div key={inv.num} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/5" style={{ background: "#1c1c1c" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold" style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa" }}>IN</div>
                          <div>
                            <p className="text-[10px] text-[#fafafa] font-medium">{inv.client}</p>
                            <p className="text-[8px] text-white/35">{inv.num}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold text-[#60a5fa]">{inv.val}</p>
                          <p className={`text-[8px] ${inv.ok ? "text-emerald-400" : "text-amber-400"}`}>● {inv.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "declaracoes" && (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "IRPJ", val: "Em dia", accent: true },
                      { label: "IRPF", val: "Enviado", accent: true },
                      { label: "DAS", val: "Pago", accent: false },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#1c1c1c] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[7px] text-white/35 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="font-display font-bold text-[13px] text-emerald-400">{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "IRPF 2025", date: "Enviado em 15/03", status: "Concluído", ok: true },
                      { label: "DAS — Março", date: "Venc. 20/04", status: "Gerado", ok: true },
                      { label: "DEFIS 2025", date: "Prazo 31/03", status: "Em revisão", ok: false },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/5" style={{ background: "#1c1c1c" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }}>DC</div>
                          <div>
                            <p className="text-[10px] text-[#fafafa] font-medium">{d.label}</p>
                            <p className="text-[8px] text-white/35">{d.date}</p>
                          </div>
                        </div>
                        <p className={`text-[9px] font-medium ${d.ok ? "text-emerald-400" : "text-amber-400"}`}>● {d.status}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "pagamentos" && (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Pró-labore", val: "R$ 5.200", accent: true },
                      { label: "Guias Pagas", val: "12", accent: false },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#1c1c1c] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[7px] text-white/35 uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="font-display font-bold text-[13px]" style={{ color: s.accent ? "#8f6fff" : "#9CA3AF" }}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "DAS — Fevereiro", val: "R$ 1.247,00", status: "Pago", ok: true },
                      { label: "INSS — Fevereiro", val: "R$ 380,00", status: "Pago", ok: true },
                      { label: "ISS — Março", val: "R$ 620,00", status: "Pendente", ok: false },
                    ].map((p) => (
                      <div key={p.label} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/5" style={{ background: "#1c1c1c" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold" style={{ background: "rgba(117,83,255,0.12)", color: "#8f6fff" }}>PG</div>
                          <p className="text-[10px] text-[#fafafa] font-medium">{p.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold text-[#8f6fff]">{p.val}</p>
                          <p className={`text-[8px] ${p.ok ? "text-emerald-400" : "text-amber-400"}`}>● {p.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "suporte" && (
                <div className="flex flex-col gap-3">
                  <div className="bg-[#1c1c1c] rounded-xl p-3.5 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#7553ff] flex items-center justify-center text-[9px] font-bold text-white">RS</div>
                      <div>
                        <p className="text-[10px] text-[#fafafa] font-medium">Rafael Santos</p>
                        <p className="text-[8px] text-emerald-400">● Online</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed">Seu especialista dedicado. Contador · CRC Ativo · Especialista em tech PJ</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { q: "Como emitir NF internacional?", time: "Respondido em 8 min" },
                      { q: "Qual melhor regime pra $8k/mês?", time: "Respondido em 12 min" },
                      { q: "Preciso declarar crypto?", time: "Respondido em 5 min" },
                    ].map((t) => (
                      <div key={t.q} className="px-3.5 py-2.5 rounded-xl border border-white/5" style={{ background: "#1c1c1c" }}>
                        <p className="text-[10px] text-[#fafafa] font-medium">{t.q}</p>
                        <p className="text-[8px] text-emerald-400 mt-1">✓ {t.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
