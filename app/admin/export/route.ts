import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/actions";
import { listRegistrations } from "@/lib/storage";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const rows = await listRegistrations();
  const headers = [
    "Reference ID",
    "Timestamp",
    "Full Name",
    "Email",
    "Phone",
    "Age",
    "City",
    "Payment Method",
    "Promo Code",
    "Discount Percentage",
    "Final Price",
    "National ID Front URL",
    "National ID Back URL",
    "Payment Screenshot URL",
    "Status"
  ];
  const csv = [
    headers,
    ...rows.map((item) => [
      item.referenceId,
      item.timestamp,
      item.fullName,
      item.email,
      item.phone,
      item.age,
      item.city,
      item.paymentMethod,
      item.promoCode || "",
      item.discountPercentage,
      item.finalPrice,
      item.nationalIdFrontUrl,
      item.nationalIdBackUrl,
      item.paymentScreenshotUrl || "",
      item.status
    ])
  ]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=global-village-street-26-registrations.csv"
    }
  });
}
