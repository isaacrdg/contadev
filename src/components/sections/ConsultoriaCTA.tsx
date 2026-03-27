"use client";
import { useEffect, useRef } from "react";
import SectionDivider from "@/components/SectionDivider";
import { useFormModal } from "@/components/FormContext";

const CTA_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

const pills = [
  "Consultoria gratuita",
  "Resposta em minutos",
  "100% online",
  "Abertura de CNPJ grátis",
];

const stats = [
  { value: "50.8%", label: "Economia média" },
  { value: "3 min", label: "Até o especialista" },
  { value: "2.400+", label: "Devs atendidos" },
];

export default function ConsultoriaCTA() {
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
    <section id="precos" ref={ref} className="relative">
      <SectionDivider cross="right" />

      <div className="max-w-[1100px] mx-auto px-4 md:px-0">
        {/* Card */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "24px",
            background: "#e8e6ef",
          }}
        >
          {/* Background image — absolute, right-aligned */}
          <div className="absolute inset-0 hidden md:block">
            <img
              src={CTA_IMAGE}
              alt=""
              className="absolute right-0 top-0 h-full w-[50%] object-cover object-[center_top]"
              style={{
                filter: "grayscale(100%) contrast(1.05) brightness(0.95)",
                maskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
                WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 35%)",
              }}
            />
          </div>

          {/* Floating card — over image */}
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
              style={{ background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.5)" }}
            />
            <div className="text-[11px] text-white/70 font-medium">
              Especialistas online agora
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 py-10 md:py-14 px-7 md:px-12 md:max-w-[55%]">
            {/* Pills */}
            <div className="flex flex-wrap gap-2 mb-7 fade-up">
              {pills.map((pill) => (
                <span
                  key={pill}
                  className="text-[11px] font-medium px-3.5 py-1.5 rounded-full"
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

            {/* Headline */}
            <div className="fade-up" style={{ transitionDelay: "80ms" }}>
              <h2
                className="font-display font-bold text-[28px] md:text-[40px] leading-[1.10] tracking-tight text-[#1a1a2e] mb-3"
                style={{ letterSpacing: "-.3px" }}
              >
                Fale com quem entende{" "}
                <span
                  style={{
                    background: "linear-gradient(180deg, #3c0dff, #7553ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  o seu cenário.
                </span>
              </h2>
              <p className="text-[14px] md:text-[15px] text-[#5a5770] max-w-[420px] leading-relaxed">
                Um especialista analisa sua situação fiscal, monta a melhor estratégia
                e te acompanha do zero. Sem custo pra começar.
              </p>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-0 mt-8 mb-8 fade-up"
              style={{ transitionDelay: "160ms" }}
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center">
                  <div className="pr-5 md:pr-7" style={{ paddingLeft: i > 0 ? undefined : 0 }}>
                    <div
                      className="font-display font-bold text-[22px] md:text-[26px] leading-none"
                      style={{
                        background: "linear-gradient(180deg, #1a1a2e 20%, rgba(26,26,46,0.7))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-[#8a879a] mt-1 uppercase tracking-[.08em] font-medium">
                      {stat.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div
                      className="w-[1px] h-[32px] flex-shrink-0 mr-5 md:mr-7"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent, rgba(0,0,0,0.10), transparent)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div className="fade-up" style={{ transitionDelay: "240ms" }}>
              <div className="relative inline-block">
                {/* Glow */}
                <div
                  className="absolute -inset-3 rounded-full pointer-events-none"
                  style={{
                    background: "rgba(117,83,255,0.18)",
                    filter: "blur(20px)",
                    animation: "ctaPulse 3s ease-in-out infinite",
                  }}
                />
                <button
                  onClick={openForm}
                  className="relative inline-flex items-center gap-2.5 text-[14px] font-semibold rounded-full px-8 py-3.5 transition-all duration-300 cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, #6644f2, #5129f0)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    boxShadow:
                      "0 4px 25px rgba(117,83,255,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 40px rgba(117,83,255,0.50), inset 0 1px 0 rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 25px rgba(117,83,255,0.30), inset 0 1px 0 rgba(255,255,255,0.10)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Sheen */}
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
                Sem compromisso · Sem custo
              </p>
            </div>
          </div>


          {/* Mobile — image strip */}
          <div className="relative md:hidden h-[200px]">
            <div
              className="absolute top-0 left-0 right-0 h-[3px] z-10"
              style={{
                background: "linear-gradient(90deg, transparent, #6644f2, #7553ff, #6644f2, transparent)",
              }}
            />
            <img
              src={CTA_IMAGE}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[center_top]"
              style={{
                filter: "grayscale(100%) contrast(1.05) brightness(0.88)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(12,10,20,0.2) 0%, rgba(12,10,20,0.5) 100%)",
              }}
            />
            <div
              className="absolute bottom-4 left-4 z-10 px-3.5 py-2.5 rounded-xl flex items-center gap-2"
              style={{
                background: "rgba(19,34,51,0.65)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.5)" }}
              />
              <div className="text-[11px] text-white/70 font-medium">
                Especialistas online agora
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
