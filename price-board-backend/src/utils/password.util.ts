import bcrypt from "bcrypt";
import { env } from "../config/env";

/**
 * Single responsibility: hashing and verifying passwords.
 * The plain-text password never gets stored or logged anywhere.
 */
export class PasswordUtil {
  static async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
  }

  static async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
