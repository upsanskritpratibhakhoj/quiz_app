export const COLORS = {
  // Core theme colors from SKILL.md
  primary: "#a5ed6e",       // vibrant lime-green
  primaryDark: "#78ca28",   // darker green for 3D button border shadow
  onPrimary: "#111111",     // near-black for text on primary
  
  background: "#ddf4ff",    // pale sky-blue main background
  backgroundDark: "#b8e2fc", // slightly darker blue for borders/accents
  
  text: "#3c3c3c",          // charcoal default body text
  textMuted: "#777777",     // mid-gray secondary info/hints
  
  accent: "#1cb0f6",        // bright cyan-blue for state changes/interactive highlights
  accentDark: "#1899d6",    // darker blue for 3D accent shadow
  
  // Neutral variations for inputs, cards, borders
  white: "#ffffff",
  whiteDark: "#e5e5e5",     // light gray for secondary button top
  border: "#e5e5e5",        // default card border
  borderDark: "#afafaf",    // 3D bottom border shadow for cards/secondary buttons
  
  // Other design system colors
  error: "#ff4b4b",         // vibrant red
  errorDark: "#ea2b2b",     // darker red for 3D shadow
  warning: "#ffc800",       // vibrant orange/yellow
  warningDark: "#e6a100",   // darker orange/yellow
};

export const TYPOGRAPHY = {
  display: {
    fontFamily: "System", // fallback since we use system font
    fontSize: 24,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
  },
  heading: {
    fontFamily: "System",
    fontSize: 18,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
  },
  body: {
    fontFamily: "System",
    fontSize: 15,
    fontWeight: "700" as const, // Bold by default for mobile scannability per design system
  },
  bodyRegular: {
    fontFamily: "System",
    fontSize: 15,
    fontWeight: "500" as const,
  },
};

export const SPACING = {
  base: 10,
  sm: 10,
  md: 20,
  lg: 30,
  xl: 40,
  xxl: 50,
};

export const RADII = {
  sm: 2,
  md: 12,
  lg: 16,
};
