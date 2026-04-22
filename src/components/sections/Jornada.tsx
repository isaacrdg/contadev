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
    <div className="ill-base">
      {/* Fluid animated orbs */}
      <div className="ill-orb ill-orb-1" style={{ background: tint }} />
      <div className="ill-orb ill-orb-2" style={{ background: tint }} />
      <div className="ill-orb ill-orb-3" style={{ background: "rgba(143,111,255,0.12)" }} />

      {/* Subtle drifting grid */}
      <div className="ill-grid" />

      {/* Content */}
      <div className="ill-content">{children}</div>

      <style jsx>{`
        .ill-base {
          width: 100%; height: 100%;
          position: relative;
          background: #0e0d14;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          isolation: isolate;
        }
        .ill-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0.85;
          pointer-events: none;
          will-change: transform;
        }
        .ill-orb-1 {
          width: 70%; height: 70%;
          top: -25%; left: -20%;
          animation: orbDrift1 22s ease-in-out infinite alternate;
        }
        .ill-orb-2 {
          width: 60%; height: 60%;
          bottom: -25%; right: -15%;
          animation: orbDrift2 26s ease-in-out infinite alternate;
        }
        .ill-orb-3 {
          width: 45%; height: 45%;
          top: 30%; left: 35%;
          animation: orbDrift3 19s ease-in-out infinite alternate;
        }
        .ill-grid {
          position: absolute;
          inset: -20px;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse at 50% 50%, #000 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 40%, transparent 80%);
          animation: gridDrift 30s linear infinite;
          pointer-events: none;
        }
        .ill-content {
          position: relative;
          z-index: 1;
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        @keyframes orbDrift1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(15%, 8%) scale(1.1); }
          100% { transform: translate(8%, 18%) scale(0.95); }
        }
        @keyframes orbDrift2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-10%, -12%) scale(1.08); }
          100% { transform: translate(-15%, -5%) scale(0.92); }
        }
        @keyframes orbDrift3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-12%, 10%) scale(1.15); }
          100% { transform: translate(10%, -8%) scale(0.9); }
        }
        @keyframes gridDrift {
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 44px 44px, 44px 44px; }
        }
      `}</style>
    </div>
  );
}

/* 01 — Conversa real no WhatsApp com a especialista Malu (venda consultiva) */
export function Step01() {
  const DoubleCheck = () => (
    <svg width="13" height="9" viewBox="0 0 16 11" fill="none">
      <path d="M11.071 0.653a.5.5 0 0 1 .713.701l-5.5 5.6a.5.5 0 0 1-.713 0L3.222 4.515a.5.5 0 1 1 .713-.701L6 5.916z" fill="#53bdeb" />
      <path d="M15.071 0.653a.5.5 0 0 1 .713.701l-5.5 5.6a.5.5 0 0 1-.713 0L7.222 4.515a.5.5 0 1 1 .713-.701L10 5.916z" fill="#53bdeb" />
    </svg>
  );

  return (
    <IllustrationBase tint="rgba(117,83,255,0.18)">
      <div className="wa-mock">
        {/* WhatsApp header */}
        <div className="wa-head">
          <button className="wa-back" aria-hidden>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aebac1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className="wa-avatar">M<span className="wa-status" /></div>
          <div className="wa-info">
            <div className="wa-name">Malu · Conta Dev</div>
            <div className="wa-presence">online</div>
          </div>
          <div className="wa-actions">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aebac1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aebac1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
        </div>

        {/* WhatsApp body with conversation */}
        <div className="wa-body">
          {/* Date divider */}
          <div className="wa-divider">
            <span>HOJE</span>
          </div>

          <div className="wa-msg wa-in wa-msg-1">
            <span className="wa-text">
              E aí, Dev! 😊 Sou a Malu, especialista da Conta Dev 💜
            </span>
            <span className="wa-meta">
              <span className="wa-time">14:32</span>
            </span>
          </div>

          <div className="wa-msg wa-in wa-msg-2">
            <span className="wa-text">
              A ideia é entender seu cenário e tirar suas dúvidas. Podemos começar?
            </span>
            <span className="wa-meta">
              <span className="wa-time">14:32</span>
            </span>
          </div>

          <div className="wa-msg wa-out wa-msg-3">
            <span className="wa-text">Podemos sim</span>
            <span className="wa-meta">
              <span className="wa-time">14:33</span>
              <DoubleCheck />
            </span>
          </div>

          <div className="wa-msg wa-in wa-msg-4">
            <span className="wa-text">Me conta um pouco do que te levou a nos procurar?</span>
            <span className="wa-meta">
              <span className="wa-time">14:34</span>
            </span>
          </div>

          <div className="wa-msg wa-out wa-typing wa-msg-5">
            <span className="wa-typing-dots"><i /><i /><i /></span>
          </div>
        </div>

        {/* Input bar */}
        <div className="wa-input">
          <div className="wa-input-field">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <span>Mensagem</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </div>
          <button className="wa-mic">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .wa-mock {
          width: 84%;
          max-width: 270px;
          background: #0b141a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 24px 60px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03);
          opacity: 0;
          transform: translateY(10px);
          animation: waIn 0.55s ease-out 0.1s forwards;
          display: flex;
          flex-direction: column;
        }
        .wa-head {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 9px;
          background: #202c33;
          border-bottom: 1px solid rgba(0,0,0,0.4);
          flex-shrink: 0;
        }
        .wa-back {
          background: transparent;
          border: none;
          padding: 0;
          cursor: default;
          display: flex; align-items: center; justify-content: center;
        }
        .wa-avatar {
          position: relative;
          width: 22px; height: 22px;
          border-radius: 99px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .wa-status {
          position: absolute;
          bottom: 0; right: 0;
          width: 8px; height: 8px;
          border-radius: 99px;
          background: #25d366;
          border: 2px solid #202c33;
          animation: chatPulse 2s ease-in-out infinite;
        }
        .wa-info { flex: 1; min-width: 0; }
        .wa-name {
          font-size: 10.5px;
          color: #e9edef;
          font-weight: 600;
          letter-spacing: -0.005em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wa-presence {
          font-size: 8px;
          color: #25d366;
          margin-top: 1px;
          font-weight: 500;
        }
        .wa-actions {
          display: flex; gap: 9px;
          align-items: center;
          flex-shrink: 0;
        }

        .wa-body {
          padding: 7px 7px 7px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          background-color: #0b141a;
          background-image:
            radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 16px 16px, 16px 16px;
          background-position: 0 0, 8px 8px;
          flex: 1;
          min-height: 0;
          position: relative;
          overflow: hidden;
        }
        .wa-divider {
          display: flex; justify-content: center;
          margin: 1px 0 4px;
        }
        .wa-divider span {
          font-size: 7px;
          color: #8696a0;
          background: rgba(11,20,26,0.85);
          padding: 2px 8px;
          border-radius: 5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .wa-msg {
          max-width: 82%;
          padding: 3px 6px 3px 7px;
          border-radius: 6px;
          font-size: 9px;
          line-height: 1.3;
          position: relative;
          opacity: 0;
          transform: translateY(6px);
          animation: bubbleIn 0.4s ease-out forwards;
          display: inline-flex;
          flex-direction: column;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }
        .wa-in {
          align-self: flex-start;
          background: #202c33;
          color: #e9edef;
          border-top-left-radius: 0;
        }
        .wa-out {
          align-self: flex-end;
          background: #005c4b;
          color: #e9edef;
          border-top-right-radius: 0;
        }
        .wa-text {
          display: block;
          padding-right: 32px;
        }
        .wa-meta {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          position: absolute;
          right: 6px;
          bottom: 2px;
        }
        .wa-time {
          font-size: 7px;
          color: rgba(233,237,239,0.55);
          line-height: 1;
        }
        .wa-msg-1 { animation-delay: 0.5s; }
        .wa-msg-2 { animation-delay: 1.2s; }
        .wa-msg-3 { animation-delay: 2.0s; }
        .wa-msg-4 { animation-delay: 2.8s; }
        .wa-msg-5 { animation-delay: 3.5s; }
        .wa-typing {
          padding: 7px 11px;
        }
        .wa-typing .wa-typing-dots {
          display: inline-flex;
          gap: 3px;
          align-items: center;
          height: 8px;
        }
        .wa-typing-dots i {
          width: 4px; height: 4px;
          border-radius: 99px;
          background: rgba(233,237,239,0.85);
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        .wa-typing-dots i:nth-child(2) { animation-delay: 0.15s; }
        .wa-typing-dots i:nth-child(3) { animation-delay: 0.3s; }

        .wa-input {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 7px;
          background: #202c33;
          border-top: 1px solid rgba(0,0,0,0.4);
          flex-shrink: 0;
        }
        .wa-input-field {
          flex: 1;
          display: flex; align-items: center; gap: 6px;
          padding: 5px 9px;
          background: #2a3942;
          border-radius: 99px;
          font-size: 8px;
          color: #8696a0;
        }
        .wa-input-field span { flex: 1; }
        .wa-mic {
          width: 22px; height: 22px;
          border-radius: 99px;
          background: #00a884;
          border: none;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 10px -4px rgba(0,168,132,0.5);
        }

        @keyframes waIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes bubbleIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes chatPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </IllustrationBase>
  );
}

/* 02 — Mini dashboard com stats, line chart e donut animados */
export function Step02() {
  return (
    <IllustrationBase tint="rgba(59,130,246,0.14)">
      <div className="dash-wrap">
        {/* Header bar */}
        <div className="dash-head">
          <div className="dash-title">
            <div className="dash-dot" />
            Dashboard
          </div>
          <div className="dash-tabs">
            <span className="dash-tab dash-tab-active">90 dias</span>
            <span className="dash-tab">Mês</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="dash-stats">
          <div className="stat stat-1">
            <div className="stat-label">Faturamento</div>
            <div className="stat-val">R$ 12.430</div>
            <div className="stat-trend stat-up">+18%</div>
          </div>
          <div className="stat stat-2">
            <div className="stat-label">Economia</div>
            <div className="stat-val">R$ 4.821</div>
            <div className="stat-trend stat-up">+50.8%</div>
          </div>
        </div>

        {/* Chart + donut */}
        <div className="dash-row">
          <div className="dash-chart">
            <div className="dash-chart-label">Receita mensal</div>
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="chart-svg">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8f6fff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8f6fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                className="chart-area"
                d="M0,50 L0,42 C20,38 30,30 50,28 C70,26 80,32 100,24 C120,16 130,20 150,14 C170,8 180,12 200,6 L200,60 L0,60 Z"
                fill="url(#chartGrad)"
              />
              {/* Line */}
              <path
                className="chart-line"
                d="M0,42 C20,38 30,30 50,28 C70,26 80,32 100,24 C120,16 130,20 150,14 C170,8 180,12 200,6"
                fill="none"
                stroke="#8f6fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Highlight dot */}
              <circle className="chart-dot" cx="200" cy="6" r="3" fill="#8f6fff" stroke="#fff" strokeWidth="1" />
            </svg>
          </div>

          <div className="dash-donut">
            <svg viewBox="0 0 50 50" className="donut-svg">
              <circle cx="25" cy="25" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                className="donut-arc donut-arc-1"
                cx="25" cy="25" r="18" fill="none"
                stroke="#8f6fff" strokeWidth="6" strokeLinecap="round"
                strokeDasharray="113" strokeDashoffset="113"
                transform="rotate(-90 25 25)"
              />
            </svg>
            <div className="donut-center">
              <div className="donut-num">87%</div>
              <div className="donut-lbl">Auto</div>
            </div>
          </div>
        </div>

        {/* Toast notification */}
        <div className="toast">
          <div className="toast-icon">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="toast-text">DAS de Março gerado automaticamente</div>
        </div>
      </div>

      <style jsx>{`
        .dash-wrap {
          width: 84%;
          max-width: 270px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 11px 11px;
          box-shadow: 0 24px 60px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03);
          opacity: 0;
          transform: translateY(10px);
          animation: dashIn 0.55s ease-out 0.1s forwards;
          position: relative;
          overflow: hidden;
        }
        .dash-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .dash-title {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: #fafafa; font-weight: 600;
          letter-spacing: 0.02em;
        }
        .dash-dot {
          width: 6px; height: 6px; border-radius: 99px;
          background: #8f6fff;
          box-shadow: 0 0 8px #8f6fff;
          animation: dotBlink 2s ease-in-out infinite;
        }
        .dash-tabs { display: flex; gap: 4px; }
        .dash-tab {
          font-size: 8.5px;
          padding: 3px 7px;
          border-radius: 99px;
          color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .dash-tab-active {
          color: #fff;
          background: rgba(143,111,255,0.18);
          border-color: rgba(143,111,255,0.4);
        }
        .dash-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 7px;
          margin-bottom: 9px;
        }
        .stat {
          padding: 8px 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9px;
          position: relative;
          opacity: 0;
          animation: statIn 0.5s ease-out forwards;
        }
        .stat-1 { animation-delay: 0.4s; }
        .stat-2 { animation-delay: 0.6s; }
        .stat-label {
          font-size: 8px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 3px;
        }
        .stat-val {
          font-size: 13px;
          color: #fafafa;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .stat-trend {
          position: absolute;
          top: 8px; right: 9px;
          font-size: 8px;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 99px;
        }
        .stat-up {
          color: #6ee7b7;
          background: rgba(110,231,183,0.12);
        }
        .dash-row {
          display: grid;
          grid-template-columns: 1fr 50px;
          gap: 8px;
          align-items: stretch;
        }
        .dash-chart {
          padding: 7px 9px 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9px;
          opacity: 0;
          animation: statIn 0.5s ease-out 0.8s forwards;
        }
        .dash-chart-label {
          font-size: 8px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .chart-svg {
          width: 100%;
          height: 38px;
          display: block;
        }
        .chart-line {
          stroke-dasharray: 280;
          stroke-dashoffset: 280;
          animation: drawLine 1.4s ease-out 1.0s forwards;
        }
        .chart-area {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 1.6s forwards;
        }
        .chart-dot {
          opacity: 0;
          animation: fadeIn 0.4s ease-out 2.2s forwards;
        }
        .dash-donut {
          position: relative;
          padding: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 9px;
          opacity: 0;
          animation: statIn 0.5s ease-out 0.9s forwards;
          display: flex; align-items: center; justify-content: center;
        }
        .donut-svg { width: 100%; height: auto; }
        .donut-arc-1 {
          animation: drawDonut 1.4s ease-out 1.2s forwards;
        }
        .donut-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
        }
        .donut-num {
          font-size: 10px;
          font-weight: 700;
          color: #fafafa;
          line-height: 1;
        }
        .donut-lbl {
          font-size: 6.5px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 1px;
        }
        .toast {
          margin-top: 8px;
          display: flex; align-items: center; gap: 7px;
          padding: 6px 10px;
          background: rgba(110,231,183,0.08);
          border: 1px solid rgba(110,231,183,0.22);
          border-radius: 8px;
          opacity: 0;
          transform: translateY(6px);
          animation: toastIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 2.4s forwards;
        }
        .toast-icon {
          width: 16px; height: 16px;
          border-radius: 99px;
          background: rgba(110,231,183,0.18);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .toast-text {
          font-size: 9px;
          color: #d1fae5;
          font-weight: 500;
        }
        @keyframes dashIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes statIn { to { opacity: 1; } }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes drawDonut { to { stroke-dashoffset: 15; } }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes toastIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </IllustrationBase>
  );
}

/* 03 — Especialista: avatar + cursor pulsando ao "clicar" */
export function Step03() {
  return (
    <IllustrationBase tint="rgba(117,83,255,0.16)">
      <div className="spec-mock">
        {/* Header */}
        <div className="spec-head">
          <span className="spec-head-label">Sua contadora</span>
          <span className="spec-head-badge">
            <span className="spec-head-dot" />
            Online
          </span>
        </div>

        {/* Profile */}
        <div className="spec-profile">
          <div className="spec-avatar-lg">
            AR
            <div className="spec-status" />
          </div>
          <div className="spec-name-lg">Ana Ribeiro</div>
          <div className="spec-role-lg">Contadora · Especialista em Tech</div>
          <div className="spec-tags">
            <span className="spec-tag">PJ</span>
            <span className="spec-tag">Exterior</span>
            <span className="spec-tag">Simples</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="spec-stats">
          <div className="spec-stat">
            <div className="spec-stat-val">+8 anos</div>
            <div className="spec-stat-lbl">Experiência</div>
          </div>
          <div className="spec-stat-divider" />
          <div className="spec-stat">
            <div className="spec-stat-val">CRC-PR</div>
            <div className="spec-stat-lbl">Registro</div>
          </div>
          <div className="spec-stat-divider" />
          <div className="spec-stat">
            <div className="spec-stat-val">PJ Tech</div>
            <div className="spec-stat-lbl">Foco</div>
          </div>
        </div>

        {/* Actions */}
        <div className="spec-actions">
          <button className="spec-btn-primary">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Mensagem
          </button>
          <button className="spec-btn-ghost">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>

        {/* Cursor click animation on Mensagem */}
        <div className="spec-cursor">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 2L17 9L10 11L7 17L3 2Z" fill="#fff" stroke="#000" strokeWidth="1" strokeLinejoin="round" />
          </svg>
          <div className="spec-ripple" />
        </div>
      </div>

      <style jsx>{`
        .spec-mock {
          width: 84%;
          max-width: 270px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 12px 11px;
          box-shadow: 0 24px 60px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03);
          opacity: 0;
          transform: translateY(10px);
          animation: specIn 0.55s ease-out 0.1s forwards;
          position: relative;
          overflow: hidden;
        }
        .spec-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 6px;
        }
        .spec-head-label {
          font-size: 7.5px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }
        .spec-head-badge {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 7.5px;
          color: #6ee7b7;
          font-weight: 600;
          padding: 2px 6px;
          background: rgba(110,231,183,0.1);
          border: 1px solid rgba(110,231,183,0.25);
          border-radius: 99px;
        }
        .spec-head-dot {
          width: 4px; height: 4px;
          border-radius: 99px;
          background: #6ee7b7;
          box-shadow: 0 0 5px #6ee7b7;
          animation: chatPulse 2s ease-in-out infinite;
        }

        .spec-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4px 0 7px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .spec-avatar-lg {
          position: relative;
          width: 38px; height: 38px;
          border-radius: 99px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 22px -6px rgba(102,68,242,0.55), 0 0 0 1px rgba(255,255,255,0.12);
          animation: avatarFloat 4s ease-in-out infinite;
        }
        .spec-status {
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px;
          border-radius: 99px;
          background: #22c55e;
          border: 2px solid #1a1a1a;
          animation: statusPulse 2s ease-in-out infinite;
        }
        .spec-name-lg {
          font-size: 11px;
          color: #fafafa;
          font-weight: 700;
          margin-top: 5px;
          letter-spacing: -0.01em;
        }
        .spec-role-lg {
          font-size: 8.5px;
          color: rgba(255,255,255,0.5);
          margin-top: 1px;
        }
        .spec-tags {
          display: flex; gap: 3px; margin-top: 5px;
        }
        .spec-tag {
          font-size: 7px;
          color: #c4b1ff;
          padding: 1px 6px;
          background: rgba(143,111,255,0.12);
          border: 1px solid rgba(143,111,255,0.3);
          border-radius: 99px;
          font-weight: 500;
        }

        .spec-stats {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 2px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .spec-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          animation: statIn 0.5s ease-out forwards;
        }
        .spec-stat:nth-child(1) { animation-delay: 0.5s; }
        .spec-stat:nth-child(3) { animation-delay: 0.7s; }
        .spec-stat:nth-child(5) { animation-delay: 0.9s; }
        .spec-stat-val {
          font-size: 10px;
          color: #fafafa;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .spec-stat-lbl {
          font-size: 6.5px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 1px;
        }
        .spec-stat-divider {
          width: 1px;
          height: 18px;
          background: rgba(255,255,255,0.07);
        }

        .spec-actions {
          display: flex; gap: 6px;
          margin-top: 8px;
          position: relative;
        }
        .spec-btn-primary {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 7px 12px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff;
          font-size: 9.5px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 99px;
          cursor: pointer;
          box-shadow: 0 6px 18px -6px rgba(102,68,242,0.55);
          opacity: 0;
          animation: statIn 0.5s ease-out 1.0s forwards, btnPulseAnim 2.4s ease-in-out 2.0s infinite;
        }
        .spec-btn-ghost {
          width: 28px; height: 28px;
          border-radius: 99px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          opacity: 0;
          animation: statIn 0.5s ease-out 1.1s forwards;
        }

        .spec-cursor {
          position: absolute;
          right: 22%;
          bottom: -2px;
          opacity: 0;
          z-index: 5;
          animation: cursorIn 0.5s ease-out 1.6s forwards, cursorClick 2.4s ease-in-out 2.0s infinite;
        }
        .spec-ripple {
          position: absolute;
          top: 50%; left: 50%;
          width: 8px; height: 8px;
          border-radius: 99px;
          background: rgba(143,111,255,0.6);
          transform: translate(-50%, -50%);
          animation: rippleAnim 2.4s ease-out 2.2s infinite;
        }

        @keyframes specIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes statIn { to { opacity: 1; } }
        @keyframes chatPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes statusPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6), 0 0 0 2.5px #1a1a1a; }
          50% { box-shadow: 0 0 0 4px rgba(34,197,94,0), 0 0 0 2.5px #1a1a1a; }
        }
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes cursorIn { to { opacity: 1; } }
        @keyframes cursorClick {
          0%, 88%, 100% { transform: scale(1); }
          44% { transform: scale(0.85); }
        }
        @keyframes rippleAnim {
          0% { width: 8px; height: 8px; opacity: 0.7; }
          100% { width: 50px; height: 50px; opacity: 0; }
        }
        @keyframes btnPulseAnim {
          0%, 88%, 100% { transform: scale(1); box-shadow: 0 6px 18px -6px rgba(102,68,242,0.55); }
          44% { transform: scale(0.97); box-shadow: 0 4px 14px -4px rgba(102,68,242,0.7); }
        }
      `}</style>
    </IllustrationBase>
  );
}

/* 04 — Calendário com eventos automáticos + notificação do contador */
export function Step04() {
  const days = Array.from({ length: 35 }, (_, i) => i - 2); // grid começando com offset
  const today = 17;
  const events: Record<number, "auto" | "decision"> = {
    5: "auto", 8: "auto", 12: "auto", 17: "decision", 20: "auto", 24: "auto", 28: "auto",
  };

  return (
    <IllustrationBase tint="rgba(99,102,241,0.14)">
      <div className="cal-wrap">
        {/* Header */}
        <div className="cal-head">
          <div className="cal-month">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Março 2026
          </div>
          <div className="cal-nav">
            <button className="cal-arrow">‹</button>
            <button className="cal-arrow cal-today-btn">Hoje</button>
            <button className="cal-arrow">›</button>
          </div>
        </div>

        {/* Weekday header */}
        <div className="cal-weekdays">
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <div key={i} className="cal-wd">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="cal-grid">
          {days.map((d, i) => {
            const isValid = d >= 1 && d <= 31;
            const isToday = d === today;
            const event = events[d];
            return (
              <div
                key={i}
                className={`cal-day ${isValid ? "" : "cal-day-empty"} ${isToday ? "cal-day-today" : ""} ${event === "decision" ? "cal-day-decision" : ""}`}
                style={{ animationDelay: `${0.3 + i * 0.018}s` }}
              >
                {isValid && <span className="cal-day-num">{d}</span>}
                {isValid && event === "auto" && <span className="cal-day-mark cal-mark-auto" />}
                {isValid && event === "decision" && <span className="cal-day-mark cal-mark-decision" />}
              </div>
            );
          })}
        </div>

        {/* Floating notification from contador */}
        <div className="cal-notif">
          <div className="cal-notif-avatar">AR</div>
          <div className="cal-notif-body">
            <div className="cal-notif-name">Ana · Sua contadora</div>
            <div className="cal-notif-text">Atenção pro dia 17!</div>
          </div>
          <div className="cal-notif-pulse" />
        </div>
      </div>

      <style jsx>{`
        .cal-wrap {
          width: 84%;
          max-width: 270px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 11px 11px;
          box-shadow: 0 24px 60px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03);
          opacity: 0;
          transform: translateY(10px);
          animation: calIn 0.55s ease-out 0.1s forwards;
          position: relative;
          overflow: hidden;
        }
        .cal-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px;
        }
        .cal-month {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #fafafa; font-weight: 600;
        }
        .cal-nav { display: flex; gap: 3px; align-items: center; }
        .cal-arrow {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65);
          width: 18px; height: 18px;
          border-radius: 5px;
          font-size: 10px;
          line-height: 1;
          padding: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cal-today-btn {
          width: auto;
          padding: 0 7px;
          font-size: 8.5px;
          background: rgba(143,111,255,0.18);
          border-color: rgba(143,111,255,0.4);
          color: #fff;
          font-weight: 600;
        }
        .cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 4px;
        }
        .cal-wd {
          font-size: 7.5px;
          color: rgba(255,255,255,0.35);
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .cal-day {
          aspect-ratio: 1;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 5px;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transform: scale(0.85);
          animation: dayIn 0.35s ease-out forwards;
        }
        .cal-day-empty {
          background: transparent;
          border-color: transparent;
        }
        .cal-day-num {
          font-size: 9px;
          color: rgba(255,255,255,0.55);
          font-weight: 500;
        }
        .cal-day-today {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.16);
        }
        .cal-day-today .cal-day-num {
          color: #fff;
          font-weight: 700;
        }
        .cal-day-decision {
          background: linear-gradient(135deg, rgba(102,68,242,0.35), rgba(81,41,240,0.18));
          border-color: rgba(143,111,255,0.7);
          box-shadow: 0 0 16px rgba(143,111,255,0.5), inset 0 0 0 1px rgba(143,111,255,0.3);
          animation: dayIn 0.35s ease-out forwards, decisionPulse 2.4s ease-in-out 1.8s infinite;
        }
        .cal-day-decision .cal-day-num {
          color: #fff;
          font-weight: 700;
        }
        .cal-day-mark {
          position: absolute;
          bottom: 2px; left: 50%;
          transform: translateX(-50%);
          width: 3px; height: 3px;
          border-radius: 99px;
        }
        .cal-mark-auto {
          background: #6ee7b7;
          box-shadow: 0 0 4px rgba(110,231,183,0.6);
        }
        .cal-mark-decision {
          background: #fff;
          width: 4px; height: 4px;
        }

        /* Floating notification */
        .cal-notif {
          position: absolute;
          bottom: 6px;
          right: 6px;
          display: flex; align-items: center; gap: 6px;
          padding: 5px 9px 5px 6px;
          background: #1c1c1c;
          border: 1px solid rgba(143,111,255,0.45);
          border-radius: 9px;
          box-shadow: 0 12px 30px -8px rgba(102,68,242,0.5), 0 0 0 1px rgba(0,0,0,0.4);
          opacity: 0;
          transform: translateY(8px) scale(0.92);
          animation: notifIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 1.6s forwards;
          max-width: calc(100% - 12px);
        }
        .cal-notif-avatar {
          width: 18px; height: 18px;
          border-radius: 99px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff;
          font-size: 7.5px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cal-notif-body { min-width: 0; }
        .cal-notif-name {
          font-size: 6.5px;
          color: #c4b1ff;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          line-height: 1;
        }
        .cal-notif-text {
          font-size: 8.5px;
          color: #fafafa;
          font-weight: 500;
          margin-top: 2px;
          white-space: nowrap;
          line-height: 1;
        }
        .cal-notif-pulse {
          position: absolute;
          top: -3px; right: -3px;
          width: 7px; height: 7px;
          border-radius: 99px;
          background: #f87171;
          box-shadow: 0 0 0 2px #1c1c1c, 0 0 8px rgba(248,113,113,0.6);
          animation: pulseDot 1.6s ease-in-out infinite;
        }

        @keyframes calIn { to { opacity: 1; transform: translateY(0); } }
        @keyframes dayIn { to { opacity: 1; transform: scale(1); } }
        @keyframes notifIn { to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes decisionPulse {
          0%, 100% { box-shadow: 0 0 16px rgba(143,111,255,0.5), inset 0 0 0 1px rgba(143,111,255,0.3); }
          50% { box-shadow: 0 0 24px rgba(143,111,255,0.8), inset 0 0 0 1px rgba(143,111,255,0.5); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
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
              className={`fade-up grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-12 items-center ${
                i === 0 ? "pt-8 md:pt-8 pb-9 md:pb-8" : "py-9 md:py-8 border-t border-white/5"
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
