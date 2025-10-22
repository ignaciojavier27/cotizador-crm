import { z } from 'zod'

export const registerSchema = z.object({
  // Datos del usuario
  email: z
    .string()
    .email({ message: 'Email inválido' })
    .max(255, { message: 'El email no puede exceder 255 caracteres' }),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(100, { message: 'La contraseña no puede exceder 100 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una mayúscula' })
    .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una minúscula' })
    .regex(/[0-9]/, { message: 'La contraseña debe contener al menos un número' }),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(255, { message: 'El nombre no puede exceder 255 caracteres' }),
  lastName: z
    .string()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres' })
    .max(255, { message: 'El apellido no puede exceder 255 caracteres' }),
  
  // Datos de la empresa
  companyName: z
    .string()
    .min(2, { message: 'El nombre de la empresa debe tener al menos 2 caracteres' })
    .max(255, { message: 'El nombre de la empresa no puede exceder 255 caracteres' }),
  companyRut: z
    .string()
    .min(8, { message: 'El RUT debe tener al menos 8 caracteres' })
    .max(50, { message: 'El RUT no puede exceder 50 caracteres' })
    .regex(/^[0-9]+-[0-9kK]{1}$/, { 
      message: 'Formato de RUT inválido. Debe ser: 12345678-9' 
    }),
  companyPhone: z
    .string()
    .max(50, { message: 'El teléfono no puede exceder 50 caracteres' })
    .regex(/^\+?[0-9\s\-()]+$/, { message: 'Formato de teléfono inválido' })
    .optional(),
  companyAddress: z
    .string()
    .max(255, { message: 'La dirección no puede exceder 255 caracteres' })
    .optional(),
  companyContactEmail: z
    .string()
    .email({ message: 'El correo de contacto debe ser valido' })
    .optional(),
  companyLogoUrl: z
    .string()
    .max(500, { message: 'La URL del logo no puede exceder 500 caracteres' })
    .url({ message: 'La URL del logo debe ser válida' })
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Schema de validación
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export type RegisterInput = z.infer<typeof registerSchema>