import { prisma } from "@/lib/prisma";
import { createCompanySchema } from "../validations/company";
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
