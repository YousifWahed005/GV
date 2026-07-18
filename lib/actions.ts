"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { governorates } from "@/lib/event-data";
import { saveUploadedFile } from "@/lib/file-upload";
import { uploadLocalFileToDrive } from "@/lib/integrations/drive";
import { sendApprovalEmail, sendRejectionEmail, sendPendingEmail } from "@/lib/integrations/email";
import { appendRegistrationToSheet, updateSheetStatus } from "@/lib/integrations/sheets";
import { notifyTelegram } from "@/lib/integrations/telegram";
import { generateQrDataUrl, generateTicketPdf } from "@/lib/integrations/ticket";
import { normalizePromoCode } from "@/lib/pricing";
import {
  listRegistrations, nextReferenceId, saveRegistration,
  setRegistrationStatus, updateRegistration, getRegistrationCount,
  getEventSettings, saveEventSettings,
  saveCountry, deleteCountry,
  saveSponsor, deleteSponsor,
  saveRecapItem, deleteRecapItem,
  savePromoCode, deletePromoCode, listPromoCodes,
  getPromoCodeDiscount, incrementPromoUsage,
} from "@/lib/storage";
import type {
  PaymentMethod, Registration, Country, Sponsor, RecapItem, PromoCode, EventSettings, QuickLink,
} from "@/lib/types";

export type ActionState = { ok: boolean; message: string; referenceId?: string; status?: string };

// ─── Registration ─────────────────────────────────────────────────────────────
const paymentMethods = ["Instapay", "Vodafone Cash", "Cash"] as const;

const registrationSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  age: z.coerce.number().min(12).max(80),
  city: z.string().refine((c) => governorates.includes(c as (typeof governorates)[number])),
  paymentMethod: z.enum(paymentMethods),
  promoCode: z.string().optional(),
  // Step 2 optional
  university: z.string().optional(),
  major: z.string().optional(),
  allergy: z.string().optional(),
  allergyNotes: z.string().optional(),
  availableFullDay: z.string().optional(),
  heardFrom: z.string().optional(),
});

export async function submitRegistration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Capacity check
  const settings = await getEventSettings();
  if (!settings.registrationOpen) return { ok: false, message: "Registration is currently closed." };
  const count = await getRegistrationCount();
  if (settings.maxRegistrations > 0 && count >= settings.maxRegistrations)
    return { ok: false, message: "Registration capacity has been reached." };

  const interests = formData.getAll("interests").map(String);
  const parsed = registrationSchema.safeParse({
    fullName: formData.get("fullName"), email: formData.get("email"), phone: formData.get("phone"),
    age: formData.get("age"), city: formData.get("city"), paymentMethod: formData.get("paymentMethod"),
    promoCode: formData.get("promoCode"), university: formData.get("university"),
    major: formData.get("major"), allergy: formData.get("allergy"),
    allergyNotes: formData.get("allergyNotes"), availableFullDay: formData.get("availableFullDay"),
    heardFrom: formData.get("heardFrom"),
  });
  if (!parsed.success) return { ok: false, message: "Please check your registration details." };

  const paymentMethod = parsed.data.paymentMethod as PaymentMethod;
  const front = formData.get("nationalIdFront") as File | null;
  const back = formData.get("nationalIdBack") as File | null;
  const payment = formData.get("paymentScreenshot") as File | null;

  if (!front?.size || !back?.size) return { ok: false, message: "National ID front and back images are required." };
  if ((paymentMethod === "Instapay" || paymentMethod === "Vodafone Cash") && !payment?.size)
    return { ok: false, message: "Payment screenshot is required for digital payments." };

  const referenceId = await nextReferenceId();
  const localFront = await saveUploadedFile(front, referenceId, "National ID Front");
  const localBack = await saveUploadedFile(back, referenceId, "National ID Back");
  const localPayment = payment?.size ? await saveUploadedFile(payment, referenceId, "Payment Screenshot") : null;

  const [nationalIdFrontUrl, nationalIdBackUrl, paymentScreenshotUrl] = await Promise.all([
    uploadLocalFileToDrive(localFront, `${referenceId}-id-front`),
    uploadLocalFileToDrive(localBack, `${referenceId}-id-back`),
    localPayment ? uploadLocalFileToDrive(localPayment, `${referenceId}-payment`) : Promise.resolve(""),
  ]);

  const promoCode = normalizePromoCode(parsed.data.promoCode);
  const discountPercentage = await getPromoCodeDiscount(promoCode);
  const finalPrice = Math.max(0, Math.round(settings.ticketPrice * (1 - discountPercentage / 100)));
  if (promoCode) await incrementPromoUsage(promoCode);

  const registration: Registration = {
    referenceId, timestamp: new Date().toISOString(),
    fullName: parsed.data.fullName, email: parsed.data.email, phone: parsed.data.phone,
    age: parsed.data.age, city: parsed.data.city, paymentMethod, promoCode,
    discountPercentage, finalPrice,
    nationalIdFrontUrl, nationalIdBackUrl, paymentScreenshotUrl,
    university: parsed.data.university || undefined,
    major: parsed.data.major || undefined,
    allergy: parsed.data.allergy || undefined,
    allergyNotes: parsed.data.allergyNotes || undefined,
    availableFullDay: parsed.data.availableFullDay === "yes",
    interests: interests.length > 0 ? interests : undefined,
    heardFrom: parsed.data.heardFrom || undefined,
    status: "Pending Approval",
  };

  await saveRegistration(registration);
  await Promise.allSettled([
    appendRegistrationToSheet(registration),
    notifyTelegram(registration),
    sendPendingEmail(registration),
  ]);
  revalidatePath("/admin");
  return { ok: true, message: "Registration Submitted Successfully", referenceId, status: "Pending Approval" };
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────
export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD) {
    (await cookies()).set("gv-admin", "authenticated", {
      httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/admin");
  }
  redirect("/admin?error=1");
}
export async function adminLogout() {
  (await cookies()).delete("gv-admin");
  redirect("/admin");
}
export async function isAdminAuthenticated() {
  return (await cookies()).get("gv-admin")?.value === "authenticated";
}

// ─── Approve / Reject / Check-In ──────────────────────────────────────────────
export async function approveRegistration(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const referenceId = String(formData.get("referenceId"));
  const current = (await listRegistrations()).find((r) => r.referenceId === referenceId);
  if (!current) throw new Error("Registration not found");
  const qrDataUrl = await generateQrDataUrl({ ...current, status: "Approved" });
  const ticketUrl = await generateTicketPdf({ ...current, status: "Approved" }, qrDataUrl);
  const updated = await updateRegistration(referenceId, { status: "Approved", qrDataUrl, ticketUrl });
  await Promise.allSettled([updateSheetStatus(referenceId, "Approved"), sendApprovalEmail(updated)]);
  revalidatePath("/admin");
}
export async function rejectRegistration(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const referenceId = String(formData.get("referenceId"));
  const rejectionReason = String(formData.get("rejectionReason") || "");
  const updated = await setRegistrationStatus(referenceId, "Rejected", { rejectionReason });
  await Promise.allSettled([updateSheetStatus(referenceId, "Rejected"), sendRejectionEmail(updated)]);
  revalidatePath("/admin");
}
export async function checkInRegistration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = String(formData.get("referenceId") || "").trim();
  let referenceId = raw;
  try { const p = JSON.parse(raw) as { referenceId?: string }; referenceId = p.referenceId || raw; } catch { /* */ }
  const reg = (await listRegistrations()).find((r) => r.referenceId === referenceId);
  if (!reg) return { ok: false, message: "Reference ID not found." };
  if (reg.status === "Checked In") return { ok: true, message: "Already checked in.", referenceId, status: "Checked In" };
  if (reg.status !== "Approved") return { ok: false, message: `Status is ${reg.status}.` };
  await setRegistrationStatus(referenceId, "Checked In", { checkedInAt: new Date().toISOString() });
  await updateSheetStatus(referenceId, "Checked In");
  revalidatePath("/admin");
  return { ok: true, message: "Checked in successfully.", referenceId, status: "Checked In" };
}

// ─── Event Settings ───────────────────────────────────────────────────────────
export async function upsertEventSettings(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const current = await getEventSettings();
  const updated: EventSettings = {
    ...current,
    eventName: String(formData.get("eventName") || current.eventName),
    eventDate: String(formData.get("eventDate") || current.eventDate),
    eventTime: String(formData.get("eventTime") || current.eventTime),
    eventLocation: String(formData.get("eventLocation") || current.eventLocation),
    ticketPrice: Number(formData.get("ticketPrice") || current.ticketPrice),
    registrationOpen: formData.get("registrationOpen") === "true",
    maxRegistrations: Number(formData.get("maxRegistrations") || current.maxRegistrations),
    hero: {
      eventName: String(formData.get("heroEventName") || current.hero.eventName),
      tagline: String(formData.get("heroTagline") || current.hero.tagline),
      date: String(formData.get("heroDate") || current.hero.date),
      location: String(formData.get("heroLocation") || current.hero.location),
    },
  };
  await saveEventSettings(updated);
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/register");
}

// ─── Footer Settings ──────────────────────────────────────────────────────────
export async function upsertFooterSettings(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const current = await getEventSettings();
  const updated: EventSettings = {
    ...current,
    footer: {
      socials: {
        instagram: String(formData.get("instagram") || ""),
        facebook: String(formData.get("facebook") || ""),
        tiktok: String(formData.get("tiktok") || ""),
        youtube: String(formData.get("youtube") || ""),
        linkedin: String(formData.get("linkedin") || ""),
        x: String(formData.get("x") || ""),
      },
      contact: {
        email: String(formData.get("contactEmail") || ""),
        phone: String(formData.get("contactPhone") || ""),
        address: String(formData.get("contactAddress") || ""),
      },
      quickLinks: current.footer.quickLinks,
    },
  };
  await saveEventSettings(updated);
  revalidatePath("/"); revalidatePath("/admin");
}

export async function addQuickLink(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const current = await getEventSettings();
  const link: QuickLink = {
    id: `ql-${Date.now()}`,
    label: String(formData.get("label") || ""),
    href: String(formData.get("href") || ""),
    sortOrder: current.footer.quickLinks.length + 1,
  };
  current.footer.quickLinks.push(link);
  await saveEventSettings(current);
  revalidatePath("/"); revalidatePath("/admin");
}
export async function removeQuickLink(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const id = String(formData.get("id"));
  const current = await getEventSettings();
  current.footer.quickLinks = current.footer.quickLinks.filter((l) => l.id !== id);
  await saveEventSettings(current);
  revalidatePath("/"); revalidatePath("/admin");
}

// ─── Countries ────────────────────────────────────────────────────────────────
export async function upsertCountry(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const id = String(formData.get("id") || `country-${Date.now()}`);
  const galleryRaw = String(formData.get("gallery") || "");
  const gallery = galleryRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  const imageFile = formData.get("imageFile") as File | null;
  const uploadedImage = imageFile && imageFile.size > 0 ? await saveUploadedFile(imageFile, id, "cover") : "";
  const image = uploadedImage || String(formData.get("existingImage") || "");
  const country: Country = {
    id,
    name: String(formData.get("name") || ""),
    flagCode: String(formData.get("flagCode") || "").toLowerCase(),
    image,
    about: String(formData.get("about") || ""),
    history: String(formData.get("history") || ""),
    food: String(formData.get("food") || ""),
    dance: String(formData.get("dance") || ""),
    landmarks: String(formData.get("landmarks") || ""),
    funFact: String(formData.get("funFact") || ""),
    gallery,
    sortOrder: Number(formData.get("sortOrder") || 99),
  };
  await saveCountry(country);
  revalidatePath("/"); revalidatePath("/admin");
}
export async function removeCountry(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  await deleteCountry(String(formData.get("id")));
  revalidatePath("/"); revalidatePath("/admin");
}

// ─── Sponsors ─────────────────────────────────────────────────────────────────
export async function upsertSponsor(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const id = String(formData.get("id") || `sponsor-${Date.now()}`);
  const sponsor: Sponsor = {
    id,
    name: String(formData.get("name") || ""),
    logo: String(formData.get("logo") || ""),
    websiteUrl: String(formData.get("websiteUrl") || ""),
    tier: String(formData.get("tier") || "Silver") as Sponsor["tier"],
    active: formData.get("active") !== "false",
    sortOrder: Number(formData.get("sortOrder") || 99),
  };
  await saveSponsor(sponsor);
  revalidatePath("/"); revalidatePath("/admin");
}
export async function removeSponsor(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  await deleteSponsor(String(formData.get("id")));
  revalidatePath("/"); revalidatePath("/admin");
}

// ─── Recap ────────────────────────────────────────────────────────────────────
export async function upsertRecapItem(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const id = String(formData.get("id") || `recap-${Date.now()}`);
  const item: RecapItem = {
    id,
    year: Number(formData.get("year") || 2024),
    title: String(formData.get("title") || ""),
    mediaType: String(formData.get("mediaType") || "image") as RecapItem["mediaType"],
    mediaUrl: String(formData.get("mediaUrl") || ""),
    sortOrder: Number(formData.get("sortOrder") || 99),
  };
  await saveRecapItem(item);
  revalidatePath("/admin");
}
export async function removeRecapItem(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  await deleteRecapItem(String(formData.get("id")));
  revalidatePath("/admin");
}

// ─── Promo Codes ──────────────────────────────────────────────────────────────
export async function upsertPromoCode(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const id = String(formData.get("id") || `pc-${Date.now()}`);
  const code: PromoCode = {
    id,
    code: String(formData.get("code") || "").toUpperCase(),
    discountAmount: Number(formData.get("discountAmount") || 0),
    expirationDate: String(formData.get("expirationDate") || ""),
    usageLimit: Number(formData.get("usageLimit") || 0),
    usageCount: Number(formData.get("usageCount") || 0),
    status: String(formData.get("status") || "Active") as PromoCode["status"],
  };
  await savePromoCode(code);
  revalidatePath("/admin");
}
export async function removePromoCode(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  await deletePromoCode(String(formData.get("id")));
  revalidatePath("/admin");
}
export async function togglePromoStatus(formData: FormData) {
  if (!(await isAdminAuthenticated())) throw new Error("Unauthorized");
  const id = String(formData.get("id"));
  const codes = await listPromoCodes();
  const found = codes.find((c) => c.id === id);
  if (!found) return;
  found.status = found.status === "Active" ? "Disabled" : "Active";
  await savePromoCode(found);
  revalidatePath("/admin");
}
