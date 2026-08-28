import { z } from "zod";

export const sendNotificationSchema = z.object({
  message: z.string().min(1, "El mensaje es requerido").max(1000, "El mensaje es demasiado largo"),
  recipientIds: z.union([
    z.literal("all"),
    z.array(z.string().uuid("Destinatario invalido")).min(1, "Selecciona al menos un destinatario"),
  ]),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
