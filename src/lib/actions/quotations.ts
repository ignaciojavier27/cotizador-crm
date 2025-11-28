"use server";

import { requireAuth } from "@/lib/auth/authorize";
import { createQuotation } from "@/lib/services/quotationServices";
import { createQuotationSchema } from "@/lib/validations/quotation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuotationPDFData } from "@/types/pdf";
import { generateQuotationPDF } from "@/lib/services/pdfService";
import { sendQuotationEmail } from "@/lib/services/emailService";

export type ActionState = {
    success?: boolean;
    error?: string;
    errors?: Record<string, string[]>;
};

export async function createQuotationAction(
    prevState: ActionState | undefined,
    formData: FormData
): Promise<ActionState> {
    try {
        const user = await requireAuth();

        if (!user?.companyId) {
            return { error: "Usuario no asociado a una empresa" };
        }

        // Parse raw data from FormData
        // Note: Since we'll likely use a controlled form with JSON data for details,
        // we might need to handle this differently if we were using pure FormData.
        // However, for complex nested data like details, it's often easier to pass
        // the data directly if we weren't using useFormState with FormData,
        // but here we will assume the client sends a JSON string for complex fields
        // or we change the signature to accept the object directly if we bind it.

        // BETTER APPROACH for complex forms with Server Actions:
        // The client component will handle the form state and call this action
        // with the structured data, not just FormData.
        // But to keep it compatible with useFormState, we usually stick to FormData
        // or we use a wrapper.

        // Let's adjust: We will accept the raw data object as the second argument
        // instead of FormData, because mapping FormData to nested arrays is painful.
        // BUT useFormState expects (prevState, formData).

        // Alternative: The client calls this action directly (not as a form action)
        // and handles the redirect/UI updates. This is often cleaner for complex data.

        // Let's stick to the plan: "Calls createQuotationAction on submit".
        // I will implement it to accept the data object directly, which is easier
        // for the client component to call using `startTransition` or just async/await.

        // Wait, if I want to use it with useActionState (React 19) or useFormState,
        // I should stick to the standard signature.
        // However, for nested arrays (products), FormData is tricky.
        // I will define the action to take the data object directly.
        // This means I won't use `useFormState` in the traditional way for the *submission*,
        // but I can still use it for state if I wrap it, or just use standard async handler in client.

        throw new Error("Use createQuotationActionWithData instead");

    } catch (error) {
        console.error("Error in createQuotationAction:", error);
        return { error: "Error interno del servidor" };
    }
}

// Helper for direct call with JSON data
export async function createQuotationWithData(data: any) {
    try {
        const user = await requireAuth();

        if (!user?.companyId) {
            return { success: false, error: "Usuario no asociado a una empresa" };
        }

        const validationResult = createQuotationSchema.safeParse(data);

        if (!validationResult.success) {
            return {
                success: false,
                error: "Error de validación",
                errors: validationResult.error.flatten().fieldErrors,
            };
        }

        const quotation = await createQuotation(validationResult.data, user.id, user.companyId);

        // --- INICIO: Generar PDF y Enviar Correo ---
        try {
            console.log("Iniciando proceso de envío de correo...");
            // 1. Obtener datos de la empresa para el PDF
            const company = await prisma.company.findUnique({
                where: { id: user.companyId }
            });
            console.log("Empresa encontrada:", company?.name);

            if (company && quotation.client.email) {
                console.log("Cliente tiene email:", quotation.client.email);
                // 2. Preparar datos para el PDF
                const pdfData: QuotationPDFData = {
                    quotation: {
                        ...quotation,
                        total: quotation.total ? Number(quotation.total) : null,
                        totalTax: quotation.totalTax ? Number(quotation.totalTax) : null,
                        details: quotation.details.map(detail => ({
                            ...detail,
                            unitPrice: Number(detail.unitPrice),
                            subtotal: detail.subtotal ? Number(detail.subtotal) : null,
                            lineTax: detail.lineTax ? Number(detail.lineTax) : null,
                            product: {
                                ...detail.product,
                                basePrice: Number(detail.product.basePrice),
                                taxPercentage: detail.product.taxPercentage ? Number(detail.product.taxPercentage) : null,
                            },
                        })),
                        company: company
                    },
                    company: company,
                };

                // 3. Generar PDF
                console.log("Generando PDF...");
                const pdfBuffer = await generateQuotationPDF(pdfData);
                console.log("PDF generado. Tamaño:", pdfBuffer.length);

                // 4. Enviar Correo
                console.log("Enviando correo a:", quotation.client.email);
                await sendQuotationEmail({
                    to: quotation.client.email,
                    clientName: quotation.client.name,
                    quotationNumber: quotation.quotationNumber,
                    pdfBuffer: pdfBuffer,
                    companyName: company.name,
                });
                console.log("Correo enviado exitosamente.");
            } else {
                console.log("No se envía correo: Falta empresa o email del cliente.");
            }
        } catch (emailError) {
            console.error("Error CRÍTICO al enviar el correo de la cotización:", emailError);
            // No fallamos la request completa si falla el correo, pero lo logueamos
        }
        // --- FIN: Generar PDF y Enviar Correo ---
        return { success: true };
    } catch (error) {
        console.error("Error creating quotation:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Error al crear la cotización" };
    }
}
