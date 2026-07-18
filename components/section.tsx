"use client";

import { motion } from "framer-motion";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`relative overflow-hidden px-4 py-16 sm:py-24 ${className}`}>
      <div className="spray-fleck absolute -left-4 top-6 h-16 w-40 opacity-70 sm:top-10" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        {eyebrow && (
          <motion.p
            className="mb-3 font-black uppercase tracking-widest text-hotpink"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.div
          className="relative mb-10 inline-block"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.06 }}
        >
          <h2 className="graffiti-title max-w-4xl text-5xl leading-none sm:text-7xl">
            {title}
          </h2>
          <span
            aria-hidden="true"
            className="absolute -bottom-3 left-1 h-2.5 w-2/5 min-w-[90px] max-w-[220px] rotate-[-1.5deg] rounded-[40%_60%_55%_45%/60%_40%_60%_40%] bg-limeflash/85"
            style={{ filter: "url(#spray-roughen)" }}
          />
        </motion.div>
        {children}
      </div>
    </section>
  );
}
