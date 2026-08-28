import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
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

  // Futuros modulos se registran aqui:
  // app.use("/api/users", userRoutes);
  // app.use("/api/coffee-types", coffeeTypeRoutes);
  // app.use("/api/price-fixings", priceFixingRoutes);
  // app.use("/api/notifications", notificationRoutes);

  app.use(errorHandler);

  return app;
}
