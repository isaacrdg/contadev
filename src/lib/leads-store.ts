import crypto from "crypto";
import { readJson, writeJson } from "./kv";

export type LeadStatus = "novo" | "em_contato" | "convertido" | "perdido";

export type WorksWhere = "brasil" | "exterior";

export type Profile =
  | "open_company"
  | "existing_company"
  | "first_freela"
  | "mei"
  | "other";

export interface UtmData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface StatusHistoryEntry {
  status: LeadStatus;
  at: string; // ISO timestamp
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  coupon?: string;
  worksWhere: WorksWhere;
  profile: Profile;
  status: LeadStatus;
  statusHistory: StatusHistoryEntry[];
  tags: string[];
  notes?: string;
  utmData?: UtmData;
  isDuplicateOf?: string; // id do lead original
  createdAt: string;
  updatedAt: string;
}

export interface NewLeadPayload {
  name: string;
  phone: string;
  email: string;
  coupon?: string;
  worksWhere: WorksWhere;
  profile: Profile;
  utmData?: UtmData;
}

const KEY = "leads";

export async function readLeads(): Promise<Lead[]> {
  const raw = await readJson<Lead[]>(KEY, []);
  if (!Array.isArray(raw)) return [];
  // Migração transparente — leads antigos não tinham statusHistory ou tags
  return raw.map((l) => ({
    ...l,
    statusHistory:
      Array.isArray(l.statusHistory) && l.statusHistory.length > 0
        ? l.statusHistory
        : [{ status: l.status ?? "novo", at: l.createdAt ?? new Date().toISOString() }],
    tags: Array.isArray(l.tags) ? l.tags : [],
  }));
}

async function writeLeads(leads: Lead[]): Promise<void> {
  await writeJson(KEY, leads);
}

function cleanUtm(utm?: UtmData): UtmData | undefined {
  if (!utm) return undefined;
  const cleaned: UtmData = {};
  if (utm.utmSource) cleaned.utmSource = utm.utmSource;
  if (utm.utmMedium) cleaned.utmMedium = utm.utmMedium;
  if (utm.utmCampaign) cleaned.utmCampaign = utm.utmCampaign;
  if (utm.utmContent) cleaned.utmContent = utm.utmContent;
  if (utm.utmTerm) cleaned.utmTerm = utm.utmTerm;
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Regras de auto-tag baseadas no UTM. Adicione/edite livremente.
 * Cada regra ganha uma tag canônica que aparece no card e nos filtros.
 */
const UTM_AUTO_TAG_RULES: { match: (utm: UtmData) => boolean; tag: string }[] = [
  { match: (u) => /^ig|insta/i.test(u.utmSource ?? ""), tag: "instagram" },
  { match: (u) => /^fb|facebook/i.test(u.utmSource ?? ""), tag: "facebook" },
  { match: (u) => /^yt|youtube/i.test(u.utmSource ?? ""), tag: "youtube" },
  { match: (u) => /^li|linkedin/i.test(u.utmSource ?? ""), tag: "linkedin" },
  { match: (u) => /^tt|tiktok/i.test(u.utmSource ?? ""), tag: "tiktok" },
  { match: (u) => /reddit/i.test(u.utmSource ?? ""), tag: "reddit" },
  { match: (u) => /google|gads/i.test(u.utmSource ?? ""), tag: "google-ads" },
  { match: (u) => /paid|cpc|ads/i.test(u.utmMedium ?? ""), tag: "tráfego-pago" },
  { match: (u) => /organic/i.test(u.utmMedium ?? ""), tag: "orgânico" },
  { match: (u) => /email|newsletter/i.test(u.utmMedium ?? ""), tag: "email" },
  { match: (u) => /referral|indica/i.test(u.utmMedium ?? ""), tag: "indicação" },
];

export function inferAutoTags(utm?: UtmData): string[] {
  if (!utm) return [];
  const tags = new Set<string>();
  for (const rule of UTM_AUTO_TAG_RULES) {
    if (rule.match(utm)) tags.add(rule.tag);
  }
  return Array.from(tags);
}

function normalizeTag(t: string): string {
  return t.trim().toLowerCase().replace(/\s+/g, "-");
}

function dedupeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const t = normalizeTag(raw);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Procura por leads existentes com mesmo email ou telefone (normalizado).
 * Retorna o lead original mais antigo, se houver.
 */
export async function findDuplicate(
  email: string,
  phone: string
): Promise<Lead | null> {
  const leads = await readLeads();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(phone);
  // Busca o mais antigo (não-duplicata) que bate
  const candidates = leads.filter(
    (l) =>
      !l.isDuplicateOf &&
      (l.email === normalizedEmail || normalizePhone(l.phone) === normalizedPhone)
  );
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return candidates[0];
}

export async function addLead(payload: NewLeadPayload): Promise<Lead> {
  const now = new Date().toISOString();
  const original = await findDuplicate(payload.email, payload.phone);
  const utm = cleanUtm(payload.utmData);
  const lead: Lead = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim().toLowerCase(),
    coupon: payload.coupon?.trim() || undefined,
    worksWhere: payload.worksWhere,
    profile: payload.profile,
    status: "novo",
    statusHistory: [{ status: "novo", at: now }],
    tags: dedupeTags(inferAutoTags(utm)),
    utmData: utm,
    isDuplicateOf: original ? original.id : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const leads = await readLeads();
  leads.unshift(lead);
  await writeLeads(leads);
  return lead;
}

export async function updateLeadTags(
  id: string,
  tags: string[]
): Promise<Lead | null> {
  const leads = await readLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = {
    ...leads[idx],
    tags: dedupeTags(tags),
    updatedAt: new Date().toISOString(),
  };
  await writeLeads(leads);
  return leads[idx];
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<Lead | null> {
  const leads = await readLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const current = leads[idx];
  if (current.status === status) {
    // Sem mudança real — não polui o histórico
    return current;
  }
  const now = new Date().toISOString();
  const history = Array.isArray(current.statusHistory) ? current.statusHistory : [];
  leads[idx] = {
    ...current,
    status,
    statusHistory: [...history, { status, at: now }],
    updatedAt: now,
  };
  await writeLeads(leads);
  return leads[idx];
}

export async function updateLeadNotes(
  id: string,
  notes: string
): Promise<Lead | null> {
  const leads = await readLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const trimmed = notes.trim();
  leads[idx] = {
    ...leads[idx],
    notes: trimmed || undefined,
    updatedAt: new Date().toISOString(),
  };
  await writeLeads(leads);
  return leads[idx];
}
