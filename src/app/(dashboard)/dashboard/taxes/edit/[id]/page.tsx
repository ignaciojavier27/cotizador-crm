import { TaxEditForm } from "@/components/forms/tax-edit-form";
import { getTaxById } from "@/lib/services/taxServices";
import { notFound } from "next/navigation";

export const metadata = {
    title: 'Editar Impuesto | Dashboard',
    description: 'Editar un impuesto existente',
};

export default async function EditTaxPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    try {
        // Obtenemos los datos del impuesto server-side para inicializar el formulario
        // getTaxById ya maneja la lógica de buscar en DB y formatear
        const tax = await getTaxById(id);

        return (
            <div className="px-4 py-12">
                <div className="w-full max-w-2xl mx-auto">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900">
                            Editar Impuesto
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Modifica los detalles del impuesto.
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-8 shadow-lg">
                        <TaxEditForm tax={tax as any} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error cargando impuesto:", error);
        notFound();
    }
}
