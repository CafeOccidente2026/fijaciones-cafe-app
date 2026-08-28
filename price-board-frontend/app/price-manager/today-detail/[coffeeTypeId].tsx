import React from "react";
import { FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../../src/components/Screen";
import { StateView } from "../../../src/components/StateView";
import { FixingDetailCard } from "../../../src/components/FixingDetailCard";
import { useAsync } from "../../../src/hooks/useAsync";
import { PriceFixingsApi } from "../../../src/api/priceFixingsApi";
import { DetailedPriceFixing } from "../../../src/types/priceFixing.types";

/**
 * Detailed list of today's fixings for one coffee type - one "ficha" per
 * fixing (producer name, municipality, date/time, kilos and price).
 */
export default function TodayByTypeScreen() {
  const { coffeeTypeId } = useLocalSearchParams<{ coffeeTypeId: string }>();
  const { data, isLoading, error, reload } = useAsync<DetailedPriceFixing[]>(
    () => PriceFixingsApi.todayByType(coffeeTypeId),
    [coffeeTypeId]
  );

  const coffeeTypeName = data?.[0]?.coffeeType.name ?? "Detalle del día";

  return (
    <Screen title={coffeeTypeName} subtitle="Fijaciones de hoy" scroll={false} showBack>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText="No hay fijaciones de este tipo hoy."
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
