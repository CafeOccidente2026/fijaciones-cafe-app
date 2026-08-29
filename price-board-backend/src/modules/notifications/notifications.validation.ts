import { z } from "zod";
import { NotificationAudience } from "@prisma/client";

export const sendNotificationSchema = z
  .object({
    message: z.string().min(1, "El mensaje es requerido").max(1000, "El mensaje es demasiado largo"),
    audience: z.nativeEnum(NotificationAudience, { errorMap: () => ({ message: "Audiencia invalida" }) }),
    recipientIds: z.array(z.string().uuid("Destinatario invalido")).optional(),
  })
  .refine((data) => data.audience !== "SPECIFIC" || (data.recipientIds?.length ?? 0) > 0, {
    message: "Selecciona al menos un destinatario",
    path: ["recipientIds"],
  });

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
