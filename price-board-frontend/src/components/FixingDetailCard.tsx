import React from "react";
import { Text, View } from "react-native";
import { Card } from "./Card";
import { DetailedPriceFixing } from "../types/priceFixing.types";
import { formatCurrency, formatDateTime, formatKilos } from "../utils/format";

/**
 * Single responsibility: the "ficha" a PRICE_MANAGER / ADMIN sees for one
 * fixing, e.g.:
 *   Richar Rios
 *   Municipio de Ancuya
 *   28/08/2026 - 08:06:24 am
 *   27 kg de Cafe Excelso a $ 12.500 / kg
 */
export function FixingDetailCard({ fixing }: { fixing: DetailedPriceFixing }) {
  return (
    <Card>
      <Text className="text-base font-semibold text-primary">{fixing.user.fullName}</Text>
      <Text className="text-sm text-muted">
        {fixing.user.municipality ? `Municipio de ${fixing.user.municipality}` : "Sin municipio"}
      </Text>
      <Text className="mt-1 text-sm text-muted">{formatDateTime(fixing.createdAt)}</Text>
      <View className="mt-2 border-t border-border pt-2">
        <Text className="text-base text-primary">
          <Text className="font-bold">{formatKilos(fixing.kilos)}</Text> de {fixing.coffeeType.name}{" "}
          a <Text className="font-bold text-accent">{formatCurrency(fixing.priceAtFixing)} / kg</Text>
        </Text>
      </View>
    </Card>
  );
}
