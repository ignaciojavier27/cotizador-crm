import { z } from "zod";
import { createCategorySchema } from "../validations/category";
import { prisma } from "@/lib/prisma";

export async function createCategory(data: unknown, companyId: string) {
    const validationResult = createCategorySchema.safeParse(
        data as z.infer<typeof createCategorySchema>
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


    const existingCategory = await prisma.category.findFirst({
        where: { name: validatedData.name },
    });

    if(existingCategory) {
        throw new Error("Ya existe una categoria con el mismo nombre");
    }

    const newCategory = await prisma.category.create({
        data: {
            name: validatedData.name,
            description: validatedData.description,
            companyId: companyId,
        },
    });

    return newCategory
}

// ✅ Obtener todas las categorías de una empresa
export async function getCategories(
  params: { 
    search: string | null;
    companyId: string;
  }
) {

  const { search, companyId } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { companyId };

  if(search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return {
    categories,
    total: categories.length,
    filters: {
      search: search || '',
      companyId
    }
  };
}


// ✅ Obtener una categoría por ID
export async function getCategoryById(id: number, companyId: string) {
  const category = await prisma.category.findFirst({
    where: { id, companyId },
  });

  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  return category;
}



// ✅ Actualizar categoría
export async function updateCategory(
  id: number,
  data: unknown,
  companyId: string
) {
  const validationResult = createCategorySchema.safeParse(
    data as z.infer<typeof createCategorySchema>
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

  const category = await prisma.category.findFirst({
    where: { id, companyId },
  });

  if (!category) {
    throw new Error("Categoría no encontrada o no pertenece a esta empresa");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      name: validatedData.name,
      companyId,
      NOT: { id },
    },
  });

  if (existingCategory) {
    throw new Error("Ya existe otra categoría con el mismo nombre");
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name: validatedData.name,
      description: validatedData.description,
    },
  });

  return updatedCategory;
}


// ✅ Eliminar categoría
export async function deleteCategory(id: number, companyId: string) {
  const category = await prisma.category.findFirst({
    where: { id, companyId },
  });

  if (!category) {
    throw new Error("Categoría no encontrada");
  }

  await prisma.category.delete({ where: { id } });

  return { success: true, message: "Categoría eliminada correctamente" };
}



