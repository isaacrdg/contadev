"use client";
import { useEffect, useRef } from "react";
import { useFormModal } from "@/components/FormContext";

const CTA_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

const stats = [
  { value: "50.8%", label: "Economia em impostos" },
  { value: "3 min", label: "Até o especialista" },
  { value: "R$ 0", label: "Pra começar" },
];

export default function ConsultoriaCTA_V4() {
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
          Versão 4 — Fullcover + Overlay Gradiente
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-0">
        <div
          className="relative overflow-hidden"
          style={{ borderRadius: "24px", minHeight: "480px" }}
        >
          {/* Image — full background */}
          <img
            src={CTA_IMAGE}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
            style={{
              filter: "contrast(1.05) brightness(0.95) saturate(0.3)",
            }}
          />

          {/* Overlay gradient — strong left, fading right to reveal image */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, rgba(232,230,239,0.97) 0%, rgba(232,230,239,0.92) 35%, rgba(232,230,239,0.6) 55%, rgba(232,230,239,0.15) 75%, transparent 100%)",
            }}
          />

          {/* Mobile overlay */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(232,230,239,0.95) 0%, rgba(232,230,239,0.85) 60%, rgba(232,230,239,0.4) 100%)",
            }}
          />

          {/* Accent line top */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] z-10"
            style={{
              background:
                "linear-gradient(90deg, #6644f2 0%, #7553ff 30%, transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center min-h-[480px] py-12 md:py-16 px-8 md:px-14 md:max-w-[58%]">
            {/* Badge */}
            <div className="fade-up mb-6">
              <span
                className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] px-4 py-2 rounded-full"
                style={{
                  background: "rgba(117,83,255,0.10)",
                  border: "1px solid rgba(117,83,255,0.20)",
                  color: "#6644f2",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: "#34d399",
                    boxShadow: "0 0 8px rgba(52,211,153,0.5)",
                  }}
                />
                Consultoria gratuita
              </span>
            </div>

            {/* Headline */}
            <div className="fade-up" style={{ transitionDelay: "80ms" }}>
              <h2
                className="font-display font-bold text-[32px] md:text-[48px] leading-[1.05] tracking-tight text-[#1a1a2e] mb-4"
                style={{ letterSpacing: "-.4px" }}
              >
                Seu cenário fiscal
                <br />
                merece{" "}
                <span
                  style={{
                    background: "linear-gradient(180deg, #3c0dff, #7553ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  atenção real.
                </span>
              </h2>
              <p className="text-[15px] md:text-[16px] text-[#4a4860] max-w-[400px] leading-relaxed">
                Um especialista analisa tudo, monta a estratégia e te acompanha
                do zero. Sem custo, sem compromisso.
              </p>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-0 mt-8 mb-8 fade-up"
              style={{ transitionDelay: "160ms" }}
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center">
                  <div
                    className="pr-5 md:pr-7"
                    style={{ paddingLeft: i > 0 ? undefined : 0 }}
                  >
                    <div
                      className="font-display font-bold text-[24px] md:text-[30px] leading-none"
                      style={{
                        background:
                          "linear-gradient(180deg, #1a1a2e 20%, rgba(26,26,46,0.65))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-[#7a778c] mt-1.5 uppercase tracking-[.08em] font-medium">
                      {stat.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div
                      className="w-[1px] h-[36px] flex-shrink-0 mr-5 md:mr-7"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent, rgba(0,0,0,0.12), transparent)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="fade-up" style={{ transitionDelay: "240ms" }}>
              <div className="relative inline-block">
                <div
                  className="absolute -inset-3 rounded-full pointer-events-none"
                  style={{
                    background: "rgba(117,83,255,0.20)",
                    filter: "blur(20px)",
                    animation: "ctaPulse 3s ease-in-out infinite",
                  }}
                />
                <button
                  onClick={openForm}
                  className="relative inline-flex items-center gap-2.5 text-[14px] font-semibold rounded-full px-9 py-4 transition-all duration-300 cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, #6644f2, #5129f0)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    boxShadow:
                      "0 4px 25px rgba(117,83,255,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 40px rgba(117,83,255,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 25px rgba(117,83,255,0.35), inset 0 1px 0 rgba(255,255,255,0.10)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <span
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                      }}
                    />
                  </span>
                  <span className="relative">FALE COM UM ESPECIALISTA</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative"
                    style={{ animation: "ctaArrow 1.8s ease-in-out infinite" }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              <p className="text-[11px] text-[#8a879a] mt-3.5">
                Sem compromisso · Resultado em 48h
              </p>
            </div>
          </div>

          {/* Floating card — bottom right over image */}
          <div
            className="absolute bottom-5 right-5 z-20 px-4 py-3 rounded-xl hidden md:flex items-center gap-2.5"
            style={{
              background: "rgba(19,34,51,0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: "#34d399",
                boxShadow: "0 0 8px rgba(52,211,153,0.5)",
              }}
            />
            <div className="text-[11px] text-white/70 font-medium">
              Especialistas online agora
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
