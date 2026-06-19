import {
  getReceitaMetrics,
  getConversaoMetrics,
  getVelocidadeMetrics,
  getPerdaMetrics,
  getLeadsPorDia,
  getFilterOptions,
  type VendasFilters,
} from "@/lib/vendas-db";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

function defaultDates() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

const RECEITA_ZERO = {
  valorAdquirido: 0, mrr: 0, qtdAnuais: 0, valorAnuais: 0,
  qtdMensais: 0, valorMensais: 0, assinou: 0, pagou: 0,
};
const CONVERSAO_ZERO = {
  leadsEntrados: 0, fechamentos: 0, closeRate: 0, multiplosEntradas: 0,
  reentradas: 0, quicam: 0, inadimplentes: 0,
  funnelEntrados: 0, funnelTemConversa: 0, funnelTemContrato: 0, funnelTemBilling: 0,
};
const VELOCIDADE_ZERO = {
  frtP50: null, frtP90: null, secondRespP50: null, secondRespP90: null,
  timeBetweenP50: null, timeBetweenP90: null, msgsAteFecharP50: null, msgsAtePerdidoP50: null,
};
const PERDA_ZERO = { perdidosDeclarados: 0, perdidosGhosting: 0, taxaPerda: 0, reentradas: 0 };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const dates = defaultDates();

  const filters: VendasFilters = {
    start: params.start ?? dates.start,
    end: params.end ?? dates.end,
    source: params.source || null,
    landingVariant: params.lv || null,
    pricingVariant: params.pv || null,
  };

  const [receita, conversao, velocidade, leadsPorDia, filterOptions] = await Promise.all([
    getReceitaMetrics(filters).catch((e) => { console.error("[vendas] receita", e); return RECEITA_ZERO; }),
    getConversaoMetrics(filters).catch((e) => { console.error("[vendas] conversao", e); return CONVERSAO_ZERO; }),
    getVelocidadeMetrics(filters).catch((e) => { console.error("[vendas] velocidade", e); return VELOCIDADE_ZERO; }),
    getLeadsPorDia(filters).catch(() => []),
    getFilterOptions().catch(() => ({ sources: [], landingVariants: [], pricingVariants: [] })),
  ]);

  const perda = await getPerdaMetrics(filters, conversao.leadsEntrados)
    .catch((e) => { console.error("[vendas] perda", e); return PERDA_ZERO; });

  return (
    <DashboardClient
      filters={filters}
      receita={receita}
      conversao={conversao}
      velocidade={velocidade}
      perda={perda}
      leadsPorDia={leadsPorDia}
      filterOptions={filterOptions}
    />
  );
}
