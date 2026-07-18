import type { Metadata } from "next";
import { Section } from "@/components/section";
import { ShowCards } from "@/components/home/show-cards";
export const metadata: Metadata = { title: "Shows" };
export default function ShowsPage() {
  return <main className="pt-20"><Section eyebrow="Stage Schedule" title="Cultural Shows"><ShowCards /></Section></main>;
}
