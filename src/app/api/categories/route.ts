import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { requireAdmin, AuthError } from "@/lib/auth/authorize";
import { createCategory, getCategories } from "@/lib/services/categoryServices";
import { NextRequest } from "next/server"; 
/**
 * POST /api/categories
 * Crear una nueva categoría
 * Solo accesible para usuarios autenticados del tipo admin
 * Requiere ID de empresa
 */


export async function POST(request: NextRequest) {
    try {
        const adminUser = await requireAdmin();

        const body = await request.json();

        const newCategory = await createCategory(body, adminUser.companyId);

        return successResponse(newCategory, "Categoría creada correctamente", 201);

    } catch (error) {
        console.error("Error al crear categoría:", error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }

        if (error instanceof Error && error.message.includes("mismo nombre")) {
            return errorResponse("Ya existe una categoría con este nombre", 409);
        }

        return serverErrorResponse("Error al crear la categoría");
    }
}

export async function GET(request: NextRequest) {
    try {
        const adminUser = await requireAdmin();
        const { searchParams } = new URL(request.url);
        const filters = {
            companyId: adminUser.companyId,
            search: searchParams.get("search"),
        } 

        const result = await getCategories(filters);

        return successResponse(result, "Categorías obtenidas correctamente", 200);
    } catch (error) {
        console.error("Error al listar categorías:", error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
    }   
}