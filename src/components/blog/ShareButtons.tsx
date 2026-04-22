"use client";
import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `${title}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;
  const xHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.1em] font-mono mr-1.5" style={{ color: "rgba(250,250,250,0.35)" }}>
        share
      </span>

      <ShareLink href={waHref} label="WhatsApp">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4c-4.35 0-7.88 3.53-7.88 7.88 0 1.39.36 2.74 1.06 3.94L4 20l4.31-1.13a7.86 7.86 0 0 0 3.74.95h.01c4.35 0 7.88-3.53 7.88-7.88 0-2.1-.82-4.08-2.34-5.62zm-5.55 12.12c-1.16 0-2.31-.31-3.31-.9l-.24-.14-2.56.67.68-2.49-.15-.25a6.55 6.55 0 0 1-1-3.45c0-3.62 2.94-6.56 6.57-6.56 1.75 0 3.4.68 4.64 1.92a6.5 6.5 0 0 1 1.92 4.64c0 3.63-2.95 6.56-6.55 6.56zm3.6-4.92c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.45.1-.13.2-.5.64-.61.77-.11.13-.22.15-.42.05-.2-.1-.83-.3-1.58-.98-.58-.52-.98-1.16-1.09-1.36-.11-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.45-1.08-.61-1.48-.16-.39-.33-.34-.45-.34l-.38-.01c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.67 0 .98.72 1.93.82 2.07.1.13 1.42 2.17 3.44 3.04.48.21.86.33 1.15.43.48.15.92.13 1.27.08.39-.06 1.17-.48 1.34-.94.17-.46.17-.85.12-.94-.05-.09-.18-.14-.38-.23z" />
        </svg>
      </ShareLink>

      <ShareLink href={xHref} label="X (Twitter)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </ShareLink>

      <ShareLink href={liHref} label="LinkedIn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
        </svg>
      </ShareLink>

      <button
        onClick={copy}
        aria-label="Copiar link"
        className="w-8 h-8 rounded-md flex items-center justify-center transition-colors relative"
        style={{
          background: copied ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${copied ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.08)"}`,
          color: copied ? "#6ee7b7" : "rgba(250,250,250,0.7)",
        }}
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
        )}
      </button>
    </div>
  );
}

function ShareLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-white/10"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(250,250,250,0.7)",
      }}
    >
      {children}
    </a>
  );
}
