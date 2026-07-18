import { NextRequest, NextResponse } from "next/server";
import { getPromoCodeDiscount, getEventSettings } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const code     = req.nextUrl.searchParams.get("code") ?? "";
  const settings = await getEventSettings();
  const discount  = await getPromoCodeDiscount(code);
  const finalPrice = Math.max(0, Math.round(settings.ticketPrice * (1 - discount / 100)));
  return NextResponse.json({ discount, finalPrice, originalPrice: settings.ticketPrice });
}
