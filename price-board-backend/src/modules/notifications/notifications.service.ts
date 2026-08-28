import { NotificationsRepository } from "./notifications.repository";
import { AppError } from "../../utils/apiResponse.util";
import { SendNotificationInput } from "./notifications.validation";

/**
 * Single responsibility: business rules for sending and reading
 * notifications. "all" fans out to every other active user.
 */
export class NotificationsService {
  static async send(senderId: string, input: SendNotificationInput) {
    const recipientIds =
      input.recipientIds === "all"
        ? await NotificationsRepository.findActiveRecipientIds(senderId)
        : Array.from(new Set(input.recipientIds)).filter((id) => id !== senderId);

    if (recipientIds.length === 0) {
      throw new AppError("No hay destinatarios validos para esta notificacion", 400);
    }

    const notification = await NotificationsRepository.createWithRecipients(
      senderId,
      input.message,
      recipientIds
    );

    return { id: notification.id, recipientCount: notification.recipients.length };
  }

  static async getMyNotifications(userId: string) {
    const rows = await NotificationsRepository.findForUser(userId);

    return rows.map((row) => ({
      notificationRecipientId: row.id,
      message: row.notification.message,
      sender: row.notification.sender,
      createdAt: row.notification.createdAt,
      read: row.read,
      readAt: row.readAt,
    }));
  }

  static async markAsRead(notificationRecipientId: string, userId: string) {
    const recipient = await NotificationsRepository.findRecipientById(notificationRecipientId);

    if (!recipient || recipient.userId !== userId) {
      throw new AppError("Notificacion no encontrada", 404);
    }

    if (recipient.read) {
      return { notificationRecipientId, read: true };
    }

    await NotificationsRepository.markAsRead(notificationRecipientId);
    return { notificationRecipientId, read: true };
  }
}
