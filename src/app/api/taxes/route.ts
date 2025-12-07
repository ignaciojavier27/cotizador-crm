import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAdmin, requireAuth } from "@/lib/auth/authorize";
import { createTax, getAllTaxes } from "@/lib/services/taxServices";
import { NextRequest } from "next/server";

/**
 * POST /api/taxes
 * Crear un nuevo impuesto
 * Solo accesible para usuarios autenticados del tipo admin
 */
export async function POST(request: NextRequest) {
    try {
        const adminUser = await requireAdmin();
        const body = await request.json();
        const newTax = await createTax(body, adminUser.companyId);

        return successResponse(newTax, "Impuesto creado correctamente", 201);
    } catch (error) {
        console.error("Error al crear impuesto:", error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }

        if (error instanceof Error && error.message.includes("mismo nombre")) {
            return errorResponse(error.message, 409);
        }

        return serverErrorResponse("Error al crear el impuesto");
    }

}

/**
 * GET /api/taxes
 * Obtener todos los impuestos
 * Solo accesible para usuarios autenticados de la misma empresa
 */

export async function GET(request: NextRequest) {
    try {
        const currentUser = await requireAuth();
        const { searchParams } = new URL(request.url);
        const filters = {
            companyId: currentUser.companyId,
            isActive: searchParams.get("isActive"),
            search: searchParams.get("search"),
        }

        const results = await getAllTaxes(filters);

        return successResponse(results, "Impuestos obtenidos correctamente", 200);
    } catch (error) {
        console.error("Error al listar impuestos:", error);
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        return serverErrorResponse("Error al listar los impuestos");
    }
}
