import { prisma } from "@/lib/prisma"
import { CreateQuotationInput, UpdateQuotationInput, UpdateQuotationStatusInput } from "../validations/quotation";
import { Prisma, QuotationStatus } from "@prisma/client";

async function generateQuotationNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `COT-${year}-`;
  
  // Buscar la última cotización de la empresa en el año actual
  const lastQuotation = await prisma.quotation.findFirst({
    where: {
      companyId,
      quotationNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastQuotation) {
    const lastNumber = parseInt(lastQuotation.quotationNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

function calculateTotals(details: CreateQuotationInput['details']) {
  let total = 0;
  let totalTax = 0;

  const calculatedDetails = details.map(detail => {
    const subtotal = detail.quantity * detail.unitPrice;
    const lineTax = subtotal * 0.19; // IVA 19% - ajusta según tu país
    
    total += subtotal;
    totalTax += lineTax;

    return {
      ...detail,
      subtotal,
      lineTax
    };
  });

  return {
    calculatedDetails,
    total,
    totalTax
  };
}


export async function createQuotation(
    data: CreateQuotationInput,
    userId: string,
    companyId: string
) {
    
    const client = await prisma.client.findFirst({
        where: {
            id: data.clientId,
            companyId,
            deletedAt: null
        }
    })

    if(!client) {
        throw new Error("Cliente no encontrado o no pertenece a esta empresa");
    }

    const productIds = data.details.map(detail => detail.productId);

    const products = await prisma.product.findMany({
        where: {
            id: { in: productIds },
            companyId,
            deletedAt: null
        }
    })

    if (products.length !== productIds.length) {
        throw new Error("Uno o más productos no encontrados o no pertenecen a esta empresa");
    }

    const quotationNumber = await generateQuotationNumber(companyId);

    const { calculatedDetails, total, totalTax } = calculateTotals(data.details);
    
    const expiresAt = data.expiresAt
        ? new Date(data.expiresAt)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const quotation = await prisma.$transaction(async (tx) => {
        const newQuotation = await tx.quotation.create({
            data: {
                quotationNumber,
                userId,
                clientId: data.clientId,
                companyId,
                total,
                totalTax,
                status: QuotationStatus.sent,
                sentAt: new Date(),
                expiresAt,
                internalNotes: data.internalNotes,
                details: {
                    create: calculatedDetails.map(detail => ({
                        productId: detail.productId,
                        quantity: detail.quantity,
                        unitPrice: detail.unitPrice,
                        subtotal: detail.subtotal,
                        lineTax: detail.lineTax
                    }))
                }
            },
            include: {
                details: {
                    include: {
                        product: true
                    }
                },
                client: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        })

        await tx.quotationHistory.create({
            data: {
                quotationId: newQuotation.id,
                userId,
                previousStatus: null,
                newStatus: QuotationStatus.sent,
                changeReason: "Cotización creada",
            }
        })

        return newQuotation;

    })

    return quotation;

}


export async function getAllQuotations(
    companyId: string,
    filters?: {
        status?: QuotationStatus;
        clientId?: string;
        userId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }
) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.QuotationWhereInput = {
        companyId,
        deletedAt: null,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.search && {
            OR: [
                { quotationNumber: { contains: filters.search } },
                { client: { name: { contains: filters.search } } },
                { client: { email: { contains: filters.search } } }
            ]
        })
    };

    const [quotations, total] = await Promise.all([
        prisma.quotation.findMany({
        where,
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            },
            details: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            description: true
                        }
                    }  
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip,
        take: limit
        }),
        prisma.quotation.count({ where })
    ]);

  return {
    quotations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getQuotationById(id: string, companyId: string) {
    const quotation = await prisma.quotation.findFirst({
        where: { id, companyId, deletedAt: null },
        include: {
            client: true,
            user: {
                select: { id: true, firstName: true, lastName: true, email: true }
            },
            details: {
                include: { product: true }
            },
            history: {
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    changedAt: 'desc'
                }
            }
        }
    });

    if (!quotation) {
        throw new Error("Cotización no encontrada");
    }

    return quotation;
}

export async function updateQuotation(
    id: string,
    data: UpdateQuotationInput,
    companyId: string
) {
    // Verificar que la cotización existe y pertenece a la empresa
    const existingQuotation = await prisma.quotation.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null
        }
    });

    if (!existingQuotation) {
        throw new Error("Cotización no encontrada");
    }

    // Solo se puede actualizar si está en estado 'sent'
    if (existingQuotation.status !== QuotationStatus.sent) {
        throw new Error("Solo se pueden actualizar cotizaciones en estado 'enviado'");
    }

    // Si se actualiza el cliente, validar que existe
    if (data.clientId) {
        const client = await prisma.client.findFirst({
            where: {
                id: data.clientId,
                companyId,
                deletedAt: null
            }
        });

        if (!client) {
            throw new Error("Cliente no encontrado");
        }
    }

    // Si se actualizan los detalles, validar productos y recalcular totales
    let updateData: Prisma.QuotationUpdateInput = {
        ...(data.clientId && { clientId: data.clientId }),
        ...(data.expiresAt !== undefined && { 
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null 
        }),
        ...(data.internalNotes !== undefined && { internalNotes: data.internalNotes }),
        updatedAt: new Date()
    };

    if (data.details) {
        // Validar productos
        const productIds = data.details.map(d => d.productId);
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                companyId,
                deletedAt: null
            }
        });

        if (products.length !== productIds.length) {
            throw new Error("Uno o más productos no encontrados");
        }

        // Calcular nuevos totales
        const { calculatedDetails, total, totalTax } = calculateTotals(data.details);

        updateData = {
            ...updateData,
            total,
            totalTax
        };

        // Actualizar en transacción
        const quotation = await prisma.$transaction(async (tx) => {
            // Eliminar detalles antiguos
            await tx.quotationDetail.deleteMany({
                where: { quotationId: id }
            });

            // Crear nuevos detalles
            await tx.quotationDetail.createMany({
                data: calculatedDetails.map(detail => ({
                    quotationId: id,
                    productId: detail.productId,
                    quantity: detail.quantity,
                    unitPrice: detail.unitPrice,
                    subtotal: detail.subtotal,
                    lineTax: detail.lineTax
                }))
            });

            // Actualizar cotización
            return tx.quotation.update({
                where: { id },
                data: updateData,
                include: {
                    details: {
                        include: {
                            product: true
                        }
                    },
                    client: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });
        });

        return quotation;
    }

  // Si no se actualizan detalles, solo actualizar la cotización
    const quotation = await prisma.quotation.update({
        where: { id },
        data: updateData,
        include: {
            details: {
                include: {
                    product: true
                }
            },
            client: true,
            user: {
                select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
                }
            }
        }
    });

  return quotation;
}


export async function updateQuotationStatus(
    id: string,
    data: UpdateQuotationStatusInput,
    userId: string,
    companyId: string
) {
    // Verificar que la cotización existe
    const existingQuotation = await prisma.quotation.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null
        }
    });

    if (!existingQuotation) {
        throw new Error("Cotización no encontrada");
    }

    const previousStatus = existingQuotation.status;
    const newStatus = data.status as QuotationStatus;

    // Preparar datos de actualización según el nuevo estado
    const updateData: Prisma.QuotationUpdateInput = {
        status: newStatus,
        updatedAt: new Date()
    };

    if (newStatus === QuotationStatus.accepted) {
        updateData.acceptedAt = new Date();
    } else if (newStatus === QuotationStatus.rejected) {
        updateData.rejectionReason = data.rejectionReason;
    }

    // Actualizar en transacción
    const quotation = await prisma.$transaction(async (tx) => {
        // Actualizar cotización
        const updated = await tx.quotation.update({
            where: { id },
            data: updateData,
            include: {
                details: {
                    include: {
                        product: true
                    }
                },
                client: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Registrar en historial
        await tx.quotationHistory.create({
            data: {
                quotationId: id,
                userId,
                previousStatus,
                newStatus,
                changeReason: data.changeReason || `Estado cambiado de ${previousStatus} a ${newStatus}`
            }
        });

        return updated;
    });

    return quotation;
}



export async function deleteQuotation(id: string, companyId: string) {
    // Verificar que la cotización existe
    const existingQuotation = await prisma.quotation.findFirst({
        where: {
            id,
            companyId,
            deletedAt: null
        }
    });

    if (!existingQuotation) {
        throw new Error("Cotización no encontrada");
    }

    // Solo se puede eliminar si está en estado 'sent'
    if (existingQuotation.status !== QuotationStatus.sent) {
        throw new Error("Solo se pueden eliminar cotizaciones en estado 'enviado'");
    }

    // Soft delete
    const quotation = await prisma.quotation.update({
        where: { id },
        data: {
            deletedAt: new Date()
        }
    });

    return quotation;
}