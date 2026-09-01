import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import { useFontScale } from "../theme/FontScaleContext";

/**
 * Drop-in replacement for RN's Text. Tailwind `text-*` classes already scale
 * app-wide through FontScaleContext's rem update (every text-* class resolves
 * against it), so this only needs to handle text sized via an inline
 * `style.fontSize` - the one case the rem update can't reach.
 */
export function AppText({ style, ...props }: TextProps) {
  const { fontScale } = useFontScale();
  const explicitFontSize = StyleSheet.flatten(style)?.fontSize;

  if (explicitFontSize == null) {
    return <Text {...props} style={style} />;
  }

  return <Text {...props} style={[style, { fontSize: explicitFontSize * fontScale }]} />;
}
