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
        "card-dark": "#332619",

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

        border: "#D9C6A8",
        "border-dark": "#4A392A",

        danger: "#A32638",
        "danger-dark": "#C7495A",
      },
    },
  },
  plugins: [],
};
