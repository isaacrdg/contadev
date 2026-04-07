import type { Lead } from "./leads-store";

const PROFILE_LABELS: Record<string, string> = {
  open_company: "Abrir empresa",
  existing_company: "Já tem empresa",
  first_freela: "Primeiro freela",
  mei: "Sair do MEI",
  other: "Outro",
};

/**
 * Returns the configured webhook URL, or null if not set.
 */
export function getWebhookUrl(): string | null {
  return process.env.LEAD_WEBHOOK_URL || null;
}

/**
 * True if the configured webhook URL points to a Slack incoming webhook.
 * If so, we send a Slack-formatted Block Kit payload.
 * Otherwise we send the raw lead JSON (for Make/n8n/Zapier/custom).
 */
function isSlackUrl(url: string): boolean {
  return url.startsWith("https://hooks.slack.com/");
}

function buildSlackPayload(lead: Lead, isReturning = false) {
  const utmLines = lead.utmData
    ? Object.entries(lead.utmData)
        .filter(([, v]) => v)
        .map(([k, v]) => `   "${k}": "${v}"`)
        .join(",\n")
    : "";

  const headerText = isReturning
    ? "Usuário que já preencheu nosso formulário anteriormente, preencheu de novo:"
    : "Usuário Preencheu nosso formulário:";

  const lines = [
    headerText,
    "",
    `*Nome:* ${lead.name}`,
    `*Telefone:* ${lead.phone}`,
    `*Email:* ${lead.email}`,
    `*Trabalha:* ${lead.worksWhere === "brasil" ? "🇧🇷 Brasil" : "🌎 Exterior"}`,
    `*Perfil:* ${PROFILE_LABELS[lead.profile] || lead.profile}`,
  ];

  if (lead.coupon) lines.push(`*Cupom:* ${lead.coupon}`);

  if (utmLines) {
    lines.push("");
    lines.push("*UTM Data:* ```{");
    lines.push(utmLines);
    lines.push("}```");
  }

  return {
    text: `${headerText} ${lead.name}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: lines.join("\n"),
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `_id: \`${lead.id}\` · ${new Date(lead.createdAt).toLocaleString("pt-BR")}_`,
          },
        ],
      },
    ],
  };
}

/**
 * Forwards a lead to the configured webhook (fire-and-forget).
 * Returns true on success, false on any failure (lead is still saved locally).
 */
export async function forwardLead(lead: Lead): Promise<boolean> {
  const url = getWebhookUrl();
  if (!url) return false;

  try {
    const payload = isSlackUrl(url) ? buildSlackPayload(lead) : lead;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    console.error("[lead-webhook] Falha ao encaminhar lead:", err);
    return false;
  }
}

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  convertido: "Convertido ✅",
  perdido: "Perdido ❌",
};

/**
 * Notifica mudança de status no Slack (fire-and-forget).
 */
export async function notifyStatusChange(
  lead: Lead,
  fromStatus: string,
  toStatus: string
): Promise<boolean> {
  const url = getWebhookUrl();
  if (!url) return false;

  try {
    const headerText = `Lead movido: ${STATUS_LABELS[fromStatus] ?? fromStatus} → ${STATUS_LABELS[toStatus] ?? toStatus}`;
    const payload = isSlackUrl(url)
      ? {
          text: `${headerText} — ${lead.name}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: [
                  `*${headerText}*`,
                  `*${lead.name}* · ${lead.phone}`,
                  `_${lead.email}_`,
                ].join("\n"),
              },
            },
          ],
        }
      : { event: "status_change", lead, from: fromStatus, to: toStatus };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    console.error("[lead-webhook] Falha ao notificar status change:", err);
    return false;
  }
}

/**
 * Sends a synthetic test payload to the webhook for verification.
 */
export async function sendTestWebhook(): Promise<{
  ok: boolean;
  status: number;
  message: string;
}> {
  const url = getWebhookUrl();
  if (!url) {
    return { ok: false, status: 0, message: "LEAD_WEBHOOK_URL não configurado" };
  }

  const now = new Date().toISOString();
  const testLead: Lead = {
    id: "test-" + Date.now(),
    name: "Teste de Integração",
    phone: "(11) 99999-9999",
    email: "teste@conta-dev.com",
    worksWhere: "brasil",
    profile: "open_company",
    status: "novo",
    statusHistory: [{ status: "novo", at: now }],
    tags: ["teste", "integration-check"],
    utmData: {
      utmSource: "admin",
      utmMedium: "test",
      utmContent: "integration_check",
    },
    createdAt: now,
    updatedAt: now,
  };

  try {
    const payload = isSlackUrl(url) ? buildSlackPayload(testLead) : testLead;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    return {
      ok: res.ok,
      status: res.status,
      message: res.ok ? "Mensagem de teste enviada com sucesso" : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
