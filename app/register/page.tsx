import type { Metadata } from "next";
import { RegistrationWizard } from "@/components/registration/registration-wizard";
import { getEventSettings, getRegistrationCount } from "@/lib/storage";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage() {
  const [settings, count] = await Promise.all([getEventSettings(), getRegistrationCount()]);
  const capacityFull = settings.maxRegistrations > 0 && count >= settings.maxRegistrations;

  return (
    <main className="px-4 pb-24 pt-28">
      <div className="mx-auto mb-8 max-w-4xl">
        <p className="mb-2 font-black uppercase tracking-widest text-hotpink text-sm">Street Pass Intake</p>
        <h1 className="graffiti-title text-5xl leading-none sm:text-7xl">Register</h1>
      </div>
      <RegistrationWizard
        ticketPrice={settings.ticketPrice}
        registrationOpen={settings.registrationOpen}
        capacityFull={capacityFull}
      />
    </main>
  );
}
