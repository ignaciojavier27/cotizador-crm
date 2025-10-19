import { hashPassword } from "../auth/password";
import { prisma } from "../prisma";
import { registerSchema } from "../validations/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";

export async function createFirstUserWithCompany(data: unknown) {
    const validationResult = registerSchema.safeParse(
        data as z.infer<typeof registerSchema>
    );

    if(!validationResult.success) {
        const errorDetails = validationResult.error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message,
        }));

        throw new Error(
            `Errores de validación: ${errorDetails.map(e => e.message).join(", ")}`
        );
    }

    const validatedData = validationResult.data;

    const existingUser = await prisma.user.findUnique({ 
        where: { email: validatedData.email } 
    });

    if(existingUser) {
        throw new Error("Este email ya esta registrado");
    }

    const existingCompany = await prisma.company.findFirst({
        where: { rut: validatedData.companyRut, deletedAt: null },
    })

    if(existingCompany) {
        throw new Error("Ya existe una empresa registrada con este RUT");
    }

    const passwordHash = await hashPassword(validatedData.password);

    const result = await prisma.$transaction(async (tx) => {

        const company = await tx.company.create({
            data: {
                name: validatedData.companyName,
                rut: validatedData.companyRut,
                logoUrl: validatedData.companyLogoUrl,
                address: validatedData.companyAddress,
                phone: validatedData.companyPhone,
                contactEmail: validatedData.companyContactEmail,
            }
        })

        const user = await tx.user.create({
            data: {
                companyId: company.id,
                email: validatedData.email,
                passwordHash,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                role: UserRole.admin,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                isActive: true,
                createdAt: true,
            }
        })

        return { user, company }
    })

    return result;
}