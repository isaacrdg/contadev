"use client";
import { useEffect, useRef } from "react";
import SectionDivider from "@/components/SectionDivider";

const pillars = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Especialista dedicado",
    desc: "Um contador real com foco exclusivo em tech PJ. Nenhum robô, nenhum script. Uma pessoa que entende o seu caso.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Resposta em menos de 1h",
    desc: "Sem ticket, sem fila de suporte. Você manda mensagem e um especialista real responde direto no WhatsApp.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Do CNPJ ao IR",
    desc: "Abertura, gestão contínua, pro-labore, guias e declarações anuais. Tudo acompanhado pela mesma pessoa.",
  },
];

const chatMessages = [
  { dir: "out", text: "Opa! Consegue me ajudar?", time: "2:34 PM" },
  { dir: "in",  text: "Claro!", time: "2:34 PM" },
  { dir: "out", text: "Eita, que rápido kkkk", time: "2:35 PM" },
  { dir: "in",  text: "Pode se acostumar. Esse é o padrão Conta Dev 😊", time: "2:35 PM" },
];

export default function Team() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = ref.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="equipe"
      ref={ref}
      className="relative"
    >
      <SectionDivider cross="right" />
      <div className="relative z-10 max-w-[1100px] mx-auto" style={{ background: "#1f1f1f" }}>
        <div className="max-w-[1020px] mx-auto px-5 md:px-6 py-10 md:py-14 flex flex-col md:flex-row items-stretch gap-5 md:gap-10">

        {/* LEFT — copy */}
        <div className="w-full md:w-[480px] flex-shrink-0 fade-up">
          <h2
            className="font-display font-bold text-4xl md:text-[38px] leading-[1.12] tracking-tight text-[#fafafa] mb-4"
            style={{ letterSpacing: "-.3px" }}
          >
            Plataforma potente.{" "}
            <em className="not-italic gradient-text">Humano do seu lado.</em>
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#e0e0e0] mb-5 max-w-[420px]">
            Automatizamos tudo que pode ser automatizado. Mas cada decisão importante, como regime tributário,
            abertura e declarações, tem um especialista real te guiando de ponta a ponta.
          </p>

          {/* Pillars */}
          <div className="flex flex-col gap-4 mb-6">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className="flex items-start gap-4 fade-up"
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#8f6fff]"
                  style={{ background: "rgba(117,83,255,0.10)", border: "1px solid rgba(117,83,255,0.20)" }}
                >
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-[15px] text-[#fafafa] mb-1">{p.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-[#e0e0e0]">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT — chat */}
        <div className="hidden md:flex flex-col fade-up md:max-w-[290px] md:mx-auto" style={{ transitionDelay: "200ms" }}>

          {/* Chat */}
          <div
            className="glass-card overflow-hidden flex-1 flex flex-col"
          >
            {/* Chat header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-[10px] text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7553ff, #5a3de6)" }}
              >RS</div>
              <div className="flex flex-col">
                <span className="text-[12px] text-[#fafafa] font-medium leading-none">Rafael Santos</span>
                <span className="text-[10px] text-white/35 leading-none mt-1">Contador · ContaDev</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400">online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-3 p-4 flex-1">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.dir === "out" ? "items-end" : "items-start"}`}>
                  <span
                    className="text-[12px] leading-[1.5] px-3.5 py-2.5 max-w-[280px]"
                    style={{
                      background: m.dir === "out" ? "#7553ff" : "rgba(255,255,255,0.06)",
                      color: m.dir === "out" ? "#fff" : "rgba(250,250,250,0.6)",
                      borderRadius: m.dir === "out" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    }}
                  >
                    {m.text}
                  </span>
                  <span className="text-[9px] text-white/25 mt-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Input field */}
            <div className="px-4 py-3 border-t border-white/5 mt-auto">
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-[12px] text-white/25 flex-1">Escreva uma mensagem...</span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(117,83,255,0.20)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8f6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
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
