"use client";
import { useEffect, useRef } from "react";

const journey = [
  {
    step: "01",
    title: "Nós te entendemos",
    desc: "Chegou perdido? A gente ilumina o caminho — valores, processos, prazos e próximos passos. Independente da sua dúvida, nosso time te orienta com clareza.",
  },
  {
    step: "02",
    title: "Tecnologia que facilita de verdade",
    desc: "Nossa plataforma automatiza sua rotina, do onboarding ao primeiro pagamento, passando por notas e guias. Tudo fica acessível, organizado e a poucos cliques de distância.",
  },
  {
    step: "03",
    title: "Um especialista a um clique de distância",
    desc: "Sem fila, sem chatbot e sem repetir sua história. Você fala com um contador dedicado, que conhece seu contexto e acompanha sua operação de perto.",
  },
  {
    step: "04",
    title: "A plataforma cuida da rotina. Seu contador cuida de você.",
    desc: "Notas, guias e pagamentos seguem com fluidez no dia a dia. Quando surge uma decisão importante, você tem ao lado alguém que já conhece seu cenário e sabe te orientar com precisão.",
  },
];

function MediaPlaceholder({ index }: { index: number }) {
  const palettes = [
    { from: "rgba(124,58,237,0.18)", to: "rgba(8,8,14,0)" },
    { from: "rgba(59,130,246,0.14)", to: "rgba(8,8,14,0)" },
    { from: "rgba(124,58,237,0.16)", to: "rgba(8,8,14,0)" },
    { from: "rgba(99,102,241,0.14)", to: "rgba(8,8,14,0)" },
  ];
  const p = palettes[index % palettes.length];

  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${p.from} 0%, ${p.to} 70%), #0C0C18`,
      }}
    >
      {/* Abstract grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Center icon placeholder */}
      <div className="relative z-10 flex flex-col items-center gap-3 opacity-30">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.4)" }}
        >
          <span className="text-[#A78BFA] font-display font-bold text-sm">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="w-24 h-1.5 rounded-full bg-white/10" />
        <div className="w-16 h-1 rounded-full bg-white/5" />
      </div>
    </div>
  );
}

export default function Benefits() {
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
    <section id="jornada" ref={ref} className="relative py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {journey.map((item, i) => {
          const isEven = i % 2 === 1;
          return (
            <div
              key={item.step}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-20 items-center ${
                i === 0 ? "pt-12 md:pt-20 pb-12 md:pb-20" : "py-12 md:py-20 border-t border-white/5"
              }`}
            >
              {/* Text column */}
              <div
                className={`max-w-lg fade-up ${isEven ? "md:order-2" : ""}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  {item.step}
                </p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight mt-3 mb-4 text-[#F4F4F8]">
                  {item.title}
                </h3>
                <p className="text-[15px] md:text-base leading-relaxed text-[#9CA3AF]">
                  {item.desc}
                </p>
              </div>

              {/* Media column */}
              <div
                className={`relative rounded-xl overflow-hidden bg-white/[0.03] fade-up
                  w-[calc(100%+2rem)] -mx-4 max-w-[calc(100vw-3rem)] aspect-[3/4]
                  md:mx-0 md:w-full md:max-w-none md:aspect-[4/3]
                  ${isEven ? "md:order-1" : ""}
                `}
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  transitionDelay: `${i * 60 + 80}ms`,
                }}
              >
                <MediaPlaceholder index={i} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
