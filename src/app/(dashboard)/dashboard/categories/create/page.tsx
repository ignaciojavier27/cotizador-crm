import { CategoryCreateForm } from "@/components/forms/category-create-form";

export default function CreateCategoryPage() {
    return(
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
        <div className="w-full max-w-md">

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900">
                    Crear nueva categoría
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Ingresa los datos de la nueva categoría
                </p>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-lg">
                <CategoryCreateForm />
            </div>
        </div>
    </div>  
    )
}