"use client";
import { useEffect, useRef, useState } from "react";

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contato" ref={ref} className="relative py-28 px-6 md:px-12 overflow-hidden"
      style={{ background: "#08080E" }}>

      {/* Glow */}
      <div className="absolute pointer-events-none"
        style={{
          top: "-200px", left: "15%",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)",
          opacity: .6,
        }}
      />

      <div className="relative z-10 max-w-[580px] mx-auto text-center fade-up">
        <span className="section-label" style={{ display: "inline-block" }}>Contato</span>
        <h2 className="font-display font-extrabold text-4xl md:text-[38px] leading-[1.15] tracking-tight text-[#F4F4F8] mb-3" style={{ letterSpacing: "-.3px" }}>
          Quanto você tá deixando{" "}
          <em className="not-italic gradient-text">na mesa todo mês?</em>
        </h2>
        <p className="text-[15px] leading-[1.7] text-[#9CA3AF] mb-10 max-w-[480px] mx-auto">
          Fale com um especialista hoje e descubra quanto você pode economizar com sua PJ.
        </p>

        {submitted ? (
          <div className="py-12">
            <div className="text-4xl mb-4">✅</div>
            <p className="font-display font-bold text-[20px] text-[#F4F4F8] mb-2">Mensagem enviada!</p>
            <p className="text-[14px] text-[#9CA3AF]">Em breve entraremos em contato. Resposta em até 2 horas em dias úteis.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="text-left flex flex-col gap-4"
          >
            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#9CA3AF] font-medium">Nome completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  required
                  className="rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                  style={{
                    background: "#0F0F1A",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "#F4F4F8",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#9CA3AF] font-medium">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  required
                  className="rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                  style={{
                    background: "#0F0F1A",
                    border: "1px solid rgba(255,255,255,0.07)",
                    color: "#F4F4F8",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#9CA3AF] font-medium">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                required
                className="rounded-xl px-4 py-3 text-[14px] outline-none transition-all"
                style={{
                  background: "#0F0F1A",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#F4F4F8",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>

            {/* Revenue */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#9CA3AF] font-medium">Faturamento mensal aproximado</label>
              <select
                required
                className="rounded-xl px-4 py-3 text-[14px] outline-none transition-all appearance-none cursor-pointer"
                style={{
                  background: "#0F0F1A",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#9CA3AF",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              >
                <option value="" disabled selected>Selecione uma faixa</option>
                <option>Até R$5.000</option>
                <option>R$5.000 – R$20.000</option>
                <option>R$20.000 – R$50.000</option>
                <option>R$50.000 – R$100.000</option>
                <option>Acima de R$100.000</option>
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#9CA3AF] font-medium">Mensagem (opcional)</label>
              <textarea
                rows={3}
                placeholder="Alguma dúvida específica?"
                className="rounded-xl px-4 py-3 text-[14px] outline-none transition-all resize-none"
                style={{
                  background: "#0F0F1A",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#F4F4F8",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-[15px] py-4 mt-2"
            >
              Falar com um especialista →
            </button>
            <p className="text-center text-[12px] text-[#6B7280]">
              Resposta em até 2 horas em dias úteis. Sem compromisso.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
