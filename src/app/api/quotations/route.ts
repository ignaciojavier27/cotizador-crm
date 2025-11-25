import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAuth } from "@/lib/auth/authorize";
import { createQuotation, getAllQuotations } from "@/lib/services/quotationServices";
import { createQuotationSchema } from "@/lib/validations/quotation";
import { QuotationStatus } from "@prisma/client";
import { NextRequest } from "next/server";


// ==========================================
// POST /api/quotations - Crear cotización
// ==========================================
export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await req.json();
        
        // Validar datos con Zod
        const validatedData = createQuotationSchema.parse(body);

        // Crear cotización
        const quotation = await createQuotation(
            validatedData,
            user.id,
            user.companyId
        );

        return successResponse(quotation, "Cotización creada correctamente", 201);
    } catch (error) {
        console.error("Error al crear cotización:", error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
            return errorResponse(error.message, 403);
        }
        

        if (error instanceof Error && error.message.includes("ID de empresa inválido")) {
            return errorResponse(error.message, 409);
        }

        if (error instanceof Error && error.message.includes("Cliente no encontrado")) {
            return errorResponse(error.message, 404);
        }

        if (error instanceof Error && error.message.includes("productos no encontrados")) {
            return errorResponse(error.message, 404);
        }

        return serverErrorResponse("Error al crear la cotización");
    }
}

// ==========================================
// GET /api/quotations - Listar cotizaciones
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") as QuotationStatus | undefined;
    const clientId = searchParams.get("clientId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await getAllQuotations(user.companyId, {
      status,
      clientId,
      userId,
      search,
      page,
      limit
    });

    return successResponse(result, "Cotizaciones obtenidas correctamente", 200);

  } catch (error) {

    console.error("Error al listar cotizaciones:", error);

    if (error instanceof AuthError) {
      if (error.code === "UNAUTHORIZED")
        return errorResponse(error.message, 401);
      if (error.code === "FORBIDDEN")
      return errorResponse(error.message, 403);
    }

    return serverErrorResponse("Error al listar las cotizaciones");

  }
}