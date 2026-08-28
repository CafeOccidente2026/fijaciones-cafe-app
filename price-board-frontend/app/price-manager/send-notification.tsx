import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../src/components/Screen";
import { Card } from "../../src/components/Card";
import { StateView } from "../../src/components/StateView";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { useAsync } from "../../src/hooks/useAsync";
import { useThemeColors } from "../../src/theme/useThemeColors";
import { UsersApi } from "../../src/api/usersApi";
import { NotificationsApi } from "../../src/api/notificationsApi";
import { getApiErrorMessage } from "../../src/api/apiError";
import { AppUser } from "../../src/types/user.types";
import { strings } from "../../src/constants/strings";

/**
 * PRICE_MANAGER "enviar notificación": a message plus a target - all
 * "fieles de compra", or a hand-picked subset.
 */
export default function SendNotificationScreen() {
  const colors = useThemeColors();
  const { data: producers, isLoading, error, reload } = useAsync<AppUser[]>(() =>
    UsersApi.list("PRODUCER")
  );

  const [message, setMessage] = useState("");
  const [toAll, setToAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const recipientIds = useMemo(() => {
    if (toAll) return (producers ?? []).map((producer) => producer.id);
    return Array.from(selectedIds);
  }, [toAll, producers, selectedIds]);

  // The two modes are mutually exclusive: picking "a todos" drops any
  // specific selection so the two can never be combined.
  function chooseAll() {
    setToAll(true);
    setSelectedIds(new Set());
    setSuccessMessage(null);
  }

  function chooseSpecific() {
    setToAll(false);
    setSuccessMessage(null);
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setSuccessMessage(null);
    if (!message.trim()) {
      setFormError(strings.sendNotification.missingMessage);
      return;
    }
    if (recipientIds.length === 0) {
      setFormError(strings.sendNotification.missingRecipients);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await NotificationsApi.send({ message: message.trim(), recipientIds });
      setSuccessMessage(strings.sendNotification.success(result.recipientCount));
      setMessage("");
      setSelectedIds(new Set());
      setToAll(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen title={strings.sendNotification.title}>
      <Card>
        <Text className="mb-2 text-xs font-semibold tracking-wide text-muted dark:text-muted-dark">
          {strings.sendNotification.messageLabel.toUpperCase()}
        </Text>
        <TextInput
          placeholder={strings.sendNotification.messagePlaceholder}
          placeholderTextColor={colors.placeholder}
          multiline
          value={message}
          onChangeText={setMessage}
          className="min-h-[96px] rounded-xl border border-border bg-background px-4 py-3 text-base text-primary dark:border-border-dark dark:bg-background-dark dark:text-white"
          style={{ textAlignVertical: "top" }}
        />
      </Card>

      <Card>
        <Pressable
          onPress={chooseAll}
          accessibilityRole="radio"
          accessibilityState={{ checked: toAll }}
          className={`mb-2 flex-row items-center gap-3 rounded-xl border p-3 hover:opacity-90 active:opacity-80 ${
            toAll
              ? "border-accent bg-accent-soft dark:border-accent-dark dark:bg-accent-soft-dark"
              : "border-border dark:border-border-dark"
          }`}
        >
          <View
            className={`h-4 w-4 items-center justify-center rounded-full border ${
              toAll ? "border-accent dark:border-accent-dark" : "border-muted"
            }`}
          >
            {toAll ? <View className="h-2 w-2 rounded-full bg-accent dark:bg-accent-dark" /> : null}
          </View>
          <Text className="text-base text-primary dark:text-white">{strings.sendNotification.toAll}</Text>
        </Pressable>
        <Pressable
          onPress={chooseSpecific}
          accessibilityRole="radio"
          accessibilityState={{ checked: !toAll }}
          className={`flex-row items-center gap-3 rounded-xl border p-3 hover:opacity-90 active:opacity-80 ${
            !toAll
              ? "border-accent bg-accent-soft dark:border-accent-dark dark:bg-accent-soft-dark"
              : "border-border dark:border-border-dark"
          }`}
        >
          <View
            className={`h-4 w-4 items-center justify-center rounded-full border ${
              !toAll ? "border-accent dark:border-accent-dark" : "border-muted"
            }`}
          >
            {!toAll ? <View className="h-2 w-2 rounded-full bg-accent dark:bg-accent-dark" /> : null}
          </View>
          <Text className="text-base text-primary dark:text-white">
            {strings.sendNotification.toSpecific}
          </Text>
        </Pressable>
      </Card>

      {!toAll ? (
        <StateView
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && (producers?.length ?? 0) === 0}
          emptyText={strings.sendNotification.empty}
          onRetry={reload}
        >
          <Card>
            {(producers ?? []).map((producer) => {
              const checked = selectedIds.has(producer.id);
              return (
                <Pressable
                  key={producer.id}
                  onPress={() => toggle(producer.id)}
                  className="flex-row items-center gap-3 border-b border-border py-3 hover:opacity-90 active:opacity-70 dark:border-border-dark"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded border ${
                      checked
                        ? "border-accent bg-accent dark:border-accent-dark dark:bg-accent-dark"
                        : "border-muted"
                    }`}
                  >
                    {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base text-primary dark:text-white">{producer.fullName}</Text>
                    <Text className="text-xs text-muted dark:text-muted-dark">
                      {producer.municipality ?? strings.common.noMunicipality}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </StateView>
      ) : null}

      {formError ? (
        <Text className="text-sm text-danger dark:text-danger-dark">{formError}</Text>
      ) : null}
      {successMessage ? (
        <View className="rounded-xl bg-accent-soft p-3 dark:bg-accent-soft-dark">
          <Text className="text-center text-sm font-semibold text-primary dark:text-white">
            {successMessage}
          </Text>
        </View>
      ) : null}

      <PrimaryButton label={strings.sendNotification.sendButton} onPress={submit} loading={submitting} />
    </Screen>
  );
}
