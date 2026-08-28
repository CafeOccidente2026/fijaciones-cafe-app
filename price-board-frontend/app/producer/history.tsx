import React from "react";
import { FlatList } from "react-native";
import { Screen } from "../../src/components/Screen";
import { StateView } from "../../src/components/StateView";
import { HistoryListItem } from "../../src/components/HistoryListItem";
import { useAsync } from "../../src/hooks/useAsync";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { MyPriceFixing } from "../../src/types/priceFixing.types";

/**
 * Producer history: read-only list of every fixing this producer has
 * made, newest first. No edit or delete.
 */
export default function ProducerHistoryScreen() {
  const { data, isLoading, error, reload } = useAsync<MyPriceFixing[]>(() =>
    PriceFixingsApi.myHistory()
  );

  return (
    <Screen title="Mi historial" subtitle="Tus fijaciones, de la más reciente a la más antigua" scroll={false}>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText="Todavía no has hecho ninguna fijación."
        onRetry={reload}
      >
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <HistoryListItem fixing={item} />}
        />
      </StateView>
    </Screen>
  );
}
