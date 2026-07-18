import { Registration } from "@/lib/types";

export async function notifyTelegram(registration: Registration) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    "New Registration",
    "",
    `Name: ${registration.fullName}`,
    `Reference: ${registration.referenceId}`,
    `Payment: ${registration.paymentMethod}`,
    `Promo: ${registration.promoCode || "None"}`,
    `Status: Pending`
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}
