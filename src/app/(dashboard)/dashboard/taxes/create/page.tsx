import { TaxCreateForm } from "@/components/forms/tax-create-form";

export const metadata = {
    title: 'Nuevo Impuesto | Dashboard',
    description: 'Crear un nuevo impuesto',
};

export default function CreateTaxPage() {
    return (
        <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Nuevo Impuesto
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Crea un nuevo impuesto para aplicar a tus productos.
                    </p>
                </div>
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <TaxCreateForm />
                </div>
            </div>
        </div>
    );
}
