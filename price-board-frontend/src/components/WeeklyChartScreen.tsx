import React from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "./Screen";
import { Card } from "./Card";
import { StateView } from "./StateView";
import { BarChart } from "./BarChart";
import { DownloadReportButton } from "./DownloadReportButton";
import { useAsync } from "../hooks/useAsync";
import { useThemeColors } from "../theme/useThemeColors";
import { PriceFixingsApi } from "../api/priceFixingsApi";
import { WeeklyChartData } from "../types/priceFixing.types";
import { formatKilos, formatWeekRange } from "../utils/format";
import { strings } from "../constants/strings";

interface WeeklyChartScreenProps {
  /** Omitted = the week in progress. */
  weekStart?: string;
  /** True on the weekly-history drill-in screen (shows a "‹ Volver" link). */
  showBack?: boolean;
}

/**
 * Single responsibility: the ADMIN weekly bar chart - one bar per coffee
 * type, tappable to drill down into who fixed it. Reused as-is for both
 * the current week (the "Gráfico" tab) and any past week opened from the
 * weekly history list.
 */
export function WeeklyChartScreen({ weekStart, showBack = false }: WeeklyChartScreenProps) {
  const router = useRouter();
  const colors = useThemeColors();
  const { data, isLoading, error, reload } = useAsync<WeeklyChartData>(
    () => PriceFixingsApi.weeklyChart(weekStart),
    [weekStart]
  );

  function openByUser(coffeeTypeId: string, coffeeTypeName: string) {
    if (!data) return;
    router.push({
      pathname: "/admin/weekly-by-user/[coffeeTypeId]",
      params: { coffeeTypeId, weekStart: data.weekStart, coffeeTypeName },
    });
  }

  return (
    <Screen
      title={strings.adminChart.title}
      subtitle={data ? strings.adminChart.weekOf(formatWeekRange(data.weekStart, data.weekEnd)) : undefined}
      showBack={showBack}
      headerRight={
        showBack ? undefined : (
          <Pressable
            onPress={() => router.push("/admin/weekly-history")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={strings.adminChart.historyButtonLabel}
            className="rounded-lg p-1 hover:opacity-80 active:opacity-60"
          >
            <Ionicons name="time-outline" size={24} color={colors.primary} />
          </Pressable>
        )
      }
    >
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.items.length ?? 0) === 0}
        emptyText={strings.adminChart.empty}
        onRetry={reload}
      >
        <Card>
          <BarChart
            data={(data?.items ?? []).map((item) => ({
              label: item.coffeeTypeName,
              value: item.totalKilos,
              caption: strings.adminChart.fixingCount(item.fixingsCount),
            }))}
            formatValue={formatKilos}
            onPressItem={(index) => {
              const item = data?.items[index];
              if (item) openByUser(item.coffeeTypeId, item.coffeeTypeName);
            }}
          />
        </Card>
        <DownloadReportButton weekStart={weekStart} />
      </StateView>
    </Screen>
  );
}
