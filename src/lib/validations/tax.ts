import { z } from "zod";

export const createTaxSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),

    percentage: z
        .number({ message: 'El porcentaje es requerido' })
        .min(0, { message: 'El porcentaje debe ser mayor o igual a 0' })
        .max(100, { message: 'El porcentaje no puede exceder 100%' }),

    description: z
        .string()
        .max(500, { message: 'La descripción no puede exceder 500 caracteres' })
        .optional()
        .or(z.literal('')),

    isActive: z.boolean(),
});

export const updateTaxSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    percentage: z.number().min(0).max(100).optional(),
    description: z.string().max(500).optional().or(z.literal('')),
    isActive: z.boolean().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'No se proporcionaron datos para actualizar' }
);

export type CreateTaxInput = z.infer<typeof createTaxSchema>;
export type UpdateTaxInput = z.infer<typeof updateTaxSchema>;
