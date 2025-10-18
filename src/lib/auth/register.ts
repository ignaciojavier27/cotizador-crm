import { RegisterResult } from "@/types/auth";
import { registerSchema, userSchema } from "../schemas/auth";
import { prisma } from "../prisma";
import { hashPassword } from "./password";
import { UserRole } from "@prisma/client";

export async function registerUserWithCompany(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
    companyRut: string;
    phone?: string;
    address?: string;
}): Promise<RegisterResult> {
    try {
        const validatedFields = registerSchema.safeParse(data);

        if (!validatedFields.success) {
            return {
                success: false,
                error: 'Validación fallida',
            }
        }

        const validated = validatedFields.data;

        // Verificar si el email ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (existingUser) {
            return {
                success: false,
                error: 'Este email ya está registrado',
            }
        }

        // Verificar si el RUT de la empresa ya existe
        const existingCompany = await prisma.company.findUnique({
            where: { rut: validated.companyRut },
        })

        if (existingCompany) {
            return {
                success: false,
                error: 'Este RUT de empresa ya esta registrado',
            }
        }

        const passwordHash = await hashPassword(validated.password);

        const result = await prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    name: validated.companyName,
                    rut: validated.companyRut,
                    phone: validated.phone,
                    address: validated.address,
                    contactEmail: validated.email,
                }
            })

            const user = await tx.user.create({
                data: {
                    email: validated.email,
                    passwordHash,
                    firstName: validated.firstName,
                    lastName: validated.lastName,
                    role: UserRole.admin,
                    companyId: company.id,
                    isActive: true,
                }
            })

            return { user, company }
        })
        
        return {
            success: true,
            userId: result.user.id
        }

    } catch (error) {
        console.error('Error al registrar usuario:', error)
        return {
            success: false,
            error: 'Error al crear la cuenta. Por favor intenta nuevamente.',
        }
  }
}

/**
 * Server Action para crear usuarios adicionales (solo admin)
 * Requiere ID de empresa y rol del usuario que crea
 */

export async function createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyId: string;
}): Promise<RegisterResult> {
    try {
        const validatedFields = userSchema.safeParse(data);

        if (!validatedFields.success) {
            return {
                success: false,
                error: 'Datos inválidos',
            }
        }

        const validated = validatedFields.data;

        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (existingUser) {
            return {
                success: false,
                error: 'Este email ya está registrado',
            }
        }

        const passwordHash = await hashPassword(validated.password);

        const user = await prisma.user.create({
            data: {
                companyId: validated.companyId,
                email: validated.email,
                passwordHash,
                firstName: validated.firstName,
                lastName: validated.lastName,
                role: validated.role,
                isActive: true,
            }
        })

        return {
            success: true,
            userId: user.id
        }

    } catch (error) {
        console.error('Error al crear usuario:', error)
        return {
            success: false,
            error: 'Error al crear el usuario',
        }
    }
}