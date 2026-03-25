"use client";
import { useEffect, useRef, useState } from "react";
import SectionDivider from "@/components/SectionDivider";
import { useFormModal } from "@/components/FormContext";

/* Hacker symbol sets that cycle */
const symbolSets = [
  ["{}", "</>", "$ _", "=>", "[]", "# !", "//", "&&", "||", "**", "!=", "<<", "~>"],
  ["fn()", "0x3F", "let", "null", "===", ">>>", "async", "0b10", "pub", "use", "mut", "ref", "new"],
  ["const", "::new", "map()", "0xff", "yield", "pipe", "impl", "sudo", "git", "npm", "run", "dev", "src"],
];

/* Scramble chars for glitch effect */
const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789abcdef";
function randomGlitch(len: number) {
  return Array.from({ length: len }, () => glitchChars[Math.floor(Math.random() * glitchChars.length)]).join("");
}

/* Rain drops — each has its own column (x) and fall speed */
const rainDrops = [
  { x: 4, dur: 18, delay: 0, size: 11 },
  { x: 12, dur: 22, delay: 3, size: 10 },
  { x: 22, dur: 20, delay: 7, size: 11 },
  { x: 32, dur: 24, delay: 1, size: 10 },
  { x: 42, dur: 19, delay: 5, size: 11 },
  { x: 52, dur: 23, delay: 2, size: 10 },
  { x: 62, dur: 21, delay: 8, size: 11 },
  { x: 72, dur: 25, delay: 4, size: 10 },
  { x: 82, dur: 20, delay: 6, size: 11 },
  { x: 90, dur: 22, delay: 1.5, size: 10 },
  { x: 8, dur: 26, delay: 9, size: 10 },
  { x: 48, dur: 21, delay: 11, size: 10 },
  { x: 96, dur: 23, delay: 3.5, size: 10 },
];

function HackerRain() {
  const [setIndex, setSetIndex] = useState(0);
  const [displayTexts, setDisplayTexts] = useState<string[]>(symbolSets[0]);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (setIndex + 1) % symbolSets.length;
      const targets = symbolSets[nextIndex];
      setGlitching(true);

      let scrambleCount = 0;
      const scrambleInterval = setInterval(() => {
        scrambleCount++;
        setDisplayTexts(
          targets.map((t, i) => {
            if (scrambleCount > 4 + i * 2) return t;
            return randomGlitch(t.length);
          })
        );
        if (scrambleCount > 4 + (targets.length - 1) * 2) {
          clearInterval(scrambleInterval);
          setDisplayTexts(targets);
          setGlitching(false);
          setSetIndex(nextIndex);
        }
      }, 50);
    }, 2500);
    return () => clearInterval(interval);
  }, [setIndex]);

  return (
    <>
      {rainDrops.map((drop, i) => (
        <div
          key={i}
          className="absolute pointer-events-none font-mono select-none"
          style={{
            left: `${drop.x}%`,
            top: "0",
            fontSize: `${drop.size}px`,
            color: glitching ? "rgba(120,120,130,0.10)" : "rgba(120,120,130,0.14)",
            fontWeight: 600,
            textShadow: glitching ? "0 0 6px rgba(120,120,130,0.15)" : "none",
            transition: "color 0.15s, text-shadow 0.15s",
            animation: `ctaRainFall ${drop.dur}s linear ${drop.delay}s infinite, ctaBlink 2s ease-in-out infinite`,
          }}
        >
          {displayTexts[i % displayTexts.length]}
        </div>
      ))}
    </>
  );
}

export default function ConsultoriaCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { openForm } = useFormModal();

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="precos"
      ref={ref}
      className="relative"
    >
      <SectionDivider cross="right" />

      <div
        className="relative max-w-[1100px] mx-auto overflow-hidden"
        style={{ background: "#e8e6ef" }}
      >

        {/* Hacker code rain — falling symbols with glitch */}
        <HackerRain />

        {/* Shimmer sweep — wide, slow, soft */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0"
            style={{
              width: "350%",
              height: "100%",
              left: "-100%",
              background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.25) 60%, transparent 70%)",
              animation: "ctaShimmer 10s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
        </div>

        <div className="relative py-12 md:py-16 px-8 md:px-12 text-center">

          {/* Headline */}
          <div className="fade-up">
            <h2
              className="font-display font-bold text-3xl md:text-[40px] leading-[1.12] tracking-tight text-[#1a1a2e] mb-3"
              style={{ letterSpacing: "-.3px" }}
            >
              Fale com quem entende{" "}
              <em className="not-italic" style={{ background: "linear-gradient(135deg, #6644f2, #7553ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                o seu cenário.
              </em>
            </h2>
            <p className="text-[14px] text-[#5a5770] max-w-[440px] mx-auto leading-relaxed mb-6">
              Um especialista analisa sua situação fiscal, monta a melhor estratégia
              e te acompanha do zero. Sem custo pra começar.
            </p>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8 fade-up" style={{ transitionDelay: "100ms" }}>
            {["Consultoria gratuita", "Resposta em minutos", "100% online", "50.8% de economia média"].map((pill) => (
              <span
                key={pill}
                className="text-[12px] font-medium px-4 py-2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  color: "#3a3650",
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {/* CTA — pulsing glow ring + button */}
          <div className="fade-up" style={{ transitionDelay: "200ms" }}>
            <div className="relative inline-block">
              {/* Pulse ring behind button */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "rgba(117,83,255,0.20)",
                  filter: "blur(20px)",
                  animation: "ctaPulse 2.5s ease-in-out infinite",
                }}
              />
              <button
                onClick={openForm}
                className="relative inline-flex items-center gap-2.5 text-[14px] font-semibold rounded-full px-8 py-3.5 transition-all duration-300 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7553ff, #5a3de6)",
                  border: "1px solid rgba(117,83,255,0.5)",
                  color: "#fff",
                  boxShadow: "0 4px 25px rgba(117,83,255,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 35px rgba(117,83,255,0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 25px rgba(117,83,255,0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                FALE COM UM ESPECIALISTA
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "ctaArrow 1.5s ease-in-out infinite" }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
            <p className="text-[11px] text-[#8a879a] mt-3">
              Sem compromisso · Sem custo
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
