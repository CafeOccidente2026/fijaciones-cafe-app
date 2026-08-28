import React from "react";
import { Text, View } from "react-native";
import { formatCurrency, formatDate } from "../utils/format";
import { strings } from "../constants/strings";

interface PriceHighlightCardProps {
  coffeeTypeName: string;
  price: number;
  updatedAt: string;
}

/**
 * Single responsibility: the big "precio actual" panel at the top of the
 * producer's home screen - price large and prominent, with "actualizado".
 */
export function PriceHighlightCard({ coffeeTypeName, price, updatedAt }: PriceHighlightCardProps) {
  return (
    <View className="rounded-3xl border-l-4 border-metal-copper bg-primary p-6 dark:bg-primary-dark">
      <Text className="text-sm font-medium uppercase tracking-wide text-white/70">
        {strings.priceCard.label}
      </Text>
      <Text className="mt-1 text-base text-white/90">{coffeeTypeName}</Text>
      <Text className="mt-2 text-4xl font-bold text-white">{formatCurrency(price)}</Text>
      <Text className="mt-1 text-xs text-white/60">{strings.priceCard.perKg}</Text>
      <Text className="mt-4 text-xs text-white/60">
        {strings.priceCard.updatedOn(formatDate(updatedAt))}
      </Text>
    </View>
  );
}
