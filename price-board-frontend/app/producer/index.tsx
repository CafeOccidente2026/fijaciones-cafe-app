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
import { useAsync } from "../../src/hooks/useAsync";
import { CoffeeTypesApi } from "../../src/api/coffeeTypesApi";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { CoffeeType } from "../../src/types/coffeeType.types";
import { formatCurrency } from "../../src/utils/format";

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
      setFormError("Selecciona un tipo de cafe");
      return;
    }
    if (!kilosAreValid) {
      setFormError("Ingresa una cantidad de kilos valida");
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
      setSuccessMessage("Tu fijación fue registrada correctamente");
    } catch (err) {
      setConfirmOpen(false);
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Fijar precio">
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (coffeeTypes?.length ?? 0) === 0}
        emptyText="Aún no hay tipos de café disponibles."
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
                label="Tipo de cafe"
                value={selectedId}
                options={(coffeeTypes ?? []).map((type) => ({ label: type.name, value: type.id }))}
                onChange={(value) => {
                  setSelectedId(value);
                  setSuccessMessage(null);
                }}
              />

              <FormField
                label="Kilos a fijar"
                placeholder="Ej. 27"
                keyboardType="numeric"
                value={kilos}
                onChangeText={(text) => {
                  setKilos(text);
                  setSuccessMessage(null);
                }}
              />

              {formError ? <Text className="mb-3 text-sm text-danger">{formError}</Text> : null}
              {successMessage ? (
                <View className="mb-3 rounded-xl bg-accent-light p-3">
                  <Text className="text-center text-sm font-semibold text-primary">{successMessage}</Text>
                </View>
              ) : null}

              <PrimaryButton label="Fijar precio" onPress={openConfirm} />
            </Card>
          </>
        ) : null}
      </StateView>

      <ConfirmModal
        visible={confirmOpen}
        message={
          selectedType
            ? `¿Está seguro que desea fijar ${parsedKilos} kg de café ${selectedType.name} a ${formatCurrency(
                selectedType.currentPrice
              )}?`
            : ""
        }
        confirmLabel="Aceptar"
        cancelLabel="Cancelar"
        loading={submitting}
        onConfirm={confirmFixing}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}
