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
  },
  {
    name: "Anual",
    price: "R$199",
    decimal: ",90",
    period: "/mês",
    originalPrice: "R$249,90",
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
    <section id="precos" ref={ref} className="relative py-16 md:py-20">
      <div className="max-w-[1020px] mx-auto px-5 md:px-6">
        {/* Header */}
        <div className="text-center mb-10 fade-up">
          <h2
            className="font-display font-bold text-3xl md:text-[42px] leading-[1.1] tracking-tight text-white"
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
          <p className="text-[15px] text-white/50 mt-3 max-w-[440px] mx-auto">
            Sem surpresas, sem letras miúdas. O preço não muda com o seu
            faturamento.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`fade-up relative flex flex-col ${
                plan.featured ? "md:-mt-4 md:mb-[-16px]" : ""
              }`}
              style={{
                transitionDelay: `${i * 80}ms`,
                background: plan.featured
                  ? "rgba(21,25,30,0.95)"
                  : "rgba(255,255,255,0.02)",
                border: plan.featured
                  ? "1px solid rgba(117,83,255,0.25)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                boxShadow: plan.featured
                  ? "0 20px 50px rgba(0,0,0,0.15), 0 0 40px rgba(117,83,255,0.06)"
                  : "none",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-white text-[10px] font-semibold px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Top accent */}
              {plan.featured && (
                <div
                  className="h-[2px] w-full rounded-t-[16px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #7553ff, #8f6fff, transparent)",
                  }}
                />
              )}

              <div
                className={`p-6 md:p-7 flex flex-col flex-1 ${
                  plan.featured ? "pt-7 md:pt-8" : ""
                }`}
              >
                {/* Plan name */}
                <p
                  className={`font-display font-semibold text-[11px] uppercase tracking-[.12em] mb-5 ${
                    plan.featured ? "text-[#8f6fff]" : "text-white/30"
                  }`}
                >
                  {plan.name}
                </p>

                {/* Price */}
                <div className="mb-1">
                  {plan.originalPrice && (
                    <div className="text-[13px] text-white/35 line-through mb-1">
                      {plan.originalPrice}/mês
                    </div>
                  )}
                  <span
                    className="font-display font-bold text-[44px]"
                    style={{ color: "#fafafa", lineHeight: 1 }}
                  >
                    {plan.price}
                  </span>
                  {plan.decimal && (
                    <span
                      className="font-display font-bold text-[20px]"
                      style={{ color: "rgba(250,250,250,0.4)" }}
                    >
                      {plan.decimal}
                    </span>
                  )}
                  <span className="text-[14px] ml-1 text-white/35">
                    {plan.period}
                  </span>
                </div>
                <p className="text-[13px] mb-6 text-white/40">{plan.desc}</p>

                {/* Divider */}
                <div
                  className="mb-6"
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.08)",
                  }}
                />

                {/* Features */}
                <ul className="flex flex-col gap-3 mb-8">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-[13px] text-[#e0e0e0]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="flex-shrink-0"
                      >
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke={plan.featured ? "#8f6fff" : "#6ee7b7"}
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
                    className="w-full flex items-center justify-center text-[14px] font-semibold py-3.5 rounded-xl transition-all duration-200 text-white hover:-translate-y-[2px]"
                    style={
                      plan.featured
                        ? {
                            background:
                              "linear-gradient(135deg, #7553ff, #5a3de6)",
                            boxShadow:
                              "0 4px 15px rgba(117,83,255,0.3)",
                          }
                        : {
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }
                    }
                  >
                    Começar agora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p
          className="text-center text-[12px] text-white/30 mt-8 fade-up"
          style={{ transitionDelay: "240ms" }}
        >
          Sem fidelidade · Sem multa · Cancele quando quiser
        </p>
      </div>
    </section>
  );
}
