"use client";
import { useEffect, useRef } from "react";

const journey = [
  {
    step: "01",
    title: "Nós te entendemos",
    desc: "Chegou perdido? A gente ilumina o caminho. Valores, processos, prazos e próximos passos. Independente da sua dúvida, nosso time te orienta com clareza.",
  },
  {
    step: "02",
    title: "Tecnologia que facilita de verdade",
    desc: "Nossa plataforma automatiza sua rotina, do onboarding ao primeiro pagamento, passando por notas e guias. Tudo fica acessível, organizado e a poucos cliques de distância.",
  },
  {
    step: "03",
    title: "Um especialista a um clique de distância",
    desc: "Sem fila, sem chatbot e sem repetir sua história. Você fala com um contador dedicado, que conhece seu contexto e acompanha sua operação de perto.",
  },
  {
    step: "04",
    title: "A plataforma cuida da rotina. Seu contador cuida de você.",
    desc: "Notas, guias e pagamentos seguem com fluidez no dia a dia. Quando surge uma decisão importante, você tem ao lado alguém que já conhece seu cenário e sabe te orientar com precisão.",
  },
];

/* ---------- Illustrations (CSS/SVG, no videos) ---------- */

function IllustrationBase({ children, tint }: { children: React.ReactNode; tint: string }) {
  return (
    <div
      className="w-full h-full relative flex items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 50% 35%, ${tint} 0%, rgba(8,8,14,0) 70%), #131119`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at 50% 50%, #000 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 40%, transparent 80%)",
        }}
      />
      <div className="relative z-10 w-full h-full flex items-center justify-center">{children}</div>
    </div>
  );
}

/* 01 — Chat: balões trocando mensagens (orientação) */
function Step01() {
  return (
    <IllustrationBase tint="rgba(117,83,255,0.18)">
      <div className="flex flex-col gap-2.5 w-[78%] max-w-[320px]">
        <div className="jb jb-in" style={{ animationDelay: "0.2s" }}>
          <div className="jb-dot" />
          <span>Como funciona o MEI?</span>
        </div>
        <div className="jb jb-out" style={{ animationDelay: "1.1s" }}>
          <span>A gente cuida disso pra você ✨</span>
        </div>
        <div className="jb jb-in" style={{ animationDelay: "2.0s" }}>
          <div className="jb-dot" />
          <span>E os impostos?</span>
        </div>
        <div className="jb jb-out jb-typing" style={{ animationDelay: "2.9s" }}>
          <span className="dots"><i /><i /><i /></span>
        </div>
      </div>
      <style jsx>{`
        .jb {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 14px; border-radius: 14px;
          font-size: 13px; line-height: 1.2;
          opacity: 0; transform: translateY(8px);
          animation: jbIn 0.5s ease-out forwards;
          backdrop-filter: blur(6px);
        }
        .jb-in {
          align-self: flex-start;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e8e8ee;
          border-bottom-left-radius: 4px;
        }
        .jb-out {
          align-self: flex-end;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 8px 24px -8px rgba(102,68,242,0.5);
        }
        .jb-dot {
          width: 6px; height: 6px; border-radius: 99px;
          background: #8f6fff; box-shadow: 0 0 8px #8f6fff;
        }
        .dots { display: inline-flex; gap: 4px; align-items: center; height: 14px; }
        .dots i {
          width: 5px; height: 5px; border-radius: 99px; background: #fff;
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        .dots i:nth-child(2) { animation-delay: 0.15s; }
        .dots i:nth-child(3) { animation-delay: 0.3s; }
        @keyframes jbIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </IllustrationBase>
  );
}

/* 02 — Dashboard: cards de automação aparecendo + barra progredindo */
function Step02() {
  const ICON_STROKE = "rgba(255,255,255,0.75)";
  const IconFile = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ICON_STROKE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
  const IconReceipt = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ICON_STROKE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  );
  const IconBank = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ICON_STROKE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7 12 2" />
    </svg>
  );
  const IconCheck = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <IllustrationBase tint="rgba(59,130,246,0.14)">
      <div className="w-[82%] max-w-[340px] flex flex-col gap-2.5">
        <div className="dash-card dc-1">
          <div className="dc-icon"><IconFile /></div>
          <div className="dc-body">
            <div className="dc-title">Nota fiscal emitida</div>
            <div className="dc-bar"><div className="dc-fill" style={{ animationDelay: "0.4s" }} /></div>
          </div>
          <span className="dc-check"><IconCheck /></span>
        </div>
        <div className="dash-card dc-2">
          <div className="dc-icon"><IconReceipt /></div>
          <div className="dc-body">
            <div className="dc-title">DAS gerado automaticamente</div>
            <div className="dc-bar"><div className="dc-fill" style={{ animationDelay: "0.9s" }} /></div>
          </div>
          <span className="dc-check"><IconCheck /></span>
        </div>
        <div className="dash-card dc-3">
          <div className="dc-icon"><IconBank /></div>
          <div className="dc-body">
            <div className="dc-title">Conciliação bancária</div>
            <div className="dc-bar"><div className="dc-fill" style={{ animationDelay: "1.4s" }} /></div>
          </div>
          <span className="dc-check"><IconCheck /></span>
        </div>
      </div>
      <style jsx>{`
        .dash-card {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 13px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          backdrop-filter: blur(6px);
          opacity: 0; transform: translateX(-12px);
          animation: cardIn 0.55s ease-out forwards;
        }
        .dc-1 { animation-delay: 0.2s; }
        .dc-2 { animation-delay: 0.7s; }
        .dc-3 { animation-delay: 1.2s; }
        .dc-icon {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .dc-body { flex: 1; min-width: 0; }
        .dc-title {
          font-size: 11.5px; color: #e8e8ee; font-weight: 500;
          margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dc-bar {
          height: 3px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden;
        }
        .dc-fill {
          height: 100%; width: 0;
          background: linear-gradient(90deg, #6644f2, #8f6fff);
          border-radius: 99px;
          animation: fillBar 0.9s ease-out forwards;
        }
        .dc-check {
          opacity: 0; display: inline-flex; align-items: center; justify-content: center;
          animation: checkIn 0.3s ease-out forwards;
        }
        .dc-1 .dc-check { animation-delay: 1.3s; }
        .dc-2 .dc-check { animation-delay: 1.8s; }
        .dc-3 .dc-check { animation-delay: 2.3s; }
        @keyframes cardIn { to { opacity: 1; transform: translateX(0); } }
        @keyframes fillBar { to { width: 100%; } }
        @keyframes checkIn { to { opacity: 1; } }
      `}</style>
    </IllustrationBase>
  );
}

/* 03 — Especialista: avatar + cursor pulsando ao "clicar" */
function Step03() {
  return (
    <IllustrationBase tint="rgba(117,83,255,0.16)">
      <div className="relative flex flex-col items-center gap-4">
        <div className="spec-card">
          <div className="spec-avatar">
            <div className="spec-status" />
          </div>
          <div className="spec-info">
            <div className="spec-name">Ana Ribeiro</div>
            <div className="spec-role">Sua contadora dedicada</div>
          </div>
          <button className="spec-btn">
            Falar agora
          </button>
        </div>
        <div className="cursor">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 2L17 9L10 11L7 17L3 2Z" fill="#fff" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
          </svg>
          <div className="ripple" />
        </div>
      </div>
      <style jsx>{`
        .spec-card {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          backdrop-filter: blur(8px);
          min-width: 280px;
          opacity: 0; transform: translateY(8px);
          animation: cardIn 0.6s ease-out 0.1s forwards;
        }
        .spec-avatar {
          width: 42px; height: 42px; border-radius: 99px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          position: relative; flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.1);
        }
        .spec-avatar::after {
          content: "AR"; position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 12px; font-weight: 600;
        }
        .spec-status {
          position: absolute; bottom: 1px; right: 1px;
          width: 11px; height: 11px; border-radius: 99px;
          background: #22c55e; border: 2px solid #131119;
          animation: pulse 2s ease-in-out infinite;
        }
        .spec-info { flex: 1; }
        .spec-name { font-size: 13px; color: #fafafa; font-weight: 600; }
        .spec-role { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 1px; }
        .spec-btn {
          font-size: 11px; font-weight: 600;
          padding: 7px 12px; border-radius: 99px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff; border: none; cursor: pointer;
          box-shadow: 0 6px 18px -6px rgba(102,68,242,0.6);
          animation: btnPulse 2.4s ease-in-out 1.4s infinite;
        }
        .cursor {
          position: absolute; right: 18%; bottom: 28%;
          opacity: 0;
          animation: cursorIn 0.5s ease-out 1.0s forwards, cursorClick 2.4s ease-in-out 1.4s infinite;
        }
        .ripple {
          position: absolute; top: 50%; left: 50%;
          width: 8px; height: 8px; border-radius: 99px;
          background: rgba(143,111,255,0.6);
          transform: translate(-50%, -50%);
          animation: ripple 2.4s ease-out 1.6s infinite;
        }
        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6), 0 0 0 2px #131119; }
          50% { box-shadow: 0 0 0 5px rgba(34,197,94,0), 0 0 0 2px #131119; }
        }
        @keyframes cursorIn { to { opacity: 1; } }
        @keyframes cursorClick {
          0%, 90%, 100% { transform: scale(1); }
          45% { transform: scale(0.85); }
        }
        @keyframes ripple {
          0% { width: 8px; height: 8px; opacity: 0.7; }
          100% { width: 60px; height: 60px; opacity: 0; }
        }
        @keyframes btnPulse {
          0%, 90%, 100% { transform: scale(1); }
          45% { transform: scale(0.96); }
        }
      `}</style>
    </IllustrationBase>
  );
}

/* 04 — Fluxo: timeline com checks aparecendo + pessoa ao lado */
function Step04() {
  const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
  const StarIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#c4b1ff" stroke="#c4b1ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
  return (
    <IllustrationBase tint="rgba(99,102,241,0.14)">
      <div className="flex items-center gap-5 w-[82%] max-w-[340px]">
        <div className="flex-1 flex flex-col gap-3">
          <div className="tl-row tlr-1">
            <div className="tl-check"><CheckIcon /></div>
            <span>Notas emitidas</span>
          </div>
          <div className="tl-row tlr-2">
            <div className="tl-check"><CheckIcon /></div>
            <span>Guias pagas</span>
          </div>
          <div className="tl-row tlr-3">
            <div className="tl-check"><CheckIcon /></div>
            <span>Relatórios prontos</span>
          </div>
          <div className="tl-row tlr-4">
            <div className="tl-check tl-star"><StarIcon /></div>
            <span>Decisão estratégica</span>
          </div>
        </div>
        <div className="person">
          <div className="p-avatar">
            <div className="p-status" />
          </div>
          <div className="p-label">Você</div>
        </div>
      </div>
      <style jsx>{`
        .tl-row {
          display: flex; align-items: center; gap: 10px;
          font-size: 12.5px; color: #e8e8ee;
          padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          opacity: 0; transform: translateX(-10px);
          animation: rowIn 0.5s ease-out forwards;
        }
        .tlr-1 { animation-delay: 0.2s; }
        .tlr-2 { animation-delay: 0.6s; }
        .tlr-3 { animation-delay: 1.0s; }
        .tlr-4 {
          animation-delay: 1.5s;
          background: linear-gradient(135deg, rgba(102,68,242,0.18), rgba(81,41,240,0.08));
          border-color: rgba(143,111,255,0.35);
        }
        .tl-check {
          width: 18px; height: 18px; border-radius: 99px;
          background: rgba(110,231,183,0.18);
          color: #6ee7b7; font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .tl-star {
          background: rgba(143,111,255,0.25); color: #c4b1ff;
          box-shadow: 0 0 12px rgba(143,111,255,0.4);
        }
        .person {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          opacity: 0;
          animation: rowIn 0.6s ease-out 0.4s forwards;
        }
        .p-avatar {
          width: 44px; height: 44px; border-radius: 99px;
          background: linear-gradient(135deg, #5129f0, #6644f2);
          position: relative;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 8px 22px -8px rgba(102,68,242,0.5);
        }
        .p-avatar::before {
          content: ""; position: absolute; top: 9px; left: 50%;
          transform: translateX(-50%);
          width: 14px; height: 14px; border-radius: 99px;
          background: #fff; opacity: 0.95;
        }
        .p-avatar::after {
          content: ""; position: absolute; bottom: 5px; left: 50%;
          transform: translateX(-50%);
          width: 26px; height: 14px; border-radius: 99px 99px 0 0;
          background: #fff; opacity: 0.95;
        }
        .p-status {
          position: absolute; bottom: 2px; right: 2px; z-index: 2;
          width: 11px; height: 11px; border-radius: 99px;
          background: #22c55e; border: 2px solid #131119;
        }
        .p-label {
          font-size: 10.5px; color: rgba(255,255,255,0.55);
          font-weight: 500;
        }
        @keyframes rowIn { to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </IllustrationBase>
  );
}

const illustrations = [Step01, Step02, Step03, Step04];

export default function Benefits() {
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
    <section id="jornada" ref={ref} className="relative py-6 md:py-10 overflow-hidden">
      <div className="max-w-[1020px] mx-auto px-6">
        {journey.map((item, i) => {
          const isEven = i % 2 === 1;
          const Illustration = illustrations[i];
          return (
            <div
              key={item.step}
              className={`fade-up grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 lg:gap-12 items-center ${
                i === 0 ? "pt-5 md:pt-8 pb-5 md:pb-8" : "py-5 md:py-8 border-t border-white/5"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Text column */}
              <div className={`max-w-lg ${isEven ? "md:order-2" : ""}`}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  {item.step}
                </p>
                <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight mt-3 mb-4 text-[#fafafa]">
                  {item.title}
                </h3>
                <p className="text-[15px] md:text-base leading-relaxed text-[#e0e0e0]">
                  {item.desc}
                </p>
              </div>

              {/* Illustration column */}
              <div
                className={`relative rounded-xl overflow-hidden bg-white/[0.03]
                  w-full aspect-[4/3]
                  ${isEven ? "md:order-1" : ""}
                `}
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Illustration />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
