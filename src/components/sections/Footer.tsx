export default function Footer() {
  return (
    <footer style={{ background: "#1f1f1f", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1100px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 flex-wrap">
      {/* Logo */}
      <a href="#" className="no-underline">
        <img src="/logo.svg" alt="ContaDev" style={{ height: "30px" }} />
      </a>

      <span className="text-[12px] text-white/35">
        © 2026 ContaDev. Todos os direitos reservados.
      </span>

      <div className="flex items-center gap-6">
        {["Privacidade", "Termos", "Contato"].map((l) => (
          <a
            key={l}
            href={l === "Contato" ? "#contato" : "#"}
            className="text-[13px] text-white/35 hover:text-[#fafafa] transition-colors no-underline"
          >
            {l}
          </a>
        ))}
      </div>
      </div>
    </footer>
  );
}
