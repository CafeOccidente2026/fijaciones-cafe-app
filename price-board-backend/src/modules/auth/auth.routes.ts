import { Router } from "express";
import { AuthController } from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler.util";

const router = Router();

router.post("/login", asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));
router.post("/logout", asyncHandler(AuthController.logout));

export default router;
