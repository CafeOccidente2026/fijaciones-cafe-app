import React from "react";
import { WeeklyChartScreen } from "../../src/components/WeeklyChartScreen";

/**
 * ADMIN "gráfico" tab: the current (Mon-Fri) week's bar chart, with a
 * drill-down per bar and a link to past weeks' history.
 */
export default function ChartScreen() {
  return <WeeklyChartScreen />;
}
