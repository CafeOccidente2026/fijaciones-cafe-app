import React from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { DetailedPriceFixing } from "../types/priceFixing.types";
import { formatCurrency, formatDateTime, formatKilos } from "../utils/format";
import { strings } from "../constants/strings";

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
      <AppText className="text-base font-semibold text-primary dark:text-white">
        {fixing.user.fullName}
      </AppText>
      <AppText className="text-sm text-muted dark:text-muted-dark">
        {fixing.user.municipality
          ? strings.fixingCard.municipalityOf(fixing.user.municipality)
          : strings.common.noMunicipality}
      </AppText>
      <AppText className="mt-1 text-sm text-muted dark:text-muted-dark">
        {formatDateTime(fixing.createdAt)}
      </AppText>
      <View className="mt-2 border-t border-border pt-2 dark:border-border-dark">
        <AppText className="text-base text-primary dark:text-white">
          {strings.fixingCard.summary(
            formatKilos(fixing.kilos),
            fixing.coffeeType.name,
            formatCurrency(fixing.priceAtFixing)
          )}
        </AppText>
      </View>
    </Card>
  );
}
