import { prisma } from "@/lib/prisma";
import { createCompanySchema, updatedCompanySchema } from "../validations/company";
import { randomUUID } from "crypto";
import { z } from "zod"; // 👈 importante: importar z

export async function createCompany(data: unknown) {

  const validationResult = createCompanySchema.safeParse(
    data as z.infer<typeof createCompanySchema>
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

  const existingCompany = await prisma.company.findUnique({
    where: { rut: validatedData.rut },
  });

  if (existingCompany) {
    throw new Error("Ya existe una empresa con el mismo RUT");
  }

  const newCompany = await prisma.company.create({
    data: {
      id: randomUUID(),
      name: validatedData.name,
      rut: validatedData.rut,
      logoUrl: validatedData.logoUrl,
      address: validatedData.address,
      phone: validatedData.phone,
      contactEmail: validatedData.contactEmail,
    },
    select: {
      id: true,
      name: true,
      rut: true,
      logoUrl: true,
      address: true,
      phone: true,
      contactEmail: true,
      createdAt: true,
    },
  });

  return newCompany;
}

export async function getCompanyById(id: string) {
  const company = await prisma.company.findFirst({ 
    where: { 
      id,
      deletedAt: null
    },
    select: {
        id: true,
        name: true,
        rut: true,
        logoUrl: true,
        address: true,
        phone: true,
        contactEmail: true,
        createdAt: true,
        updatedAt: true,
        _count: {
            select: {
                users: true,
                products: true,
                clients: true,
                quotations: true
            }
        }
    }
  });

  if(!company) {
    throw new Error("Empresa no encontrada");
  }

  return company
}

export async function updateCompany(id: string, data: unknown) {
  const validationResult = updatedCompanySchema.safeParse(
    data as z.infer<typeof updatedCompanySchema>
  )

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

  // Verificar si existe la empresa
  const existingCompany = await prisma.company.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingCompany) throw new Error("Empresa no encontrada");

  // Evitar duplicado de RUT si se actualiza
  if (validatedData.rut && validatedData.rut !== existingCompany.rut) {
    const rutExists = await prisma.company.findUnique({ where: { rut: validatedData.rut } });
    if (rutExists) throw new Error("Ya existe una empresa con el mismo RUT");
  }

  return prisma.company.update({
    where: { id },
    data: validatedData,
    select: {
      id: true,
      name: true,
      rut: true,
      logoUrl: true,
      address: true,
      phone: true,
      contactEmail: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


/**
 * Eliminar empresa (soft delete)
 */
export async function deleteCompany(id: string) {
  // Verificar si existe la empresa
  const existingCompany = await prisma.company.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingCompany) throw new Error("Empresa no encontrada");

  // Soft delete
  return prisma.company.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: {
      id: true,
      name: true,
      deletedAt: true,
    },
  });
}
