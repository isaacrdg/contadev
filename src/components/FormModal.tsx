"use client";
import { useEffect, useRef, useState } from "react";

interface FormModalProps {
  open: boolean;
  onClose: () => void;
}

type WorksWhere = "brasil" | "exterior";
type Profile =
  | "open_company"
  | "existing_company"
  | "first_freela"
  | "mei"
  | "other";

interface UtmData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

function captureUtmFromUrl(): UtmData | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const utm: UtmData = {};
  const src = params.get("utm_source");
  const med = params.get("utm_medium");
  const cmp = params.get("utm_campaign");
  const cnt = params.get("utm_content");
  const trm = params.get("utm_term");
  if (src) utm.utmSource = src;
  if (med) utm.utmMedium = med;
  if (cmp) utm.utmCampaign = cmp;
  if (cnt) utm.utmContent = cnt;
  if (trm) utm.utmTerm = trm;
  return Object.keys(utm).length > 0 ? utm : undefined;
}

const profileOptions: { key: Profile; brasil: string; exterior: string }[] = [
  { key: "open_company", brasil: "Preciso abrir uma empresa", exterior: "Preciso abrir uma empresa" },
  { key: "existing_company", brasil: "Já tenho uma empresa e preciso de auxílio", exterior: "Já tenho uma empresa e preciso de auxílio" },
  { key: "first_freela", brasil: "Arrumei meu primeiro freela", exterior: "Arrumei meu primeiro freela pra fora!" },
  { key: "mei", brasil: "Preciso Sair do MEI", exterior: "Preciso Sair do MEI" },
  { key: "other", brasil: "Outro", exterior: "Outro" },
];

export default function FormModal({ open, onClose }: FormModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [worksWhere, setWorksWhere] = useState<WorksWhere | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const utmRef = useRef<UtmData | undefined>(undefined);

  // Captura UTMs uma vez na primeira vez que o modal abre — antes do pushState mudar a URL
  useEffect(() => {
    if (open && !utmRef.current) {
      utmRef.current = captureUtmFromUrl();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      window.history.pushState({}, "", "?form=true");
    } else {
      document.body.style.overflow = "";
      if (window.location.search.includes("form=true")) {
        window.history.pushState({}, "", window.location.pathname);
      }
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) {
      // reset everything
      setStep(1);
      setName(""); setPhone(""); setEmail("");
      setCoupon(""); setShowCoupon(false);
      setWorksWhere(null); setProfile(null);
      setLoading(false);
    }
  }, [open]);

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (!digits.length) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  const step1Valid =
    name.trim().length > 1 &&
    phone.replace(/\D/g, "").length >= 10 &&
    /\S+@\S+\.\S+/.test(email);

  const step2Valid = worksWhere !== null && profile !== null;

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!step1Valid) return;
    setStep(2);
  }

  async function handleStep2Submit() {
    if (!step2Valid || loading) return;
    setLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, email,
          coupon: coupon || undefined,
          worksWhere, profile,
          utmData: utmRef.current,
        }),
      });
    } catch {
      // continue to success state regardless
    }
    setLoading(false);
    setStep(3);
  }

  if (!open) return null;

  return (
    <div className="cd-overlay" onClick={onClose}>
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} aria-label="Fechar" className="cd-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ════════ STEP 1 ════════ */}
        {step === 1 && (
          <div className="cd-inner">
            <div style={{ paddingBottom: 16, marginBottom: 4 }}>
              <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 5 }}>
                VAMOS COMEÇAR!
              </h2>
            </div>
            <div style={{ paddingBottom: 8 }}>
              <p style={{ color: "#cccccc", fontSize: 17, marginBottom: 22, lineHeight: 1.4 }}>
                Nos diga como entrar em contato com você!
              </p>
              <p style={{ color: "#cccccc", fontSize: 17, marginBottom: 26, lineHeight: 1.4 }}>
                Um de nossos especialistas utilizará os dados inseridos abaixo para entrar em contato!
              </p>

              <form onSubmit={handleStep1Submit}>
                <FloatingInput id="name" label="Nome Completo" type="text" autoComplete="name" value={name} onChange={setName} />
                <FloatingInput id="phone" label="Telefone" type="tel" autoComplete="tel" value={phone} onChange={(v) => setPhone(formatPhone(v))} maxLength={19} />
                <FloatingInput id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />

                {showCoupon && (
                  <FloatingInput id="coupon" label="Cupom de Desconto" type="text" value={coupon} onChange={(v) => setCoupon(v.toUpperCase())} />
                )}

                <div className="cd-coupon-row">
                  {!showCoupon && (
                    <button type="button" onClick={() => setShowCoupon(true)} className="cd-coupon-btn">
                      <span className="cd-highlight">Inserir Cupom de Desconto</span>
                    </button>
                  )}
                </div>

                <div className="cd-submit-row">
                  <button type="submit" disabled={!step1Valid} className="cd-button">
                    <span className="cd-button-text">Enviar!</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════ STEP 2 ════════ */}
        {step === 2 && (
          <div className="cd-inner">
            <div style={{ paddingBottom: 16, marginBottom: 4 }}>
              <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 5 }}>
                ESTAMOS QUASE LÁ
              </h2>
              <p style={{ color: "#ededed", fontSize: 14, fontWeight: 600, marginTop: 8 }}>
                Que bom te ver aqui, {name.split(" ")[0]}!
              </p>
            </div>

            <div style={{ paddingBottom: 8 }}>
              <p style={{ color: "#cccccc", fontSize: 16, marginBottom: 14, textAlign: "center" }}>
                Você trabalha:
              </p>
              <div className="cd-grid-2">
                <button
                  type="button"
                  onClick={() => { setWorksWhere("brasil"); setProfile(null); }}
                  className={`cd-option cd-option-flag ${worksWhere === "brasil" ? "cd-option-active" : ""}`}
                >
                  <span className="cd-flag cd-flag-br" aria-hidden />
                  <span>Para o Brasil</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setWorksWhere("exterior"); setProfile(null); }}
                  className={`cd-option cd-option-flag ${worksWhere === "exterior" ? "cd-option-active" : ""}`}
                >
                  <span className="cd-flag cd-flag-un" aria-hidden />
                  <span>Para Fora</span>
                </button>
              </div>

              {worksWhere && (
                <>
                  <p style={{ color: "#cccccc", fontSize: 16, marginTop: 24, marginBottom: 14, textAlign: "center" }}>
                    Qual das opções melhor te descreve?
                  </p>
                  <div className="cd-grid-2">
                    {profileOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setProfile(opt.key)}
                        className={`cd-option ${profile === opt.key ? "cd-option-active" : ""}`}
                      >
                        {worksWhere === "brasil" ? opt.brasil : opt.exterior}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="cd-submit-row" style={{ marginTop: 24 }}>
                <button type="button" onClick={handleStep2Submit} disabled={!step2Valid || loading} className="cd-button">
                  <span className="cd-button-text">{loading ? "Enviando..." : "Próximo passo!"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════ STEP 3 — SUCCESS ════════ */}
        {step === 3 && (
          <div className="cd-inner" style={{ textAlign: "center", paddingTop: 12, paddingBottom: 24 }}>
            <div className="cd-check">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 8, marginTop: 6 }}>
              ENTRAREMOS EM CONTATO
            </h2>
            <p style={{ color: "#cccccc", fontSize: 16, marginBottom: 8, lineHeight: 1.45, maxWidth: 360, marginInline: "auto" }}>
              Um de nossos especialistas entrará em contato para confirmar seus dados e iniciar o seu atendimento.
            </p>
            <p style={{ color: "#9b80ff", fontSize: 13, marginTop: 18, fontStyle: "italic" }}>
              Eita, que rápido kkkk
            </p>
            <div style={{ marginTop: 22 }}>
              <button onClick={onClose} className="cd-button">
                <span className="cd-button-text">Fechar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────── Styles ─────── */}
      <style jsx>{`
        .cd-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 15px;
          z-index: 99999;
          animation: cdFade 0.2s ease;
        }
        .cd-modal {
          background: #1a1a1a;
          border-radius: 8px;
          width: 475px;
          max-width: 100%;
          max-height: 90vh;
          overflow: auto;
          padding: 24px 22px 26px;
          position: relative;
          animation: cdPop 0.25s ease;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.55);
        }
        .cd-inner { padding: 0 4px; }
        .cd-close {
          position: absolute; top: 12px; right: 12px;
          width: 30px; height: 30px; border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.55);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
          z-index: 2;
        }
        .cd-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .cd-coupon-row {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          margin-top: 18px; margin-bottom: 6px;
        }
        .cd-coupon-btn {
          background: none; border: none; cursor: pointer;
          padding: 4px 8px;
          transition: opacity 0.2s ease;
        }
        .cd-coupon-btn:hover { opacity: 0.7; }
        .cd-highlight {
          background: linear-gradient(180deg, #3c0dff, #7553ff, #7553ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 14px;
          font-weight: 500;
        }

        .cd-submit-row {
          display: flex; justify-content: center;
          margin-top: 8px;
        }

        .cd-button {
          background: linear-gradient(135deg, #6644f2, #5129f0);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 14px 36px;
          border-radius: 30px;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(102, 68, 242, 0.3);
          position: relative; overflow: hidden;
          min-width: 180px;
        }
        .cd-button:before {
          content: "";
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .cd-button:hover:before { left: 100%; }
        .cd-button:hover {
          background: linear-gradient(135deg, #5129f0, #3d1fef);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102, 68, 242, 0.4);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .cd-button:active { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(102, 68, 242, 0.3); }
        .cd-button:disabled,
        .cd-button:disabled:hover {
          background: linear-gradient(135deg, #8e75ef, #7a5fef);
          opacity: 0.3;
          cursor: default;
          box-shadow: none;
          transform: none;
        }
        .cd-button:disabled:before { display: none; }
        .cd-button-text {
          font-size: 15px;
          color: #f5f5f5;
          font-weight: 500;
          font-family: Inter, Arial, sans-serif;
          position: relative;
          z-index: 1;
        }

        .cd-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .cd-option {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e5e5e5;
          font-size: 13px;
          font-weight: 500;
          padding: 14px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          min-height: 52px;
          line-height: 1.25;
        }
        .cd-option:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.18);
        }
        .cd-option-active {
          background: linear-gradient(135deg, rgba(102,68,242,0.2), rgba(81,41,240,0.1));
          border-color: rgba(117, 83, 255, 0.6);
          color: #fff;
          box-shadow: 0 0 0 1px rgba(117, 83, 255, 0.3) inset, 0 4px 18px -6px rgba(102, 68, 242, 0.5);
        }
        .cd-flag {
          width: 22px; height: 16px;
          border-radius: 2px;
          display: inline-block;
          flex-shrink: 0;
          background-size: cover; background-position: center;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15);
        }
        .cd-flag-br {
          background: linear-gradient(180deg, #009c3b 50%, #ffdf00 50%);
          position: relative;
        }
        .cd-flag-br::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 50%, #002776 22%, transparent 23%);
        }
        .cd-flag-un {
          background: #5b92e5;
          position: relative;
        }
        .cd-flag-un::after {
          content: "";
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 50% 50%, transparent 28%, rgba(255,255,255,0.85) 29%, rgba(255,255,255,0.85) 32%, transparent 33%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.85) 12%, transparent 13%);
        }

        .cd-check {
          width: 64px; height: 64px;
          border-radius: 999px;
          background: linear-gradient(135deg, #6644f2, #5129f0);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          box-shadow: 0 8px 28px -8px rgba(102, 68, 242, 0.6);
          animation: cdPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes cdFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cdPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (min-width: 768px) {
          .cd-button { padding: 16px 38px; }
          .cd-button-text { font-size: 16px; }
          .cd-modal { padding: 30px 28px 32px; }
        }
      `}</style>
    </div>
  );
}

/* ─────────── Floating Input (light style, copy of conta-dev.com) ─────────── */

function FloatingInput({
  id, label, type = "text", value, onChange, autoComplete, maxLength,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string; maxLength?: number;
}) {
  return (
    <div className="fi-wrap">
      <div className="fi-container">
        <div className="fi-entry">
          <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder=" "
            autoComplete={autoComplete}
            maxLength={maxLength}
            required
          />
          <label htmlFor={id}>{label}</label>
        </div>
      </div>

      <style jsx>{`
        .fi-wrap {
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .fi-container {
          position: relative;
          border-radius: 12px;
          padding: 18px 5px 6px;
          background-color: #f4f4f5;
          border: 1px solid #11181c;
          cursor: text;
        }
        .fi-entry {
          background-color: #f4f4f5;
          padding-bottom: 0.125rem;
          width: 100%;
          display: inline-flex;
          position: relative;
        }
        .fi-entry input {
          width: 100%;
          padding: 8px 12px;
          background-color: #f4f4f5;
          outline: none;
          color: #363636;
          font-size: 14px;
          border: none;
          font-family: inherit;
        }
        .fi-entry label {
          position: absolute;
          font-size: 14px;
          color: #71717a;
          padding: 0 25px;
          margin: 0 20px;
          transition: 0.3s ease;
          top: 40%;
          left: -25px;
          transform: translateY(-50%);
          pointer-events: none;
          background: transparent;
        }
        .fi-entry input:focus + label,
        .fi-entry input:not(:placeholder-shown) + label {
          transform: translateX(-10%) translateY(-100%) scale(0.75);
        }
        /* autofill fix */
        .fi-entry input:-webkit-autofill {
          -webkit-text-fill-color: #363636;
          -webkit-box-shadow: 0 0 0 1000px #f4f4f5 inset;
          caret-color: #363636;
        }
      `}</style>
    </div>
  );
}
