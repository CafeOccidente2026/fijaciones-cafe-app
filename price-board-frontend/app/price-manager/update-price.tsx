import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { StateView } from "../../src/components/StateView";
import { Select } from "../../src/components/Select";
import { CurrencyInput } from "../../src/components/CurrencyInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useAsync } from "../../src/hooks/useAsync";
import { CoffeeTypesApi } from "../../src/api/coffeeTypesApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { CoffeeType } from "../../src/types/coffeeType.types";
import { formatCurrency, parseThousands } from "../../src/utils/format";
import { strings } from "../../src/constants/strings";

/**
 * PRICE_MANAGER "actualizar precio": choose a coffee type, set the new
 * price. Each change is logged server-side in PriceHistory.
 */
export default function UpdatePriceScreen() {
  const { data: coffeeTypes, isLoading, error, reload } = useAsync<CoffeeType[]>(() =>
    CoffeeTypesApi.list()
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedType = useMemo(
    () => coffeeTypes?.find((type) => type.id === selectedId) ?? null,
    [coffeeTypes, selectedId]
  );

  async function submit() {
    setSuccessMessage(null);
    const parsed = parseThousands(price);
    if (!selectedType) {
      setFormError(strings.updatePrice.selectCoffeeType);
      return;
    }
    if (!Number.isFinite(parsed) || parsed < 0) {
      setFormError(strings.updatePrice.invalidPrice);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const updated = await CoffeeTypesApi.updatePrice(selectedType.id, parsed);
      setSuccessMessage(
        strings.updatePrice.success(updated.name, formatCurrency(updated.currentPrice))
      );
      setPrice("");
      reload();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title={strings.updatePrice.title}>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (coffeeTypes?.length ?? 0) === 0}
        emptyText={strings.updatePrice.empty}
        onRetry={reload}
      >
        <Card>
          <Select
            label={strings.updatePrice.coffeeTypeLabel}
            value={selectedId}
            options={(coffeeTypes ?? []).map((type) => ({
              label: strings.updatePrice.optionLabel(type.name, formatCurrency(type.currentPrice)),
              value: type.id,
            }))}
            onChange={(value) => {
              setSelectedId(value);
              setSuccessMessage(null);
            }}
          />

          {selectedType ? (
            <Text className="mb-3 text-sm text-muted dark:text-muted-dark">
              {strings.updatePrice.currentPrice(formatCurrency(selectedType.currentPrice))}
            </Text>
          ) : null}

          <CurrencyInput
            label={strings.updatePrice.newPriceLabel}
            placeholder={strings.updatePrice.newPricePlaceholder}
            value={price}
            onChangeValue={(digits) => {
              setPrice(digits);
              setSuccessMessage(null);
            }}
          />

          {formError ? (
            <Text className="mb-3 text-sm text-danger dark:text-danger-dark">{formError}</Text>
          ) : null}
          {successMessage ? (
            <View className="mb-3 rounded-xl bg-accent-soft p-3 dark:bg-accent-soft-dark">
              <Text className="text-center text-sm font-semibold text-primary dark:text-white">
                {successMessage}
              </Text>
            </View>
          ) : null}

          <PrimaryButton label={strings.updatePrice.saveButton} onPress={submit} loading={submitting} />
        </Card>
      </StateView>
    </Screen>
  );
}
