import React from "react";
import { Text, View } from "react-native";

type BadgeTone = "accent" | "primary" | "danger" | "muted";

const TONES: Record<BadgeTone, { bg: string; text: string }> = {
  accent: {
    bg: "bg-accent-soft dark:bg-accent-soft-dark",
    text: "text-primary dark:text-white",
  },
  primary: {
    bg: "bg-primary dark:bg-primary-dark",
    text: "text-white",
  },
  danger: {
    bg: "bg-danger/15 dark:bg-danger-dark/25",
    text: "text-danger dark:text-danger-dark",
  },
  muted: {
    bg: "bg-border dark:bg-border-dark",
    text: "text-muted dark:text-muted-dark",
  },
};

/**
 * Single responsibility: a small rounded label / counter pill.
 */
export function Badge({ label, tone = "accent" }: { label: string | number; tone?: BadgeTone }) {
  const style = TONES[tone];
  return (
    <View className={`rounded-full px-2.5 py-1 ${style.bg}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>{label}</Text>
    </View>
  );
}
