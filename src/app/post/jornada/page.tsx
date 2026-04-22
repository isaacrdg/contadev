import { Step01, Step02, Step03, Step04 } from "@/components/sections/Jornada";

/* ─────────────────────────────────────────────────────────────
   Carrossel Instagram 4:5 (1080×1350) — Jornada Conta Dev
   Renderiza 5 slides empilhados verticalmente para screenshot.
   Abra com zoom do browser em 50% pra ver a página inteira.
   ───────────────────────────────────────────────────────────── */

type Slide = {
  index: string;
  total: string;
  eyebrow: string;
  headline: React.ReactNode;
  sub: string;
  hint: string;
  Illustration: React.ComponentType;
};

const slides: Slide[] = [
  {
    index: "01",
    total: "04",
    eyebrow: "JORNADA CONTA DEV",
    headline: (
      <>
        Aqui começa com <em className="not-italic gradient-text">gente</em> que entende de tech.
      </>
    ),
    sub: "Sem fila, sem chatbot, sem repetir sua história. Um especialista te orienta com clareza desde a primeira mensagem.",
    hint: "e a tecnologia?",
    Illustration: Step01,
  },
  {
    index: "02",
    total: "04",
    eyebrow: "JORNADA CONTA DEV",
    headline: (
      <>
        Tecnologia que faz o <em className="not-italic gradient-text">trabalho braçal</em> por você.
      </>
    ),
    sub: "Notas, guias e DAS rodam no automático. Você só acompanha o resultado pelo dashboard.",
    hint: "e quando algo importa?",
    Illustration: Step02,
  },
  {
    index: "03",
    total: "04",
    eyebrow: "JORNADA CONTA DEV",
    headline: (
      <>
        Seu contador, a <em className="not-italic gradient-text">um clique</em> de distância.
      </>
    ),
    sub: "Um especialista dedicado, que conhece seu cenário e acompanha sua operação. Responde de verdade.",
    hint: "e os prazos críticos?",
    Illustration: Step03,
  },
  {
    index: "04",
    total: "04",
    eyebrow: "JORNADA CONTA DEV",
    headline: (
      <>
        Plataforma cuida da rotina. <em className="not-italic gradient-text">Seu contador cuida de você.</em>
      </>
    ),
    sub: "Quando uma decisão importa, alguém que conhece seu negócio te avisa. Sempre antes do prazo.",
    hint: "quer pra você?",
    Illustration: Step04,
  },
];

export default function JornadaCarrosselPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0910",
        padding: "40px 0 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
      }}
    >
      {/* Header dev */}
      <div
        style={{
          width: 1080,
          maxWidth: "100%",
          padding: "0 24px",
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 13,
          letterSpacing: "0.04em",
        }}
      >
        Carrossel Instagram · 1080×1350 · 5 slides · zoom do browser em ~40% pra preview · 100% pra screenshot · aguarde ~5s pra animações das ilustrações chegarem no estado final antes de capturar
      </div>

      {slides.map((s) => (
        <SlideFrame key={s.index} label={`${s.index} / 05`}>
          <Slide {...s} />
        </SlideFrame>
      ))}

      <SlideFrame label={"05 / 05"}>
        <SlideCTA />
      </SlideFrame>
    </main>
  );
}

/* ============================================================
   SlideFrame — moldura 1080×1350 com label embaixo
   ============================================================ */
function SlideFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div
        data-slide={label}
        style={{
          width: 1080,
          height: 1350,
          background: "#17151e",
          position: "relative",
          overflow: "hidden",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          color: "#fafafa",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Slide {label}
      </div>
    </div>
  );
}

/* ============================================================
   Slide — slide padrão dos passos 01–04
   ============================================================ */
function Slide({ index, total, eyebrow, headline, sub, hint, Illustration }: Slide) {
  return (
    <>
      {/* Glow ambiente roxo discreto, canto superior direito */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -150,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(117,83,255,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Grid sutil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at 50% 40%, #000 50%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, #000 50%, transparent 90%)",
          pointerEvents: "none",
        }}
      />

      {/* Layout principal */}
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "70px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Topo: eyebrow + branding */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fafafa",
                letterSpacing: "0.04em",
              }}
            >
              {index}
              <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 500 }}> / {total}</span>
            </span>
            <span
              style={{
                width: 28,
                height: 1,
                background: "rgba(255,255,255,0.2)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </span>
          </div>

          <BrandMark />
        </div>

        {/* Ilustração — moldura 4:3 reaproveitando o componente do site */}
        <div
          style={{
            marginTop: 50,
            width: "100%",
            aspectRatio: "4 / 3",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            position: "relative",
          }}
        >
          {/* Scale up das ilustrações pra ficarem proporcionais ao slide grande */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "scale(2.6)",
              transformOrigin: "center center",
            }}
          >
            <Illustration />
          </div>
        </div>

        {/* Headline + sub */}
        <div style={{ marginTop: 60, flex: 1 }}>
          <h2
            style={{
              fontSize: 64,
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              fontWeight: 700,
              color: "#fafafa",
              margin: 0,
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              marginTop: 28,
              fontSize: 24,
              lineHeight: 1.45,
              color: "rgba(224,224,224,0.85)",
              fontWeight: 300,
              maxWidth: 820,
              margin: "28px 0 0",
            }}
          >
            {sub}
          </p>
        </div>

        {/* Cliffhanger — empurra pro próximo slide */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 14,
            marginTop: 32,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 400,
            }}
          >
            {hint}
          </span>
          <ArrowRight />
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SlideCTA — slide final
   ============================================================ */
function SlideCTA() {
  return (
    <>
      {/* Glow central forte */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(117,83,255,0.20) 0%, rgba(117,83,255,0.06) 40%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Grid sutil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "70px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Topo: brand + eyebrow */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BrandMark />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Pra você que codifica
          </span>
        </div>

        {/* Centro */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 48,
          }}
        >
          <h1
            style={{
              fontSize: 96,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              fontWeight: 700,
              color: "#fafafa",
              margin: 0,
              maxWidth: 920,
            }}
          >
            Tecnologia para a{" "}
            <em className="not-italic gradient-text">vida contábil</em> do dev.
          </h1>

          {/* Bullets */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {[
              "Abertura de CNPJ grátis, 100% digital",
              "Especialista que entende de tech a um clique",
              "Até −50,8% em impostos desde o primeiro mês",
            ].map((b) => (
              <li
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontSize: 26,
                  color: "rgba(250,250,250,0.92)",
                  fontWeight: 400,
                }}
              >
                <CheckMark />
                {b}
              </li>
            ))}
          </ul>

          {/* CTA pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 12 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "22px 38px",
                borderRadius: 999,
                background: "linear-gradient(135deg, #6644f2, #5129f0)",
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                boxShadow: "0 20px 50px -10px rgba(102,68,242,0.5)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Fale com um especialista
              <ArrowRight color="#fff" size={22} />
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            @contadev_
          </span>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            conta-dev.com
          </span>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Pequenos componentes utilitários
   ============================================================ */
function BrandMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: "linear-gradient(135deg, #6644f2, #5129f0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 14,
          color: "#fff",
          letterSpacing: "-0.02em",
          boxShadow: "0 6px 20px -6px rgba(102,68,242,0.6)",
        }}
      >
        C
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "#fafafa" }}>
        Conta Dev
      </span>
    </div>
  );
}

function ArrowRight({ color = "rgba(255,255,255,0.6)", size = 26 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckMark() {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        background: "rgba(143,111,255,0.12)",
        border: "1px solid rgba(143,111,255,0.4)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}
