import path from "path";
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

  // Uploaded profile photos, served with a permissive CORP header so the
  // mobile app (a different origin) can load the images.
  app.use(
    "/uploads",
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(path.join(__dirname, "../uploads"))
  );

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
