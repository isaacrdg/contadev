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
      className="relative py-8 md:py-14 px-5 md:px-6 overflow-hidden"
      style={{ background: "#1f1f1f", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="relative z-10 max-w-[1100px] mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-12">

        {/* LEFT — copy */}
        <div className="w-full md:w-[480px] flex-shrink-0 fade-up">
          <span className="section-label">Atendimento</span>
          <h2
            className="font-display font-bold text-4xl md:text-[38px] leading-[1.12] tracking-tight text-[#fafafa] mb-5"
            style={{ letterSpacing: "-.3px" }}
          >
            Plataforma potente.{" "}
            <em className="not-italic gradient-text">Humano do seu lado.</em>
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#e0e0e0] mb-7 max-w-[420px]">
            Automatizamos tudo que pode ser automatizado. Mas cada decisão importante, como regime tributário,
            abertura e declarações, tem um especialista real te guiando de ponta a ponta.
          </p>

          {/* Pillars */}
          <div className="flex flex-col gap-5 mb-8">
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

          <a href="#contato" className="btn-primary fade-up" style={{ fontSize: "14px", transitionDelay: "400ms" }}>
            FALE COM UM ESPECIALISTA
          </a>
        </div>

        {/* RIGHT — specialist card + mini chat */}
        <div className="hidden md:flex flex-1 flex-col gap-4 fade-up" style={{ transitionDelay: "200ms" }}>

          {/* Specialist availability card */}
          <div
            className="glass-card-featured p-6"
          >
            {/* Online status */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
              <span className="text-[11px] text-emerald-400 font-medium">Especialista online agora</span>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #7553ff, #5a3de6)" }}
              >
                RS
              </div>
              <div>
                <p className="font-display font-bold text-[16px] text-[#fafafa]">Rafael Santos</p>
                <p className="text-[12px] text-[#8f6fff]">Contador · CRC Ativo · Especialista em tech PJ</p>
              </div>
            </div>

            <blockquote
              className="text-[14px] leading-[1.7] text-[#e0e0e0] mb-5 pl-4"
              style={{ borderLeft: "2px solid rgba(117,83,255,0.40)" }}
            >
              "Cada cliente é único. Você tem acesso direto a mim, sem intermediários e sem robô."
            </blockquote>

            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "rgba(117,83,255,0.08)", border: "1px solid rgba(117,83,255,0.15)" }}
            >
              <span className="text-[12px] text-[#e0e0e0]">Tempo médio de resposta</span>
              <span className="font-display font-bold text-[14px] text-[#8f6fff]">&lt; 47 min</span>
            </div>
          </div>

          {/* Mini chat snippet */}
          <div
            className="glass-card overflow-hidden"
          >
            {/* Chat header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
              <div className="w-6 h-6 rounded-full bg-[#7553ff] flex items-center justify-center font-display font-bold text-[9px] text-white">C</div>
              <span className="text-[12px] text-[#fafafa] font-medium">ContaDev</span>
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
                      background: m.dir === "out" ? "#7553ff" : "rgba(255,255,255,0.06)",
                      color: m.dir === "out" ? "#fff" : "rgba(250,250,250,0.6)",
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
