import { z } from 'zod';

export const  createCategorySchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' }),
    description: z
        .string()
        .min(2, { message: 'La descripcion debe tener al menos 2 caracteres' })
        .max(500, { message: 'La descripcion no puede exceder 500 caracteres' })
        .optional()
})

export const updateCategorySchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' })
        .optional(),
    description: z
        .string()
        .min(2, { message: 'La descripcion debe tener al menos 2 caracteres' })
        .max(500, { message: 'La descripcion no puede exceder 500 caracteres' })
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: 'No se proporcionaron datos para actualizar'
    }
)

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

