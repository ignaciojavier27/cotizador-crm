import { z } from "zod";
import { AutomationType } from "@prisma/client";

export const automationSchema = z.object({
    type: z.nativeEnum(AutomationType),
    daysWait: z.coerce
        .number()
        .min(0, "Los días de espera deben ser mayor o igual a 0"),
    emailSubject: z
        .string()
        .min(1, "El asunto del correo es requerido")
        .max(255, "El asunto no puede exceder los 255 caracteres"),
    emailContent: z.string().min(1, "El contenido del correo es requerido"),
    isActive: z.boolean().default(true),
});

export type AutomationFormData = z.infer<typeof automationSchema>;
