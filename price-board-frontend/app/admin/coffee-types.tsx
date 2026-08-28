import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { StateView } from "../../src/components/StateView";
import { FormField } from "../../src/components/FormField";
import { CurrencyInput } from "../../src/components/CurrencyInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useAsync } from "../../src/hooks/useAsync";
import { CoffeeTypesApi } from "../../src/api/coffeeTypesApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { CoffeeType } from "../../src/types/coffeeType.types";
import { formatCurrency, parseThousands } from "../../src/utils/format";
import { strings } from "../../src/constants/strings";

/**
 * ADMIN "tipos de café": every type (active and inactive), a form to
 * create one, and per row: activate/deactivate + change current price
 * (same endpoint the PRICE_MANAGER uses).
 */
export default function CoffeeTypesScreen() {
  const { data, isLoading, error, reload } = useAsync<CoffeeType[]>(() =>
    CoffeeTypesApi.list(true)
  );

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function createType() {
    if (!newName.trim()) {
      setRowError(strings.adminCoffeeTypes.missingName);
      return;
    }
    setRowError(null);
    setCreating(true);
    try {
      const parsedPrice = parseThousands(newPrice);
      await CoffeeTypesApi.create({
        name: newName.trim(),
        currentPrice: Number.isFinite(parsedPrice) ? parsedPrice : undefined,
      });
      setNewName("");
      setNewPrice("");
      reload();
    } catch (err) {
      setRowError(getApiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(type: CoffeeType) {
    setBusyId(type.id);
    setRowError(null);
    try {
      await CoffeeTypesApi.setActive(type.id, !type.active);
      reload();
    } catch (err) {
      setRowError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function savePrice(type: CoffeeType) {
    const parsed = parseThousands(priceDrafts[type.id] ?? "");
    if (!Number.isFinite(parsed) || parsed < 0) {
      setRowError(strings.adminCoffeeTypes.invalidPrice);
      return;
    }
    setBusyId(type.id);
    setRowError(null);
    try {
      await CoffeeTypesApi.updatePrice(type.id, parsed);
      setPriceDrafts((prev) => {
        const next = { ...prev };
        delete next[type.id];
        return next;
      });
      reload();
    } catch (err) {
      setRowError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen title={strings.adminCoffeeTypes.title} scroll={false}>
      {rowError ? (
        <Text className="px-1 pb-2 text-sm text-danger dark:text-danger-dark">{rowError}</Text>
      ) : null}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Card className="mb-1">
            <Text className="mb-3 text-base font-bold text-primary dark:text-white">
              {strings.adminCoffeeTypes.newTypeTitle}
            </Text>
            <FormField
              label={strings.adminCoffeeTypes.nameLabel}
              placeholder={strings.adminCoffeeTypes.namePlaceholder}
              value={newName}
              onChangeText={setNewName}
            />
            <CurrencyInput
              label={strings.adminCoffeeTypes.initialPriceLabel}
              placeholder={strings.adminCoffeeTypes.initialPricePlaceholder}
              value={newPrice}
              onChangeValue={setNewPrice}
            />
            <PrimaryButton
              label={strings.adminCoffeeTypes.createButton}
              onPress={createType}
              loading={creating}
            />
          </Card>
        }
        renderItem={({ item }) => (
          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 pr-2 text-base font-semibold text-primary dark:text-white">
                {item.name}
              </Text>
              <Badge
                label={
                  item.active
                    ? strings.adminCoffeeTypes.statusActive
                    : strings.adminCoffeeTypes.statusInactive
                }
                tone={item.active ? "accent" : "muted"}
              />
            </View>
            <Text className="mt-1 text-sm text-muted dark:text-muted-dark">
              {strings.adminCoffeeTypes.currentPrice(formatCurrency(item.currentPrice))}
            </Text>

            <View className="mt-3 flex-row items-end gap-2">
              <View className="flex-1">
                <CurrencyInput
                  label={strings.adminCoffeeTypes.newPriceLabel}
                  placeholder={strings.adminCoffeeTypes.newPricePlaceholder}
                  value={priceDrafts[item.id] ?? ""}
                  onChangeValue={(digits) =>
                    setPriceDrafts((prev) => ({ ...prev, [item.id]: digits }))
                  }
                />
              </View>
              <Pressable
                onPress={() => savePrice(item)}
                disabled={busyId === item.id}
                className="mb-5 items-center rounded-xl bg-primary px-4 py-3 hover:opacity-90 active:opacity-80 dark:bg-primary-dark"
              >
                <Text className="text-sm font-semibold text-white">
                  {strings.adminCoffeeTypes.save}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => toggleActive(item)}
              disabled={busyId === item.id}
              className="items-center rounded-xl border border-border py-2.5 hover:opacity-90 active:opacity-80 dark:border-border-dark"
            >
              <Text className="text-sm font-semibold text-primary dark:text-white">
                {item.active
                  ? strings.adminCoffeeTypes.deactivate
                  : strings.adminCoffeeTypes.activate}
              </Text>
            </Pressable>
          </Card>
        )}
        ListEmptyComponent={
          <StateView
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !error}
            emptyText={strings.adminCoffeeTypes.empty}
            onRetry={reload}
          >
            <View />
          </StateView>
        }
      />
    </Screen>
  );
}
