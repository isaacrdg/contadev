"use client";
import { useEffect, useRef } from "react";
import { useFormModal } from "@/components/FormContext";

const CTA_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

export default function ConsultoriaCTA_V6() {
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
    <section ref={ref} className="relative">
      {/* Version label */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-0 mb-4 mt-16">
        <span
          className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-full"
          style={{ background: "rgba(117,83,255,0.15)", color: "#7553ff" }}
        >
          Versão 6 — Fullcover Centralizada Clean
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-0">
        <div
          className="relative overflow-hidden"
          style={{ borderRadius: "24px", minHeight: "520px" }}
        >
          {/* Image — full, brighter */}
          <img
            src={CTA_IMAGE}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
            style={{ filter: "brightness(0.88) contrast(1.05)" }}
          />

          {/* Vignette — stronger at center for text readability, lighter at edges for photo */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at center 48%, rgba(25,25,25,0.55) 0%, rgba(25,25,25,0.35) 55%, rgba(25,25,25,0.55) 100%)",
            }}
          />

          {/* Content — centered */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[520px] px-8 md:px-12 py-16">
            {/* Headline */}
            <div className="fade-up">
              <h2
                className="font-display font-bold text-[32px] md:text-[52px] leading-[1.05] tracking-tight text-white mb-4"
                style={{
                  letterSpacing: "-.5px",
                  textShadow: "0 2px 30px rgba(0,0,0,0.50), 0 1px 6px rgba(0,0,0,0.30)",
                }}
              >
                Fale com quem entende
                <br />
                <span className="gradient-text">o seu cenário.</span>
              </h2>
              <p
                className="text-[14px] md:text-[16px] text-white/75 max-w-[460px] mx-auto leading-relaxed"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.40)" }}
              >
                Um especialista analisa sua situação fiscal, monta a melhor
                estratégia e te acompanha do zero.
              </p>
            </div>

            {/* CTA */}
            <div className="fade-up mt-9" style={{ transitionDelay: "120ms" }}>
              <button onClick={openForm} className="btn-primary">
                FALE COM UM ESPECIALISTA
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "ctaArrow 1.8s ease-in-out infinite" }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <p
                className="text-[11px] text-white/45 mt-3.5"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.30)" }}
              >
                Sem compromisso · Sem custo · Resultado em 48h
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
