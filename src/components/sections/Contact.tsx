"use client";
import { useEffect, useRef } from "react";

export default function Contact() {
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
    <section id="contato" ref={ref} className="relative py-10 md:py-12 px-6 overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      <div className="relative z-10 max-w-[580px] mx-auto text-center fade-up">
        <span className="section-label" style={{ display: "inline-block" }}>Contato</span>
        <h2 className="font-display font-bold text-4xl md:text-[38px] leading-[1.15] tracking-tight text-[#fafafa] mb-3" style={{ letterSpacing: "-.3px" }}>
          Quanto você tá deixando{" "}
          <em className="not-italic gradient-text">na mesa todo mês?</em>
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#e0e0e0] mb-8 max-w-[480px] mx-auto">
          Fale com um especialista hoje e descubra quanto você pode economizar com sua PJ.
        </p>

        <a href="#contato" className="btn-primary text-[15px]">
          FALE COM UM ESPECIALISTA
        </a>
        <p className="mt-4 text-[12px] text-white/35">
          Resposta em até 2 horas em dias úteis. Sem compromisso.
        </p>
      </div>
    </section>
  );
}
