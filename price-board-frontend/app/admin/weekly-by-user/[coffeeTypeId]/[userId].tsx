import React from "react";
import { FlatList, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../../src/components/Screen";
import { Card } from "../../../../src/components/Card";
import { StateView } from "../../../../src/components/StateView";
import { useAsync } from "../../../../src/hooks/useAsync";
import { PriceFixingsApi } from "../../../../src/api/priceFixingsApi";
import { WeeklyUserFixing } from "../../../../src/types/priceFixing.types";
import { formatKilos, formatTimeShort } from "../../../../src/utils/format";
import { strings } from "../../../../src/constants/strings";

/** Drill-down level 2: one person's individual fixings of one type, in one week. */
export default function WeeklyByUserFixingsScreen() {
  const { coffeeTypeId, userId, weekStart, coffeeTypeName, fullName } = useLocalSearchParams<{
    coffeeTypeId: string;
    userId: string;
    weekStart: string;
    coffeeTypeName: string;
    fullName: string;
  }>();

  const { data, isLoading, error, reload } = useAsync<WeeklyUserFixing[]>(
    () => PriceFixingsApi.weeklyByUserFixings(coffeeTypeId, userId, weekStart),
    [coffeeTypeId, userId, weekStart]
  );

  return (
    <Screen
      title={fullName}
      subtitle={strings.weeklyUserFixings.subtitle(coffeeTypeName)}
      scroll={false}
      showBack
    >
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText={strings.weeklyUserFixings.empty}
        onRetry={reload}
      >
        <FlatList
          data={data ?? []}
          keyExtractor={(item, index) => `${item.createdAt}-${index}`}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card>
              <Text className="text-base font-semibold text-primary dark:text-white">
                {strings.weeklyUserFixings.row(formatTimeShort(item.createdAt), formatKilos(item.kilos))}
              </Text>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}
