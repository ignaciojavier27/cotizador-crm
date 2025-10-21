import { prisma } from "@/lib/prisma";
import { createUserSchema, updateUserSchema } from "../validations/user";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";
import { Prisma } from "@prisma/client";

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

export async function getUserById(id: string) {

  const user = await prisma.user.findUnique({
    where: { 
      id,
      deletedAt: null,
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
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          rut: true,
        },
      },
      _count: {
        select: {
          quotations: true,
        },
      },
    },
  });

  if(!user) {
    throw new Error("El usuario no existe");
  }

  return user

}

export async function updateUser(
  id: string,
  data: unknown,
  currentUser: { 
    id: string;
    role: string;
    companyId: string;
  }
) {

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser || existingUser.deletedAt) {
    throw new Error("Usuario no encontrado");
  }

  if (existingUser.companyId !== currentUser.companyId) {
    throw new Error("No tienes permisos para actualizar este usuario");
  }

   const validationResult = updateUserSchema.safeParse(
    data as z.infer<typeof updateUserSchema>
  );

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map(
      (e) => `${e.path.join(".")}: ${e.message}`
    );
    throw new Error(`Errores de validación: ${errors.join(", ")}`);
  }

  const validatedData = validationResult.data;

  const isUpdatingSelf = currentUser.id === id;
  const isAdmin = currentUser.role === "admin";

  if (!isUpdatingSelf && !isAdmin) {
    throw new Error(
      "Solo los administradores pueden actualizar otros usuarios"
    );
  }

  if (!isAdmin && (validatedData.role || validatedData.isActive !== undefined)) {
    throw new Error(
      "Solo los administradores pueden cambiar el rol o estado de usuarios"
    );
  }

  // 5️⃣ Verificar email duplicado
  if (
    validatedData.email &&
    validatedData.email !== existingUser.email
  ) {
    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        deletedAt: null,
        NOT: { id },
      },
    });

    if (existingEmailUser) {
      throw new Error("Ya existe un usuario con este email");
    }
  }

  // 6️⃣ Preparar datos para actualizar
  const updateData: Prisma.UserUpdateInput = {};

  if (validatedData.email) updateData.email = validatedData.email;
  if (validatedData.firstName) updateData.firstName = validatedData.firstName;
  if (validatedData.lastName) updateData.lastName = validatedData.lastName;
  if (validatedData.role) updateData.role = validatedData.role;
  if (validatedData.isActive !== undefined)
    updateData.isActive = validatedData.isActive;

  if (validatedData.password) {
    updateData.passwordHash = await hashPassword(validatedData.password);
  }

  // 7️⃣ Actualizar usuario
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      companyId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      company: {
        select: { id: true, name: true },
      },
    },
  });

  return updatedUser;
} 


export async function deleteUser(
  id: string,
  currentUser: { 
    id: string;
    role: string;
    companyId: string;
  }
) {
  if (currentUser.role !== "admin") {
    throw new Error("Solo los administradores pueden eliminar usuarios");
  }

  const existingUser = await prisma.user.findUnique({
    where: { 
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      companyId: true,
      isActive: true,
      _count: {
        select: {
          quotations: true,
        },
      },
    }
  });

  if(!existingUser) {
    throw new Error("El usuario no existe");
  }

  if (existingUser.companyId !== currentUser.companyId) {
    throw new Error("No tienes permisos para eliminar este usuario");
  }
}