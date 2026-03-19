import SectionDivider from "@/components/SectionDivider";

const brands = [
  { name: "Spotify",  logo: "/logos/spotify.svg" },
  { name: "Nubank",   logo: "/logos/nubank.svg" },
  { name: "Toptal",   logo: "/logos/toptal.svg" },
  { name: "iFood",    logo: "/logos/ifood.svg" },
  { name: "Stone",    logo: "/logos/stone.svg" },
  { name: "Dell",     logo: "/logos/dell.svg" },
  { name: "99",       logo: "/logos/99.svg" },
  { name: "Creditas", logo: "/logos/creditas.svg" },
];

const allBrands = [...brands, ...brands];

export default function LogosStrip() {
  return (
    <section className="relative">
      <div
        className="max-w-[1100px] mx-auto px-5 md:px-6 py-3 md:py-4 flex items-center gap-4 md:gap-8 animate-slide-in"
        style={{ background: "#1f1f1f", borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="text-[9px] md:text-[10px] text-white/35 uppercase tracking-[.08em] whitespace-nowrap flex-shrink-0">
          Profissionais de
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="carousel-track items-center gap-10 md:gap-14">
            {allBrands.map((brand, i) => (
              <img
                key={i}
                src={brand.logo}
                alt={brand.name}
                className="h-[18px] w-auto object-contain flex-shrink-0"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.25 }}
              />
            ))}
          </div>
          {/* Fade right */}
          <div
            className="absolute top-0 right-0 bottom-0 w-20 pointer-events-none z-10"
            style={{ background: "linear-gradient(to left, #1f1f1f, transparent)" }}
          />
        </div>
      </div>
      <SectionDivider cross="left" />
    </section>
  );
}
