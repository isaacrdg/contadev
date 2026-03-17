"use client";
import { useEffect, useRef } from "react";

const plans = [
  {
    name: "Brasil",
    price: "R$249,99",
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
  },
  {
    name: "Internacional",
    price: "R$349,99",
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
  },
  {
    name: "Personalizado",
    price: "Sob consulta",
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
  },
];

const CheckIcon = () => (
  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ background: "rgba(117,83,255,0.15)", border: "1.5px solid rgba(117,83,255,0.40)" }}>
    <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
      <path d="M1 2.5l1.5 1.5 3.5-3.5" stroke="#8f6fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

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
    <section id="precos" ref={ref} className="relative py-8 md:py-14 px-5 md:px-6 overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      <div className="relative z-10 max-w-[1100px] mx-auto">
        <div className="mb-8 fade-up">
          <span className="section-label">Planos</span>
          <h2 className="font-display font-bold text-4xl md:text-[38px] leading-[1.15] tracking-tight text-[#fafafa]" style={{ letterSpacing: "-.3px" }}>
            Qual é o seu{" "}
            <em className="not-italic gradient-text">cenário?</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`fade-up relative transition-all duration-200 hover:-translate-y-[3px] ${
                plan.featured ? "glass-card-featured" : "glass-card"
              }`}
              style={{
                transitionDelay: `${i * 80}ms`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[#8f6fff] text-[11px] font-semibold px-4 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: "#191919",
                    border: "1px solid rgba(117,83,255,0.5)",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Content */}
              <div className="p-5 md:p-7 flex flex-col flex-1">
                <p className="font-display font-bold text-[12px] text-white/35 uppercase tracking-[.08em] mb-2">{plan.name}</p>
                <p className="font-display font-bold leading-none mb-1"
                  style={{ fontSize: plan.period ? "38px" : "28px", color: "#fafafa" }}>
                  {plan.price}
                  {plan.period && <span className="text-[15px] font-normal text-[#e0e0e0] ml-1">{plan.period}</span>}
                </p>
                <p className="text-[13px] text-white/35 mb-7 leading-[1.5]">{plan.desc}</p>

                <ul className="flex flex-col gap-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#e0e0e0]">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Botão ancorado embaixo */}
                <div className="mt-auto">
                  <a
                    href="#contato"
                    className="btn-primary w-full justify-center text-[14px]"
                  >
                    FALE COM UM ESPECIALISTA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[13px] text-white/35 mt-8 fade-up" style={{ transitionDelay: "240ms" }}>
          Sem fidelidade · Sem multa · Cancele com 30 dias de aviso
        </p>
      </div>
    </section>
  );
}
