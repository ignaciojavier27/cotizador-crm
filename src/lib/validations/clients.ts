import { z } from 'zod';

export const createClientSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' }),
    email: z
        .string()
        .email({ message: 'Email inválido' })
        .max(255, { message: 'El email no puede exceder 255 caracteres' }),
    phone: z
        .string()
        .max(20, { message: 'El teléfono no puede exceder 20 caracteres' }),
    clientCompany: z
        .string()
        .min(2, { message: 'El nombre de la empresa debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre de la empresa no puede exceder 255 caracteres' }),
    referenceContact: z
        .string()
        .min(2, { message: 'El nombre del contacto debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre del contacto no puede exceder 255 caracteres' }),
    dataConsent: z
        .boolean(),
    consentDate: z
        .date()
        .optional(),
})

export const updateClientSchema = z.object({
    name: z
        .string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre no puede exceder 255 caracteres' })
        .optional(),
    email: z
        .string()
        .email({ message: 'Email inválido' })
        .max(255, { message: 'El email no puede exceder 255 caracteres' })
        .optional(),
    phone: z
        .string()
        .max(20, { message: 'El teléfono no puede exceder 20 caracteres' })
        .optional(),
    clientCompany: z
        .string()
        .min(2, { message: 'El nombre de la empresa debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre de la empresa no puede exceder 255 caracteres' })
        .optional(),
    referenceContact: z
        .string()
        .min(2, { message: 'El nombre del contacto debe tener al menos 2 caracteres' })
        .max(255, { message: 'El nombre del contacto no puede exceder 255 caracteres' })
        .optional(),
    dataConsent: z
        .boolean()
        .default(false)
        .optional(),
    consentDate: z
        .date()
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'No se proporcionaron datos para actualizar' }
)

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;