"use client";

import { Mic2, Radio, Sparkles, UsersRound, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const SHOWS: { title: string; description: string; Icon: LucideIcon }[] = [
  { title: "Traditional Dances",      Icon: UsersRound, description: "Country crews bring heritage moves into a street-stage format." },
  { title: "Cultural Performances",   Icon: Mic2,       description: "Fast sets, bright costumes, live hosting, and crowd-forward storytelling." },
  { title: "Street Entertainment",    Icon: Radio,      description: "Roaming performers, rhythm circles, freestyle moments, and hype hosts." },
  { title: "Interactive Experiences", Icon: Sparkles,   description: "Hands-on booths where guests taste, try, dance, and make memories." },
];

export function ShowCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {SHOWS.map(({ title, Icon, description }, i) => (
        <motion.article key={title}
          className="paint-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          whileHover={{ y: -6, boxShadow: "0 0 32px rgba(255,0,170,.30)" }}
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-hotpink text-paper">
            <Icon size={22} aria-hidden="true" />
          </div>
          <h3 className="mb-3 font-display text-2xl uppercase text-limeflash">{title}</h3>
          <p className="text-sm leading-6 text-paper/65">{description}</p>
        </motion.article>
      ))}
    </div>
  );
}
