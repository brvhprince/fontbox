import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";

export const fontboxPreset: Config = {
  content: [],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1d4ed8",
          foreground: "#f8fafc",
          emphasis: "#1e40af",
          subtle: "#dbeafe"
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f5f5f5",
          inverted: "#111827"
        },
        success: colors.emerald,
        warning: colors.amber,
        danger: colors.rose
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono]
      },
      keyframes: {
        "overlay-show": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "content-show": {
          from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" }
        }
      },
      animation: {
        "overlay-show": "overlay-show 150ms ease",
        "content-show": "content-show 150ms ease"
      }
    }
  }
};

export default fontboxPreset;
