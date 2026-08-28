import React from "react";
import { Text, View } from "react-native";

export interface BarChartDatum {
  label: string;
  value: number;
  /** Optional secondary line under the value (e.g. "3 fijaciones"). */
  caption?: string;
}

interface BarChartProps {
  data: BarChartDatum[];
  /** Formats the numeric value for display (e.g. kilos). */
  formatValue?: (value: number) => string;
}

/**
 * Single responsibility: a horizontal bar chart drawn with plain RN
 * views (no chart library / native dependency, so it just works in Expo
 * Go). Each bar is scaled to the largest value in the set.
 */
export function BarChart({ data, formatValue = (value) => value.toString() }: BarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <View className="gap-4">
      {data.map((item) => {
        const widthPercent = Math.max(6, Math.round((item.value / max) * 100));
        return (
          <View key={item.label}>
            <View className="mb-1 flex-row items-center justify-between">
              <Text
                className="flex-1 pr-2 text-sm font-semibold text-primary dark:text-white"
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text className="text-sm font-bold text-primary dark:text-white">
                {formatValue(item.value)}
              </Text>
            </View>
            <View className="h-3 overflow-hidden rounded-full bg-border dark:bg-border-dark">
              <View
                className="h-3 rounded-full bg-accent dark:bg-accent-dark"
                style={{ width: `${widthPercent}%` }}
              />
            </View>
            {item.caption ? (
              <Text className="mt-1 text-xs text-muted dark:text-muted-dark">{item.caption}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
