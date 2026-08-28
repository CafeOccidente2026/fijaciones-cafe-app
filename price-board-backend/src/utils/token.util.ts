import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

/**
 * Single responsibility: sign and verify JWTs.
 * Access tokens are short-lived and carry the role for authorization.
 * Refresh tokens only carry an id used to look up the stored token in DB,
 * so they can be revoked (e.g. on logout or when suspending a user).
 */
export class TokenUtil {
  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  }

  static verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  }
}
