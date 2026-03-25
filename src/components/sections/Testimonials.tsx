"use client";
import { useEffect, useRef, useState } from "react";
import SectionDivider from "@/components/SectionDivider";

type Source = "twitter" | "reddit";

const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const RedditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm6.066 13.71c.147.307.22.636.22.98 0 2.236-2.635 4.052-5.886 4.052S6.514 16.926 6.514 14.69c0-.344.073-.673.22-.98a1.562 1.562 0 01-.572-1.2 1.564 1.564 0 012.669-1.107c1.078-.678 2.53-1.106 4.126-1.146l.795-3.726a.34.34 0 01.404-.265l2.69.567a1.078 1.078 0 112.061.476 1.078 1.078 0 01-1.98-.18l-2.396-.505-.706 3.32c1.576.05 3.01.48 4.076 1.148a1.564 1.564 0 012.669 1.107c0 .475-.213.9-.572 1.2zM9.6 14.69a1.077 1.077 0 102.154 0 1.077 1.077 0 00-2.154 0zm5.723 2.15a.337.337 0 00-.003-.473.337.337 0 00-.473.003c-.552.553-1.453.825-2.847.825s-2.295-.272-2.847-.825a.337.337 0 00-.476.47c.684.685 1.762 1.018 3.323 1.018s2.64-.333 3.323-1.018zm-.375-1.073a1.077 1.077 0 100-2.154 1.077 1.077 0 000 2.154z" />
  </svg>
);

const row1 = [
  { name: "Rafael B.", grad: ["#7553ff", "#c084fc"], body: "troquei de contabilidade depois de ver um vídeo do Deyvin sobre PJ pra dev. melhor decisão que tomei, já economizei uns 12k em imposto desde que migrei pra ContaDev", role: "Backend Dev · PJ há 2 anos", source: "twitter" as Source },
  { name: "Camila R.", grad: ["#f472b6", "#fb923c"], body: "abri minha PJ em menos de 24h aqui kkkk processo todo digital e o suporte respondeu cada dúvida na hora, recomendo demais", role: "Dev Fullstack · remoto", source: "reddit" as Source },
  { name: "Lucas M.", grad: ["#34d399", "#2dd4bf"], body: "antes da contadev eu tinha pavor de lidar com imposto e NF. perdia noite achando que tava fazendo algo errado. agora tá tudo no automático e durmo tranquilo", role: "Mid Backend Dev · PJ", source: "twitter" as Source },
  { name: "André C.", grad: ["#60a5fa", "#818cf8"], body: "trabalho remoto pra startup na alemanha e invoice sempre foi um caos. contadev resolveu tudo de forma simples, sem eu precisar entender contabilidade", role: "Fullstack Dev · remoto internacional", source: "reddit" as Source },
  { name: "Marcos T.", grad: ["#a78bfa", "#f472b6"], body: "fui pesquisar no YouTube sobre contabilidade pra dev e caí num vídeo mencionando a ContaDev. testei e em 1 ano zero problema. simplesmente funciona.", role: "Tech Lead · PJ", source: "twitter" as Source },
  { name: "Tatiana S.", grad: ["#fb923c", "#f87171"], body: "finalmente uma contabilidade que fala a mesma língua que dev. NF automática, suporte rápido, sem burocracia. não largo mais", role: "Frontend Dev · CLT→PJ", source: "reddit" as Source },
];

const row2 = [
  { name: "Thiago P.", grad: ["#2dd4bf", "#60a5fa"], body: "achei que ia ser mais uma contabilidade genérica. mas o app é outro nível, emiti minha primeira NF em 2 min sem ligar pra ninguém", role: "Mobile Dev · PJ", source: "reddit" as Source },
  { name: "Diego L.", grad: ["#f87171", "#fbbf24"], body: "vi o Deyvin falando sobre quanto dev perde pagando imposto errado e fui atrás. saí de quase 15% pra 6% com a ContaDev. em 3 meses já pagou o ano inteiro", role: "Senior Dev · remoto", source: "twitter" as Source },
  { name: "Priscila F.", grad: ["#c084fc", "#f472b6"], body: "minha contabilidade antiga demorava dias pra responder. aqui em 20 min já tava tudo resolvido no WhatsApp. a diferença é absurda", role: "Dev Pleno · PJ", source: "twitter" as Source },
  { name: "Felipe O.", grad: ["#818cf8", "#34d399"], body: "uso a plataforma todo mês, zero dor de cabeça. a declaração de IR automatizada foi o que me convenceu de vez", role: "DevOps · PJ há 3 anos", source: "reddit" as Source },
  { name: "Larissa A.", grad: ["#f472b6", "#a78bfa"], body: "conheci a ContaDev por indicação de um canal no YouTube sobre carreira dev. cuida de tudo: invoice, câmbio, imposto. só codar agora", role: "Backend Dev · remoto US", source: "twitter" as Source },
  { name: "Ricardo N.", grad: ["#fbbf24", "#fb923c"], body: "preciso deixar registrado: a ContaDev salvou minha transição de CLT pra PJ. não entendia nada de contabilidade e tinha medo de errar tudo. pesquisei no YouTube e achei eles", role: "Junior Dev · primeiro PJ", source: "reddit" as Source },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="depoimentos" className="relative" ref={sectionRef}>
      <SectionDivider cross="left" />

      {/* Header */}
      <div className="max-w-[1020px] mx-auto text-center mt-8 md:mt-12 mb-8 px-5">
        <h2 className="font-display font-bold text-4xl md:text-[38px] leading-[1.15] tracking-tight text-[#fafafa] mb-3" style={{ letterSpacing: "-.3px" }}>
          O que os devs{" "}<em className="not-italic gradient-text">estão falando</em>
        </h2>
        <p className="text-[15px] text-[#e0e0e0]">+500 devs já confiam na ContaDev.</p>
      </div>

      {/* Carousel area — full width but fades at 1100px edges */}
      <div className="max-w-[1100px] mx-auto relative">
        {/* Row 1 — left */}
        <div className="overflow-hidden border-t border-white/[0.06]">
          <div className="flex w-max testimonial-row-left" style={{ animationPlayState: inView ? "running" : "paused" }}>
            {[...row1, ...row1].map((t, i) => (
              <div key={i} className="w-[300px] flex-shrink-0 border-r border-white/[0.06] px-5 py-5 transition-colors duration-300 hover:bg-white/[0.02] relative">
                <div className="absolute top-4 right-4 text-white/20">
                  {t.source === "twitter" ? <TwitterIcon /> : <RedditIcon />}
                </div>
                <p className="text-[13px] leading-[1.7] text-[#e0e0e0] mb-4 pr-6">{t.body}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})` }} />
                  <div>
                    <p className="text-[12px] text-[#fafafa] font-medium leading-tight">{t.name}</p>
                    <p className="text-[10px] text-white/35">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — right */}
        <div className="overflow-hidden border-t border-b border-white/[0.06]">
          <div className="flex w-max testimonial-row-right" style={{ animationPlayState: inView ? "running" : "paused" }}>
            {[...row2, ...row2].map((t, i) => (
              <div key={i} className="w-[300px] flex-shrink-0 border-r border-white/[0.06] px-5 py-5 transition-colors duration-300 hover:bg-white/[0.02] relative">
                <div className="absolute top-4 right-4 text-white/20">
                  {t.source === "twitter" ? <TwitterIcon /> : <RedditIcon />}
                </div>
                <p className="text-[13px] leading-[1.7] text-[#e0e0e0] mb-4 pr-6">{t.body}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})` }} />
                  <div>
                    <p className="text-[12px] text-[#fafafa] font-medium leading-tight">{t.name}</p>
                    <p className="text-[10px] text-white/35">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fades left/right */}
        <div className="absolute top-0 left-0 bottom-0 w-16 pointer-events-none z-10" style={{ background: "linear-gradient(to right, #191919, transparent)" }} />
        <div className="absolute top-0 right-0 bottom-0 w-16 pointer-events-none z-10" style={{ background: "linear-gradient(to left, #191919, transparent)" }} />
      </div>

      <div className="mb-8 md:mb-12" />
    </section>
  );
}
