"use client";
import { useEffect, useRef, useState } from "react";
import { useFormModal } from "./FormContext";

/* ─────────── Conversation tree ─────────── */

type NodeId = "root" | "pricing" | "how" | "cnpj" | "client";

interface ChatNode {
  bot: string[]; // multiple lines = sequential bubbles
  options: { label: string; next?: NodeId; action?: "open_form" }[];
}

const tree: Record<NodeId, ChatNode> = {
  root: {
    bot: [
      "Olá! 👋 Sou o assistente da Conta Dev.",
      "Posso tirar uma dúvida rápida ou te conectar com um especialista. O que você prefere?",
    ],
    options: [
      { label: "💰 Quanto custa?", next: "pricing" },
      { label: "🛠 Como funciona?", next: "how" },
      { label: "🆕 Abrir/migrar CNPJ", next: "cnpj" },
      { label: "👤 Já sou cliente", next: "client" },
      { label: "💬 Falar com especialista", action: "open_form" },
    ],
  },
  pricing: {
    bot: [
      "Os planos começam em R$ 89/mês e variam conforme faturamento e regime.",
      "Pra um valor exato pro seu caso, melhor falar com um especialista — leva 3 minutos.",
    ],
    options: [
      { label: "💬 Falar com especialista", action: "open_form" },
      { label: "↩ Voltar", next: "root" },
    ],
  },
  how: {
    bot: [
      "Você usa nossa plataforma pra emitir notas, ver guias e relatórios.",
      "Qualquer dúvida, é só chamar seu contador dedicado no WhatsApp — sem fila, sem robô.",
    ],
    options: [
      { label: "💬 Falar com especialista", action: "open_form" },
      { label: "↩ Voltar", next: "root" },
    ],
  },
  cnpj: {
    bot: [
      "Abertura e migração de CNPJ com a gente são gratuitas 🎉",
      "Um especialista te explica os detalhes pro seu caso em poucos minutos.",
    ],
    options: [
      { label: "💬 Falar com especialista", action: "open_form" },
      { label: "↩ Voltar", next: "root" },
    ],
  },
  client: {
    bot: [
      "Que bom te ver de novo! 💜",
      "Deixa seu contato que vou te conectar com o time de suporte.",
    ],
    options: [
      { label: "✅ Falar com suporte", action: "open_form" },
      { label: "↩ Voltar", next: "root" },
    ],
  },
};

interface HistoryItem {
  type: "bot" | "user";
  text: string;
}

/* ─────────── Component ─────────── */

export default function FloatingButton() {
  const { openForm } = useFormModal();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentNode, setCurrentNode] = useState<NodeId>("root");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide on hero / faq sections
  useEffect(() => {
    const targets = ["hero", "faq"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    const visible = new Set<string>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        setHidden(visible.size > 0);
        if (visible.size > 0) setOpen(false);
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Initialize chat with root when opening for the first time
  useEffect(() => {
    if (open && history.length === 0) {
      pushBotMessages(tree.root.bot);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history, typing]);

  function pushBotMessages(messages: string[]) {
    setTyping(true);
    let i = 0;
    const tick = () => {
      if (i >= messages.length) {
        setTyping(false);
        return;
      }
      setHistory((h) => [...h, { type: "bot", text: messages[i] }]);
      i += 1;
      setTimeout(tick, 650);
    };
    setTimeout(tick, 450);
  }

  function handleOption(opt: { label: string; next?: NodeId; action?: "open_form" }) {
    // Add user bubble (strip leading emoji + space for cleaner display? keep as-is)
    setHistory((h) => [...h, { type: "user", text: opt.label }]);

    if (opt.action === "open_form") {
      setTimeout(() => {
        openForm();
      }, 350);
      return;
    }
    if (opt.next) {
      const nextNode = tree[opt.next];
      setCurrentNode(opt.next);
      setTimeout(() => pushBotMessages(nextNode.bot), 300);
    }
  }

  function resetChat() {
    setHistory([]);
    setCurrentNode("root");
    setTyping(false);
    setTimeout(() => pushBotMessages(tree.root.bot), 200);
  }

  if (hidden) return null;

  const node = tree[currentNode];
  const showOptions = !typing && history.length > 0;

  return (
    <>
      {/* ─────── Chat panel ─────── */}
      {open && (
        <div className="cd-chat" role="dialog" aria-label="Chat de ajuda">
          <header className="cd-chat-head">
            <div className="cd-chat-avatar">
              <span>CD</span>
              <span className="cd-chat-status" />
            </div>
            <div className="cd-chat-info">
              <div className="cd-chat-name">Conta Dev</div>
              <div className="cd-chat-sub">
                <span className="cd-chat-dot" />
                Online · responde em 3 min
              </div>
            </div>
            <button
              className="cd-chat-reset"
              onClick={resetChat}
              aria-label="Reiniciar conversa"
              title="Reiniciar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
            <button className="cd-chat-close" onClick={() => setOpen(false)} aria-label="Fechar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div className="cd-chat-body" ref={scrollRef}>
            {history.map((msg, i) => (
              <div key={i} className={`cd-bubble cd-bubble-${msg.type}`}>
                {msg.text}
              </div>
            ))}
            {typing && (
              <div className="cd-bubble cd-bubble-bot cd-bubble-typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          {showOptions && (
            <div className="cd-chat-options">
              {node.options.map((opt, i) => (
                <button
                  key={i}
                  className={`cd-opt-btn ${opt.action === "open_form" ? "cd-opt-primary" : ""}`}
                  onClick={() => handleOption(opt)}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────── Floating bubble button ─────── */}
      <button
        onClick={() => setOpen(!open)}
        className="cd-fab"
        aria-label={open ? "Fechar chat" : "Abrir chat de ajuda"}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {history.length === 0 && <span className="cd-fab-pulse" />}
          </>
        )}
      </button>

      <style jsx>{`
        /* ─────── Floating button ─────── */
        .cd-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 999px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fff;
          cursor: pointer;
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px -8px rgba(102, 68, 242, 0.55), 0 0 0 4px rgba(102, 68, 242, 0.15);
          transition: all 0.25s ease;
          animation: cdFabIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cd-fab:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 14px 36px -8px rgba(102, 68, 242, 0.7), 0 0 0 4px rgba(102, 68, 242, 0.2);
        }
        .cd-fab:active { transform: translateY(0) scale(0.97); }
        .cd-fab-pulse {
          position: absolute;
          inset: -2px;
          border-radius: 999px;
          border: 2px solid rgba(143, 111, 255, 0.6);
          animation: cdPulse 2.2s ease-out infinite;
          pointer-events: none;
        }

        /* ─────── Chat panel ─────── */
        .cd-chat {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 360px;
          max-width: calc(100vw - 32px);
          height: min(560px, calc(100vh - 140px));
          background: #161520;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(102, 68, 242, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9999;
          animation: cdChatIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* ─────── Header ─────── */
        .cd-chat-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(102, 68, 242, 0.18), rgba(81, 41, 240, 0.06));
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .cd-chat-avatar {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12);
        }
        .cd-chat-status {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 11px;
          height: 11px;
          border-radius: 999px;
          background: #22c55e;
          border: 2px solid #161520;
        }
        .cd-chat-info { flex: 1; min-width: 0; }
        .cd-chat-name {
          font-size: 14px;
          font-weight: 600;
          color: #fafafa;
        }
        .cd-chat-sub {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }
        .cd-chat-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        .cd-chat-reset,
        .cd-chat-close {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: rgba(255, 255, 255, 0.55);
          width: 28px;
          height: 28px;
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .cd-chat-reset:hover,
        .cd-chat-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        /* ─────── Body ─────── */
        .cd-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          scroll-behavior: smooth;
        }
        .cd-chat-body::-webkit-scrollbar { width: 6px; }
        .cd-chat-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

        .cd-bubble {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13px;
          line-height: 1.45;
          animation: cdBubbleIn 0.3s ease-out;
          word-wrap: break-word;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif;
        }
        .cd-bubble-bot {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #ededed;
          border-bottom-left-radius: 4px;
        }
        .cd-bubble-user {
          align-self: flex-end;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 6px 18px -8px rgba(102, 68, 242, 0.55);
        }
        .cd-bubble-typing {
          display: inline-flex;
          gap: 4px;
          padding: 12px 14px;
          align-items: center;
        }
        .cd-bubble-typing span {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.55);
          animation: cdDot 1.2s ease-in-out infinite;
        }
        .cd-bubble-typing span:nth-child(2) { animation-delay: 0.15s; }
        .cd-bubble-typing span:nth-child(3) { animation-delay: 0.3s; }

        /* ─────── Options ─────── */
        .cd-chat-options {
          padding: 10px 14px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 7px;
          background: rgba(0, 0, 0, 0.15);
        }
        .cd-opt-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ededed;
          font-size: 12.5px;
          font-weight: 500;
          padding: 10px 14px;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          opacity: 0;
          animation: cdOptIn 0.3s ease-out forwards;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif;
        }
        .cd-opt-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(117, 83, 255, 0.4);
          transform: translateX(2px);
        }
        .cd-opt-primary {
          background: linear-gradient(135deg, rgba(102, 68, 242, 0.25), rgba(81, 41, 240, 0.12));
          border-color: rgba(117, 83, 255, 0.5);
          color: #fff;
        }
        .cd-opt-primary:hover {
          background: linear-gradient(135deg, rgba(102, 68, 242, 0.4), rgba(81, 41, 240, 0.2));
          border-color: rgba(117, 83, 255, 0.7);
        }

        /* ─────── Animations ─────── */
        @keyframes cdFabIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes cdPulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes cdChatIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cdBubbleIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cdOptIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cdDot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .cd-chat {
            right: 12px;
            left: 12px;
            bottom: 88px;
            width: auto;
            max-width: none;
            height: min(520px, calc(100vh - 130px));
          }
          .cd-fab { right: 16px; bottom: 16px; }
        }
      `}</style>
    </>
  );
}
