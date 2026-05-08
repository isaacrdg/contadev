"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link as TiptapLink } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { getTeamMembers } from "@/lib/team";
import type { AuthorStep, BlogNote } from "@/lib/blog-store";
import type { PostStatus, PostCategory } from "@/lib/blog-schema";
import { BLOG_CATEGORIES, DEFAULT_CATEGORY } from "@/lib/blog-categories";
import { usePalette } from "@/app/redator/ThemeContext";
import { useRedatorUser } from "@/app/redator/useRedatorUser";
import BlogNotes from "./BlogNotes";

interface Props {
  mode: "create" | "edit";
  slug?: string;
  initial?: {
    title: string;
    description: string;
    publishedAt: string;
    status: PostStatus;
    scheduledFor?: string | null;
    content: string;
    category?: PostCategory;
    tags?: string[];
    ogImage?: string;
    author?: string;
    notes?: BlogNote[];
    writtenBy?: AuthorStep;
    reviewedBy?: AuthorStep;
    publishedBy?: AuthorStep;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const team = getTeamMembers();

const STATUS_OPTIONS: { value: PostStatus; label: string; hint: string }[] = [
  { value: "draft", label: "Rascunho", hint: "Só você vê — fica salvo pra continuar depois" },
  { value: "review", label: "Revisão", hint: "Manda pro admin aprovar e publicar" },
  { value: "scheduled", label: "Agendado", hint: "Publica sozinho na data/hora que você marcar" },
  { value: "published", label: "Publicado", hint: "Visível pra todo mundo no /blog" },
];

function statusColor(p: ReturnType<typeof usePalette>, s: PostStatus): { bg: string; border: string; text: string } {
  if (s === "published") return { bg: p.pubBg, border: p.pubBorder, text: p.pubText };
  if (s === "review") return { bg: p.reviewBg, border: p.reviewBorder, text: p.reviewText };
  if (s === "scheduled") return { bg: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.45)", text: "#93c5fd" };
  return { bg: p.draftBg, border: p.draftBorder, text: p.draftText };
}

function toLocalDatetimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BlogEditor({ mode, slug, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isRedator = pathname?.startsWith("/redator") ?? false;
  const isAdmin = !isRedator;
  const basePath = isRedator ? "/redator" : "/admin/blog";
  const p = usePalette();
  const redatorUser = useRedatorUser();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [currentSlug, setCurrentSlug] = useState(slug ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? "draft");
  const [scheduledFor, setScheduledFor] = useState<string>(toLocalDatetimeInput(initial?.scheduledFor));
  const [category, setCategory] = useState<PostCategory>(initial?.category ?? DEFAULT_CATEGORY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Author tracking
  // Regra: em modo "create", quem tá logado é auto-preenchido como "Escreveu"
  // Em modo "edit", o autor original é preservado (não muda)
  const autoWrittenBy =
    mode === "create" && redatorUser ? redatorUser.name : (initial?.writtenBy?.name ?? "");
  const [writtenById, setWrittenById] = useState(autoWrittenBy);
  const [reviewedById, setReviewedById] = useState(initial?.reviewedBy?.name ?? "");
  const [publishedById, setPublishedById] = useState(initial?.publishedBy?.name ?? "");
  // Lock: se já tem autor salvo (rascunho editado), não permite mudar
  const writtenByLocked = mode === "edit" && !!initial?.writtenBy?.name;

  // Prompt modal (substitui browser prompt)
  const [promptState, setPromptState] = useState<{
    open: boolean;
    title: string;
    placeholder: string;
    value: string;
    onConfirm: (val: string) => void;
  }>({ open: false, title: "", placeholder: "", value: "", onConfirm: () => {} });

  function showPrompt(title: string, placeholder: string): Promise<string | null> {
    return new Promise((resolve) => {
      setPromptState({
        open: true,
        title,
        placeholder,
        value: "",
        onConfirm: (val) => {
          setPromptState((s) => ({ ...s, open: false }));
          resolve(val || null);
        },
      });
    });
  }

  // Stats em tempo real
  const [stats, setStats] = useState({ words: 0, chars: 0, paragraphs: 0 });

  // Auto-fill "Escreveu" quando user carrega (cookie pode demorar)
  useEffect(() => {
    if (mode === "create" && redatorUser && !writtenById) {
      setWrittenById(redatorUser.name);
    }
  }, [redatorUser, mode, writtenById]);

  // Auto-generate slug from title (se não foi editado manualmente)
  useEffect(() => {
    if (mode === "create" && !slugEdited) {
      setCurrentSlug(slugify(title));
    }
  }, [title, mode, slugEdited]);

  const updateStats = useCallback((text: string) => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    setStats({ words, chars, paragraphs });
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TiptapLink.configure({
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
    onUpdate: ({ editor: ed }) => {
      updateStats(ed.getText());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[400px] px-5 py-4 outline-none " +
          "[&_h1]:text-[24px] [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 " +
          "[&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 " +
          "[&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 " +
          "[&_p]:text-[14px] [&_p]:leading-relaxed [&_p]:mb-3 " +
          "[&_ul]:text-[14px] [&_ol]:text-[14px] [&_li]:mb-1 " +
          "[&_a]:text-[#c4b1ff] [&_a]:underline [&_a]:underline-offset-2 " +
          "[&_code]:text-[13px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-white/[0.08] " +
          "[&_pre]:bg-white/[0.04] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:text-[13px] " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:italic " +
          "[&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:p-2 [&_th]:bg-white/[0.04] " +
          "[&_td]:border [&_td]:border-white/10 [&_td]:p-2 " +
          "[&_img]:rounded-lg [&_img]:max-w-full [&_hr]:border-white/10",
      },
    },
  });

  // Init stats
  useEffect(() => {
    if (editor) updateStats(editor.getText());
  }, [editor, updateStats]);

  async function handleSave() {
    if (!title.trim() || saving || !editor) return;
    setErrors([]);
    setSaving(true);
    const now = new Date().toISOString();
    try {
      // Validações cliente: agendado precisa de data futura
      if (status === "scheduled") {
        if (!scheduledFor) {
          setErrors(["Status agendado precisa de data e hora pra publicar."]);
          setSaving(false);
          return;
        }
        if (new Date(scheduledFor).getTime() <= Date.now()) {
          setErrors(["A data de agendamento precisa estar no futuro."]);
          setSaving(false);
          return;
        }
      }

      const body = {
        title,
        description,
        publishedAt,
        status,
        scheduledFor:
          status === "scheduled" && scheduledFor
            ? new Date(scheduledFor).toISOString()
            : null,
        category,
        content: editor.getHTML(),
        // tags/author/ogImage usam defaults do schema quando não enviados
        tags: initial?.tags && initial.tags.length > 0 ? initial.tags : ["geral"],
        author: initial?.author,
        ogImage: initial?.ogImage,
        writtenBy: writtenById
          ? { name: writtenById, at: initial?.writtenBy?.at ?? now }
          : undefined,
        reviewedBy: reviewedById
          ? { name: reviewedById, at: initial?.reviewedBy?.at ?? now }
          : undefined,
        publishedBy: publishedById
          ? { name: publishedById, at: initial?.publishedBy?.at ?? now }
          : undefined,
      };
      const url = mode === "create" ? "/api/blog" : `/api/blog/${slug}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.details && Array.isArray(json.details)) {
          setErrors(json.details);
        } else if (json.error) {
          setErrors([json.error]);
        } else {
          setErrors(["Erro ao salvar. Tente novamente."]);
        }
        return;
      }
      router.push(basePath);
      router.refresh();
    } catch {
      setErrors(["Erro de rede. Tente novamente."]);
    } finally {
      setSaving(false);
    }
  }

  async function addLink() {
    const url = await showPrompt("Inserir link", "https://");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  }

  async function addImage() {
    const url = await showPrompt("URL da imagem", "https://exemplo.com/imagem.jpg");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  }

  function addTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  if (!editor) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">
            {mode === "create" ? "Novo post" : "Editar post"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(basePath)}
            className="text-[12px] font-medium px-4 py-2 rounded-md text-white/70 hover:bg-white/10 transition-colors"
            style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="text-[12px] font-medium px-4 py-2 rounded-md transition-colors hover:bg-white/15 disabled:opacity-40"
            style={{ background: p.card, border: `1px solid ${p.cardBorder}`, color: p.text }}
          >
            {saving
              ? "Salvando..."
              : status === "review"
                ? "Enviar pra revisão"
                : status === "scheduled"
                  ? mode === "create" ? "Agendar publicação" : "Salvar e agendar"
                  : status === "published"
                    ? mode === "create" ? "Publicar" : "Salvar e publicar"
                    : mode === "create" ? "Criar rascunho" : "Salvar"}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="mb-5 rounded-lg p-3.5"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
          }}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.05em]" style={{ color: "#fca5a5" }}>
              Faltam ajustes
            </span>
          </div>
          <ul className="mt-2 space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-[12px]" style={{ color: "#fecaca" }}>
                · {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          {/* Título */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do post"
            className="w-full text-[20px] font-bold text-inherit placeholder-current/30 outline-none rounded-lg px-4 py-3"
            style={{ background: p.input, border: `1px solid ${p.inputBorder}`, color: p.inputText }}
          />

          {/* Slug */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-white/40 flex-shrink-0">
              Slug
            </label>
            <input
              type="text"
              value={currentSlug}
              onChange={(e) => {
                setCurrentSlug(slugify(e.target.value));
                setSlugEdited(true);
              }}
              placeholder="url-do-post"
              className="flex-1 text-[12px] font-mono text-inherit placeholder-current/25 outline-none rounded-md px-3 py-2"
              style={{ background: p.input, border: `1px solid ${p.inputBorder}`, color: p.inputText }}
            />
            <button
              onClick={() => {
                setCurrentSlug(slugify(title));
                setSlugEdited(false);
              }}
              className="text-[10px] font-medium px-2.5 py-1.5 rounded-md text-white/55 hover:text-white/85 transition-colors"
              style={{ background: p.card, border: `1px solid ${p.cardBorder}` }}
            >
              Regenerar
            </button>
          </div>

          {/* Descrição */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição curta (aparece na listagem e no SEO)"
            rows={2}
            className="w-full text-[13px] text-inherit placeholder-current/30 outline-none rounded-lg px-4 py-3 resize-none"
            style={{ background: p.input, border: `1px solid ${p.inputBorder}`, color: p.inputText }}
          />

          {/* Toolbar */}
          <div
            className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 rounded-t-lg"
            style={{ background: p.toolbarBg, border: `1px solid ${p.inputBorder}`, borderBottom: "none" }}
          >
            <select
              value={
                editor.isActive("heading", { level: 1 }) ? "h1"
                  : editor.isActive("heading", { level: 2 }) ? "h2"
                  : editor.isActive("heading", { level: 3 }) ? "h3" : "p"
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "p") editor.chain().focus().setParagraph().run();
                else editor.chain().focus().toggleHeading({ level: parseInt(v[1]) as 1 | 2 | 3 }).run();
              }}
              className="text-[11px] font-medium px-2 py-1.5 rounded bg-transparent outline-none cursor-pointer"
              style={{ border: `1px solid ${p.inputBorder}`, color: p.text }}
            >
              <option value="p" style={{ background: p.card }}>Parágrafo</option>
              <option value="h1" style={{ background: p.card }}>Título 1</option>
              <option value="h2" style={{ background: p.card }}>Título 2</option>
              <option value="h3" style={{ background: p.card }}>Título 3</option>
            </select>
            <Sep />
            <TBtn on={editor.isActive("bold")} click={() => editor.chain().focus().toggleBold().run()} t="Negrito"><strong>B</strong></TBtn>
            <TBtn on={editor.isActive("italic")} click={() => editor.chain().focus().toggleItalic().run()} t="Itálico"><em>I</em></TBtn>
            <TBtn on={editor.isActive("underline")} click={() => editor.chain().focus().toggleUnderline().run()} t="Sublinhado"><u>U</u></TBtn>
            <TBtn on={editor.isActive("strike")} click={() => editor.chain().focus().toggleStrike().run()} t="Riscado"><s>S</s></TBtn>
            <TBtn on={editor.isActive("code")} click={() => editor.chain().focus().toggleCode().run()} t="Código">{"<>"}</TBtn>
            <Sep />
            <TBtn on={editor.isActive("bulletList")} click={() => editor.chain().focus().toggleBulletList().run()} t="Lista">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </TBtn>
            <TBtn on={editor.isActive("orderedList")} click={() => editor.chain().focus().toggleOrderedList().run()} t="Numerada">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
            </TBtn>
            <Sep />
            <TBtn on={false} click={() => editor.chain().focus().setHorizontalRule().run()} t="Separador">—</TBtn>
            <TBtn on={editor.isActive("link")} click={addLink} t="Link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </TBtn>
            <TBtn on={editor.isActive("blockquote")} click={() => editor.chain().focus().toggleBlockquote().run()} t="Citação">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
            </TBtn>
            <TBtn on={editor.isActive("codeBlock")} click={() => editor.chain().focus().toggleCodeBlock().run()} t="Bloco código">{"{ }"}</TBtn>
            <TBtn on={false} click={addTable} t="Tabela">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
            </TBtn>
            <TBtn on={false} click={addImage} t="Imagem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </TBtn>
          </div>

          {/* Editor tiptap */}
          <div
            className="rounded-b-lg overflow-hidden"
            style={{ background: p.editorBg, border: `1px solid ${p.inputBorder}`, borderTop: "none" }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status + data */}
          <SidebarCard title="Publicação">
            <div>
              <label className="block text-[11px] mb-1.5" style={{ color: p.textMuted }}>Status</label>
              <div className="flex flex-col gap-1.5">
                {STATUS_OPTIONS.filter((s) => isAdmin || s.value !== "published").map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className="text-[11px] font-medium py-2 rounded-md transition-colors text-left px-3"
                    style={{
                      background: status === s.value ? statusColor(p, s.value).bg : p.input,
                      border: `1px solid ${status === s.value ? statusColor(p, s.value).border : p.inputBorder}`,
                      color: status === s.value ? statusColor(p, s.value).text : p.textMuted,
                    }}
                  >
                    {s.label}
                    <span className="block text-[9px] opacity-70 font-normal mt-0.5">{s.hint}</span>
                  </button>
                ))}
              </div>
              {!isAdmin && (
                <p className="text-[9px] mt-2 italic" style={{ color: p.textDimmed }}>
                  Só admin publica. Envie pra revisão e a gente cuida.
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] mb-1.5" style={{ color: p.textMuted }}>Data</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full text-[12px] text-inherit outline-none rounded-md px-3 py-2"
                style={{ background: p.input, border: `1px solid ${p.inputBorder}`, color: p.inputText, colorScheme: "auto" }}
              />
            </div>
            {status === "scheduled" && (
              <div>
                <label className="block text-[11px] mb-1.5" style={{ color: p.textMuted }}>
                  Publicar em
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full text-[12px] text-inherit outline-none rounded-md px-3 py-2"
                  style={{
                    background: p.input,
                    border: `1px solid ${p.inputBorder}`,
                    color: p.inputText,
                    colorScheme: "dark",
                  }}
                />
                <p className="text-[9px] mt-1.5 italic" style={{ color: p.textDimmed }}>
                  Cron roda a cada hora. O post vira público na próxima execução depois desse horário.
                </p>
              </div>
            )}
          </SidebarCard>

          {/* Categoria — controlada pra organizar por taxonomia */}
          <SidebarCard title="Categoria">
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full text-[12px] outline-none rounded-md px-3 py-2 cursor-pointer"
                style={{
                  background: p.input,
                  border: `1px solid ${p.inputBorder}`,
                  color: p.inputText,
                }}
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug} style={{ background: p.card }}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] mt-2 leading-snug" style={{ color: p.textDimmed }}>
                {BLOG_CATEGORIES.find((c) => c.slug === category)?.description}
              </p>
            </div>
          </SidebarCard>

          {/* Autoria — selects com membros da equipe */}
          <SidebarCard title="Autoria">
            <AuthorSelect
              label="Escreveu"
              value={writtenById}
              onChange={setWrittenById}
              timestamp={initial?.writtenBy?.at}
              disabled={writtenByLocked}
            />
            <AuthorSelect
              label="Revisou"
              value={reviewedById}
              onChange={setReviewedById}
              timestamp={initial?.reviewedBy?.at}
            />
            <AuthorSelect
              label="Publicou"
              value={publishedById}
              onChange={setPublishedById}
              timestamp={initial?.publishedBy?.at}
            />
          </SidebarCard>

          {/* Estatísticas — tempo real */}
          <SidebarCard title="Estatísticas">
            <div className="space-y-1.5 text-[11px]" style={{ color: p.textMuted }}>
              <StatRow label="Palavras" value={stats.words} />
              <StatRow label="Caracteres" value={stats.chars} />
              <StatRow label="Parágrafos" value={stats.paragraphs} />
              <StatRow
                label="Tempo de leitura"
                value={`${Math.max(1, Math.ceil(stats.words / 200))} min`}
              />
            </div>
          </SidebarCard>

          {/* Notas internas — só aparece em modo edit (precisa de slug salvo) */}
          {mode === "edit" && slug && (
            <SidebarCard title="Notas internas">
              <BlogNotes
                slug={slug}
                initialNotes={initial?.notes ?? []}
                currentAuthor={writtenById || reviewedById || publishedById || redatorUser?.name || "Admin"}
              />
            </SidebarCard>
          )}
        </div>
      </div>

      {/* Prompt modal estilizado (substitui browser prompt) */}
      {promptState.open && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => {
            setPromptState((s) => ({ ...s, open: false }));
          }}
        >
          <div
            className="w-full max-w-[400px] rounded-xl p-5"
            style={{ background: p.card, border: `1px solid ${p.cardBorder}`, boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[14px] font-semibold mb-4" style={{ color: p.text }}>
              {promptState.title}
            </h3>
            <input
              type="text"
              autoFocus
              value={promptState.value}
              onChange={(e) => setPromptState((s) => ({ ...s, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") promptState.onConfirm(promptState.value);
                if (e.key === "Escape") setPromptState((s) => ({ ...s, open: false }));
              }}
              placeholder={promptState.placeholder}
              className="w-full text-[13px] outline-none rounded-lg px-4 py-3 mb-4"
              style={{ background: p.input, border: `1px solid ${p.inputBorder}`, color: p.inputText }}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPromptState((s) => ({ ...s, open: false }))}
                className="text-[12px] font-medium px-4 py-2 rounded-md"
                style={{ color: p.textMuted }}
              >
                Cancelar
              </button>
              <button
                onClick={() => promptState.onConfirm(promptState.value)}
                className="text-[12px] font-medium px-4 py-2 rounded-md"
                style={{ background: p.input, border: `1px solid ${p.cardBorder}`, color: p.text }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TBtn({ on, click, t, children }: { on: boolean; click: () => void; t: string; children: React.ReactNode }) {
  const pal = usePalette();
  return (
    <button
      onClick={click}
      title={t}
      className="w-8 h-8 rounded flex items-center justify-center text-[12px] font-medium transition-colors"
      style={{ background: on ? (pal.bg === "#f5f5f5" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.12)") : "transparent", color: on ? pal.text : pal.textMuted }}
    >
      {children}
    </button>
  );
}

function Sep() {
  const pal = usePalette();
  return <div className="w-px h-5 mx-1" style={{ background: pal.border }} />;
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  const pal = usePalette();
  return (
    <div className="rounded-lg p-4 space-y-3" style={{ background: pal.card, border: `1px solid ${pal.cardBorder}` }}>
      <h3 className="text-[10px] uppercase tracking-[0.08em] font-semibold" style={{ color: pal.textDimmed }}>{title}</h3>
      {children}
    </div>
  );
}

function AuthorSelect({
  label,
  value,
  onChange,
  timestamp,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  timestamp?: string;
  disabled?: boolean;
}) {
  const pal = usePalette();
  return (
    <div>
      <label className="block text-[11px] mb-1" style={{ color: pal.textMuted }}>
        {label}
        {disabled && <span className="ml-1 text-[9px] opacity-50">(fixo)</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full text-[12px] outline-none rounded-md px-3 py-2"
        style={{
          background: pal.input,
          border: `1px solid ${pal.inputBorder}`,
          color: pal.inputText,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <option value="" style={{ background: pal.card }}>—</option>
        {team.map((m) => (
          <option key={m.id} value={m.name} style={{ background: pal.card }}>
            {m.name}
          </option>
        ))}
      </select>
      {timestamp && (
        <p className="text-[9px] mt-1 font-mono" style={{ color: pal.textDimmed }}>
          {new Date(timestamp).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  const pal = usePalette();
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="tabular-nums font-mono" style={{ color: pal.text }}>{value}</span>
    </div>
  );
}
