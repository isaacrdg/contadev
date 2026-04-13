"use client";
import { useEffect, useRef, useState } from "react";
import { useFormModal } from "@/components/FormContext";

const CTA_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { openForm } = useFormModal();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  /* Fade-up observer */
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

  /* Parallax on desktop image */
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

  function handleMouseMove(e: React.MouseEvent) {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHovering(true);
  }

  return (
    <section id="consultoria" ref={ref} className="relative">
      <div
        ref={boxRef}
        className="max-w-[1100px] mx-auto relative overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Grid background with fade */}
        <div className="grid-bg" />

        {/* Mouse glow */}
        <div
          className="absolute pointer-events-none z-[2] transition-opacity duration-500"
          style={{
            width: "80px",
            height: "80px",
            left: mousePos.x - 40,
            top: mousePos.y - 40,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(117,83,255,0.30) 0%, rgba(117,83,255,0.10) 40%, transparent 70%)",
            filter: "blur(20px)",
            opacity: hovering ? 1 : 0,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(23,21,30,0.90) 80%)",
          }}
        />

        {/* ═══════ DESKTOP ═══════ */}
        <div className="relative z-10 hidden md:block" style={{ minHeight: "460px" }}>
          {/* Parallax image — covers full area, faded out on the left via gradient */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "16px" }}>
            <img
              ref={imgRef}
              src={CTA_IMAGE}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-[70%_15%] will-change-transform"
              style={{ transform: "scale(1.06)" }}
            />
            {/* Left fade — fully opaque on the left, gradually reveals image on the right */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(23,21,30,1) 0%, rgba(23,21,30,0.97) 25%, rgba(23,21,30,0.80) 40%, rgba(23,21,30,0.35) 58%, rgba(23,21,30,0.10) 75%, transparent 100%)",
              }}
            />
            {/* Vertical softening */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(23,21,30,0.50) 0%, transparent 20%, transparent 80%, rgba(23,21,30,0.50) 100%)",
              }}
            />
            {/* Subtle purple tint on visible image area */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 75% 50%, rgba(102,68,242,0.07) 0%, transparent 55%)",
              }}
            />
          </div>

          {/* Content — left side */}
          <div className="relative z-10 flex flex-col justify-center min-h-[460px] max-w-[520px] px-10 lg:px-14 py-14">
            <div className="fade-up">
              <h2
                className="font-display font-bold text-[38px] lg:text-[44px] leading-[1.08] tracking-tight text-white mb-4 whitespace-nowrap"
                style={{ letterSpacing: "-.4px" }}
              >
                Cada cenário pede <span className="gradient-text">uma estratégia.</span>
              </h2>
              <p className="text-[15px] text-white/50 max-w-[400px] leading-relaxed mb-8">
                Um especialista analisa o seu caso e monta o melhor
                caminho. Sem custo, sem compromisso.
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
        <div className="relative z-10 md:hidden">
          {/* Image — top, blending into grid */}
          <div className="relative h-[220px] overflow-hidden">
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
                  "linear-gradient(180deg, rgba(23,21,30,0.45) 0%, rgba(23,21,30,0.10) 35%, rgba(23,21,30,0.90) 100%)",
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
                caminho. Sem custo, sem compromisso.
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
      </div>
    </section>
  );
}
