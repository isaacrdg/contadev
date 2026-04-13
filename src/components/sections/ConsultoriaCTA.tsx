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
];

export default function ConsultoriaCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
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

  /* D2: Parallax — subtle scale shift on desktop image */
  useEffect(() => {
    const section = ref.current;
    const img = imgRef.current;
    if (!section || !img) return;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const wh = window.innerHeight;
      const t = Math.max(0, Math.min(1, (wh - rect.top) / (wh + rect.height)));
      img.style.transform = `scale(${1.08 - t * 0.08})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="consultoria" ref={ref} className="relative pt-12 md:pt-20">
      {/* G1: Respiro vertical via pt acima */}
      <div className="hidden md:block">
        <SectionDivider cross="right" />
      </div>

      {/* ═══════ DESKTOP ═══════ */}
      <div
        className="relative overflow-hidden hidden md:block max-w-[1100px] mx-auto"
        style={{ minHeight: "580px" }}
      >
        {/* D2: Parallax image */}
        <img
          ref={imgRef}
          src={CTA_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_15%] will-change-transform"
          style={{ transform: "scale(1.08)" }}
        />

        {/* Overlay escuro — bottom-heavy */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(25,25,25,0.08) 0%, rgba(25,25,25,0.22) 30%, rgba(25,25,25,0.68) 58%, rgba(25,25,25,0.92) 82%, rgba(25,25,25,0.97) 100%)",
          }}
        />

        {/* Brand tint sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(117,83,255,0.12) 0%, transparent 60%)",
          }}
        />

        {/* D3: Glow roxo sutil no topo — substitui a linha dura */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] z-10"
          style={{
            background:
              "linear-gradient(90deg, transparent 10%, rgba(117,83,255,0.45) 50%, transparent 90%)",
            boxShadow:
              "0 0 20px rgba(117,83,255,0.25), 0 0 60px rgba(117,83,255,0.08)",
          }}
        />

        {/* Conteúdo — alinhado bottom, restrito em largura */}
        <div className="relative z-10 flex flex-col justify-end min-h-[580px] max-w-[1100px] mx-auto px-8 lg:px-12 pb-12 lg:pb-16 pt-16">
          {/* D4: Social proof badge — top right */}
          <div
            className="absolute top-8 right-8 lg:right-12 px-5 py-3 rounded-2xl fade-up"
            style={{
              background: "rgba(25,25,25,0.55)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.30)",
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
                      background: `linear-gradient(135deg, ${["#6644f2", "#5129f0", "#7553ff"][i]}, ${["#5129f0", "#3d1fef", "#6644f2"][i]})`,
                      border: "2px solid rgba(25,25,25,0.55)",
                    }}
                  >
                    {["G", "R", "M"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] text-white/70 font-medium leading-tight">
                  2.400+ devs
                </div>
                <div className="text-[10px] text-white/30">já economizam</div>
              </div>
            </div>
          </div>
          {/* Glass stats bar */}
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
                <div className={i > 0 ? "pl-5 lg:pl-6" : ""}>
                  <div className="font-display font-bold text-[18px] lg:text-[22px] leading-none text-white">
                    {stat.value}
                  </div>
                  <div className="text-[9px] lg:text-[10px] text-white/40 mt-1 uppercase tracking-[.08em] font-medium">
                    {stat.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div
                    className="w-[1px] h-[28px] flex-shrink-0 ml-5 lg:ml-6"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Headline */}
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

          {/* CTA */}
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
              Sem compromisso · Sem custo · Resultado em 48h
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ MOBILE — Full-bleed ═══════ */}
      <div className="relative md:hidden">
        {/* M1: Imagem 260px, sem radius — full-bleed */}
        <div className="relative h-[260px] overflow-hidden">
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
                "linear-gradient(180deg, rgba(25,25,25,0.60) 0%, rgba(25,25,25,0.05) 45%, rgba(25,25,25,0.85) 100%)",
            }}
          />

          {/* M2: Glow roxo sutil na base da imagem */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, transparent 5%, rgba(117,83,255,0.35) 50%, transparent 95%)",
              boxShadow: "0 0 12px rgba(117,83,255,0.2)",
            }}
          />

          {/* Stats overlay */}
          <div
            className="absolute bottom-4 left-4 right-4 z-20 px-4 py-3 rounded-2xl fade-up"
            style={{
              background: "rgba(25,25,25,0.78)",
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

        {/* Conteúdo mobile — margem equivalente à V7 (card margin + card padding) */}
        <div className="px-12 py-12">
          {/* Tag */}
          <div className="fade-up mb-6">
            <span
              className="inline-block text-[11px] font-semibold uppercase tracking-[.10em] px-4 py-2 rounded-full"
              style={{
                background: "rgba(117,83,255,0.10)",
                border: "1px solid rgba(117,83,255,0.18)",
                color: "#8f6fff",
              }}
            >
              Consultoria gratuita
            </span>
          </div>

          {/* Headline */}
          <div className="fade-up" style={{ transitionDelay: "60ms" }}>
            <h2
              className="font-display font-bold text-[28px] leading-[1.08] tracking-tight text-white mb-4"
              style={{ letterSpacing: "-.4px" }}
            >
              Fale com quem entende{" "}
              <span className="gradient-text">o seu cenário.</span>
            </h2>
            <p className="text-[14px] text-white/45 max-w-[400px] leading-relaxed mb-7">
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
                <span className="text-[13px] text-white/60 leading-snug">
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="fade-up" style={{ transitionDelay: "180ms" }}>
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
            <p className="text-[11px] text-white/25 mt-3">
              Sem compromisso · Sem custo
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
