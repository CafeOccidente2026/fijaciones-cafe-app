import React from "react";
import { FlatList, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "../../../src/components/Screen";
import { Card } from "../../../src/components/Card";
import { StateView } from "../../../src/components/StateView";
import { useAsync } from "../../../src/hooks/useAsync";
import { PriceFixingsApi } from "../../../src/api/priceFixingsApi";
import { WeeklyByUserItem } from "../../../src/types/priceFixing.types";
import { formatKilos } from "../../../src/utils/format";
import { strings } from "../../../src/constants/strings";

/** Drill-down level 1: who fixed one coffee type, in one week, and how much. */
export default function WeeklyByUserScreen() {
  const router = useRouter();
  const { coffeeTypeId, weekStart, coffeeTypeName } = useLocalSearchParams<{
    coffeeTypeId: string;
    weekStart: string;
    coffeeTypeName: string;
  }>();

  const { data, isLoading, error, reload } = useAsync<WeeklyByUserItem[]>(
    () => PriceFixingsApi.weeklyByUser(coffeeTypeId, weekStart),
    [coffeeTypeId, weekStart]
  );

  return (
    <Screen
      title={coffeeTypeName}
      subtitle={strings.weeklyByUser.subtitle}
      scroll={false}
      showBack
    >
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText={strings.weeklyByUser.empty}
        onRetry={reload}
      >
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card
              onPress={() =>
                router.push({
                  pathname: "/admin/weekly-by-user/[coffeeTypeId]/[userId]",
                  params: {
                    coffeeTypeId,
                    userId: item.userId,
                    weekStart,
                    coffeeTypeName,
                    fullName: item.fullName,
                  },
                })
              }
            >
              <Text className="text-base font-semibold text-primary dark:text-white">
                {strings.weeklyByUser.row(item.fullName, formatKilos(item.totalKilos))}
              </Text>
              <Text className="text-xs text-muted dark:text-muted-dark">
                {item.municipality ? item.municipality : strings.common.noMunicipality}
              </Text>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}
