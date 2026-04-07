"use client";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7553ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "100% digital",
    desc: "Do primeiro contato à abertura do CNPJ. Tudo online, de onde você estiver.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7553ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Economia real",
    desc: "Nossos clientes economizam em média 50.8% em impostos. Dados reais.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7553ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Especialista em 3 min",
    desc: "Atendimento humano e direto por WhatsApp. Sem fila, sem robô.",
  },
];

export default function FeatureStrip() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const Star = () => (
    <svg width="20" height="20" viewBox="0 0 13 13" fill="none">
      <path
        d="M6.5 0C6.5 3.59 3.59 6.5 0 6.5C3.59 6.5 6.5 9.41 6.5 13C6.5 9.41 9.41 6.5 13 6.5C9.41 6.5 6.5 3.59 6.5 0Z"
        fill="#191919"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="0.6"
      />
    </svg>
  );

  const StarLine = () => (
    <div className="hidden md:block relative max-w-[1100px] mx-auto" style={{ height: "1px", zIndex: 10 }}>
      <div className="absolute -left-[10px] -top-[10px] z-10"><Star /></div>
      <div
        className="absolute inset-0"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(117,83,255,0.15) 50%, rgba(255,255,255,0.06) 100%)",
          marginLeft: "10px",
          marginRight: "10px",
        }}
      />
      <div className="absolute -right-[10px] -top-[10px] z-10"><Star /></div>
    </div>
  );

  return (
    <section ref={ref} className="relative py-0 overflow-x-clip">
      {/* ════════ DESKTOP ════════ */}
      <StarLine />
      <div className="hidden md:block max-w-[1100px] mx-auto py-12">
        <div className="grid grid-cols-3 gap-0">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="fade-up flex items-start gap-4 px-8"
              style={{
                transitionDelay: `${i * 80}ms`,
                borderRight: i < features.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(117,83,255,0.06)",
                  border: "1px solid rgba(117,83,255,0.12)",
                }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="text-[14px] font-display font-semibold text-[#fafafa] mb-1">
                  {f.title}
                </h3>
                <p className="text-[12px] text-white/35 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <StarLine />

      {/* ════════ MOBILE — strip horizontal compacto, cores da LogosStrip ════════ */}
      <div
        className="md:hidden max-w-[1100px] mx-auto"
        style={{
          background: "#1f1f1f",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="grid grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="fade-up flex flex-col items-center text-center gap-2 px-2 py-4"
              style={{
                transitionDelay: `${i * 80}ms`,
                borderRight: i < features.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span className="scale-[0.85]">{f.icon}</span>
              </div>
              <h3 className="text-[10px] font-display font-semibold text-white/55 uppercase tracking-[.06em] leading-tight">
                {f.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
