import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { formatDateOnly, getLastDaysRange, getTodayRange, getWeekRange } from "../../utils/dateRange.util";

const withCoffeeType = {
  coffeeType: { select: { id: true, name: true } },
} satisfies Prisma.PriceFixingInclude;

const withUserAndCoffeeType = {
  coffeeType: { select: { id: true, name: true } },
  user: { select: { id: true, fullName: true, municipality: true } },
} satisfies Prisma.PriceFixingInclude;

/**
 * Single responsibility: persistence and aggregation for price fixings.
 * The "del dia" queries always derive their range from the server clock
 * (see dateRange.util), so no scheduled job is needed to "close" a day.
 */
export class PriceFixingsRepository {
  static create(data: {
    userId: string;
    coffeeTypeId: string;
    kilos: number;
    priceAtFixing: number;
  }) {
    return prisma.priceFixing.create({ data, include: withCoffeeType });
  }

  static findByUser(userId: string) {
    return prisma.priceFixing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: withCoffeeType,
    });
  }

  static async groupTodayByType(): Promise<Array<{ id: string; name: string; count: number }>> {
    const { start, end } = getTodayRange();

    const groups = await prisma.priceFixing.groupBy({
      by: ["coffeeTypeId"],
      where: { createdAt: { gte: start, lt: end } },
      _count: { _all: true },
    });

    if (groups.length === 0) return [];

    const coffeeTypes = await prisma.coffeeType.findMany({
      where: { id: { in: groups.map((group) => group.coffeeTypeId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(coffeeTypes.map((coffeeType) => [coffeeType.id, coffeeType.name]));

    return groups
      .map((group) => ({
        id: group.coffeeTypeId,
        name: nameById.get(group.coffeeTypeId) ?? "Desconocido",
        count: group._count._all,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  static findTodayByType(coffeeTypeId: string) {
    const { start, end } = getTodayRange();

    return prisma.priceFixing.findMany({
      where: { coffeeTypeId, createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: "desc" },
      include: withUserAndCoffeeType,
    });
  }

  static findHistory(filters: {
    coffeeTypeId?: string;
    userId?: string;
    municipality?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Prisma.PriceFixingWhereInput = {};

    if (filters.coffeeTypeId) where.coffeeTypeId = filters.coffeeTypeId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.municipality) {
      where.user = { is: { municipality: { equals: filters.municipality, mode: "insensitive" } } };
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    return prisma.priceFixing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: withUserAndCoffeeType,
    });
  }

  static async sumLast30DaysByType(): Promise<
    Array<{ id: string; name: string; totalKilos: number; fixingsCount: number }>
  > {
    const { start } = getLastDaysRange(30);

    const groups = await prisma.priceFixing.groupBy({
      by: ["coffeeTypeId"],
      where: { createdAt: { gte: start } },
      _count: { _all: true },
      _sum: { kilos: true },
    });

    if (groups.length === 0) return [];

    const coffeeTypes = await prisma.coffeeType.findMany({
      where: { id: { in: groups.map((group) => group.coffeeTypeId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(coffeeTypes.map((coffeeType) => [coffeeType.id, coffeeType.name]));

    return groups
      .map((group) => ({
        id: group.coffeeTypeId,
        name: nameById.get(group.coffeeTypeId) ?? "Desconocido",
        totalKilos: Number(group._sum.kilos ?? 0),
        fixingsCount: group._count._all,
      }))
      .sort((a, b) => b.totalKilos - a.totalKilos);
  }

  static async sumByTypeInRange(
    start: Date,
    end: Date
  ): Promise<Array<{ coffeeTypeId: string; coffeeTypeName: string; totalKilos: number; fixingsCount: number }>> {
    const groups = await prisma.priceFixing.groupBy({
      by: ["coffeeTypeId"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { _all: true },
      _sum: { kilos: true },
    });

    if (groups.length === 0) return [];

    const coffeeTypes = await prisma.coffeeType.findMany({
      where: { id: { in: groups.map((group) => group.coffeeTypeId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(coffeeTypes.map((coffeeType) => [coffeeType.id, coffeeType.name]));

    return groups
      .map((group) => ({
        coffeeTypeId: group.coffeeTypeId,
        coffeeTypeName: nameById.get(group.coffeeTypeId) ?? "Desconocido",
        totalKilos: Number(group._sum.kilos ?? 0),
        fixingsCount: group._count._all,
      }))
      .sort((a, b) => b.totalKilos - a.totalKilos);
  }

  static async sumByUserInRange(
    coffeeTypeId: string,
    start: Date,
    end: Date
  ): Promise<
    Array<{ userId: string; fullName: string; municipality: string | null; totalKilos: number; fixingsCount: number }>
  > {
    const groups = await prisma.priceFixing.groupBy({
      by: ["userId"],
      where: { coffeeTypeId, createdAt: { gte: start, lte: end } },
      _count: { _all: true },
      _sum: { kilos: true },
    });

    if (groups.length === 0) return [];

    const users = await prisma.user.findMany({
      where: { id: { in: groups.map((group) => group.userId) } },
      select: { id: true, fullName: true, municipality: true },
    });
    const userById = new Map(users.map((user) => [user.id, user]));

    return groups
      .map((group) => {
        const user = userById.get(group.userId);
        return {
          userId: group.userId,
          fullName: user?.fullName ?? "Desconocido",
          municipality: user?.municipality ?? null,
          totalKilos: Number(group._sum.kilos ?? 0),
          fixingsCount: group._count._all,
        };
      })
      .sort((a, b) => b.totalKilos - a.totalKilos);
  }

  static findByUserAndTypeInRange(coffeeTypeId: string, userId: string, start: Date, end: Date) {
    return prisma.priceFixing.findMany({
      where: { coffeeTypeId, userId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      select: { kilos: true, priceAtFixing: true, createdAt: true },
    });
  }

  /**
   * Weeks (Monday-Friday) that already ended, grouped from the raw
   * fixings in JS rather than a stored snapshot - weekend fixings (if
   * any) fall outside every week's Mon-Fri range and are excluded, same
   * as the live weekly chart would treat them.
   */
  static async findWeeklyHistory(): Promise<
    Array<{ weekStart: string; weekEnd: string; totalKilos: number; fixingsCount: number }>
  > {
    const { start: currentWeekStart } = getWeekRange();

    const rows = await prisma.priceFixing.findMany({
      where: { createdAt: { lt: currentWeekStart } },
      select: { kilos: true, createdAt: true },
    });

    const byWeek = new Map<string, { weekStart: Date; totalKilos: number; fixingsCount: number }>();

    for (const row of rows) {
      const { start: weekStart, end: weekEnd } = getWeekRange(row.createdAt);
      if (row.createdAt > weekEnd) continue; // weekend fixing, not part of a Mon-Fri week

      const key = weekStart.toISOString();
      const entry = byWeek.get(key) ?? { weekStart, totalKilos: 0, fixingsCount: 0 };
      entry.totalKilos += Number(row.kilos);
      entry.fixingsCount += 1;
      byWeek.set(key, entry);
    }

    return [...byWeek.values()]
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
      .map((entry) => {
        const weekEnd = new Date(entry.weekStart);
        weekEnd.setDate(weekEnd.getDate() + 4);
        return {
          weekStart: formatDateOnly(entry.weekStart),
          weekEnd: formatDateOnly(weekEnd),
          totalKilos: entry.totalKilos,
          fixingsCount: entry.fixingsCount,
        };
      });
  }
}
