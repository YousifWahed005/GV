import Link from "next/link";
import { Ticket, Crown, Zap } from "lucide-react";

const FEATURES = [
  "All country booths", "Live performances",
  "Street entertainment", "Interactive experiences",
  "Cultural food tastings", "Official event pass",
];

export function TicketCards({ price, registrationOpen, capacityFull }: {
  price: number;
  registrationOpen: boolean;
  capacityFull: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <article className="paint-card relative overflow-hidden rounded-2xl p-8 shadow-neon">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-limeflash/6 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-hotpink/6 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-limeflash/15 px-3 py-1 text-xs font-black uppercase text-limeflash">
                <Crown size={12} aria-hidden="true" /> Full Access
              </div>
              <h3 className="font-display text-6xl uppercase sm:text-7xl">Street Pass</h3>
            </div>
            <Ticket className="mt-1 shrink-0 text-limeflash" size={48} aria-hidden="true" />
          </div>

          <p className="text-base text-paper/62">
            Your all-access pass to every country booth, cultural show, street performance, and interactive experience at Global Village Street'26.
          </p>

          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-8xl text-limeflash" aria-label={`${price} Egyptian Pounds`}>{price}</span>
            <span className="mb-5 text-2xl font-black text-paper/65">EGP</span>
          </div>

          <ul className="mb-8 mt-3 grid gap-2 sm:grid-cols-2" aria-label="What's included">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm font-bold text-paper/72">
                <Zap size={13} className="shrink-0 text-limeflash" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>

          {capacityFull ? (
            <div className="btn-secondary w-full cursor-default border-hotpink/40 text-center text-lg text-hotpink" role="status">
              Registrations Closed
            </div>
          ) : registrationOpen ? (
            <Link href="/register" className="btn-primary block w-full text-center text-lg">
              Register Now
            </Link>
          ) : (
            <div className="btn-secondary w-full cursor-default text-center text-lg opacity-55">
              Registration Coming Soon
            </div>
          )}
          <p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-paper/28">
            Promo codes available at checkout
          </p>
        </div>
      </article>
    </div>
  );
}
