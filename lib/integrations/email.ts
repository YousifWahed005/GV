import type { Registration } from "@/lib/types";

function configured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

const brand = {
  bg: "#111111",
  green: "#CCFF00",
  pink: "#FF00AA",
  paper: "#F8F8F8",
};

function baseTemplate(content: string, title: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:Arial,sans-serif;color:${brand.paper};">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <tr><td>
      <!-- Header -->
      <div style="text-align:center;padding:32px 0 24px;border-bottom:2px solid ${brand.green}20;">
        <div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:4px;color:${brand.green};margin-bottom:8px;">GLOBAL VILLAGE</div>
        <div style="font-size:42px;font-weight:900;text-transform:uppercase;font-family:Impact,sans-serif;letter-spacing:-1px;color:${brand.paper};text-shadow:0 0 20px ${brand.green}50;">STREET'26</div>
        <div style="font-size:11px;color:${brand.paper}80;margin-top:6px;text-transform:uppercase;letter-spacing:2px;">11 August 2026 · Suez, Egypt</div>
      </div>
      <!-- Content -->
      ${content}
      <!-- Footer -->
      <div style="text-align:center;padding:24px 0;border-top:1px solid ${brand.paper}20;margin-top:32px;">
        <div style="font-size:11px;color:${brand.paper}50;text-transform:uppercase;letter-spacing:2px;">One World. One Crew. One Vibe.</div>
        <div style="font-size:10px;color:${brand.paper}30;margin-top:8px;">Global Village Street'26 · Suez, Egypt</div>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string, accent = brand.paper) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${brand.paper}10;">
      <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${brand.paper}50;">${label}</span><br>
      <span style="font-size:15px;font-weight:700;color:${accent};">${value}</span>
    </td>
  </tr>`;
}

export async function sendPendingEmail(reg: Registration) {
  if (!configured()) return;
  const html = baseTemplate(`
    <div style="padding:32px 0;">
      <div style="font-size:11px;color:${brand.pink};font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Registration Received</div>
      <div style="font-size:36px;font-weight:900;text-transform:uppercase;font-family:Impact,sans-serif;color:${brand.paper};">Under Review</div>
      <p style="color:${brand.paper}80;line-height:1.6;margin:16px 0 24px;">Hey ${reg.fullName}! Your registration for Global Village Street'26 has been received and is now under review. We'll notify you once it's approved.</p>
      <div style="background:${brand.paper}08;border:1px solid ${brand.green}30;border-radius:12px;padding:20px;margin:24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Reference ID", reg.referenceId, brand.green)}
          ${infoRow("Name", reg.fullName)}
          ${infoRow("Payment Method", reg.paymentMethod)}
          ${infoRow("Submitted", new Date(reg.timestamp).toLocaleDateString("en-US", { weekday:"long",year:"numeric",month:"long",day:"numeric" }))}
          ${infoRow("Final Price", `${reg.finalPrice} EGP${reg.discountPercentage > 0 ? ` (${reg.discountPercentage}% discount applied)` : ""}`)}
        </table>
      </div>
      <div style="background:${brand.green}15;border-left:3px solid ${brand.green};padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0;">
        <span style="font-size:13px;color:${brand.green};font-weight:700;">Save your Reference ID: ${reg.referenceId}</span><br>
        <span style="font-size:12px;color:${brand.paper}70;">Use it to track your registration status at our website.</span>
      </div>
    </div>
  `, "Registration Received — Street'26");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: reg.email,
      subject: `Registration Received — Ref: ${reg.referenceId} | Global Village Street'26`,
      html,
    });
  } catch { /* silently fail */ }
}

export async function sendApprovalEmail(reg: Registration) {
  if (!configured()) return;
  const html = baseTemplate(`
    <div style="padding:32px 0;">
      <div style="text-align:center;padding:24px;background:${brand.green}15;border:2px solid ${brand.green};border-radius:16px;margin-bottom:28px;">
        <div style="font-size:48px;margin-bottom:8px;">✅</div>
        <div style="font-size:11px;color:${brand.green};font-weight:900;text-transform:uppercase;letter-spacing:3px;margin-bottom:6px;">Access Granted</div>
        <div style="font-size:42px;font-weight:900;font-family:Impact,sans-serif;color:${brand.green};text-shadow:0 0 20px ${brand.green}60;">YOU'RE IN!</div>
      </div>
      <p style="color:${brand.paper}80;line-height:1.6;margin:0 0 24px;">Congratulations ${reg.fullName}! Your registration has been approved. Your Street Pass is ready — see you on 11 August 2026 in Suez!</p>
      <div style="background:${brand.paper}08;border:1px solid ${brand.green}30;border-radius:12px;padding:20px;margin:24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Reference ID", reg.referenceId, brand.green)}
          ${infoRow("Name", reg.fullName)}
          ${infoRow("Payment Method", reg.paymentMethod)}
          ${infoRow("Amount Paid", `${reg.finalPrice} EGP`)}
          ${infoRow("Event Date", "11 August 2026")}
          ${infoRow("Location", "Suez, Egypt")}
        </table>
      </div>
      ${reg.ticketUrl ? `<div style="text-align:center;margin:24px 0;"><a href="${reg.ticketUrl}" style="background:${brand.green};color:#111;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;display:inline-block;text-transform:uppercase;letter-spacing:1px;">Download Your Ticket PDF</a></div>` : ""}
      <div style="background:${brand.pink}15;border-left:3px solid ${brand.pink};padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0;">
        <span style="font-size:13px;color:${brand.pink};font-weight:700;">Bring your National ID on event day</span><br>
        <span style="font-size:12px;color:${brand.paper}70;">Your QR code will be scanned at the entrance.</span>
      </div>
    </div>
  `, "Access Granted — Street'26");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: reg.email,
      subject: `✅ ACCESS GRANTED — Ref: ${reg.referenceId} | Global Village Street'26`,
      html,
    });
  } catch { /* silently fail */ }
}

export async function sendRejectionEmail(reg: Registration) {
  if (!configured()) return;
  const html = baseTemplate(`
    <div style="padding:32px 0;">
      <div style="font-size:11px;color:${brand.pink};font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Registration Update</div>
      <div style="font-size:36px;font-weight:900;font-family:Impact,sans-serif;color:${brand.paper};">We're Sorry</div>
      <p style="color:${brand.paper}80;line-height:1.6;margin:16px 0 24px;">Hi ${reg.fullName}, unfortunately your registration for Global Village Street'26 could not be approved at this time.</p>
      ${reg.rejectionReason ? `<div style="background:${brand.paper}08;border:1px solid ${brand.pink}30;border-radius:12px;padding:16px 20px;margin:20px 0;"><span style="font-size:11px;color:${brand.pink};text-transform:uppercase;font-weight:700;">Reason</span><br><p style="color:${brand.paper}80;margin:8px 0 0;">${reg.rejectionReason}</p></div>` : ""}
      <div style="background:${brand.paper}08;border:1px solid ${brand.paper}20;border-radius:12px;padding:20px;margin:24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Reference ID", reg.referenceId)}
          ${infoRow("Name", reg.fullName)}
        </table>
      </div>
      <p style="color:${brand.paper}60;font-size:13px;line-height:1.6;">If you believe this is an error or would like more information, please contact our team and reference your ID above.</p>
    </div>
  `, "Registration Update — Street'26");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: reg.email,
      subject: `Registration Update — Ref: ${reg.referenceId} | Global Village Street'26`,
      html,
    });
  } catch { /* silently fail */ }
}
