import { promises as fs } from "fs";
import path from "path";

const maxBytes = 5 * 1024 * 1024;

export async function saveUploadedFile(file: File | null, referenceId: string, label: string) {
  if (!file || file.size === 0) return "";
  if (!file.type.startsWith("image/")) {
    throw new Error(`${label} must be an image.`);
  }
  if (file.size > maxBytes) {
    throw new Error(`${label} must be smaller than 5MB.`);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = `${referenceId}-${label.toLowerCase().replaceAll(" ", "-")}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, safeName), buffer);
  return `/uploads/${safeName}`;
}
