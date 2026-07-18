import { getPromoCodeDiscount } from "@/lib/storage";

export function normalizePromoCode(code?: string): string {
  return code?.trim().toUpperCase() ?? "";
}

export async function getDiscountPercentage(code?: string): Promise<number> {
  const c = normalizePromoCode(code);
  return c ? getPromoCodeDiscount(c) : 0;
}

export async function getFinalPrice(ticketPrice: number, code?: string): Promise<number> {
  const discount = await getDiscountPercentage(code);
  return Math.max(0, Math.round(ticketPrice * (1 - discount / 100)));
}
