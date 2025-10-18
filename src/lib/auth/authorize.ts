import { UserRole } from "@prisma/client";
import { getCurrentUser } from "./session";

/**
 * Lanza error controlado con código y mensaje
 */

class AuthError extends Error {
  constructor(public code: "UNAUTHORIZED" | "FORBIDDEN", message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Verifica que el usuario esté autenticado
 * Lanza un AuthError si no hay sesión activa
 */
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) throw new AuthError("UNAUTHORIZED", "Debes iniciar sesión");
    return user
}

/**
 * Verifica que el usuario tenga un rol específico
 */
export async function requireRole(role: UserRole) {
    const user = await requireAuth();
    
    if(user.role !== role) throw new AuthError("FORBIDDEN", "No tienes permiso para realizar esta acción");

    return user
}

/**
 * Verifica que el usuario sea administrador
 */
export async function requireAdmin() {
    return requireRole(UserRole.admin)
}

/**
 * Verifica que el usuario perteneza a la empresa específica
 */
export async function requireCompanyAccess(companyId: string) {
    const user = await requireAuth();

    if(
        user.companyId !== companyId &&
        user.role !== UserRole.admin
    ) throw new AuthError("FORBIDDEN", "No tienes acceso a esta empresa");

    return user;
}

export { AuthError };