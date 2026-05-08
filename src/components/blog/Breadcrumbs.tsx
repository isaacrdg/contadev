import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb estilo terminal — `~/ › blog › categoria › slug`.
 * O último item nunca recebe href (é a página atual).
 */
export default function Breadcrumbs({ items }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 font-mono text-[11px] flex-wrap"
      style={{ color: "rgba(250,250,250,0.4)" }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>›</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-white/80 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span style={{ color: "rgba(250,250,250,0.65)" }} className="truncate max-w-[280px]">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
