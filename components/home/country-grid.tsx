"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Utensils, Music2, MapPin, Lightbulb, BookOpen, History, ChevronLeft, ChevronRight } from "lucide-react";
import type { Country } from "@/lib/types";

function FlagRibbon({ code, name }: { code: string; name: string }) {
  return (
    <div className="absolute left-0 top-4 z-10 overflow-hidden rounded-r-md shadow-lg">
      <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
        alt={`${name} flag`}
        width={40}
        height={27}
        className="block h-auto"
        loading="lazy"
      />
    </div>
  );
}

function HostCard() {
  return (
    <motion.div
      className="paint-card overflow-hidden rounded-2xl border border-limeflash/20 sm:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-56 overflow-hidden sm:h-72">
        <img
          src="https://images.unsplash.com/photo-1539768942893-daf4b48cb5e4?auto=format&fit=crop&w=1200&q=80"
          alt="Suez Canal, Egypt — event host city"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/50 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-limeflash px-3 py-1 text-xs font-black uppercase text-ink">
          🏠 Host Country
        </span>

        <div className="absolute bottom-4 left-4 flex items-end gap-3">
          <img
            src="https://flagcdn.com/w80/eg.png"
            alt="Egypt flag"
            width={48}
            className="rounded-sm shadow-neon"
            loading="lazy"
          />
          <div>
            <h3 className="graffiti-title text-5xl sm:text-6xl">Egypt</h3>
            <p className="mt-1 text-sm font-bold text-limeflash">📍 Suez · Event Venue</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <p className="text-sm leading-6 text-paper/70">
          The land of pharaohs, pyramids, and the Suez Canal — one of the most strategically important waterways in the world. Egypt bridges Africa and Asia with over 7,000 years of continuous civilization.
        </p>
        <div className="space-y-2">
          <div className="rounded-xl border border-limeflash/20 bg-limeflash/10 px-4 py-2.5">
            <p className="text-xs font-black uppercase text-limeflash">Event Location</p>
            <p className="font-bold">Suez, Egypt</p>
          </div>
          <div className="rounded-xl border border-hotpink/20 bg-hotpink/10 px-4 py-2.5">
            <p className="text-xs font-black uppercase text-hotpink">Event Date</p>
            <p className="font-bold">11 August 2026</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CountryGrid({ countries }: { countries: Country[] }) {
  const [selected,     setSelected]     = useState<Country | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const gallery = selected?.gallery?.filter(Boolean) ?? [];

  function openCountry(c: Country) { setSelected(c); setGalleryIndex(0); }
  function closeModal()             { setSelected(null); }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
        <HostCard />
        {countries.map((country, i) => (
          <motion.article key={country.id}
            className="paint-card group relative cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => openCountry(country)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ y: -6 }}
            tabIndex={0}
            role="button"
            aria-label={`Explore ${country.name}`}
            onKeyDown={(e) => e.key === "Enter" && openCountry(country)}
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src={country.image}
                alt={`${country.name} cultural destination`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-108"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent transition duration-300 group-hover:from-ink/85" />
              {/* Neon glow ring on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 ring-2 ring-inset ring-limeflash/30 transition duration-300 group-hover:opacity-100" aria-hidden="true" />
              <FlagRibbon code={country.flagCode} name={country.name} />
              <h3 className="graffiti-title absolute bottom-3 left-4 text-3xl drop-shadow-lg">{country.name}</h3>
            </div>
            <div className="space-y-2.5 p-4">
              <p className="line-clamp-2 text-sm leading-5 text-paper/65">{country.about}</p>
              <p className="flex items-center gap-2 text-xs font-bold text-limeflash"><Music2 size={13} aria-hidden="true" />{country.dance}</p>
              <p className="flex items-center gap-2 text-xs font-bold text-hotpink"><Utensils size={13} aria-hidden="true" />{country.food}</p>
              <p className="text-xs font-bold uppercase text-paper/25">Tap to explore →</p>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Country detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="dialog" aria-modal="true" aria-label={`${selected.name} details`}
          >
            <motion.div className="absolute inset-0 bg-ink/93 backdrop-blur-xl" onClick={closeModal} />
            <motion.div
              className="paint-card relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-neon"
              initial={{ scale: 0.93, y: 28 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 28 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
            >
              {/* Cover */}
              <div className="relative h-52 shrink-0 overflow-hidden sm:h-60">
                <img src={selected.image} alt={selected.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <button onClick={closeModal} className="icon-btn absolute right-4 top-4 bg-ink/70" aria-label="Close">
                  <X size={17} aria-hidden="true" />
                </button>
                <div className="absolute bottom-4 left-4 flex items-end gap-3">
                  <img
                    src={`https://flagcdn.com/w80/${selected.flagCode}.png`}
                    alt={`${selected.name} flag`}
                    width={48}
                    className="rounded-md border border-white/20 shadow-neon"
                    loading="lazy"
                  />
                  <h2 className="graffiti-title text-5xl sm:text-6xl">{selected.name}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-5 space-y-5">
                <InfoRow icon={<BookOpen size={13} />} label="About" color="hotpink">
                  <p className="text-sm leading-7 text-paper/78">{selected.about}</p>
                </InfoRow>
                <InfoRow icon={<History size={13} />} label="History" color="limeflash">
                  <p className="text-sm leading-7 text-paper/78">{selected.history}</p>
                </InfoRow>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBox icon={<Utensils size={13} />} label="Traditional Food" color="hotpink" value={selected.food} />
                  <InfoBox icon={<Music2 size={13} />}   label="Traditional Dance" color="limeflash" value={selected.dance} />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-paper/50"><MapPin size={13} />Famous Landmarks</p>
                  <p className="text-sm text-paper/78">{selected.landmarks}</p>
                </div>
                <div className="rounded-xl border border-limeflash/30 bg-limeflash/10 p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-limeflash"><Lightbulb size={13} />Fun Fact</p>
                  <p className="text-sm font-bold text-paper/90">{selected.funFact}</p>
                </div>

                {/* Gallery */}
                {gallery.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-black uppercase text-paper/40">Gallery</p>
                    <div className="relative">
                      <img src={gallery[galleryIndex]} alt={`${selected.name} gallery ${galleryIndex + 1}`}
                        className="w-full rounded-xl object-cover" style={{ aspectRatio: "16/9" }} loading="lazy"
                      />
                      {gallery.length > 1 && (
                        <>
                          <button onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                            className="icon-btn absolute left-2 top-1/2 -translate-y-1/2 bg-ink/70" aria-label="Previous image">
                            <ChevronLeft size={17} aria-hidden="true" />
                          </button>
                          <button onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                            className="icon-btn absolute right-2 top-1/2 -translate-y-1/2 bg-ink/70" aria-label="Next image">
                            <ChevronRight size={17} aria-hidden="true" />
                          </button>
                          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                            {gallery.map((_, i) => (
                              <button key={i} onClick={() => setGalleryIndex(i)} aria-label={`Image ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all ${i === galleryIndex ? "w-5 bg-limeflash" : "w-1.5 bg-white/40"}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
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

// ── Sub-components ────────────────────────────────────────────────────────────
function InfoRow({ icon, label, color, children }: { icon: React.ReactNode; label: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={`mb-1.5 flex items-center gap-2 text-xs font-black uppercase text-${color}`}>{icon}{label}</p>
      {children}
    </div>
  );
}

function InfoBox({ icon, label, color, value }: { icon: React.ReactNode; label: string; color: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className={`mb-2 flex items-center gap-2 text-xs font-black uppercase text-${color}`}>{icon}{label}</p>
      <p className="text-sm text-paper/78">{value}</p>
    </div>
  );
}
