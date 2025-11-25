"use server";

import { requireAuth } from "@/lib/auth/authorize";
import { createQuotation } from "@/lib/services/quotationServices";
import { createQuotationSchema } from "@/lib/validations/quotation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

        await createQuotation(validationResult.data, user.id, user.companyId);

        revalidatePath("/dashboard/quotations");
    } catch (error) {
        console.error("Error creating quotation:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: "Error al crear la cotización" };
    }

    redirect("/dashboard/quotations");
}
