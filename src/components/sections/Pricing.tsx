"use client";
import { useEffect, useRef } from "react";
import { useFormModal } from "@/components/FormContext";

const plans = [
  {
    name: "Brasil",
    price: "R$249",
    decimal: ",90",
    period: "/mês",
    desc: "Para quem fatura em reais",
    features: [
      "Abertura de empresa grátis",
      "Emissão ilimitada de notas",
      "Declarações mensais e anuais",
      "Suporte via WhatsApp",
      "Acesso à plataforma",
    ],
    featured: false,
    cta: "Começar agora",
  },
  {
    name: "Internacional",
    price: "R$349",
    decimal: ",90",
    period: "/mês",
    desc: "Para quem recebe do exterior",
    features: [
      "Tudo do plano Brasil",
      "Invoices em inglês",
      "Planejamento tributário",
      "Declaração IRPF inclusa",
      "Contador dedicado",
      "Atendimento prioritário",
    ],
    featured: false,
    cta: "Começar agora",
  },
  {
    name: "Anual",
    price: "R$199",
    decimal: ",90",
    period: "/mês",
    originalPrice: "R$249,90",
    savings: "Economize R$600/ano",
    desc: "Cobrado anualmente · Melhor custo-benefício",
    badge: "Economia de 20%",
    features: [
      "Todos os benefícios do plano Brasil",
      "Sem reajuste durante o período",
      "Abertura de empresa grátis",
      "Emissão ilimitada de notas",
      "Declarações mensais e anuais",
      "Suporte prioritário WhatsApp",
    ],
    featured: true,
    cta: "Garantir desconto",
  },
];

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const { openForm } = useFormModal();

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="precos" ref={ref} className="relative py-16 md:py-24 overflow-hidden">
      {/* Background glow sutil — duas esferas que flutuam lento */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(117,83,255,0.06) 0%, transparent 70%)",
          top: "-200px",
          right: "-200px",
          animation: "pricingOrb1 25s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)",
          bottom: "-150px",
          left: "-150px",
          animation: "pricingOrb2 30s ease-in-out infinite alternate",
        }}
      />

      <div className="relative z-10 max-w-[1020px] mx-auto px-5 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium mb-4">
            Preços
          </p>
          <h2
            className="font-display font-bold text-3xl md:text-[44px] leading-[1.1] tracking-tight text-white"
            style={{ letterSpacing: "-.3px" }}
          >
            Planos{" "}
            <em
              className="not-italic"
              style={{
                background: "linear-gradient(180deg, #3c0dff, #7553ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              transparentes
            </em>
          </h2>
          <p className="text-[15px] text-white/50 mt-4 max-w-[480px] mx-auto leading-relaxed">
            O preço não muda com o seu faturamento. Se você ganha 5, 10 ou 100 mil
            por mês — a mensalidade é a mesma.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 items-start">
          {plans.map((plan, i) => {
            const isFeatured = plan.featured;
            return (
              <div
                key={plan.name}
                className={`fade-up group relative flex flex-col transition-transform duration-300 hover:-translate-y-1 ${
                  isFeatured ? "md:-mt-6 md:mb-[-24px]" : ""
                }`}
                style={{
                  transitionDelay: `${i * 100}ms`,
                  background: isFeatured
                    ? "rgba(15,14,20,0.98)"
                    : "rgba(255,255,255,0.015)",
                  border: isFeatured
                    ? "1px solid rgba(117,83,255,0.30)"
                    : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "14px",
                  boxShadow: isFeatured
                    ? "0 24px 60px -16px rgba(0,0,0,0.35), 0 0 60px -20px rgba(117,83,255,0.12)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {/* Badge — floating pill */}
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 text-[10px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider"
                    style={{
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      color: "#fff",
                      boxShadow:
                        "0 4px 14px rgba(34,197,94,0.35), 0 0 0 1px rgba(34,197,94,0.3)",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Top accent line — roxo animado no featured */}
                {isFeatured && (
                  <div
                    className="h-[2px] w-full rounded-t-[14px] overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="h-full w-1/2"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #7553ff, #8f6fff, transparent)",
                        animation: "pricingSheen 4s ease-in-out infinite",
                      }}
                    />
                  </div>
                )}

                <div
                  className={`p-6 md:p-7 flex flex-col flex-1 ${
                    isFeatured ? "pt-8 md:pt-9" : ""
                  }`}
                >
                  {/* Plan name */}
                  <p
                    className="font-display font-semibold text-[11px] uppercase tracking-[.14em] mb-5"
                    style={{
                      color: isFeatured
                        ? "#8f6fff"
                        : "rgba(255,255,255,0.30)",
                    }}
                  >
                    {plan.name}
                  </p>

                  {/* Price */}
                  <div className="mb-1.5">
                    {plan.originalPrice && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[13px] text-white/30 line-through">
                          {plan.originalPrice}/mês
                        </span>
                      </div>
                    )}
                    <span
                      className="font-display font-bold"
                      style={{
                        fontSize: "46px",
                        color: "#fafafa",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {plan.price}
                    </span>
                    {plan.decimal && (
                      <span
                        className="font-display font-bold text-[20px]"
                        style={{ color: "rgba(250,250,250,0.35)" }}
                      >
                        {plan.decimal}
                      </span>
                    )}
                    <span className="text-[13px] ml-1.5 text-white/30">
                      {plan.period}
                    </span>
                  </div>

                  {/* Savings callout — só no anual */}
                  {plan.savings && (
                    <div
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-md mb-4 self-start"
                      style={{
                        background: "rgba(34,197,94,0.10)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        color: "#6ee7b7",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {plan.savings}
                    </div>
                  )}

                  <p className="text-[13px] mb-6 text-white/40 leading-relaxed">
                    {plan.desc}
                  </p>

                  {/* Divider */}
                  <div
                    className="mb-6"
                    style={{
                      height: "1px",
                      background: isFeatured
                        ? "rgba(117,83,255,0.12)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  />

                  {/* Features */}
                  <ul className="flex flex-col gap-3 mb-8">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-[13px] leading-snug"
                        style={{ color: "rgba(224,224,224,0.90)" }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="flex-shrink-0 mt-0.5"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke={isFeatured ? "#8f6fff" : "rgba(255,255,255,0.35)"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto">
                    <button
                      onClick={openForm}
                      className="w-full flex items-center justify-center gap-2 text-[14px] font-semibold py-3.5 rounded-xl transition-all duration-300 text-white"
                      style={
                        isFeatured
                          ? {
                              background:
                                "linear-gradient(135deg, #6644f2, #5129f0)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              boxShadow:
                                "0 6px 20px -6px rgba(102,68,242,0.45)",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.10)",
                            }
                      }
                    >
                      {plan.cta}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Social proof + footer */}
        <div className="text-center mt-10 space-y-2 fade-up" style={{ transitionDelay: "300ms" }}>
          <p className="text-[13px] text-white/50">
            Mais de <span className="text-white/80 font-semibold">800 devs</span> já simplificaram sua contabilidade
          </p>
          <p className="text-[11px] text-white/25">
            Sem fidelidade · Sem multa · Cancele quando quiser
          </p>
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes pricingSheen {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(300%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes pricingOrb1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-60px, 40px) scale(1.15); }
        }
        @keyframes pricingOrb2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, -30px) scale(1.1); }
        }
      `}</style>
    </section>
  );
}
