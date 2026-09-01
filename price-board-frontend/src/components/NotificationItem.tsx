import React from "react";
import { View } from "react-native";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { AppNotification } from "../types/notification.types";
import { formatDateTime } from "../utils/format";
import { strings } from "../constants/strings";

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
          className={`mt-1.5 h-2 w-2 rounded-full ${
            notification.read ? "bg-transparent" : "bg-accent dark:bg-accent-dark"
          }`}
        />
        <View className="flex-1">
          <AppText
            className={`text-base ${
              notification.read
                ? "text-primary-light dark:text-muted-dark"
                : "font-semibold text-primary dark:text-white"
            }`}
          >
            {notification.message}
          </AppText>
          <AppText className="mt-1 text-xs text-muted dark:text-muted-dark">
            {strings.notificationsInbox.meta(
              notification.sender.fullName,
              formatDateTime(notification.createdAt)
            )}
          </AppText>
        </View>
      </View>
    </Card>
  );
}
