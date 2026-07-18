import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import path from "path";
import { Registration } from "@/lib/types";

export async function generateQrDataUrl(registration: Registration) {
  const qrcode = await import("qrcode");
  const payload = JSON.stringify({
    referenceId: registration.referenceId,
    name: registration.fullName,
    status: "Approved",
    checkedIn: false
  });
  return qrcode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    color: { dark: "#111111", light: "#CCFF00" }
  });
}

export async function generateTicketPdf(registration: Registration, qrDataUrl: string) {
  const PDFDocument = (await import("pdfkit")).default;
  const ticketsDir = path.join(process.cwd(), "public", "uploads", "tickets");
  await fs.mkdir(ticketsDir, { recursive: true });
  const fileName = `${registration.referenceId}-ticket.pdf`;
  const filePath = path.join(ticketsDir, fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const stream = doc.pipe(createWriteStream(filePath));
    const qrBase64 = qrDataUrl.split(",")[1];
    const qrBuffer = Buffer.from(qrBase64, "base64");

    doc.rect(0, 0, 595, 842).fill("#111111");
    doc.fillColor("#CCFF00").fontSize(34).text("GLOBAL VILLAGE", 48, 56);
    doc.fillColor("#FF00AA").fontSize(30).text("STREET'26", 48, 94);
    doc.fillColor("#F8F8F8").fontSize(14).text("One World. One Crew. One Vibe.", 48, 140);
    doc.moveDown();
    doc.fillColor("#F8F8F8").fontSize(18).text(`Name: ${registration.fullName}`, 48, 210);
    doc.text(`Registration ID: ${registration.referenceId}`, 48, 242);
    doc.text("Event: Global Village Street'26", 48, 274);
    doc.text("Location: Suez, Egypt", 48, 306);
    doc.text("Status: Approved", 48, 338);
    doc.image(qrBuffer, 360, 210, { width: 160, height: 160 });
    doc.fillColor("#CCFF00").fontSize(11).text("Bring your ID and ticket on event day.", 48, 720);
    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return `/uploads/tickets/${fileName}`;
}
