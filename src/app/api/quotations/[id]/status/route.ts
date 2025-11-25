

// ==========================================
// PATCH /api/quotations/[id]/status - Cambiar estado

import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAuth } from "@/lib/auth/authorize";
import { updateQuotationStatus } from "@/lib/services/quotationServices";
import { updateQuotationStatusSchema } from "@/lib/validations/quotation";
import { NextRequest } from "next/server";

// ==========================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const body = await req.json();

    // Validar datos con Zod
    const validatedData = updateQuotationStatusSchema.parse(body);

    // Actualizar estado de cotización
    const quotation = await updateQuotationStatus(
      params.id,
      validatedData,
      user.id,
      user.companyId
    );

    return successResponse(quotation, "Estado de cotización actualizado correctamente");

  } catch (error) {
    console.error("Error al actualizar estado de cotización:", error);

    if (error instanceof AuthError) {
        if (error.code === "UNAUTHORIZED")
            return errorResponse(error.message, 401);
        if (error.code === "FORBIDDEN")
            return errorResponse(error.message, 403);
    }

    if(error instanceof Error) {
        if (error.message.includes("No tienes permisos")) {
            return errorResponse(error.message, 403);
        }
        if (error.message.includes("no encontrado")) {
            return errorResponse(error.message, 404);
        }
    }

    return serverErrorResponse("Error al actualizar el estado de la cotización");
  }
}