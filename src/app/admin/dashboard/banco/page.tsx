import { getSchema } from "@/lib/vendas-db";
import { unstable_cache } from "next/cache";
import BancoView from "./BancoView";

// Schema é metadado (barato). Cacheado por 1h pra não reconsultar a cada visita.
const cachedSchema = unstable_cache(() => getSchema(), ["vendas-schema"], { revalidate: 3600 });

export default async function BancoPage() {
  const schema = await cachedSchema().catch(() => []);
  return <BancoView schema={schema} />;
}
