"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Props {
  mode: "create" | "edit";
  slug?: string;
  initial?: {
    title: string;
    description: string;
    publishedAt: string;
    status: "draft" | "published";
    content: string;
  };
}

export default function BlogEditor({ mode, slug, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/redator") ? "/redator" : "/admin/blog";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status ?? "draft"
  );
  const [content, setContent] = useState(initial?.content ?? "");
  const [previewHtml, setPreviewHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Debounced markdown → HTML preview
  useEffect(() => {
    if (!showPreview) return;
    const timer = setTimeout(async () => {
      try {
        const { remark } = await import("remark");
        const html = (await import("remark-html")).default;
        const result = await remark().use(html).process(content);
        setPreviewHtml(result.toString());
      } catch {
        setPreviewHtml("<p>Erro ao renderizar preview</p>");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [content, showPreview]);

  function insertMarkdown(before: string, after = "") {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const newContent =
      content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  }

  async function handleSave() {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const body = { title, description, publishedAt, status, content };
      const url =
        mode === "create" ? "/api/blog" : `/api/blog/${slug}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("falhou");
      router.push(basePath);
      router.refresh();
    } catch {
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const toolbarBtns: { label: string; action: () => void; title: string }[] = [
    { label: "B", action: () => insertMarkdown("**", "**"), title: "Negrito" },
    { label: "I", action: () => insertMarkdown("_", "_"), title: "Itálico" },
    { label: "H2", action: () => insertMarkdown("\n## "), title: "Subtítulo" },
    { label: "H3", action: () => insertMarkdown("\n### "), title: "Subtítulo menor" },
    {
      label: "Link",
      action: () => insertMarkdown("[", "](https://conta-dev.com)"),
      title: "Link",
    },
    { label: "Lista", action: () => insertMarkdown("\n- "), title: "Lista" },
    { label: "1.", action: () => insertMarkdown("\n1. "), title: "Lista numerada" },
    { label: ">", action: () => insertMarkdown("\n> "), title: "Citação" },
    { label: "Código", action: () => insertMarkdown("`", "`"), title: "Código inline" },
    { label: "---", action: () => insertMarkdown("\n---\n"), title: "Separador" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">
            {mode === "create" ? "Novo post" : "Editar post"}
          </h1>
          {slug && (
            <p className="text-[11px] text-white/40 mt-1 font-mono">
              /{slug}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(basePath)}
            className="text-[12px] font-medium px-4 py-2 rounded-md text-white/70 hover:bg-white/10 transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fafafa",
            }}
          >
            {saving
              ? "Salvando..."
              : mode === "create"
                ? "Criar post"
                : "Salvar alterações"}
          </button>
        </div>
      </div>

      {/* Campos do post */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          {/* Título */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do post"
            className="w-full text-[20px] font-bold text-[#fafafa] placeholder-white/30 outline-none rounded-lg px-4 py-3"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />

          {/* Descrição */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição curta (aparece na listagem e no SEO)"
            rows={2}
            className="w-full text-[13px] text-[#fafafa] placeholder-white/30 outline-none rounded-lg px-4 py-3 resize-none"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />

          {/* Toolbar de formatação */}
          <div
            className="flex flex-wrap items-center gap-1 px-2 py-1.5 rounded-t-lg border-b-0"
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
            }}
          >
            {toolbarBtns.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                title={btn.title}
                className="text-[11px] font-mono font-medium px-2.5 py-1.5 rounded transition-colors text-white/65 hover:text-white hover:bg-white/10"
              >
                {btn.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="text-[10.5px] font-medium px-3 py-1.5 rounded transition-colors"
              style={{
                background: showPreview
                  ? "rgba(255,255,255,0.10)"
                  : "transparent",
                color: showPreview
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.55)",
              }}
            >
              {showPreview ? "Esconder preview" : "Preview"}
            </button>
          </div>

          {/* Editor + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva o conteúdo em Markdown..."
              className="w-full min-h-[400px] text-[13px] text-[#fafafa] placeholder-white/30 outline-none px-4 py-4 resize-y font-mono leading-relaxed"
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: "none",
                borderRadius: showPreview ? "0 0 0 8px" : "0 0 8px 8px",
              }}
            />
            {showPreview && (
              <div
                className="min-h-[400px] px-5 py-4 overflow-y-auto prose prose-invert prose-sm max-w-none [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-[13px] [&_p]:text-white/75 [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:text-[13px] [&_ul]:text-white/75 [&_ol]:text-[13px] [&_ol]:text-white/75 [&_a]:text-[#c4b1ff] [&_a]:underline [&_code]:text-[12px] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-white/[0.06] [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-white/55 [&_blockquote]:italic"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRadius: "0 0 8px 0",
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>
          <p className="text-[10px] text-white/35 italic">
            Markdown suportado: **negrito**, _itálico_, ## títulos, [links](url),
            listas, citações, código
          </p>
        </div>

        {/* Sidebar — metadados */}
        <div className="space-y-4">
          <div
            className="rounded-lg p-4 space-y-4"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-[10px] uppercase tracking-[0.08em] font-semibold text-white/40">
              Publicação
            </h3>

            <div>
              <label className="block text-[11px] text-white/55 mb-1.5">
                Status
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus("draft")}
                  className="flex-1 text-[11px] font-medium py-2 rounded-md transition-colors"
                  style={{
                    background:
                      status === "draft"
                        ? "rgba(234,179,8,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      status === "draft"
                        ? "1px solid rgba(234,179,8,0.45)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color:
                      status === "draft" ? "#fbbf24" : "rgba(255,255,255,0.6)",
                  }}
                >
                  Rascunho
                </button>
                <button
                  onClick={() => setStatus("published")}
                  className="flex-1 text-[11px] font-medium py-2 rounded-md transition-colors"
                  style={{
                    background:
                      status === "published"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      status === "published"
                        ? "1px solid rgba(34,197,94,0.45)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color:
                      status === "published"
                        ? "#6ee7b7"
                        : "rgba(255,255,255,0.6)",
                  }}
                >
                  Publicado
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-white/55 mb-1.5">
                Data de publicação
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full text-[12px] text-[#fafafa] outline-none rounded-md px-3 py-2"
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  colorScheme: "dark",
                }}
              />
            </div>
          </div>

          <div
            className="rounded-lg p-4"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-[10px] uppercase tracking-[0.08em] font-semibold text-white/40 mb-3">
              Estatísticas
            </h3>
            <div className="space-y-1.5 text-[11px] text-white/55">
              <div className="flex justify-between">
                <span>Palavras</span>
                <span className="tabular-nums font-mono text-white/75">
                  {content.trim() ? content.trim().split(/\s+/).length : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Caracteres</span>
                <span className="tabular-nums font-mono text-white/75">
                  {content.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tempo de leitura</span>
                <span className="tabular-nums font-mono text-white/75">
                  {Math.max(
                    1,
                    Math.ceil(
                      (content.trim() ? content.trim().split(/\s+/).length : 0) /
                        200
                    )
                  )}{" "}
                  min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
