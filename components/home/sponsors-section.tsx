import Link from "next/link";
import type { Sponsor, SponsorTier } from "@/lib/types";

const TIER_CONFIG: Record<SponsorTier, {
  label: string;
  borderColor: string;
  accentColor: string;
  bgColor: string;
  imgH: string;
  cardH: string;
  cols: string;
}> = {
  Platinum: {
    label: "Platinum",
    borderColor: "border-limeflash/50",
    accentColor: "text-limeflash",
    bgColor: "bg-limeflash/8",
    imgH: "h-16",
    cardH: "h-28",
    cols: "sm:grid-cols-2 lg:grid-cols-3",
  },
  Gold: {
    label: "Gold",
    borderColor: "border-hotpink/40",
    accentColor: "text-hotpink",
    bgColor: "bg-hotpink/6",
    imgH: "h-10",
    cardH: "h-20",
    cols: "sm:grid-cols-3 lg:grid-cols-4",
  },
  Silver: {
    label: "Silver",
    borderColor: "border-white/20",
    accentColor: "text-paper/50",
    bgColor: "bg-white/4",
    imgH: "h-7",
    cardH: "h-14",
    cols: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
  },
};

function Divider({ tier }: { tier: SponsorTier }) {
  const cfg = TIER_CONFIG[tier];
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
      <span className={`rounded-full border px-5 py-1.5 text-xs font-black uppercase tracking-widest ${cfg.borderColor} ${cfg.accentColor} ${cfg.bgColor}`}>
        {cfg.label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
    </div>
  );
}

function SponsorCard({ sponsor, tier }: { sponsor: Sponsor; tier: SponsorTier }) {
  const cfg = TIER_CONFIG[tier];
  const inner = (
    <div className={`paint-card flex items-center justify-center rounded-xl border px-4 py-2 transition-all duration-300 hover:shadow-neon ${cfg.cardH} ${cfg.borderColor} hover:border-limeflash/50`}>
      {sponsor.logo ? (
        <img src={sponsor.logo} alt={`${sponsor.name} logo`} className={`${cfg.imgH} w-auto object-contain`} loading="lazy" />
      ) : (
        <span className={`font-display font-black uppercase tracking-wider ${cfg.accentColor} ${tier === "Platinum" ? "text-2xl" : tier === "Gold" ? "text-xl" : "text-sm"}`}>
          {sponsor.name}
        </span>
      )}
    </div>
  );
  return sponsor.websiteUrl
    ? <Link href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${sponsor.name}`}>{inner}</Link>
    : inner;
}

export function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  const active = sponsors.filter((s) => s.active);
  if (active.length === 0) return null;

  const platinum = active.filter((s) => s.tier === "Platinum");
  const gold     = active.filter((s) => s.tier === "Gold");
  const silver   = active.filter((s) => s.tier === "Silver");

  return (
    <div className="space-y-12">
      {platinum.length > 0 && (
        <div className="space-y-6">
          <Divider tier="Platinum" />
          <div className={`grid gap-5 ${TIER_CONFIG.Platinum.cols}`}>
            {platinum.map((s) => <SponsorCard key={s.id} sponsor={s} tier="Platinum" />)}
          </div>
        </div>
      )}
      {gold.length > 0 && (
        <div className="space-y-6">
          <Divider tier="Gold" />
          <div className={`grid gap-4 ${TIER_CONFIG.Gold.cols}`}>
            {gold.map((s) => <SponsorCard key={s.id} sponsor={s} tier="Gold" />)}
          </div>
        </div>
      )}
      {silver.length > 0 && (
        <div className="space-y-6">
          <Divider tier="Silver" />
          <div className={`grid gap-3 ${TIER_CONFIG.Silver.cols}`}>
            {silver.map((s) => <SponsorCard key={s.id} sponsor={s} tier="Silver" />)}
          </div>
        </div>
      )}
    </div>
  );
}
