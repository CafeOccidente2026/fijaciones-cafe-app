import { getColors, ThemeColors } from "./colors";
import { useTheme } from "./ThemeContext";

/**
 * Single responsibility: give components the palette values for the
 * current theme, for props that don't accept a className.
 */
export function useThemeColors(): ThemeColors {
  const { resolvedTheme } = useTheme();
  return getColors(resolvedTheme);
}
