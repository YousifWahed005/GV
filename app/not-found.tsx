import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "404 — Page Not Found" };

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-spray-grid opacity-40" aria-hidden="true" />
      <div className="halftone pointer-events-none absolute inset-0 opacity-10" aria-hidden="true" />
      <div className="relative z-10">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-hotpink">404</p>
        <h1 className="graffiti-title mb-4 text-[clamp(5rem,18vw,10rem)] text-limeflash leading-none">404</h1>
        <p className="mb-2 text-2xl font-black uppercase text-paper sm:text-3xl">
          Looks like you're lost between countries.
        </p>
        <p className="mb-10 text-base text-paper/45">This page doesn't exist in our village.</p>
        <Link href="/" className="btn-primary text-base">Return To Street'26</Link>
      </div>
    </main>
  );
}
