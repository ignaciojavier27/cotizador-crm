/**
 * GET /api/categories/:id
 * Obtener una categoría por su ID
 * Solo accesible para usuarios autenticados de la misma empresa
 */

import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAdmin, requireAuth } from "@/lib/auth/authorize";
import { deleteCategory, getCategoryById, updateCategory } from "@/lib/services/categoryServices";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const id = params.id;

    if(!id) return errorResponse('El ID ingresado no es valido', 400)

    const categoryById = await getCategoryById(id, currentUser.companyId);

    if (currentUser.companyId !== categoryById.companyId)
      return errorResponse('No tienes acceso a esta categoría', 403);

    return successResponse(categoryById, 'Categoría obtenida correctamente', 200);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    if (error instanceof AuthError) {
      if (error.code === 'UNAUTHORIZED')
        return errorResponse(error.message, 401);
      if (error.code === 'FORBIDDEN')
        return errorResponse(error.message, 403);
    }

    if (error instanceof Error && error.message.includes('no encontrada')) {
      return errorResponse(error.message, 404);
    }

    return serverErrorResponse('Error al obtener la categoría');
  }
}

/**
 * PUT /api/categories/:id
 * Actualizar una categoría
 * Solo accesible para admins
 */

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await requireAdmin();
        const id = params.id;

        if(!id) return errorResponse('El ID ingresado no es valido', 400)

        const body = await request.json();
        
        const updatedCategory = await updateCategory(id, body, currentUser.companyId);

        return successResponse(updatedCategory, "Categoría actualizada exitosamente");
    } catch (error) {
        console.error("Error al actualizar categoría:", error);
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        if (error instanceof Error) {
            if (error.message.includes("no encontrada")) {
                return errorResponse(error.message, 404);
            }

            if (error.message.includes("no pertenece")) {
                return errorResponse(error.message, 403);
            }

            if (error.message.includes("mismo nombre")) {
                return errorResponse(error.message, 409);
            }
        }
        return serverErrorResponse("Error al actualizar la categoría");
    }

}


/**
 * DELETE /api/categories/:id
 * Eliminar una categoría
 * Solo accesible para admins
 */

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const currentUser = await requireAdmin();
        const id = params.id;

        if(!id) return errorResponse('El ID ingresado no es valido', 400)

        const deletedCategory = await deleteCategory(id, currentUser.companyId);

        return successResponse(deletedCategory, 'Categoría eliminada correctamente', 200);
    } catch (error) {
        console.error('Error al eliminar categoría:', error)
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        if (error instanceof Error) {
            if (error.message.includes("no encontrada")) {
                return errorResponse(error.message, 404);
            }

            if (error.message.includes("no pertenece")) {
                return errorResponse(error.message, 403);
            }
        }
        return serverErrorResponse("Error al eliminar la categoría");
    }
}