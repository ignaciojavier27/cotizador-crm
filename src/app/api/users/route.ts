import { NextRequest } from "next/server";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAdmin, AuthError } from "@/lib/auth/authorize";
import { createUser, getAllUsers } from "@/lib/services/userServices";

/**
 * POST /api/users
 * Crear un nuevo usuario
 * Solo accesible para usuarios autenticados del tipo admin
 * Requiere ID de empresa
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();

    const body = await request.json();

    const newUser = await createUser(body, adminUser.companyId);

    return successResponse(newUser, "Usuario creado correctamente", 201);
  } catch (error) {
    console.error("Error al crear usuario:", error);

    if (error instanceof AuthError) {
      if (error.code === "UNAUTHORIZED")
        return errorResponse(error.message, 401);
      if (error.code === "FORBIDDEN")
        return errorResponse(error.message, 403);
    }

    if (error instanceof Error && error.message.includes("registrado")) {
      return errorResponse(error.message, 409);
    }

    if (error instanceof Error && error.message.includes("validación")) {
      return errorResponse(error.message, 400);
    }

    return serverErrorResponse("Error al crear el usuario");
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filters = {
      companyId: adminUser.companyId,
      role: searchParams.get("role"),
      isActive: searchParams.get("isActive"),
      search: searchParams.get("search"),
    }

    const result = await getAllUsers(filters);
    
    return successResponse(result, "Usuarios obtenidos correctamente", 200);
  } catch (error) {
    console.error('Error al listar usuarios:', error)
    if (error instanceof AuthError) {
      if (error.code === "UNAUTHORIZED")
        return errorResponse(error.message, 401);
      if (error.code === "FORBIDDEN")
        return errorResponse(error.message, 403);
    }

    return serverErrorResponse("Error al listar los usuarios");
  }
}