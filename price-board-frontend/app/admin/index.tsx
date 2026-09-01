import React, { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { AppText } from "../../src/components/AppText";
import { useFocusEffect, useRouter } from "expo-router";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { StateView } from "../../src/components/StateView";
import { ConfirmModal } from "../../src/components/ConfirmModal";
import { LogoutButton } from "../../src/components/LogoutButton";
import { useAsync } from "../../src/hooks/useAsync";
import { UsersApi } from "../../src/api/usersApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { AppUser } from "../../src/types/user.types";
import { roleLabel } from "../../src/utils/format";
import { strings } from "../../src/constants/strings";

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
      title={strings.adminUsers.title}
      scroll={false}
      headerRight={
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.push("/admin/create-user")}
            className="rounded-xl bg-primary px-4 py-2 hover:opacity-90 active:opacity-80 dark:bg-primary-dark"
          >
            <AppText className="text-sm font-semibold text-white">{strings.adminUsers.createButton}</AppText>
          </Pressable>
          <LogoutButton />
        </View>
      }
    >
      {actionError ? (
        <AppText className="px-1 pb-2 text-sm text-danger dark:text-danger-dark">{actionError}</AppText>
      ) : null}

      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && (data?.length ?? 0) === 0}
        emptyText={strings.adminUsers.empty}
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
                  <AppText className="text-base font-semibold text-primary dark:text-white">
                    {item.fullName}
                  </AppText>
                  <AppText className="text-sm text-muted dark:text-muted-dark">@{item.username}</AppText>
                  <AppText className="text-sm text-muted dark:text-muted-dark">
                    {strings.adminUsers.meta(
                      roleLabel(item.role),
                      item.municipality ?? strings.common.noMunicipality
                    )}
                  </AppText>
                </View>
                <Badge
                  label={
                    item.status === "ACTIVE"
                      ? strings.adminUsers.statusActive
                      : strings.adminUsers.statusSuspended
                  }
                  tone={item.status === "ACTIVE" ? "accent" : "danger"}
                />
              </View>

              <View className="mt-3 flex-row gap-3">
                <Pressable
                  onPress={() => toggleStatus(item)}
                  disabled={busyId === item.id}
                  className="flex-1 items-center rounded-xl border border-border py-2.5 hover:opacity-90 active:opacity-70 dark:border-border-dark"
                >
                  <AppText className="text-sm font-semibold text-primary dark:text-white">
                    {item.status === "ACTIVE" ? strings.adminUsers.suspend : strings.adminUsers.activate}
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => setUserToDelete(item)}
                  disabled={busyId === item.id}
                  className="flex-1 items-center rounded-xl border border-danger py-2.5 hover:opacity-90 active:opacity-70 dark:border-danger-dark"
                >
                  <AppText className="text-sm font-semibold text-danger dark:text-danger-dark">
                    {strings.adminUsers.delete}
                  </AppText>
                </Pressable>
              </View>
            </Card>
          )}
        />
      </StateView>

      <ConfirmModal
        visible={userToDelete !== null}
        title={strings.adminUsers.deleteTitle}
        message={userToDelete ? strings.adminUsers.deleteMessage(userToDelete.fullName) : ""}
        confirmLabel={strings.adminUsers.delete}
        loading={busyId !== null && userToDelete !== null}
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </Screen>
  );
}
