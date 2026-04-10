import Link from "next/link";

const sections = [
  {
    title: "Vendas",
    description: "Kanban de leads, tickets de suporte, dashboard de conversão",
    href: "/admin/leads",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Redator",
    description: "Criar, editar e publicar artigos do blog da Conta Dev",
    href: "/admin/blog",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight">Painel Admin</h1>
        <p className="text-[12px] text-white/45 mt-1.5">
          Escolha uma seção pra começar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        {sections.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="rounded-lg p-6 transition-colors hover:bg-white/[0.04] group"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="mb-4 text-white/55 group-hover:text-white/85 transition-colors">
              {s.icon}
            </div>
            <h2 className="text-[16px] font-semibold mb-1.5">{s.title}</h2>
            <p className="text-[12px] text-white/50 leading-relaxed">
              {s.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
