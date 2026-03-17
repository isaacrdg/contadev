"use client";
import { useEffect, useState } from "react";

const links = [
  { label: "Jornada",       href: "#jornada" },
  { label: "Plataforma",   href: "#tecnologia" },
  { label: "Preços",        href: "#precos" },
  { label: "FAQ",           href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(25,25,25,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      {/* Flex: logo + links à esquerda | cta à direita */}
      <div className="h-[68px] px-6 max-w-[1100px] mx-auto flex items-center justify-between">

        {/* Esquerda — Logo + Links */}
        <div className="flex items-center gap-10">
          <a href="#" className="flex items-center no-underline flex-shrink-0">
            <img src="/logo.svg" alt="ContaDev" style={{ height: "38px", width: "auto" }} />
          </a>

          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="no-underline whitespace-nowrap"
                style={{ fontSize: "14px", color: "rgba(255,255,255,0.60)", fontWeight: 400, transition: "color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.60)")}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Direita — CTA */}
        <div className="flex items-center">
          <a
            href="#contato"
            className="inline-flex no-underline items-center justify-center whitespace-nowrap text-[11px] md:text-[14px] py-2 px-4 md:py-[9px] md:px-[22px]"
            style={{
              fontWeight: 600,
              color: "#0D0B1E", background: "#ffffff",
              borderRadius: "999px",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e4ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            FALE COM UM ESPECIALISTA
          </a>
        </div>

      </div>
    </nav>
  );
}
