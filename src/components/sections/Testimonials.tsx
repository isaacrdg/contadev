"use client";
import SectionDivider from "@/components/SectionDivider";

const row1 = [
  { name: "Rafael Brito", grad: ["#7553ff", "#c084fc"], body: "migrei pra ContaDev há 6 meses e economizei mais de 12k em imposto. Absurdo como eu tava pagando a mais antes disso, nem acreditei quando vi o comparativo.", role: "Senior Backend Dev @ Nubank" },
  { name: "Gabriel Mendes", grad: ["#f472b6", "#fb923c"], body: "mano abri minha PJ em menos de 24h aqui kkkk processo todo digital e o suporte respondeu cada dúvida na hora 🔥🔥", role: "Junior Dev @ Toptal" },
  { name: "Lucas Silva", grad: ["#34d399", "#2dd4bf"], body: "cara eu preciso agradecer publicamente. antes da contadev eu tinha PAVOR de lidar com imposto, nota fiscal, essas coisas. perdia noite de sono achando que tava fazendo algo errado. desde que migrei...", role: "Mid Backend Dev @ iFood" },
  { name: "André Costa", grad: ["#60a5fa", "#818cf8"], body: "trabalho remoto pra startup na alemanha e invoice sempre foi um caos total. contadev resolveu tudo de forma simples, sem eu precisar entender nada de contabilidade", role: "Senior Full Stack Dev @ Delivery Hero" },
  { name: "Marcos Rocha", grad: ["#a78bfa", "#f472b6"], body: "Reduzi minha alíquota, faz 1 ano sem nenhum problema. Simplesmente funciona.", role: "Tech Lead @ Creditas" },
  { name: "Tatiana Campos", grad: ["#fb923c", "#f87171"], body: "finalmente uma contabilidade que fala a mesma língua que dev!! NF automática suporte rápido sem burocracia 😍 não largo mais", role: "Frontend Dev @ Spotify" },
];

const row2 = [
  { name: "Thiago Martins", grad: ["#2dd4bf", "#60a5fa"], body: "Achei que ia ser igual todas as contabilidades que já usei. Mas o app deles é outro mundo — emiti minha primeira NF em 2 minutos, sem ligar pra ninguém.", role: "Mobile Dev @ 99" },
  { name: "Diego Lima", grad: ["#f87171", "#fbbf24"], body: "antes pagava quase 15% de imposto depois da contadev caiu pra 6%... em 3 meses já pagou o investimento do ano inteiro 💰", role: "Senior Dev @ Vercel" },
  { name: "Priscila Santos", grad: ["#c084fc", "#f472b6"], body: "Minha contabilidade antiga demorava DIAS pra responder. Aqui em 20 min já tava tudo resolvido no WhatsApp. A diferença é gritante.", role: "Mid Dev @ Stone" },
  { name: "Felipe Oliveira", grad: ["#818cf8", "#34d399"], body: "uso a plataforma todo mês, nunca tive problema nenhum. a declaração de IR automatizada foi o que me ganhou de vez", role: "DevOps Engineer @ Deel" },
  { name: "Larissa Almeida", grad: ["#f472b6", "#a78bfa"], body: "trabalho remoto pra empresa americana e a ContaDev cuida de TUDO: invoice câmbio imposto... posso focar só em codar 🚀✨", role: "Backend Dev @ Cloudflare" },
  { name: "Ricardo Melo", grad: ["#fbbf24", "#fb923c"], body: "Eu preciso deixar registrado aqui: a ContaDev salvou minha transição de CLT pra PJ. Eu não entendia NADA de contabilidade, tinha medo de abrir empresa, de errar no imposto...", role: "Junior Dev @ Vtex" },
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="relative">
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
          <div className="flex w-max testimonial-row-left">
            {[...row1, ...row1].map((t, i) => (
              <div key={i} className="w-[300px] flex-shrink-0 border-r border-white/[0.06] px-5 py-5 transition-colors duration-300 hover:bg-white/[0.02]">
                <p className="text-[13px] leading-[1.7] text-[#e0e0e0] mb-4">{t.body}</p>
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
          <div className="flex w-max testimonial-row-right">
            {[...row2, ...row2].map((t, i) => (
              <div key={i} className="w-[300px] flex-shrink-0 border-r border-white/[0.06] px-5 py-5 transition-colors duration-300 hover:bg-white/[0.02]">
                <p className="text-[13px] leading-[1.7] text-[#e0e0e0] mb-4">{t.body}</p>
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
