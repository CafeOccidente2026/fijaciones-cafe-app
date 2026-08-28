import React from "react";
import { Text } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { StateView } from "../../src/components/StateView";
import { BarChart } from "../../src/components/BarChart";
import { useAsync } from "../../src/hooks/useAsync";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { MonthlyChartItem } from "../../src/types/priceFixing.types";
import { formatKilos } from "../../src/utils/format";
import { strings } from "../../src/constants/strings";

/**
 * ADMIN "gráfico": total kilos fixed per coffee type over the last 30
 * days, as a bar chart.
 */
export default function ChartScreen() {
  const { data, isLoading, error, reload } = useAsync<MonthlyChartItem[]>(() =>
    PriceFixingsApi.monthlyChartData()
  );

  return (
    <Screen title={strings.adminChart.title} subtitle={strings.adminChart.subtitle}>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText={strings.adminChart.empty}
        onRetry={reload}
      >
        <Card>
          <BarChart
            data={(data ?? []).map((item) => ({
              label: item.name,
              value: item.totalKilos,
              caption: strings.adminChart.fixingCount(item.fixingsCount),
            }))}
            formatValue={formatKilos}
          />
        </Card>
        <Text className="px-1 text-xs text-muted dark:text-muted-dark">
          {strings.adminChart.typesWithActivity(data?.length ?? 0)}
        </Text>
      </StateView>
    </Screen>
  );
}
