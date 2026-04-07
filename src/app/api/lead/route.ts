import { NextResponse } from "next/server";
import { addLead, readLeads, type WorksWhere, type Profile, type UtmData } from "@/lib/leads-store";
import { forwardLead } from "@/lib/lead-webhook";

const VALID_WORKS: WorksWhere[] = ["brasil", "exterior"];
const VALID_PROFILES: Profile[] = [
  "open_company",
  "existing_company",
  "first_freela",
  "mei",
  "other",
];

function parseUtm(raw: unknown): UtmData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const utm: UtmData = {};
  if (typeof obj.utmSource === "string") utm.utmSource = obj.utmSource;
  if (typeof obj.utmMedium === "string") utm.utmMedium = obj.utmMedium;
  if (typeof obj.utmCampaign === "string") utm.utmCampaign = obj.utmCampaign;
  if (typeof obj.utmContent === "string") utm.utmContent = obj.utmContent;
  if (typeof obj.utmTerm === "string") utm.utmTerm = obj.utmTerm;
  return Object.keys(utm).length > 0 ? utm : undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, coupon, worksWhere, profile, utmData } = body ?? {};

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }
    if (typeof phone !== "string" || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
    }
    if (typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (!VALID_WORKS.includes(worksWhere)) {
      return NextResponse.json({ error: "worksWhere inválido" }, { status: 400 });
    }
    if (!VALID_PROFILES.includes(profile)) {
      return NextResponse.json({ error: "profile inválido" }, { status: 400 });
    }

    const lead = await addLead({
      name,
      phone,
      email,
      coupon: typeof coupon === "string" ? coupon : undefined,
      worksWhere,
      profile,
      utmData: parseUtm(utmData),
    });

    // Fire-and-forget: encaminha pro webhook configurado (Slack/Make/Zapier/n8n).
    // Não bloqueia a resposta — se falhar, lead já está salvo localmente.
    forwardLead(lead).catch((err) => console.error("[lead-webhook]", err));

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("[api/lead POST]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await readLeads();
    return NextResponse.json(leads);
  } catch (err) {
    console.error("[api/lead GET]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
