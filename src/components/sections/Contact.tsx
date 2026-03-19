"use client";
import { useEffect, useRef, useState } from "react";
import SectionDivider from "@/components/SectionDivider";

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [textHover, setTextHover] = useState(false);

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

  function handleMouseMove(e: React.MouseEvent) {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHovering(true);
  }

  return (
    <section id="contato" ref={ref} className="relative">

      <SectionDivider cross="left" />

      <div
        ref={boxRef}
        className="max-w-[1100px] mx-auto relative overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovering(false)}
      >
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
            background: "radial-gradient(circle, rgba(117,83,255,0.30) 0%, rgba(117,83,255,0.10) 40%, transparent 70%)",
            filter: "blur(20px)",
            opacity: hovering ? 1 : 0,
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 30%, #191919 80%)" }}
        />

        {/* Content */}
        <div className="relative z-10 py-16 md:py-24 px-5 md:px-6 text-center fade-up">

          {/* Stroke-fill text */}
          <div
            className="mb-8 max-w-[700px] mx-auto cursor-default"
            onMouseEnter={() => setTextHover(true)}
            onMouseLeave={() => setTextHover(false)}
          >
            <svg viewBox="0 0 700 130" className="w-full max-w-[700px] mx-auto block" style={{ overflow: "visible" }}>
              <text x="350" y="50" textAnchor="middle" className="font-display"
                style={{ fontSize: "52px", fontWeight: 700, letterSpacing: "-.3px", stroke: "rgba(255,255,255,0.30)", strokeWidth: 1.2, fill: textHover ? "#fafafa" : "transparent", transition: "fill 1.5s ease-out" }}>
                Quanto você tá deixando
              </text>
              <text x="350" y="115" textAnchor="middle" className="font-display"
                style={{ fontSize: "52px", fontWeight: 700, letterSpacing: "-.3px", stroke: "rgba(117,83,255,0.5)", strokeWidth: 1.2, fill: textHover ? "#7553ff" : "transparent", transition: "fill 1.5s ease-out 0.3s" }}>
                na mesa todo mês?
              </text>
            </svg>
          </div>

          <a href="#contato" className="btn-primary">
            FALE COM UM ESPECIALISTA
          </a>
        </div>
      </div>
    </section>
  );
}
