import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAuth } from "@/lib/auth/authorize";
import { deleteTax, getTaxById, updateTax } from "@/lib/services/taxServices";
import { NextRequest } from "next/server";

// Helper para extraer ID
const getId = (pathname: string) => {
    const parts = pathname.split('/');
    return parts[parts.length - 1];
}

/**
 * GET /api/taxes/[id]
 * Obtener impuesto por ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAuth();
        const { id } = await params;

        const tax = await getTaxById(id);

        return successResponse({ data: tax }, "Impuesto obtenido correctamente");
    } catch (error) {
        console.error("Error al obtener impuesto:", error);
        if (error instanceof Error && error.message === "Impuesto no encontrado") {
            return errorResponse(error.message, 404);
        }
        return serverErrorResponse("Error al obtener el impuesto");
    }
}

/**
 * PUT /api/taxes/[id]
 * Actualizar impuesto
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await requireAuth();
        const { id } = await params;
        const body = await request.json();

        const updatedTax = await updateTax(id, body, currentUser);

        return successResponse({ data: updatedTax }, "Impuesto actualizado correctamente");
    } catch (error) {
        console.error("Error al actualizar impuesto:", error);
        if (error instanceof AuthError) {
            return errorResponse(error.message, 403);
        }
        return serverErrorResponse("Error al actualizar el impuesto");
    }
}

/**
 * DELETE /api/taxes/[id]
 * Eliminar impuesto
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await requireAuth();
        const { id } = await params;

        await deleteTax(id, currentUser);

        return successResponse(null, "Impuesto marcado como eliminado");
    } catch (error) {
        console.error("Error al eliminar impuesto:", error);
        if (error instanceof AuthError) {
            return errorResponse(error.message, 403);
        }
        return serverErrorResponse("Error al eliminar el impuesto");
    }
}
