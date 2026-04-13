"use client";
import { useEffect, useRef, useState } from "react";
import { useFormModal } from "@/components/FormContext";

type Region = "brasil" | "internacional";

interface RegionPrices {
  mensal: number;
  anual: number;
  bianual: number;
}

const REGIONS: Record<Region, { label: string; prices: RegionPrices; features: string[] }> = {
  brasil: {
    label: "Brasil",
    prices: { mensal: 24990, anual: 16244, bianual: 15494 },
    features: [
      "Abertura de empresa grátis",
      "Emissão ilimitada de notas",
      "Declarações mensais e anuais",
      "Suporte via WhatsApp",
      "Acesso à plataforma",
    ],
  },
  internacional: {
    label: "Internacional",
    prices: { mensal: 34900, anual: 22685, bianual: 21638 },
    features: [
      "Tudo do plano Brasil",
      "Invoices em inglês",
      "Planejamento tributário",
      "Declaração IRPF inclusa",
      "Contador dedicado",
      "Atendimento prioritário",
    ],
  },
};

type BillingKey = "mensal" | "anual" | "bianual";

const COLUMNS: { key: BillingKey; label: string; featured: boolean }[] = [
  { key: "mensal", label: "Mensal", featured: false },
  { key: "anual", label: "Anual", featured: true },
  { key: "bianual", label: "Bianual", featured: false },
];

function fmt(cents: number): { main: string; dec: string } {
  const r = Math.floor(cents / 100);
  const d = cents % 100;
  return { main: `R$${r}`, dec: d > 0 ? `,${String(d).padStart(2, "0")}` : "" };
}

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const { openForm } = useFormModal();
  const [region, setRegion] = useState<Region>("brasil");

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

  const data = REGIONS[region];
  const monthlyBase = data.prices.mensal;

  return (
    <section id="precos" ref={ref} className="relative py-16 md:py-24 overflow-hidden">
      {/* Background orbs sutis */}
      <div className="absolute pointer-events-none" style={{ width: "550px", height: "550px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)", top: "-180px", right: "-180px", animation: "pOrb1 25s ease-in-out infinite alternate" }} />
      <div className="absolute pointer-events-none" style={{ width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)", bottom: "-120px", left: "-120px", animation: "pOrb2 30s ease-in-out infinite alternate" }} />

      <div className="relative z-10 max-w-[1020px] mx-auto px-5 md:px-6">
        {/* Header */}
        <div className="text-center mb-10 fade-up">
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-[1.1] tracking-tight text-white" style={{ letterSpacing: "-.3px" }}>
            Quanto custa simplificar{" "}
            <em className="not-italic" style={{ background: "linear-gradient(180deg, #3c0dff, #7553ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>sua PJ?</em>
          </h2>
          <p className="text-[15px] text-white/50 mt-4 max-w-[460px] mx-auto leading-relaxed">
            Mensalidade fixa independente do seu faturamento. Sem taxa escondida, sem reajuste surpresa.
          </p>
        </div>

        {/* Region toggle */}
        <div className="flex items-center justify-center gap-2 mb-12 fade-up">
          {(["brasil", "internacional"] as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="text-[13px] font-medium px-5 py-2 rounded-full transition-all flex items-center gap-2"
              style={{
                background: region === r ? "rgba(255,255,255,0.10)" : "transparent",
                border: region === r ? "1px solid rgba(255,255,255,0.20)" : "1px solid rgba(255,255,255,0.06)",
                color: region === r ? "#fafafa" : "rgba(255,255,255,0.45)",
              }}
            >
              <span className="text-[15px] leading-none">{r === "brasil" ? "🇧🇷" : "🌎"}</span>
              {REGIONS[r].label}
            </button>
          ))}
        </div>

        {/* 3 Cards: Mensal | Anual (featured) | Bianual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 items-start">
          {COLUMNS.map((col, i) => {
            const price = data.prices[col.key];
            const disc = col.key !== "mensal" ? Math.round((1 - price / monthlyBase) * 100) : 0;
            const { main, dec } = fmt(price);
            const isFeatured = col.featured;

            return (
              <div
                key={col.key}
                className={`fade-up group relative flex flex-col transition-transform duration-300 hover:-translate-y-1 ${isFeatured ? "md:-mt-6 md:mb-[-24px]" : ""}`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                  background: isFeatured ? "rgba(15,14,20,0.98)" : "rgba(255,255,255,0.015)",
                  border: isFeatured ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "14px",
                  boxShadow: isFeatured ? "0 24px 60px -16px rgba(0,0,0,0.35)" : "none",
                }}
              >
                {/* Badge */}
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[10px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)", color: "#fafafa" }}>
                    Melhor opção
                  </div>
                )}

                {/* Sheen animado no featured */}
                {isFeatured && (
                  <div className="h-[2px] w-full rounded-t-[14px] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full w-1/3" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)", animation: "pSheen 5s ease-in-out infinite" }} />
                  </div>
                )}

                <div className={`p-6 md:p-7 flex flex-col flex-1 ${isFeatured ? "pt-8 md:pt-9" : ""}`}>
                  {/* Period label */}
                  <p className="font-display font-semibold text-[11px] uppercase tracking-[.14em] mb-6" style={{ color: isFeatured ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.30)" }}>
                    {col.label}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {disc > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px] text-white/25 line-through">{fmt(monthlyBase).main}{fmt(monthlyBase).dec}/mês</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#6ee7b7" }}>
                          -{disc}%
                        </span>
                      </div>
                    )}
                    <span className="font-display font-bold" style={{ fontSize: isFeatured ? "46px" : "40px", color: "#fafafa", lineHeight: 1, letterSpacing: "-0.02em" }}>{main}</span>
                    {dec && <span className="font-display font-bold text-[20px]" style={{ color: "rgba(250,250,250,0.35)" }}>{dec}</span>}
                    <span className="text-[13px] ml-1.5 text-white/30">/mês</span>
                  </div>

                  {/* Divider */}
                  <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

                  {/* Features */}
                  <ul className="flex flex-col gap-3 mb-8">
                    {data.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] leading-snug" style={{ color: "rgba(224,224,224,0.90)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                          <path d="M20 6L9 17l-5-5" stroke={isFeatured ? "#fafafa" : "rgba(255,255,255,0.30)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto">
                    <button
                      onClick={openForm}
                      className={`w-full flex items-center justify-center gap-2 text-[14px] font-semibold py-3.5 rounded-xl transition-all duration-300 ${
                        isFeatured
                          ? "hover:shadow-[0_8px_24px_-8px_rgba(102,68,242,0.6)] hover:scale-[1.02]"
                          : "hover:brightness-125"
                      }`}
                      style={isFeatured
                        ? { background: "#6644f2", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 6px 20px -6px rgba(102,68,242,0.5)" }
                        : { background: "rgba(102,68,242,0.25)", border: "1px solid rgba(117,83,255,0.30)", color: "#fafafa" }
                      }
                    >
                      Começar agora
                      {isFeatured && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 space-y-2 fade-up" style={{ transitionDelay: "300ms" }}>
          <p className="text-[13px] text-white/50">
            Mais de <span className="text-white/80 font-semibold">800 devs</span> já simplificaram a contabilidade com a Conta Dev
          </p>
          <p className="text-[11px] text-white/25">
            Sem fidelidade · Sem multa · Cancele quando quiser
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pOrb1 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-50px,30px) scale(1.1); } }
        @keyframes pOrb2 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(40px,-20px) scale(1.08); } }
        @keyframes pSheen { 0% { transform: translateX(-200%); } 50% { transform: translateX(400%); } 100% { transform: translateX(-200%); } }
      `}</style>
    </section>
  );
}
