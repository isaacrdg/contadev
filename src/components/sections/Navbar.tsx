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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

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

        {/* Direita — CTA + hamburguer */}
        <div className="flex items-center gap-4">
          <a
            href="#contato"
            className="hidden md:inline-flex no-underline items-center justify-center whitespace-nowrap"
            style={{
              fontSize: "14px", fontWeight: 600,
              color: "#0D0B1E", background: "#ffffff",
              borderRadius: "999px", padding: "9px 22px",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e4ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            FALE COM UM ESPECIALISTA
          </a>

          {/* Hamburguer — mobile */}
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] p-1"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "block", width: 22, height: 2,
                background: "#fafafa", borderRadius: 2,
                transition: "transform .25s, opacity .25s",
                ...(i === 0 && menuOpen ? { transform: "translateY(7px) rotate(45deg)" } : {}),
                ...(i === 1 ? { opacity: menuOpen ? 0 : 1 } : {}),
                ...(i === 2 && menuOpen ? { transform: "translateY(-7px) rotate(-45deg)" } : {}),
              }} />
            ))}
          </button>
        </div>

      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen ? "340px" : "0px",
          borderTop: menuOpen ? "1px solid rgba(255,255,255,0.07)" : "none",
          background: "rgba(25,25,25,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={closeMenu}
              className="no-underline py-3"
              style={{
                fontSize: "15px", color: "rgba(255,255,255,0.65)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contato"
            onClick={closeMenu}
            className="no-underline text-center mt-4 py-3"
            style={{
              fontSize: "15px", fontWeight: 600,
              color: "#0D0B1E", background: "#ffffff",
              borderRadius: "999px",
            }}
          >
            FALE COM UM ESPECIALISTA
          </a>
        </div>
      </div>
    </nav>
  );
}
