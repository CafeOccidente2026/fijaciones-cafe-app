import { Prisma, Role, UserStatus } from "@prisma/client";
import { prisma } from "../../config/prismaClient";

/**
 * Fields that are safe to return to any client. Deliberately leaves out
 * passwordHash so it can never leak through a list/detail response.
 */
export const publicUserSelect = {
  id: true,
  username: true,
  fullName: true,
  municipality: true,
  role: true,
  status: true,
  profilePhotoUrl: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/**
 * Single responsibility: persistence for the users table. Only the auth
 * flow (login/refresh) and this module read or write here.
 */
export class UsersRepository {
  static findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  static findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  }

  static create(data: {
    username: string;
    passwordHash: string;
    fullName: string;
    municipality?: string;
    role: Role;
  }) {
    return prisma.user.create({ data, select: publicUserSelect });
  }

  static findAll(role?: Role) {
    return prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: "desc" },
      select: publicUserSelect,
    });
  }

  /** Used to build push-notification audiences - active users only. */
  static async findActiveIdsByRole(role: Role): Promise<string[]> {
    const users = await prisma.user.findMany({
      where: { role, status: UserStatus.ACTIVE },
      select: { id: true },
    });
    return users.map((user) => user.id);
  }

  /** Used to validate a hand-picked notification recipient list by role. */
  static findByIds(ids: string[]) {
    return prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, role: true } });
  }

  static updateStatus(id: string, status: UserStatus) {
    return prisma.user.update({ where: { id }, data: { status }, select: publicUserSelect });
  }

  static updateProfilePhoto(id: string, profilePhotoUrl: string) {
    return prisma.user.update({
      where: { id },
      data: { profilePhotoUrl },
      select: publicUserSelect,
    });
  }

  static deleteById(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
