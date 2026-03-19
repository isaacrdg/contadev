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

const messages = [
  { id: 1, dir: "out", text: "Quero abrir minha PJ, como funciona?", time: "10:42", delay: 800 },
  { id: 2, dir: "in",  text: "A gente cuida de tudo! E a abertura é gratuita, sem taxas escondidas 😉", time: "10:43", delay: 2800 },
  { id: 3, dir: "out", text: "Sério?? Quanto tempo leva?", time: "10:43", delay: 5500 },
  { id: 4, dir: "in",  text: "Em até 48h seu CNPJ tá pronto. 100% digital 🚀", time: "10:44", delay: 8000 },
  { id: 5, dir: "out", text: "Não acredito!! Bora!! 🔥", time: "10:44", delay: 10500 },
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
    <section id="hero" className="relative min-h-[85vh] md:min-h-0 flex flex-col overflow-hidden pt-20">
      <div className="grid-bg" />

      {/* Blurs — animated */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute hidden md:block hero-blur-a" style={{
          top: "0", left: "0",
          width: "800px", height: "800px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(117,83,255,0.20) 0%, rgba(117,83,255,0.07) 40%, transparent 70%)",
          filter: "blur(80px)",
        }} />
        <div className="absolute hidden md:block hero-blur-b" style={{
          top: "0", left: "0",
          width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.16) 0%, rgba(192,60,180,0.05) 40%, transparent 70%)",
          filter: "blur(70px)",
        }} />
        <div className="absolute md:hidden" style={{
          top: "-100px", left: "50%", transform: "translateX(-50%)",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(117,83,255,0.15) 0%, transparent 70%)",
        }} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[1]" style={{
        background: `
          linear-gradient(to bottom, rgba(25,25,25,0.4) 0%, transparent 15%),
          linear-gradient(to top, #191919 0%, transparent 25%),
          linear-gradient(to right, rgba(25,25,25,0.6) 0%, transparent 10%),
          linear-gradient(to left, rgba(25,25,25,0.6) 0%, transparent 10%)
        `,
      }} />

      {/* Hero body */}
      <div className="flex-1 flex items-center relative z-10">
        <div className="max-w-[1020px] mx-auto px-4 md:px-6 py-8 md:py-10 w-full flex items-center gap-10">

        {/* ── LEFT — 70% do container ── */}
        <div
          className="w-full md:w-[60%] flex-shrink-0 transition-all duration-700"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "none" : "translateY(28px)" }}
        >
          <h1
            className="font-display font-bold text-[46px] md:text-6xl lg:text-7xl leading-[1.0] tracking-[-0.03em] text-[#fafafa] mb-4"
          >
            Tecnologia para a{" "}
            <em className="not-italic gradient-text">vida contábil</em>{" "}
            do dev
          </h1>

          <p className="text-[18px] md:text-[16px] leading-[1.65] text-[#e0e0e0] font-extralight mb-8 max-w-none md:max-w-[480px]">
            Centralize sua PJ, fale com especialistas que entendem de tech e comece a pagar menos imposto desde o primeiro mês.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <a href="#tecnologia" className="btn-primary" style={{ fontSize: "14px" }}>
              CONHECER PLATAFORMA
            </a>
          </div>
        </div>

        {/* ── RIGHT — vaza pra direita fora do container ── */}
        <div
          className="hidden md:block flex-1 min-w-0"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "none" : "translateY(28px)",
            transition: "opacity .7s ease .3s, transform .7s ease .3s",
            marginRight: "-180px",
          }}
        >
          {/* Media block — dashboard + phone, overflow right */}
          <div className="relative" style={{ width: 720, height: 520 }}>

            {/* Dashboard — spans from 60px left to right edge of media block */}
            <div
              ref={dashRef}
              className="absolute top-0 right-0 rounded-[20px] overflow-hidden"
              style={{
                left: 60,
                height: 460,
                background: "#1c1c1c",
                border: "1px solid rgba(117,83,255,0.22)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(117,83,255,0.12)",
              }}
            >
              {/* Fade right + bottom */}
              <div className="absolute top-0 right-0 bottom-0 w-20 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to left, #191919, transparent)" }} />
              <div className="absolute left-0 right-0 bottom-0 h-36 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to top, #191919, transparent)" }} />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                <span className="font-display font-bold text-sm text-[#fafafa]">Dashboard</span>
                <button className="bg-[#7553ff] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wide">EMITIR NOTA</button>
              </div>

              {/* Body */}
              <div className="flex h-[calc(100%-49px)]">
                {/* Sidebar */}
                <div className="w-24 bg-[#1f1f1f] border-r border-white/[0.04] py-4 flex flex-col gap-1">
                  <div className="w-7 h-7 bg-[#7553ff] rounded-lg flex items-center justify-center font-display font-bold text-[11px] text-white mx-auto mb-4">C</div>
                  {["Home", "Docs", "Contrato", "Pag.", "Suporte"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-3.5 py-2 ${i === 0 ? "bg-[#7553ff]/15" : ""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#8f6fff]" : "bg-white/35"}`} />
                      <span className={`text-[9px] ${i === 0 ? "text-[#8f6fff]" : "text-white/35"}`}>{item}</span>
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
                      <div key={c.label} className="bg-[#1c1c1c] rounded-xl p-2.5 border border-white/5">
                        <p className="text-[7px] text-white/35 uppercase tracking-wider mb-1">{c.label}</p>
                        <p className="font-display font-bold text-[12px] text-[#fafafa]">{c.value}</p>
                        <p className={`text-[7px] mt-0.5 ${c.green ? "text-emerald-400" : "text-white/35"}`}>{c.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#1c1c1c] rounded-xl p-3 mb-2.5 border border-white/5">
                    <div className="flex justify-between mb-2.5">
                      <span className="text-[8px] text-white/35 uppercase tracking-wider">Faturamento mensal</span>
                      <span className="font-display font-bold text-[14px] text-[#fafafa]">R$ 75.000</span>
                    </div>
                    <div className="relative h-12">
                      <svg width="100%" height="100%" viewBox="0 0 220 48" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="areaGradHero" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(117,83,255,0.45)" />
                            <stop offset="100%" stopColor="rgba(117,83,255,0)" />
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
                          stroke="#7553ff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          style={{
                            filter: "drop-shadow(0 0 3px rgba(117,83,255,0.7))",
                            opacity: started ? 1 : 0,
                            transition: "opacity 0.9s ease 0.3s",
                          }}
                        />
                        <circle
                          cx="220" cy="2" r="2.5"
                          fill="#8f6fff"
                          style={{
                            filter: "drop-shadow(0 0 4px rgba(143,111,255,0.9))",
                            opacity: started ? 1 : 0,
                            transition: "opacity 0.5s ease 1.1s",
                          }}
                        />
                      </svg>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[7px] text-white/25">Dez/25</span>
                      <span className="text-[7px] text-white/25">Abr/26</span>
                    </div>
                  </div>

                  <div className="bg-[#1c1c1c] rounded-xl p-2.5 border border-white/5">
                    <p className="text-[9px] font-semibold text-[#fafafa] mb-2">Notas Fiscais Emitidas</p>
                    {[
                      { name: "Chatigo Pixa",    val: "R$ 42.000" },
                      { name: "Remote Tech LLC", val: "R$ 33.000" },
                    ].map((row) => (
                      <div key={row.name} className="flex justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                        <span className="text-[9px] text-[#e0e0e0]">{row.name}</span>
                        <span className="text-[9px] text-[#8f6fff] font-semibold">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone — iPhone mockup with chat inside */}
            <div
              className="absolute z-20 rounded-[36px] p-[8px]"
              style={{
                bottom: 0,
                left: 0,
                width: 210,
                background: "#1f1f1f",
                border: "2px solid rgba(255,255,255,0.12)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.9), 0 0 40px rgba(117,83,255,0.15)",
              }}
            >
              {/* Notch */}
              <div className="w-16 h-[6px] bg-[#1f1f1f] border border-white/[0.08] rounded-full mx-auto mb-1.5" />

              {/* Screen */}
              <div
                className="bg-[#191919] rounded-[28px] overflow-hidden flex flex-col"
                style={{ height: 380 }}
              >
              {/* Chat header */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-[8px] text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #7553ff, #5a3de6)" }}>C</div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#fafafa] font-medium leading-none">ContaDev</span>
                  <span className="text-[7px] text-emerald-400 leading-none mt-0.5">● online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-2.5 p-3 flex-1">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.dir === "out" ? "items-end" : "items-start"}`}
                    style={{
                      opacity: visibleMsgs.includes(m.id) ? 1 : 0,
                      transform: visibleMsgs.includes(m.id) ? "none" : "translateY(6px)",
                      transition: "opacity .4s ease, transform .4s ease",
                    }}
                  >
                    <span
                      className="text-[8.5px] leading-[1.45] px-2.5 py-1.5 max-w-[140px]"
                      style={{
                        background: m.dir === "out" ? "#7553ff" : "rgba(255,255,255,0.06)",
                        color: m.dir === "out" ? "#fff" : "rgba(250,250,250,0.6)",
                        borderRadius: m.dir === "out" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                      }}
                    >
                      {m.text}
                    </span>
                    <span className="text-[6px] text-white/20 mt-0.5">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 py-2 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-[8px] text-white/25 flex-1">Mensagem...</span>
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(117,83,255,0.20)" }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#8f6fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                </div>
              </div>
              </div>

              {/* Home indicator */}
              <div className="w-10 h-[3px] bg-white/10 rounded-full mx-auto mt-2" />
            </div>
          </div>
        </div>
        </div>
      </div>

    </section>
  );
}
