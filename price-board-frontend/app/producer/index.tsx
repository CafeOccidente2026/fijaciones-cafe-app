import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { AppText } from "../../src/components/AppText";
import { useFocusEffect } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { StateView } from "../../src/components/StateView";
import { Select } from "../../src/components/Select";
import { PrefixedNumberInput } from "../../src/components/PrefixedNumberInput";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { PriceHighlightCard } from "../../src/components/PriceHighlightCard";
import { ConfirmModal } from "../../src/components/ConfirmModal";
import { LogoutButton } from "../../src/components/LogoutButton";
import { useAsync } from "../../src/hooks/useAsync";
import { usePriceNovelty } from "../../src/hooks/usePriceNovelty";
import { useAuth } from "../../src/auth/AuthContext";
import { CoffeeTypesApi } from "../../src/api/coffeeTypesApi";
import { PriceFixingsApi } from "../../src/api/priceFixingsApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { CoffeeType } from "../../src/types/coffeeType.types";
import { formatCurrency } from "../../src/utils/format";
import { strings } from "../../src/constants/strings";

/**
 * Producer home: pick a coffee type, enter kilos, and "fijar" the price
 * (never "anunciar"). The price used is always the server's current one.
 * A badge / red dots flag coffee types whose price changed since this
 * user last looked (see usePriceNovelty).
 */
export default function FixPriceScreen() {
  const { user } = useAuth();
  const { data: coffeeTypes, isLoading, error, reload } = useAsync<CoffeeType[]>(() =>
    CoffeeTypesApi.list()
  );
  const { novelIds, markSeen } = usePriceNovelty(user?.id, coffeeTypes ?? null);

  // Re-fetch prices when returning to this tab, so a price the Encargado
  // changed meanwhile shows up (and flags its "novedad").
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kilos, setKilos] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (coffeeTypes && coffeeTypes.length > 0 && !selectedId) {
      const first = coffeeTypes[0];
      setSelectedId(first.id);
      // Its price is shown right away, so it counts as "seen".
      markSeen(first.id);
    }
  }, [coffeeTypes, selectedId, markSeen]);

  const selectedType = useMemo(
    () => coffeeTypes?.find((type) => type.id === selectedId) ?? null,
    [coffeeTypes, selectedId]
  );

  const parsedKilos = Number(kilos);
  const kilosAreValid = kilos !== "" && Number.isFinite(parsedKilos) && parsedKilos > 0;

  function selectType(value: string) {
    setSelectedId(value);
    markSeen(value);
    setSuccessMessage(null);
  }

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
              {novelIds.size > 0 ? (
                <View className="mb-3 flex-row items-center gap-2">
                  <Badge label={novelIds.size} tone="danger" />
                  <AppText className="flex-1 text-xs text-muted dark:text-muted-dark">
                    {strings.producerFix.priceUpdatesBadge}
                  </AppText>
                </View>
              ) : null}

              <Select
                label={strings.producerFix.coffeeTypeLabel}
                value={selectedId}
                options={(coffeeTypes ?? []).map((type) => ({
                  label: type.name,
                  value: type.id,
                  indicator: novelIds.has(type.id),
                }))}
                onChange={selectType}
              />

              <PrefixedNumberInput
                label={strings.producerFix.kilosLabel}
                prefix={strings.producerFix.kilosPrefix}
                value={kilos}
                onChangeValue={(digits) => {
                  setKilos(digits);
                  setSuccessMessage(null);
                }}
              />

              {formError ? (
                <AppText className="mb-3 text-sm text-danger dark:text-danger-dark">{formError}</AppText>
              ) : null}
              {successMessage ? (
                <View className="mb-3 rounded-xl bg-accent-soft p-3 dark:bg-accent-soft-dark">
                  <AppText className="text-center text-sm font-semibold text-primary dark:text-white">
                    {successMessage}
                  </AppText>
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
