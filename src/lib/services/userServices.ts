import { prisma } from "@/lib/prisma";
import { createUserSchema } from "../validations/user";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

export async function createUser(data: unknown, companyId: string) {

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

export async function getAllUsers(
  params: {
    companyId: string;
    role?: string | null;
    isActive?: string | null;
    search?: string | null;
  }
) {
  const { companyId, role, isActive, search } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    companyId,
    deletedAt: null,
  };
  
  if(role && (role === 'admin' || role === 'seller')) {
    where.role = role;
  }

  if (isActive !== null && isActive !== undefined) {
    where.isActive = isActive === 'true'
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  // 4. Obtener usuarios
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          quotations: true,
        },
      },
    },
    orderBy: [
      { isActive: 'desc' }, // Activos primero
      { createdAt: 'desc' }, // Más recientes primero
    ],
  })

  return {
    users,
    total: users.length,
    filters: {
      role: role || 'all',
      isActive: isActive || 'all',
      search: search || '',
    }
  }
} 