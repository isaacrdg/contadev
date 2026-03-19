"use client";
import { useEffect, useRef, useState } from "react";
import SectionDivider from "@/components/SectionDivider";

const faqs = [
  {
    q: "Quanto tempo leva para abrir minha empresa?",
    a: "Em média 24 a 48 horas úteis após o envio dos documentos. Todo o processo é digital, sem cartório e sem fila.",
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
    a: "Sim. Especialistas reais via WhatsApp, com tempo médio abaixo de 1 hora em horário comercial.",
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
    <section id="faq" ref={ref} className="relative">

      <SectionDivider cross="left" />
      <div className="max-w-[1100px] mx-auto" style={{ background: "#1f1f1f" }}>
        <div className="max-w-[1020px] mx-auto px-5 md:px-6 py-10 md:py-14">

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row md:items-stretch gap-10 md:gap-16">

            {/* Left — title */}
            <div className="md:w-[320px] flex-shrink-0 fade-up md:my-auto">
              <h2 className="font-display font-bold text-5xl md:text-[56px] leading-[1.0] tracking-tight text-[#fafafa]" style={{ letterSpacing: "-.3px" }}>
                Perguntas frequentes
              </h2>
            </div>

            {/* Right — accordion */}
            <div className="flex-1 fade-up" style={{ transitionDelay: "80ms" }}>
              {faqs.map((item, i) => (
                <div
                  key={i}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <button
                    className="w-full text-left py-4 md:py-5 flex items-center justify-between gap-6 group transition-all duration-200 hover:pl-2"
                    onClick={() => setOpen(open === i ? null : i)}
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span
                      className="text-[14px] md:text-[15px] font-normal transition-colors duration-300 group-hover:!text-[#fafafa]"
                      style={{ color: open === i ? "#fafafa" : "rgba(250,250,250,0.25)" }}
                    >
                      {item.q}
                    </span>
                    <span
                      className="text-[18px] flex-shrink-0 transition-all duration-300 leading-none group-hover:!text-[#8f6fff]"
                      style={{
                        color: open === i ? "#8f6fff" : "rgba(250,250,250,0.20)",
                        transform: open === i ? "rotate(45deg)" : "none",
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: open === i ? "200px" : "0px" }}
                  >
                    <p className="text-[14px] leading-[1.7] text-white/50 pb-5 font-extralight">
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
