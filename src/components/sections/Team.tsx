"use client";
import { useEffect, useRef } from "react";

const pillars = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Especialista dedicado",
    desc: "Um contador real com foco exclusivo em tech PJ. Nenhum robô, nenhum script — uma pessoa que entende o seu caso.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Resposta em menos de 1h",
    desc: "Sem ticket, sem fila de suporte. Você manda mensagem e um especialista real responde — direto no WhatsApp.",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Do CNPJ ao IR",
    desc: "Abertura, gestão contínua, pro-labore, guias e declarações anuais — tudo acompanhado pela mesma pessoa.",
  },
];

const chatMessages = [
  { dir: "in",  text: "Preciso emitir uma NF internacional hoje, como faço?", delay: 0 },
  { dir: "out", text: "Já te mando o link da plataforma. Leva 2 min 👌",       delay: 0 },
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
      className="relative py-16 px-6 md:px-12 overflow-hidden"
      style={{ background: "#0F0F1A" }}
    >
      {/* Glow */}
      <div className="absolute pointer-events-none" style={{
        bottom: "-100px", left: "10%",
        width: 350, height: 350,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)",
      }} />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">

        {/* LEFT — copy */}
        <div className="w-full md:w-[480px] flex-shrink-0 fade-up">
          <span className="section-label">Atendimento</span>
          <h2
            className="font-display font-extrabold text-4xl md:text-[38px] leading-[1.12] tracking-tight text-[#F4F4F8] mb-5"
            style={{ letterSpacing: "-.3px" }}
          >
            Plataforma potente.{" "}
            <em className="not-italic gradient-text">Humano do seu lado.</em>
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#9CA3AF] mb-10 max-w-[420px]">
            Automatizamos tudo que pode ser automatizado. Mas cada decisão importante — regime tributário,
            abertura, declarações — tem um especialista real te guiando, de ponta a ponta.
          </p>

          {/* Pillars */}
          <div className="flex flex-col gap-6 mb-10">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                className="flex items-start gap-4 fade-up"
                style={{ transitionDelay: `${(i + 1) * 100}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#A78BFA]"
                  style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.20)" }}
                >
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-[15px] text-[#F4F4F8] mb-1">{p.title}</h3>
                  <p className="text-[13px] leading-[1.6] text-[#9CA3AF]">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <a href="#contato" className="btn-primary fade-up" style={{ fontSize: "14px", transitionDelay: "400ms" }}>
            Falar com um especialista →
          </a>
        </div>

        {/* RIGHT — specialist card + mini chat */}
        <div className="hidden md:flex flex-1 flex-col gap-4 fade-up" style={{ transitionDelay: "200ms" }}>

          {/* Specialist availability card */}
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "#141420",
              borderColor: "rgba(124,58,237,0.22)",
              boxShadow: "0 0 40px rgba(124,58,237,0.08)",
            }}
          >
            {/* Online status */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span className="text-[11px] text-emerald-400 font-medium">Especialista online agora</span>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
              >
                RS
              </div>
              <div>
                <p className="font-display font-bold text-[16px] text-[#F4F4F8]">Rafael Santos</p>
                <p className="text-[12px] text-[#A78BFA]">Contador · CRC Ativo · Especialista em tech PJ</p>
              </div>
            </div>

            <blockquote
              className="text-[14px] leading-[1.7] text-[#9CA3AF] mb-5 pl-4"
              style={{ borderLeft: "2px solid rgba(124,58,237,0.40)" }}
            >
              "Cada cliente é único. Você tem acesso direto a mim — sem intermediários, sem robô."
            </blockquote>

            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <span className="text-[12px] text-[#9CA3AF]">Tempo médio de resposta</span>
              <span className="font-display font-bold text-[14px] text-[#A78BFA]">&lt; 47 min</span>
            </div>
          </div>

          {/* Mini chat snippet */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "#141420",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
              <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center font-display font-bold text-[9px] text-white">C</div>
              <span className="text-[12px] text-[#F4F4F8] font-medium">ContaDev</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400">online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-2.5 p-4">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.dir === "out" ? "justify-end" : "justify-start"}`}>
                  <span
                    className="text-[12px] leading-[1.5] px-3.5 py-2 max-w-[260px]"
                    style={{
                      background: m.dir === "out" ? "#7C3AED" : "rgba(255,255,255,0.06)",
                      color: m.dir === "out" ? "#fff" : "#9CA3AF",
                      borderRadius: m.dir === "out" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                    }}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
