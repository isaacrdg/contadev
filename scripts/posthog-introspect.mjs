// Varredura read-only do PostHog via HogQL. Mostra eventos e propriedades reais.
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => env.match(new RegExp(`${k}\\s*=\\s*(.+)`))?.[1].trim().replace(/^["']|["']$/g, "");
const HOST = (get("POSTHOG_HOST") || "https://us.posthog.com").replace(/\/$/, "");
const PROJ = get("POSTHOG_PROJECT_ID");
const KEY  = get("POSTHOG_API_KEY");

if (!PROJ || !KEY) { console.error("Faltam POSTHOG_PROJECT_ID / POSTHOG_API_KEY no .env.local"); process.exit(1); }

async function hog(query) {
  const r = await fetch(`${HOST}/api/projects/${PROJ}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
  return j;
}

async function show(title, query) {
  try {
    const j = await hog(query);
    console.log(`\n== ${title} ==`);
    console.log("cols:", (j.columns || []).join(" | "));
    for (const row of (j.results || []).slice(0, 20)) console.log("  " + row.map(String).join(" | "));
  } catch (e) { console.log(`\n== ${title} ==\n  ERRO: ${e.message}`); }
}

const W = "timestamp >= now() - INTERVAL 30 DAY";

await show("Eventos (30d)", `SELECT event, count() AS c FROM events WHERE ${W} GROUP BY event ORDER BY c DESC LIMIT 25`);
await show("Pageviews total + visitantes (30d)", `SELECT count() AS pageviews, count(DISTINCT person_id) AS visitantes FROM events WHERE event='$pageview' AND ${W}`);
await show("Por device (30d)", `SELECT properties.$device_type AS device, count() AS c FROM events WHERE event='$pageview' AND ${W} GROUP BY device ORDER BY c DESC`);
await show("Por país (30d)", `SELECT properties.$geoip_country_name AS pais, count() AS c FROM events WHERE event='$pageview' AND ${W} GROUP BY pais ORDER BY c DESC LIMIT 15`);
await show("Por utm_source (30d)", `SELECT properties.utm_source AS src, count() AS c FROM events WHERE event='$pageview' AND ${W} GROUP BY src ORDER BY c DESC LIMIT 15`);
await show("Por referring_domain (30d)", `SELECT properties.$referring_domain AS ref, count() AS c FROM events WHERE event='$pageview' AND ${W} GROUP BY ref ORDER BY c DESC LIMIT 15`);
await show("Top pathnames (30d)", `SELECT properties.$pathname AS path, count() AS c FROM events WHERE event='$pageview' AND ${W} GROUP BY path ORDER BY c DESC LIMIT 15`);
