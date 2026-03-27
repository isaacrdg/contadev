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
  const [barsVisible, setBarsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0]);
  const barsTriggered = useRef(false);

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          if (!barsTriggered.current) {
            barsTriggered.current = true;
            setBarsVisible(true);
            // Animate numbers progressively
            const targets = [63, 48, 22];
            targets.forEach((target, idx) => {
              const duration = 2000 + idx * 400;
              const steps = 60;
              const stepTime = duration / steps;
              let current = 0;
              const increment = target / steps;
              const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                  current = target;
                  clearInterval(timer);
                }
                setAnimatedValues(prev => {
                  const next = [...prev];
                  next[idx] = Math.round(current);
                  return next;
                });
              }, stepTime);
            });
          }
        }
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
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
      className="relative"
    >
      <div className="max-w-[1100px] mx-auto relative overflow-hidden" style={{ background: "#1c1c1c" }}>
        {/* Grid de pontos */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        {/* Noise texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }} />
      <SectionDivider cross="right" />

        <div className="relative z-10 max-w-[1020px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-stretch px-8 md:px-12 py-10 md:py-14">

          {/* LEFT — copy */}
          <div className="fade-up">
          <h2
            className="font-display font-bold text-4xl md:text-[42px] leading-[1.1] tracking-tight text-[#fafafa] mb-4"
            style={{ letterSpacing: "-.3px" }}
          >
            Você pode estar pagando imposto a mais{" "}
            <em
              className="not-italic"
              style={{
                background: "linear-gradient(180deg, #6644f2, #a78bff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >e nem percebe.</em>
          </h2>
          <p className="text-[15px] leading-[1.75] text-[#e0e0e0] mb-6 max-w-[420px]">
            Muitos desenvolvedores só descobrem depois que abriram o CNPJ que estavam pagando mais do que precisavam.
            Descubra em segundos uma estimativa real para o seu cenário.
          </p>

          {/* Stats card — editorial / dados */}
          <div
            className="rounded-xl p-5 md:p-6"
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="font-display font-bold text-[16px] md:text-[19px] leading-[1.25] text-[#fafafa] mb-4" style={{ letterSpacing: "-.3px" }}>
              <span style={{ color: "#a78bff" }}>6 em cada 10</span> devs PJ pagam imposto a mais
            </p>
            <div className="flex flex-col gap-0">
              {[
                { label: "Pagam a mais", value: 63, grad: "#bbb", glow: "rgba(255,255,255,0.12)", pattern: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)" },
                { label: "Regime errado", value: 48, grad: "#bbb", glow: "rgba(255,255,255,0.12)", pattern: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)" },
                { label: "Sabem quanto pagam", value: 22, grad: "#bbb", glow: "rgba(255,255,255,0.12)", pattern: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)" },
              ].map((bar, i) => (
                <div key={bar.label}>
                  <div className="flex items-center gap-3 py-2.5">
                    <span className="text-[10px] text-white/50 w-[105px] flex-shrink-0">{bar.label}</span>
                    <div className="flex-1 h-[8px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{
                          width: barsVisible ? `${bar.value}%` : "0%",
                          background: bar.grad,
                          boxShadow: barsVisible ? `0 0 16px ${bar.glow}, 0 0 4px ${bar.glow}` : "none",
                          transition: `width 2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.4}s, box-shadow 2s ease ${i * 0.4}s`,
                        }}
                      >
                        <div className="absolute inset-0" style={{ backgroundImage: bar.pattern }} />
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-display font-bold w-[32px] text-right transition-colors duration-500"
                      style={{
                        color: barsVisible ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.25)",
                        transitionDelay: `${i * 0.4 + 1}s`,
                      }}
                    >
                      {animatedValues[i]}%
                    </span>
                  </div>
                  {i < 2 && <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-bold text-[20px]" style={{ color: "#a78bff" }}>R$847</span>
                <span className="text-[10px] text-white/40">pagos a mais por mês, em média</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator card */}
        <div className="fade-up flex flex-col">
          <div
            className="relative rounded-2xl flex-1 flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.04) 100%)",
              backdropFilter: "blur(24px) saturate(1.6)",
              WebkitBackdropFilter: "blur(24px) saturate(1.6)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* Brilho branco no topo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] pointer-events-none" style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), rgba(255,255,255,0.6), rgba(255,255,255,0.4), transparent)",
            }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[60px] pointer-events-none" style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.10) 0%, transparent 70%)",
            }} />

          <div className="relative p-5 md:p-6 flex-1 flex flex-col">
            {/* Card header */}
            <div className="flex items-center justify-between mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #7553ff, #5a3de6)", boxShadow: "0 4px 12px rgba(117,83,255,0.3)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="12" y2="14" />
                  </svg>
                </div>
                <span className="font-display font-semibold text-[13px] text-[#fafafa]">Simular cenário</span>
              </div>
              <span
                className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "rgba(117,83,255,0.15)", color: "#a78bff", border: "1px solid rgba(117,83,255,0.30)" }}
              >
                Gratuito
              </span>
            </div>

            <p className="text-[12px] text-white/50 mb-5 leading-relaxed">
              Preencha abaixo e descubra em segundos quanto você pode economizar.
            </p>

            {/* Field 1 — situação */}
            <div className="mb-4">
              <label className="block text-[10px] uppercase tracking-[0.10em] text-white/40 font-medium mb-2">
                Você trabalha para uma empresa:
              </label>
              <div className="flex gap-2 flex-wrap">
                {situacoes.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSituacao(s.value)}
                    className="text-[12px] font-medium px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                    style={{
                      background: situacao === s.value ? "rgba(117,83,255,0.15)" : "rgba(255,255,255,0.05)",
                      border: situacao === s.value ? "1px solid rgba(117,83,255,0.50)" : "1px solid rgba(255,255,255,0.08)",
                      color: situacao === s.value ? "#a78bff" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2 — faturamento */}
            <div className="mb-5">
              <label className="block text-[10px] uppercase tracking-[0.10em] text-white/40 font-medium mb-2">
                Seu faturamento mensal (em R$)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={faturamento}
                onChange={handleFaturamento}
                className="w-full rounded-xl px-4 py-3 text-[14px] text-[#fafafa] placeholder-white/25 outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "var(--font-outfit)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(117,83,255,0.60)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(117,83,255,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <p className="mt-1.5 text-[10px] text-white/30">Valor bruto mensal, antes dos impostos</p>
            </div>

            {/* Button */}
            <div className="mt-auto" />
            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold rounded-xl py-3 transition-all duration-300 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7553ff, #5a3de6)",
                border: "1px solid rgba(117,83,255,0.5)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(117,83,255,0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 30px rgba(117,83,255,0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(117,83,255,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              VER MEU RESULTADO
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <p className="mt-2 text-center text-[10px] text-white/30">
              Resultado instantâneo · Sem cadastro
            </p>
          </div>
        </div>
        </div>

        </div>
      </div>
    </section>
  );
}
