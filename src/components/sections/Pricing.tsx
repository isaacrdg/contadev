"use client";
import { useEffect, useRef, useState } from "react";
import { useFormModal } from "@/components/FormContext";

type Region = "brasil" | "internacional";

interface PlanRow {
  name: string;
  mensal: number;
  anual: number;
  bianual: number;
}

const PLANS: Record<Region, PlanRow[]> = {
  brasil: [
    { name: "Essencial", mensal: 24990, anual: 16244, bianual: 15494 },
    { name: "Premium",   mensal: 34900, anual: 22685, bianual: 21638 },
  ],
  internacional: [
    { name: "Essencial", mensal: 24990, anual: 16244, bianual: 15494 },
    { name: "Premium",   mensal: 34900, anual: 22685, bianual: 21638 },
  ],
};

const BILLING_COLS = [
  { key: "mensal"  as const, label: "Mensal",  installment: false },
  { key: "anual"   as const, label: "Anual",   installment: true, badge: "Melhor" },
  { key: "bianual" as const, label: "Bianual", installment: true },
];

function fmt(cents: number): string {
  const r = Math.floor(cents / 100);
  const d = cents % 100;
  return `R$${r.toLocaleString("pt-BR")}${d > 0 ? `,${String(d).padStart(2, "0")}` : ""}`;
}

function discount(monthly: number, price: number): number {
  return Math.round((1 - price / monthly) * 100);
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

  const plans = PLANS[region];

  return (
    <section id="precos" ref={ref} className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute pointer-events-none" style={{ width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(117,83,255,0.06) 0%, transparent 70%)", top: "-200px", right: "-200px", animation: "pOrb1 25s ease-in-out infinite alternate" }} />
      <div className="absolute pointer-events-none" style={{ width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)", bottom: "-150px", left: "-150px", animation: "pOrb2 30s ease-in-out infinite alternate" }} />

      <div className="relative z-10 max-w-[1020px] mx-auto px-5 md:px-6">
        {/* Header */}
        <div className="text-center mb-10 fade-up">
          <h2 className="font-display font-bold text-3xl md:text-[44px] leading-[1.1] tracking-tight text-white" style={{ letterSpacing: "-.3px" }}>
            Quanto custa simplificar{" "}
            <em className="not-italic" style={{ background: "linear-gradient(180deg, #3c0dff, #7553ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>sua PJ?</em>
          </h2>
          <p className="text-[15px] text-white/50 mt-4 max-w-[480px] mx-auto leading-relaxed">
            Mensalidade fixa independente do seu faturamento. Sem taxa escondida, sem 13ª mensalidade, sem reajuste surpresa.
          </p>
        </div>

        {/* Region toggle */}
        <div className="flex items-center justify-center gap-2 mb-10 fade-up">
          {(["brasil", "internacional"] as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="text-[13px] font-medium px-5 py-2 rounded-full transition-all"
              style={{
                background: region === r ? "rgba(255,255,255,0.10)" : "transparent",
                border: region === r ? "1px solid rgba(255,255,255,0.20)" : "1px solid rgba(255,255,255,0.06)",
                color: region === r ? "#fafafa" : "rgba(255,255,255,0.45)",
              }}
            >
              {r === "brasil" ? "Brasil" : "Internacional"}
            </button>
          ))}
        </div>

        {/* 3 billing columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 items-start">
          {BILLING_COLS.map((col, i) => {
            const isFeatured = col.key === "anual";
            return (
              <div
                key={col.key}
                className={`fade-up group relative flex flex-col transition-transform duration-300 hover:-translate-y-1 ${isFeatured ? "md:-mt-6 md:mb-[-24px]" : ""}`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                  background: isFeatured ? "rgba(15,14,20,0.98)" : "rgba(255,255,255,0.015)",
                  border: isFeatured ? "1px solid rgba(117,83,255,0.30)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "14px",
                  boxShadow: isFeatured ? "0 24px 60px -16px rgba(0,0,0,0.35), 0 0 60px -20px rgba(117,83,255,0.12)" : "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {/* Badge */}
                {col.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 text-[10px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}
                  >
                    {col.badge}
                  </div>
                )}

                {/* Sheen */}
                {isFeatured && (
                  <div className="h-[2px] w-full rounded-t-[14px] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full w-1/2" style={{ background: "linear-gradient(90deg, transparent, #7553ff, #8f6fff, transparent)", animation: "pSheen 4s ease-in-out infinite" }} />
                  </div>
                )}

                <div className={`p-6 md:p-7 flex flex-col flex-1 ${isFeatured ? "pt-8 md:pt-9" : ""}`}>
                  {/* Billing period label */}
                  <p className="font-display font-semibold text-[11px] uppercase tracking-[.14em] mb-6" style={{ color: isFeatured ? "#8f6fff" : "rgba(255,255,255,0.30)" }}>
                    {col.label}
                  </p>

                  {/* Plan prices */}
                  <div className="space-y-5 mb-6">
                    {plans.map((plan) => {
                      const price = plan[col.key];
                      const disc = col.key !== "mensal" ? discount(plan.mensal, price) : 0;
                      return (
                        <div key={plan.name}>
                          <p className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-medium mb-1.5">{plan.name}</p>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {disc > 0 && (
                              <span className="text-[12px] text-white/25 line-through">{fmt(plan.mensal)}</span>
                            )}
                            <span className="font-display font-bold text-white" style={{ fontSize: isFeatured ? "32px" : "28px", lineHeight: 1, letterSpacing: "-0.02em" }}>
                              {fmt(price)}
                            </span>
                            <span className="text-[12px] text-white/30">/mês</span>
                            {disc > 0 && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.30)", color: "#6ee7b7" }}>
                                -{disc}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Installment */}
                  {col.installment ? (
                    <p className="text-[11px] text-white/40 mb-5">Parcelável em até 12x</p>
                  ) : (
                    <p className="text-[11px] text-white/25 mb-5">Sem parcelamento</p>
                  )}

                  {/* Divider */}
                  <div className="mb-5" style={{ height: "1px", background: isFeatured ? "rgba(117,83,255,0.12)" : "rgba(255,255,255,0.06)" }} />

                  {/* Key benefit */}
                  <p className="text-[12px] text-white/50 mb-6 leading-relaxed">
                    {col.key === "mensal" && "Flexibilidade total, pague mês a mês sem compromisso de longo prazo."}
                    {col.key === "anual" && "O equilíbrio ideal entre economia e flexibilidade. Escolha mais popular entre nossos clientes."}
                    {col.key === "bianual" && "A maior economia possível pra quem já sabe que a Conta Dev é o lugar certo."}
                  </p>

                  {/* CTA */}
                  <div className="mt-auto">
                    <button
                      onClick={openForm}
                      className="w-full flex items-center justify-center gap-2 text-[14px] font-semibold py-3.5 rounded-xl transition-all duration-300 text-white"
                      style={isFeatured
                        ? { background: "linear-gradient(135deg, #6644f2, #5129f0)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 6px 20px -6px rgba(102,68,242,0.45)" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }
                      }
                    >
                      Começar agora
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
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
        @keyframes pOrb1 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-60px,40px) scale(1.15); } }
        @keyframes pOrb2 { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(50px,-30px) scale(1.1); } }
        @keyframes pSheen { 0% { transform: translateX(-100%); } 50% { transform: translateX(300%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </section>
  );
}
