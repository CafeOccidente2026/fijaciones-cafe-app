import { NotificationAudience, Role } from "@prisma/client";
import { NotificationsRepository } from "./notifications.repository";
import { UsersRepository } from "../users/users.repository";
import { AppError } from "../../utils/apiResponse.util";
import { SendNotificationInput } from "./notifications.validation";
import { PushNotificationService } from "../../services/pushNotification.service";

/**
 * Single responsibility: business rules for sending and reading
 * notifications. Who a sender is allowed to notify depends on their
 * role, so that check lives here (not in the route's `authorize`, which
 * only knows the role - not the request body).
 */
export class NotificationsService {
  static async send(senderId: string, senderRole: Role, input: SendNotificationInput) {
    if (senderRole === Role.PRICE_MANAGER) {
      if (input.audience === NotificationAudience.ALL_PRICE_MANAGER) {
        throw new AppError("No tienes permiso para notificar a otros encargados", 403);
      }
      if (input.audience === NotificationAudience.SPECIFIC) {
        await this.assertRecipientsHaveRole(
          input.recipientIds ?? [],
          [Role.PRODUCER],
          "Solo puedes notificar a Fieles de Compra"
        );
      }
    } else if (input.audience === NotificationAudience.SPECIFIC) {
      // Only ADMIN and PRICE_MANAGER reach this service (see notifications.routes.ts).
      await this.assertRecipientsHaveRole(
        input.recipientIds ?? [],
        [Role.PRODUCER, Role.PRICE_MANAGER],
        "Solo puedes notificar a Fieles de Compra o Encargados"
      );
    }

    const recipientIds = await this.resolveRecipientIds(input.audience, input.recipientIds);

    if (recipientIds.length === 0) {
      throw new AppError("No hay destinatarios validos para esta notificacion", 400);
    }

    const notification = await NotificationsRepository.createWithRecipients(
      senderId,
      input.message,
      input.audience,
      recipientIds
    );

    try {
      await PushNotificationService.sendPushToUsers(recipientIds, "Nueva notificacion", input.message);
    } catch (error) {
      console.error("[notifications] push failed:", error);
    }

    return {
      id: notification.id,
      audience: notification.audience,
      recipientCount: notification.recipients.length,
    };
  }

  static async getSentByMe(senderId: string) {
    const notifications = await NotificationsRepository.findSentByUser(senderId);

    return notifications.map((notification) => ({
      id: notification.id,
      message: notification.message,
      audience: notification.audience,
      createdAt: notification.createdAt,
      recipientCount: notification._count.recipients,
    }));
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

  /** Resolves the audience picked in the request to the actual recipient ids. */
  private static async resolveRecipientIds(
    audience: NotificationAudience,
    recipientIds?: string[]
  ): Promise<string[]> {
    switch (audience) {
      case NotificationAudience.ALL_PRODUCER:
        return UsersRepository.findActiveIdsByRole(Role.PRODUCER);
      case NotificationAudience.ALL_PRICE_MANAGER:
        return UsersRepository.findActiveIdsByRole(Role.PRICE_MANAGER);
      case NotificationAudience.SPECIFIC:
        return Array.from(new Set(recipientIds ?? []));
    }
  }

  /** Rejects the request (403) unless every recipient has one of the allowed roles. */
  private static async assertRecipientsHaveRole(
    recipientIds: string[],
    allowedRoles: Role[],
    errorMessage: string
  ): Promise<void> {
    const users = await UsersRepository.findByIds(recipientIds);
    const allValid = users.length === recipientIds.length && users.every((user) => allowedRoles.includes(user.role));

    if (!allValid) {
      throw new AppError(errorMessage, 403);
    }
  }
}
