import Image from "next/image";
import { CountryPicker } from "@/components/admin/country-picker";
import {
  adminLogin, adminLogout, approveRegistration, isAdminAuthenticated, rejectRegistration,
  upsertCountry, removeCountry, upsertSponsor, removeSponsor,
  upsertRecapItem, removeRecapItem, upsertPromoCode, removePromoCode, togglePromoStatus,
  upsertEventSettings, upsertFooterSettings, addQuickLink, removeQuickLink,
} from "@/lib/actions";
import {
  listRegistrations, listCountries, listSponsors, listRecapItems,
  listPromoCodes, getEventSettings,
} from "@/lib/storage";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; tab?: string; error?: string }>;
}) {
  const authenticated = await isAdminAuthenticated();
  const params = await searchParams;

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 pt-20">
        <form action={adminLogin} className="paint-card w-full max-w-md rounded-2xl p-8 shadow-neon">
          <p className="mb-2 font-black uppercase text-hotpink text-sm">Protected Area</p>
          <h1 className="graffiti-title mb-6 text-5xl">Admin Login</h1>
          {params.error && (
            <div className="mb-4 rounded-xl border border-hotpink/40 bg-hotpink/10 p-3 text-sm font-bold text-hotpink">
              ✕ Wrong email or password. Try again.
            </div>
          )}
          <div className="space-y-3">
            <input className="field" name="email" type="email" placeholder="Email" required autoComplete="email" />
            <input className="field" name="password" type="password" placeholder="Password" required autoComplete="current-password" />
            <button className="btn-primary w-full">Login →</button>
          </div>
        </form>
      </main>
    );
  }

  const tab = params.tab || "dashboard";
  const q = params.q?.toLowerCase() || "";
  const statusFilter = params.status || "";

  const [registrations, countries, sponsors, recapItems, promoCodes, settings] = await Promise.all([
    listRegistrations(), listCountries(), listSponsors(),
    listRecapItems(), listPromoCodes(), getEventSettings(),
  ]);

  // Analytics
  const total = registrations.length;
  const pending = registrations.filter((r) => r.status === "Pending Approval").length;
  const approved = registrations.filter((r) => r.status === "Approved").length;
  const rejected = registrations.filter((r) => r.status === "Rejected").length;
  const checkedIn = registrations.filter((r) => r.status === "Checked In").length;
  const revenue = registrations.filter((r) => r.status === "Approved" || r.status === "Checked In").reduce((sum, r) => sum + r.finalPrice, 0);
  const promoUsed = registrations.filter((r) => r.promoCode).length;

  // Insights
  const cityCounts: Record<string, number> = {};
  const uniCounts: Record<string, number> = {};
  const interestCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  for (const r of registrations) {
    if (r.city) cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
    if (r.university) uniCounts[r.university] = (uniCounts[r.university] || 0) + 1;
    if (r.interests) r.interests.forEach((i) => { interestCounts[i] = (interestCounts[i] || 0) + 1; });
    if (r.heardFrom) sourceCounts[r.heardFrom] = (sourceCounts[r.heardFrom] || 0) + 1;
  }
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topUnis = Object.entries(uniCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topInterests = Object.entries(interestCounts).sort((a, b) => b[1] - a[1]);
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  const filteredRegs = registrations.filter((r) => {
    const matchSearch = !q || r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.referenceId.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "registrations", label: "Registrations", count: total },
    { id: "countries", label: "Countries", count: countries.length },
    { id: "promo-codes", label: "Promo Codes", count: promoCodes.length },
    { id: "sponsors", label: "Sponsors", count: sponsors.length },
    { id: "recap", label: "Recap", count: recapItems.length },
    { id: "settings", label: "Event Settings" },
    { id: "footer", label: "Footer" },
  ];

  const statCard = (label: string, value: string | number, accent = "text-paper") => (
    <div className="paint-card rounded-xl p-5">
      <p className="text-xs font-black uppercase text-paper/40 mb-1">{label}</p>
      <p className={`font-display text-4xl ${accent}`}>{value}</p>
    </div>
  );

  return (
    <main className="px-4 pb-20 pt-28">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 font-black uppercase text-hotpink text-sm">Admin Dashboard</p>
            <h1 className="graffiti-title text-5xl sm:text-7xl">Street'26 Admin</h1>
          </div>
          <form action={adminLogout}><button className="btn-secondary">Logout</button></form>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <a key={t.id} href={`/admin?tab=${t.id}`}
              className={`rounded-lg px-4 py-2 text-sm font-black uppercase transition ${tab === t.id ? "bg-limeflash text-ink" : "border border-white/10 bg-white/5 text-paper/60 hover:bg-white/10"}`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${tab === t.id ? "bg-ink/20 text-ink" : "bg-white/10 text-paper/50"}`}>{t.count}</span>
              )}
            </a>
          ))}
        </div>

        {/* ─── DASHBOARD ─── */}
        {tab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCard("Total Registrations", total, "text-paper")}
              {statCard("Pending", pending, "text-paper/60")}
              {statCard("Approved", approved, "text-limeflash")}
              {statCard("Checked In", checkedIn, "text-limeflash")}
              {statCard("Rejected", rejected, "text-hotpink")}
              {statCard("Revenue (EGP)", revenue.toLocaleString(), "text-limeflash")}
              {statCard("Promo Used", promoUsed, "text-hotpink")}
              {statCard("Capacity", `${total}/${settings.maxRegistrations || "∞"}`, "text-paper/60")}
            </div>

            {/* Capacity bar */}
            {settings.maxRegistrations > 0 && (
              <div className="paint-card rounded-xl p-5">
                <div className="flex justify-between mb-2 text-sm font-bold">
                  <span className="text-paper/60">Registration Capacity</span>
                  <span className="text-limeflash">{Math.round((total / settings.maxRegistrations) * 100)}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-limeflash transition-all" style={{ width: `${Math.min(100, (total / settings.maxRegistrations) * 100)}%` }} />
                </div>
                <p className="text-xs text-paper/40 mt-2">{settings.maxRegistrations - total} spots remaining</p>
              </div>
            )}

            {/* Insights grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Top Cities */}
              <div className="paint-card rounded-xl p-5">
                <p className="text-xs font-black uppercase text-hotpink mb-3">Top Cities</p>
                <div className="space-y-2">
                  {topCities.map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-paper/70 truncate">{city}</span>
                      <span className="text-sm font-black text-limeflash shrink-0">{count}</span>
                    </div>
                  ))}
                  {topCities.length === 0 && <p className="text-xs text-paper/30">No data yet</p>}
                </div>
              </div>

              {/* Top Universities */}
              <div className="paint-card rounded-xl p-5">
                <p className="text-xs font-black uppercase text-hotpink mb-3">Top Universities</p>
                <div className="space-y-2">
                  {topUnis.map(([uni, count]) => (
                    <div key={uni} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-paper/70 truncate">{uni}</span>
                      <span className="text-sm font-black text-limeflash shrink-0">{count}</span>
                    </div>
                  ))}
                  {topUnis.length === 0 && <p className="text-xs text-paper/30">No data yet</p>}
                </div>
              </div>

              {/* Interests */}
              <div className="paint-card rounded-xl p-5">
                <p className="text-xs font-black uppercase text-hotpink mb-3">Top Interests</p>
                <div className="space-y-2">
                  {topInterests.map(([interest, count]) => (
                    <div key={interest} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-paper/70 truncate">{interest}</span>
                      <span className="text-sm font-black text-limeflash shrink-0">{count}</span>
                    </div>
                  ))}
                  {topInterests.length === 0 && <p className="text-xs text-paper/30">No data yet</p>}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="paint-card rounded-xl p-5">
                <p className="text-xs font-black uppercase text-hotpink mb-3">Traffic Sources</p>
                <div className="space-y-2">
                  {topSources.map(([src, count]) => (
                    <div key={src} className="flex items-center justify-between gap-2">
                      <span className="text-sm text-paper/70 truncate">{src}</span>
                      <span className="text-sm font-black text-limeflash shrink-0">{count}</span>
                    </div>
                  ))}
                  {topSources.length === 0 && <p className="text-xs text-paper/30">No data yet</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── REGISTRATIONS ─── */}
        {tab === "registrations" && (
          <div>
            <div className="mb-4">
              <a href="/admin/export" className="btn-secondary text-sm">⬇ Export CSV</a>
            </div>
            <form className="mb-5 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_200px_auto]">
              <input className="field" name="q" placeholder="Search name, email, reference ID" defaultValue={params.q || ""} />
              <select className="field" name="status" defaultValue={statusFilter}>
                <option value="">All statuses</option>
                <option>Pending Approval</option><option>Approved</option>
                <option>Rejected</option><option>Checked In</option>
              </select>
              <input type="hidden" name="tab" value="registrations" />
              <button className="btn-primary">Filter</button>
            </form>
            <div className="space-y-4">
              {filteredRegs.map((item) => (
                <article key={item.referenceId} className="paint-card rounded-xl p-5">
                  <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-3xl text-limeflash uppercase">{item.fullName}</h2>
                        <span className="rounded-lg bg-white/10 px-2 py-0.5 text-xs font-black">{item.referenceId}</span>
                        <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${item.status === "Approved" ? "bg-limeflash text-ink" : item.status === "Rejected" ? "bg-hotpink text-paper" : item.status === "Checked In" ? "bg-deepteal border border-limeflash/40 text-limeflash" : "bg-white/15 text-paper/70"}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="grid gap-1.5 text-sm text-paper/65 sm:grid-cols-3 mb-3">
                        <span>📧 {item.email}</span>
                        <span>📱 {item.phone}</span>
                        <span>🏙 {item.city}</span>
                        <span>💳 {item.paymentMethod}</span>
                        <span>🏷 {item.promoCode || "No promo"}</span>
                        <span>💰 {item.finalPrice} EGP</span>
                        {item.university && <span>🎓 {item.university}</span>}
                        {item.major && <span>📚 {item.major}</span>}
                        {item.heardFrom && <span>📣 {item.heardFrom}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.nationalIdFrontUrl && <a className="btn-secondary text-xs" href={item.nationalIdFrontUrl} target="_blank">ID Front</a>}
                        {item.nationalIdBackUrl && <a className="btn-secondary text-xs" href={item.nationalIdBackUrl} target="_blank">ID Back</a>}
                        {item.paymentScreenshotUrl && <a className="btn-secondary text-xs" href={item.paymentScreenshotUrl} target="_blank">Payment</a>}
                        {item.ticketUrl && <a className="btn-primary text-xs" href={item.ticketUrl} target="_blank">Ticket PDF</a>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {item.qrDataUrl && (
                        <Image src={item.qrDataUrl} alt={`${item.referenceId} QR`} width={160} height={160} unoptimized className="rounded-xl mx-auto" />
                      )}
                      <form action={approveRegistration}>
                        <input type="hidden" name="referenceId" value={item.referenceId} />
                        <button className="btn-primary w-full text-sm" disabled={item.status === "Approved" || item.status === "Checked In"}>✓ Approve</button>
                      </form>
                      <form action={rejectRegistration} className="space-y-2">
                        <input type="hidden" name="referenceId" value={item.referenceId} />
                        <input className="field text-sm" name="rejectionReason" placeholder="Rejection reason (optional)" />
                        <button className="btn-secondary w-full text-sm border-hotpink/40 text-hotpink hover:bg-hotpink/10" disabled={item.status === "Rejected"}>✕ Reject</button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
              {filteredRegs.length === 0 && <p className="paint-card rounded-xl p-8 text-paper/50 text-center">No registrations found.</p>}
            </div>
          </div>
        )}

        {/* ─── COUNTRIES ─── */}
        {tab === "countries" && (
          <div>
            <details className="paint-card mb-6 rounded-xl p-5">
              <summary className="cursor-pointer font-black uppercase text-limeflash">+ Add New Country</summary>
              <form action={upsertCountry} className="mt-5 grid gap-3 sm:grid-cols-2">
                <CountryPicker />
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-black uppercase text-paper/50">Cover Image *</label>
                  <input className="field" name="imageFile" type="file" accept="image/*" required />
                </div>
                <textarea className="field sm:col-span-2" name="about" placeholder="About the country *" rows={2} required />
                <textarea className="field sm:col-span-2" name="history" placeholder="History *" rows={2} required />
                <input className="field" name="food" placeholder="Traditional Food *" required />
                <input className="field" name="dance" placeholder="Traditional Dance *" required />
                <input className="field" name="landmarks" placeholder="Famous Landmarks *" required />
                <input className="field" name="funFact" placeholder="Fun Fact *" required />
                <textarea className="field sm:col-span-2" name="gallery" placeholder="Gallery image URLs (one per line)" rows={3} />
                <input className="field" name="sortOrder" type="number" placeholder="Sort Order" defaultValue={99} />
                <button className="btn-primary sm:col-span-2">Add Country</button>
              </form>
            </details>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((c) => (
                <div key={c.id} className="paint-card overflow-hidden rounded-xl">
                  <div className="relative h-40 overflow-hidden">
                    <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-end gap-2">
                      <img src={`https://flagcdn.com/w40/${c.flagCode}.png`} alt="" className="h-6 w-auto rounded" />
                      <span className="font-display text-2xl text-paper">{c.name}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-paper/50 line-clamp-2">{c.about}</p>
                    <details>
                      <summary className="cursor-pointer text-xs font-black uppercase text-limeflash">Edit</summary>
                      <form action={upsertCountry} className="mt-3 space-y-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="existingImage" value={c.image} />
                        <CountryPicker defaultName={c.name} defaultCode={c.flagCode} />
                        <div>
                          <label className="mb-1 block text-xs font-black uppercase text-paper/50">Cover Image (leave empty to keep current)</label>
                          <input className="field text-sm" name="imageFile" type="file" accept="image/*" />
                        </div>
                        <textarea className="field text-sm" name="about" rows={2} defaultValue={c.about} />
                        <textarea className="field text-sm" name="history" rows={2} defaultValue={c.history} />
                        <input className="field text-sm" name="food" defaultValue={c.food} />
                        <input className="field text-sm" name="dance" defaultValue={c.dance} />
                        <input className="field text-sm" name="landmarks" defaultValue={c.landmarks} />
                        <input className="field text-sm" name="funFact" defaultValue={c.funFact} />
                        <textarea className="field text-sm" name="gallery" rows={3} defaultValue={c.gallery?.join("\n") || ""} placeholder="Gallery URLs (one per line)" />
                        <input className="field text-sm" name="sortOrder" type="number" defaultValue={c.sortOrder} />
                        <button className="btn-primary w-full text-sm">Save Changes</button>
                      </form>
                    </details>
                    <form action={removeCountry}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="w-full rounded-lg border border-hotpink/30 py-1.5 text-xs font-black uppercase text-hotpink hover:bg-hotpink/10 transition">Delete</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── PROMO CODES ─── */}
        {tab === "promo-codes" && (
          <div>
            <details className="paint-card mb-6 rounded-xl p-5">
              <summary className="cursor-pointer font-black uppercase text-limeflash">+ Create Promo Code</summary>
              <form action={upsertPromoCode} className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-black uppercase text-paper/50 mb-1 block">Code</label>
                  <input className="field uppercase" name="code" placeholder="e.g. EARLYBIRD25" required />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/50 mb-1 block">Discount %</label>
                  <input className="field" name="discountAmount" type="number" min={1} max={100} placeholder="e.g. 25" required />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/50 mb-1 block">Usage Limit <span className="text-paper/30 normal-case font-normal">(0 = unlimited)</span></label>
                  <input className="field" name="usageLimit" type="number" min={0} placeholder="e.g. 50" defaultValue={0} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/50 mb-1 block">Expiration Date</label>
                  <input className="field" name="expirationDate" type="date" required />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/50 mb-1 block">Status</label>
                  <select className="field" name="status">
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
                <button className="btn-primary sm:col-span-2">Create Promo Code</button>
              </form>
            </details>

            {/* Stats bar */}
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="paint-card rounded-xl p-4 text-center">
                <p className="text-xs font-black uppercase text-paper/40 mb-1">Total Codes</p>
                <p className="font-display text-3xl text-paper">{promoCodes.length}</p>
              </div>
              <div className="paint-card rounded-xl p-4 text-center">
                <p className="text-xs font-black uppercase text-paper/40 mb-1">Active</p>
                <p className="font-display text-3xl text-limeflash">{promoCodes.filter(p => p.status === "Active").length}</p>
              </div>
              <div className="paint-card rounded-xl p-4 text-center">
                <p className="text-xs font-black uppercase text-paper/40 mb-1">Total Uses</p>
                <p className="font-display text-3xl text-hotpink">{promoCodes.reduce((s, p) => s + p.usageCount, 0)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {promoCodes.map((pc) => {
                const pct = pc.usageLimit > 0 ? Math.round((pc.usageCount / pc.usageLimit) * 100) : 0;
                const expired = new Date(pc.expirationDate) < new Date();
                return (
                  <div key={pc.id} className="paint-card rounded-xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-2xl text-limeflash tracking-widest">{pc.code}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${pc.status === "Active" && !expired ? "bg-limeflash text-ink" : "bg-white/10 text-paper/40"}`}>
                          {expired ? "Expired" : pc.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <form action={togglePromoStatus} className="inline">
                          <input type="hidden" name="id" value={pc.id} />
                          <button className={`rounded-lg border px-3 py-1.5 text-xs font-black uppercase transition ${pc.status === "Active" ? "border-hotpink/30 text-hotpink hover:bg-hotpink/10" : "border-limeflash/30 text-limeflash hover:bg-limeflash/10"}`}>
                            {pc.status === "Active" ? "Disable" : "Enable"}
                          </button>
                        </form>
                        <form action={removePromoCode} className="inline">
                          <input type="hidden" name="id" value={pc.id} />
                          <button className="rounded-lg border border-hotpink/30 px-3 py-1.5 text-xs font-black uppercase text-hotpink hover:bg-hotpink/10 transition">Delete</button>
                        </form>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4 text-sm mb-4">
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-paper/40 uppercase font-bold mb-1">Discount</p>
                        <p className="font-display text-2xl text-limeflash">{pc.discountAmount}%</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-paper/40 uppercase font-bold mb-1">Used</p>
                        <p className="font-display text-2xl">{pc.usageCount}</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-paper/40 uppercase font-bold mb-1">Limit</p>
                        <p className="font-display text-2xl">{pc.usageLimit || "∞"}</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-paper/40 uppercase font-bold mb-1">Expires</p>
                        <p className={`text-sm font-bold ${expired ? "text-hotpink" : "text-paper/70"}`}>{pc.expirationDate}</p>
                      </div>
                    </div>

                    {/* Usage progress bar */}
                    {pc.usageLimit > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-paper/40 mb-1">
                          <span>Usage</span><span>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-hotpink" : "bg-limeflash"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Edit */}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-black uppercase text-paper/40 hover:text-limeflash transition">Edit this code</summary>
                      <form action={upsertPromoCode} className="mt-3 grid gap-2 sm:grid-cols-2">
                        <input type="hidden" name="id" value={pc.id} />
                        <input type="hidden" name="usageCount" value={pc.usageCount} />
                        <input className="field text-sm uppercase" name="code" defaultValue={pc.code} />
                        <input className="field text-sm" name="discountAmount" type="number" defaultValue={pc.discountAmount} />
                        <input className="field text-sm" name="expirationDate" type="date" defaultValue={pc.expirationDate} />
                        <input className="field text-sm" name="usageLimit" type="number" defaultValue={pc.usageLimit} />
                        <select className="field text-sm" name="status" defaultValue={pc.status}>
                          <option>Active</option><option>Disabled</option>
                        </select>
                        <button className="btn-primary text-sm">Save Changes</button>
                      </form>
                    </details>
                  </div>
                );
              })}
              {promoCodes.length === 0 && <p className="paint-card rounded-xl p-8 text-paper/40 text-center">No promo codes yet. Create one above.</p>}
            </div>
          </div>
        )}

        {/* ─── SPONSORS ─── */}
        {tab === "sponsors" && (
          <div>
            <details className="paint-card mb-6 rounded-xl p-5">
              <summary className="cursor-pointer font-black uppercase text-limeflash">+ Add Sponsor</summary>
              <form action={upsertSponsor} className="mt-5 grid gap-3 sm:grid-cols-2">
                <input className="field" name="name" placeholder="Sponsor Name *" required />
                <input className="field" name="logo" placeholder="Logo URL" />
                <input className="field" name="websiteUrl" placeholder="Website URL" />
                <select className="field" name="tier" required>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                </select>
                <select className="field" name="active">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <input className="field" name="sortOrder" type="number" placeholder="Sort Order" defaultValue={99} />
                <button className="btn-primary sm:col-span-2">Add Sponsor</button>
              </form>
            </details>
            <div className="space-y-4">
              {(["Platinum", "Gold", "Silver"] as const).map((tier) => {
                const ts = sponsors.filter((s) => s.tier === tier);
                if (!ts.length) return null;
                return (
                  <div key={tier}>
                    <p className={`mb-3 text-xs font-black uppercase ${tier === "Platinum" ? "text-limeflash" : tier === "Gold" ? "text-hotpink" : "text-paper/40"}`}>{tier} Sponsors</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {ts.map((s) => (
                        <div key={s.id} className="paint-card rounded-xl p-4">
                          <div className="mb-3 flex items-center gap-3">
                            {s.logo && <img src={s.logo} alt={s.name} className="h-10 w-auto object-contain" />}
                            <div>
                              <p className="font-black">{s.name}</p>
                              <div className="flex gap-1.5 mt-0.5">
                                <span className={`rounded text-xs px-1.5 py-0.5 font-black ${tier === "Platinum" ? "bg-limeflash/20 text-limeflash" : tier === "Gold" ? "bg-hotpink/20 text-hotpink" : "bg-white/10 text-paper/50"}`}>{tier}</span>
                                <span className={`rounded text-xs px-1.5 py-0.5 font-black ${s.active ? "bg-limeflash/15 text-limeflash" : "bg-white/10 text-paper/30"}`}>{s.active ? "Active" : "Inactive"}</span>
                              </div>
                            </div>
                          </div>
                          <details className="mb-2">
                            <summary className="cursor-pointer text-xs font-black uppercase text-paper/40 hover:text-limeflash transition">Edit</summary>
                            <form action={upsertSponsor} className="mt-3 space-y-2">
                              <input type="hidden" name="id" value={s.id} />
                              <input className="field text-sm" name="name" defaultValue={s.name} />
                              <input className="field text-sm" name="logo" defaultValue={s.logo} />
                              <input className="field text-sm" name="websiteUrl" defaultValue={s.websiteUrl} />
                              <select className="field text-sm" name="tier" defaultValue={s.tier}>
                                <option>Platinum</option><option>Gold</option><option>Silver</option>
                              </select>
                              <select className="field text-sm" name="active" defaultValue={String(s.active)}>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                              <input className="field text-sm" name="sortOrder" type="number" defaultValue={s.sortOrder} />
                              <button className="btn-primary w-full text-sm">Save</button>
                            </form>
                          </details>
                          <form action={removeSponsor}>
                            <input type="hidden" name="id" value={s.id} />
                            <button className="w-full rounded-lg border border-hotpink/30 py-1.5 text-xs font-black uppercase text-hotpink hover:bg-hotpink/10 transition">Delete</button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {sponsors.length === 0 && <p className="paint-card rounded-xl p-8 text-paper/40 text-center">No sponsors yet.</p>}
            </div>
          </div>
        )}

        {/* ─── RECAP ─── */}
        {tab === "recap" && (
          <div>
            <details className="paint-card mb-6 rounded-xl p-5">
              <summary className="cursor-pointer font-black uppercase text-limeflash">+ Add Recap Item</summary>
              <form action={upsertRecapItem} className="mt-5 grid gap-3 sm:grid-cols-2">
                <select className="field" name="year" required>
                  <option value={2024}>Global Village 2024</option>
                  <option value={2025}>Global Village 2025</option>
                </select>
                <input className="field" name="title" placeholder="Title / Caption" />
                <select className="field" name="mediaType" required>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input className="field" name="mediaUrl" placeholder="Media URL (image or video)" required />
                <input className="field" name="sortOrder" type="number" placeholder="Sort Order" defaultValue={99} />
                <button className="btn-primary">Add Item</button>
              </form>
            </details>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recapItems.map((r) => (
                <div key={r.id} className="paint-card overflow-hidden rounded-xl">
                  {r.mediaType === "video"
                    ? <video src={r.mediaUrl} className="aspect-video w-full object-cover" />
                    : <img src={r.mediaUrl} alt={r.title} className="aspect-video w-full object-cover" />}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-sm">{r.title || "Untitled"}</p>
                      <span className="rounded bg-limeflash/20 px-2 py-0.5 text-xs font-black text-limeflash">GV{r.year}</span>
                    </div>
                    <details>
                      <summary className="cursor-pointer text-xs font-black uppercase text-paper/40 hover:text-limeflash transition">Edit</summary>
                      <form action={upsertRecapItem} className="mt-3 space-y-2">
                        <input type="hidden" name="id" value={r.id} />
                        <select className="field text-sm" name="year" defaultValue={r.year}>
                          <option value={2024}>GV 2024</option><option value={2025}>GV 2025</option>
                        </select>
                        <input className="field text-sm" name="title" defaultValue={r.title} />
                        <select className="field text-sm" name="mediaType" defaultValue={r.mediaType}>
                          <option value="image">Image</option><option value="video">Video</option>
                        </select>
                        <input className="field text-sm" name="mediaUrl" defaultValue={r.mediaUrl} />
                        <input className="field text-sm" name="sortOrder" type="number" defaultValue={r.sortOrder} />
                        <button className="btn-primary w-full text-sm">Save</button>
                      </form>
                    </details>
                    <form action={removeRecapItem}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="w-full rounded-lg border border-hotpink/30 py-1.5 text-xs font-black uppercase text-hotpink hover:bg-hotpink/10 transition">Delete</button>
                    </form>
                  </div>
                </div>
              ))}
              {recapItems.length === 0 && <p className="paint-card rounded-xl p-8 text-paper/40 text-center">No recap items yet.</p>}
            </div>
          </div>
        )}

        {/* ─── EVENT SETTINGS ─── */}
        {tab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <form action={upsertEventSettings} className="paint-card rounded-xl p-6 space-y-4">
              <h2 className="font-display text-3xl text-limeflash uppercase">Event Settings</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Event Name</label>
                  <input className="field" name="eventName" defaultValue={settings.eventName} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Event Date</label>
                  <input className="field" name="eventDate" type="date" defaultValue={settings.eventDate} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Event Time</label>
                  <input className="field" name="eventTime" type="time" defaultValue={settings.eventTime} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Location</label>
                  <input className="field" name="eventLocation" defaultValue={settings.eventLocation} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Ticket Price (EGP)</label>
                  <input className="field" name="ticketPrice" type="number" defaultValue={settings.ticketPrice} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Max Registrations <span className="text-paper/30 normal-case font-normal">(0 = unlimited)</span></label>
                  <input className="field" name="maxRegistrations" type="number" defaultValue={settings.maxRegistrations} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Registration Status</label>
                  <select className="field" name="registrationOpen" defaultValue={String(settings.registrationOpen)}>
                    <option value="true">Open</option>
                    <option value="false">Closed</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-black uppercase text-hotpink mb-3">Hero Content</p>
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Hero Event Name</label>
                    <input className="field" name="heroEventName" defaultValue={settings.hero.eventName} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Tagline</label>
                    <input className="field" name="heroTagline" defaultValue={settings.hero.tagline} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Date (Display)</label>
                    <input className="field" name="heroDate" defaultValue={settings.hero.date} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-paper/40 mb-1 block">Location (Display)</label>
                    <input className="field" name="heroLocation" defaultValue={settings.hero.location} />
                  </div>
                </div>
              </div>
              <button className="btn-primary w-full">Save Event Settings</button>
            </form>
          </div>
        )}

        {/* ─── FOOTER SETTINGS ─── */}
        {tab === "footer" && (
          <div className="max-w-2xl space-y-6">
            {/* Social Links */}
            <form action={upsertFooterSettings} className="paint-card rounded-xl p-6 space-y-4">
              <h2 className="font-display text-3xl text-limeflash uppercase">Social & Contact</h2>
              <div className="border-b border-white/10 pb-4">
                <p className="text-xs font-black uppercase text-hotpink mb-3">Social Media</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["instagram", "facebook", "tiktok", "youtube", "linkedin", "x"] as const).map((key) => (
                    <div key={key}>
                      <label className="text-xs font-black uppercase text-paper/40 mb-1 block capitalize">{key === "x" ? "X (Twitter)" : key}</label>
                      <input className="field text-sm" name={key} placeholder={`https://${key}.com/…`} defaultValue={settings.footer.socials[key] || ""} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-hotpink mb-3">Contact Info</p>
                <div className="space-y-3">
                  <input className="field" name="contactEmail" placeholder="Contact Email" defaultValue={settings.footer.contact.email || ""} />
                  <input className="field" name="contactPhone" placeholder="Contact Phone" defaultValue={settings.footer.contact.phone || ""} />
                  <input className="field" name="contactAddress" placeholder="Address" defaultValue={settings.footer.contact.address || ""} />
                </div>
              </div>
              <button className="btn-primary w-full">Save Social & Contact</button>
            </form>

            {/* Quick Links */}
            <div className="paint-card rounded-xl p-6">
              <h2 className="font-display text-3xl text-limeflash uppercase mb-4">Quick Links</h2>
              <div className="space-y-2 mb-4">
                {settings.footer.quickLinks.sort((a, b) => a.sortOrder - b.sortOrder).map((link) => (
                  <div key={link.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <span className="flex-1 text-sm font-bold">{link.label}</span>
                    <span className="text-xs text-paper/40">{link.href}</span>
                    <form action={removeQuickLink} className="inline">
                      <input type="hidden" name="id" value={link.id} />
                      <button className="text-hotpink text-xs font-black uppercase hover:underline">Remove</button>
                    </form>
                  </div>
                ))}
              </div>
              <form action={addQuickLink} className="flex gap-2">
                <input className="field flex-1" name="label" placeholder="Link Label" required />
                <input className="field flex-1" name="href" placeholder="/path or https://..." required />
                <button className="btn-primary shrink-0 text-sm">Add</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
