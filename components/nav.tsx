"use client";

import Link from "next/link";
import { Ticket, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home",       href: "/" },
  { label: "Countries",  href: "/#countries" },
  { label: "Shows",      href: "/#shows" },
  { label: "Tickets",    href: "/#tickets" },
  { label: "Sponsors",   href: "/#sponsors" },
  { label: "Register",   href: "/register" },
  { label: "Track",      href: "/track" },
] as const;

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/10 bg-ink/90 backdrop-blur-2xl" : "bg-transparent"
        }`}
        role="banner"
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2 font-display text-xl text-limeflash" aria-label="Global Village Street 26 home">
            <Ticket size={20} aria-hidden="true" />
            <span>STREET'26</span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-0.5 md:flex" role="list">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
              return (
                <Link key={href} href={href} role="listitem"
                  className={`relative rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200 hover:text-limeflash ${isActive ? "text-limeflash" : "text-paper/70"}`}
                >
                  {label}
                  {isActive && (
                    <motion.span layoutId="nav-indicator"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-limeflash"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <Link href="/register" className="btn-primary hidden text-sm md:inline-flex" aria-label="Get your Street Pass">
            Get Pass
          </Link>

          <button
            className="icon-btn md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-ink/97 backdrop-blur-2xl pt-20 px-6 pb-8 md:hidden"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="navigation" aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }, i) => {
                const isActive = pathname === href;
                return (
                  <motion.div key={href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link href={href}
                      className={`block rounded-xl px-4 py-4 text-lg font-black uppercase tracking-wide transition ${isActive ? "bg-limeflash/10 text-limeflash" : "text-paper/80 hover:bg-white/8 hover:text-limeflash"}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-auto pt-8">
              <Link href="/register" className="btn-primary w-full text-base" onClick={() => setMobileOpen(false)}>
                Get Your Street Pass
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
