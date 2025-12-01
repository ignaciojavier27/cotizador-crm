'use server'

import { auth } from "@/lib/auth/auth";
import { getCompanyById, updateCompany as updateCompanyService } from "@/lib/services/companyServices";
import { updatedCompanySchema } from "@/lib/validations/company";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getCompany() {
    const session = await auth();

    if (!session?.user?.companyId) {
        return {
            success: false,
            error: "No autorizado"
        }
    }

    try {
        const company = await getCompanyById(session.user.companyId);
        return {
            success: true,
            data: company
        }
    } catch (error) {
        console.error("Error al obtener la empresa:", error);
        return {
            success: false,
            error: "Error al obtener los datos de la empresa"
        }
    }
}

export async function updateCompany(data: z.infer<typeof updatedCompanySchema>) {
    const session = await auth();

    if (!session?.user?.companyId) {
        return {
            success: false,
            error: "No autorizado"
        }
    }

    try {
        const updatedCompany = await updateCompanyService(session.user.companyId, data);

        revalidatePath("/dashboard/companies");

        return {
            success: true,
            data: updatedCompany
        }
    } catch (error) {
        console.error("Error al actualizar la empresa:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error al actualizar la empresa"
        }
    }
}
