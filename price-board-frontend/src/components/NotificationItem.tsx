import React from "react";
import { Text, View } from "react-native";
import { Card } from "./Card";
import { AppNotification } from "../types/notification.types";
import { formatDateTime } from "../utils/format";

interface NotificationItemProps {
  notification: AppNotification;
  onPress?: () => void;
}

/**
 * Single responsibility: one notification row - message, sender, date,
 * and an unread dot. Tapping an unread one is what marks it read (the
 * screen wires that through onPress).
 */
export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <Card onPress={onPress}>
      <View className="flex-row items-start gap-2">
        <View
          className={`mt-1.5 h-2 w-2 rounded-full ${notification.read ? "bg-transparent" : "bg-accent"}`}
        />
        <View className="flex-1">
          <Text className={`text-base ${notification.read ? "text-primary-light" : "font-semibold text-primary"}`}>
            {notification.message}
          </Text>
          <Text className="mt-1 text-xs text-muted">
            De {notification.sender.fullName} · {formatDateTime(notification.createdAt)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
