"use client";
import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number, started: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, started]);
  return value;
}

const brands = [
  "Spotify", "Nubank", "Toptal", "Deel", "99", "iFood", "Stone", "Creditas",
  "Spotify", "Nubank", "Toptal", "Deel", "99", "iFood", "Stone", "Creditas",
];

const messages = [
  { id: 1, dir: "in",  text: "Opa! Consegue me ajudar?", delay: 600 },
  { id: 2, dir: "out", text: "Claro! 😄",                delay: 1400 },
  { id: 3, dir: "in",  text: "Eita, que rápido kkkk",   delay: 2400 },
  { id: 4, dir: "out", text: "Pode se acostumar 🚀",     delay: 3400 },
];

export default function Hero() {
  const dashRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [visibleMsgs, setVisibleMsgs] = useState<number[]>([]);
  const [heroVisible, setHeroVisible] = useState(false);

  const faturado = useCountUp(75000, 1600, started);
  const impostos  = useCountUp(6430,  1400, started);
  const notas     = useCountUp(8,     900,  started);
  const liquido   = useCountUp(68570, 1600, started);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!dashRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          messages.forEach(({ id, delay }) => {
            setTimeout(() => setVisibleMsgs((prev) => [...prev, id]), delay);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(dashRef.current);
    return () => obs.disconnect();
  }, []);

  const fmt = (n: number) => "R$" + n.toLocaleString("pt-BR");

  return (
    <section id="hero" className="relative min-h-screen flex flex-col overflow-hidden pt-16">
      <div className="grid-bg" />

      {/* Glows */}
      <div className="absolute pointer-events-none" style={{
        top: "-80px", left: "25%",
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-80px", right: "8%",
        width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
      }} />

      {/* Hero body */}
      <div className="flex-1 flex items-center relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-14 py-16 w-full flex items-center gap-8 md:gap-16">

        {/* ── LEFT ── */}
        <div
          className="w-full md:w-[460px] flex-shrink-0 transition-all duration-700"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(28px)" }}
        >
          <h1
            className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-[#F4F4F8] mb-6"
            style={{ letterSpacing: "-.5px" }}
          >
            Tecnologia para a{" "}
            <em className="not-italic gradient-text">vida contábil</em>{" "}
            do dev
          </h1>

          <p className="text-[16px] leading-[1.75] text-[#9CA3AF] mb-10 max-w-[400px]">
            Centralize sua PJ, fale com especialistas que entendem de tech e comece a pagar menos imposto desde o primeiro mês.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <a href="#contato" className="btn-primary" style={{ fontSize: "14px" }}>
              Falar com um especialista →
            </a>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div
          className="hidden md:block flex-1 min-w-0"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(28px)",
            transition: "opacity .7s ease .3s, transform .7s ease .3s",
          }}
        >
          {/* Media block — dashboard + phone as a single anchored unit */}
          <div className="relative ml-auto" style={{ width: "min(100%, 620px)", height: 540 }}>

            {/* Dashboard — spans from 60px left to right edge of media block */}
            <div
              ref={dashRef}
              className="absolute top-0 right-0 rounded-[20px] overflow-hidden"
              style={{
                left: 60,
                height: 430,
                background: "#0C0C18",
                border: "1px solid rgba(124,58,237,0.22)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.12)",
              }}
            >
              {/* Fade right + bottom */}
              <div className="absolute top-0 right-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to left, #08080E, transparent)" }} />
              <div className="absolute left-0 right-0 bottom-0 h-36 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to top, #08080E, transparent)" }} />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                <span className="font-display font-bold text-sm text-[#F4F4F8]">Dashboard</span>
                <button className="bg-[#7C3AED] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wide">EMITIR NOTA</button>
              </div>

              {/* Body */}
              <div className="flex h-[calc(100%-49px)]">
                {/* Sidebar */}
                <div className="w-24 bg-[#090912] border-r border-white/[0.04] py-4 flex flex-col gap-1">
                  <div className="w-7 h-7 bg-[#7C3AED] rounded-lg flex items-center justify-center font-display font-bold text-[11px] text-white mx-auto mb-4">C</div>
                  {["Home", "Docs", "Contrato", "Pag.", "Suporte"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-3.5 py-2 ${i === 0 ? "bg-[#7C3AED]/15" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#A78BFA]" : "bg-[#6B7280]"}`} />
                      <span className={`text-[9px] ${i === 0 ? "text-[#A78BFA]" : "text-[#6B7280]"}`}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-3.5 overflow-hidden">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "Total Faturado", value: fmt(faturado), sub: "+12% vs anterior", green: true },
                      { label: "Impostos",        value: fmt(impostos), sub: "Alíquota 8,57%",   green: false },
                      { label: "NFs Emitidas",    value: notas.toString(), sub: "Notas Fiscais",  green: false },
                      { label: "Saldo Líquido",   value: fmt(liquido),  sub: "Disponível",        green: true },
                    ].map((c) => (
                      <div key={c.label} className="bg-[#13131E] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[7px] text-[#6B7280] uppercase tracking-wider mb-1">{c.label}</p>
                        <p className="font-display font-bold text-[12px] text-[#F4F4F8]">{c.value}</p>
                        <p className={`text-[7px] mt-0.5 ${c.green ? "text-emerald-400" : "text-[#6B7280]"}`}>{c.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#13131E] rounded-xl p-3 mb-2.5 border border-white/5">
                    <div className="flex justify-between mb-2.5">
                      <span className="text-[8px] text-[#6B7280] uppercase tracking-wider">Faturamento mensal</span>
                      <span className="font-display font-bold text-[14px] text-[#F4F4F8]">R$ 75.000</span>
                    </div>
                    <div className="relative h-12">
                      <svg width="100%" height="100%" viewBox="0 0 220 48" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="areaGradHero" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(124,58,237,0.45)" />
                            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
                          </linearGradient>
                        </defs>
                        {[12, 24, 36].map((y) => (
                          <line key={y} x1="0" y1={y} x2="220" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                        ))}
                        <path
                          d="M 0 30.6 C 3.33 29.65, 13.33 26.35, 20 24.88 C 26.67 23.41, 33.33 21.36, 40 21.8 C 46.67 22.24, 53.33 28.25, 60 27.52 C 66.67 26.79, 73.33 20.04, 80 17.4 C 86.67 14.76, 93.33 13.51, 100 11.68 C 106.67 9.85, 113.33 5.96, 120 6.4 C 126.67 6.84, 133.33 13.95, 140 14.32 C 146.67 14.69, 153.33 10.29, 160 8.6 C 166.67 6.91, 173.33 4.42, 180 4.2 C 186.67 3.98, 193.33 7.65, 200 7.28 C 206.67 6.91, 216.67 2.88, 220 2 L 220 48 L 0 48 Z"
                          fill="url(#areaGradHero)"
                          style={{ opacity: started ? 1 : 0, transition: "opacity 0.9s ease 0.3s" }}
                        />
                        <path
                          d="M 0 30.6 C 3.33 29.65, 13.33 26.35, 20 24.88 C 26.67 23.41, 33.33 21.36, 40 21.8 C 46.67 22.24, 53.33 28.25, 60 27.52 C 66.67 26.79, 73.33 20.04, 80 17.4 C 86.67 14.76, 93.33 13.51, 100 11.68 C 106.67 9.85, 113.33 5.96, 120 6.4 C 126.67 6.84, 133.33 13.95, 140 14.32 C 146.67 14.69, 153.33 10.29, 160 8.6 C 166.67 6.91, 173.33 4.42, 180 4.2 C 186.67 3.98, 193.33 7.65, 200 7.28 C 206.67 6.91, 216.67 2.88, 220 2"
                          fill="none"
                          stroke="#7C3AED"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          style={{
                            filter: "drop-shadow(0 0 3px rgba(124,58,237,0.7))",
                            opacity: started ? 1 : 0,
                            transition: "opacity 0.9s ease 0.3s",
                          }}
                        />
                        <circle
                          cx="220" cy="2" r="2.5"
                          fill="#A78BFA"
                          style={{
                            filter: "drop-shadow(0 0 4px rgba(167,139,250,0.9))",
                            opacity: started ? 1 : 0,
                            transition: "opacity 0.5s ease 1.1s",
                          }}
                        />
                      </svg>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[7px] text-[#6B7280]/60">Dez/25</span>
                      <span className="text-[7px] text-[#6B7280]/60">Abr/26</span>
                    </div>
                  </div>

                  <div className="bg-[#13131E] rounded-xl p-2.5 border border-white/5">
                    <p className="text-[9px] font-semibold text-[#F4F4F8] mb-2">Notas Fiscais Emitidas</p>
                    {[
                      { name: "Chatigo Pixa",    val: "R$ 42.000" },
                      { name: "Remote Tech LLC", val: "R$ 33.000" },
                    ].map((row) => (
                      <div key={row.name} className="flex justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                        <span className="text-[9px] text-[#9CA3AF]">{row.name}</span>
                        <span className="text-[9px] text-[#A78BFA] font-semibold">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone — anchored bottom-left, overlapping the dashboard intentionally */}
            <div
              className="absolute z-20 rounded-[36px] p-[10px]"
              style={{
                bottom: 0,
                left: 0,
                width: 210,
                background: "#0D0D1A",
                border: "2px solid rgba(255,255,255,0.12)",
                boxShadow: "0 0 0 1px rgba(124,58,237,0.28), 0 32px 64px rgba(0,0,0,0.9), 0 0 50px rgba(124,58,237,0.22)",
              }}
            >
              <div className="w-12 h-[7px] bg-[#0D0D1A] border border-white/[0.08] rounded-full mx-auto mb-2" />
              <div className="bg-[#080810] rounded-[26px] p-3.5">
                <div className="flex items-center gap-2 pb-2.5 border-b border-white/5 mb-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center font-display font-bold text-[9px] text-white flex-shrink-0">C</div>
                  <div>
                    <p className="text-[9px] font-medium text-[#F4F4F8]">ContaDev</p>
                    <p className="text-[8px] text-emerald-400">● online agora</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}
                      style={{
                        opacity: visibleMsgs.includes(m.id) ? 1 : 0,
                        transform: visibleMsgs.includes(m.id) ? "none" : "translateY(6px)",
                        transition: "opacity .4s ease, transform .4s ease",
                      }}
                    >
                      <span
                        className="text-[9px] leading-[1.5] px-2.5 py-2 max-w-[148px]"
                        style={{
                          background: m.dir === "out" ? "#7C3AED" : "rgba(255,255,255,0.08)",
                          color: m.dir === "out" ? "#fff" : "#9CA3AF",
                          borderRadius: m.dir === "out" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                        }}
                      >
                        {m.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-10 h-[3px] bg-white/10 rounded-full mx-auto mt-2.5" />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* ── LOGOS STRIP — contrasting bg to visually break the hero ── */}
      <div
        className="relative z-10 transition-all duration-700 delay-500"
        style={{
          background: "#0F0F1A",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "none" : "translateY(14px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-14 py-5 flex items-center gap-8">
        <span className="text-[10px] text-[#6B7280] uppercase tracking-[.08em] whitespace-nowrap flex-shrink-0">
          Profissionais de
        </span>
        <div className="overflow-hidden flex-1">
          <div className="carousel-track items-center gap-10">
            {brands.map((name, i) => (
              <span key={i} className="font-display font-bold text-[13px] text-white/20 whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
