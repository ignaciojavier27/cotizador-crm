'use server'

import { signIn, signOut } from "./auth";
import { AuthError } from "next-auth";
import { loginSchema } from "../schemas/auth";
import { LoginResult } from "@/types/auth";

export async function login(
    email: string,
    password: string,
): Promise<LoginResult> {
    try {
        const validatedFields = loginSchema.safeParse({ email, password });

        if (!validatedFields.success) {
            return {
                success: false,
                error: 'Validación fallida',
            };
        }

        await signIn('credentials', {
            email: validatedFields.data.email,
            password: validatedFields.data.password,
            redirect: false,
        });

        return {
            success: true,
        };

    } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: 'Credenciales inválidas',
          }
        default:
          return {
            success: false,
            error: 'Error al iniciar sesión',
          }
      }
    }
    throw error
  }
}


export async function logout() {
  await signOut({ redirect: true, redirectTo: '/login' })
}