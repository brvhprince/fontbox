import type { Config } from "tailwindcss";
import { fontboxPreset } from "@fontbox/config/tailwind";

const config: Config = {
  presets: [fontboxPreset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        library: "repeat(auto-fill, minmax(220px, 1fr))"
      }
    }
  },
  plugins: []
};

export default config;
