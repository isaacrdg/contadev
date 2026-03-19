"use client";
import { useEffect, useRef, useState } from "react";
import SectionDivider from "@/components/SectionDivider";

const benefits = [
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Consultoria gratuita",
    desc: "Análise completa do seu cenário fiscal sem custo. Sem pegadinhas.",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Resposta em minutos",
    desc: "Especialista real te atende por WhatsApp. Sem fila, sem robô.",
  },
  {
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    title: "100% online",
    desc: "Do primeiro contato à abertura do CNPJ. Tudo digital, de onde você estiver.",
  },
  {
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    title: "Economia real",
    desc: "Nossos clientes economizam em média 50.8% em impostos. Dados reais.",
  },
];

const steps = [
  { num: "01", label: "Consultoria gratuita", detail: "Analisamos seu cenário completo" },
  { num: "02", label: "Plano personalizado", detail: "Montamos a melhor estratégia pra você" },
  { num: "03", label: "Execução imediata", detail: "Abertura, migração ou otimização em dias" },
];

export default function ConsultoriaCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

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
      id="precos"
      ref={ref}
      className="relative px-5 md:px-6"
    >
      <SectionDivider cross="right" />

      <div
        className="relative max-w-[1100px] mx-auto my-8 md:my-12 rounded-2xl overflow-hidden"
        style={{ background: "#e8e6ef" }}
      >
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none" style={{
          background: "radial-gradient(circle at 80% 10%, rgba(117,83,255,0.12) 0%, transparent 60%)",
          filter: "blur(60px)",
        }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none" style={{
          background: "radial-gradient(circle at 20% 90%, rgba(90,61,230,0.08) 0%, transparent 60%)",
          filter: "blur(40px)",
        }} />

        <div className="relative p-8 md:p-12">

          {/* Header */}
          <div className="text-center mb-10 fade-up">
            <h2
              className="font-display font-bold text-4xl md:text-[44px] leading-[1.1] tracking-tight text-[#1a1a2e] mb-4"
              style={{ letterSpacing: "-.4px" }}
            >
              Cada dev tem um cenário.{" "}
              <br className="hidden md:block" />
              <em className="not-italic" style={{ background: "linear-gradient(135deg, #6644f2, #7553ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>O seu merece atenção.</em>
            </h2>
            <p className="text-[15px] text-[#4a4860] max-w-[520px] mx-auto leading-relaxed">
              Antes de falar em planos, a gente entende o que você precisa.
              Consultoria gratuita, sem compromisso.
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 fade-up" style={{ transitionDelay: "100ms" }}>
            {benefits.map((b, i) => (
              <div
                key={i}
                className="group relative rounded-xl p-5 transition-all duration-500"
                style={{
                  background: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.borderColor = "rgba(117,83,255,0.20)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(117,83,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(117,83,255,0.10)",
                      border: "1px solid rgba(117,83,255,0.15)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6644f2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={b.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#1a1a2e] mb-1">{b.title}</h3>
                    <p className="text-[12px] text-[#5a5770] leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-5 mb-8 fade-up" style={{ transitionDelay: "200ms" }}>
            {steps.map((s, i) => (
              <div
                key={i}
                className="flex-1 rounded-xl p-4 transition-all duration-400 cursor-default"
                style={{
                  background: hoveredStep === i ? "rgba(117,83,255,0.08)" : "rgba(255,255,255,0.4)",
                  border: hoveredStep === i ? "1px solid rgba(117,83,255,0.25)" : "1px solid rgba(0,0,0,0.05)",
                }}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <span
                  className="text-[11px] font-bold tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, #6644f2, #7553ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.num}
                </span>
                <h4 className="text-[14px] font-semibold text-[#1a1a2e] mt-1.5 mb-1">{s.label}</h4>
                <p className="text-[11px] text-[#6b6880] leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center fade-up" style={{ transitionDelay: "300ms" }}>
            <p className="text-[13px] text-[#6b6880] mb-4">
              Sem compromisso · Sem custo · Resultado em 48h
            </p>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-[14px] font-semibold rounded-full px-8 py-3.5 transition-all duration-300 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7553ff, #5a3de6)",
                border: "1px solid rgba(117,83,255,0.5)",
                color: "#fff",
                boxShadow: "0 4px 25px rgba(117,83,255,0.3), 0 0 60px rgba(117,83,255,0.10)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 35px rgba(117,83,255,0.5), 0 0 80px rgba(117,83,255,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 25px rgba(117,83,255,0.3), 0 0 60px rgba(117,83,255,0.10)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              AGENDAR CONSULTORIA GRATUITA
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
