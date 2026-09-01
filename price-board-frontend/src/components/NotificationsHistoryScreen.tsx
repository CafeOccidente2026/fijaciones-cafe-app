import React, { useState } from "react";
import { FlatList } from "react-native";
import { Screen } from "./Screen";
import { StateView } from "./StateView";
import { SegmentedControl } from "./SegmentedControl";
import { SentNotificationItem } from "./SentNotificationItem";
import { NotificationsInboxList } from "./NotificationsInboxList";
import { useAsync } from "../hooks/useAsync";
import { useUnreadNotificationsCount } from "../hooks/useUnreadNotificationsCount";
import { NotificationsApi } from "../api/notificationsApi";
import { SentNotification } from "../types/notification.types";
import { strings } from "../constants/strings";

type Tab = "sent" | "received";

/**
 * Single responsibility: an ADMIN/PRICE_MANAGER sender's notification
 * history - what they sent, and what they themselves received, as two
 * segments of the same screen so both are one tap away from each other.
 */
export function NotificationsHistoryScreen() {
  const [tab, setTab] = useState<Tab>("sent");
  const sent = useAsync<SentNotification[]>(() => NotificationsApi.sentByMe());
  const unreadCount = useUnreadNotificationsCount();

  return (
    <Screen title={strings.notificationsHistory.title} scroll={false}>
      <SegmentedControl
        options={[
          { key: "sent" as const, label: strings.notificationsHistory.sentTab },
          { key: "received" as const, label: strings.notificationsHistory.receivedTab, count: unreadCount },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "sent" ? (
        <StateView
          isLoading={sent.isLoading}
          error={sent.error}
          isEmpty={!sent.isLoading && !sent.error && (sent.data?.length ?? 0) === 0}
          emptyText={strings.notificationsHistory.sentEmpty}
          onRetry={sent.reload}
        >
          <FlatList
            data={sent.data ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <SentNotificationItem notification={item} />}
          />
        </StateView>
      ) : (
        <NotificationsInboxList />
      )}
    </Screen>
  );
}
