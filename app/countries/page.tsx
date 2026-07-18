import type { Metadata } from "next";
import { Section } from "@/components/section";
import { CountryGrid } from "@/components/home/country-grid";
import { listCountries } from "@/lib/storage";
export const metadata: Metadata = { title: "Countries" };
export default async function CountriesPage() {
  const countries = await listCountries();
  return <main className="pt-20"><Section eyebrow="Global Booths" title="Countries"><CountryGrid countries={countries} /></Section></main>;
}
