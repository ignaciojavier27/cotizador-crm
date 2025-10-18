import { cache } from "react";
import { auth } from "./auth";
import { UserRole } from "@prisma/client";

/**
 * Obtiene la sesión actual del usuario con caché
 * Usar en Server Components
 */
export const getCurrentUser = cache(async() => {
    const session = await auth();
    return session?.user;
})

/**
 * Verificar si el usuario está autenticado
 */
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export async function hasRole(role: UserRole) {
    const user = await getCurrentUser();
    return user?.role === role;
}

/**
 * Verifica si el usuario es admin
 */
export async function isAdmin() {
    return hasRole(UserRole.admin)
}

/**
 * Obtiene el ID de la empresa del usuario actual
 */
export async function getCurrentCompanyId() {
    const user = await getCurrentUser()
    return user?.companyId
}