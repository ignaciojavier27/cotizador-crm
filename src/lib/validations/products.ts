import { z } from "zod";

export const createProductSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' }),
    description: z
        .string()
        .min(2, { message: 'La descripcion debe tener al menos 2 caracteres' })
        .max(500, { message: 'La descripcion no puede exceder 500 caracteres' })
        .optional(),
    type: z
        .string()
        .min(2, { message: 'El tipo debe tener al menos 2 caracteres' })
        .max(100, { message: 'El tipo no puede exceder 255 caracteres' })
        .optional(),
    brand: z
        .string()
        .min(2, { message: 'La marca debe tener al menos 2 caracteres' })
        .max(255, { message: 'La marca no puede exceder 255 caracteres' })
        .optional(),
    basePrice: z
        .number()
        .min(0, { message: 'El precio debe ser mayor a 0' }),
    taxPercentage: z
        .number()
        .min(0, { message: 'El porcentaje de impuestos debe ser mayor a 0' })
        .optional(),
    categoryId: z
        .number()
        .min(1, { message: 'La categoría debe ser mayor a 0' }),
    isActive: z
        .boolean()
})

export const updateProductSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' })
        .optional(),
    description: z
        .string()
        .min(2, { message: 'La descripcion debe tener al menos 2 caracteres' })
        .max(500, { message: 'La descripcion no puede exceder 500 caracteres' })
        .optional(),
    type: z
        .string()
        .min(2, { message: 'El tipo debe tener al menos 2 caracteres' })
        .max(100, { message: 'El tipo no puede exceder 255 caracteres' })
        .optional(),
    brand: z
        .string()
        .min(2, { message: 'La marca debe tener al menos 2 caracteres' })
        .max(255, { message: 'La marca no puede exceder 255 caracteres' })
        .optional(),
    base_price: z
        .number()
        .min(0, { message: 'El precio debe ser mayor a 0' })
        .optional(),
    tax_percentage: z
        .number()
        .min(0, { message: 'El porcentaje de impuestos debe ser mayor a 0' })
        .optional(),
    categoryId: z
        .number()
        .min(1, { message: 'La categoría debe ser mayor a 0' })
        .optional(),
    isActive: z
        .boolean()
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'No se proporcionaron datos para actualizar' }
)

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>