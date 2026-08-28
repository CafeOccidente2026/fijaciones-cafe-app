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

// Admin-only account management.
router.post("/", authorize(Role.ADMIN), asyncHandler(UsersController.create));
router.get("/", authorize(Role.ADMIN), asyncHandler(UsersController.list));
router.patch("/:id/suspend", authorize(Role.ADMIN), asyncHandler(UsersController.suspend));
router.patch("/:id/activate", authorize(Role.ADMIN), asyncHandler(UsersController.activate));
router.delete("/:id", authorize(Role.ADMIN), asyncHandler(UsersController.remove));

export default router;
