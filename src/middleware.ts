import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from "./utils/constants";

export default auth((req) => {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;
    const isLoggedIn = !!req.auth;

    // Permitir SIEMPRE acceso a la ruta de autenticación de la API
    if(pathname.startsWith('/api/auth')) return NextResponse.next();

    // Redirigir a login si el usuario no está logueado e intenta acceder a una ruta protediga
    if(PROTECTED_ROUTES.some(route => pathname.startsWith(route) && !isLoggedIn)) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    // Redirigir a dashboard si el usuario logueado intenta acceder a login o register
    if(isLoggedIn && PUBLIC_ROUTES.includes(pathname) && pathname !== '/') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    return NextResponse.next();
})

// Configurar qué rutas ejecutan el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}