import { Request, Response } from "express";
import { NotificationsService } from "./notifications.service";
import { sendNotificationSchema } from "./notifications.validation";
import { ApiResponse, AppError } from "../../utils/apiResponse.util";

/**
 * Single responsibility: translate HTTP <-> NotificationsService calls.
 */
export class NotificationsController {
  static async send(req: Request, res: Response): Promise<void> {
    const parsed = sendNotificationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? "Datos invalidos", 422);
    }

    const result = await NotificationsService.send(req.auth!.userId, parsed.data);
    ApiResponse.success(res, result, 201);
  }

  static async myNotifications(req: Request, res: Response): Promise<void> {
    const notifications = await NotificationsService.getMyNotifications(req.auth!.userId);
    ApiResponse.success(res, notifications);
  }

  static async markRead(req: Request, res: Response): Promise<void> {
    const result = await NotificationsService.markAsRead(
      req.params.notificationRecipientId,
      req.auth!.userId
    );
    ApiResponse.success(res, result);
  }
}
