import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { StateView } from "../../src/components/StateView";
import { Select } from "../../src/components/Select";
import { FormField } from "../../src/components/FormField";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { PriceHighlightCard } from "../../src/components/PriceHighlightCard";
import { ConfirmModal } from "../../src/components/ConfirmModal";
import { LogoutButton } from "../../src/components/LogoutButton";
import { useAsync } from "../../src/hooks/useAsync";
import { CoffeeTypesApi } from "../../src/api/coffeeTypesApi";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { CoffeeType } from "../../src/types/coffeeType.types";
import { formatCurrency } from "../../src/utils/format";
import { strings } from "../../src/constants/strings";

/**
 * Producer home: pick a coffee type, enter kilos, and "fijar" the price
 * (never "anunciar"). The price used is always the server's current one.
 */
export default function FixPriceScreen() {
  const { data: coffeeTypes, isLoading, error, reload } = useAsync<CoffeeType[]>(() =>
    CoffeeTypesApi.list()
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kilos, setKilos] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (coffeeTypes && coffeeTypes.length > 0 && !selectedId) {
      setSelectedId(coffeeTypes[0].id);
    }
  }, [coffeeTypes, selectedId]);

  const selectedType = useMemo(
    () => coffeeTypes?.find((type) => type.id === selectedId) ?? null,
    [coffeeTypes, selectedId]
  );

  const parsedKilos = Number(kilos.replace(",", "."));
  const kilosAreValid = kilos.trim() !== "" && Number.isFinite(parsedKilos) && parsedKilos > 0;

  function openConfirm() {
    setSuccessMessage(null);
    if (!selectedType) {
      setFormError(strings.producerFix.selectCoffeeType);
      return;
    }
    if (!kilosAreValid) {
      setFormError(strings.producerFix.invalidKilos);
      return;
    }
    setFormError(null);
    setConfirmOpen(true);
  }

  async function confirmFixing() {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      await PriceFixingsApi.create({ coffeeTypeId: selectedType.id, kilos: parsedKilos });
      setConfirmOpen(false);
      setKilos("");
      setSuccessMessage(strings.producerFix.success);
    } catch (err) {
      setConfirmOpen(false);
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title={strings.producerFix.title} headerRight={<LogoutButton />}>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (coffeeTypes?.length ?? 0) === 0}
        emptyText={strings.producerFix.emptyCoffeeTypes}
        onRetry={reload}
      >
        {selectedType ? (
          <>
            <PriceHighlightCard
              coffeeTypeName={selectedType.name}
              price={selectedType.currentPrice}
              updatedAt={selectedType.updatedAt}
            />

            <Card>
              <Select
                label={strings.producerFix.coffeeTypeLabel}
                value={selectedId}
                options={(coffeeTypes ?? []).map((type) => ({ label: type.name, value: type.id }))}
                onChange={(value) => {
                  setSelectedId(value);
                  setSuccessMessage(null);
                }}
              />

              <FormField
                label={strings.producerFix.kilosLabel}
                placeholder={strings.producerFix.kilosPlaceholder}
                keyboardType="numeric"
                value={kilos}
                onChangeText={(text) => {
                  setKilos(text);
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

              <PrimaryButton label={strings.producerFix.fixButton} onPress={openConfirm} />
            </Card>
          </>
        ) : null}
      </StateView>

      <ConfirmModal
        visible={confirmOpen}
        message={
          selectedType
            ? strings.producerFix.confirmMessage(
                parsedKilos,
                selectedType.name,
                formatCurrency(selectedType.currentPrice)
              )
            : ""
        }
        confirmLabel={strings.common.accept}
        cancelLabel={strings.common.cancel}
        loading={submitting}
        onConfirm={confirmFixing}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
