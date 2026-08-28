import { httpClient } from "./httpClient";
import { AppNotification, SendNotificationPayload } from "../types/notification.types";

/**
 * Single responsibility: talk to /api/notifications.
 */
export class NotificationsApi {
  static async myNotifications(): Promise<AppNotification[]> {
    const { data } = await httpClient.get("/notifications/my-notifications");
    return data.data as AppNotification[];
  }

  static async send(payload: SendNotificationPayload): Promise<{ id: string; recipientCount: number }> {
    const { data } = await httpClient.post("/notifications", payload);
    return data.data as { id: string; recipientCount: number };
  }

  static async markRead(notificationRecipientId: string): Promise<void> {
    await httpClient.patch(`/notifications/${notificationRecipientId}/read`);
  }
}
