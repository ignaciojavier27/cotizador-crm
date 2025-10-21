import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin, requireAuth } from "@/lib/auth/authorize";
import { getUserById, updateUser, deleteUser } from "@/lib/services/userServices";
import { validateUUID } from "@/utils/validations";
import { AuthError } from "@/lib/auth/authorize";
import { NextRequest } from "next/server";

/**
 * GET /api/users/:id
 * Obtener un usuario por ID
 * Solo accesible para usuarios de la misma empresa
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

    try {

        const user = await requireAuth();
        
        const { id } = await params;
        
        const isValidUUID = await validateUUID(id);
        if(!isValidUUID) return errorResponse('El ID ingresado no es válido', 400)
            
        const userById = await getUserById(id);
        if(user.companyId !== userById.companyId) return errorResponse('No tienes acceso a este usuario', 403)
                
        return successResponse(userById, 'Usuario obtenido correctamente', 200);
    } catch (error) {
        console.error('Error al obtener usuario:', error)
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        return serverErrorResponse("Error al obtener usuario");
    }
}


/**
 * PUT /api/users/:id
 * Actualizar un usuario
 * Solo accesible para admins de la misma empresa
 * Un usuario puede actualizar su propia información (excepto rol)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const isValidUUID = await validateUUID(id);
    if(!isValidUUID) return errorResponse('El ID ingresado no es válido', 400)

    const updatedUser = await updateUser(id, body, currentUser);

    return successResponse(updatedUser, "Usuario actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);

    if (error instanceof Error) {
      if (error.message.includes("Ya existe un usuario")) {
        return errorResponse(error.message, 409);
      }
      if (error.message.includes("No tienes permisos")) {
        return errorResponse(error.message, 403);
      }
      if (error.message.includes("no encontrado")) {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("validación")) {
        return errorResponse(error.message, 400);
      }
      if (error.message.includes("iniciar sesión")) {
        return errorResponse(error.message, 401);
      }
    }

    return serverErrorResponse("Error al actualizar el usuario");
  }
}

/**
 * DELETE /api/users/:id
 * Eliminar un usuario
 * Solo accesible para admins
 * No se puede eliminar el propio usuario
 */

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const currentUser = await requireAdmin();
        const { id } = await params;

        const isValidUUID = await validateUUID(id);
        if(!isValidUUID) return errorResponse('El ID ingresado no es válido', 400)

        const deletedUser = await deleteUser(id, currentUser)

        return successResponse(deletedUser, 'Usuario eliminado correctamente', 200);
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        return serverErrorResponse("Error al eliminar usuario");
    }
}