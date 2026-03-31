"use client";
import { useEffect, useRef } from "react";
import { useFormModal } from "@/components/FormContext";

const CTA_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

const checks = [
  "Consultoria gratuita com especialista real",
  "Economia média de 50.8% em impostos",
  "Abertura de CNPJ sem custo",
  "100% online, do primeiro contato ao CNPJ",
];

export default function ConsultoriaCTA_V8() {
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
          Versão 8 — Duas Colunas Clara + Badge Flutuante
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-0">
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "24px",
            background: "#e8e6ef",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">
            {/* Left — Content */}
            <div className="relative z-10 flex flex-col justify-center px-8 md:px-12 py-12 md:py-16">
              {/* Tag */}
              <div className="fade-up mb-6">
                <span
                  className="inline-block text-[11px] font-semibold uppercase tracking-[.10em] px-4 py-2 rounded-full"
                  style={{
                    background: "rgba(117,83,255,0.08)",
                    border: "1px solid rgba(117,83,255,0.18)",
                    color: "#6644f2",
                  }}
                >
                  Consultoria gratuita
                </span>
              </div>

              {/* Headline */}
              <div className="fade-up" style={{ transitionDelay: "60ms" }}>
                <h2
                  className="font-display font-bold text-[28px] md:text-[42px] leading-[1.08] tracking-tight text-[#1a1a2e] mb-4"
                  style={{ letterSpacing: "-.4px" }}
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
                <p className="text-[14px] md:text-[15px] text-[#5a5770] max-w-[400px] leading-relaxed mb-7">
                  Um especialista analisa sua situação fiscal, monta a melhor
                  estratégia e te acompanha do zero.
                </p>
              </div>

              {/* Checklist */}
              <div
                className="fade-up flex flex-col gap-3 mb-8"
                style={{ transitionDelay: "120ms" }}
              >
                {checks.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="flex-shrink-0 mt-[2px]"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="rgba(117,83,255,0.10)"
                        stroke="rgba(117,83,255,0.25)"
                        strokeWidth="1"
                      />
                      <path
                        d="M8 12.5l2.5 2.5 5-5"
                        stroke="#6644f2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[13px] text-[#4a4860] leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="fade-up" style={{ transitionDelay: "180ms" }}>
                <button
                  onClick={openForm}
                  className="inline-flex items-center gap-2 text-[14px] font-semibold rounded-full px-8 py-3.5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #6644f2, #5129f0)",
                    border: "1px solid rgba(117,83,255,0.5)",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(117,83,255,0.30)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(117,83,255,0.45)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(117,83,255,0.30)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <span
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
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
                <p className="text-[11px] text-[#8a879a] mt-3">
                  Sem compromisso · Sem custo
                </p>
              </div>
            </div>

            {/* Right — Image + floating badges */}
            <div className="relative min-h-[320px] md:min-h-0">
              {/* Photo */}
              <img
                src={CTA_IMAGE}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
                style={{ filter: "brightness(0.95) contrast(1.05)" }}
              />

              {/* Left edge fade into light bg */}
              <div
                className="absolute inset-0 hidden md:block"
                style={{
                  background:
                    "linear-gradient(90deg, #e8e6ef 0%, rgba(232,230,239,0.4) 25%, transparent 50%)",
                }}
              />

              {/* Top fade on mobile */}
              <div
                className="absolute inset-0 md:hidden"
                style={{
                  background:
                    "linear-gradient(180deg, #e8e6ef 0%, transparent 30%)",
                }}
              />

              {/* Floating stats badge — overlapping left edge */}
              <div
                className="absolute bottom-8 -left-4 md:bottom-10 md:-left-6 z-20 px-5 py-4 rounded-2xl fade-up"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  transitionDelay: "250ms",
                }}
              >
                <div className="flex items-center gap-5">
                  <div>
                    <div
                      className="font-display font-bold text-[24px] leading-none"
                      style={{
                        background:
                          "linear-gradient(180deg, #1a1a2e 20%, rgba(26,26,46,0.7))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      50.8%
                    </div>
                    <div className="text-[10px] text-[#8a879a] mt-1 uppercase tracking-[.08em] font-medium">
                      Economia média
                    </div>
                  </div>
                  <div
                    className="w-[1px] h-[32px]"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(0,0,0,0.08), transparent)",
                    }}
                  />
                  <div>
                    <div
                      className="font-display font-bold text-[24px] leading-none"
                      style={{
                        background:
                          "linear-gradient(180deg, #1a1a2e 20%, rgba(26,26,46,0.7))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      3 min
                    </div>
                    <div className="text-[10px] text-[#8a879a] mt-1 uppercase tracking-[.08em] font-medium">
                      Até o especialista
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating top-right micro badge */}
              <div
                className="absolute top-6 right-6 z-20 px-4 py-2.5 rounded-xl fade-up hidden md:block"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                  transitionDelay: "300ms",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, ${
                            ["#6644f2", "#5129f0", "#7553ff"][i]
                          }, ${["#5129f0", "#3d1fef", "#6644f2"][i]})`,
                          border: "2px solid rgba(255,255,255,0.85)",
                        }}
                      >
                        {["G", "R", "M"][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[11px] text-[#1a1a2e] font-medium leading-tight">
                      2.400+ devs
                    </div>
                    <div className="text-[10px] text-[#8a879a]">
                      já economizam
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
