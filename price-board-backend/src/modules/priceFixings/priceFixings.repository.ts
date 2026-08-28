import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { getLastDaysRange, getTodayRange } from "../../utils/dateRange.util";

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
}
