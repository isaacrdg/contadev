/**
 * Categorias do blog Conta Dev — lista controlada (não livre como tags).
 *
 * Toda mudança aqui exige migração: posts antigos referenciando uma categoria
 * removida ficariam órfãos. Manter slugs estáveis.
 */

export interface BlogCategory {
  slug: string;
  label: string;
  description: string;
  /** cor de destaque (hex) usada em badges/chips e linhas decorativas */
  color: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: "cnpj",
    label: "CNPJ",
    description: "Abertura, encerramento e gestão de CNPJ pra dev.",
    color: "#7553ff",
  },
  {
    slug: "impostos",
    label: "Impostos",
    description: "DAS, Fator R, declarações, planejamento tributário.",
    color: "#22c55e",
  },
  {
    slug: "carreira-pj",
    label: "Carreira PJ",
    description: "Sair do CLT, freelance, primeiro contrato, exterior.",
    color: "#3b82f6",
  },
  {
    slug: "plataforma",
    label: "Plataforma",
    description: "Funcionalidades, novidades e tutoriais da Conta Dev.",
    color: "#a855f7",
  },
  {
    slug: "cases",
    label: "Cases",
    description: "Histórias reais de devs que passaram a economizar com a gente.",
    color: "#f59e0b",
  },
  {
    slug: "guias",
    label: "Guias",
    description: "Conteúdo educacional aprofundado, passo a passo.",
    color: "#06b6d4",
  },
];

export type CategorySlug = (typeof BLOG_CATEGORIES)[number]["slug"];

/** Slugs em array (pra Zod enum) — derivado da lista acima. */
export const CATEGORY_SLUGS = BLOG_CATEGORIES.map((c) => c.slug) as [string, ...string[]];

/** Categoria default usada no backfill de posts antigos sem categoria. */
export const DEFAULT_CATEGORY: CategorySlug = "guias";

export function getCategory(slug: string | undefined | null): BlogCategory | null {
  if (!slug) return null;
  return BLOG_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function getCategoryLabel(slug: string | undefined | null): string {
  return getCategory(slug)?.label ?? "Geral";
}

export function getCategoryColor(slug: string | undefined | null): string {
  return getCategory(slug)?.color ?? "#7553ff";
}
