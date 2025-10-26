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
        where: { name: validatedData.name, deletedAt: null },
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

export async function getAllProducts(
    params: {
        companyId: string;
        isActive?: string | null;
        search?: string | null;
        categoryId?: string | null;
    }
) {
    const { companyId, isActive, search, categoryId } = params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { companyId, deletedAt: null };

    if (isActive !== null && isActive !== undefined) {
        where.isActive = isActive === 'true';
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (categoryId) {
        where.categoryId = Number(categoryId);
    }

    const products = await prisma.product.findMany({
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
        },
        orderBy: [
            { isActive: 'desc' },
            { createdAt: 'desc' },
        ]
    });

    return {
        products,
        total: products.length,
        filters: {
            search: search || '',
            company: companyId,
            isActive: isActive || '',
            categoryId: categoryId || '',
        },
    }
}

export async function getProductById(id: number) {
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
    id: number,
    data: UpdateProductInput,
    currentUser: { 
        id: string;
        role: string;
        companyId: string;
    }
) {

    const existingProduct = await prisma.product.findUnique({
        where: { id },
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
        where: { id }, 
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
    id: number,
    currentUser: { 
        id: string;
        role: string;
        companyId: string;
    }
) {
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
