import React from "react";
import { FlatList, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { StateView } from "../../src/components/StateView";
import { useAsync } from "../../src/hooks/useAsync";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { WeeklyHistoryWeek } from "../../src/types/priceFixing.types";
import { formatDateOnlyDisplay, formatKilos, formatWeekRange } from "../../src/utils/format";
import { strings } from "../../src/constants/strings";

/** List of closed (Mon-Fri already past) weeks, most recent first. */
export default function WeeklyHistoryScreen() {
  const router = useRouter();
  const { data, isLoading, error, reload } = useAsync<WeeklyHistoryWeek[]>(() =>
    PriceFixingsApi.weeklyHistory()
  );

  return (
    <Screen title={strings.weeklyHistory.title} subtitle={strings.weeklyHistory.subtitle} scroll={false} showBack>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText={strings.weeklyHistory.empty}
        onRetry={reload}
      >
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.weekStart}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card
              onPress={() =>
                router.push({ pathname: "/admin/weekly-detail", params: { weekStart: item.weekStart } })
              }
            >
              <Text className="text-base font-semibold text-primary dark:text-white">
                {formatWeekRange(item.weekStart, item.weekEnd)}
              </Text>
              <Text className="text-xs text-muted dark:text-muted-dark">
                {formatDateOnlyDisplay(item.weekStart)} - {formatDateOnlyDisplay(item.weekEnd)}
              </Text>
              <Text className="mt-2 text-base text-primary dark:text-white">
                {formatKilos(item.totalKilos)}
              </Text>
              <Text className="text-sm text-muted dark:text-muted-dark">
                {strings.weeklyHistory.fixingCount(item.fixingsCount)}
              </Text>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}
