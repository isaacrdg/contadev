"use client";
import { useEffect, useRef } from "react";

const chars = "{ } < > / ; = ( ) [ ] : . , | _ $ # + - ~ * & ! ?".split(" ");

function CodeDecoration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let animId: number;
    let mouseX = -999;
    let mouseY = -999;
    let time = 0;

    // No exclusion zones — render everywhere

    function resize() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouseX = -999;
      mouseY = -999;
    }

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);
      ctx.font = "10px 'IBM Plex Mono', monospace";

      const cellW = 28;
      const cellH = 24;
      const cols = Math.ceil(w / cellW);
      const rows = Math.ceil(h / cellH);

      time += 0.004;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellW;
          const y = row * cellH + 12;
          const nx = col / cols;
          const ny = row / rows;

          // Sparse distribution — evenly scattered
          const hash = Math.sin(col * 12.98 + row * 78.23) * 43758.5453;
          const sparse = hash - Math.floor(hash);
          if (sparse > 0.25) continue;

          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / 180);

          const charSeed = Math.floor(Math.abs(Math.sin(col * 43.3 + row * 97.1 + time * 0.5)) * chars.length);
          const char = chars[charSeed % chars.length];

          // Base: very dim
          let alpha = 0.06;
          let r = 250, g = 250, b = 250;

          // Mouse proximity: brighten + colorize purple/pink
          if (proximity > 0) {
            alpha = 0.06 + proximity * 0.5;
            const hueShift = Math.sin(time * 2 + col * 0.1) * 0.5 + 0.5;
            r = Math.round(117 + hueShift * 50);
            g = Math.round(83 - hueShift * 20);
            b = Math.round(255);
          }

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillText(char, x, y);
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
    />
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = footerRef.current?.querySelectorAll(".fade-up");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="relative">
      <div className="max-w-[1100px] mx-auto relative overflow-hidden" style={{ background: "#1f1f1f" }}>

        {/* Content */}
        <div className="relative z-40 max-w-[1020px] mx-auto px-6 pt-10 md:pt-12 pb-0 pointer-events-none [&_a]:pointer-events-auto fade-up">
          <div>
          <div className="flex flex-col gap-12 md:gap-16">
            {/* Top row — socials left, copyright center, links right */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">
              {/* Left — social */}
              <div className="flex flex-col gap-3 md:w-1/3">
                {[
                  { name: "Instagram", href: "https://instagram.com/contadev" },
                  { name: "LinkedIn", href: "https://linkedin.com/company/contadev" },
                  { name: "YouTube", href: "https://youtube.com/@contadev" },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-white/60 hover:text-[#fafafa] transition-colors duration-200 no-underline"
                  >
                    {s.name}
                  </a>
                ))}
              </div>

              {/* Center — copyright */}
              <div className="text-center md:w-1/3">
                <p className="text-[12px] text-white/20">© 2026</p>
                <p className="text-[12px] text-white/20">ContaDev.</p>
              </div>

              {/* Right — links */}
              <div className="flex flex-col gap-3 md:items-end md:w-1/3">
                {["Privacidade", "Termos", "Contato"].map((l) => (
                  <a
                    key={l}
                    href={l === "Contato" ? "#contato" : "#"}
                    className="text-[13px] text-white/60 hover:text-[#fafafa] transition-colors duration-200 no-underline"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>

          </div>
          </div>
        </div>

        {/* Code decoration — on top of everything for mouse */}
        <div className="absolute inset-0 z-30">
          <CodeDecoration />
        </div>

        {/* Watermark — cut at ~60%, only top part visible */}
        <div
          className="relative z-[1] pointer-events-none select-none overflow-hidden"
          style={{ height: "clamp(50px, 7.2vw, 108px)", marginTop: "16px" }}
        >
          <p
            className="font-display font-bold text-center whitespace-nowrap transition-colors duration-1000 hover:text-white/[0.06]"
            style={{
              fontSize: "clamp(80px, 12vw, 180px)",
              color: "rgba(255,255,255,0.025)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            CONTADEV
          </p>
        </div>
      </div>
    </footer>
  );
}
