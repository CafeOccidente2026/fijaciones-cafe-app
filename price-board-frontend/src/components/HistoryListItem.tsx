import React from "react";
import { Text, View } from "react-native";
import { Card } from "./Card";
import { MyPriceFixing } from "../types/priceFixing.types";
import { formatCurrency, formatDateTime, formatKilos } from "../utils/format";

/**
 * Single responsibility: one read-only row of the producer's own fixing
 * history - coffee type, kilos, the price it was fixed at, and the exact
 * date/time. No edit or delete actions.
 */
export function HistoryListItem({ fixing }: { fixing: MyPriceFixing }) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-primary">{fixing.coffeeType.name}</Text>
        <Text className="text-base font-bold text-primary">{formatKilos(fixing.kilos)}</Text>
      </View>
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-sm text-muted">{formatDateTime(fixing.createdAt)}</Text>
        <Text className="text-sm text-accent">{formatCurrency(fixing.priceAtFixing)} / kg</Text>
      </View>
    </Card>
  );
}
