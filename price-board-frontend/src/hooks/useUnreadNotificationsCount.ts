import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { NotificationsApi } from "../api/notificationsApi";
import { onUnreadNotificationsChanged } from "../notifications/unreadNotificationsBus";

/**
 * Single responsibility: how many of the current user's notifications
 * are unread. Refetches on mount, whenever the screen using it regains
 * focus, and whenever something elsewhere signals a change (a
 * notification was read, or a push arrived) via the shared bus.
 */
export function useUnreadNotificationsCount(): number {
  const [count, setCount] = useState(0);

  const reload = useCallback(() => {
    NotificationsApi.myNotifications()
      .then((notifications) => setCount(notifications.filter((notification) => !notification.read).length))
      .catch(() => {
        // Best-effort: a badge that fails to refresh just keeps its last value.
      });
  }, []);

  useEffect(reload, [reload]);
  useFocusEffect(useCallback(() => reload(), [reload]));
  useEffect(() => onUnreadNotificationsChanged(reload), [reload]);

  return count;
}
