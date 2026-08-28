/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FBF0EE",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#3E2723",
          light: "#5D4037",
        },
        accent: {
          DEFAULT: "#6B8E23",
          light: "#DCEDC8",
        },
        muted: "#8D6E63",
        border: "#E8D9D6",
        danger: "#C0392B",
      },
    },
  },
  plugins: [],
};
