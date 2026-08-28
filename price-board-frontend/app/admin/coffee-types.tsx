import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { StateView } from "../../src/components/StateView";
import { FormField } from "../../src/components/FormField";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useAsync } from "../../src/hooks/useAsync";
import { CoffeeTypesApi } from "../../src/api/coffeeTypesApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { CoffeeType } from "../../src/types/coffeeType.types";
import { formatCurrency } from "../../src/utils/format";

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
      setRowError("Escribe un nombre para el tipo de café");
      return;
    }
    setRowError(null);
    setCreating(true);
    try {
      const parsedPrice = newPrice.trim() ? Number(newPrice.replace(",", ".")) : undefined;
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
    const draft = priceDrafts[type.id];
    const parsed = Number((draft ?? "").replace(",", "."));
    if (!draft || !Number.isFinite(parsed) || parsed < 0) {
      setRowError("Ingresa un precio válido");
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
    <Screen title="Tipos de café" scroll={false}>
      {rowError ? <Text className="px-1 pb-2 text-sm text-danger">{rowError}</Text> : null}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Card className="mb-1">
            <Text className="mb-3 text-base font-bold text-primary">Nuevo tipo de café</Text>
            <FormField label="Nombre" placeholder="Ej. Café Excelso" value={newName} onChangeText={setNewName} />
            <FormField
              label="Precio inicial (opcional)"
              placeholder="Ej. 12000"
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
            />
            <PrimaryButton label="Crear tipo de café" onPress={createType} loading={creating} />
          </Card>
        }
        renderItem={({ item }) => {
          const draft = priceDrafts[item.id] ?? "";
          return (
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 pr-2 text-base font-semibold text-primary">{item.name}</Text>
                <Badge
                  label={item.active ? "Activo" : "Inactivo"}
                  tone={item.active ? "accent" : "muted"}
                />
              </View>
              <Text className="mt-1 text-sm text-muted">
                Precio actual: {formatCurrency(item.currentPrice)} / kg
              </Text>

              <View className="mt-3 flex-row items-end gap-2">
                <View className="flex-1">
                  <FormField
                    label="Nuevo precio"
                    placeholder="Ej. 12500"
                    keyboardType="numeric"
                    value={draft}
                    onChangeText={(text) =>
                      setPriceDrafts((prev) => ({ ...prev, [item.id]: text }))
                    }
                  />
                </View>
                <Pressable
                  onPress={() => savePrice(item)}
                  disabled={busyId === item.id}
                  className="mb-5 items-center rounded-xl bg-primary px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-white">Guardar</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => toggleActive(item)}
                disabled={busyId === item.id}
                className="items-center rounded-xl border border-border py-2.5"
              >
                <Text className="text-sm font-semibold text-primary">
                  {item.active ? "Desactivar" : "Activar"}
                </Text>
              </Pressable>
            </Card>
          );
        }}
        ListEmptyComponent={
          <StateView
            isLoading={isLoading}
            error={error}
            isEmpty={!isLoading && !error}
            emptyText="Aún no hay tipos de café. Crea el primero arriba."
            onRetry={reload}
          >
            <View />
          </StateView>
        }
      />
    </Screen>
  );
}
