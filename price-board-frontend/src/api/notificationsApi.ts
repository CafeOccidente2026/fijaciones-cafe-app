import { httpClient } from "./httpClient";
import {
  AppNotification,
  NotificationAudience,
  SendNotificationPayload,
  SentNotification,
} from "../types/notification.types";

/**
 * Single responsibility: talk to /api/notifications.
 */
export class NotificationsApi {
  static async myNotifications(): Promise<AppNotification[]> {
    const { data } = await httpClient.get("/notifications/my-notifications");
    return data.data as AppNotification[];
  }

  static async sentByMe(): Promise<SentNotification[]> {
    const { data } = await httpClient.get("/notifications/sent-by-me");
    return data.data as SentNotification[];
  }

  static async send(
    payload: SendNotificationPayload
  ): Promise<{ id: string; audience: NotificationAudience; recipientCount: number }> {
    const { data } = await httpClient.post("/notifications", payload);
    return data.data as { id: string; audience: NotificationAudience; recipientCount: number };
  }

  static async markRead(notificationRecipientId: string): Promise<void> {
    await httpClient.patch(`/notifications/${notificationRecipientId}/read`);
  }
}
