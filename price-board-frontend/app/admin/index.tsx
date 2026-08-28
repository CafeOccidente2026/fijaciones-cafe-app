import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { StateView } from "../../src/components/StateView";
import { ConfirmModal } from "../../src/components/ConfirmModal";
import { useAsync } from "../../src/hooks/useAsync";
import { UsersApi } from "../../src/api/usersApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { AppUser } from "../../src/types/user.types";
import { roleLabel } from "../../src/utils/format";

/**
 * ADMIN "usuarios": list every account with its status, plus
 * suspend/activate and delete (confirmed) actions.
 */
export default function UsersScreen() {
  const router = useRouter();
  const { data, isLoading, error, reload } = useAsync<AppUser[]>(() => UsersApi.list());

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Refresh when coming back from "crear usuario".
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  async function toggleStatus(user: AppUser) {
    setBusyId(user.id);
    setActionError(null);
    try {
      if (user.status === "ACTIVE") await UsersApi.suspend(user.id);
      else await UsersApi.activate(user.id);
      reload();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    setBusyId(userToDelete.id);
    setActionError(null);
    try {
      await UsersApi.remove(userToDelete.id);
      setUserToDelete(null);
      reload();
    } catch (err) {
      setUserToDelete(null);
      setActionError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen
      title="Usuarios"
      scroll={false}
      headerRight={
        <Pressable
          onPress={() => router.push("/admin/create-user")}
          className="rounded-xl bg-primary px-4 py-2"
        >
          <Text className="text-sm font-semibold text-white">+ Crear</Text>
        </Pressable>
      }
    >
      {actionError ? (
        <Text className="px-1 pb-2 text-sm text-danger">{actionError}</Text>
      ) : null}

      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText="No hay usuarios."
        onRetry={reload}
      >
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-semibold text-primary">{item.fullName}</Text>
                  <Text className="text-sm text-muted">@{item.username}</Text>
                  <Text className="text-sm text-muted">
                    {roleLabel(item.role)} · {item.municipality ?? "Sin municipio"}
                  </Text>
                </View>
                <Badge
                  label={item.status === "ACTIVE" ? "Activo" : "Suspendido"}
                  tone={item.status === "ACTIVE" ? "accent" : "danger"}
                />
              </View>

              <View className="mt-3 flex-row gap-3">
                <Pressable
                  onPress={() => toggleStatus(item)}
                  disabled={busyId === item.id}
                  className="flex-1 items-center rounded-xl border border-border py-2.5"
                >
                  <Text className="text-sm font-semibold text-primary">
                    {item.status === "ACTIVE" ? "Suspender" : "Activar"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setUserToDelete(item)}
                  disabled={busyId === item.id}
                  className="flex-1 items-center rounded-xl border border-danger py-2.5"
                >
                  <Text className="text-sm font-semibold text-danger">Eliminar</Text>
                </Pressable>
              </View>
            </Card>
          )}
        />
      </StateView>

      <ConfirmModal
        visible={userToDelete !== null}
        title="Eliminar usuario"
        message={
          userToDelete
            ? `¿Seguro que deseas eliminar a ${userToDelete.fullName}? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        loading={busyId !== null && userToDelete !== null}
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </Screen>
  );
}
