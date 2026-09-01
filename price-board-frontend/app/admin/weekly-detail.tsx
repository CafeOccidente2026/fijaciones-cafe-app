import React from "react";
import { useLocalSearchParams } from "expo-router";
import { WeeklyChartScreen } from "../../src/components/WeeklyChartScreen";

/** Same chart + drill-down as the "Gráfico" tab, for one past week from the history list. */
export default function WeeklyDetailScreen() {
  const { weekStart } = useLocalSearchParams<{ weekStart: string }>();
  return <WeeklyChartScreen weekStart={weekStart} showBack />;
}
