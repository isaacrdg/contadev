"use client";
import { useEffect, useRef } from "react";
import SectionDivider from "@/components/SectionDivider";
import { useFormModal } from "@/components/FormContext";

const CTA_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

const stats = [
  { value: "50.8%", label: "Economia média" },
  { value: "3 min", label: "Até o especialista" },
  { value: "2.400+", label: "Devs atendidos" },
];

const checks = [
  "Consultoria gratuita com especialista real",
  "Economia média de 50.8% em impostos",
  "Abertura de CNPJ sem custo",
  "100% online, do primeiro contato ao CNPJ",
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
        <div
          className="relative overflow-hidden"
          style={{ borderRadius: "24px", minHeight: "520px" }}
        >
          <img
            src={CTA_IMAGE}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[center_15%] hidden md:block"
          />

          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(25,25,25,0.10) 0%, rgba(25,25,25,0.25) 30%, rgba(25,25,25,0.70) 60%, rgba(25,25,25,0.92) 85%, rgba(25,25,25,0.97) 100%)",
            }}
          />

          <div
            className="absolute inset-0 hidden md:block pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(117,83,255,0.12) 0%, transparent 60%)",
            }}
          />

          <div
            className="absolute top-0 left-0 right-0 h-[2px] z-10 hidden md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, #7553ff, transparent)",
            }}
          />

          <div className="relative z-10 hidden md:flex flex-col justify-end min-h-[520px] px-8 md:px-12 pb-10 md:pb-14 pt-16">
            <div
              className="fade-up inline-flex items-center gap-0 self-start mb-7 px-5 py-3.5 rounded-2xl"
              style={{
                background: "rgba(25,25,25,0.55)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center">
                  <div className={i > 0 ? "pl-5 md:pl-6" : ""}>
                    <div className="font-display font-bold text-[18px] md:text-[22px] leading-none text-white">
                      {stat.value}
                    </div>
                    <div className="text-[9px] md:text-[10px] text-white/40 mt-1 uppercase tracking-[.08em] font-medium">
                      {stat.label}
                    </div>
                  </div>
                  {i < stats.length - 1 && (
                    <div
                      className="w-[1px] h-[28px] flex-shrink-0 ml-5 md:ml-6"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="fade-up" style={{ transitionDelay: "80ms" }}>
              <h2
                className="font-display font-bold text-[30px] md:text-[50px] leading-[1.05] tracking-tight text-white mb-3"
                style={{ letterSpacing: "-.4px" }}
              >
                Fale com quem entende
                <br />
                <span className="gradient-text">o seu cenário.</span>
              </h2>
              <p className="text-[14px] md:text-[15px] text-white/50 max-w-[440px] leading-relaxed">
                Um especialista analisa sua situação fiscal, monta a melhor
                estratégia e te acompanha do zero. Sem custo pra começar.
              </p>
            </div>

            <div
              className="fade-up flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8"
              style={{ transitionDelay: "180ms" }}
            >
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

              <span className="text-[12px] text-white/30 font-medium">
                Sem compromisso - Sem custo - Resultado em 48h
              </span>
            </div>
          </div>

          <div
            className="relative md:hidden overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "#1c1c1c",
              borderRadius: "24px",
            }}
          >
            <div className="relative h-[220px]">
              <img
                src={CTA_IMAGE}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[center_12%]"
                style={{ filter: "brightness(0.90) contrast(1.05)" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(28,28,28,0.65) 0%, rgba(28,28,28,0.10) 55%, rgba(28,28,28,0.85) 100%)",
                }}
              />

              <div
                className="absolute bottom-4 left-4 right-4 z-20 px-4 py-3 rounded-2xl fade-up"
                style={{
                  background: "rgba(28,28,28,0.78)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transitionDelay: "120ms",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display font-bold text-[20px] leading-none text-white">
                      50.8%
                    </div>
                    <div className="text-[9px] text-white/35 mt-1 uppercase tracking-[.08em] font-medium">
                      Economia média
                    </div>
                  </div>
                  <div
                    className="w-[1px] h-[26px]"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(255,255,255,0.10), transparent)",
                    }}
                  />
                  <div>
                    <div className="font-display font-bold text-[20px] leading-none text-white">
                      3 min
                    </div>
                    <div className="text-[9px] text-white/35 mt-1 uppercase tracking-[.08em] font-medium">
                      Até o especialista
                    </div>
                  </div>
                  <div
                    className="w-[1px] h-[26px]"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(255,255,255,0.10), transparent)",
                    }}
                  />
                  <div>
                    <div className="font-display font-bold text-[20px] leading-none text-white">
                      2.4k+
                    </div>
                    <div className="text-[9px] text-white/35 mt-1 uppercase tracking-[.08em] font-medium">
                      Devs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pt-6 pb-7">
              <div className="fade-up mb-4">
                <span
                  className="inline-block text-[10px] font-semibold uppercase tracking-[.10em] px-3.5 py-1.5 rounded-full"
                  style={{
                    background: "rgba(117,83,255,0.10)",
                    border: "1px solid rgba(117,83,255,0.18)",
                    color: "#8f6fff",
                  }}
                >
                  Consultoria gratuita
                </span>
              </div>

              <div className="fade-up" style={{ transitionDelay: "60ms" }}>
                <h2
                  className="font-display font-bold text-[27px] leading-[1.08] tracking-tight text-white mb-3"
                  style={{ letterSpacing: "-.3px" }}
                >
                  Fale com quem entende{" "}
                  <span className="gradient-text">o seu cenário.</span>
                </h2>
                <p className="text-[13px] text-white/45 leading-relaxed mb-5">
                  Um especialista analisa sua situação fiscal, monta a melhor
                  estratégia e te acompanha do zero.
                </p>
              </div>

              <div
                className="fade-up flex flex-col gap-2.5 mb-6"
                style={{ transitionDelay: "120ms" }}
              >
                {checks.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="flex-shrink-0 mt-[2px]"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="rgba(117,83,255,0.12)"
                        stroke="rgba(117,83,255,0.30)"
                        strokeWidth="1"
                      />
                      <path
                        d="M8 12.5l2.5 2.5 5-5"
                        stroke="#7553ff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[12px] text-white/60 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="fade-up" style={{ transitionDelay: "180ms" }}>
                <button onClick={openForm} className="btn-primary w-full justify-center">
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
                <p className="text-[11px] text-white/25 mt-3">
                  Sem compromisso - Sem custo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
