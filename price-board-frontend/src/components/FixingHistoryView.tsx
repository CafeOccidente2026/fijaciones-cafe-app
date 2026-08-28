import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { Screen } from "./Screen";
import { Card } from "./Card";
import { StateView } from "./StateView";
import { Select, SelectOption } from "./Select";
import { FormField } from "./FormField";
import { PrimaryButton } from "./PrimaryButton";
import { FixingDetailCard } from "./FixingDetailCard";
import { CoffeeTypesApi } from "../api/coffeeTypesApi";
import { UsersApi } from "../api/usersApi";
import { PriceFixingsApi } from "../api/priceFixingsApi";
import { getApiErrorMessage } from "../api/apiError";
import { DetailedPriceFixing, HistoryFilters } from "../types/priceFixing.types";
import { strings } from "../constants/strings";

interface FixingHistoryViewProps {
  /** ADMIN also gets a "por usuario" selector (maps to the userId filter). */
  allowUserFilter?: boolean;
}

/**
 * Single responsibility: the full price-fixing history with filters,
 * shared by PRICE_MANAGER and ADMIN. Server filters: coffee type,
 * municipality, date range (and userId for ADMIN). "Nombre" is matched
 * on the client over the returned rows.
 */
export function FixingHistoryView({ allowUserFilter = false }: FixingHistoryViewProps) {
  const [coffeeTypeOptions, setCoffeeTypeOptions] = useState<SelectOption[]>([]);
  const [userOptions, setUserOptions] = useState<SelectOption[]>([]);

  const [coffeeTypeId, setCoffeeTypeId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [municipality, setMunicipality] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [rows, setRows] = useState<DetailedPriceFixing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    CoffeeTypesApi.list(true)
      .then((types) =>
        setCoffeeTypeOptions([
          { label: strings.history.allTypes, value: "" },
          ...types.map((type) => ({ label: type.name, value: type.id })),
        ])
      )
      .catch(() => setCoffeeTypeOptions([{ label: strings.history.allTypes, value: "" }]));

    if (allowUserFilter) {
      UsersApi.list("PRODUCER")
        .then((users) =>
          setUserOptions([
            { label: strings.history.allUsers, value: "" },
            ...users.map((user) => ({ label: user.fullName, value: user.id })),
          ])
        )
        .catch(() => setUserOptions([{ label: strings.history.allUsers, value: "" }]));
    }
  }, [allowUserFilter]);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: HistoryFilters = {};
      if (coffeeTypeId) filters.coffeeTypeId = coffeeTypeId;
      if (userId) filters.userId = userId;
      if (municipality.trim()) filters.municipality = municipality.trim();
      if (dateFrom.trim()) filters.dateFrom = dateFrom.trim();
      if (dateTo.trim()) filters.dateTo = dateTo.trim();
      setRows(await PriceFixingsApi.history(filters));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [coffeeTypeId, userId, municipality, dateFrom, dateTo]);

  useEffect(() => {
    void loadHistory();
    // Only run on mount; further loads are triggered by the "Aplicar filtros" button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleRows = useMemo(() => {
    const query = nameQuery.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.user.fullName.toLowerCase().includes(query));
  }, [rows, nameQuery]);

  return (
    <Screen title={strings.history.title} subtitle={strings.history.subtitle} scroll={false}>
      <FlatList
        data={visibleRows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Card className="mb-1">
            <Select
              label={strings.history.coffeeTypeFilterLabel}
              value={coffeeTypeId ?? ""}
              options={coffeeTypeOptions}
              onChange={(value) => setCoffeeTypeId(value || null)}
            />
            {allowUserFilter ? (
              <Select
                label={strings.history.userFilterLabel}
                value={userId ?? ""}
                options={userOptions}
                onChange={(value) => setUserId(value || null)}
              />
            ) : null}
            <FormField
              label={strings.history.municipalityLabel}
              placeholder={strings.history.municipalityPlaceholder}
              value={municipality}
              onChangeText={setMunicipality}
            />
            <FormField
              label={strings.history.nameLabel}
              placeholder={strings.history.namePlaceholder}
              value={nameQuery}
              onChangeText={setNameQuery}
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
            <PrimaryButton label={strings.history.applyFilters} onPress={loadHistory} loading={isLoading} />
          </Card>
        }
        renderItem={({ item }) => <FixingDetailCard fixing={item} />}
        ListEmptyComponent={
          <StateView
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !error}
            emptyText={strings.history.empty}
            onRetry={loadHistory}
          >
            <View />
          </StateView>
        }
      />
    </Screen>
  );
}
