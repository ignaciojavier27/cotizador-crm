import { prisma } from '@/lib/prisma';
import { CreateProductInput, createProductSchema, UpdateProductInput, updateProductSchema } from '../validations/products';
import { Prisma, UserRole } from '@prisma/client';

export async function createProduct(
    data: CreateProductInput,
    companyId: string
) {
    const validationResult = createProductSchema.safeParse(data);

    if (!validationResult.success) {
        const errorDetails = validationResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        }));

        throw new Error(
            `Errores de validación: ${errorDetails
                .map((e) => e.message)
                .join(', ')}`
        );
    }

    const validatedData = validationResult.data;

    const existingProduct = await prisma.product.findFirst({
        where: { 
            name: validatedData.name, 
            companyId,
            deletedAt: null 
        },
    });

    if (existingProduct) {
        throw new Error('Ya existe un producto con el mismo nombre');
    }

    const newProduct = await prisma.product.create({
        data: {
            companyId,
            categoryId: validatedData.categoryId,
            name: validatedData.name,
            description: validatedData.description,
            type: validatedData.type,
            brand: validatedData.brand,
            basePrice: validatedData.basePrice,
            taxPercentage: validatedData.taxPercentage,
            isActive: validatedData.isActive
        },
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            brand: true,
            basePrice: true,
            taxPercentage: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    rut: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        }
    });

    return newProduct;
}

export async function getAllProducts(params: {
  companyId: string;
  isActive?: string | null;
  search?: string | null;
  categoryId?: string | null;
}) {
  const { companyId, isActive, search, categoryId } = params;

  const where: Record<string, unknown> = { companyId, deletedAt: null };

  if (isActive !== null && isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (categoryId && !isNaN(Number(categoryId))) {
    where.categoryId = Number(categoryId);
  }

  const prismaProducts = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      brand: true,
      basePrice: true,
      taxPercentage: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      companyId: true,
      company: {
        select: { id: true, name: true, rut: true },
      },
      category: {
        select: { id: true, name: true },
      },
      _count: {
        select: { quotationDetails: true },
      },
    },
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Adaptación para que coincida con ProductFull
  const products = prismaProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    type: p.type ?? '',
    brand: p.brand ?? '',
    basePrice: Number(p.basePrice),
    taxPercentage: p.taxPercentage ? Number(p.taxPercentage) : 0,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
    companyId: p.companyId,
    company: p.company
      ? {
          id: p.company.id,
          name: p.company.name,
        }
      : undefined,
    categoryId: p.category ? p.category.id : undefined,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
        }
      : null,
    _count: p._count,
  }));

  return {
    products,
    total: products.length,
    filters: {
      search: search || '',
      company: companyId,
      isActive: isActive || '',
      categoryId: categoryId || '',
    },
  };
}

export async function getProductById(id: string) {


    if(!id) {
        throw new Error("ID de producto inválido");
    }

    const product = await prisma.product.findUnique({
        where: { 
            id,
            deletedAt: null 
        },
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            brand: true,
            basePrice: true,
            taxPercentage: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    rut: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    quotationDetails: true
                },
            }
        }
    });

    if(!product) {
        throw new Error("Producto no encontrado");
    }

    return product;
}

export async function updateProduct(
    id: string,
    data: UpdateProductInput,
    currentUser: { 
        id: string;
        role: string;
        companyId: string;
    }
) {

    if(!id) {
        throw new Error("ID de producto inválido");
    }

    const existingProduct = await prisma.product.findUnique({
        where: { id, deletedAt: null },
    });

    if (!existingProduct || existingProduct.deletedAt) {
        throw new Error("Producto no encontrado");
    }

    if (existingProduct.companyId !== currentUser.companyId) {
        throw new Error("No tienes permisos para actualizar este producto");
    }

    const validationResult = updateProductSchema.safeParse(data);

    if (!validationResult.success) {
        const errors = validationResult.error.issues.map(
            (e) => `${e.path.join(".")}: ${e.message}`
        );
        throw new Error(`Errores de validación: ${errors.join(", ")}`);
    }

    const validatedData = validationResult.data;

    const isAdmin = currentUser.role === UserRole.admin;

    if (!isAdmin) {
        throw new Error("No tienes permisos para actualizar este producto");
    }

    if(
        validatedData.name &&
        validatedData.name !== existingProduct.name
    ) {
        const existingProductWithName = await prisma.product.findFirst({
            where: {
                name: validatedData.name,
                companyId: currentUser.companyId,
                deletedAt: null
            }
        });

        if(existingProductWithName) {
            throw new Error("Ya existe un producto con el mismo nombre");
        }
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if(validatedData.name) updateData.name = validatedData.name;
    if(validatedData.description) updateData.description = validatedData.description;
    if(validatedData.type) updateData.type = validatedData.type;
    if(validatedData.brand) updateData.brand = validatedData.brand;
    if(validatedData.base_price) updateData.basePrice = validatedData.base_price;
    if(validatedData.tax_percentage) updateData.taxPercentage = validatedData.tax_percentage;
    if(validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if(validatedData.categoryId) updateData.category = { connect: { id: validatedData.categoryId } };

    const updatedProduct = await prisma.product.update({ 
        where: { id}, 
        data: updateData,
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            brand: true,
            basePrice: true,
            taxPercentage: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    rut: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return updatedProduct;
}

export async function deleteProduct(
    id: string,
    currentUser: { 
        id: string;
        role: string;
        companyId: string;
    }
) {
    if(!id) {
        throw new Error("ID de producto inválido");
    }

    if(currentUser.role !== UserRole.admin) {
        throw new Error("Solo los administradores pueden eliminar productos");
    }

    const existingProduct = await prisma.product.findUnique({
        where: { 
            id,
            deletedAt: null,
        }
    });

    if(!existingProduct) {
        throw new Error("Producto no encontrado");
    }

    if(existingProduct.companyId !== currentUser.companyId) {
        throw new Error("No tienes permisos para eliminar este producto");
    }

    const deletedProduct = await prisma.product.update({ 
        where: { id }, 
        data: { deletedAt: new Date() },
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            brand: true,
            basePrice: true,
            taxPercentage: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    rut: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return deletedProduct;
}

export async function getActiveProducts(companyId: string) {
    const products = await prisma.product.findMany({
        where: { 
            companyId, 
            isActive: true,
            deletedAt: null 
        },
        select: {
            id: true,
            name: true,
            basePrice: true,
            taxPercentage: true,
            brand: true,
            type: true,
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    return products.map(p => ({
        id: p.id,
        name: p.name,
        basePrice: Number(p.basePrice),
        taxPercentage: p.taxPercentage ? Number(p.taxPercentage) : 0,
        brand: p.brand ?? '',
        type: p.type ?? '',
        category: p.category ? {
            id: p.category.id,
            name: p.category.name,
        } : null,
    }));
}



