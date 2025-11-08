export const colors = {
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
};

export const radii = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  pill: "9999px"
};

export const typography = {
  fontFamily: {
    display: "'Inter Variable', system-ui, sans-serif",
    body: "'Inter Variable', system-ui, sans-serif"
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem"
  }
};

export const shadows = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.12)",
  md: "0 4px 10px rgba(15, 23, 42, 0.12)",
  lg: "0 12px 32px rgba(15, 23, 42, 0.16)"
};

export const tokens = {
  colors,
  radii,
  typography,
  shadows
};

export type DesignTokens = typeof tokens;
