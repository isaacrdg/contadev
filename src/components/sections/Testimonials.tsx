"use client";
import { useEffect, useRef } from "react";

const tweets = [
  {
    initials: "RB",
    name: "Rafael Brito",
    handle: "@rafaelbrito_dev",
    color: "#7553ff",
    body: "migrei pra ContaDev há 6 meses e economizei mais de 12k em imposto. absurdo como eu tava pagando a mais antes disso. atendimento é outro nível",
    role: "Senior Dev @ Nubank",
  },
  {
    initials: "AC",
    name: "Ana Clara",
    handle: "@anac_fullstack",
    color: "#0E7490",
    body: "finalmente uma contabilidade que entende de tech lol. invoice em inglês, NF automática, suporte que responde rápido. não troco por nada",
    role: "Freelancer Full Stack",
  },
  {
    initials: "GM",
    name: "Gabriel Mendes",
    handle: "@gabrielmendes_s",
    color: "#9D174D",
    body: "abri minha PJ em menos de 24h aqui. processo todo digital e o suporte respondeu cada dúvida na hora. recomendo demais",
    role: "Dev @ Toptal",
  },
  {
    initials: "LS",
    name: "Lucas Silva",
    handle: "@lucasdev_br",
    color: "#065F46",
    body: "o dashboard é insano. faturamento, impostos, notas em tempo real. parece mais um SaaS do que contabilidade kkk",
    role: "Backend Dev @ iFood",
  },
  {
    initials: "JP",
    name: "Julia Pereira",
    handle: "@juliapereiro_ux",
    color: "#92400E",
    body: "trabalho pra clientes nos EUA e invoice sempre foi um caos. ContaDev resolveu isso de forma simples e profissional. 10/10",
    role: "UX Designer Freelancer",
  },
  {
    initials: "MR",
    name: "Marcos Rocha",
    handle: "@marcosrocha_dev",
    color: "#1E40AF",
    body: "reduzi minha alíquota e faz 1 ano sem nenhum problema. simplesmente top",
    role: "Tech Lead @ Creditas",
  },
];

const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Testimonials() {
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
    <section id="depoimentos" ref={ref} className="relative py-10 md:py-14 px-6 overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-up">
          <span className="section-label" style={{ display: "inline-block" }}>Depoimentos</span>
          <h2 className="font-display font-extrabold text-4xl md:text-[38px] leading-[1.15] tracking-tight text-[#fafafa] mb-4" style={{ letterSpacing: "-.3px" }}>
            O que os devs{" "}
            <em className="not-italic gradient-text">estão falando</em>
          </h2>
          <p className="text-[15px] text-[#e0e0e0]">+500 devs já confiam na ContaDev.</p>
        </div>

        {/* Tweet grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tweets.map((t, i) => (
            <div
              key={t.handle}
              className="fade-up glass-card p-6 transition-all duration-200 hover:border-[rgba(117,83,255,0.28)] hover:-translate-y-[2px]"
              style={{
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-[13px] text-white flex-shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[13px] text-[#fafafa] truncate">{t.name}</p>
                  <p className="text-[11px] text-white/35 truncate">{t.handle}</p>
                </div>
                <div className="text-white/25 flex-shrink-0">
                  <XIcon />
                </div>
              </div>

              {/* Body */}
              <p className="text-[13px] leading-[1.65] text-[#e0e0e0] mb-3">
                {t.body}
              </p>
              <p className="text-[11px] text-[#8f6fff] font-medium">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
