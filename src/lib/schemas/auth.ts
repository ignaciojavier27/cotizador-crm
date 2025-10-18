import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: "El correo no es valido" }),
    password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
})

export const registerSchema = z.object({
    email: z.string().email({ message: "El correo no es valido" }),
    password: z
        .string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
        .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
        .regex(/[a-z]/, { message: "La contraseña debe contener al menos una letra minúscula" })
        .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" }),
    firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    companyName: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres" }),
    companyRut: z
        .string()
        .min(8, { message: "El RUT de la empresa debe tener al menos 8 caracteres" })
        .max(30, { message: "El RUT de la empresa debe tener al menos 30 caracteres" }),
    phone: z.string().min(9, { message: "El telefono debe tener al menos 9 caracteres" }),
    address: z.string().min(2, { message: "La direccion debe tener al menos 2 caracteres" }),
})

export const userSchema = z.object({
    email: z.string().email({ message: "El correo no es valido" }),
    password: z
        .string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
        .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
        .regex(/[a-z]/, { message: "La contraseña debe contener al menos una letra minúscula" })
        .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" }),
    firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    role: z.nativeEnum(UserRole),
    companyId: z.string(),
})