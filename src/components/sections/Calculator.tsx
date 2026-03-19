"use client";
import { useEffect, useRef, useState } from "react";
import SectionDivider from "@/components/SectionDivider";

const CALC_URL = "/calculadora";

const situacoes = [
  { value: "brasileira",    label: "🇧🇷 Brasileira" },
  { value: "internacional", label: "🇪🇺 Internacional" },
];

function formatBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Calculator() {
  const ref = useRef<HTMLDivElement>(null);
  const [situacao, setSituacao] = useState("brasileira");
  const [faturamento, setFaturamento] = useState("");
  const [cardVisible, setCardVisible] = useState(true);
  const [parallaxY, setParallaxY] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          setBarsVisible(true);
        }
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const vh = window.innerHeight / 2;
      setParallaxY((center - vh) * 0.03);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleFaturamento(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setFaturamento(digits ? formatBRL(e.target.value) : "");
  }

  function handleSubmit() {
    const params = new URLSearchParams({ situacao, faturamento });
    window.location.href = `${CALC_URL}?${params}`;
  }

  return (
    <section
      id="calculadora"
      ref={ref}
      className="relative px-5 md:px-6"
    >
      <SectionDivider cross="right" />
      <div
        className="relative max-w-[1020px] mx-auto rounded-2xl overflow-hidden my-8 md:my-12"
        style={{
          background: "linear-gradient(180deg, #0f0d1a 0%, #130f22 60%, #0f0d1a 100%)",
          border: "1px solid rgba(117,83,255,0.15)",
          boxShadow: "none",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-[1px] w-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(117,83,255,0.4), transparent)" }}
        />

        {/* Subtle glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(117,83,255,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Diagonal drifting blur blob */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "600px",
            height: "420px",
            top: "0",
            left: "0",
            background: "radial-gradient(ellipse, rgba(167,139,255,0.24) 0%, rgba(124,58,237,0.12) 40%, transparent 70%)",
            filter: "blur(70px)",
            animation: "driftBlob 30s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          }}
        />


        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-center p-6 md:p-10">

          {/* LEFT — copy */}
          <div className="fade-up">
          <h2
            className="font-display font-bold text-4xl md:text-[42px] leading-[1.1] tracking-tight text-[#fafafa] mb-4"
            style={{ letterSpacing: "-.3px" }}
          >
            Você pode estar pagando imposto a mais{" "}
            <em className="not-italic gradient-text">e nem percebe.</em>
          </h2>
          <p className="text-[15px] leading-[1.75] text-[#e0e0e0] mb-6 max-w-[420px]">
            Muitos desenvolvedores só descobrem depois que abriram o CNPJ que estavam pagando mais do que precisavam.
            Descubra em segundos uma estimativa real para o seu cenário.
          </p>

          {/* Trust signals */}
          <ul className="flex flex-col gap-3">
            {[
              "Resultado em segundos, sem cadastro",
              "Simples, direto, sem juridiquês",
              "Descubra se você está no caminho certo",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-[#e0e0e0]">
                <span
                  className="mt-[3px] flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(117,83,255,0.15)", border: "1px solid rgba(117,83,255,0.30)" }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#8f6fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — calculator card + floating overlay */}
        <div className="fade-up relative">

        {/* Simulator card */}
        <div
          className="relative rounded-2xl overflow-hidden z-10 cursor-pointer"
          onClick={() => { if (!cardVisible) setCardVisible(true); }}
          style={{
            background: "linear-gradient(145deg, #1e1a2e 0%, #171320 50%, #1a1528 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 30px 60px rgba(0,0,0,0.4), 0 0 80px rgba(117,83,255,0.06)",
            transitionDelay: "120ms",
          }}
        >
          {/* Top accent bar — animated glow */}
          <div
            className="relative w-full overflow-hidden"
            style={{ height: "2px" }}
          >
            {/* Base bar */}
            <div className="absolute inset-0" style={{ background: "#7c3aed" }} />

            {/* Orb A — highlight + glow */}
            <div className="calc-orb" style={{ animationDelay: "0s" }} />
            <div className="calc-orb-glow" style={{ animationDelay: "0s" }} />

            {/* Orb B — offset */}
            <div className="calc-orb" style={{ animationDelay: "7s" }} />
            <div className="calc-orb-glow" style={{ animationDelay: "7s" }} />

            {/* Pulse overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(143,111,255,0.3), transparent)",
                animation: "barPulse 4s ease-in-out infinite",
              }}
            />
          </div>

          <div className="p-6 md:p-7">
            {/* Card header */}
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7553ff, #5a3de6)", boxShadow: "0 4px 12px rgba(117,83,255,0.3)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="12" y2="14" />
                  </svg>
                </div>
                <span className="font-display font-semibold text-[14px] text-[#fafafa]">Simular cenário</span>
              </div>
              <span
                className="text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "rgba(117,83,255,0.15)", color: "#a78bff", border: "1px solid rgba(117,83,255,0.25)" }}
              >
                Gratuito
              </span>
            </div>

            {/* Field 1 — situação */}
            <div className="mb-5">
              <label className="block text-[11px] uppercase tracking-[0.10em] text-white/40 font-medium mb-2.5">
                Você trabalha para uma empresa:
              </label>
              <div className="flex gap-2 flex-wrap">
                {situacoes.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSituacao(s.value)}
                    className="text-[13px] font-medium px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                    style={{
                      background: situacao === s.value ? "rgba(117,83,255,0.20)" : "rgba(255,255,255,0.04)",
                      border: situacao === s.value ? "1px solid rgba(117,83,255,0.50)" : "1px solid rgba(255,255,255,0.08)",
                      color: situacao === s.value ? "#a78bff" : "rgba(250,250,250,0.5)",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2 — faturamento */}
            <div className="mb-6">
              <label className="block text-[11px] uppercase tracking-[0.10em] text-white/40 font-medium mb-2.5">
                Quanto você ganha por mês (em R$)?
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  value={faturamento}
                  onChange={handleFaturamento}
                  className="w-full rounded-xl px-4 py-3.5 text-[15px] text-[#fafafa] outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    fontFamily: "var(--font-outfit)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(117,83,255,0.50)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)")}
                />
              </div>
              <p className="mt-2 text-[11px] text-white/30">Valor bruto que você recebe por mês</p>
            </div>

            {/* Button — ver resultado (not a CTA) */}
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 text-[14px] font-semibold rounded-xl py-3.5 transition-all duration-200 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#fafafa",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
              }}
            >
              VER MEU RESULTADO
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <p className="mt-3 text-center text-[11px] text-white/25">
              Resultado instantâneo · Sem cadastro
            </p>
          </div>
        </div>

        {/* Floating stats card — toggles between front/back */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setCardVisible(!cardVisible)}
            style={{
              zIndex: cardVisible ? 20 : 5,
              transform: cardVisible
                ? `translateY(${parallaxY}px) rotate(-2deg)`
                : `translateY(${parallaxY}px) rotate(-1deg) translate(-25px, -25px)`,
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className="absolute top-[-10px] left-[-10px] right-[40px] bottom-[40px] rounded-2xl"
              style={{
                background: "rgba(240, 238, 245, 0.92)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(117,83,255,0.20)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 60px rgba(117,83,255,0.15), 0 0 120px rgba(117,83,255,0.08)",
                overflow: "hidden",
              }}
            >
              {/* Glow top-right */}
              <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none" style={{
                background: "radial-gradient(circle, rgba(117,83,255,0.15) 0%, transparent 70%)",
              }} />

              <div className="relative z-10 p-6 md:p-7 flex flex-col h-full">
                {/* Title */}
                <h3 className="font-display font-bold text-[18px] md:text-[22px] leading-[1.2] text-[#15191E] mb-6" style={{ letterSpacing: "-.2px" }}>
                  <span className="text-[#7553ff]">6 em cada 10</span> devs PJ pagam imposto a mais
                </h3>

                {/* Bars */}
                <div className="flex flex-col gap-0">
                  {[
                    { label: "Pagam a mais", value: 63, color: "#C46037" },
                    { label: "Regime errado", value: 48, color: "#C4C237" },
                    { label: "Sabem quanto pagam", value: 22, color: "#37C4AE" },
                  ].map((bar, i) => (
                    <div key={bar.label}>
                      <div className="flex items-center gap-3 py-3">
                        <span className="text-[11px] text-[#15191E]/70 w-[120px] flex-shrink-0">{bar.label}</span>
                        <div className="flex-1 h-[10px] rounded-none" style={{ background: "rgba(0,0,0,0.06)" }}>
                          <div
                            className="h-full rounded-none"
                            style={{
                              width: barsVisible ? `${bar.value}%` : "0%",
                              background: `linear-gradient(90deg, transparent, ${bar.color})`,
                              transition: `width 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.2}s`,
                            }}
                          />
                        </div>
                        <span className="text-[12px] font-display font-bold text-[#15191E]/60 w-[36px] text-right">{bar.value}%</span>
                      </div>
                      {i < 2 && <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center justify-between group">
                    <div>
                      <span className="font-display font-bold text-[24px] text-[#7553ff]" style={{ textShadow: "0 0 20px rgba(117,83,255,0.3)" }}>R$847</span>
                      <span className="text-[11px] text-[#15191E]/55 ml-2">pagos a mais por mês, em média</span>
                    </div>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 hover:translate-x-[3px]" style={{ border: "1px solid rgba(0,0,0,0.10)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
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
