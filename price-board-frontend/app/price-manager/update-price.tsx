import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { StateView } from "../../src/components/StateView";
import { Select } from "../../src/components/Select";
import { FormField } from "../../src/components/FormField";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useAsync } from "../../src/hooks/useAsync";
import { CoffeeTypesApi } from "../../src/api/coffeeTypesApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { CoffeeType } from "../../src/types/coffeeType.types";
import { formatCurrency } from "../../src/utils/format";

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
    const parsed = Number(price.replace(",", "."));
    if (!selectedType) {
      setFormError("Selecciona un tipo de café");
      return;
    }
    if (!Number.isFinite(parsed) || parsed < 0) {
      setFormError("Ingresa un precio válido");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const updated = await CoffeeTypesApi.updatePrice(selectedType.id, parsed);
      setSuccessMessage(`Precio de ${updated.name} actualizado a ${formatCurrency(updated.currentPrice)}`);
      setPrice("");
      reload();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Actualizar precio">
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (coffeeTypes?.length ?? 0) === 0}
        emptyText="No hay tipos de café registrados."
        onRetry={reload}
      >
        <Card>
          <Select
            label="Tipo de café"
            value={selectedId}
            options={(coffeeTypes ?? []).map((type) => ({
              label: `${type.name} — ${formatCurrency(type.currentPrice)}`,
              value: type.id,
            }))}
            onChange={(value) => {
              setSelectedId(value);
              setSuccessMessage(null);
            }}
          />

          {selectedType ? (
            <Text className="mb-3 text-sm text-muted">
              Precio actual: {formatCurrency(selectedType.currentPrice)} / kg
            </Text>
          ) : null}

          <FormField
            label="Nuevo precio por kg"
            placeholder="Ej. 12500"
            keyboardType="numeric"
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              setSuccessMessage(null);
            }}
          />

          {formError ? <Text className="mb-3 text-sm text-danger">{formError}</Text> : null}
          {successMessage ? (
            <View className="mb-3 rounded-xl bg-accent-light p-3">
              <Text className="text-center text-sm font-semibold text-primary">{successMessage}</Text>
            </View>
          ) : null}

          <PrimaryButton label="Guardar precio" onPress={submit} loading={submitting} />
        </Card>
      </StateView>
    </Screen>
  );
}
