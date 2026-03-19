"use client";
import { useEffect, useRef } from "react";
import SectionDivider from "@/components/SectionDivider";

const features = [
  "Abertura de CNPJ em até 24h, 100% digital",
  "Emissão de NF com um clique, para qualquer município",
  "Invoices em inglês para clientes internacionais",
  "Declaração de IR automatizada, sem você acompanhar",
  "Atendimento direto via WhatsApp com especialista",
];

function CheckIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="flex-shrink-0"
      style={{ marginTop: "2px" }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Technology() {
  const ref = useRef<HTMLDivElement>(null);

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
    <section
      id="tecnologia"
      ref={ref}
      className="relative px-5 md:px-6"
    >
      <SectionDivider cross="left" />
      <div className="relative z-10 max-w-[1020px] mx-auto my-8 md:my-12 flex flex-col md:flex-row-reverse items-center gap-5 md:gap-10">

        {/* LEFT — copy */}
        <div className="w-full md:w-[420px] flex-shrink-0 fade-up">
          <h2
            className="font-display font-bold text-4xl md:text-[38px] leading-[1.12] tracking-tight text-[#fafafa] mb-4"
            style={{ letterSpacing: "-.3px" }}
          >
            Tudo que você precisa,{" "}
            <em className="not-italic gradient-text">em uma tela.</em>
          </h2>
          <p className="text-[15px] leading-[1.7] text-[#e0e0e0] mb-5">
            De notas fiscais a declarações, nossa plataforma centraliza toda a sua operação.
            Simples, rápida e feita para desenvolvedores.
          </p>

          <ul className="flex flex-col gap-3 mb-6">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] text-[#e0e0e0] leading-[1.6] fade-up"
                style={{ transitionDelay: `${(i + 1) * 70}ms` }}
              >
                <span className="text-[#7553ff]"><CheckIcon /></span>
                {f}
              </li>
            ))}
          </ul>

        </div>

        {/* RIGHT — platform mockup */}
        <div
          className="hidden md:block flex-1 relative fade-up"
          style={{ height: 460, transitionDelay: "200ms" }}
        >
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(117,83,255,0.22)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* Bottom fade */}
            <div className="absolute left-0 right-0 bottom-0 h-28 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to top, #1f1f1f, transparent)" }} />

            {/* App header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#7553ff] flex items-center justify-center font-display font-bold text-[10px] text-white">C</div>
                <span className="font-display font-bold text-[13px] text-[#fafafa]">ContaDev</span>
              </div>
              <button className="bg-[#7553ff] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wide">
                EMITIR NF
              </button>
            </div>

            {/* App body */}
            <div className="flex h-[calc(100%-49px)]">
              {/* Sidebar */}
              <div className="w-32 bg-[#1f1f1f] border-r border-white/[0.04] py-4 flex flex-col gap-0.5">
                {[
                  { label: "Dashboard",     active: false },
                  { label: "Notas Fiscais", active: true },
                  { label: "Invoices",      active: false },
                  { label: "Declarações",   active: false },
                  { label: "Suporte",       active: false },
                ].map(({ label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-4 py-2.5 ${active ? "bg-[#7553ff]/15" : ""}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#8f6fff]" : "bg-white/35"}`} />
                    <span className={`text-[10px] ${active ? "text-[#8f6fff] font-medium" : "text-white/35"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[13px] font-semibold text-[#fafafa]">Notas Fiscais</h3>
                  <span className="text-[10px] text-white/35">Março 2026</span>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Total Emitido", val: "R$ 93.000", accent: true },
                    { label: "NFs Emitidas",  val: "3",         accent: true },
                    { label: "Pendentes",     val: "1",         accent: false },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#1c1c1c] rounded-xl p-2.5 border border-white/5">
                      <p className="text-[7px] text-white/35 uppercase tracking-wider mb-1">{s.label}</p>
                      <p
                        className="font-display font-bold text-[13px]"
                        style={{ color: s.accent ? "#8f6fff" : "#9CA3AF" }}
                      >
                        {s.val}
                      </p>
                    </div>
                  ))}
                </div>

                {/* NF list */}
                <div className="flex flex-col gap-2">
                  {[
                    { num: "#0042", client: "Chatigo Pixa",    val: "R$ 42.000", status: "Paga",         ok: true },
                    { num: "#0041", client: "Remote Tech LLC", val: "R$ 33.000", status: "Paga",         ok: true },
                    { num: "#0040", client: "Startup XYZ",     val: "R$ 18.000", status: "Processando",  ok: false },
                  ].map((nf) => (
                    <div
                      key={nf.num}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/5"
                      style={{ background: "#1c1c1c" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold"
                          style={{
                            background: nf.ok ? "rgba(16,185,129,0.12)" : "rgba(117,83,255,0.12)",
                            color: nf.ok ? "#34d399" : "#8f6fff",
                          }}
                        >
                          NF
                        </div>
                        <div>
                          <p className="text-[10px] text-[#fafafa] font-medium">{nf.client}</p>
                          <p className="text-[8px] text-white/35">{nf.num}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-semibold text-[#8f6fff]">{nf.val}</p>
                        <p className={`text-[8px] ${nf.ok ? "text-emerald-400" : "text-white/35"}`}>
                          ● {nf.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
