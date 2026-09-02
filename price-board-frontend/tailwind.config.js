/** @type {import('tailwindcss').Config} */

// Palette: warm wood background + red wine + wood cards + silver/copper
// metal accents.
// Every semantic token has a "-dark" sibling; components pair them as
// `bg-card dark:bg-card-dark`. NativeWind toggles the `dark` class from
// the theme preference (see src/theme/ThemeContext.tsx).
// IMPORTANT: keep these values in sync with src/theme/colors.ts.
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#EFE3D0",
        "background-dark": "#241B14",

        card: "#FBF6EC",
        // Lighter than background-dark on purpose: elevated surfaces read as
        // "lighter than the page" in dark UIs, not darker - #332619 was too
        // close in luminance to background-dark (#241B14) to separate from
        // the wood texture. See Card.tsx for the paired metal-silver border.
        "card-dark": "#4A3B30",

        primary: "#6E1423",
        "primary-light": "#8C1D2E",
        "primary-dark": "#9A2E3F",

        accent: "#B08D57",
        "accent-dark": "#C9A876",
        "accent-soft": "#D8C39A",
        "accent-soft-dark": "#4A392A",

        "metal-silver": "#B7BCC2",
        "metal-copper": "#B87333",

        muted: "#7E6553",
        "muted-dark": "#BEAD9B",

        // Solid coffee brown for "selected" pills (SegmentedControl, filter
        // button) in light mode - deliberately not wine (primary), a real
        // coffee-bean tone instead. Light-mode-only, so no "-dark" sibling
        // and not mirrored in colors.ts (nothing reads it via a color prop).
        coffee: "#4E342E",

        border: "#D9C6A8",
        "border-dark": "#4A392A",

        danger: "#A32638",
        "danger-dark": "#C7495A",

        success: "#16A34A",
        "success-dark": "#4ADE80",
      },
    },
  },
  plugins: [],
};
