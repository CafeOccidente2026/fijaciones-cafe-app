import React, { useState } from "react";
import { FlatList } from "react-native";
import { Screen } from "./Screen";
import { StateView } from "./StateView";
import { NotificationItem } from "./NotificationItem";
import { useAsync } from "../hooks/useAsync";
import { NotificationsApi } from "../api/notificationsApi";
import { AppNotification } from "../types/notification.types";
import { strings } from "../constants/strings";

/**
 * Single responsibility: the notifications inbox, identical for every
 * role. Tapping an unread notification marks it read on the server and
 * locally.
 */
export function NotificationsListScreen() {
  const { data, isLoading, error, reload } = useAsync<AppNotification[]>(() =>
    NotificationsApi.myNotifications()
  );
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  async function handlePress(notification: AppNotification) {
    if (notification.read || readIds.has(notification.notificationRecipientId)) return;
    setReadIds((prev) => new Set(prev).add(notification.notificationRecipientId));
    try {
      await NotificationsApi.markRead(notification.notificationRecipientId);
    } catch {
      // Best-effort: if it fails the dot reappears on the next reload.
      setReadIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.notificationRecipientId);
        return next;
      });
    }
  }

  const items = (data ?? []).map((item) =>
    readIds.has(item.notificationRecipientId) ? { ...item, read: true } : item
  );

  return (
    <Screen title={strings.notificationsInbox.title} scroll={false}>
      <StateView
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && !error && items.length === 0}
        emptyText={strings.notificationsInbox.empty}
        onRetry={reload}
      >
        <FlatList
          data={items}
          keyExtractor={(item) => item.notificationRecipientId}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onPress={() => handlePress(item)} />
          )}
        />
      </StateView>
    </Screen>
  );
}
