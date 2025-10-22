import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "./password";
import { loginSchema } from "../validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {

                    if(!credentials) {
                        console.warn("No se proporcionaron credenciales");
                        return null;
                    }

                    const validatedFields = loginSchema.safeParse(credentials);

                    if(!validatedFields.success) {
                        console.error('Validación fallida: ', validatedFields.error.flatten().fieldErrors);
                        return null;
                    }

                    const { email, password } = validatedFields.data;

                    const user = await prisma.user.findUnique({ 
                        where: { email },
                        include: { 
                            company: {
                                select: { 
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    });

                    if(!user || user.deletedAt) {
                        console.error('El usuario no existe');
                        return null;
                    }

                    if(!user.isActive) {
                        console.error('El usuario no está activo');
                        return null;
                    }

                    const isPasswordValid = await verifyPassword(password, user.passwordHash);

                    if(!isPasswordValid) {
                        console.error('La contraseña es incorrecta');
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        companyId: user.company.id,
                        firstName: user.firstName,
                        lastName: user.lastName
                    }

                } catch (error) {
                    console.error('Error al autenticar el usuario:', error);
                    return null;
                }
            }
        })
    ]
});