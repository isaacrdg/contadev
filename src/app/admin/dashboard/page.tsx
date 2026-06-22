import {
  getReceitaMetrics,
  getConversaoMetrics,
  getVelocidadeMetrics,
  getPerdaMetrics,
  getLeadsPorDia,
  getFilterOptions,
  type VendasFilters,
  type ReceitaData,
  type ConversaoData,
  type VelocidadeData,
  type PerdaData,
  type LeadDia,
  type FilterOptions,
} from "@/lib/vendas-db";
import DashboardClient from "./DashboardClient";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import snapshotData from "@/lib/vendas-snapshot.json";

// Snapshot gravado por `npm run snapshot` (leitura única do banco). É o que o
// dashboard mostra por padrão — abrir a página NÃO consulta o Neon.
const snapshot = snapshotData as unknown as {
  generatedAt: string;
  filters: VendasFilters;
  receita: ReceitaData;
  conversao: ConversaoData;
  velocidade: VelocidadeData;
  perda: PerdaData;
  leadsPorDia: LeadDia[];
  filterOptions: FilterOptions;
  prev: { receita: ReceitaData; conversao: ConversaoData; velocidade: VelocidadeData; perda: PerdaData };
};

// ─────────────────────────────────────────────────────────────────────────────
// CACHE MANUAL — o Neon cobra compute por query, e estas são pesadas.
// Cada resultado é cacheado pela combinação (filtros + token de refresh `rev`).
// Abrir/atualizar a página com o mesmo `rev` serve do cache → NÃO bate no banco.
// O botão "Atualizar" gira o `rev` (cookie, via refreshVendas) → chave nova →
// uma única releitura do banco. É a ÚNICA porta que consulta o Neon.
// O parâmetro `rev` é só chave de cache; as funções não o utilizam.
// ─────────────────────────────────────────────────────────────────────────────
const cachedReceita = unstable_cache(
  (f: VendasFilters, _rev: string) => getReceitaMetrics(f), ["vendas-receita"]);
const cachedConversao = unstable_cache(
  (f: VendasFilters, _rev: string) => getConversaoMetrics(f), ["vendas-conversao"]);
const cachedVelocidade = unstable_cache(
  (f: VendasFilters, _rev: string) => getVelocidadeMetrics(f), ["vendas-velocidade"]);
const cachedPerda = unstable_cache(
  (f: VendasFilters, leadsEntrados: number, _rev: string) => getPerdaMetrics(f, leadsEntrados), ["vendas-perda"]);
const cachedLeadsPorDia = unstable_cache(
  (f: VendasFilters, _rev: string) => getLeadsPorDia(f), ["vendas-leadsdia"]);
const cachedFilterOptions = unstable_cache(
  (_rev: string) => getFilterOptions(), ["vendas-filteropts"]);
// Carimbo de quando o cache foi populado (= última leitura real do banco) por `rev`.
const cachedStamp = unstable_cache(
  async (_rev: string) => new Date().toISOString(), ["vendas-stamp"]);

function defaultDates() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

const iso = (d: Date) => d.toISOString().split("T")[0];

// Período imediatamente anterior, de mesma duração (inclusiva).
function previousPeriod(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  const days = Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
  const prevEnd = new Date(s);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - (days - 1));
  return { start: iso(prevStart), end: iso(prevEnd) };
}

const RECEITA_ZERO = {
  totalCobrado: 0, valorNovosContratos: 0, mrr: 0, clientesAtivos: 0, emRisco: 0,
  qtdNovosAnuais: 0, valorNovosAnuais: 0, qtdNovosMensais: 0, valorNovosMensais: 0,
  assinou: 0, pagou: 0,
};
const CONVERSAO_ZERO = {
  leadsEntrados: 0, fechamentos: 0, closeRate: 0,
  acessos: 0, taxaPagamento: 0, perdaPagamento: 0, inadimplentes: 0,
  multiplosEntradas: 0, reentradas: 0, quicam: 0,
  funnelEntrados: 0, funnelTemConversa: 0, funnelAcesso: 0, funnelPagou: 0,
};
const VELOCIDADE_ZERO = {
  frtP50: null, frtP90: null, secondRespP50: null, secondRespP90: null,
  timeBetweenP50: null, timeBetweenP90: null, msgsAteFecharP50: null, msgsAtePerdidoP50: null,
  frtDist: [], secondDist: [], betweenDist: [],
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

  // Token de refresh — só muda quando o usuário clica "Atualizar" (cookie).
  const rev = (await cookies()).get("vendas-rev")?.value ?? "inicial";

  // Visão padrão (sem filtros, sem datas custom) e antes de qualquer "Atualizar":
  // serve o SNAPSHOT salvo, sem tocar no banco. Filtros ou o botão Atualizar
  // levam ao caminho ao vivo (cacheado) abaixo.
  const isDefaultView =
    !params.source && !params.lv && !params.pv && !params.start && !params.end;

  if (rev === "inicial" && isDefaultView) {
    return (
      <DashboardClient
        filters={snapshot.filters}
        dataStamp={snapshot.generatedAt}
        receita={snapshot.receita}
        conversao={snapshot.conversao}
        velocidade={snapshot.velocidade}
        perda={snapshot.perda}
        leadsPorDia={snapshot.leadsPorDia}
        filterOptions={snapshot.filterOptions}
        prev={snapshot.prev}
      />
    );
  }

  const [receita, conversao, velocidade, leadsPorDia, filterOptions] = await Promise.all([
    cachedReceita(filters, rev).catch((e) => { console.error("[vendas] receita", e); return RECEITA_ZERO; }),
    cachedConversao(filters, rev).catch((e) => { console.error("[vendas] conversao", e); return CONVERSAO_ZERO; }),
    cachedVelocidade(filters, rev).catch((e) => { console.error("[vendas] velocidade", e); return VELOCIDADE_ZERO; }),
    cachedLeadsPorDia(filters, rev).catch(() => []),
    cachedFilterOptions(rev).catch(() => ({ sources: [], landingVariants: [], pricingVariants: [] })),
  ]);

  const perda = await cachedPerda(filters, conversao.leadsEntrados, rev)
    .catch((e) => { console.error("[vendas] perda", e); return PERDA_ZERO; });

  // ── Período anterior (mesma duração, imediatamente antes) ──
  const pp = previousPeriod(filters.start, filters.end);
  const prevFilters: VendasFilters = { ...filters, start: pp.start, end: pp.end };

  const [prevReceita, prevConversao, prevVelocidade] = await Promise.all([
    cachedReceita(prevFilters, rev).catch(() => RECEITA_ZERO),
    cachedConversao(prevFilters, rev).catch(() => CONVERSAO_ZERO),
    cachedVelocidade(prevFilters, rev).catch(() => VELOCIDADE_ZERO),
  ]);
  const prevPerda = await cachedPerda(prevFilters, prevConversao.leadsEntrados, rev)
    .catch(() => PERDA_ZERO);

  const dataStamp = await cachedStamp(rev).catch(() => new Date().toISOString());

  return (
    <DashboardClient
      filters={filters}
      dataStamp={dataStamp}
      receita={receita}
      conversao={conversao}
      velocidade={velocidade}
      perda={perda}
      leadsPorDia={leadsPorDia}
      filterOptions={filterOptions}
      prev={{
        receita: prevReceita,
        conversao: prevConversao,
        velocidade: prevVelocidade,
        perda: prevPerda,
      }}
    />
  );
}
