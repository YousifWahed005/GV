import type { Metadata, Viewport } from "next";
import { Sedgwick_Ave_Display } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { GraffitiBackdrop } from "@/components/graffiti-backdrop";

const graffitiFont = Sedgwick_Ave_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-graffiti",
});

export const metadata: Metadata = {
  title: {
    default: "Global Village Street'26",
    template: "%s | Global Village Street'26",
  },
  description: "One World. One Crew. One Vibe. Register for Global Village Street'26 — 11 August 2026, Suez, Egypt.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Global Village Street'26",
    description: "One World. One Crew. One Vibe.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${graffitiFont.variable}`}>
      <body>
        {/* Spray-paint edge filter, reused by .spray-border / .spray-underline for a hand-sprayed stencil edge */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
          <filter id="spray-roughen">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.09" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <GraffitiBackdrop />
        <Nav />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
