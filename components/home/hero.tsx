"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion, AnimatePresence, useScroll, useTransform,
  useMotionValue, useSpring, type Variants,
} from "framer-motion";
import { ArrowRight, Globe2, Calendar, PlayCircle, X, Zap, Crown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import type { RecapItem, HeroSettings } from "@/lib/types";

interface HeroProps {
  recapItems: RecapItem[];
  settings: HeroSettings;
  registrationOpen: boolean;
  capacity: { count: number; max: number };
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero({ recapItems, settings, registrationOpen, capacity }: HeroProps) {
  const [recapOpen, setRecapOpen]       = useState(false);
  const [activeYear, setActiveYear]     = useState<number | null>(null);
  const [floatingVisible, setFloating]  = useState(false);

  const { scrollY } = useScroll();
  const posterY      = useTransform(scrollY, [0, 600], [0, -40]);
  const posterRotate = useTransform(scrollY, [0, 600], [-2, 2]);

  // Mouse parallax on poster
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width  - 0.5) * 12);
    mouseY.set(((e.clientY - rect.top)  / rect.height - 0.5) * 12);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight;
      const pct   = window.scrollY / total;
      setFloating(pct > 0.08 && pct < 0.72);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const years       = [...new Set(recapItems.map((r) => r.year))].sort();
  const currentYear = activeYear ?? years[years.length - 1] ?? 2024;
  const yearItems   = recapItems.filter((r) => r.year === currentYear);
  const capacityFull = capacity.max > 0 && capacity.count >= capacity.max;

  return (
    <>
      <section
        className="noise relative min-h-screen overflow-hidden px-4 pt-24"
        aria-label="Hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-spray-grid opacity-50" aria-hidden="true" />
        <div className="halftone absolute inset-0 opacity-[0.10]" aria-hidden="true" />

        {/* Animated radial glows */}
        <motion.div aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(204,255,0,0.06) 0%, transparent 70%)" }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,0,170,0.05) 0%, transparent 70%)" }}
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Decorative — minimal, very slow */}
        <motion.div aria-hidden="true"
          className="pointer-events-none absolute left-5 top-36 hidden text-hotpink/[0.13] lg:block"
          animate={{ rotate: [0, 10, -7, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
          <Crown size={68} />
        </motion.div>
        <motion.div aria-hidden="true"
          className="pointer-events-none absolute right-7 top-48 hidden text-limeflash/[0.12] lg:block"
          animate={{ rotate: [0, -12, 8, 0], y: [0, 8, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <Zap size={52} />
        </motion.div>
        <motion.div aria-hidden="true"
          className="pointer-events-none absolute bottom-1/3 right-[18%] hidden text-hotpink/[0.10] lg:block"
          animate={{ rotate: [0, 6, -5, 0], scale: [1, 1.06, 0.96, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <span className="font-display text-5xl font-black">✕</span>
        </motion.div>

        {/* Main grid */}
        <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-12 pb-20 lg:grid-cols-2">

          {/* LEFT */}
          <div className="flex flex-col">
            {/* Badges */}
            <motion.div custom={0} initial="hidden" animate="show" variants={fadeUp}
              className="mb-5 flex flex-wrap gap-2"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-limeflash/40 bg-limeflash/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-limeflash">
                <Globe2 size={13} aria-hidden="true" /> {settings.location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hotpink/40 bg-hotpink/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-hotpink">
                <Calendar size={13} aria-hidden="true" /> {settings.date}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 custom={1} initial="hidden" animate="show" variants={fadeUp}
              className="graffiti-title text-[clamp(3.8rem,9.5vw,7rem)] leading-[0.85]"
            >
              {settings.eventName.split(" ").slice(0, 2).join(" ")}
              <span className="block text-limeflash">
                {settings.eventName.split(" ").slice(2).join(" ")}
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p custom={2} initial="hidden" animate="show" variants={fadeUp}
              className="mt-6 max-w-md text-xl font-black uppercase leading-snug tracking-wide text-paper sm:text-2xl"
            >
              {settings.tagline.split(".").map((part, i, arr) => {
                const t = part.trim();
                if (!t) return null;
                return (
                  <span key={i}>
                    <span className={i === 1 ? "text-limeflash" : i === 2 ? "text-hotpink" : "text-paper"}>{t}</span>
                    {i < arr.length - 2 && <span className="text-paper/30">. </span>}
                  </span>
                );
              })}
            </motion.p>

            {/* CTAs */}
            <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              {capacityFull ? (
                <div className="btn-secondary cursor-default border-hotpink/40 text-hotpink" role="status">
                  Registrations Closed
                </div>
              ) : registrationOpen ? (
                <Link href="/register" className="btn-primary group relative overflow-hidden"
                  aria-label="Register for Global Village Street 26"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Your Street Pass
                    <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" aria-hidden="true" />
                </Link>
              ) : (
                <div className="btn-secondary cursor-default opacity-50">Registration Coming Soon</div>
              )}

              <Link href="#countries" className="btn-secondary hover:border-limeflash/40 hover:text-limeflash hover:shadow-glow-sm transition-all duration-300">
                Explore Countries
              </Link>

              {years.length > 0 && (
                <button
                  onClick={() => { setRecapOpen(true); setActiveYear(years[years.length - 1]); }}
                  className="btn-secondary flex items-center gap-2 border-hotpink/40 text-hotpink hover:bg-hotpink/10 hover:shadow-pink transition-all duration-300"
                  aria-label="Watch GV24 and GV25 recap"
                >
                  <PlayCircle size={17} aria-hidden="true" /> GV24 &amp; GV25 Recap
                </button>
              )}
            </motion.div>
          </div>

          {/* RIGHT — Poster */}
          <motion.div
            style={{ y: posterY, rotate: posterRotate, x: springX, rotateY: springY }}
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            initial={{ opacity: 0, scale: 0.9, rotate: 4 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glow behind poster */}
            <motion.div aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-3xl"
              style={{ background: "radial-gradient(ellipse, rgba(204,255,0,0.10) 0%, transparent 70%)" }}
              animate={{ opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ACCESS GRANTED sticker */}
            <motion.div aria-hidden="true"
              className="absolute -right-3 -top-3 z-20 rotate-6 rounded-full bg-limeflash px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-ink shadow-neon"
              animate={{ rotate: [6, 10, 4, 6] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              Access Granted ✓
            </motion.div>

            {/* Floating poster */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="spray-border">
                <div className="relative overflow-hidden rounded-2xl shadow-neon">
                  <Image
                    src="/assets/hero/access-granted-poster.jpg"
                    alt="Global Village Street'26 — Access Granted? event poster featuring the Street Pass lanyard and graffiti artwork"
                    width={640}
                    height={800}
                    priority
                    className="block h-auto w-full object-cover"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 500px"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-limeflash/20" aria-hidden="true" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Floating CTA */}
      <AnimatePresence>
        {floatingVisible && registrationOpen && !capacityFull && (
          <motion.div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/register" className="btn-primary shadow-neon">
              <Crown size={15} aria-hidden="true" /> Get Your Street Pass
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recap Modal */}
      <AnimatePresence>
        {recapOpen && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-label="GV Recap Gallery"
          >
            <motion.div className="absolute inset-0 bg-ink/92 backdrop-blur-xl" onClick={() => setRecapOpen(false)} />
            <motion.div className="paint-card relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl shadow-neon"
              initial={{ scale: 0.93, y: 28 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 28 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-hotpink">Previous Editions</p>
                  <h2 className="graffiti-title text-4xl sm:text-5xl">GV Recap</h2>
                </div>
                <button onClick={() => setRecapOpen(false)} className="icon-btn" aria-label="Close recap modal">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="flex shrink-0 gap-2 border-b border-white/10 px-5 pb-0 pt-3">
                {years.length === 0 ? (
                  <p className="pb-4 text-sm text-paper/40">No recap content yet — check back soon!</p>
                ) : years.map((year) => (
                  <button key={year} onClick={() => setActiveYear(year)}
                    className={`rounded-t-lg px-5 py-2 text-sm font-black uppercase transition-all duration-200 ${currentYear === year ? "bg-limeflash text-ink" : "bg-white/5 text-paper/60 hover:bg-white/10"}`}
                    aria-pressed={currentYear === year}
                  >
                    GV {year}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto p-5">
                {yearItems.length === 0 ? (
                  <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-white/20">
                    <p className="text-paper/40">No content for {currentYear} yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {yearItems.map((item) => (
                      <motion.div key={item.id} className="group overflow-hidden rounded-xl border border-white/10"
                        whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                      >
                        {item.mediaType === "video"
                          ? <video src={item.mediaUrl} controls className="aspect-video w-full object-cover" aria-label={item.title || `GV ${item.year} video`} />
                          : <img src={item.mediaUrl} alt={item.title || `Global Village ${item.year} recap`} className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                        }
                        {item.title && <div className="p-3"><p className="text-sm font-bold text-paper/80">{item.title}</p></div>}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
