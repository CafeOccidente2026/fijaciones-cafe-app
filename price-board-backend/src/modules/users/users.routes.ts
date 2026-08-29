import { Router } from "express";
import { Role } from "@prisma/client";
import { UsersController } from "./users.controller";
import { uploadProfilePhoto } from "./users.upload";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { asyncHandler } from "../../utils/asyncHandler.util";

const router = Router();

// Every user route requires a valid session.
router.use(authenticate);

// Self endpoints (any authenticated role). Declared before "/:id" so
// "me" is never captured as an id.
router.get("/me", asyncHandler(UsersController.me));
router.patch("/me/profile-photo", asyncHandler(UsersController.updateMyProfilePhoto));
router.post(
  "/me/profile-photo-upload",
  uploadProfilePhoto,
  asyncHandler(UsersController.uploadProfilePhotoFile)
);
router.post("/me/device-token", asyncHandler(UsersController.registerDeviceToken));
router.delete("/me/device-token", asyncHandler(UsersController.removeDeviceToken));

// Admin-only account management.
router.post("/", authorize(Role.ADMIN), asyncHandler(UsersController.create));
// PRICE_MANAGER also needs to list PRODUCER accounts, to pick specific
// recipients when sending a notification (see notifications.routes.ts).
router.get("/", authorize(Role.ADMIN, Role.PRICE_MANAGER), asyncHandler(UsersController.list));
router.patch("/:id/suspend", authorize(Role.ADMIN), asyncHandler(UsersController.suspend));
router.patch("/:id/activate", authorize(Role.ADMIN), asyncHandler(UsersController.activate));
router.delete("/:id", authorize(Role.ADMIN), asyncHandler(UsersController.remove));

export default router;
