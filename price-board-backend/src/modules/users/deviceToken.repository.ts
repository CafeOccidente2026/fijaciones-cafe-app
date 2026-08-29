import { prisma } from "../../config/prismaClient";

/**
 * Single responsibility: persistence for device_tokens - the Expo push
 * token per device, used to send remote notifications.
 */
export class DeviceTokenRepository {
  /**
   * `token` is globally unique. If it was previously saved under another
   * user (e.g. someone logged out and a different account logged in on
   * the same device), reassign it instead of failing.
   */
  static upsertForUser(userId: string, token: string) {
    return prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token },
      update: { userId },
    });
  }

  static deleteByToken(token: string) {
    return prisma.deviceToken.deleteMany({ where: { token } });
  }

  static async findTokensByUserIds(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];

    const rows = await prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });
    return rows.map((row) => row.token);
  }
}
