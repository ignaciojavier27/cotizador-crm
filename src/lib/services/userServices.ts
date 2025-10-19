// src/lib/services/userServices.ts
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "../validations/user";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

export async function createUser(data: unknown, companyId: string) {
  // Validar datos
  const validationResult = createUserSchema.safeParse(
    data as z.infer<typeof createUserSchema>
  );

  if (!validationResult.success) {
    const errorDetails = validationResult.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new Error(
      `Errores de validación: ${errorDetails
        .map((e) => e.message)
        .join(", ")}`
    );
  }

  const validatedData = validationResult.data;

  // Verificar si email ya existe
  const existingUser = await prisma.user.findFirst({
    where: { email: validatedData.email, deletedAt: null },
  });

  if (existingUser) {
    throw new Error("Este email ya está registrado");
  }

  // Hash de la contraseña
  const passwordHash = await hashPassword(validatedData.password);

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      companyId,
      email: validatedData.email,
      passwordHash,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
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
      company: {
        select: {
          id: true,
          name: true
        }
      }
    },
  });

  return user;
}
