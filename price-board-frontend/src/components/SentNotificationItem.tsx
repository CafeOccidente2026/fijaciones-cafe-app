import React from "react";
import { Text } from "react-native";
import { Card } from "./Card";
import { SentNotification } from "../types/notification.types";
import { formatDateTime } from "../utils/format";
import { strings } from "../constants/strings";

function audienceLabel(notification: SentNotification): string {
  switch (notification.audience) {
    case "ALL_PRODUCER":
      return strings.notificationsHistory.audienceAllProducer;
    case "ALL_PRICE_MANAGER":
      return strings.notificationsHistory.audienceAllPriceManager;
    case "SPECIFIC":
      return strings.notificationsHistory.audienceSpecific(notification.recipientCount);
  }
}

/**
 * Single responsibility: one row of a notification the current user
 * sent - message, and who it went to plus when (a broadcast audience,
 * or a specific recipient count).
 */
export function SentNotificationItem({ notification }: { notification: SentNotification }) {
  return (
    <Card>
      <Text className="text-base font-semibold text-primary dark:text-white">{notification.message}</Text>
      <Text className="mt-1 text-xs text-muted dark:text-muted-dark">
        {strings.notificationsHistory.meta(audienceLabel(notification), formatDateTime(notification.createdAt))}
      </Text>
    </Card>
  );
}
