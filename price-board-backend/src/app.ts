import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import coffeeTypeRoutes from "./modules/coffeeTypes/coffeeTypes.routes";
import priceFixingRoutes from "./modules/priceFixings/priceFixings.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/coffee-types", coffeeTypeRoutes);
  app.use("/api/price-fixings", priceFixingRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(errorHandler);

  return app;
}
