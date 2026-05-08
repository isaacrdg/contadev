"use client";
import { useState } from "react";
import type { BlogNote } from "@/lib/blog-store";
import { usePalette } from "@/app/redator/ThemeContext";

interface Props {
  slug: string;
  initialNotes: BlogNote[];
  currentAuthor: string;
}

/**
 * Sistema simples de notas internas no post — admin e redator
 * conversam ali sem afetar o conteúdo público. Não vai pro JSON-LD nem RSS.
 */
export default function BlogNotes({ slug, initialNotes, currentAuthor }: Props) {
  const [notes, setNotes] = useState<BlogNote[]>(initialNotes);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const p = usePalette();

  async function handlePost() {
    if (!text.trim() || posting || !currentAuthor) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/blog/${slug}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: currentAuthor, text }),
      });
      if (!res.ok) throw new Error("falhou");
      const note = (await res.json()) as BlogNote;
      setNotes((prev) => [...prev, note]);
      setText("");
    } catch {
      // silencioso — ux simples por enquanto
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir essa nota?")) return;
    try {
      const res = await fetch(`/api/blog/${slug}/notes?id=${id}`, { method: "DELETE" });
      if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      {notes.length === 0 ? (
        <p className="text-[11px] italic" style={{ color: p.textDimmed }}>
          Nenhuma nota ainda.
        </p>
      ) : (
        <div className="space-y-2.5 mb-3 max-h-60 overflow-y-auto">
          {notes.map((n) => (
            <div
              key={n.id}
              className="rounded-md p-2.5 group relative"
              style={{ background: p.input, border: `1px solid ${p.inputBorder}` }}
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-[10px] font-semibold" style={{ color: p.text }}>
                  {n.author}
                </span>
                <span className="text-[9px] font-mono" style={{ color: p.textDimmed }}>
                  {new Date(n.at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-[11.5px] leading-snug whitespace-pre-wrap" style={{ color: p.textMuted }}>
                {n.text}
              </p>
              <button
                onClick={() => handleDelete(n.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-[9px] px-1.5 py-0.5 rounded transition-opacity"
                style={{ color: "#ef4444" }}
                aria-label="Excluir nota"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handlePost();
          }
        }}
        placeholder="Adicionar nota interna…"
        rows={2}
        className="w-full text-[11.5px] outline-none rounded-md px-2.5 py-2 resize-none"
        style={{ background: p.input, border: `1px solid ${p.inputBorder}`, color: p.inputText }}
      />
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-[9px] font-mono" style={{ color: p.textDimmed }}>
          {currentAuthor ? `como ${currentAuthor}` : "faça login pra postar"}
        </span>
        <button
          onClick={handlePost}
          disabled={!text.trim() || posting || !currentAuthor}
          className="text-[10px] font-medium px-2.5 py-1 rounded transition-colors disabled:opacity-40"
          style={{ background: p.input, border: `1px solid ${p.cardBorder}`, color: p.text }}
        >
          {posting ? "…" : "Postar"}
        </button>
      </div>
    </div>
  );
}
