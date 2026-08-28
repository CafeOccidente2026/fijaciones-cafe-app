import { randomUUID } from "crypto";
import { UserStatus } from "@prisma/client";
import { AuthRepository } from "./auth.repository";
import { PasswordUtil } from "../../utils/password.util";
import { TokenUtil } from "../../utils/token.util";
import { AppError } from "../../utils/apiResponse.util";
import { env } from "../../config/env";
import { parseDurationToMs } from "../../utils/duration.util";

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
    municipality: string | null;
    profilePhotoUrl: string | null;
  };
}

/**
 * Single responsibility: the business rules of authentication.
 * Knows nothing about HTTP - it only receives plain values and returns
 * plain results or throws AppError, so it can be reused (tests, CLI, etc).
 */
export class AuthService {
  static async login(username: string, plainPassword: string): Promise<LoginResult> {
    const user = await AuthRepository.findUserByUsername(username);

    if (!user) {
      throw new AppError("Usuario o contrasena incorrectos", 401);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError("Tu cuenta ha sido suspendida. Contacta al administrador.", 403);
    }

    const passwordMatches = await PasswordUtil.compare(plainPassword, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError("Usuario o contrasena incorrectos", 401);
    }

    const accessToken = TokenUtil.generateAccessToken({ userId: user.id, role: user.role });

    const refreshTokenId = randomUUID();
    const refreshToken = TokenUtil.generateRefreshToken({ userId: user.id, tokenId: refreshTokenId });
    const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

    await AuthRepository.storeRefreshToken({
      id: refreshTokenId,
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        municipality: user.municipality,
        profilePhotoUrl: user.profilePhotoUrl,
      },
    };
  }

  /**
   * Rotates the refresh token: the old one is revoked and a brand new
   * pair (access + refresh) is issued. This limits the damage if a
   * refresh token is ever leaked.
   */
  static async refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;

    try {
      payload = TokenUtil.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError("Refresh token invalido o expirado", 401);
    }

    const storedToken = await AuthRepository.findRefreshTokenById(payload.tokenId);

    if (!storedToken || storedToken.revoked || storedToken.token !== oldRefreshToken) {
      throw new AppError("Refresh token invalido o ya fue usado", 401);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AppError("El refresh token ha expirado, inicia sesion de nuevo", 401);
    }

    const user = await AuthRepository.findUserById(payload.userId);

    if (!user || user.status === UserStatus.SUSPENDED) {
      throw new AppError("Cuenta no disponible", 403);
    }

    await AuthRepository.revokeRefreshTokenById(storedToken.id);

    const newAccessToken = TokenUtil.generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshTokenId = randomUUID();
    const newRefreshToken = TokenUtil.generateRefreshToken({ userId: user.id, tokenId: newRefreshTokenId });
    const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

    await AuthRepository.storeRefreshToken({
      id: newRefreshTokenId,
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      const payload = TokenUtil.verifyRefreshToken(refreshToken);
      await AuthRepository.revokeRefreshTokenById(payload.tokenId);
    } catch {
      // Token already invalid/expired: logout is still considered successful.
    }
  }
}
