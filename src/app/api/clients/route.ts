import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { AuthError, requireAuth } from "@/lib/auth/authorize";
import { createClient, getAllClients } from "@/lib/services/clientServices";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth();
        const body = await request.json();
        const newClient = await createClient(body, user.companyId);

        return successResponse(newClient, "Cliente creado correctamente", 201);
    } catch (error) {
        console.error("Error al crear cliente:", error);

        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
            return errorResponse(error.message, 403);
        }

        if (error instanceof Error && error.message.includes("ID de empresa inválido")) {
            return errorResponse(error.message, 409);
        }

        if (error instanceof Error && error.message.includes("cliente ya existe")) {
            return errorResponse(error.message, 409);
        }

        return serverErrorResponse("Error al crear el cliente");
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth();
        const { searchParams } = new URL(request.url);

        const filters = {
            companyId: user.companyId,
            search: searchParams.get("search"),
        }

        const results = await getAllClients(filters);

        return successResponse(results, "Clientes obtenidos correctamente", 200);

    } catch (error) {
        console.error("Error al listar clientes:", error);
        if (error instanceof AuthError) {
            if (error.code === "UNAUTHORIZED")
                return errorResponse(error.message, 401);
            if (error.code === "FORBIDDEN")
                return errorResponse(error.message, 403);
        }
        return serverErrorResponse("Error al listar los clientes");
    }
}