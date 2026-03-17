"use client";
import { useEffect, useRef, useState } from "react";

const CALC_URL = "https://contadev.com.br/calculadora";

const situacoes = [
  { value: "brasileira",     label: "🇧🇷 Brasileira" },
  { value: "internacional",  label: "🇪🇺 Internacional" },
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

  function handleFaturamento(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setFaturamento(digits ? formatBRL(e.target.value) : "");
  }

  function handleSubmit() {
    const params = new URLSearchParams({ situacao, faturamento });
    window.open(`${CALC_URL}?${params}`, "_blank", "noopener");
  }

  return (
    <section
      id="calculadora"
      ref={ref}
      className="relative py-8 md:py-14 px-5 md:px-6 overflow-hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="relative z-10 max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14 items-center">

        {/* LEFT — copy */}
        <div className="fade-up">
          <span className="section-label">Calculadora de impostos</span>
          <h2
            className="font-display font-bold text-4xl md:text-[42px] leading-[1.1] tracking-tight text-[#fafafa] mb-5"
            style={{ letterSpacing: "-.3px" }}
          >
            Você pode estar pagando imposto a mais como PJ{" "}
            <em className="not-italic gradient-text">e nem percebe.</em>
          </h2>
          <p className="text-[15px] leading-[1.75] text-[#e0e0e0] mb-8 max-w-[420px]">
            Muitos desenvolvedores só descobrem depois que abriram o CNPJ que estavam pagando mais imposto do que precisavam.
            Esta calculadora mostra, em segundos, uma estimativa do valor mínimo de imposto para o seu cenário.
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

        {/* RIGHT — calculator card */}
        <div
          className="fade-up glass-card-featured p-7 md:p-9"
          style={{
            transitionDelay: "120ms",
          }}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(117,83,255,0.15)", border: "1px solid rgba(117,83,255,0.25)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8f6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="8" y1="10" x2="16" y2="10" />
                  <line x1="8" y1="14" x2="12" y2="14" />
                </svg>
              </div>
              <span className="font-display font-semibold text-[13px] text-[#fafafa]">Simular cenário</span>
            </div>
            <span
              className="text-[10px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(117,83,255,0.12)", color: "#8f6fff", border: "1px solid rgba(117,83,255,0.20)" }}
            >
              Gratuito
            </span>
          </div>

          {/* Field 1 — situação */}
          <div className="mb-6">
            <label className="block text-[11px] uppercase tracking-[0.10em] text-white/35 font-medium mb-3">
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
                    color: situacao === s.value ? "#8f6fff" : "rgba(250,250,250,0.6)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2 — faturamento */}
          <div className="mb-8">
            <label className="block text-[11px] uppercase tracking-[0.10em] text-white/35 font-medium mb-3">
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
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontFamily: "var(--font-outfit)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(117,83,255,0.50)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
              />
            </div>
            <p className="mt-2 text-[11px] text-white/35">Valor que você recebe por mês</p>
          </div>

          {/* CTA */}
          <button
            onClick={handleSubmit}
            className="btn-primary w-full justify-center text-[14px]"
            style={{ padding: "14px 24px", borderRadius: "12px" }}
          >
            FALE COM UM ESPECIALISTA
          </button>

          <p className="mt-4 text-center text-[11px] text-white/35">
            Você será direcionado para a calculadora completa
          </p>
        </div>
      </div>
    </section>
  );
}
