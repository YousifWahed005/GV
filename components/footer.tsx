import Link from "next/link";
import { Ticket, Instagram, Twitter, Facebook, Youtube, Linkedin, Music2, Mail, Phone, MapPin } from "lucide-react";
import type { FooterSettings } from "@/lib/types";

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook:  Facebook,
  x:         Twitter,
  youtube:   Youtube,
  linkedin:  Linkedin,
  tiktok:    Music2,
} as const;

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", x: "X / Twitter",
  youtube: "YouTube", linkedin: "LinkedIn", tiktok: "TikTok",
};

export function Footer({ settings }: { settings: FooterSettings }) {
  const { socials, contact, quickLinks } = settings;
  const activeSocials = (Object.entries(socials) as [keyof typeof SOCIAL_ICONS, string | undefined][]).filter(([, v]) => v);
  const sortedLinks   = [...quickLinks].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasContact    = contact.email || contact.phone || contact.address;

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 px-4 pb-6 pt-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-limeflash/4 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-hotpink/4 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-4 mb-14">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 font-display text-xl text-limeflash" aria-label="Home">
              <Ticket size={20} aria-hidden="true" /> STREET'26
            </Link>
            <p className="mt-2 text-sm leading-7 text-paper/50">
              Global Village Street'26 — One World. One Crew. One Vibe.
            </p>
            <p className="mt-3 text-sm font-bold text-hotpink">11 August 2026 · Suez, Egypt</p>
          </div>

          {/* Quick Links */}
          {sortedLinks.length > 0 && (
            <nav aria-label="Footer quick links">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-paper/35">Quick Links</h3>
              <ul className="space-y-2">
                {sortedLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-sm text-paper/60 transition hover:text-limeflash">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Social */}
          {activeSocials.length > 0 && (
            <nav aria-label="Social media links">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-paper/35">Follow Us</h3>
              <div className="flex flex-col gap-2.5">
                {activeSocials.map(([key, href]) => {
                  const Icon = SOCIAL_ICONS[key];
                  if (!Icon) return null;
                  return (
                    <Link key={key} href={href as string} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-paper/60 transition hover:text-limeflash"
                      aria-label={SOCIAL_LABELS[key] ?? key}
                    >
                      <Icon size={15} aria-hidden="true" />
                      <span>{SOCIAL_LABELS[key] ?? key}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}

          {/* Contact */}
          {hasContact && (
            <address className="not-italic">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-paper/35">Contact</h3>
              <ul className="space-y-3">
                {contact.email && (
                  <li className="flex items-start gap-2 text-sm text-paper/60">
                    <Mail size={14} className="mt-0.5 shrink-0 text-hotpink" aria-hidden="true" />
                    <a href={`mailto:${contact.email}`} className="hover:text-limeflash transition break-all">{contact.email}</a>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex items-start gap-2 text-sm text-paper/60">
                    <Phone size={14} className="mt-0.5 shrink-0 text-hotpink" aria-hidden="true" />
                    <a href={`tel:${contact.phone}`} className="hover:text-limeflash transition">{contact.phone}</a>
                  </li>
                )}
                {contact.address && (
                  <li className="flex items-start gap-2 text-sm text-paper/60">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-hotpink" aria-hidden="true" />
                    <span>{contact.address}</span>
                  </li>
                )}
              </ul>
            </address>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:flex-row">
          <p className="text-xs text-paper/30">© 2026 Global Village Street'26. All rights reserved.</p>
          <p className="text-xs font-bold text-paper/30">
            Website Developed &amp; Designed by{" "}
            <span className="text-limeflash">Mohammed Tamer</span>
            <span className="text-paper/20"> · </span>
            Maintained by <span className="text-hotpink">Pascal</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
