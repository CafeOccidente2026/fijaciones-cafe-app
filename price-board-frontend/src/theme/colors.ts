/**
 * Single responsibility: the palette as plain values, for the few places
 * that take a color prop instead of a className (ActivityIndicator,
 * placeholderTextColor, the bottom tab bar, StatusBar).
 *
 * IMPORTANT: keep in sync with tailwind.config.js.
 */

export interface ThemeColors {
  background: string;
  card: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentSoft: string;
  metalSilver: string;
  metalCopper: string;
  muted: string;
  border: string;
  danger: string;
  onPrimary: string;
  placeholder: string;
}

export const lightColors: ThemeColors = {
  background: "#EEF2DF",
  card: "#FBF6EC",
  primary: "#6E1423",
  primaryLight: "#8C1D2E",
  accent: "#B08D57",
  accentSoft: "#D8C39A",
  metalSilver: "#B7BCC2",
  metalCopper: "#B87333",
  muted: "#7E6553",
  border: "#D9C6A8",
  danger: "#A32638",
  onPrimary: "#FBF6EC",
  placeholder: "#A9968A",
};

export const darkColors: ThemeColors = {
  background: "#1B2410",
  card: "#332619",
  primary: "#9A2E3F",
  primaryLight: "#8C1D2E",
  accent: "#C9A876",
  accentSoft: "#4A392A",
  metalSilver: "#B7BCC2",
  metalCopper: "#B87333",
  muted: "#BEAD9B",
  border: "#4A392A",
  danger: "#C7495A",
  onPrimary: "#FBF6EC",
  placeholder: "#8A7360",
};

export function getColors(theme: "light" | "dark"): ThemeColors {
  return theme === "dark" ? darkColors : lightColors;
}
