import { Prisma, UserRole } from "@prisma/client";
import { prisma } from '@/lib/prisma';
import { CreateClientInput, createClientSchema } from "../validations/clients";

export async function createClient(
    data: CreateClientInput,
    companyId: string
) {
    
    if(!companyId) {
        throw new Error("ID de empresa inválido");
    }

    const validationResult = createClientSchema.safeParse(data);

    if(!validationResult.success) {
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

    const existingClient = await prisma.client.findFirst({
        where: { 
            name: validatedData.name, 
            companyId,
            deletedAt: null
        },
    });

    if (existingClient) {
        throw new Error("Este cliente ya existe");
    }

    const newClient = await prisma.client.create({
        data: {
            companyId,
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            clientCompany: validatedData.clientCompany,
            referenceContact: validatedData.referenceContact,
            dataConsent: validatedData.dataConsent
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clientCompany: true,
            referenceContact: true,
            dataConsent: true,
            consentDate: true,
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
        }
    });

    return newClient;
}

export async function getAllClients(params: {
    companyId: string;
    search?: string | null;
}) {
    const { companyId, search } = params;

    const where: Record<string, unknown> = { companyId, deletedAt: null };

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
        ];
    }

    const prismaClients = await prisma.client.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clientCompany: true,
            referenceContact: true,
            dataConsent: true,
            consentDate: true,
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
        },
        orderBy: [
            { name: 'asc' },
            { createdAt: 'desc' },
        ],
    });

    return {
        clients: prismaClients,
        total: prismaClients.length,
        filters: {
            search: search || '',
            company: companyId
        }
    }

}

export async function getClientById(id: string) {
    if(!id) {
        throw new Error("ID de cliente inválido");
    }

    const client = await prisma.client.findUnique({
        where: { id, deletedAt: null },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clientCompany: true,
            referenceContact: true,
            dataConsent: true,
            consentDate: true,
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
        }
    });

    if(!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
}

export async function updateClient(
    id: string,
    data: CreateClientInput,
    currentUser: { 
        id: string;
        role: string;
        companyId: string;
    }
) {

    if(!id) {
        throw new Error("ID de cliente inválido");
    }

    const existingClient = await prisma.client.findUnique({
        where: { id, deletedAt: null },
    });

    if(!existingClient || existingClient.deletedAt) {
        throw new Error("Cliente no encontrado");
    }

    if(existingClient.companyId !== currentUser.companyId) {
        throw new Error("No tienes permisos para actualizar este cliente");
    }

    const validationResult = createClientSchema.safeParse(data);

    if(!validationResult.success) {
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

    if(
        validatedData.name &&
        validatedData.name !== existingClient.name
    ) {
        const existingClientName = await prisma.client.findFirst({
            where: { 
                name: validatedData.name, 
                companyId: existingClient.companyId,
                deletedAt: null
            },
        });

        if(existingClientName) {
            throw new Error("Ya existe un cliente con el mismo nombre");
        }
    }

    const updateData: Prisma.ClientUpdateInput = {}

    if(validatedData.name) updateData.name = validatedData.name;
    if(validatedData.email) updateData.email = validatedData.email;
    if(validatedData.phone) updateData.phone = validatedData.phone;
    if(validatedData.clientCompany) updateData.clientCompany = validatedData.clientCompany;
    if(validatedData.referenceContact) updateData.referenceContact = validatedData.referenceContact;
    if(validatedData.dataConsent) updateData.dataConsent = validatedData.dataConsent;

    const updatedClient = await prisma.client.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clientCompany: true,
            referenceContact: true,
            dataConsent: true,
            consentDate: true,
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
        }
    });

    return updatedClient;

}

export async function deleteClient(id: string, currentUser: { 
    id: string;
    role: string;
    companyId: string;
}) {

    if(!id) {
        throw new Error("ID de cliente inválido");
    }

    if(currentUser.role !== UserRole.admin) {
        throw new Error("Solo los administradores pueden eliminar clientes");
    }

    const existingClient = await prisma.client.findUnique({
        where: { id, deletedAt: null },
    });

    if(!existingClient) {
        throw new Error("Cliente no encontrado");
    }

    if(existingClient.companyId !== currentUser.companyId) {
        throw new Error("No tienes permisos para eliminar este cliente");
    }

    const deletedClient = await prisma.client.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            clientCompany: true,
            referenceContact: true,
            dataConsent: true,
            consentDate: true,
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
        }
    });

    return deletedClient;
}