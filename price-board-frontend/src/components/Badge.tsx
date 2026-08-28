import React from "react";
import { Text, View } from "react-native";

type BadgeTone = "accent" | "primary" | "danger" | "muted";

const TONES: Record<BadgeTone, { bg: string; text: string }> = {
  accent: { bg: "bg-accent-light", text: "text-primary" },
  primary: { bg: "bg-primary", text: "text-white" },
  danger: { bg: "bg-danger/15", text: "text-danger" },
  muted: { bg: "bg-border", text: "text-muted" },
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
