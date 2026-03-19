"use client";
import { useEffect, useRef } from "react";
import SectionDivider from "@/components/SectionDivider";

export default function ConsultoriaCTA() {
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
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] pointer-events-none" style={{
          background: "radial-gradient(circle at 80% 10%, rgba(117,83,255,0.10) 0%, transparent 60%)",
          filter: "blur(50px)",
        }} />

        <div className="relative py-12 md:py-16 px-8 md:px-12 text-center">

          {/* Headline */}
          <div className="fade-up">
            <h2
              className="font-display font-bold text-3xl md:text-[40px] leading-[1.12] tracking-tight text-[#1a1a2e] mb-3"
              style={{ letterSpacing: "-.3px" }}
            >
              Fale com quem entende{" "}
              <em className="not-italic" style={{ background: "linear-gradient(135deg, #6644f2, #7553ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                o seu cenário.
              </em>
            </h2>
            <p className="text-[14px] text-[#5a5770] max-w-[440px] mx-auto leading-relaxed mb-6">
              Um especialista analisa sua situação fiscal, monta a melhor estratégia
              e te acompanha do zero. Sem custo pra começar.
            </p>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8 fade-up" style={{ transitionDelay: "100ms" }}>
            {["Consultoria gratuita", "Resposta em minutos", "100% online", "50.8% de economia média"].map((pill) => (
              <span
                key={pill}
                className="text-[12px] font-medium px-4 py-2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  color: "#3a3650",
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="fade-up" style={{ transitionDelay: "200ms" }}>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-[14px] font-semibold rounded-full px-8 py-3.5 transition-all duration-300 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7553ff, #5a3de6)",
                border: "1px solid rgba(117,83,255,0.5)",
                color: "#fff",
                boxShadow: "0 4px 25px rgba(117,83,255,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 35px rgba(117,83,255,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 25px rgba(117,83,255,0.3)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              FALE COM UM ESPECIALISTA
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <p className="text-[11px] text-[#8a879a] mt-3">
              Sem compromisso · Sem custo · Resultado em 48h
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
