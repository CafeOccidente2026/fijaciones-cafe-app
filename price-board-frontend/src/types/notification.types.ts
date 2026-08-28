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

export type NotificationRecipients = "all" | string[];

export interface SendNotificationPayload {
  message: string;
  recipientIds: NotificationRecipients;
}
