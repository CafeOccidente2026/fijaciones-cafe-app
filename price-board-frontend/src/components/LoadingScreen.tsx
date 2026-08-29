import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "../theme/useThemeColors";

/**
 * Single responsibility: a full-screen spinner over the app's wood
 * background. The wood texture isn't light enough for the spinner to
 * read on its own, so it sits inside a small opaque card.
 */
export function LoadingScreen() {
  const colors = useThemeColors();

  return (
    <View className="flex-1 items-center justify-center">
      <View className="rounded-2xl bg-card p-5 dark:bg-card-dark">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
}
