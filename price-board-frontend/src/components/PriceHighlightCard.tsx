import React from "react";
import { Text, View } from "react-native";
import { formatCurrency, formatDate } from "../utils/format";

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
    <View className="rounded-3xl bg-primary p-6">
      <Text className="text-sm font-medium uppercase tracking-wide text-white/70">
        Precio actual
      </Text>
      <Text className="mt-1 text-base text-white/90">{coffeeTypeName}</Text>
      <Text className="mt-2 text-4xl font-bold text-white">{formatCurrency(price)}</Text>
      <Text className="mt-1 text-xs text-white/60">por kg</Text>
      <Text className="mt-4 text-xs text-white/60">Actualizado el {formatDate(updatedAt)}</Text>
    </View>
  );
}
