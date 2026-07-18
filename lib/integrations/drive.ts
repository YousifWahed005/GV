import { promises as fs } from "fs";
import path from "path";

function configured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

export async function uploadLocalFileToDrive(localUrl: string, fileName: string) {
  if (!configured() || !localUrl.startsWith("/uploads/")) {
    return localUrl;
  }

  const { drive } = await import("@googleapis/drive");
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"]
  });

  const client = drive({ version: "v3", auth });
  const filePath = path.join(process.cwd(), "public", localUrl);
  const result = await client.files.create({
    requestBody: {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID as string]
    },
    media: {
      mimeType: "image/jpeg",
      body: await fs.open(filePath).then((handle) => handle.createReadStream())
    },
    fields: "id, webViewLink"
  });

  if (result.data.id) {
    await client.permissions.create({
      fileId: result.data.id,
      requestBody: { role: "reader", type: "anyone" }
    });
  }

  return result.data.webViewLink || localUrl;
}
