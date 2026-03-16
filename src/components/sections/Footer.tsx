export default function Footer() {
  return (
    <footer
      className="px-6 md:px-12 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 flex-wrap"
      style={{
        background: "#0F0F1A",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo */}
      <a href="#" className="no-underline">
        <img src="/logo.svg" alt="ContaDev" style={{ height: "30px" }} />
      </a>

      <span className="text-[12px] text-[#6B7280]">
        © 2026 ContaDev. Todos os direitos reservados.
      </span>

      <div className="flex items-center gap-6">
        {["Privacidade", "Termos", "Contato"].map((l) => (
          <a
            key={l}
            href={l === "Contato" ? "#contato" : "#"}
            className="text-[13px] text-[#6B7280] hover:text-[#F4F4F8] transition-colors no-underline"
          >
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}
