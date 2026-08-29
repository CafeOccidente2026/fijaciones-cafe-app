import { Router } from "express";
import { AuthController } from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler.util";
import { authenticate } from "../../middlewares/authenticate.middleware";

const router = Router();

router.post("/login", asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));
router.post("/logout", asyncHandler(AuthController.logout));
router.patch("/change-password", authenticate, asyncHandler(AuthController.changePassword));

export default router;
