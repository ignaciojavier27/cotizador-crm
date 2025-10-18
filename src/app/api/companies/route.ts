import { NextRequest } from "next/server";
import {
    successResponse,
    errorResponse,
    serverErrorResponse,
} from "@/lib/api-response";
import { createCompany } from "@/lib/services/companyServices";
import { AuthError, requireAdmin } from "@/lib/auth/authorize";

/**
 * POST /api/companies
 * Crear una nueva empresa
 * Solo accesible para usuarios autenticados del tipo admin
 */

export async function POST(request: NextRequest) {
    try {

        await requireAdmin()

        const body = await request.json()
        const company = await createCompany(body)

        return successResponse(company, 'Empresa creada correctamente', 201)

    } catch (error) {
        console.error('Error al crear empresa:', error)
    
        if (error instanceof AuthError) {
        if (error.code === "UNAUTHORIZED")
            return errorResponse(error.message, 401);
        if (error.code === "FORBIDDEN")
            return errorResponse(error.message, 403);
        }

        if (error instanceof Error && error.message.includes("Unique constraint")) {
            return errorResponse("Ya existe una empresa con estos datos", 409);
        }

        return serverErrorResponse("Error al crear la empresa");
  }
}