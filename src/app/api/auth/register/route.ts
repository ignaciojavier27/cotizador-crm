import { errorResponse, serverErrorResponse, successResponse } from "@/lib/api-response";
import { createFirstUserWithCompany } from "@/lib/services/authServices";
import { NextRequest } from "next/server";



/**
 * POST /api/auth/register
 * Registrar un nuevo usuario administrador con su empresa
 * Endpoint público
 * El primer usuario creado siempre debe ser admin
 */
export async function POST(request: NextRequest) {
    try {

        const data = await request.json();

        const result = await createFirstUserWithCompany(data)

        const { user, company } = result

        return successResponse(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                    company: {
                    id: company.id,
                    name: company.name,
                    rut: company.rut,
                },
            },
            'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
            201
        )
    } catch (error) {
        console.error('Error al registrar usuario:', error)

        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
            return errorResponse('Ya existe una cuenta con estos datos', 409)
            }
        }

        return serverErrorResponse('Error al crear la cuenta. Por favor intenta nuevamente.')
  }
}