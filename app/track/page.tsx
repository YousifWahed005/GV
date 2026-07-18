import type { Metadata } from "next";
import Link from "next/link";
import { listRegistrations } from "@/lib/storage";
import { CheckCircle2, Clock, XCircle, Ticket, ArrowLeft, Search } from "lucide-react";
import type { RegistrationStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Track Registration" };

const STATUS_CFG: Record<RegistrationStatus, { icon: typeof Clock; color: string; border: string; label: string }> = {
  "Pending Approval": { icon: Clock,         color: "text-paper/60",  border: "border-white/20",      label: "Pending Review" },
  "Approved":         { icon: CheckCircle2,  color: "text-limeflash", border: "border-limeflash/30",  label: "Approved" },
  "Rejected":         { icon: XCircle,       color: "text-hotpink",   border: "border-hotpink/30",    label: "Rejected" },
  "Checked In":       { icon: Ticket,        color: "text-limeflash", border: "border-limeflash/40",  label: "Checked In" },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ ref?: string; email?: string }> }) {
  const params = await searchParams;
  const query  = (params.ref || params.email || "").trim().toLowerCase();

  let found = null;
  if (query) {
    const all = await listRegistrations();
    found = all.find((r) => r.referenceId.toLowerCase() === query || r.email.toLowerCase() === query) ?? null;
  }

  const cfg        = found ? STATUS_CFG[found.status] : null;
  const StatusIcon = cfg?.icon ?? Clock;

  return (
    <main className="min-h-screen px-4 pb-24 pt-28">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-paper/45 hover:text-limeflash transition">
          <ArrowLeft size={15} aria-hidden="true" /> Back to Home
        </Link>
        <p className="mb-2 font-black uppercase tracking-widest text-hotpink text-sm">Status Lookup</p>
        <h1 className="graffiti-title mb-8 text-5xl sm:text-6xl">Track Your Pass</h1>

        {/* Search */}
        <form className="paint-card mb-6 rounded-2xl p-6 shadow-neon" role="search">
          <p className="mb-4 text-sm text-paper/55">Enter your Reference ID or Email address.</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/35" aria-hidden="true" />
              <input
                className="field pl-10"
                name="ref"
                placeholder="GV-2026-0001 or email@example.com"
                defaultValue={params.ref || params.email || ""}
                aria-label="Reference ID or Email"
                required
              />
            </div>
            <button className="btn-primary shrink-0">Search</button>
          </div>
        </form>

        {/* Not found */}
        {query && !found && (
          <div className="paint-card rounded-2xl border border-hotpink/20 p-8 text-center">
            <p className="mb-3 text-4xl">🔍</p>
            <p className="font-black text-xl mb-1">Not Found</p>
            <p className="text-sm text-paper/50">
              No registration found for <span className="font-bold text-hotpink">{query}</span>.
            </p>
          </div>
        )}

        {/* Result */}
        {found && cfg && (
          <div className="space-y-4">
            <div className={`paint-card rounded-2xl border p-6 bg-${found.status === "Approved" ? "limeflash" : found.status === "Rejected" ? "hotpink" : "white"}/5 ${cfg.border}`}>
              <div className="flex items-center gap-4 mb-3">
                <StatusIcon size={36} className={cfg.color} aria-hidden="true" />
                <div>
                  <p className="text-xs font-black uppercase text-paper/40 mb-0.5">Status</p>
                  <p className={`font-display text-3xl ${cfg.color}`}>{cfg.label}</p>
                </div>
              </div>
              {found.status === "Pending Approval" && <p className="text-sm text-paper/55">Your registration is under review. We'll notify you by email once approved.</p>}
              {found.status === "Approved"         && <p className="text-sm text-limeflash/75">🎉 Congratulations! Check your email for your ticket and QR code.</p>}
              {found.status === "Rejected" && found.rejectionReason && (
                <div className="mt-3 rounded-xl bg-hotpink/10 border border-hotpink/20 p-3">
                  <p className="text-xs font-black uppercase text-hotpink mb-1">Reason</p>
                  <p className="text-sm text-paper/75">{found.rejectionReason}</p>
                </div>
              )}
              {found.status === "Checked In" && (
                <p className="text-sm text-limeflash/75">✓ Checked in{found.checkedInAt ? ` at ${new Date(found.checkedInAt).toLocaleString("en-US")}` : ""}</p>
              )}
            </div>

            {/* Details */}
            <div className="paint-card rounded-2xl p-6">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-paper/35">Registration Details</p>
              <dl className="space-y-2.5">
                {([
                  ["Reference ID", found.referenceId],
                  ["Name",         found.fullName],
                  ["Email",        found.email],
                  ["Payment",      found.paymentMethod],
                  ["Amount",       `${found.finalPrice} EGP${found.discountPercentage > 0 ? ` (${found.discountPercentage}% off)` : ""}`],
                  ["Submitted",    new Date(found.timestamp).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
                ] as const).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-white/5 py-2 last:border-0">
                    <dt className="text-xs font-black uppercase text-paper/35">{label}</dt>
                    <dd className="text-sm font-bold text-paper/85 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {(found.status === "Approved" || found.status === "Checked In") && found.ticketUrl && (
              <a href={found.ticketUrl} target="_blank" rel="noopener noreferrer" className="btn-primary block w-full text-center">
                <Ticket size={17} className="inline mr-2" aria-hidden="true" /> Download Ticket PDF
              </a>
            )}

            {found.qrDataUrl && (
              <div className="paint-card rounded-2xl p-6 text-center">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-paper/35">Your QR Code</p>
                <img src={found.qrDataUrl} alt="Event entry QR code" className="mx-auto w-48 rounded-xl" />
                <p className="mt-3 text-xs text-paper/35">Present at the entrance on event day</p>
              </div>
            )}

            <Link href="/" className="btn-secondary block w-full text-center">Back To Home</Link>
          </div>
        )}
      </div>
    </main>
  );
}
