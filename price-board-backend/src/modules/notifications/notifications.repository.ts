import { NotificationAudience } from "@prisma/client";
import { prisma } from "../../config/prismaClient";

/**
 * Single responsibility: persistence for notifications and their
 * per-recipient rows (the bridge table that also tracks read state).
 */
export class NotificationsRepository {
  static createWithRecipients(
    senderId: string,
    message: string,
    audience: NotificationAudience,
    recipientIds: string[]
  ) {
    return prisma.notification.create({
      data: {
        senderId,
        message,
        audience,
        recipients: {
          create: recipientIds.map((userId) => ({ userId })),
        },
      },
      include: { recipients: true },
    });
  }

  static findSentByUser(senderId: string) {
    return prisma.notification.findMany({
      where: { senderId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { recipients: true } } },
    });
  }

  static findForUser(userId: string) {
    return prisma.notificationRecipient.findMany({
      where: { userId },
      orderBy: { notification: { createdAt: "desc" } },
      include: {
        notification: {
          select: {
            id: true,
            message: true,
            createdAt: true,
            sender: { select: { id: true, fullName: true } },
          },
        },
      },
    });
  }

  static findRecipientById(id: string) {
    return prisma.notificationRecipient.findUnique({ where: { id } });
  }

  static markAsRead(id: string) {
    return prisma.notificationRecipient.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }
}
