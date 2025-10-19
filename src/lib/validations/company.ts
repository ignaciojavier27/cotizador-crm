import { z } from "zod";

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(255, { message: 'El nombre no puede exceder 255 caracteres' }),
  rut: z
    .string()
    .min(8, { message: 'El RUT debe tener al menos 8 caracteres' })
    .max(50, { message: 'El RUT no puede exceder 50 caracteres' }),
  logoUrl: z
    .string()
    .max(500, { message: 'La URL del logo no puede exceder 500 caracteres' })
    .url({ message: 'La URL del logo debe ser válida' })
    .optional()
    .nullable(),
  address: z
    .string()
    .max(255, { message: 'La dirección no puede exceder 255 caracteres' })
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(50, { message: 'El teléfono no puede exceder 50 caracteres' })
    .regex(/^\+?[0-9\s\-()]+$/, { message: 'Formato de teléfono inválido' })
    .optional()
    .nullable(),
  contactEmail: z
    .string()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'El email no puede exceder 255 caracteres' })
    .optional()
    .nullable(),
})

export const updatedCompanySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(255, { message: 'El nombre no puede exceder 255 caracteres' })
    .optional(),
  rut: z
    .string()
    .min(8, { message: 'El RUT debe tener al menos 8 caracteres' })
    .max(50, { message: 'El RUT no puede exceder 50 caracteres' })
    .optional(),
  logoUrl: z
    .string()
    .max(500, { message: 'La URL del logo no puede exceder 500 caracteres' })
    .url({ message: 'La URL del logo debe ser válida' })
    .optional()
    .nullable(),
  address: z
    .string()
    .max(255, { message: 'La dirección no puede exceder 255 caracteres' })
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(50, { message: 'El teléfono no puede exceder 50 caracteres' })
    .regex(/^\+?[0-9\s\-()]+$/, { message: 'Formato de teléfono inválido' })
    .optional()
    .nullable(),
  contactEmail: z
    .string()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'El email no puede exceder 255 caracteres' })
    .optional()
    .nullable(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Debe proporcionar al menos un campo para actualizar' }
)


export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateComanyInput = z.infer<typeof updatedCompanySchema>