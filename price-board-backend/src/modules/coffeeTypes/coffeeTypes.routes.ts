import { Router } from "express";
import { Role } from "@prisma/client";
import { CoffeeTypesController } from "./coffeeTypes.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { asyncHandler } from "../../utils/asyncHandler.util";

const router = Router();

router.use(authenticate);

// Any authenticated role can read the catalog.
router.get("/", asyncHandler(CoffeeTypesController.list));

// ADMIN only: audit trail of every price change.
router.get(
  "/price-history",
  authorize(Role.ADMIN),
  asyncHandler(CoffeeTypesController.priceHistory)
);

// Only ADMIN manages the catalog itself.
router.post("/", authorize(Role.ADMIN), asyncHandler(CoffeeTypesController.create));
router.patch("/:id", authorize(Role.ADMIN), asyncHandler(CoffeeTypesController.update));

// ADMIN and PRICE_MANAGER can move the price (each change is logged).
router.patch(
  "/:id/price",
  authorize(Role.ADMIN, Role.PRICE_MANAGER),
  asyncHandler(CoffeeTypesController.changePrice)
);

export default router;
