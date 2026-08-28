import React, { useEffect } from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/components/Screen";
import { StateView } from "../../../src/components/StateView";
import { FixingDetailCard } from "../../../src/components/FixingDetailCard";
import { useAsync } from "../../../src/hooks/useAsync";
import { useTodayNovelty } from "../../../src/hooks/useTodayNovelty";
import { useAuth } from "../../../src/auth/AuthContext";
import { PriceFixingsApi } from "../../../src/api/priceFixingsApi";
import { DetailedPriceFixing } from "../../../src/types/priceFixing.types";
import { strings } from "../../../src/constants/strings";

/**
 * Detailed list of today's fixings for one coffee type - one "ficha" per
 * fixing. Opening this screen marks that type's fixings as reviewed, so
 * the "nuevas" badge on the previous screen clears.
 */
export default function TodayByTypeScreen() {
  const { coffeeTypeId } = useLocalSearchParams<{ coffeeTypeId: string }>();
  const { user } = useAuth();
  const { markSeen } = useTodayNovelty(user?.id);
  const { data, isLoading, error, reload } = useAsync<DetailedPriceFixing[]>(
    () => PriceFixingsApi.todayByType(coffeeTypeId),
    [coffeeTypeId]
  );

  useEffect(() => {
    if (data) {
      void markSeen(coffeeTypeId, data.length);
    }
  }, [data, coffeeTypeId, markSeen]);

  const coffeeTypeName = data?.[0]?.coffeeType.name ?? strings.todayDetail.fallbackTitle;

  return (
    <Screen title={coffeeTypeName} subtitle={strings.todayDetail.subtitle} scroll={false} showBack>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText={strings.todayDetail.empty}
        onRetry={reload}
      >
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <FixingDetailCard fixing={item} />}
        />
      </StateView>
    </Screen>
  );
}
