import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAdmin, requireAuth } from "@/lib/auth/authorize";
import { deleteClient, getClientById, updateClient } from "@/lib/services/clientServices";
import { NextRequest } from "next/server";

/**
 * GET /api/clients/:id
 * Obtener un cliente por su ID
 * Solo accesible para usuarios autenticados de la misma empresa
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth();
        const { id } = await params;

        if (!id) return errorResponse('El ID ingresado no es valido', 400)

        const clientById = await getClientById(id);

        if (user.companyId !== clientById.companyId) {
            return errorResponse('No tienes acceso a este cliente', 403);
        }

        return successResponse(clientById, 'Cliente obtenido correctamente', 200);

    } catch (error){
        console.error('Error al obtener cliente:', error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }

        if (error instanceof Error && error.message.includes("no encontrado")) {
            return errorResponse(error.message, 404);
        }

        return serverErrorResponse('Error al obtener el cliente');
    }
}

/**
 * PUT /api/clients/:id
 * Actualizar un cliente
 */

export async function PUT(
    request: NextRequest,
    { params } : { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth();
        const { id } = await params;

        if(!id) return errorResponse('El ID ingresado no es valido', 400)

        const body = await request.json();
        const updatedClient = await updateClient(id, body, user);

        return successResponse(updatedClient, "Cliente actualizado exitosamente");
    } catch (error) {
        console.error("Error al actualizar cliente:", error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }

        if(error instanceof Error) {
            if (error.message.includes("no encontrado")) {
                return errorResponse(error.message, 404);
            }
            if (error.message.includes("No tienes permisos")) {
                return errorResponse(error.message, 403);
            }
            if (error.message.includes("Ya existe un cliente")) {
                return errorResponse(error.message, 409);
            }
        }

        return serverErrorResponse("Error al actualizar el cliente");
    }
}

/**
 * DELETE /api/clients/:id
 * Eliminar un cliente
 * Solo accesible para admins
 */

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAdmin();
        const { id } = await params;

        if(!id) return errorResponse('El ID ingresado no es valido', 400)

        const deletedClient = await deleteClient(id, user);

        return successResponse(deletedClient, 'Cliente eliminado correctamente', 200);
    } catch (error) {
        console.error('Error al eliminar cliente:', error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }

        if(error instanceof Error) {
            if (error.message.includes("los administradores")) {
                return errorResponse(error.message, 404);
            }
            if (error.message.includes("No tienes permisos")) {
                return errorResponse(error.message, 403);
            }
        }

        return serverErrorResponse('Error al eliminar el cliente');
    }
}