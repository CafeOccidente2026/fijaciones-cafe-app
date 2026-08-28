import { Router } from "express";
import { Role } from "@prisma/client";
import { NotificationsController } from "./notifications.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { asyncHandler } from "../../utils/asyncHandler.util";

const router = Router();

router.use(authenticate);

// ADMIN + PRICE_MANAGER can broadcast or target specific users.
router.post(
  "/",
  authorize(Role.ADMIN, Role.PRICE_MANAGER),
  asyncHandler(NotificationsController.send)
);

// Any authenticated user reads and marks their own notifications.
router.get("/my-notifications", asyncHandler(NotificationsController.myNotifications));
router.patch("/:notificationRecipientId/read", asyncHandler(NotificationsController.markRead));

export default router;
