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

export type CreatePriceFixingInput = z.infer<typeof createPriceFixingSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
