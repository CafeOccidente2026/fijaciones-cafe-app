import "dotenv/config";
import { z } from "zod";

/**
 * Single source of truth for environment variables.
 * If something required is missing or malformed, the app fails fast
 * at startup instead of crashing later in the middle of a request.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno invalidas:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed. Revisa tu archivo .env");
}

export const env = parsed.data;
