import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { StateView } from "./StateView";
import { Select, SelectOption } from "./Select";
import { FormField } from "./FormField";
import { PrimaryButton } from "./PrimaryButton";
import { useThemeColors } from "../theme/useThemeColors";
import { CoffeeTypesApi, PriceHistoryFilters } from "../api/coffeeTypesApi";
import { getApiErrorMessage } from "../api/apiError";
import { PriceHistoryEntry } from "../types/coffeeType.types";
import { formatCurrency, formatDateTime, roleLabel } from "../utils/format";
import { strings } from "../constants/strings";

/**
 * Single responsibility: the "cambios de precio" segment of ADMIN's
 * Historial screen - no `Screen` wrapper of its own (like
 * FixingHistoryView's `embedded` mode), so it sits next to it behind the
 * same Fijaciones/Cambios de precio toggle.
 */
export function PriceHistoryView() {
  const colors = useThemeColors();

  const [coffeeTypeOptions, setCoffeeTypeOptions] = useState<SelectOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [coffeeTypeId, setCoffeeTypeId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [rows, setRows] = useState<PriceHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasActiveFilters = !!coffeeTypeId || !!dateFrom.trim() || !!dateTo.trim();

  useEffect(() => {
    CoffeeTypesApi.list(true)
      .then((types) =>
        setCoffeeTypeOptions([
          { label: strings.history.allTypes, value: "" },
          ...types.map((type) => ({ label: type.name, value: type.id })),
        ])
      )
      .catch(() => setCoffeeTypeOptions([{ label: strings.history.allTypes, value: "" }]));
  }, []);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: PriceHistoryFilters = {};
      if (coffeeTypeId) filters.coffeeTypeId = coffeeTypeId;
      if (dateFrom.trim()) filters.dateFrom = dateFrom.trim();
      if (dateTo.trim()) filters.dateTo = dateTo.trim();
      setRows(await CoffeeTypesApi.priceHistory(filters));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [coffeeTypeId, dateFrom, dateTo]);

  useEffect(() => {
    void loadHistory();
    // Only run on mount; further loads are triggered by "Aplicar filtro".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilter() {
    void loadHistory();
    setShowFilters(false);
  }

  return (
    <View className="flex-1">
      <View className="mb-3 flex-row justify-end">
        <Pressable
          onPress={() => setShowFilters((prev) => !prev)}
          accessibilityRole="button"
          className="flex-row items-center gap-1 rounded-xl border border-border px-3 py-2 hover:opacity-90 active:opacity-80 dark:border-border-dark"
        >
          <Ionicons name="options-outline" size={16} color={colors.primary} />
          <Text className="text-sm font-semibold text-primary dark:text-white">
            {strings.history.filterButton}
          </Text>
          {hasActiveFilters ? (
            <View className="h-2 w-2 rounded-full bg-danger dark:bg-danger-dark" />
          ) : null}
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          showFilters ? (
            <Card className="mb-2">
              <Select
                label={strings.history.coffeeTypeFilterLabel}
                value={coffeeTypeId ?? ""}
                options={coffeeTypeOptions}
                onChange={(value) => setCoffeeTypeId(value || null)}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormField
                    label={strings.history.fromLabel}
                    placeholder={strings.history.datePlaceholder}
                    autoCapitalize="none"
                    value={dateFrom}
                    onChangeText={setDateFrom}
                  />
                </View>
                <View className="flex-1">
                  <FormField
                    label={strings.history.toLabel}
                    placeholder={strings.history.datePlaceholder}
                    autoCapitalize="none"
                    value={dateTo}
                    onChangeText={setDateTo}
                  />
                </View>
              </View>
              <PrimaryButton
                label={strings.history.applyFilter}
                onPress={applyFilter}
                loading={isLoading}
              />
            </Card>
          ) : null
        }
        renderItem={({ item }) => (
          <Card>
            <Text className="text-base font-semibold text-primary dark:text-white">
              {item.coffeeType.name}
            </Text>
            <Text className="mt-1 text-sm text-muted dark:text-muted-dark">
              {formatDateTime(item.changedAt)}
            </Text>
            <View className="mt-2 border-t border-border pt-2 dark:border-border-dark">
              <Text className="text-base text-primary dark:text-white">
                {strings.priceHistory.newPrice(formatCurrency(item.price))}
              </Text>
              <Text className="text-sm text-muted dark:text-muted-dark">
                {strings.priceHistory.changedBy(item.changedBy.fullName, roleLabel(item.changedBy.role))}
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <StateView
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !error}
            emptyText={strings.priceHistory.empty}
            onRetry={loadHistory}
          >
            <View />
          </StateView>
        }
      />
    </View>
  );
}
