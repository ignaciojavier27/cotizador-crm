import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAuth } from "@/lib/auth/authorize";
import { deleteProduct, getProductById, updateProduct } from "@/lib/services/productServices";
import { NextRequest } from "next/server";

/**
 * GET /api/products/:id
 * Obtener un producto por su ID
 * Solo accesible para usuarios autenticados de la misma empresa
 */
export async function GET (
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const user = await requireAuth();
        const { id } = await params;

        if(typeof id !== 'number') return errorResponse('El ID ingresado no es valido', 400)

        const productById = await getProductById(id);

        if(user.companyId !== productById.company.id) return errorResponse('No tienes acceso a este producto', 403)

        return successResponse(productById, 'Producto obtenido correctamente', 200);
    } catch (error) {
        console.error('Error al obtener producto:', error)

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }


        if (error instanceof Error && error.message.includes("no encontrado")) {
            return errorResponse(error.message, 404);
        }
        return serverErrorResponse("Error al obtener el producto");
    }
}

/**
 * PUT /api/products/:id
 * Actualizar un producto
 * Solo accesible para admins
 */
export async function PUT (
    request: NextRequest,
    { params }: { params: Promise<{ id: number }> }
) {
    try {
        const currentUser = await requireAuth();
        const { id } = await params;
        const body = await request.json();
        const updatedProduct = await updateProduct(id, body, currentUser);

        return successResponse(updatedProduct, "Producto actualizado exitosamente");
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        if (error instanceof Error) {
            if (error.message.includes("no encontrado")) {
                return errorResponse(error.message, 404);
            }
            if (error.message.includes("mismo nombre")) {
                return errorResponse(error.message, 409);
            }
            if (error.message.includes("No tienes permisos")) {
                return errorResponse(error.message, 403);
            }
        }
        return serverErrorResponse("Error al actualizar el producto");
    } 
}


/**
 * DELETE /api/products/:id
 * Eliminar un producto
 * Solo accesible para admins
 */
export async function DELETE (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const currentUser = await requireAuth();
        const { id } = await params;

        if(typeof id !== 'number') return errorResponse('El ID ingresado no es valido', 400)

        const deletedProduct = await deleteProduct(id, currentUser)

        return successResponse(deletedProduct, 'Producto eliminado correctamente', 200);
    } catch (error) {
        console.error('Error al eliminar producto:', error)
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        if (error instanceof Error) {
            if (error.message.includes("no encontrado")) {
                return errorResponse(error.message, 404);
            }

            if (error.message.includes("No tienes permisos")) {
                return errorResponse(error.message, 403);
            }
        }
        return serverErrorResponse("Error al eliminar el producto");
    }
}