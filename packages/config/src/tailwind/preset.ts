const fontboxTailwindPreset = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4338CA",
          foreground: "#F9FAFB",
          emphasis: "#312E81"
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827"
        }
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem"
      },
      fontFamily: {
        display: ["'Inter Variable'", "system-ui", "sans-serif"],
        body: ["'Inter Variable'", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default fontboxTailwindPreset;
export { fontboxTailwindPreset };
