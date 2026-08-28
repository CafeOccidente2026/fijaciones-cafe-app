import { PrismaClient } from "@prisma/client";
import { env } from "./env";

/**
 * Singleton pattern: a single PrismaClient instance is shared across the
 * whole app instead of opening a new connection pool per request.
 */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
