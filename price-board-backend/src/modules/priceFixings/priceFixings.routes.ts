import { Router } from "express";
import { Role } from "@prisma/client";
import { PriceFixingsController } from "./priceFixings.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { asyncHandler } from "../../utils/asyncHandler.util";

const router = Router();

router.use(authenticate);

// PRODUCER: create a fixing and read only their own history.
router.post("/", authorize(Role.PRODUCER), asyncHandler(PriceFixingsController.create));
router.get("/my-history", authorize(Role.PRODUCER), asyncHandler(PriceFixingsController.myHistory));

// ADMIN + PRICE_MANAGER: "del dia" views and the full history with filters.
router.get(
  "/today-summary",
  authorize(Role.ADMIN, Role.PRICE_MANAGER),
  asyncHandler(PriceFixingsController.todaySummary)
);
router.get(
  "/today-by-type/:coffeeTypeId",
  authorize(Role.ADMIN, Role.PRICE_MANAGER),
  asyncHandler(PriceFixingsController.todayByType)
);
router.get(
  "/history",
  authorize(Role.ADMIN, Role.PRICE_MANAGER),
  asyncHandler(PriceFixingsController.history)
);

// ADMIN only: aggregated data for the monthly bar chart.
router.get(
  "/monthly-chart-data",
  authorize(Role.ADMIN),
  asyncHandler(PriceFixingsController.monthlyChartData)
);

export default router;
