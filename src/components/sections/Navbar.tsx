"use client";
import { useEffect, useState } from "react";
import { useFormModal } from "@/components/FormContext";

const links = [
  { label: "Jornada",       href: "#jornada" },
  { label: "Plataforma",   href: "#tecnologia" },
  { label: "Preços",        href: "#precos" },
  { label: "FAQ",           href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { openForm } = useFormModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 animate-nav-slide"
      style={{
        background: scrolled ? "rgba(25,25,25,0.85)" : "transparent",
        borderBottom: "none",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
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
          <button
            onClick={openForm}
            className="group inline-flex items-center gap-2 whitespace-nowrap text-[11px] md:text-[13px] py-1.5 pl-5 pr-1.5 md:py-1.5 md:pl-6 md:pr-1.5"
            style={{
              fontWeight: 500,
              color: "#15191E",
              background: "#ffffff",
              borderRadius: "999px",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0ecff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            FALE COM UM ESPECIALISTA
            <span
              className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full transition-transform duration-300 group-hover:rotate-45"
              style={{ background: "#7553ff" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </span>
          </button>
        </div>

      </div>
    </nav>
  );
}
