"use client";
import { useState } from "react";

export default function FloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Tooltip popup */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 rounded-2xl p-5 w-72 shadow-2xl"
          style={{
            background: "#0F0F1A",
            border: "1px solid rgba(124,58,237,0.30)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(124,58,237,0.10)",
          }}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-[#6B7280] hover:text-[#F4F4F8] transition-colors text-lg leading-none"
          >
            ×
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-emerald-400 font-medium">Online agora</span>
          </div>
          <p className="font-display font-bold text-[15px] text-[#F4F4F8] mb-1.5">Tem alguma dúvida?</p>
          <p className="text-[13px] text-[#9CA3AF] leading-[1.6] mb-4">
            Fale com um especialista agora. Respondemos em menos de 1 hora.
          </p>
          <a
            href="#contato"
            onClick={() => setOpen(false)}
            className="btn-primary w-full text-center text-[13px] py-2.5"
          >
            Falar com especialista →
          </a>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full overflow-hidden shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{
          background: "#7C3AED",
          boxShadow: "0 4px 20px rgba(124,58,237,0.50), 0 0 0 2px rgba(124,58,237,0.20)",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Abrir chat de dúvidas"
      >
        {open ? (
          <span className="text-white text-2xl font-light leading-none">×</span>
        ) : (
          <span className="text-[22px]">💬</span>
        )}
      </button>
    </>
  );
}
