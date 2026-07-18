import { Section }          from "@/components/section";
import { Hero }             from "@/components/home/hero";
import { CountryGrid }      from "@/components/home/country-grid";
import { ShowCards }        from "@/components/home/show-cards";
import { TicketCards }      from "@/components/home/ticket-cards";
import { SponsorsSection }  from "@/components/home/sponsors-section";
import { Footer }           from "@/components/footer";
import {
  listCountries, listActiveSponsors, listRecapItems,
  getEventSettings, getRegistrationCount,
} from "@/lib/storage";

export default async function Home() {
  const [countries, sponsors, recapItems, settings, count] = await Promise.all([
    listCountries(),
    listActiveSponsors(),
    listRecapItems(),
    getEventSettings(),
    getRegistrationCount(),
  ]);

  const capacityFull = settings.maxRegistrations > 0 && count >= settings.maxRegistrations;
  const hasSponsors  = sponsors.length > 0;

  return (
    <main>
      <Hero
        recapItems={recapItems}
        settings={settings.hero}
        registrationOpen={settings.registrationOpen}
        capacity={{ count, max: settings.maxRegistrations }}
      />

      <Section id="countries" eyebrow="Global Cultures" title="Countries On The Block">
        <CountryGrid countries={countries} />
      </Section>

      <Section id="shows" eyebrow="Live Energy" title="Culture Meets Street">
        <ShowCards />
      </Section>

      <Section id="tickets" eyebrow="Passes" title="Choose Your Ticket">
        <TicketCards
          price={settings.ticketPrice}
          registrationOpen={settings.registrationOpen}
          capacityFull={capacityFull}
        />
      </Section>

      {hasSponsors && (
        <Section id="sponsors" eyebrow="Our Partners" title="Sponsors">
          <SponsorsSection sponsors={sponsors} />
        </Section>
      )}

      <Footer settings={settings.footer} />
    </main>
  );
}
