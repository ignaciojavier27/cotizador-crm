import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAdmin, requireAuth } from "@/lib/auth/authorize";
import { createProduct, getAllProducts } from "@/lib/services/productServices";
import { NextRequest } from "next/server";

/**
 * POST /api/products
 * Crear un nuevo producto
 * Solo accesible para usuarios autenticados del tipo admin
 * Requiere ID de empresa
 */
export async function POST(request: NextRequest) {
    try {
        const adminUser = await requireAdmin();
        const body = await request.json();
        const newProduct = await createProduct(body, adminUser.companyId);

        return successResponse(newProduct, "Producto creado correctamente", 201);
    } catch (error) {
        console.error("Error al crear producto:", error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
            return errorResponse(error.message, 403);
        }

        if (error instanceof Error && error.message.includes("mismo nombre")) {
            return errorResponse(error.message, 409);
        }

        return serverErrorResponse("Error al crear el producto");
    }

}

/**
 * GET /api/products
 * Obtener todos los productos
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
            categoryId: searchParams.get("categoryId"),
        }

        const results = await getAllProducts(filters);

        return successResponse(results, "Productos obtenidos correctamente", 200);
    } catch (error) {
        console.error("Error al listar productos:", error);
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        return serverErrorResponse("Error al listar los productos");
    }
}

