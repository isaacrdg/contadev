import type { Lead } from "./leads-store";

export type WaTemplateIcon =
  | "wave"
  | "search"
  | "money"
  | "phone"
  | "refresh"
  | "check";

export interface WaTemplate {
  id: string;
  label: string;
  /** Ícone do botão (SVG) — não vai pra mensagem */
  icon: WaTemplateIcon;
  /** Use {firstName}, {name}, {coupon} como placeholders. Emojis aqui vão pro WhatsApp normalmente. */
  template: string;
}

/**
 * Templates de WhatsApp pra venda consultiva (estilo Malu).
 * Edite/adicione livremente — os placeholders {firstName}, {name}, {coupon}
 * são substituídos pelo lead atual antes de abrir o WA.
 */
export const WA_TEMPLATES: WaTemplate[] = [
  {
    id: "saudacao",
    label: "Saudação inicial",
    icon: "wave",
    template:
      "E aí, {firstName}! 😊 Sou a Malu, especialista da Conta Dev. Vi que você preencheu nosso form e tô aqui pra te ajudar com tudo que você precisar 💜",
  },
  {
    id: "descoberta",
    label: "Descoberta",
    icon: "search",
    template:
      "Pra eu te orientar do melhor jeito, me conta um pouco do seu cenário? Tipo: você já tem CNPJ ou ainda vai abrir? Recebe pelo Brasil ou exterior? Tô curiosa pra entender 🚀",
  },
  {
    id: "simulacao",
    label: "Simulação de impostos",
    icon: "money",
    template:
      "Show, {firstName}! Vou gerar uma simulação dos seus impostos e te explicar tudinho. Em geral nossos clientes economizam ~50% só pela estrutura tributária correta 💜",
  },
  {
    id: "agendar-call",
    label: "Agendar call",
    icon: "phone",
    template:
      "Oi {firstName}! Que tal a gente marcar uma call rápida (15 min) pra eu te explicar tudo direitinho e tirar suas dúvidas? Me passa um horário que funciona pra você 😊",
  },
  {
    id: "follow-up",
    label: "Follow-up",
    icon: "refresh",
    template:
      "Oi {firstName}, tudo bem? Conseguiu pensar no que conversamos? Tô por aqui se surgir qualquer dúvida 💜",
  },
  {
    id: "fechamento",
    label: "Fechamento",
    icon: "check",
    template:
      "Maravilha, {firstName}! Vou te enviar agora o link pra você criar seu acesso e dar o start na nossa parceria 🚀",
  },
];

export function renderTemplate(template: string, lead: Lead): string {
  const firstName = lead.name.trim().split(/\s+/)[0] ?? "";
  return template
    .replace(/\{firstName\}/g, firstName)
    .replace(/\{name\}/g, lead.name)
    .replace(/\{coupon\}/g, lead.coupon ?? "");
}

export function buildWaUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/55${digits}?text=${encoded}`;
}
