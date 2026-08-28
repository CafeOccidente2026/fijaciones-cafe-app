import { prisma } from "../../config/prismaClient";

/**
 * Single responsibility: persistence for refresh tokens and user lookups
 * needed by the auth flow. Nothing else in the app talks to these tables
 * directly.
 */
export class AuthRepository {
  static findUserByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  static findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  static storeRefreshToken(params: { id: string; userId: string; token: string; expiresAt: Date }) {
    return prisma.refreshToken.create({
      data: {
        id: params.id,
        userId: params.userId,
        token: params.token,
        expiresAt: params.expiresAt,
      },
    });
  }

  static findRefreshTokenById(id: string) {
    return prisma.refreshToken.findUnique({ where: { id } });
  }

  static revokeRefreshTokenById(id: string) {
    return prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  }

  static revokeAllTokensForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
