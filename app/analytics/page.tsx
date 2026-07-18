import { listRegistrations } from "@/lib/storage";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/actions";

export default async function AnalyticsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin");

  const registrations = await listRegistrations();
  const count = (status: string) => registrations.filter((r) => r.status === status).length;
  const revenue = registrations
    .filter((r) => r.status === "Approved" || r.status === "Checked In")
    .reduce((sum, r) => sum + r.finalPrice, 0);

  return (
    <main className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 font-black uppercase text-hotpink text-sm">Analytics</p>
        <h1 className="graffiti-title mb-8 text-5xl sm:text-7xl">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total",      registrations.length, "text-paper"],
            ["Pending",    count("Pending Approval"), "text-paper/60"],
            ["Approved",   count("Approved"),    "text-limeflash"],
            ["Checked In", count("Checked In"), "text-limeflash"],
            ["Rejected",   count("Rejected"),   "text-hotpink"],
            ["Revenue",    `${revenue.toLocaleString()} EGP`, "text-limeflash"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="paint-card rounded-xl p-5">
              <p className="text-xs font-black uppercase text-paper/40 mb-1">{label}</p>
              <p className={`font-display text-4xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
