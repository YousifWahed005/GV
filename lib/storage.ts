import { promises as fs } from "fs";
import path from "path";
import type {
  Registration, RegistrationStatus,
  Country, Sponsor, RecapItem, PromoCode,
  EventSettings, FooterSettings, QuickLink
} from "@/lib/types";

// ─── helpers ─────────────────────────────────────────────────────────────────
async function ensureFile(filePath: string, defaultContent = "[]") {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  try { await fs.access(filePath); } catch { await fs.writeFile(filePath, defaultContent, "utf8"); }
}
async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    await ensureFile(filePath, JSON.stringify(fallback, null, 2));
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch { return fallback; }
}
async function writeJson(filePath: string, data: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

const DATA = path.join(process.cwd(), "data");

// ─── Event Settings ───────────────────────────────────────────────────────────
const defaultSettings: EventSettings = {
  eventName: "Global Village Street'26",
  eventDate: "2026-08-11",
  eventTime: "10:00",
  eventLocation: "Suez, Egypt",
  ticketPrice: 200,
  registrationOpen: true,
  maxRegistrations: 300,
  hero: { eventName: "Global Village Street'26", tagline: "One World. One Crew. One Vibe.", date: "11 August 2026", location: "Suez, Egypt" },
  footer: {
    socials: {},
    contact: { address: "Suez, Egypt" },
    quickLinks: [
      { id: "ql-1", label: "Home", href: "/", sortOrder: 1 },
      { id: "ql-2", label: "Countries", href: "#countries", sortOrder: 2 },
      { id: "ql-3", label: "Shows", href: "#shows", sortOrder: 3 },
      { id: "ql-4", label: "Tickets", href: "#tickets", sortOrder: 4 },
      { id: "ql-5", label: "Register", href: "/register", sortOrder: 5 },
      { id: "ql-6", label: "Track Registration", href: "/track", sortOrder: 6 },
    ],
  },
};

export async function getEventSettings(): Promise<EventSettings> {
  return readJson(path.join(DATA, "event-settings.json"), defaultSettings);
}
export async function saveEventSettings(settings: EventSettings) {
  await writeJson(path.join(DATA, "event-settings.json"), settings);
}

// ─── Registrations ────────────────────────────────────────────────────────────
export async function listRegistrations(): Promise<Registration[]> {
  return readJson<Registration[]>(path.join(DATA, "registrations.json"), []);
}
async function writeRegistrations(regs: Registration[]) {
  await writeJson(path.join(DATA, "registrations.json"), regs);
}
export async function nextReferenceId() {
  const regs = await listRegistrations();
  const last = regs.map((r) => Number(r.referenceId.split("-").at(-1))).filter(Number.isFinite).sort((a, b) => b - a)[0];
  return `GV-2026-${String((last ?? 0) + 1).padStart(4, "0")}`;
}
export async function saveRegistration(reg: Registration) {
  const regs = await listRegistrations(); regs.push(reg); await writeRegistrations(regs); return reg;
}
export async function updateRegistration(referenceId: string, patch: Partial<Registration>) {
  const regs = await listRegistrations();
  const idx = regs.findIndex((r) => r.referenceId === referenceId);
  if (idx === -1) throw new Error("Registration not found");
  regs[idx] = { ...regs[idx], ...patch };
  await writeRegistrations(regs); return regs[idx];
}
export async function setRegistrationStatus(referenceId: string, status: RegistrationStatus, extra?: Partial<Registration>) {
  return updateRegistration(referenceId, { status, ...extra });
}
export async function getRegistrationCount() {
  return (await listRegistrations()).length;
}

// ─── Countries ────────────────────────────────────────────────────────────────
export async function listCountries(): Promise<Country[]> {
  const data = await readJson<Country[]>(path.join(DATA, "countries.json"), []);
  return data.sort((a, b) => a.sortOrder - b.sortOrder);
}
export async function saveCountry(country: Country) {
  const countries = await listCountries();
  const idx = countries.findIndex((c) => c.id === country.id);
  if (idx === -1) countries.push(country); else countries[idx] = country;
  await writeJson(path.join(DATA, "countries.json"), countries);
}
export async function deleteCountry(id: string) {
  const countries = await listCountries();
  await writeJson(path.join(DATA, "countries.json"), countries.filter((c) => c.id !== id));
}

// ─── Sponsors ─────────────────────────────────────────────────────────────────
export async function listSponsors(): Promise<Sponsor[]> {
  const data = await readJson<Sponsor[]>(path.join(DATA, "sponsors.json"), []);
  return data.sort((a, b) => a.sortOrder - b.sortOrder);
}
export async function listActiveSponsors(): Promise<Sponsor[]> {
  return (await listSponsors()).filter((s) => s.active);
}
export async function saveSponsor(sponsor: Sponsor) {
  const sponsors = await listSponsors();
  const idx = sponsors.findIndex((s) => s.id === sponsor.id);
  if (idx === -1) sponsors.push(sponsor); else sponsors[idx] = sponsor;
  await writeJson(path.join(DATA, "sponsors.json"), sponsors);
}
export async function deleteSponsor(id: string) {
  const sponsors = await listSponsors();
  await writeJson(path.join(DATA, "sponsors.json"), sponsors.filter((s) => s.id !== id));
}

// ─── Recap ────────────────────────────────────────────────────────────────────
export async function listRecapItems(): Promise<RecapItem[]> {
  const data = await readJson<RecapItem[]>(path.join(DATA, "recap.json"), []);
  return data.sort((a, b) => a.year - b.year || a.sortOrder - b.sortOrder);
}
export async function saveRecapItem(item: RecapItem) {
  const items = await listRecapItems();
  const idx = items.findIndex((r) => r.id === item.id);
  if (idx === -1) items.push(item); else items[idx] = item;
  await writeJson(path.join(DATA, "recap.json"), items);
}
export async function deleteRecapItem(id: string) {
  const items = await listRecapItems();
  await writeJson(path.join(DATA, "recap.json"), items.filter((r) => r.id !== id));
}

// ─── Promo Codes ──────────────────────────────────────────────────────────────
export async function listPromoCodes(): Promise<PromoCode[]> {
  return readJson<PromoCode[]>(path.join(DATA, "promo-codes.json"), []);
}
export async function savePromoCode(code: PromoCode) {
  const codes = await listPromoCodes();
  const idx = codes.findIndex((c) => c.id === code.id);
  if (idx === -1) codes.push(code); else codes[idx] = code;
  await writeJson(path.join(DATA, "promo-codes.json"), codes);
}
export async function deletePromoCode(id: string) {
  const codes = await listPromoCodes();
  await writeJson(path.join(DATA, "promo-codes.json"), codes.filter((c) => c.id !== id));
}
export async function getPromoCodeByString(codeStr: string): Promise<PromoCode | null> {
  const codes = await listPromoCodes();
  const now = new Date();
  return codes.find((c) =>
    c.code === codeStr.toUpperCase() &&
    c.status === "Active" &&
    new Date(c.expirationDate) >= now &&
    (c.usageLimit === 0 || c.usageCount < c.usageLimit)
  ) ?? null;
}
export async function getPromoCodeDiscount(codeStr: string): Promise<number> {
  return (await getPromoCodeByString(codeStr))?.discountAmount ?? 0;
}
export async function incrementPromoUsage(codeStr: string) {
  const codes = await listPromoCodes();
  const found = codes.find((c) => c.code === codeStr.toUpperCase());
  if (!found) return;
  found.usageCount += 1;
  if (found.usageLimit > 0 && found.usageCount >= found.usageLimit) found.status = "Disabled";
  await writeJson(path.join(DATA, "promo-codes.json"), codes);
}
