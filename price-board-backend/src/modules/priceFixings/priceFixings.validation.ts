import { z } from "zod";

export const createPriceFixingSchema = z.object({
  coffeeTypeId: z.string().uuid("Tipo de cafe invalido"),
  kilos: z.coerce.number().positive("Los kilos deben ser mayores a cero"),
});

export const historyQuerySchema = z.object({
  coffeeTypeId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  municipality: z.string().min(1).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const weekQuerySchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de semana invalida, usa AAAA-MM-DD")
    .optional(),
});

export type CreatePriceFixingInput = z.infer<typeof createPriceFixingSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
export type WeekQuery = z.infer<typeof weekQuerySchema>;
