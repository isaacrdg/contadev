"use client";
import { useEffect, useState } from "react";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FormModal({ open, onClose }: FormModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      window.history.pushState({}, "", "?form=true");
    } else {
      document.body.style.overflow = "";
      if (window.location.search.includes("form=true")) {
        window.history.pushState({}, "", window.location.pathname);
      }
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Auto-open if ?form=true on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("form") === "true") {
      // Parent handles this via the global context
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setName("");
      setPhone("");
      setEmail("");
    }
  }, [open]);

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
    } catch {
      // silently continue to success state
    }
    setLoading(false);
    setSubmitted(true);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-2xl p-6 md:p-8"
        style={{
          background: "#1c1c1c",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
          animation: "fadeIn 0.25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!submitted ? (
          <>
            <div className="mb-6">
              <h3 className="font-display font-bold text-[22px] text-[#fafafa] mb-2">
                Fale com um especialista
              </h3>
              <p className="text-[13px] text-white/50 leading-relaxed">
                Preencha seus dados e um contador especialista em tech entra em contato em minutos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.10em] text-white/40 font-medium mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full rounded-xl px-4 py-3 text-[14px] text-[#fafafa] placeholder-white/25 outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.10em] text-white/40 font-medium mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  required
                  className="w-full rounded-xl px-4 py-3 text-[14px] text-[#fafafa] placeholder-white/25 outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.10em] text-white/40 font-medium mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-xl px-4 py-3 text-[14px] text-[#fafafa] placeholder-white/25 outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold rounded-xl py-3.5 transition-all duration-300 mt-1"
                style={{
                  background: "linear-gradient(135deg, #7553ff, #5a3de6)",
                  border: "1px solid rgba(117,83,255,0.5)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(117,83,255,0.25)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "ENVIANDO..." : "QUERO FALAR COM ESPECIALISTA"}
              </button>

              <p className="text-center text-[10px] text-white/30">
                Sem compromisso · Resposta em minutos
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(117,83,255,0.15)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8f6fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-[20px] text-[#fafafa] mb-2">
              Recebemos seus dados!
            </h3>
            <p className="text-[13px] text-white/50 leading-relaxed mb-4">
              Um especialista vai entrar em contato em breve pelo WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="text-[13px] font-medium px-6 py-2.5 rounded-xl transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#fafafa" }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
