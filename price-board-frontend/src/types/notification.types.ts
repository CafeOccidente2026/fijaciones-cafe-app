export type NotificationAudience = "ALL_PRODUCER" | "ALL_PRICE_MANAGER" | "SPECIFIC";

export interface AppNotification {
  notificationRecipientId: string;
  message: string;
  sender: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  read: boolean;
  readAt: string | null;
}

export interface SentNotification {
  id: string;
  message: string;
  audience: NotificationAudience;
  createdAt: string;
  recipientCount: number;
}

export interface SendNotificationPayload {
  message: string;
  audience: NotificationAudience;
  /** Required only when audience is "SPECIFIC". */
  recipientIds?: string[];
}
