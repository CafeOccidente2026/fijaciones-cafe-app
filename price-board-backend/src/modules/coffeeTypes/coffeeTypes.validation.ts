import { z } from "zod";

export const createCoffeeTypeSchema = z.object({
  name: z.string().min(1, "El nombre del tipo de cafe es requerido"),
  currentPrice: z.coerce.number().nonnegative("El precio no puede ser negativo").optional(),
});

export const updateCoffeeTypeSchema = z.object({
  active: z.boolean(),
});

export const updatePriceSchema = z.object({
  price: z.coerce.number().nonnegative("El precio no puede ser negativo"),
});

export const listCoffeeTypesQuerySchema = z.object({
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const priceHistoryQuerySchema = z.object({
  coffeeTypeId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type CreateCoffeeTypeInput = z.infer<typeof createCoffeeTypeSchema>;
export type PriceHistoryQuery = z.infer<typeof priceHistoryQuerySchema>;
