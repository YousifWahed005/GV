import type { Metadata } from "next";
import { Section } from "@/components/section";
import { TicketCards } from "@/components/home/ticket-cards";
import { getEventSettings, getRegistrationCount } from "@/lib/storage";
export const metadata: Metadata = { title: "Tickets" };
export default async function TicketsPage() {
  const [settings, count] = await Promise.all([getEventSettings(), getRegistrationCount()]);
  const capacityFull = settings.maxRegistrations > 0 && count >= settings.maxRegistrations;
  return (
    <main className="pt-20">
      <Section eyebrow="Street Pass" title="Tickets">
        <TicketCards price={settings.ticketPrice} registrationOpen={settings.registrationOpen} capacityFull={capacityFull} />
      </Section>
    </main>
  );
}
