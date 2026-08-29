import React from "react";
import { ImageBackground } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useThemeColors } from "../theme/useThemeColors";
import { images } from "../constants/images";

/**
 * Single responsibility: the app's real wood-texture background, applied
 * once at the root layout so every screen (including login) sits on top
 * of it. `require()` is cached by RN/Metro, so switching theme just swaps
 * which already-loaded image is drawn - no re-decoding per screen change.
 */
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const colors = useThemeColors();
  const source = resolvedTheme === "dark" ? images.woodBackgroundDark : images.woodBackgroundLight;

  return (
    <ImageBackground
      source={source}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {children}
    </ImageBackground>
  );
}
