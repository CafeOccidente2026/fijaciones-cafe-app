import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";

/**
 * Single responsibility: persistence for coffee types and their price
 * history. A price change is always written together with a PriceHistory
 * row, inside one transaction, so the audit trail can't drift.
 */
export class CoffeeTypesRepository {
  static findMany(includeInactive: boolean) {
    return prisma.coffeeType.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { name: "asc" },
    });
  }

  static findById(id: string) {
    return prisma.coffeeType.findUnique({ where: { id } });
  }

  static findByName(name: string) {
    return prisma.coffeeType.findUnique({ where: { name } });
  }

  static create(data: { name: string; currentPrice?: number }) {
    return prisma.coffeeType.create({ data });
  }

  static setActive(id: string, active: boolean) {
    return prisma.coffeeType.update({ where: { id }, data: { active } });
  }

  static countFixings(id: string) {
    return prisma.priceFixing.count({ where: { coffeeTypeId: id } });
  }

  static changePrice(id: string, price: number, changedById: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.coffeeType.update({
        where: { id },
        data: { currentPrice: price },
      });

      await tx.priceHistory.create({
        data: { coffeeTypeId: id, price, changedById },
      });

      return updated;
    });
  }

  static findPriceHistory(filters: { coffeeTypeId?: string; dateFrom?: Date; dateTo?: Date }) {
    const where: Prisma.PriceHistoryWhereInput = {};

    if (filters.coffeeTypeId) where.coffeeTypeId = filters.coffeeTypeId;
    if (filters.dateFrom || filters.dateTo) {
      where.changedAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    return prisma.priceHistory.findMany({
      where,
      orderBy: { changedAt: "desc" },
      include: {
        coffeeType: { select: { id: true, name: true } },
        changedBy: { select: { id: true, fullName: true, role: true } },
      },
    });
  }
}
