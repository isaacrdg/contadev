"use client";
import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "Quanto tempo leva para abrir minha empresa?",
    a: "Em média 24 a 48 horas úteis após o envio dos documentos. Todo o processo é digital — sem cartório, sem fila.",
  },
  {
    q: "Qual regime tributário é melhor para mim?",
    a: "Depende do seu faturamento e atividade. Para a maioria dos devs, o Simples Nacional com anexo III ou V é o mais vantajoso. Nossa equipe faz essa análise na conversa inicial.",
  },
  {
    q: "Consigo emitir invoice para clientes internacionais?",
    a: "Sim! A plataforma tem gerador de invoices em inglês, no padrão internacional. Você gera, envia e controla tudo direto pela ContaDev.",
  },
  {
    q: "E se eu já tiver uma contabilidade? Posso migrar?",
    a: "Sim, migração totalmente assistida. Nossa equipe cuida de toda a burocracia da transferência sem você precisar se preocupar.",
  },
  {
    q: "O suporte realmente responde rápido?",
    a: "Sim. Especialistas reais via WhatsApp, com tempo médio abaixo de 1 hora em horário comercial. Unique Plus tem SLA de 4 horas.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem fidelidade e sem multa. Basta avisar com 30 dias de antecedência.",
  },
];

export default function FAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(0);

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

  return (
    <section id="faq" ref={ref} className="relative py-16 px-6 md:px-12"
      style={{ background: "#0F0F1A" }}>

      <div className="max-w-[760px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10 fade-up">
          <span className="section-label" style={{ display: "inline-block" }}>Dúvidas</span>
          <h2 className="font-display font-extrabold text-4xl md:text-[38px] leading-[1.15] tracking-tight text-[#F4F4F8]" style={{ letterSpacing: "-.3px" }}>
            Perguntas frequentes
          </h2>
        </div>

        {/* Accordion */}
        <div className="fade-up" style={{ transitionDelay: "80ms" }}>
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border-b"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <button
                className="w-full text-left py-6 flex items-center justify-between gap-4 transition-colors duration-200 group"
                onClick={() => setOpen(open === i ? null : i)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <span className={`text-[15px] font-medium transition-colors ${open === i ? "text-[#A78BFA]" : "text-[#F4F4F8]"}`}>
                  {item.q}
                </span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[#A78BFA] font-bold text-[14px] transition-all duration-300"
                  style={{
                    background: "rgba(124,58,237,0.10)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </div>
              </button>
              <div
                className="overflow-hidden transition-all duration-350"
                style={{ maxHeight: open === i ? "300px" : "0px" }}
              >
                <p className="text-[14px] leading-[1.7] text-[#9CA3AF] pb-6">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
