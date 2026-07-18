import { Registration } from "@/lib/types";

const HEADERS = [
  "Reference ID","Timestamp","Full Name","Email","Phone","Age","City",
  "Payment Method","Promo Code","Discount %","Final Price (EGP)",
  "ID Front URL","ID Back URL","Payment Screenshot URL","Status"
];

function configured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEETS_ID
  );
}

export async function appendRegistrationToSheet(registration: Registration) {
  if (!configured()) return;
  try {
    const { sheets } = await import("@googleapis/sheets");
    const { GoogleAuth } = await import("google-auth-library");
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    // eslint-disable-next-line
    const client = sheets({ version: "v4", auth: auth as unknown as Parameters<typeof sheets>[0]["auth"] });
    await client.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Registrations!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [HEADERS] },
    });
    await client.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Registrations!A:O",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          registration.referenceId, registration.timestamp, registration.fullName,
          registration.email, registration.phone, registration.age, registration.city,
          registration.paymentMethod, registration.promoCode ?? "",
          registration.discountPercentage, registration.finalPrice,
          registration.nationalIdFrontUrl, registration.nationalIdBackUrl,
          registration.paymentScreenshotUrl ?? "", registration.status,
        ]],
      },
    });
  } catch (_e) { /* Sheets not configured — skip silently */ }
}

export async function updateSheetStatus(referenceId: string, status: string) {
  if (!configured()) return;
  try {
    const { sheets } = await import("@googleapis/sheets");
    const { GoogleAuth } = await import("google-auth-library");
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    // eslint-disable-next-line
    const client = sheets({ version: "v4", auth: auth as unknown as Parameters<typeof sheets>[0]["auth"] });
    const resp = await client.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "Registrations!A:O",
    });
    const rows = resp.data.values as string[][] | undefined;
    const idx = rows?.findIndex((r) => r[0] === referenceId) ?? -1;
    if (idx < 1) return;
    await client.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `Registrations!O${idx + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[status]] },
    });
  } catch (_e) { /* Sheets not configured — skip silently */ }
}
