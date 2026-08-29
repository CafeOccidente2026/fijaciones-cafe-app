import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "./Screen";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { StateView } from "./StateView";
import { PrimaryButton } from "./PrimaryButton";
import { UnreadBadge } from "./UnreadBadge";
import { useAsync } from "../hooks/useAsync";
import { useUnreadNotificationsCount } from "../hooks/useUnreadNotificationsCount";
import { useThemeColors } from "../theme/useThemeColors";
import { useAuth } from "../auth/AuthContext";
import { UsersApi } from "../api/usersApi";
import { NotificationsApi } from "../api/notificationsApi";
import { getApiErrorMessage } from "../api/apiError";
import { AppUser } from "../types/user.types";
import { NotificationAudience } from "../types/notification.types";
import { roleLabel } from "../utils/format";
import { strings } from "../constants/strings";

/**
 * "Enviar notificación": a message plus a target audience. Shared by
 * PRICE_MANAGER (2 audiences, recipients drawn only from Fieles de
 * Compra) and ADMIN (3 audiences, recipients drawn from both Fieles de
 * Compra and Encargados). The backend re-validates the same rules per
 * role regardless of what this form sends.
 */
export function SendNotificationScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const historyRoute = isAdmin ? "/admin/notifications-history" : "/price-manager/notifications-history";
  const unreadCount = useUnreadNotificationsCount();

  const { data: candidates, isLoading, error, reload } = useAsync<AppUser[]>(
    () => (isAdmin ? UsersApi.list() : UsersApi.list("PRODUCER")),
    [isAdmin]
  );
  // An admin's own account can come back in the unfiltered list; it's
  // never a valid recipient of its own broadcast.
  const recipientOptions = useMemo(
    () => (candidates ?? []).filter((candidate) => candidate.role !== "ADMIN"),
    [candidates]
  );

  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<NotificationAudience>("ALL_PRODUCER");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The audience choices are mutually exclusive: switching away from
  // "específicos" drops any hand-picked selection, and vice versa.
  function chooseAudience(next: NotificationAudience) {
    setAudience(next);
    setSelectedIds(new Set());
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
    const recipientIds = Array.from(selectedIds);
    if (audience === "SPECIFIC" && recipientIds.length === 0) {
      setFormError(strings.sendNotification.missingRecipients);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await NotificationsApi.send({
        message: message.trim(),
        audience,
        recipientIds: audience === "SPECIFIC" ? recipientIds : undefined,
      });
      setSuccessMessage(strings.sendNotification.success(result.recipientCount));
      setMessage("");
      chooseAudience("ALL_PRODUCER");
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen
      title={strings.sendNotification.title}
      headerRight={
        <Pressable
          onPress={() => router.push(historyRoute)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={strings.sendNotification.historyButtonLabel}
          className="relative rounded-lg p-1 hover:opacity-80 active:opacity-60"
        >
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <UnreadBadge count={unreadCount} />
        </Pressable>
      }
    >
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
        {isAdmin ? (
          <AudienceOption
            checked={audience === "ALL_PRICE_MANAGER"}
            label={strings.sendNotification.toAllPriceManagers}
            onPress={() => chooseAudience("ALL_PRICE_MANAGER")}
          />
        ) : null}
        <AudienceOption
          checked={audience === "ALL_PRODUCER"}
          label={strings.sendNotification.toAll}
          onPress={() => chooseAudience("ALL_PRODUCER")}
        />
        <AudienceOption
          checked={audience === "SPECIFIC"}
          label={strings.sendNotification.toSpecific}
          onPress={() => chooseAudience("SPECIFIC")}
          isLast
        />
      </Card>

      {audience === "SPECIFIC" ? (
        <StateView
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && recipientOptions.length === 0}
          emptyText={isAdmin ? strings.sendNotification.emptyAdmin : strings.sendNotification.empty}
          onRetry={reload}
        >
          <Card>
            {recipientOptions.map((candidate) => {
              const checked = selectedIds.has(candidate.id);
              return (
                <Pressable
                  key={candidate.id}
                  onPress={() => toggle(candidate.id)}
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
                    <Text className="text-base text-primary dark:text-white">{candidate.fullName}</Text>
                    <Text className="text-xs text-muted dark:text-muted-dark">
                      {candidate.municipality ?? strings.common.noMunicipality}
                    </Text>
                  </View>
                  {isAdmin ? <Badge label={roleLabel(candidate.role)} tone="muted" /> : null}
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

function AudienceOption({
  checked,
  label,
  onPress,
  isLast,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked }}
      className={`flex-row items-center gap-3 rounded-xl border p-3 hover:opacity-90 active:opacity-80 ${
        isLast ? "" : "mb-2"
      } ${
        checked
          ? "border-accent bg-accent-soft dark:border-accent-dark dark:bg-accent-soft-dark"
          : "border-border dark:border-border-dark"
      }`}
    >
      <View
        className={`h-4 w-4 items-center justify-center rounded-full border ${
          checked ? "border-accent dark:border-accent-dark" : "border-muted"
        }`}
      >
        {checked ? <View className="h-2 w-2 rounded-full bg-accent dark:bg-accent-dark" /> : null}
      </View>
      <Text className="text-base text-primary dark:text-white">{label}</Text>
    </Pressable>
  );
}
