"use client";
import { useEffect, useRef } from "react";
import { useFormModal } from "@/components/FormContext";

const CTA_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

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

  /* Parallax — subtle scale shift on desktop image */
  useEffect(() => {
    const section = ref.current;
    const img = imgRef.current;
    if (!section || !img) return;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const wh = window.innerHeight;
      const t = Math.max(0, Math.min(1, (wh - rect.top) / (wh + rect.height)));
      img.style.transform = `scale(${1.06 - t * 0.06})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="consultoria" ref={ref} className="relative pt-12 md:pt-20">
      {/* ═══════ DESKTOP ═══════ */}
      <div
        className="relative overflow-hidden hidden md:block max-w-[1100px] mx-auto rounded-2xl"
        style={{ minHeight: "480px" }}
      >
        {/* Parallax image */}
        <img
          ref={imgRef}
          src={CTA_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_15%] will-change-transform"
          style={{ transform: "scale(1.06)" }}
        />

        {/* Overlay — clean bottom-heavy gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,14,20,0.10) 0%, rgba(15,14,20,0.30) 35%, rgba(15,14,20,0.80) 65%, rgba(15,14,20,0.96) 100%)",
          }}
        />

        {/* Content — bottom-aligned, restrained */}
        <div className="relative z-10 flex flex-col justify-end min-h-[480px] max-w-[600px] px-10 lg:px-14 pb-14">
          <div className="fade-up">
            <h2
              className="font-display font-bold text-[38px] lg:text-[44px] leading-[1.08] tracking-tight text-white mb-4"
              style={{ letterSpacing: "-.4px" }}
            >
              Cada cenário pede
              <br />
              <span className="gradient-text">uma estratégia.</span>
            </h2>
            <p className="text-[15px] text-white/50 max-w-[420px] leading-relaxed mb-8">
              Um especialista analisa o seu caso e monta o melhor
              caminho — sem custo, sem compromisso.
            </p>
          </div>

          <div className="fade-up" style={{ transitionDelay: "100ms" }}>
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
            <span className="text-[12px] text-white/25 ml-4 font-medium">
              Resultado em até 48h
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ MOBILE ═══════ */}
      <div className="relative md:hidden">
        {/* Image — full-bleed, compact */}
        <div className="relative h-[240px] overflow-hidden">
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
                "linear-gradient(180deg, rgba(15,14,20,0.50) 0%, rgba(15,14,20,0.10) 40%, rgba(15,14,20,0.85) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="px-8 py-10">
          <div className="fade-up">
            <h2
              className="font-display font-bold text-[26px] leading-[1.10] tracking-tight text-white mb-4"
              style={{ letterSpacing: "-.3px" }}
            >
              Cada cenário pede{" "}
              <span className="gradient-text">uma estratégia.</span>
            </h2>
            <p className="text-[14px] text-white/45 max-w-[340px] leading-relaxed mb-8">
              Um especialista analisa o seu caso e monta o melhor
              caminho — sem custo, sem compromisso.
            </p>
          </div>

          <div className="fade-up" style={{ transitionDelay: "100ms" }}>
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
              Resultado em até 48h
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
