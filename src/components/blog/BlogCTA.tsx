"use client";
import Link from "next/link";
import { track } from "@vercel/analytics";

interface Props {
  /** Slug do post pra rastrear de onde veio o clique. Opcional. */
  postSlug?: string;
}

export default function BlogCTA({ postSlug }: Props) {
  return (
    <aside
      className="not-prose mt-16 rounded-2xl p-8 md:p-10 overflow-hidden relative"
      style={{
        background:
          "radial-gradient(130% 90% at 0% 0%, rgba(117,83,255,0.18) 0%, transparent 55%), rgba(19,34,51,0.5)",
        border: "1px solid rgba(117,83,255,0.22)",
      }}
    >
      <div
        className="absolute -top-24 -right-20 w-72 h-72 rounded-full opacity-60 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(117,83,255,0.35) 0%, transparent 70%)",
        }}
      />
      <div className="relative">
        <span
          className="inline-block text-[10px] font-mono uppercase tracking-[0.12em] px-2.5 py-1 rounded"
          style={{
            background: "rgba(117,83,255,0.14)",
            border: "1px solid rgba(117,83,255,0.35)",
            color: "#c4b1ff",
          }}
        >
          // conta dev
        </span>
        <h3 className="text-[22px] md:text-[26px] font-bold tracking-tight leading-tight mt-4 max-w-xl" style={{ color: "#fafafa" }}>
          Abrir CNPJ sendo dev, sem burocracia.
        </h3>
        <p className="text-[14px] md:text-[15px] mt-3 leading-relaxed max-w-xl" style={{ color: "rgba(250,250,250,0.65)" }}>
          Abertura grátis, especialista em 3 minutos, e economia média de 50,8% em impostos. A gente cuida da parte chata enquanto você codifica.
        </p>
        <Link
          href="/?form=true"
          onClick={() => track("blog_cta_click", { post: postSlug ?? "unknown" })}
          className="inline-flex items-center gap-2 mt-6 text-[13px] font-semibold px-5 py-3 rounded-full transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #6644f2, #5129f0)",
            color: "white",
            boxShadow: "0 6px 24px -8px rgba(102, 68, 242, 0.6)",
          }}
        >
          Falar com um especialista
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </aside>
  );
}
