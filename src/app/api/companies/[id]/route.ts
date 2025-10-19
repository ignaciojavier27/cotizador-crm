import { errorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAdmin, requireAuth, requireCompanyAccess } from "@/lib/auth/authorize";
import { getCompanyById, updateCompany } from "@/lib/services/companyServices";
import { NextRequest } from "next/server";

/**
 * GET /api/companies/:id
 * Obtener una empresa por su ID
 * Solo accesible para usuarios autenticados de la misma empresa
 */

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth();

        const { id } = await params;

        const company = await getCompanyById(id);

        await requireCompanyAccess(company.id);

        return successResponse(company, 'Empresa encontrada', 200);

    } catch (error) {
        console.error('Error al obtener la empresa:', error)

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED") return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN") return errorResponse(error.message, 403);
        }

        if (error instanceof Error && error.message.includes("no encontrada")) {
            return errorResponse(error.message, 404);
        }

        if (error instanceof Error && error.message.includes("Ya existe")) {
            return errorResponse(error.message, 409);
        }

        return errorResponse('Error al obtener la empresa', 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

    try {

        await requireAdmin();
        
        const { id } = await params;
        
        await requireCompanyAccess(id);
        
        const data = await request.json();
        
        
        const company = await updateCompany(id, data);
        
        return successResponse(company, 'Empresa actualizada correctamente', 200);
        
    } catch (error) {
        console.error('Error al actualizar la empresa:', error)
        
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED") return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN") return errorResponse(error.message, 403);
        }
        
        if (error instanceof Error && error.message.includes("no encontrada")) {
            return errorResponse(error.message, 404);
        }
        
        if (error instanceof Error && error.message.includes("Ya existe")) {
            return errorResponse(error.message, 409);
        }
        
        return errorResponse('Error al actualizar la empresa', 500);
    }
}