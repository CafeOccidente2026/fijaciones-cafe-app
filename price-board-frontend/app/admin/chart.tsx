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

/**
 * ADMIN "gráfico": total kilos fixed per coffee type over the last 30
 * days, as a bar chart.
 */
export default function ChartScreen() {
  const { data, isLoading, error, reload } = useAsync<MonthlyChartItem[]>(() =>
    PriceFixingsApi.monthlyChartData()
  );

  return (
    <Screen title="Gráfico" subtitle="Kilos fijados por tipo de café en los últimos 30 días">
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText="No hay fijaciones en los últimos 30 días."
        onRetry={reload}
      >
        <Card>
          <BarChart
            data={(data ?? []).map((item) => ({
              label: item.name,
              value: item.totalKilos,
              caption: `${item.fixingsCount} ${item.fixingsCount === 1 ? "fijación" : "fijaciones"}`,
            }))}
            formatValue={formatKilos}
          />
        </Card>
        <Text className="px-1 text-xs text-muted">
          Total de tipos con actividad: {data?.length ?? 0}
        </Text>
      </StateView>
    </Screen>
  );
}
