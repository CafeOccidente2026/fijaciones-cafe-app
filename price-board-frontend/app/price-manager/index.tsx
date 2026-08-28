import React from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { StateView } from "../../src/components/StateView";
import { LogoutButton } from "../../src/components/LogoutButton";
import { useAsync } from "../../src/hooks/useAsync";
import { useTodayNovelty } from "../../src/hooks/useTodayNovelty";
import { useAuth } from "../../src/auth/AuthContext";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { TodaySummaryItem } from "../../src/types/priceFixing.types";
import { strings } from "../../src/constants/strings";

/**
 * PRICE_MANAGER home: today's fixings grouped by coffee type. The badge
 * counts only fixings not yet reviewed (see useTodayNovelty) - it clears
 * once the manager opens that type's detail.
 */
export default function TodaySummaryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, error, reload } = useAsync<TodaySummaryItem[]>(() =>
    PriceFixingsApi.todaySummary()
  );
  const { newCountFor, refresh } = useTodayNovelty(user?.id);

  // Re-check both the data and the "seen" counts when returning from a detail.
  useFocusEffect(
    React.useCallback(() => {
      reload();
      void refresh();
    }, [reload, refresh])
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
          renderItem={({ item }) => {
            const newCount = newCountFor(item.id, item.count);
            return (
              <Card onPress={() => router.push(`/price-manager/today-detail/${item.id}`)}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-base font-semibold text-primary dark:text-white">
                      {item.name}
                    </Text>
                    <Text className="text-xs text-muted dark:text-muted-dark">
                      {strings.priceManagerToday.fixingCount(item.count)}
                    </Text>
                  </View>
                  {newCount > 0 ? (
                    <Badge label={strings.priceManagerToday.newCount(newCount)} tone="danger" />
                  ) : null}
                </View>
              </Card>
            );
          }}
        />
      </StateView>
    </Screen>
  );
}
