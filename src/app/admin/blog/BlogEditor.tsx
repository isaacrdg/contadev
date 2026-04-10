"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import type { AuthorStep } from "@/lib/blog-store";

interface Props {
  mode: "create" | "edit";
  slug?: string;
  initial?: {
    title: string;
    description: string;
    publishedAt: string;
    status: "draft" | "published";
    content: string;
    writtenBy?: AuthorStep;
    reviewedBy?: AuthorStep;
    publishedBy?: AuthorStep;
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
  const [saving, setSaving] = useState(false);

  // Author tracking
  const [writtenBy, setWrittenBy] = useState(initial?.writtenBy?.name ?? "");
  const [reviewedBy, setReviewedBy] = useState(initial?.reviewedBy?.name ?? "");
  const [publishedBy, setPublishedBy] = useState(initial?.publishedBy?.name ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#c4b1ff] underline underline-offset-2" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: 'Comece a escrever ou use "/" pra comandos...',
      }),
    ],
    content: initial?.content ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[400px] px-5 py-4 outline-none " +
          "[&_h1]:text-[24px] [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 " +
          "[&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 " +
          "[&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 " +
          "[&_p]:text-[14px] [&_p]:text-white/75 [&_p]:leading-relaxed [&_p]:mb-3 " +
          "[&_ul]:text-[14px] [&_ul]:text-white/75 [&_ol]:text-[14px] [&_ol]:text-white/75 " +
          "[&_li]:mb-1 " +
          "[&_a]:text-[#c4b1ff] [&_a]:underline [&_a]:underline-offset-2 " +
          "[&_code]:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-white/[0.08] " +
          "[&_pre]:bg-white/[0.04] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-[13px] " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:text-white/55 [&_blockquote]:italic " +
          "[&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:p-2 [&_th]:bg-white/[0.04] " +
          "[&_td]:border [&_td]:border-white/10 [&_td]:p-2 " +
          "[&_img]:rounded-lg [&_img]:max-w-full [&_hr]:border-white/10",
      },
    },
  });

  async function handleSave() {
    if (!title.trim() || saving || !editor) return;
    setSaving(true);
    const now = new Date().toISOString();
    try {
      const body = {
        title,
        description,
        publishedAt,
        status,
        content: editor.getHTML(),
        writtenBy: writtenBy.trim()
          ? { name: writtenBy.trim(), at: initial?.writtenBy?.at ?? now }
          : undefined,
        reviewedBy: reviewedBy.trim()
          ? { name: reviewedBy.trim(), at: initial?.reviewedBy?.at ?? now }
          : undefined,
        publishedBy: publishedBy.trim()
          ? { name: publishedBy.trim(), at: initial?.publishedBy?.at ?? now }
          : undefined,
      };
      const url = mode === "create" ? "/api/blog" : `/api/blog/${slug}`;
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

  function addLink() {
    const url = prompt("URL do link:", "https://");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  function addImage() {
    const url = prompt("URL da imagem:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function addTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  if (!editor) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">
            {mode === "create" ? "Novo post" : "Editar post"}
          </h1>
          {slug && (
            <p className="text-[11px] text-white/40 mt-1 font-mono">/{slug}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
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

          {/* Toolbar — replica Keystatic */}
          <div
            className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 rounded-t-lg"
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
            }}
          >
            {/* Paragraph/Heading dropdown */}
            <select
              value={
                editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                    ? "h2"
                    : editor.isActive("heading", { level: 3 })
                      ? "h3"
                      : "p"
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "p") editor.chain().focus().setParagraph().run();
                else if (v === "h1")
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                else if (v === "h2")
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (v === "h3")
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className="text-[11px] font-medium px-2 py-1.5 rounded bg-transparent text-white/80 outline-none cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <option value="p" className="bg-[#1c1c1c]">Parágrafo</option>
              <option value="h1" className="bg-[#1c1c1c]">Título 1</option>
              <option value="h2" className="bg-[#1c1c1c]">Título 2</option>
              <option value="h3" className="bg-[#1c1c1c]">Título 3</option>
            </select>

            <Sep />

            <TBtn
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Negrito"
            >
              <strong>B</strong>
            </TBtn>
            <TBtn
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Itálico"
            >
              <em>I</em>
            </TBtn>
            <TBtn
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Sublinhado"
            >
              <u>U</u>
            </TBtn>
            <TBtn
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Riscado"
            >
              <s>S</s>
            </TBtn>
            <TBtn
              active={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
              title="Código inline"
            >
              {"<>"}
            </TBtn>

            <Sep />

            <TBtn
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Lista"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </TBtn>
            <TBtn
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Lista numerada"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
            </TBtn>

            <Sep />

            <TBtn
              active={false}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Separador"
            >
              —
            </TBtn>
            <TBtn active={editor.isActive("link")} onClick={addLink} title="Link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </TBtn>
            <TBtn
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Citação"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
            </TBtn>
            <TBtn
              active={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Bloco de código"
            >
              {"{ }"}
            </TBtn>
            <TBtn active={false} onClick={addTable} title="Tabela">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            </TBtn>
            <TBtn active={false} onClick={addImage} title="Imagem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </TBtn>
          </div>

          {/* Editor tiptap */}
          <div
            className="rounded-b-lg overflow-hidden"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status + data */}
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
              <label className="block text-[11px] text-white/55 mb-1.5">Status</label>
              <div className="flex gap-2">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="flex-1 text-[11px] font-medium py-2 rounded-md transition-colors"
                    style={{
                      background:
                        status === s
                          ? s === "published"
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(234,179,8,0.15)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        status === s
                          ? s === "published"
                            ? "1px solid rgba(34,197,94,0.45)"
                            : "1px solid rgba(234,179,8,0.45)"
                          : "1px solid rgba(255,255,255,0.08)",
                      color:
                        status === s
                          ? s === "published"
                            ? "#6ee7b7"
                            : "#fbbf24"
                          : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {s === "draft" ? "Rascunho" : "Publicado"}
                  </button>
                ))}
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

          {/* Autoria */}
          <div
            className="rounded-lg p-4 space-y-3"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="text-[10px] uppercase tracking-[0.08em] font-semibold text-white/40">
              Autoria
            </h3>
            <AuthorField
              label="Escreveu"
              value={writtenBy}
              onChange={setWrittenBy}
              timestamp={initial?.writtenBy?.at}
            />
            <AuthorField
              label="Revisou"
              value={reviewedBy}
              onChange={setReviewedBy}
              timestamp={initial?.reviewedBy?.at}
            />
            <AuthorField
              label="Publicou"
              value={publishedBy}
              onChange={setPublishedBy}
              timestamp={initial?.publishedBy?.at}
            />
          </div>

          {/* Stats */}
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
                  {editor?.storage.characterCount?.words?.() ??
                    (editor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tempo de leitura</span>
                <span className="tabular-nums font-mono text-white/75">
                  {Math.max(
                    1,
                    Math.ceil(
                      (editor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0) / 200
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

function TBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded flex items-center justify-center text-[12px] font-medium transition-colors"
      style={{
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        color: active ? "#fafafa" : "rgba(255,255,255,0.55)",
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return (
    <div
      className="w-px h-5 mx-1"
      style={{ background: "rgba(255,255,255,0.1)" }}
    />
  );
}

function AuthorField({
  label,
  value,
  onChange,
  timestamp,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  timestamp?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] text-white/55 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nome da pessoa"
        className="w-full text-[12px] text-[#fafafa] placeholder-white/25 outline-none rounded-md px-3 py-2"
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
      {timestamp && (
        <p className="text-[9px] text-white/35 mt-1 font-mono">
          {new Date(timestamp).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}
