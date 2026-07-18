import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        limeflash: "#CCFF00",
        hotpink:   "#FF00AA",
        ink:       "#111111",
        deepteal:  "#003333",
        paper:     "#F8F8F8",
      },
      fontFamily: {
        display: ["var(--font-graffiti)", "Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
        sans:    ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 36px rgba(204,255,0,.32), 0 0 72px rgba(255,0,170,.18)",
        pink: "0 0 32px rgba(255,0,170,.38)",
      },
    },
  },
  plugins: [],
};

export default config;
