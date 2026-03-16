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
    cta: "Começar agora",
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
    cta: "Começar agora",
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
    cta: "Falar com um especialista",
    featured: false,
  },
];

const CheckIcon = () => (
  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ background: "rgba(124,58,237,0.15)", border: "1.5px solid rgba(124,58,237,0.40)" }}>
    <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
      <path d="M1 2.5l1.5 1.5 3.5-3.5" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <section id="precos" ref={ref} className="relative py-16 px-6 md:px-12 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #08080E 0%, #0F0F1A 100%)" }}>
      <div className="grid-bg" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header + toggle */}
        <div className="mb-10 fade-up">
          <span className="section-label">Planos</span>
          <h2 className="font-display font-extrabold text-4xl md:text-[38px] leading-[1.15] tracking-tight text-[#F4F4F8]" style={{ letterSpacing: "-.3px" }}>
            Qual é o seu{" "}
            <em className="not-italic gradient-text">cenário?</em>
          </h2>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className="fade-up rounded-[20px] p-7 relative transition-all duration-200 hover:-translate-y-[4px]"
              style={{
                transitionDelay: `${i * 80}ms`,
                background: plan.featured
                  ? "linear-gradient(160deg, rgba(124,58,237,0.09), #141420)"
                  : "#141420",
                border: plan.featured
                  ? "1px solid rgba(124,58,237,0.45)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[11px] font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <p className="font-display font-extrabold text-[12px] text-[#6B7280] uppercase tracking-[.08em] mb-2">{plan.name}</p>
              <p className="font-display font-extrabold text-[38px] text-[#F4F4F8] leading-none mb-1">
                {plan.price}
                <span className="text-[15px] font-normal text-[#9CA3AF] ml-1">{plan.period}</span>
              </p>
              <p className="text-[13px] text-[#6B7280] mb-7 leading-[1.5]">{plan.desc}</p>

              <ul className="flex flex-col gap-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#9CA3AF]">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contato"
                className={plan.featured ? "btn-primary w-full text-center text-[14px]" : "btn-outline w-full text-center text-[14px]"}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-[13px] text-[#6B7280] mt-8 fade-up" style={{ transitionDelay: "240ms" }}>
          Sem fidelidade · Sem multa · Cancele com 30 dias de aviso
        </p>
      </div>
    </section>
  );
}
