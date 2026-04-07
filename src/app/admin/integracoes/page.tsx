import { getWebhookUrl } from "@/lib/lead-webhook";
import IntegracoesClient from "./IntegracoesClient";

export const dynamic = "force-dynamic";

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 12 ? u.pathname.slice(0, 8) + "…" + u.pathname.slice(-4) : u.pathname;
    return `${u.protocol}//${u.host}${path}`;
  } catch {
    return "URL inválida";
  }
}

export default function IntegracoesPage() {
  const url = getWebhookUrl();
  const isConfigured = !!url;
  const isSlack = url?.startsWith("https://hooks.slack.com/") ?? false;
  const masked = url ? maskUrl(url) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight">Integrações</h1>
        <p className="text-[12px] text-white/40 mt-1">
          Encaminhamento automático de leads pra canais externos
        </p>
      </div>

      {/* Webhook card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: isConfigured
                  ? "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                border: isConfigured
                  ? "1px solid rgba(34,197,94,0.4)"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {isSlack ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isConfigured ? "#6ee7b7" : "rgba(255,255,255,0.5)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="9" width="6" height="6" rx="1.5" />
                  <rect x="9" y="2" width="6" height="6" rx="1.5" />
                  <rect x="16" y="9" width="6" height="6" rx="1.5" />
                  <rect x="9" y="16" width="6" height="6" rx="1.5" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isConfigured ? "#6ee7b7" : "rgba(255,255,255,0.5)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-[15px] font-semibold leading-tight">
                {isSlack ? "Slack Incoming Webhook" : "Webhook genérico"}
              </h2>
              <p className="text-[11px] text-white/50 mt-1">
                {isConfigured
                  ? "Cada lead novo é encaminhado automaticamente pro canal"
                  : "Não configurado — leads ficam só no painel local"}
              </p>
            </div>
          </div>

          <span
            className="text-[10px] font-semibold uppercase tracking-[0.06em] px-3 py-1.5 rounded-full whitespace-nowrap"
            style={
              isConfigured
                ? {
                    background: "rgba(110,231,183,0.12)",
                    border: "1px solid rgba(110,231,183,0.3)",
                    color: "#6ee7b7",
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                  }
            }
          >
            {isConfigured ? "● Conectado" : "○ Desconectado"}
          </span>
        </div>

        {isConfigured && masked && (
          <div
            className="rounded-lg px-3 py-2.5 mb-5 font-mono text-[11px] text-white/60"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {masked}
          </div>
        )}

        <IntegracoesClient isConfigured={isConfigured} />
      </div>

      {/* Setup instructions */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c4b1ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Como conectar (1 minuto)
        </h3>

        <ol className="space-y-3 text-[12px] text-white/65">
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: "rgba(143,111,255,0.15)",
                border: "1px solid rgba(143,111,255,0.4)",
                color: "#c4b1ff",
              }}
            >
              1
            </span>
            <div>
              <strong className="text-white/85">Pega a URL do seu webhook</strong> — pode ser do Slack
              (Apps → Incoming Webhooks → Add to channel) <strong>OU</strong> do Make/Zapier/n8n que você
              já usa hoje (exemplo: o "automation sensation" do canal #mkt-leads).
            </div>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: "rgba(143,111,255,0.15)",
                border: "1px solid rgba(143,111,255,0.4)",
                color: "#c4b1ff",
              }}
            >
              2
            </span>
            <div>
              <strong className="text-white/85">Cola no .env.local</strong> (ou nas env vars da Vercel em produção):
              <pre
                className="mt-2 px-3 py-2 rounded font-mono text-[11px] text-[#c4b1ff] overflow-x-auto"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
{`LEAD_WEBHOOK_URL=https://hooks.slack.com/services/...`}
              </pre>
            </div>
          </li>
          <li className="flex gap-3">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: "rgba(143,111,255,0.15)",
                border: "1px solid rgba(143,111,255,0.4)",
                color: "#c4b1ff",
              }}
            >
              3
            </span>
            <div>
              <strong className="text-white/85">Reinicia o dev server</strong> (ou redeploy na Vercel),
              volta nessa página e clica em <strong>Enviar mensagem de teste</strong>. Se aparecer no canal,
              tá pronto.
            </div>
          </li>
        </ol>

        <div
          className="mt-5 px-4 py-3 rounded-lg text-[11px] text-white/55"
          style={{
            background: "rgba(143,111,255,0.06)",
            border: "1px solid rgba(143,111,255,0.18)",
          }}
        >
          <strong className="text-[#c4b1ff]">Auto-detect:</strong> se a URL começar com{" "}
          <code className="font-mono text-[10px] text-white/70">hooks.slack.com</code>, formatamos como Slack
          Block Kit (visual rico, igual o "automation sensation"). Caso contrário, mandamos o JSON cru do
          lead pra qualquer Make/Zapier/n8n/webhook customizado processar.
        </div>
      </div>
    </div>
  );
}
