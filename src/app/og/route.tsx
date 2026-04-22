import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };
const BG = "#17151e";
const BRAND = "#7553ff";
const BRAND_SOFT = "#3c0dff";

async function loadFont(family: "Inter", weight: 400 | 600 | 800): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
    const css = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
    }).then((r) => r.text());
    const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!match) return null;
    const fontData = await fetch(match[1]).then((r) => r.arrayBuffer());
    return fontData;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Blog Conta Dev").slice(0, 160);
  const tag = (searchParams.get("tag") ?? "BLOG · CONTA DEV").toUpperCase().slice(0, 60);
  const author = searchParams.get("author") ?? "Conta Dev";
  const date = searchParams.get("date") ?? "";

  const [interRegular, interBold, interBlack] = await Promise.all([
    loadFont("Inter", 400),
    loadFont("Inter", 600),
    loadFont("Inter", 800),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600 | 800; style: "normal" }[] = [];
  if (interRegular) fonts.push({ name: "Inter", data: interRegular, weight: 400, style: "normal" });
  if (interBold) fonts.push({ name: "Inter", data: interBold, weight: 600, style: "normal" });
  if (interBlack) fonts.push({ name: "Inter", data: interBlack, weight: 800, style: "normal" });

  const formattedDate = date
    ? new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* glow roxo canto superior direito */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND}55 0%, transparent 65%)`,
            display: "flex",
          }}
        />
        {/* glow roxo canto inferior esquerdo */}
        <div
          style={{
            position: "absolute",
            bottom: -280,
            left: -220,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND_SOFT}3a 0%, transparent 65%)`,
            display: "flex",
          }}
        />
        {/* borda sutil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(117, 83, 255, 0.12)",
              border: "1px solid rgba(117, 83, 255, 0.35)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: BRAND,
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#c4b1ff",
                letterSpacing: "0.08em",
              }}
            >
              {tag}
            </span>
          </div>

          {/* Logo Conta Dev — badges empilhados */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <div
              style={{
                padding: "10px 28px",
                background: "linear-gradient(135deg, #6040EE, #7E54F4)",
                color: "white",
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: "0.22em",
                borderRadius: 6,
                display: "flex",
              }}
            >
              CONTA
            </div>
            <div
              style={{
                padding: "10px 32px",
                background: "white",
                color: "#0D0B1E",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "0.26em",
                borderRadius: 6,
                display: "flex",
              }}
            >
              DEV
            </div>
          </div>
        </div>

        {/* Título */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 80 ? 58 : title.length > 50 ? 68 : 80,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#fafafa",
              margin: 0,
              maxWidth: "95%",
              display: "flex",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: "#fafafa" }}>{author}</span>
            {formattedDate && (
              <span style={{ fontSize: 18, color: "rgba(250,250,250,0.5)" }}>{formattedDate}</span>
            )}
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "rgba(250,250,250,0.5)",
              letterSpacing: "0.04em",
            }}
          >
            conta-dev.com
          </span>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
