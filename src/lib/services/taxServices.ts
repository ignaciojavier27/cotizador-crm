import { prisma } from '@/lib/prisma';
import { CreateTaxInput, createTaxSchema, UpdateTaxInput, updateTaxSchema } from '../validations/tax';
import { Prisma, UserRole } from '@prisma/client';

export async function createTax(
    data: CreateTaxInput,
    companyId: string
) {
    const validationResult = createTaxSchema.safeParse(data);

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

    const existingTax = await prisma.tax.findFirst({
        where: {
            name: validatedData.name,
            companyId,
            deletedAt: null
        },
    });

    if (existingTax) {
        throw new Error('Ya existe un impuesto con el mismo nombre');
    }

    const newTax = await prisma.tax.create({
        data: {
            companyId,
            name: validatedData.name,
            percentage: validatedData.percentage,
            description: validatedData.description,
            isActive: validatedData.isActive
        },
        select: {
            id: true,
            name: true,
            percentage: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
        }
    });

    return {
        ...newTax,
        percentage: Number(newTax.percentage)
    };
}

export async function getAllTaxes(params: {
    companyId: string;
    isActive?: string | null;
    search?: string | null;
}) {
    const { companyId, isActive, search } = params;

    const where: Record<string, unknown> = { companyId, deletedAt: null };

    if (isActive !== null && isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
    }

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
        ];
    }

    const prismaTaxes = await prisma.tax.findMany({
        where,
        select: {
            id: true,
            name: true,
            percentage: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
        },
        orderBy: [
            { isActive: 'desc' },
            { createdAt: 'desc' },
        ],
    });

    const taxes = prismaTaxes.map((t) => ({
        id: t.id,
        name: t.name,
        percentage: Number(t.percentage),
        description: t.description ?? '',
        isActive: t.isActive,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt ? t.updatedAt.toISOString() : undefined,
        companyId: t.companyId,
    }));

    return {
        taxes,
        total: taxes.length,
        filters: {
            search: search || '',
            company: companyId,
            isActive: isActive || '',
        },
    };
}

export async function getTaxById(id: string) {
    if (!id) {
        throw new Error("ID de impuesto inválido");
    }

    const tax = await prisma.tax.findUnique({
        where: {
            id,
            deletedAt: null
        },
        select: {
            id: true,
            name: true,
            percentage: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
        }
    });

    if (!tax) {
        throw new Error("Impuesto no encontrado");
    }

    return {
        ...tax,
        percentage: Number(tax.percentage),
        description: tax.description ?? '',
        updatedAt: tax.updatedAt ? tax.updatedAt.toISOString() : null,
        createdAt: tax.createdAt.toISOString(),
    };
}

export async function updateTax(
    id: string,
    data: UpdateTaxInput,
    currentUser: {
        id: string;
        role: string;
        companyId: string;
    }
) {

    if (!id) {
        throw new Error("ID de impuesto inválido");
    }

    const existingTax = await prisma.tax.findUnique({
        where: { id, deletedAt: null },
    });

    if (!existingTax) {
        throw new Error("Impuesto no encontrado");
    }

    if (existingTax.companyId !== currentUser.companyId) {
        throw new Error("No tienes permisos para actualizar este impuesto");
    }

    const validationResult = updateTaxSchema.safeParse(data);

    if (!validationResult.success) {
        const errors = validationResult.error.issues.map(
            (e) => `${e.path.join(".")}: ${e.message}`
        );
        throw new Error(`Errores de validación: ${errors.join(", ")}`);
    }

    const validatedData = validationResult.data;

    const isAdmin = currentUser.role === UserRole.admin;

    if (!isAdmin) {
        throw new Error("No tienes permisos para actualizar impuestos");
    }

    if (
        validatedData.name &&
        validatedData.name !== existingTax.name
    ) {
        const existingTaxWithName = await prisma.tax.findFirst({
            where: {
                name: validatedData.name,
                companyId: currentUser.companyId,
                deletedAt: null
            }
        });

        if (existingTaxWithName) {
            throw new Error("Ya existe un impuesto con el mismo nombre");
        }
    }

    const updateData: Prisma.TaxUpdateInput = {};

    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.percentage !== undefined) updateData.percentage = validatedData.percentage;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const updatedTax = await prisma.tax.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            percentage: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
        },
    });

    return {
        ...updatedTax,
        percentage: Number(updatedTax.percentage)
    };
}

export async function deleteTax(
    id: string,
    currentUser: {
        id: string;
        role: string;
        companyId: string;
    }
) {
    if (!id) {
        throw new Error("ID de impuesto inválido");
    }

    if (currentUser.role !== UserRole.admin) {
        throw new Error("Solo los administradores pueden eliminar impuestos");
    }

    const existingTax = await prisma.tax.findUnique({
        where: {
            id,
            deletedAt: null,
        }
    });

    if (!existingTax) {
        throw new Error("Impuesto no encontrado");
    }

    if (existingTax.companyId !== currentUser.companyId) {
        throw new Error("No tienes permisos para eliminar este impuesto");
    }

    const deletedTax = await prisma.tax.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: {
            id: true,
            name: true,
            percentage: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
        },
    });

    return {
        ...deletedTax,
        percentage: Number(deletedTax.percentage)
    };
}
