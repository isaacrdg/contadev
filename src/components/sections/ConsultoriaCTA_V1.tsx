"use client";
import { useFormModal } from "@/components/FormContext";

const CTA_BACKGROUND_IMAGE =
  "https://cdn.midjourney.com/67654306-c4d4-453c-a360-5552f697cfe1/0_0.jpeg";

export default function ConsultoriaCTA_V1() {
  const { openForm } = useFormModal();

  return (
    <section className="relative">
      {/* Version label */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-0 mb-4 mt-16">
        <span className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: "rgba(117,83,255,0.15)", color: "#7553ff" }}>
          Versão 1 — Foto Fullcover ao Centro
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-0">
        <div
          className="relative flex min-h-[400px] flex-col justify-end overflow-hidden"
          style={{
            borderRadius: "24px",
            backgroundColor: "#e8e6ef",
            backgroundImage: `url("${CTA_BACKGROUND_IMAGE}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col items-center gap-6 px-8 pb-10 text-center md:px-12 md:pb-12">
            <h2
              className="font-display max-w-[640px] text-3xl leading-[1.12] font-bold tracking-tight text-[#fff] md:text-[40px]"
              style={{ letterSpacing: "-.3px" }}
            >
              Fale com quem entende{" "}
              <span className="text-[#7553ff]">o seu cenário.</span>
            </h2>

            <button
              type="button"
              onClick={openForm}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full px-8 py-3.5 text-[14px] font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #7553ff, #5a3de6)",
                color: "#fff",
                border: "1px solid rgba(117,83,255,0.5)",
                boxShadow: "0 4px 25px rgba(117,83,255,0.3)",
              }}
            >
              FALE COM UM ESPECIALISTA
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
