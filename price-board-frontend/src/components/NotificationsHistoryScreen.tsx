import React, { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Screen } from "./Screen";
import { StateView } from "./StateView";
import { SentNotificationItem } from "./SentNotificationItem";
import { NotificationsInboxList } from "./NotificationsInboxList";
import { useAsync } from "../hooks/useAsync";
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

  return (
    <Screen title={strings.notificationsHistory.title} scroll={false}>
      <SegmentedControl
        options={[
          { key: "sent" as const, label: strings.notificationsHistory.sentTab },
          { key: "received" as const, label: strings.notificationsHistory.receivedTab },
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

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="mb-3 flex-row gap-2">
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={`flex-1 items-center rounded-xl border py-2.5 hover:opacity-90 active:opacity-80 ${
              active
                ? "border-accent bg-accent-soft dark:border-accent-dark dark:bg-accent-soft-dark"
                : "border-border dark:border-border-dark"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                active ? "text-primary dark:text-white" : "text-muted dark:text-muted-dark"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
