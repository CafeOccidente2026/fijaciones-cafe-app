import React from "react";
import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { StateView } from "../../src/components/StateView";
import { LogoutButton } from "../../src/components/LogoutButton";
import { useAsync } from "../../src/hooks/useAsync";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { TodaySummaryItem } from "../../src/types/priceFixing.types";
import { strings } from "../../src/constants/strings";

/**
 * PRICE_MANAGER home: today's fixings grouped by coffee type, each with a
 * counter. Tapping a type opens the detailed list of "fichas".
 */
export default function TodaySummaryScreen() {
  const router = useRouter();
  const { data, isLoading, error, reload } = useAsync<TodaySummaryItem[]>(() =>
    PriceFixingsApi.todaySummary()
  );

  return (
    <Screen
      title={strings.priceManagerToday.title}
      subtitle={strings.priceManagerToday.subtitle}
      scroll={false}
      headerRight={<LogoutButton />}
    >
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText={strings.priceManagerToday.empty}
        onRetry={reload}
      >
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card onPress={() => router.push(`/price-manager/today-detail/${item.id}`)}>
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-3 text-base font-semibold text-primary dark:text-white">
                  {item.name}
                </Text>
                <Badge label={strings.priceManagerToday.fixingCount(item.count)} />
              </View>
            </Card>
          )}
        />
      </StateView>
    </Screen>
  );
}
