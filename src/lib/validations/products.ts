import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(255, { message: 'El nombre no puede exceder 255 caracteres' }),

  description: z
    .string()
    .min(2, { message: 'La descripción debe tener al menos 2 caracteres' })
    .max(500, { message: 'La descripción no puede exceder 500 caracteres' })
    .optional()
    .or(z.literal('')),

  type: z
    .string()
    .min(2, { message: 'El tipo debe tener al menos 2 caracteres' })
    .max(100, { message: 'El tipo no puede exceder 100 caracteres' })
    .optional()
    .or(z.literal('')),

  brand: z
    .string()
    .min(2, { message: 'La marca debe tener al menos 2 caracteres' })
    .max(255, { message: 'La marca no puede exceder 255 caracteres' })
    .optional()
    .or(z.literal('')),

  basePrice: z
    .number({ message: 'El precio base es requerido' })
    .min(0, { message: 'El precio debe ser mayor a 0' }),

  // ✅ SOLUCIÓN: Hacer taxPercentage requerido y usar coerce para convertir
  taxPercentage: z
    .number({ message: 'El porcentaje de impuestos es requerido' })
    .min(0, { message: 'El porcentaje de impuestos debe ser mayor o igual a 0' })
    .max(100, { message: 'El porcentaje de impuestos no puede exceder 100%' }),

  categoryId: z
    .string()
    .min(1, { message: 'La categoría es requerida' }),

  isActive: z.boolean(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().min(2).max(500).optional(),
  type: z.string().min(2).max(100).optional(),
  brand: z.string().min(2).max(255).optional(),
  base_price: z.number().min(0).optional(),
  tax_percentage: z.number().min(0).max(100).optional(),
  categoryId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'No se proporcionaron datos para actualizar' }
);

// Tipos inferidos correctamente
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;