"use client";
import { useEffect, useRef } from "react";
import SectionDivider from "@/components/SectionDivider";

const plans = [
  {
    name: "Brasil",
    price: "R$249",
    cents: ",99",
    period: "/mês",
    desc: "Para quem fatura em reais",
    features: [
      "Abertura de empresa",
      "Emissão de notas fiscais",
      "Declarações mensais",
      "Suporte via WhatsApp",
      "Acesso à plataforma",
    ],
    featured: false,
    cta: "Começar agora",
  },
  {
    name: "Internacional",
    price: "R$349",
    cents: ",99",
    period: "/mês",
    desc: "Para quem recebe do exterior",
    badge: "Mais popular",
    features: [
      "Tudo do plano Brasil",
      "Invoices em inglês",
      "Planejamento tributário",
      "Declaração IRPF",
      "Contador dedicado",
      "Atendimento prioritário",
    ],
    featured: true,
    cta: "Começar agora",
  },
  {
    name: "Personalizado",
    price: "Sob consulta",
    cents: "",
    period: "",
    desc: "Para cenários mais complexos",
    features: [
      "Tudo do Internacional",
      "Gestão de pró-labore",
      "Múltiplos sócios",
      "Consultoria tributária",
      "Relatórios gerenciais",
      "SLA garantido 4h",
    ],
    featured: false,
    cta: "Falar com especialista",
  },
];

export default function Pricing() {
  const ref = useRef<HTMLDivElement>(null);

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
    <section id="precos" ref={ref} className="relative">

      <SectionDivider cross="right" />

      {/* Light block */}
      <div className="max-w-[1100px] mx-auto" style={{ background: "#f5f5f7" }}>
        <div className="max-w-[1020px] mx-auto py-12 md:py-16 px-5 md:px-6">

          {/* Header — centered */}
          <div className="text-center mb-10 fade-up">
            <h2 className="font-display font-bold text-4xl md:text-[42px] leading-[1.1] tracking-tight text-[#15191E]" style={{ letterSpacing: "-.3px" }}>
              Qual é o seu{" "}
              <em className="not-italic" style={{ background: "linear-gradient(180deg, #3c0dff, #7553ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>cenário?</em>
            </h2>
            <p className="text-[15px] text-[#60646C] mt-3 max-w-[420px] mx-auto">Escolha o plano ideal para o seu momento. Sem surpresas, sem letras miúdas.</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`fade-up relative flex flex-col transition-all duration-300 ${plan.featured ? "md:-mt-4 md:mb-[-16px]" : ""}`}
                style={{
                  transitionDelay: `${i * 80}ms`,
                  background: plan.featured ? "#15191E" : "#2a2a2f",
                  border: plan.featured ? "1px solid rgba(117,83,255,0.25)" : "1px solid rgba(0,0,0,0.04)",
                  borderRadius: "20px",
                  boxShadow: plan.featured
                    ? "0 20px 50px rgba(0,0,0,0.15), 0 0 40px rgba(117,83,255,0.06)"
                    : "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 text-white text-[10px] font-semibold px-4 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider"
                    style={{ background: "linear-gradient(135deg, #7553ff, #5a3de6)", boxShadow: "0 4px 12px rgba(117,83,255,0.3)" }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Top accent for featured */}
                {plan.featured && (
                  <div className="h-[2px] w-full rounded-t-[20px]" style={{ background: "linear-gradient(90deg, transparent, #7553ff, #8f6fff, transparent)" }} />
                )}

                <div className={`p-6 md:p-7 flex flex-col flex-1 ${plan.featured ? "pt-7 md:pt-8" : ""}`}>
                  {/* Plan name */}
                  <p className={`font-display font-semibold text-[11px] uppercase tracking-[.12em] mb-5 ${plan.featured ? "text-[#8f6fff]" : "text-white/30"}`}>
                    {plan.name}
                  </p>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="font-display font-bold" style={{ fontSize: plan.period ? "44px" : "30px", color: "#fafafa", lineHeight: 1 }}>
                      {plan.price}
                    </span>
                    {plan.cents && <span className="font-display font-bold text-[20px]" style={{ color: "rgba(250,250,250,0.4)" }}>{plan.cents}</span>}
                    {plan.period && <span className="text-[14px] ml-1 text-white/35">{plan.period}</span>}
                  </div>
                  <p className="text-[13px] mb-6 text-white/40">{plan.desc}</p>

                  {/* Divider */}
                  <div className="mb-6" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

                  {/* Features */}
                  <ul className="flex flex-col gap-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#e0e0e0]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                          <path d="M20 6L9 17l-5-5" stroke="#8f6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto">
                    <a
                      href="#contato"
                      className="w-full flex items-center justify-center text-[14px] font-semibold py-3.5 rounded-xl transition-all duration-200 text-white hover:-translate-y-[2px]"
                      style={plan.featured
                        ? { background: "linear-gradient(135deg, #7553ff, #5a3de6)", boxShadow: "0 4px 15px rgba(117,83,255,0.3)" }
                        : { background: "transparent", border: "1px solid rgba(255,255,255,0.12)" }
                      }
                    >
                      {plan.cta}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[12px] text-[#60646C]/60 mt-8 fade-up" style={{ transitionDelay: "240ms" }}>
            Sem fidelidade · Sem multa · Cancele com 30 dias de aviso
          </p>
        </div>
      </div>
    </section>
  );
}
