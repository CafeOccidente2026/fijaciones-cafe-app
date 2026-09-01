import React from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { MyPriceFixing } from "../types/priceFixing.types";
import { formatCurrency, formatDateTime, formatKilos } from "../utils/format";
import { strings } from "../constants/strings";

/**
 * Single responsibility: one read-only row of the producer's own fixing
 * history - coffee type, kilos, the price it was fixed at, and the exact
 * date/time. No edit or delete actions.
 */
export function HistoryListItem({ fixing }: { fixing: MyPriceFixing }) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <AppText className="text-base font-semibold text-primary dark:text-white">
          {fixing.coffeeType.name}
        </AppText>
        <AppText className="text-base font-bold text-primary dark:text-white">
          {formatKilos(fixing.kilos)}
        </AppText>
      </View>
      <View className="mt-1 flex-row items-center justify-between">
        <AppText className="text-sm text-muted dark:text-muted-dark">
          {formatDateTime(fixing.createdAt)}
        </AppText>
        <AppText className="text-sm text-accent dark:text-accent-dark">
          {strings.fixingCard.pricePerKg(formatCurrency(fixing.priceAtFixing))}
        </AppText>
      </View>
    </Card>
  );
}
