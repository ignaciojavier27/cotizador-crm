import { NextRequest } from "next/server";
import { updateQuotationSchema } from "@/lib/validations/quotation";
import { deleteQuotation, getQuotationById, updateQuotation } from "@/lib/services/quotationServices";
import { AuthError, requireAuth } from "@/lib/auth/authorize";
import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";

// ==========================================
// GET /api/quotations/[id] - Obtener cotización
// ==========================================
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const quotation = await getQuotationById(
        params.id,
        user.companyId
    );

    if (user.companyId !== quotation.companyId) {
      return errorResponse('No tienes acceso a esta cotización', 403);
    }

    return successResponse(quotation, "Cotización obtenida correctamente");

  } catch (error) {
    console.error("Error al obtener cotización:", error);

    if (error instanceof AuthError) {
        if (error.code === "UNAUTHORIZED")
            return errorResponse(error.message, 401);
        if (error.code === "FORBIDDEN")
            return errorResponse(error.message, 403);
    }

    if (error instanceof Error && error.message.includes("no encontrada")) {
        return errorResponse(error.message, 404);        
    }

    return serverErrorResponse("Error al obtener la cotización");
  }
}

// ==========================================
// PUT /api/quotations/[id] - Actualizar cotización
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if(!id) return errorResponse('El ID ingresado no es valido', 400)

    const body = await req.json();
    const validatedData = updateQuotationSchema.parse(body);

    // Actualizar cotización
    const quotation = await updateQuotation(
        id,
        validatedData,
        user.companyId
    );

    return successResponse(quotation, "Cotización actualizada correctamente");

  } catch (error) {
    console.error("Error al actualizar cotización:", error);

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
        if (error.message.includes("Solo se pueden actualizar")) {
          return errorResponse(error.message, 400);
        }
    }


    return serverErrorResponse("Error al actualizar la cotización");
  }
}

// ==========================================
// DELETE /api/quotations/[id] - Eliminar cotización
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params } : { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if(!id) return errorResponse('El ID ingresado no es valido', 400)

    const deletedQuotation = await deleteQuotation(id, user.companyId);

    return successResponse(deletedQuotation, "Cotización eliminada correctamente");

  } catch (error) {
    console.error("Error al eliminar cotización:", error);

    if (error instanceof AuthError) {
        if (error.code === "UNAUTHORIZED")
            return errorResponse(error.message, 401);
        if (error.code === "FORBIDDEN")
            return errorResponse(error.message, 403);
    }

    return serverErrorResponse("Error al eliminar la cotización");
  }
}